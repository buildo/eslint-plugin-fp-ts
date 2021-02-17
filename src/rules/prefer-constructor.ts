import { option, readonlyNonEmptyArray } from "fp-ts"
import { flow, pipe } from "fp-ts/function"
import { contextUtils, createRule, ensureArguments } from "../utils"

export default createRule({
  name: "prefer-constructor",
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    docs: {
      category: "Best Practices",
      description: "Replace destructor + constructors with a constructor",
      recommended: "warn"
    },
    messages: {
      eitherFoldIsOptionFromEither: "Either.fold can be replaced with Option.fromEither",
      replaceEitherFoldWithOptionFromEither: "replace Either.fold with Option.fromEither"
    }
  },
  defaultOptions: [],
  create(context) {
    const { findNamespace, isCall, isLazyValue } = contextUtils(context)
    return {
      CallExpression(node) {
        pipe(
          node,
          option.of,
          option.filter(isCall( "Either", "fold")),
          option.chain(ensureArguments([
            isLazyValue( "Option", "none"),
            isCall("Option", "some")
          ])),
          option.bind("namespace", flow(readonlyNonEmptyArray.head, findNamespace)),
          option.map(({ namespace }) => {
            context.report({
              loc: {
                start: node.loc.start,
                end: node.loc.end
              },
              messageId: "eitherFoldIsOptionFromEither",
              suggest: [
                {
                  messageId: "replaceEitherFoldWithOptionFromEither",
                  fix(fixer) {
                    return [
                      fixer.replaceTextRange(
                        node.range,
                        `${namespace}.fromEither`
                      )
                    ]
                  }
                }
              ]
            })
          })
        )
      }
    }
  }
})
