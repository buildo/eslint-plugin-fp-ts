import { ESLintUtils } from "@typescript-eslint/experimental-utils"
import { stripIndent } from "common-tags"
import path from "path"
import rule from "../../src/rules/prefer-constructor"

const fixtureProjectPath = path.join(
  __dirname,
  "..",
  "fixtures",
  "fp-ts-project"
)

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: fixtureProjectPath,
    project: "./tsconfig.json"
  }
})

ruleTester.run("prefer-constructor", rule, {
  valid: [
    {
      code: stripIndent`
        import { either, option } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          either.of(1),
          either.fold(() => option.none, (value) => option.some(otherValue))
        )
      `
    },
    {
      code: stripIndent`
        import { either, option } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          either.of(1),
          either.fold(() => option.some(otherValue), (value) => option.some(value))
        )
      `
    },
    {
      code: stripIndent`
        import { either, option } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          either.of(1),
          either.fold(() => option.some(otherValue), () => option.none)
        )
      `
    }
  ],
  invalid: [
    {
      code: stripIndent`
        import { either, option } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          either.of(1),
          either.fold(() => option.none, (value) => option.some(value))
        )
      `,
      errors: [
        {
          messageId: "eitherFoldIsOptionFromEither",
          suggestions: [
            {
              messageId: "replaceEitherFoldWithOptionFromEither",
              output: stripIndent`
                import { either, option } from "fp-ts"
                import { pipe } from "fp-ts/function"

                pipe(
                  either.of(1),
                  option.fromEither
                )
              `
            }
          ]
        }
      ]
    },
    {
      code: stripIndent`
        import * as E from "fp-ts/Either"
        import * as O from "fp-ts/Option"
        import { pipe } from "fp-ts/function"

        pipe(
          E.of(1),
          E.fold(() => O.none, (value) => O.some(value))
        )
      `,
      errors: [
        {
          messageId: "eitherFoldIsOptionFromEither",
          suggestions: [
            {
              messageId: "replaceEitherFoldWithOptionFromEither",
              output: stripIndent`
                import * as E from "fp-ts/Either"
                import * as O from "fp-ts/Option"
                import { pipe } from "fp-ts/function"

                pipe(
                  E.of(1),
                  O.fromEither
                )
              `
            }
          ]
        }
      ]
    },
    {
      code: stripIndent`
        import { either, option } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          either.of(1),
          either.fold(() => option.none, option.some)
        )
      `,
      errors: [
        {
          messageId: "eitherFoldIsOptionFromEither",
          suggestions: [
            {
              messageId: "replaceEitherFoldWithOptionFromEither",
              output: stripIndent`
                import { either, option } from "fp-ts"
                import { pipe } from "fp-ts/function"

                pipe(
                  either.of(1),
                  option.fromEither
                )
              `
            }
          ]
        }
      ]
    },
    {
      code: stripIndent`
        import { either, option } from "fp-ts"
        import { constant, pipe } from "fp-ts/function"

        pipe(
          either.of(1),
          either.fold(constant(option.none), option.some)
        )
      `,
      errors: [
        {
          messageId: "eitherFoldIsOptionFromEither",
          suggestions: [
            {
              messageId: "replaceEitherFoldWithOptionFromEither",
              output: stripIndent`
                import { either, option } from "fp-ts"
                import { constant, pipe } from "fp-ts/function"

                pipe(
                  either.of(1),
                  option.fromEither
                )
              `
            }
          ]
        }
      ]
    }
  ]
})
