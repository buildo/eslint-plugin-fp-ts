import {
  ASTUtils,
  TSESLint,
  TSESTree,
} from "@typescript-eslint/experimental-utils";

const messages = {
  importPipeFromFunction:
    "The 'pipeable' module is deprecated. Import 'pipe' from the 'function' module instead",
  pipeableIsDeprecated:
    "The 'pipeable' module is deprecated and will be removed in future versions of fp-ts",
} as const;
type MessageIds = keyof typeof messages;

export const meta: TSESLint.RuleMetaData<MessageIds> = {
  type: "problem",
  fixable: "code",
  schema: [],
  messages,
};

export function create(
  context: TSESLint.RuleContext<MessageIds, []>
): TSESLint.RuleListener {
  return {
    ImportDeclaration(node) {
      const sourceValue = ASTUtils.getStringIfConstant(node.source);
      if (sourceValue) {
        const pipeableSourcePattern = /^fp-ts\/(lib\/)?pipeable/;

        if (sourceValue.match(pipeableSourcePattern)) {
          if (
            node.specifiers.find(
              (importClause) =>
                (importClause as TSESTree.ImportSpecifier).imported?.name ===
                "pipe"
            )
          ) {
            context.report({
              node: node.source,
              messageId: "importPipeFromFunction",
              fix(fixer) {
                return fixer.replaceText(node.source, `"fp-ts/function"`);
              },
            });
          } else {
            context.report({
              node: node.source,
              messageId: "pipeableIsDeprecated",
            });
          }
        }
      }
    },
  };
}
