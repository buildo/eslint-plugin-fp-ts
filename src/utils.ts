import {
  TSESLint,
  ASTUtils,
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/experimental-utils";

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
