import {
  TSESLint,
  ASTUtils,
  AST_NODE_TYPES,
  TSESTree,
  ESLintUtils,
} from "@typescript-eslint/experimental-utils";
import { generate } from "astring";
import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/typescript-estree";
import { array, option, apply } from "fp-ts";
import { pipe } from "fp-ts/function";

import estraverse from "estraverse";
import {
  RuleFix,
  RuleFixer,
} from "@typescript-eslint/experimental-utils/dist/ts-eslint";

const version = require("../package.json").version;

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildo/eslint-plugin-fp-ts/blob/v${version}/docs/rules/${name}.md`
);

export function calleeIdentifier(
  node:
    | TSESTree.CallExpression
    | TSESTree.MemberExpression
    | TSESTree.Identifier
): option.Option<TSESTree.Identifier> {
  switch (node.type) {
    case AST_NODE_TYPES.MemberExpression:
      if (node.property.type === AST_NODE_TYPES.Identifier) {
        return option.some(node.property);
      } else {
        return option.none;
      }
    case AST_NODE_TYPES.CallExpression:
      switch (node.callee.type) {
        case AST_NODE_TYPES.Identifier:
          return option.some(node.callee);
        case AST_NODE_TYPES.MemberExpression:
          if (node.callee.property.type === AST_NODE_TYPES.Identifier) {
            return option.some(node.callee.property);
          } else {
            return option.none;
          }
      }
      return option.none;
    case AST_NODE_TYPES.Identifier:
      return option.some(node);
  }
}

function isWithinTypes<N extends TSESTree.Node>(
  n: TSESTree.Node | undefined,
  types: N["type"][]
): n is N {
  return !!n && types.includes(n.type);
}

type CombinatorNode =
  | TSESTree.CallExpression
  | TSESTree.MemberExpression
  | TSESTree.Identifier;
type CombinatorQuery<T extends CombinatorNode["type"]> = {
  name: string | RegExp;
  types: T[];
};
export function getAdjacentCombinators<
  N1 extends CombinatorNode,
  N2 extends CombinatorNode
>(
  pipeOrFlowExpression: TSESTree.CallExpression,
  combinator1: CombinatorQuery<N1["type"]>,
  combinator2: CombinatorQuery<N2["type"]>,
  requireMatchingPrefix: boolean
): option.Option<[N1, N2]> {
  const firstCombinatorIndex = pipeOrFlowExpression.arguments.findIndex(
    (a, index) => {
      if (
        isWithinTypes(a, combinator1.types) &&
        index < pipeOrFlowExpression.arguments.length - 1
      ) {
        const b = pipeOrFlowExpression.arguments[index + 1];
        if (isWithinTypes(b, combinator2.types)) {
          return pipe(
            apply.sequenceS(option.option)({
              idA: calleeIdentifier(a),
              idB: calleeIdentifier(b),
            }),
            option.exists(
              ({ idA, idB }) =>
                !!idA.name.match(combinator1.name) &&
                !!idB.name.match(combinator2.name)
            )
          );
        }
      }
      return false;
    }
  );

  if (firstCombinatorIndex >= 0) {
    const firstCombinator = pipeOrFlowExpression.arguments[
      firstCombinatorIndex
    ] as N1;

    const secondCombinator = pipeOrFlowExpression.arguments[
      firstCombinatorIndex + 1
    ] as N2;

    if (requireMatchingPrefix) {
      // NOTE(gabro): this is a naive way of checking whether two combinators are
      // from the same module.
      // We assume the most commonly used syntax is something like:
      //
      // import { array } from 'fp-ts'
      // pipe(
      //   [1, 2],
      //   array.map(...),
      //   array.sequence(...)
      // )
      //
      // So we check that array.map and array.sequence have the same prefix ("array." in this example)
      // by pretty-printing it and comparing the result.
      //
      // This works well enough in practice, but if needed this can be made more exact by using
      // TypeScript's compiler API and comparing the types.
      const getPrefix = (node: CombinatorNode): string => {
        switch (node.type) {
          case AST_NODE_TYPES.CallExpression:
            return node.callee.type === AST_NODE_TYPES.MemberExpression
              ? prettyPrint(node.callee.object)
              : "";
          case AST_NODE_TYPES.MemberExpression:
            return prettyPrint(node.object);
          case AST_NODE_TYPES.Identifier:
            return "";
        }
      };

      if (getPrefix(firstCombinator) === getPrefix(secondCombinator)) {
        return option.some([firstCombinator, secondCombinator]);
      }
    } else {
      return option.some([firstCombinator, secondCombinator]);
    }
  }

  return option.none;
}

export function prettyPrint(node: TSESTree.Node): string {
  return generate(node as any);
}

export function inferIndent(node: TSESTree.Node): string {
  return new Array(node.loc.start.column + 1).join(" ");
}

export const contextUtils = <
  TMessageIds extends string,
  TOptions extends readonly unknown[]
>(
  context: TSESLint.RuleContext<TMessageIds, TOptions>
) => {
  function findModuleImport(
    moduleName: string
  ): option.Option<TSESTree.ImportDeclaration> {
    let importNode: option.Option<TSESTree.ImportDeclaration> = option.none;
    estraverse.traverse(context.getSourceCode().ast as any, {
      enter(node) {
        if (
          node.type === "ImportDeclaration" &&
          ASTUtils.getStringIfConstant(node.source as TSESTree.Literal) ===
            moduleName
        ) {
          importNode = option.some(node as TSESTree.ImportDeclaration);
        }
      },
      keys: tsVisitorKeys as any,
    });
    return importNode;
  }

  function findLastModuleImport(): option.Option<TSESTree.ImportDeclaration> {
    let importNode: option.Option<TSESTree.ImportDeclaration> = option.none;
    estraverse.traverse(context.getSourceCode().ast as any, {
      enter(node) {
        if (node.type === "ImportDeclaration") {
          importNode = option.some(node as TSESTree.ImportDeclaration);
        }
      },
      keys: tsVisitorKeys as any,
    });
    return importNode;
  }

  function addNamedImportIfNeeded(
    name: string,
    moduleName: string,
    fixer: TSESLint.RuleFixer
  ): Array<TSESLint.RuleFix> {
    return pipe(
      findModuleImport(moduleName),
      option.fold(
        () =>
          // insert full named import
          pipe(
            findLastModuleImport(),
            option.fold(
              // no other imports in this file, add the import at the very beginning
              () => [
                fixer.insertTextAfterRange(
                  [0, 0],
                  `import { ${name} } from "${moduleName}"\n`
                ),
              ],
              (lastImport) =>
                // other imports founds in this file, insert the import after the last one
                [
                  fixer.insertTextAfterRange(
                    [lastImport.range[0], lastImport.range[1] + 1],
                    `import { ${name} } from "${moduleName}"\n`
                  ),
                ]
            )
          ),
        (importDeclaration) =>
          pipe(
            importDeclaration.specifiers,
            array.findFirst(
              (specifier) =>
                specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                specifier.imported.name === name
            ),
            option.fold(
              () =>
                // insert 'name' in existing module import
                pipe(
                  importDeclaration.specifiers,
                  array.last,
                  option.fold(
                    // No specifiers, so this is import {} from 'fp-ts'
                    // NOTE(gabro): It's an edge case we don't handle for now, so we just do nothing
                    () => [fixer.insertTextAfterRange([0, 0], "")],
                    // Insert import specifier, possibly inserting a comma if needed
                    (lastImportSpecifier) => {
                      if (
                        ASTUtils.isCommaToken(
                          context
                            .getSourceCode()
                            .getTokenAfter(lastImportSpecifier)!
                        )
                      ) {
                        return [
                          fixer.insertTextAfter(
                            lastImportSpecifier,
                            ` ${name}`
                          ),
                        ];
                      } else {
                        return [
                          fixer.insertTextAfter(
                            lastImportSpecifier,
                            `, ${name}`
                          ),
                        ];
                      }
                    }
                  )
                ),
              () =>
                // do nothing, 'name' is already imported
                []
            )
          )
      )
    );
  }

  function removeImportDeclaration(
    node: TSESTree.ImportDeclaration,
    fixer: RuleFixer
  ): RuleFix {
    const nextToken = context.getSourceCode().getTokenAfter(node);

    if (nextToken && nextToken.loc.start.line > node.loc.start.line) {
      return fixer.removeRange([
        node.range[0],
        context.getSourceCode().getIndexFromLoc({
          line: node.loc.start.line + 1,
          column: 0,
        }),
      ]);
    } else {
      return fixer.remove(node);
    }
  }

  function isIdentifierImportedFrom<
    TMessageIds extends string,
    TOptions extends readonly unknown[]
  >(
    identifier: TSESTree.Identifier,
    targetModuleName: string | RegExp,
    context: TSESLint.RuleContext<TMessageIds, TOptions>
  ): boolean {
    const importDef = ASTUtils.findVariable(
      ASTUtils.getInnermostScope(context.getScope(), identifier),
      identifier.name
    )?.defs.find((d) => d.type === "ImportBinding");
    return !!(
      importDef?.parent?.type === AST_NODE_TYPES.ImportDeclaration &&
      importDef.parent.source.value?.toString().match(targetModuleName)
    );
  }

  function isFlowExpression(node: TSESTree.CallExpression): boolean {
    return pipe(
      node,
      calleeIdentifier,
      option.exists(
        (callee) =>
          callee.name === "flow" &&
          isIdentifierImportedFrom(callee, /fp-ts\//, context)
      )
    );
  }

  function isPipeOrFlowExpression(node: TSESTree.CallExpression): boolean {
    return pipe(
      node,
      calleeIdentifier,
      option.exists(
        (callee) =>
          ["pipe", "flow"].includes(callee.name) &&
          isIdentifierImportedFrom(callee, /fp-ts\//, context)
      )
    );
  }

  function isOnlyUsedAsType(node: TSESTree.ImportClause): boolean {
    if (node.type === AST_NODE_TYPES.ImportSpecifier) {
      return pipe(
        ASTUtils.findVariable(context.getScope(), node.imported.name),
        option.fromNullable,
        option.exists((variable) => {
          const nonImportReferences = pipe(
            variable.references,
            array.filter(
              (ref) =>
                ref.identifier.parent?.type !== AST_NODE_TYPES.ImportDeclaration
            )
          );
          return pipe(
            nonImportReferences,
            array.every(
              (ref) =>
                ref.identifier.parent?.type === AST_NODE_TYPES.TSTypeReference
            )
          );
        })
      );
    }
    return false;
  }

  return {
    addNamedImportIfNeeded,
    removeImportDeclaration,
    isFlowExpression,
    isPipeOrFlowExpression,
    isIdentifierImportedFrom,
    isOnlyUsedAsType,
  };
};
