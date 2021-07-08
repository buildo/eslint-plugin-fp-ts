import { boolean, option } from "fp-ts";
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
            if (node.body.type === "Identifier") {
              const name = node.body.name;

              return option.some({
                method: "constant",
                replaceTo: `constant(${name})`,
              });
            } else if (node.body.type === "Literal") {
              const name = node.body.value;

              const method =
                name === true
                  ? "constTrue"
                  : name === false
                  ? "constFalse"
                  : name === null
                  ? "constNull"
                  : `constant`;
              const replaceTo =
                method === "constant" ? `constant(${name})` : method;

              return option.some({
                method,
                replaceTo,
              });
            } else {
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
