import { TSESLint } from "@typescript-eslint/experimental-utils";
import { isFlowExpression } from "../utils";

const messages = {
  redundantFlow: "flow can be removed because it takes only one argument",
  removeFlow: "remove flow",
} as const;
type MessageIds = keyof typeof messages;

export const meta: TSESLint.RuleMetaData<MessageIds> = {
  type: "suggestion",
  fixable: "code",
  schema: [],
  messages,
};

export function create(
  context: TSESLint.RuleContext<MessageIds, []>
): TSESLint.RuleListener {
  return {
    CallExpression(node) {
      if (node.arguments.length === 1 && isFlowExpression(node, context)) {
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
}
