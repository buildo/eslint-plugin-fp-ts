![CI](https://github.com/buildo/eslint-plugin-fp-ts/actions/workflows/ci.yml/badge.svg)
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

Then enable the plugin in your `eslint.config.mjs` file

```js
import {defineConfig} from 'eslint/config'
import fptsPlugin from 'eslint-plugin-fp-ts'

export default defineConfig(
  {
    plugins: {
      'fp-ts': fptsPlugin,
    }
  }
)
```

and enable the rules you want, for example

```js
export default defineConfig(
  {
    plugins: {
      'fp-ts': fptsPlugin,
    },

    rules: {
      "fp-ts/no-lib-imports": "error"
    }
  }
)
```

If you want to enable rules that require type information (see the table below),
then you will also need to add some extra info:

```js
export default defineConfig(
  {
    plugins: {
      'fp-ts': fptsPlugin,
    },

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      "fp-ts/no-discarded-pure-expression": "error",
    }
  }
)
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
| [fp-ts/no-lib-imports](docs/rules/no-lib-imports.md)                             | Disallow imports from `fp-ts/lib/`                                                         |   🔧    |                        |
| [fp-ts/no-pipeable](docs/rules/no-pipeable.md)                                   | Disallow imports from the `pipeable` module                                                |   🔧    |                        |
| [fp-ts/no-module-imports](docs/rules/no-module-imports.md)                       | Disallow imports from fp-ts modules                                                        |   🔧    |                        |
| [fp-ts/no-redundant-flow](docs/rules/no-redundant-flow.md)                       | Remove redundant uses of `flow`                                                            |   🔧    |                        |
| [fp-ts/prefer-traverse](docs/rules/prefer-traverse.md)                           | Replace `map` + `sequence` with `traverse`                                                 |   💡    |                        |
| [fp-ts/prefer-chain](docs/rules/prefer-chain.md)                                 | Replace `map` + `flatten` with `chain`                                                     |   💡    |                        |
| [fp-ts/prefer-bimap](docs/rules/prefer-bimap.md)                                 | Replace `map` + `mapLeft` with `bimap`                                                     |   💡    |                        |
| [fp-ts/no-discarded-pure-expression](docs/rules/no-discarded-pure-expression.md) | Disallow expressions returning pure data types (like `Task` or `IO`) in statement position |   💡    |           🦄           |

### Fixable legend:

🔧 = auto-fixable via `--fix` (or via the appropriate editor configuration)

💡 = provides in-editor suggestions that need to be applied manually

## Configurations

### Recommended

The plugin defines a `recommended` configuration with some reasonable defaults.

To use it, add it to the `extends` clause of your `eslint.config.mjs` file:

```js
export default defineConfig(
  {
    plugins: {
      'fp-ts': fptsPlugin,
    },

    extends: ["plugin:fp-ts/recommended"]
  }
)
```

The rules included in this configuration are:

- [fp-ts/no-lib-imports](docs/rules/no-lib-imports.md)
- [fp-ts/no-pipeable](docs/rules/no-pipeable.md)

### Recommended requiring type-checking

We also provide a `recommended-requiring-type-checking` which includes
recommended rules which require type information.

This configuration needs to be included _in addition_ to the `recommended` one:

```js
export default defineConfig(
  {
    plugins: {
      'fp-ts': fptsPlugin,
    },

    extends: [
      "fp-ts/recommended",
      "fp-ts/recommended-requiring-type-checking"
    ]
  }
)
```

> 👉 You can read more about linting with type information, including
> performance considerations 
> [here](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md)

### All

The plugin also defines an `all` configuration which includes every available
rule.

To use it, add it to the `extends` clause of your `eslint.config.mjs` file:

```js
export default defineConfig(
  {
    plugins: {
      'fp-ts': fptsPlugin,
    },

    extends: ["fp-ts/all",]
  }
)
```
