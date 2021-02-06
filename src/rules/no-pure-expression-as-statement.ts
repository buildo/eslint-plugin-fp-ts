import { array, option } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { contextUtils, createRule } from "../utils";

export default createRule({
  name: "no-pure-expression-as-statement",
  meta: {
    type: "problem",
    schema: [],
    docs: {
      category: "Possible Errors",
      description:
        "Detects pure expressions that do nothing because they're in statement position",
      recommended: "error",
    },
    messages: {
      pureExpressionInStatementPosition:
        "{{dataType}} is pure, so this expression does nothing in statement position. Did you forget to return it or run it?",
      addReturn: "return the expression",
      runExpression: "run the expression",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isFromFpTs, typeOfNode } = contextUtils(context);

    const pureDataPrefixes = ["Task", "IO"];

    return {
      ExpressionStatement(node) {
        pipe(
          node.expression,
          typeOfNode,
          option.filter(isFromFpTs),
          option.filter((t) =>
            pipe(
              pureDataPrefixes,
              array.some((prefix) =>
                t.symbol.escapedName.toString().startsWith(prefix)
              )
            )
          ),
          option.fold(constVoid, (t) => {
            context.report({
              node: node.expression,
              messageId: "pureExpressionInStatementPosition",
              data: {
                dataType: t.symbol.escapedName,
              },
              suggest: [
                {
                  messageId: "addReturn",
                  fix(fixer) {
                    return fixer.insertTextBefore(node.expression, "return ");
                  },
                },
                {
                  messageId: "runExpression",
                  fix(fixer) {
                    return fixer.insertTextAfter(node.expression, "()");
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
