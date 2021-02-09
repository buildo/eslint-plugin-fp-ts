import { ParserServices } from "@typescript-eslint/experimental-utils";
import { array, option, readonlyArray } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { Option } from "fp-ts/Option";
import ts from "typescript";
import { contextUtils, createRule, prettyPrint } from "../utils";

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
      discardedDataTypeJsx:
        "'{{jsxAttributeName}}' expects a function returning '{{expectedReturnType}}' but the expression returns a '{{dataType}}'. Did you forget to run the expression?",
      discardedDataTypeArgument:
        "The expression returns a '{{dataType}}', but the function '{{functionName}}' expects a function returning '{{expectedReturnType}}'. Did you forget to run the expression?",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isFromFpTs, typeOfNode, parserServices } = contextUtils(context);

    const pureDataPrefixes = ["Task", "IO"];

    function isPureDataType(t: ts.Type): boolean {
      return (
        isFromFpTs(t) &&
        pipe(
          pureDataPrefixes,
          array.some((prefix) =>
            t.symbol.escapedName.toString().startsWith(prefix)
          )
        )
      );
    }

    function pureDataReturnType(t: ts.Type): Option<ts.Type> {
      return pipe(
        t.getCallSignatures(),
        readonlyArray.map((signature) => signature.getReturnType()),
        readonlyArray.findFirst(isPureDataType)
      );
    }

    function voidOrUknownReturnType(t: ts.Type): Option<ts.Type> {
      return pipe(
        t.getCallSignatures(),
        readonlyArray.map((signature) => signature.getReturnType()),
        readonlyArray.findFirst(
          (returnType) =>
            !!(
              returnType.flags & ts.TypeFlags.Void ||
              returnType.flags & ts.TypeFlags.Unknown
            )
        )
      );
    }

    return {
      ExpressionStatement(node) {
        pipe(
          node.expression,
          typeOfNode,
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
            option.filterMap(voidOrUknownReturnType)
          );

        const argumentWithPureDataTypeReturnType = pipe(
          node,
          typeOfNode,
          option.filterMap(pureDataReturnType)
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
                messageId: "discardedDataTypeJsx",
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
      CallExpression(node) {
        pipe(
          node.arguments,
          array.mapWithIndex((index, argumentNode) =>
            pipe(
              option.Do,
              option.bind("argumentType", () => typeOfNode(argumentNode)),
              option.bind("parserServices", parserServices),
              option.bind("typeChecker", ({ parserServices }) =>
                option.some(parserServices.program.getTypeChecker())
              ),
              option.bind(
                "parameterReturnType",
                ({ parserServices, typeChecker }) => {
                  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
                  return pipe(
                    typeChecker.getContextualTypeForArgumentAtIndex(
                      tsNode,
                      index
                    ),
                    option.fromNullable,
                    option.chain(voidOrUknownReturnType)
                  );
                }
              ),
              option.bind("argumentReturnType", ({ argumentType }) =>
                pureDataReturnType(argumentType)
              ),
              option.map(({ argumentReturnType, parameterReturnType }) => {
                context.report({
                  node: argumentNode,
                  messageId: "discardedDataTypeArgument",
                  data: {
                    functionName: prettyPrint(node.callee),
                    dataType: argumentReturnType.symbol.escapedName,
                    expectedReturnType: (parameterReturnType as any)
                      .intrinsicName,
                  },
                });
              })
            )
          )
        );
      },
    };
  },
});
