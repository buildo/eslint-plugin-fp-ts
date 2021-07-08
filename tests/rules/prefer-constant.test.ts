import rule from "../../src/rules/prefer-constant";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("prefer-constant", rule, {
  valid: [
    {
      code: `
pipe(
    getResult(),
    either.mapLeft(constant(empty))
);
`,
    },
  ],
  invalid: [
    {
      code: `
pipe(
    getResult(),
    either.mapLeft(() => empty)
)
`,
      errors: [
        {
          messageId: "preferConstant",
          suggestions: [
            {
              messageId: "replaceConstant",
              output: `import { constant } from "fp-ts/function"

pipe(
    getResult(),
    either.mapLeft(constant(empty))
)
`,
            },
          ],
        },
      ],
    },
    {
      code: `
pipe(
  getResult(),
  either.map(() => true)
)
`,
      errors: [
        {
          messageId: "preferConstant",
          suggestions: [
            {
              messageId: "replaceConstant",
              output: `import { constTrue } from "fp-ts/function"

pipe(
  getResult(),
  either.map(constTrue)
)
`,
            },
          ],
        },
      ],
    },
  ],
});
