import { boolean, option, identity } from "fp-ts";
import { constant, constVoid, pipe } from "fp-ts/function";
import { contextUtils, createRule } from "../utils";

export default createRule({
  name: "prefer-constant",
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    docs: {
      category: "Best Practices",
      description: "Replace function returned constant value with constant",
      recommended: "warn",
    },
    messages: {
      preferConstant:
        "function returned constant value can be replaced by constant",
      replaceConstant: "replace function returned constant value with constant",
    },
  },
  defaultOptions: [],
  create(context) {
    const { addNamedImportIfNeeded, getQuote } = contextUtils(context);
    const quote = getQuote();

    return {
      ArrowFunctionExpression(node) {
        pipe(
          node.params.length === 0,
          boolean.fold(constant(option.none), () => {
            switch (node.body.type) {
              case "Identifier":
                return pipe(
                  identity.Do,
                  identity.apS("method", "constant"),
                  identity.apS(
                    "replaceTo", `constant(${node.body.name})`
                  ),
                  option.some
                );
              case "Literal":
                return pipe(
                  identity.Do,
                  identity.apS("name", node.body.value),
                  identity.bind("method", ({ name }) => {
                    switch (name) {
                      case true:
                        return "constTrue";
                      case false:
                        return "constFalse";
                      case null:
                        return "constNull";
                      default:
                        return "constant";
                    }
                  }),
                  identity.bind("replaceTo", ({ method, name }) =>
                    method === "constant" ? `constant(${name})` : method
                  ),
                  option.some
                );
              default:
                return option.none;
            }
          }),
          option.fold(constVoid, ({ method, replaceTo }) => {
            context.report({
              loc: {
                start: node.loc.start,
                end: node.loc.end,
              },
              messageId: "preferConstant",
              suggest: [
                {
                  messageId: "replaceConstant",
                  fix(fixer) {
                    return [
                      fixer.replaceTextRange(
                        [node.range[0], node.range[1]],
                        replaceTo
                      ),
                      ...addNamedImportIfNeeded(
                        method,
                        "fp-ts/function",
                        quote,
                        fixer
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
