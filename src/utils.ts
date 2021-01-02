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
  node: TSESTree.CallExpression
): TSESTree.Identifier | undefined {
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
export function getAdjacentCombinators(
  pipeOrFlowExpression: TSESTree.CallExpression,
  combinatorQueries: [CombinatorQuery, CombinatorQuery]
): [TSESTree.CallExpression, TSESTree.CallExpression] | undefined {
  const firstCombinatorIndex = pipeOrFlowExpression.arguments.findIndex(
    (a, index) => {
      if (
        a.type === AST_NODE_TYPES.CallExpression &&
        index < pipeOrFlowExpression.arguments.length - 1
      ) {
        const b = pipeOrFlowExpression.arguments[index + 1];
        if (b?.type === AST_NODE_TYPES.CallExpression) {
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
    ] as TSESTree.CallExpression;

    const secondCombinator = pipeOrFlowExpression.arguments[
      firstCombinatorIndex + 1
    ] as TSESTree.CallExpression;

    return [firstCombinator, secondCombinator];
  }

  return undefined;
}

export function prettyPrint(node: TSESTree.Node): string {
  return generate(node as any);
}
