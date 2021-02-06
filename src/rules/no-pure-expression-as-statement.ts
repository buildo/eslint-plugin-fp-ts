import { array, option } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import ts from "typescript";
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

    function isPureDataType(t: ts.Type): boolean {
      return pipe(
        pureDataPrefixes,
        array.some((prefix) =>
          t.symbol.escapedName.toString().startsWith(prefix)
        )
      );
    }

    return {
      ExpressionStatement(node) {
        pipe(
          node.expression,
          typeOfNode,
          option.filter(isFromFpTs),
          option.filter((t) => {
            if (t.isUnion()) {
              return pipe(t.types, array.every(isPureDataType));
            }
            return isPureDataType(t);
          }),
          option.fold(constVoid, (t) => {
            context.report({
              node: node.expression,
              messageId: "pureExpressionInStatementPosition",
              data: {
                dataType: t.isUnion()
                  ? t.types[0]!.symbol.escapedName
                  : t.symbol.escapedName,
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
