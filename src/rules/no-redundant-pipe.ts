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
      redundantPipe:
        "pipe can be removed because it takes only one argument or it is used as the first argument inside another pipe",
      removePipe: "remove pipe",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isPipeExpression } = contextUtils(context);

    const getPipeCallExpressionWithExpressionArgs = flow(
      O.fromPredicate(isPipeExpression),
      /**
       * We ignore Pipe calls which contain a spread argument because these are never invalid.
       */
      O.chain(getCallExpressionWithExpressionArgs)
    );

    const getRedundantPipeCall = (
      pipeCall: CallExpressionWithExpressionArgs
    ): O.Option<CallExpressionWithExpressionArgs> => {
      const firstArg = pipe(pipeCall.args, NonEmptyArray.head);

      if (pipeCall.args.length === 1) {
        return O.some(pipeCall);
      } else if (firstArg.type === AST_NODE_TYPES.CallExpression) {
        return getPipeCallExpressionWithExpressionArgs(firstArg);
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
          O.map((redundantPipeCall) => {
            context.report({
              node: redundantPipeCall.node,
              messageId: "redundantPipe",
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
