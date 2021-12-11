import {
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import * as O from "fp-ts/Option";
import { contextUtils, createRule } from "../utils";

const getArgumentExpression = (
  x: TSESTree.CallExpressionArgument
): O.Option<TSESTree.Expression> =>
  // TODO: isExpression?
  x.type !== AST_NODE_TYPES.SpreadElement ? O.some(x) : O.none;

const checkIsArgumentExpression = O.getRefinement(getArgumentExpression);

export default createRule({
  name: "no-redundant-flow",
  meta: {
    type: "suggestion",
    fixable: "code",
    hasSuggestions: true,
    schema: [],
    docs: {
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

    /**
     * We ignore flow calls which contain a spread argument because these are never invalid.
     */
    const isFlowCallWithExpressionArguments = (
      node: TSESTree.CallExpression
    ): boolean =>
      isFlowExpression(node) && node.arguments.every(checkIsArgumentExpression);

    return {
      CallExpression(node) {
        if (
          node.arguments.length === 1 &&
          isFlowCallWithExpressionArguments(node)
        ) {
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
