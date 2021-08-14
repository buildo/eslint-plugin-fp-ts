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

If you want to enable rules that require type information (see the table below),
then you will also need to add some extra info:

```js
module.exports = {
  plugins: ["fp-ts"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "fp-ts/no-discarded-pure-expression": "error",
  },
};
```

If your project is a multi-package monorepo, you can follow the instructions
[here](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/MONOREPO.md).

> ⚠️ Note that you will need to make the ESLint config file a .js file, due to
> the need of setting `tsconfigRootDir` to `__dirname`. This is necessary to
> make both editor integrations and the CLI work with the correct path. More
> info here: https://github.com/typescript-eslint/typescript-eslint/issues/251

## List of supported rules

| Rule                                                                             | Description                                                                                | Fixable | Requires type-checking |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | :-----: | :--------------------: |
| [fp-ts/no-lib-imports](docs/rules/no-lib-imports.md)                             | Disallow imports from `fp-ts/lib/`                                                         |    🔧    |                        |
| [fp-ts/no-pipeable](docs/rules/no-pipeable.md)                                   | Disallow imports from the `pipeable` module                                                |    🔧    |                        |
| [fp-ts/no-module-imports](docs/rules/no-module-imports.md)                       | Disallow imports from fp-ts modules                                                        |    🔧    |                        |
| [fp-ts/no-redundant-flow](docs/rules/no-redundant-flow.md)                       | Remove redundant uses of `flow`                                                            |    🔧    |                        |
| [fp-ts/prefer-traverse](docs/rules/prefer-traverse.md)                           | Replace `map` + `sequence` with `traverse`                                                 |    💡    |                        |
| [fp-ts/prefer-chain](docs/rules/prefer-chain.md)                                 | Replace `map` + `flatten` with `chain`                                                     |    💡    |                        |
| [fp-ts/prefer-bimap](docs/rules/prefer-bimap.md)                                 | Replace `map` + `mapLeft` with `bimap`                                                     |    💡    |                        |
| [fp-ts/prefer-constant](docs/rules/prefer-constant.md)                           | Replace `() => e` with `constant`                                                          |    🔧    |                        |
| [fp-ts/no-discarded-pure-expression](docs/rules/no-discarded-pure-expression.md) | Disallow expressions returning pure data types (like `Task` or `IO`) in statement position |    💡    |           🦄            |

### Fixable legend:

🔧 = auto-fixable via `--fix` (or via the appropriate editor configuration)

💡 = provides in-editor suggestions that need to be applied manually

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

### Recommended requiring type-checking

We also provide a `recommended-requiring-type-checking` which includes
recommended rules which require type information.

This configuration needs to be included _in addition_ to the `recommended` one:

```
{
  "extends": [
    "plugin:fp-ts/recommended",
    "plugin:fp-ts/recommended-requiring-type-checking"
  ]
}
```

> 👉 You can read more about linting with type information, including
> performance considerations 
> [here](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md)

### All

The plugin also defines an `all` configuration which includes every available
rule.

To use it, add it to the `extends` clause of your `.eslintrc` file:

```json
{
  "extends": ["plugin:fp-ts/all"]
}
```
