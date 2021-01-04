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
- [fp-ts/no-redundant-flow](docs/rules/no-redundant-flow.md): Remove redundant
  uses of flow
- [fp-ts/prefer-chain](docs/rules/prefer-chain.md): Replace map + flatten with
  chain

## Configurations

### Recommended

The plugin defines a `recommended` configuration with some reasonable defaults.

To use it, add it to the `extends` clause of your `.eslintrc` file:

```json
{
  "extends": ["plugin:fp-ts/recommended"]
}
```

The rules included in this configuration are:

- [fp-ts/no-lib-imports](docs/rules/no-lib-imports.md)
- [fp-ts/no-pipeable](docs/rules/no-pipeable.md)

### All

The plugin also defines an `all` configuration which includes every available
rule.

To use it, add it to the `extends` clause of your `.eslintrc` file:

```json
{
  "extends": ["plugin:fp-ts/all"]
}
```
