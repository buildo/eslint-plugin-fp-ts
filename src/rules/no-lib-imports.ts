import { TSESLint } from "@typescript-eslint/experimental-utils";

const messages = {
  importNotAllowed:
    "Importing from {{ detected }} is not allowed, import from {{ fixed }} instead",
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
      const sourceValue = node.source.value?.toString();
      if (sourceValue) {
        const forbiddenImportPattern = /^fp-ts\/lib\//;

        const fixedImportSource = sourceValue.replace(
          forbiddenImportPattern,
          "fp-ts/"
        );

        if (sourceValue.match(forbiddenImportPattern)) {
          context.report({
            node: node.source,
            messageId: "importNotAllowed",
            data: {
              detected: node.source.value,
              fixed: fixedImportSource,
            },
            fix(fixer) {
              return fixer.replaceText(node.source, `"${fixedImportSource}"`);
            },
          });
        }
      }
    },
  };
}
