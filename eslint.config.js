const fpTs = require("eslint-plugin-fp-ts");
const tsParser = require("@typescript-eslint/parser");

const all = fpTs.configs["flat/all"];

module.exports = [
  {
    files: ["src/**/*.ts"],
    plugins: all.plugins,
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...all.rules,
      "fp-ts/no-module-imports": ["error", { allowTypes: true }],
    },
  },
];
