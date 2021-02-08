import { ParserServices } from "@typescript-eslint/experimental-utils";
import { array, option, readonlyArray } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import ts from "typescript";
import { contextUtils, createRule } from "../utils";

export default createRule({
  name: "no-discarded-pure-expression",
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
        "'{{dataType}}' is pure, so this expression does nothing in statement position. Did you forget to return it or run it?",
      addReturn: "return the expression",
      runExpression: "run the expression",
      discardedDataType:
        "'{{jsxAttributeName}}' expects a function returning '{{expectedReturnType}}' but the expression returns a '{{dataType}}'. Did you forget to run the expression?",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isFromFpTs, typeOfNode, parserServices } = contextUtils(context);

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
      JSXAttribute(node) {
        const parameterWithVoidOrUknownReturnType = (
          parserServices: ParserServices,
          typeChecker: ts.TypeChecker
        ) =>
          pipe(
            typeChecker.getContextualTypeForJsxAttribute(
              parserServices.esTreeNodeToTSNodeMap.get(node)
            ),
            option.fromNullable,
            option.filterMap((t) => {
              const returnTypes = pipe(
                t.getCallSignatures(),
                readonlyArray.map((signature) => signature.getReturnType())
              );
              return pipe(
                returnTypes,
                readonlyArray.findFirst(
                  (returnType) =>
                    !!(
                      returnType.flags & ts.TypeFlags.Void ||
                      returnType.flags & ts.TypeFlags.Unknown
                    )
                )
              );
            })
          );

        const argumentWithPureDataTypeReturnType = pipe(
          node,
          typeOfNode,
          option.filterMap((t) =>
            pipe(
              t.getCallSignatures(),
              readonlyArray.map((signature) => signature.getReturnType()),
              readonlyArray.findFirst(isPureDataType)
            )
          )
        );

        pipe(
          option.Do,
          option.bind("parserServices", parserServices),
          option.bind("typeChecker", ({ parserServices }) =>
            option.some(parserServices.program.getTypeChecker())
          ),
          option.bind(
            "parameterWithVoidOrUknownReturnType",
            ({ parserServices, typeChecker }) =>
              parameterWithVoidOrUknownReturnType(parserServices, typeChecker)
          ),
          option.bind(
            "argumentWithPureDataTypeReturnType",
            () => argumentWithPureDataTypeReturnType
          ),
          option.map(
            ({
              argumentWithPureDataTypeReturnType,
              parameterWithVoidOrUknownReturnType,
            }) =>
              context.report({
                node: node,
                messageId: "discardedDataType",
                data: {
                  jsxAttributeName: node.name.name,
                  expectedReturnType: (parameterWithVoidOrUknownReturnType as any)
                    .intrinsicName,
                  dataType:
                    argumentWithPureDataTypeReturnType.symbol.escapedName,
                },
              })
          )
        );
      },
    };
  },
});
