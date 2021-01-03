import {
  TSESLint,
  ASTUtils,
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import { generate } from "astring";

export function isIdentifierImportedFrom<
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

export function calleeIdentifier(
  node:
    | TSESTree.CallExpression
    | TSESTree.MemberExpression
    | TSESTree.Identifier
): TSESTree.Identifier | undefined {
  switch (node.type) {
    case AST_NODE_TYPES.MemberExpression:
      if (node.property.type === AST_NODE_TYPES.Identifier) {
        return node.property;
      } else {
        return undefined;
      }
    case AST_NODE_TYPES.CallExpression:
      switch (node.callee.type) {
        case AST_NODE_TYPES.Identifier:
          return node.callee;
        case AST_NODE_TYPES.MemberExpression:
          if (node.callee.property.type === AST_NODE_TYPES.Identifier) {
            return node.callee.property;
          } else {
            return undefined;
          }
      }
      return undefined;
    case AST_NODE_TYPES.Identifier:
      return node;
  }
}

export function isFlowExpression<
  TMessageIds extends string,
  TOptions extends readonly unknown[]
>(
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<TMessageIds, TOptions>
): boolean {
  const callee = calleeIdentifier(node);
  return !!(
    callee &&
    callee.name === "flow" &&
    isIdentifierImportedFrom(callee, /fp-ts\//, context)
  );
}

export function isPipeOrFlowExpression<
  TMessageIds extends string,
  TOptions extends readonly unknown[]
>(
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<TMessageIds, TOptions>
): boolean {
  const callee = calleeIdentifier(node);
  return !!(
    callee &&
    ["pipe", "flow"].includes(callee.name) &&
    isIdentifierImportedFrom(callee, /fp-ts\//, context)
  );
}

type CombinatorQuery = {
  name: string | RegExp;
};
type CombinatorNode =
  | TSESTree.CallExpression
  | TSESTree.MemberExpression
  | TSESTree.Identifier;
export function getAdjacentCombinators(
  pipeOrFlowExpression: TSESTree.CallExpression,
  combinatorQueries: [CombinatorQuery, CombinatorQuery],
  requireMatchingPrefix: boolean
): [CombinatorNode, CombinatorNode] | undefined {
  const firstCombinatorIndex = pipeOrFlowExpression.arguments.findIndex(
    (a, index) => {
      if (
        (a.type === AST_NODE_TYPES.CallExpression ||
          a.type === AST_NODE_TYPES.MemberExpression ||
          a.type === AST_NODE_TYPES.Identifier) &&
        index < pipeOrFlowExpression.arguments.length - 1
      ) {
        const b = pipeOrFlowExpression.arguments[index + 1];
        if (
          b?.type === AST_NODE_TYPES.CallExpression ||
          b?.type === AST_NODE_TYPES.MemberExpression ||
          b?.type === AST_NODE_TYPES.Identifier
        ) {
          return (
            calleeIdentifier(a)?.name.match(combinatorQueries[0].name) &&
            calleeIdentifier(b)?.name.match(combinatorQueries[1].name)
          );
        }
      }
      return false;
    }
  );

  if (firstCombinatorIndex >= 0) {
    const firstCombinator = pipeOrFlowExpression.arguments[
      firstCombinatorIndex
    ] as CombinatorNode;

    const secondCombinator = pipeOrFlowExpression.arguments[
      firstCombinatorIndex + 1
    ] as CombinatorNode;

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
      const getPrefix = (
        node:
          | TSESTree.CallExpression
          | TSESTree.MemberExpression
          | TSESTree.Identifier
      ): string => {
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
        return [firstCombinator, secondCombinator];
      }
    } else {
      return [firstCombinator, secondCombinator];
    }
  }

  return undefined;
}

export function prettyPrint(node: TSESTree.Node): string {
  return generate(node as any);
}
