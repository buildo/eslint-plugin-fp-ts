import rule from "../../src/rules/no-redundant-flow";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
});

ruleTester.run("no-redundant-flow", rule, {
  valid: [
    `import { flow } from "fp-ts/function"
    flow(foo, bar)
    `,
    `import { flow } from "fp-ts/function"
    flow(
      foo,
      bar
    )
    `,
    `import { flow } from "fp-ts/function"
    flow(...fns)
    `,
  ],
  invalid: [
    {
      code: `
import { flow } from "fp-ts/function"
const a = flow(foo)
`,
      errors: [
        {
          messageId: "redundantFlow",
          suggestions: [
            {
              messageId: "removeFlow",
              output: `
import { flow } from "fp-ts/function"
const a = foo
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { flow } from "fp-ts/function"
const a = flow(
  foo
)
`,
      errors: [
        {
          messageId: "redundantFlow",
          suggestions: [
            {
              messageId: "removeFlow",
              output: `
import { flow } from "fp-ts/function"
const a = foo
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { flow } from "fp-ts/function"
const a = flow(
  foo,
);
`,
      errors: [
        {
          messageId: "redundantFlow",
          suggestions: [
            {
              messageId: "removeFlow",
              output: `
import { flow } from "fp-ts/function"
const a = foo;
`,
            },
          ],
        },
      ],
    }
  ],
});
