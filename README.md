![badge](https://concourse.our.buildo.io/api/v1/teams/buildo/pipelines/eslint-plugin-fp-ts/badge)
![npm](https://img.shields.io/npm/dm/eslint-plugin-fp-ts)
![npm](https://img.shields.io/npm/v/eslint-plugin-fp-ts)

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
  'fp-ts/lib' (autofixable 🔧)
- [fp-ts/no-pipeable](docs/rules/no-pipeable.md): Disallow imports from the
  'pipeable' module (autofixable 🔧)
- [fp-ts/no-module-imports](docs/rules/no-module-imports.md): Disallow imports
  from fp-ts modules (autofixable 🔧)
- [fp-ts/no-redundant-flow](docs/rules/no-redundant-flow.md): Remove redundant
  uses of flow (autofixable 🔧)
- [fp-ts/prefer-traverse](docs/rules/prefer-traverse.md): Replace map + sequence
  with traverse (autofixable 🔧)
- [fp-ts/prefer-chain](docs/rules/prefer-chain.md): Replace map + flatten with
  chain (autofixable 🔧)
- [fp-ts/prefer-bimap](docs/rules/prefer-bimap.md): Replace map + mapLeft with
  bimap (autofixable 🔧)

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
