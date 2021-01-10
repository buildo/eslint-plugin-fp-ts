import { contextUtils, createRule } from "../utils";

export default createRule({
  name: "no-redundant-flow",
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    docs: {
      category: "Best Practices",
      description: "Remove redundant uses of flow",
      recommended: "warn",
    },
    messages: {
      redundantFlow: "flow can be removed because it takes only one argument",
      removeFlow: "remove flow",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isFlowExpression } = contextUtils(context);

    return {
      CallExpression(node) {
        if (node.arguments.length === 1 && isFlowExpression(node)) {
          context.report({
            node,
            messageId: "redundantFlow",
            suggest: [
              {
                messageId: "removeFlow",
                fix(fixer) {
                  return [
                    fixer.removeRange([
                      node.callee.range[0],
                      node.callee.range[1] + 1,
                    ]),
                    fixer.removeRange([node.range[1] - 1, node.range[1]]),
                  ];
                },
              },
            ],
          });
        }
      },
    };
  },
});
