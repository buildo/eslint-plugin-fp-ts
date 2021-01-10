import { createRule } from "../utils";

export default createRule({
  name: "no-lib-imports",
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      category: "Possible Errors",
      description: "Disallow imports from 'fp-ts/lib'",
      recommended: "error",
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
  },
});
