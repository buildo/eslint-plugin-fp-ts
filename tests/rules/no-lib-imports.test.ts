import rule from "../../src/rules/no-lib-imports";
import { RuleTester } from "@typescript-eslint/rule-tester";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: "module",
        },
    }
});

ruleTester.run("no-lib-imports", rule, {
  valid: [
    'import { Option } from "fp-ts/Option"',
    "import { Option } from 'fp-ts/Option'",
    'import { option } from "fp-ts"',
    "import { option } from 'fp-ts'",
    'import { option } from "library/fp-ts/lib"',
    "import { option } from 'library/fp-ts/lib'",
  ],
  invalid: [
    {
      code: 'import { Option } from "fp-ts/lib/Option"',
      errors: [
        {
          messageId: "importNotAllowed",
        },
      ],
      output: 'import { Option } from "fp-ts/Option"',
    },
    {
      code: "import { Option } from 'fp-ts/lib/Option'",
      errors: [
        {
          messageId: "importNotAllowed",
        },
      ],
      output: "import { Option } from 'fp-ts/Option'",
    },
  ],
});
