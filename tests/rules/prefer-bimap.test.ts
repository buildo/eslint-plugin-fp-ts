import rule from "../../src/rules/prefer-bimap";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { stripIndent } from "common-tags";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("prefer-bimap", rule, {
  valid: [
    {
      code: stripIndent`
        import { either } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          getResult(),
          either.bimap(e => e.toString(), a => a.toString())
        )
      `,
    },
    {
      code: stripIndent`
        import { either } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          getResult(),
          either.mapLeft(e => e.toString()),
          either.mapLeft(e => e.toString()),
        )
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import { either } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          getResult(),
          either.map(
            a => a.toString()
          ),
          either.mapLeft(
            e => e.toString()
          )
        )
      `,
      errors: [
        {
          messageId: "mapMapLeftIsBimap",
          suggestions: [
            {
              messageId: "replaceMapMapLeftBimap",
              output: stripIndent`
                import { either } from "fp-ts"
                import { pipe } from "fp-ts/function"

                pipe(
                  getResult(),
                  either.bimap(
                    e => e.toString(),
                    a => a.toString()
                  )
                )
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { either } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          getResult(),
          either.mapLeft(
            e => e.toString()
          ),
          either.map(
            a => a.toString()
          )
        )
      `,
      errors: [
        {
          messageId: "mapMapLeftIsBimap",
          suggestions: [
            {
              messageId: "replaceMapMapLeftBimap",
              output: stripIndent`
                import { either } from "fp-ts"
                import { pipe } from "fp-ts/function"

                pipe(
                  getResult(),
                  either.bimap(
                    e => e.toString(),
                    a => a.toString()
                  )
                )
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { either } from "fp-ts"
        import { pipe } from "fp-ts/function"

        pipe(
          getResult(),
          either.mapLeft(e => e.toString()),
          either.map(a => a.toString())
        )
      `,
      errors: [
        {
          messageId: "mapMapLeftIsBimap",
          suggestions: [
            {
              messageId: "replaceMapMapLeftBimap",
              output: stripIndent`
                import { either } from "fp-ts"
                import { pipe } from "fp-ts/function"

                pipe(
                  getResult(),
                  either.bimap(
                    e => e.toString(),
                    a => a.toString()
                  )
                )
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { mapLeft, map } from "fp-ts/Either"
        import { pipe } from "fp-ts/function"

        pipe(
          getResult(),
          mapLeft(e => e.toString()),
          map(a => a.toString())
        )
      `,
      errors: [
        {
          messageId: "mapMapLeftIsBimap",
          suggestions: [
            {
              messageId: "replaceMapMapLeftBimap",
              output: stripIndent`
                import { mapLeft, map } from "fp-ts/Either"
                import { pipe } from "fp-ts/function"

                pipe(
                  getResult(),
                  bimap(
                    e => e.toString(),
                    a => a.toString()
                  )
                )
              `,
            },
          ],
        },
      ],
    },
  ],
});
