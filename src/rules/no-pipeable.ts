import { ASTUtils, TSESTree } from "@typescript-eslint/experimental-utils";
import { createRule } from "../utils";

export default createRule({
  name: "no-pipeable",
  meta: {
    type: "problem",
    fixable: "code",
    schema: [],
    docs: {
      category: "Possible Errors",
      description: "Disallow imports from the 'pipeable' module",
      recommended: "error",
    },
    messages: {
      importPipeFromFunction:
        "The 'pipeable' module is deprecated. Import 'pipe' from the 'function' module instead",
      pipeableIsDeprecated:
        "The 'pipeable' module is deprecated and will be removed in future versions of fp-ts",
    },
  },
  defaultOptions: [],
  create(context) {
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
  },
});
