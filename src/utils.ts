import {
  TSESLint,
  ASTUtils,
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import { generate } from "astring";
import { option } from "fp-ts";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/Apply";
import { Option } from "fp-ts/Option";

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
): Option<TSESTree.Identifier> {
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

export function isFlowExpression<
  TMessageIds extends string,
  TOptions extends readonly unknown[]
>(
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<TMessageIds, TOptions>
): boolean {
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

export function isPipeOrFlowExpression<
  TMessageIds extends string,
  TOptions extends readonly unknown[]
>(
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<TMessageIds, TOptions>
): boolean {
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
): Option<[N1, N2]> {
  const firstCombinatorIndex = pipeOrFlowExpression.arguments.findIndex(
    (a, index) => {
      if (
        isWithinTypes(a, combinator1.types) &&
        index < pipeOrFlowExpression.arguments.length - 1
      ) {
        const b = pipeOrFlowExpression.arguments[index + 1];
        if (isWithinTypes(b, combinator2.types)) {
          return pipe(
            sequenceS(option.option)({
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
