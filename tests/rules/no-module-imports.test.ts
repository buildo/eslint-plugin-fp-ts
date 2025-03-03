import rule from "../../src/rules/no-module-imports";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { stripIndent } from "common-tags";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: "module",
        },
    }
});

ruleTester.run("no-module-imports", rule, {
  valid: [
    'import { option } from "fp-ts"',
    'import { pipe } from "fp-ts/function"',
    'import { pipe } from "fp-ts/lib/function"',
    {
      code: stripIndent`
        import { Option } from "fp-ts/Option"
        import { option } from "fp-ts"
        const x: Option<number> = option.some(2)
      `,
      options: [{ allowTypes: true }],
    },
    {
      code: stripIndent`
        import { sequenceS } from "fp-ts/Apply"
      `,
      options: [{ allowedModules: ["Apply"] }],
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import { option } from "fp-ts"
        import { Option } from "fp-ts/Option"

        const x: Option<number> = option.some(2)
      `,
      errors: [
        {
          messageId: "importNotAllowed",
        },
      ],
      output: stripIndent`
        import { option } from "fp-ts"

        const x: option.Option<number> = option.some(2)
      `,
    },
    {
      code: stripIndent`
        import { none, Option, some } from "fp-ts/Option"

        const x: Option<number> = some(2)
        const y: Option<number> = none
      `,
      options: [{ allowTypes: true }],
      errors: [
        {
          messageId: "importValuesNotAllowed",
        },
      ],
      output: stripIndent`
        import {  Option,  } from "fp-ts/Option"
        import { option } from "fp-ts"

        const x: Option<number> = option.some(2)
        const y: Option<number> = option.none
      `,
    },
    {
      code: stripIndent`
        import { option } from "fp-ts/Option"

        const x = option.some(2)
      `,
      errors: [
        {
          messageId: "importNotAllowed",
        },
      ],
      output: stripIndent`
        import { option } from "fp-ts"

        const x = option.some(2)
      `,
    },
    {
      code: stripIndent`
        import { some } from "fp-ts/Option"

        const v = some(42)
      `,
      errors: [
        {
          messageId: "importNotAllowed",
        },
      ],
      output: stripIndent`
        import { option } from "fp-ts"

        const v = option.some(42)
      `,
    },
    {
      code: stripIndent`
        import { array } from "fp-ts"
        import { some, none, fromNullable } from "fp-ts/lib/Option"

        const v = some(42)
        const y = none
        const z = fromNullable(null)
      `,
      errors: [
        {
          messageId: "importNotAllowed",
        },
      ],
      output: stripIndent`
        import { array, option } from "fp-ts"

        const v = option.some(42)
        const y = option.none
        const z = option.fromNullable(null)
      `,
    },
    {
      code: stripIndent`
        import { some } from 'fp-ts/Option'

        const v = some(42)
      `,
      errors: [
        {
          messageId: "importNotAllowed",
        },
      ],
      output: stripIndent`
        import { option } from 'fp-ts'

        const v = option.some(42)
      `,
    },
  ],
});
