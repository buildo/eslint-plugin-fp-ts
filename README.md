# eslint-plugin-fp-ts

A collection of ESLint rules for [fp-ts](https://github.com/gcanti/fp-ts)

## Installation

Assuming [ESlint](https://github.com/eslint/eslint) is installed locally in your
project:

```sh
# npm
npm install --save-dev eslint-plugin-fp-ts

# yarn
yarn add --dev eslint-plugin-fp-ts
```

Then enable the plugin in your `.eslintrc` config

```json
{
  "plugins": ["fp-ts"]
}
```

and enable the rules you want, for example

```json
{
  "plugins": ["fp-ts"],
  "rules": {
    "fp-ts/no-lib-imports": "error"
  }
}
```

## List of supported rules

- [fp-ts/no-lib-imports](docs/rules/no-lib-imports.md): Disallow imports from
  'fp-ts/lib'
- [fp-ts/no-pipeable](docs/rules/no-pipeable.md): Disallow imports from the
  'pipeable' module
- [fp-ts/prefer-traverse](docs/rules/prefer-traverse.md): Replace map + sequence
  with traverse
