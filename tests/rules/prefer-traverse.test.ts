import * as rule from "../../src/rules/prefer-traverse";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import * as path from "path";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("prefer-traverse", rule, {
  valid: [
    {
      code: `
import { array, option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  array.map(option.some),
  option.sequence(option.option)
)
`,
    },
  ],
  invalid: [
    {
      code: `
import { array, option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  array.map(option.some),
  array.sequence(option.option)
)
`,
      errors: [
        {
          messageId: "mapSequenceIsTraverse",
          suggestions: [
            {
              messageId: "replaceMapSequenceWithTraverse",
              output: `
import { array, option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  array.traverse(option.option)(option.some)
  ${""}
)
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { map, sequence } from "fp-ts/Array"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  map(option.some),
  sequence(option.option)
)
`,
      errors: [
        {
          messageId: "mapSequenceIsTraverse",
          suggestions: [
            {
              messageId: "replaceMapSequenceWithTraverse",
              output: `
import { map, sequence } from "fp-ts/Array"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  traverse(option.option)(option.some)
  ${""}
)
`,
            },
          ],
        },
      ],
    },
  ],
});
