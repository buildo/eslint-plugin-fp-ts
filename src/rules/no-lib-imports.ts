import { ASTUtils } from "@typescript-eslint/utils";
import { createRule, inferQuote } from "../utils";

export default createRule({
  name: "no-lib-imports",
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "Disallow imports from 'fp-ts/lib'",
    },
    schema: [],
    messages: {
      importNotAllowed:
        "Importing from {{ detected }} is not allowed, import from {{ fixed }} instead",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const sourceValue = ASTUtils.getStringIfConstant(node.source);
        const forbiddenImportPattern = /^fp-ts\/lib\//;

        if (sourceValue?.match(forbiddenImportPattern.source)) {
          const fixedImportSource = sourceValue.replace(
            forbiddenImportPattern,
            "fp-ts/"
          );
          context.report({
            node: node.source,
            messageId: "importNotAllowed",
            data: {
              detected: node.source.value,
              fixed: fixedImportSource,
            },
            fix(fixer) {
              const quote = inferQuote(node.source);

              return fixer.replaceText(
                node.source,
                `${quote}${fixedImportSource}${quote}`
              );
            },
          });
        }
      },
    };
  },
});
