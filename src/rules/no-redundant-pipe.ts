import * as NonEmptyArray from "fp-ts/NonEmptyArray";
import { AST_NODE_TYPES } from "@typescript-eslint/experimental-utils";
import { flow, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import {
  contextUtils,
  createRule,
  createSequenceExpressionFromCallExpressionWithExpressionArgs,
  getCallExpressionWithExpressionArgs,
  prettyPrint,
  CallExpressionWithExpressionArgs,
} from "../utils";

const errorMessages = {
  redundantPipeWithSingleArg:
    "pipe can be removed because it takes only one argument",
  redundantPipeWithSingleArgInsidePipe:
    "pipe can be removed because it is used as the first argument inside another pipe",
};

export default createRule({
  name: "no-redundant-pipe",
  meta: {
    type: "suggestion",
    fixable: "code",
    hasSuggestions: true,
    schema: [],
    docs: {
      description: "Remove redundant uses of pipe",
      recommended: "warn",
    },
    messages: {
      ...errorMessages,
      removePipe: "remove pipe",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isPipeExpression } = contextUtils(context);

    const getPipeCallExpressionWithExpressionArgs = flow(
      O.fromPredicate(isPipeExpression),
      /**
       * We ignore pipe calls which contain a spread argument because these are never invalid.
       */
      O.chain(getCallExpressionWithExpressionArgs)
    );

    type RedundantPipeCallAndMessage = {
      redundantPipeCall: CallExpressionWithExpressionArgs;
      errorMessageId: keyof typeof errorMessages;
    };

    const getRedundantPipeCall = (
      pipeCall: CallExpressionWithExpressionArgs
    ): O.Option<RedundantPipeCallAndMessage> => {
      const firstArg = pipe(pipeCall.args, NonEmptyArray.head);

      if (pipeCall.args.length === 1) {
        const result: RedundantPipeCallAndMessage = {
          redundantPipeCall: pipeCall,
          errorMessageId: "redundantPipeWithSingleArg",
        };
        return O.some(result);
      } else if (firstArg.type === AST_NODE_TYPES.CallExpression) {
        return pipe(
          getPipeCallExpressionWithExpressionArgs(firstArg),
          O.map(
            (redundantPipeCall): RedundantPipeCallAndMessage => ({
              redundantPipeCall,
              errorMessageId: "redundantPipeWithSingleArgInsidePipe",
            })
          )
        );
      } else {
        return O.none;
      }
    };

    return {
      CallExpression(node) {
        pipe(
          node,
          getPipeCallExpressionWithExpressionArgs,
          O.chain(getRedundantPipeCall),
          O.map(({ redundantPipeCall, errorMessageId }) => {
            context.report({
              node: redundantPipeCall.node,
              messageId: errorMessageId,
              suggest: [
                {
                  messageId: "removePipe",
                  fix(fixer) {
                    const sequenceExpression =
                      createSequenceExpressionFromCallExpressionWithExpressionArgs(
                        redundantPipeCall
                      );
                    return [
                      fixer.replaceText(
                        redundantPipeCall.node,
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
