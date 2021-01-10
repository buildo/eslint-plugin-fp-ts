import rule from "../../src/rules/prefer-chain";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("prefer-chain", rule, {
  valid: [
    {
      code: `
import { array, option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  array.map(option.some),
  option.chain(x => x)
)
`,
    },
  ],
  invalid: [
    {
      code: `
import { option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  option.some(1),
  option.map(option.some),
  option.flatten
)
`,
      errors: [
        {
          messageId: "mapFlattenIsChain",
          suggestions: [
            {
              messageId: "replaceMapFlattenWithChain",
              output: `
import { option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  option.some(1),
  option.chain(option.some)
)
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { map, flatten } from "fp-ts/Array"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  map(a => [a]),
  flatten
)
`,
      errors: [
        {
          messageId: "mapFlattenIsChain",
          suggestions: [
            {
              messageId: "replaceMapFlattenWithChain",
              output: `
import { map, flatten } from "fp-ts/Array"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  chain(a => [a])
)
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { array } from "fp-ts"
import { flow } from "fp-ts/function"

flow(
  array.map(a => [a]),
  array.flatten
)
`,
      errors: [
        {
          messageId: "mapFlattenIsChain",
          suggestions: [
            {
              messageId: "replaceMapFlattenWithChain",
              output: `
import { array } from "fp-ts"
import { flow } from "fp-ts/function"

flow(
  array.chain(a => [a])
)
`,
            },
          ],
        },
      ],
    },
    {
      code: `
import { mapWithIndex } from "fp-ts/Array"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  mapWithIndex(a => [a]),
  flatten
)
`,
      errors: [
        {
          messageId: "mapFlattenIsChain",
          suggestions: [
            {
              messageId: "replaceMapFlattenWithChain",
              output: `
import { mapWithIndex } from "fp-ts/Array"
import { pipe } from "fp-ts/function"

pipe(
  [1, 2, 3],
  chainWithIndex(a => [a])
)
`,
            },
          ],
        },
      ],
    },
  ],
});
