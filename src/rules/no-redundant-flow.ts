import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import {
  contextUtils,
  createRule,
  createSequenceExpressionFromCallExpressionWithExpressionArgs,
  getCallExpressionWithExpressionArgs,
  prettyPrint,
} from "../utils";

export default createRule({
  name: "no-redundant-flow",
  meta: {
    type: "suggestion",
    fixable: "code",
    hasSuggestions: true,
    schema: [],
    docs: {
      description: "Remove redundant uses of flow",
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
        pipe(
          node,
          O.fromPredicate(isFlowExpression),
          /**
           * We ignore flow calls which contain a spread argument because these are never invalid.
           */
          O.chain(getCallExpressionWithExpressionArgs),
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
                      createSequenceExpressionFromCallExpressionWithExpressionArgs(
                        redundantFlowCall
                      );
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
