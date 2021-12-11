import {
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import { pipe } from "fp-ts/function";
import * as NonEmptyArray from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import { contextUtils, createRule, prettyPrint } from "../utils";

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

    type FlowCallWithExpressionArgs = {
      node: TSESTree.CallExpression;
      args: NonEmptyArray.NonEmptyArray<TSESTree.Expression>;
    };

    /**
     * We ignore flow calls which contain a spread argument because these are never invalid.
     */
    const getFlowCallWithExpressionArguments = (
      node: TSESTree.CallExpression
    ): O.Option<FlowCallWithExpressionArgs> =>
      isFlowExpression(node) && node.arguments.every(checkIsArgumentExpression)
        ? pipe(
            node.arguments,
            NonEmptyArray.fromArray,
            O.map((args): FlowCallWithExpressionArgs => ({ node, args }))
          )
        : O.none;

    const createSequenceExpressionFromFlowCall = (
      flowCall: FlowCallWithExpressionArgs
    ): TSESTree.SequenceExpression => {
      const firstArg = pipe(flowCall.args, NonEmptyArray.head);
      const lastArg = pipe(flowCall.args, NonEmptyArray.last);
      return {
        loc: flowCall.node.loc,
        range: [firstArg.range[0], lastArg.range[1]],
        type: AST_NODE_TYPES.SequenceExpression,
        expressions: flowCall.args,
      };
    };

    return {
      CallExpression(node) {
        pipe(
          node,
          getFlowCallWithExpressionArguments,
          O.filter((flowCall) => flowCall.node.arguments.length === 1),
          O.map((redundantFlowCall) => {
            context.report({
              node: redundantFlowCall.node,
              messageId: "redundantFlow",
              suggest: [
                {
                  messageId: "removeFlow",
                  fix(fixer) {
                    const sequenceExpression =
                      createSequenceExpressionFromFlowCall(redundantFlowCall);
                    return [
                      fixer.replaceText(
                        redundantFlowCall.node,
                        prettyPrint(sequenceExpression)
                      ),
                    ];
                  },
                },
              ],
            });
          })
        );
      },
    };
  },
});
