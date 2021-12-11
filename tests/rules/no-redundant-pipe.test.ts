import rule from "../../src/rules/no-redundant-pipe";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
});

ruleTester.run("no-redundant-pipe", rule, {
  valid: [
    `import { pipe } from "fp-ts/function"
    pipe(...x);
  `,
    `import { pipe } from "fp-ts/function"
    pipe(value, fn);
    `,
    `import { pipe } from "fp-ts/function"
    pipe(value, pipe(value2, fn));
    `,
  ],
  invalid: [
    {
      code: `
import { pipe } from "fp-ts/function"
pipe(value);
`,
      errors: [
        {
          messageId: "redundantPipe",
          suggestions: [
            {
              messageId: "removePipe",
              output: `
import { pipe } from "fp-ts/function"
value;
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { pipe } from "fp-ts/function"
pipe(pipe(pipe(value, fn1), fn2), fn3);
`,
      errors: [
        {
          messageId: "redundantPipe",
          suggestions: [
            {
              messageId: "removePipe",
              output: `
import { pipe } from "fp-ts/function"
pipe(pipe(value, fn1), fn2, fn3);
`,
            },
          ],
        },
        {
          messageId: "redundantPipe",
          suggestions: [
            {
              messageId: "removePipe",
              output: `
import { pipe } from "fp-ts/function"
pipe(pipe(value, fn1, fn2), fn3);
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { pipe } from "fp-ts/function"
pipe(pipe(value, fn1), fn2, fn3);
`,
      errors: [
        {
          messageId: "redundantPipe",
          suggestions: [
            {
              messageId: "removePipe",
              output: `
import { pipe } from "fp-ts/function"
pipe(value, fn1, fn2, fn3);
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { pipe } from "fp-ts/function"
pipe(
  // foo
  pipe(value, fn1),
  fn2
);`,
      errors: [
        {
          messageId: "redundantPipe",
          suggestions: [
            {
              messageId: "removePipe",
              output: `
import { pipe } from "fp-ts/function"
pipe(
  // foo
  value, fn1,
  fn2
);`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { pipe } from "fp-ts/function"
pipe(
  value,
);
`,
      errors: [
        {
          messageId: "redundantPipe",
          suggestions: [
            {
              messageId: "removePipe",
              output: `
import { pipe } from "fp-ts/function"
value;
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { pipe } from "fp-ts/function"
pipe(
  // foo
  value,
);
`,
      errors: [
        {
          messageId: "redundantPipe",
          suggestions: [
            {
              messageId: "removePipe",
              // TODO: ideally we would preserve the comment here but I'm not sure how
              output: `
import { pipe } from "fp-ts/function"
value;
`,
            },
          ],
        },
      ],
    },
  ],
});
