import rule from "../../src/rules/no-pipeable";
import { RuleTester } from "@typescript-eslint/rule-tester";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: "module",
        },
    }
});

ruleTester.run("no-pipeable", rule, {
  valid: [
    'import { pipe } from "fp-ts/function"',
    'import { pipe } from "fp-ts/lib/function"',
  ],
  invalid: [
    {
      code: 'import { pipe } from "fp-ts/lib/pipeable"',
      errors: [
        {
          messageId: "importPipeFromFunction",
        },
      ],
      output: 'import { pipe } from "fp-ts/function"',
    },
    {
      code: 'import { pipe } from "fp-ts/pipeable"',
      errors: [
        {
          messageId: "importPipeFromFunction",
        },
      ],
      output: 'import { pipe } from "fp-ts/function"',
    },
    {
      code: "import { pipe } from 'fp-ts/pipeable'",
      errors: [
        {
          messageId: "importPipeFromFunction",
        },
      ],
      output: "import { pipe } from 'fp-ts/function'",
    },
    {
      code: 'import { pipeable } from "fp-ts/pipeable"',
      errors: [
        {
          messageId: "pipeableIsDeprecated",
        },
      ],
    },
  ],
});
