# Disallow imports from fp-ts modules (fp-ts/no-module-imports)

Disallow imports from fp-ts modules, such as `fp-ts/Option`.

The `function` module is an exception and it's allowed nonetheless, since it's
not exported from fp-ts's index.

**Fixable**: This rule is automatically fixable using the `--fix` flag on the
command line.

## Rule Details

Possible configurations:

_`allowTypes`_ (boolean)

- `false`: disallow importing any member from a module. This is the default
  value.
- `true`: allow importing type members from a module.

_`allowedModules`_ (string[])

List of allowed modules, defaults to `["function", "pipeable"]`.

Example of **incorrect** code for this rule, when configured with
`{ allowTypes: false }`

```ts
import { Option, some } from "fp-ts/Option";

const x: Option<number> = some(42);
```

Example of **correct** code for this rule, when configured with
`{ allowTypes: false }`:

```ts
import { option } from "fp-ts";

const x: option.Option<number> = option.some(42);
```

Example of **correct** code for this rule, when configured with
`{ allowTypes: true }`

```ts
import { option } from "fp-ts";
import { Option } from "fp-ts/Option";

const x: Option<number> = option.some(42);
```

Example of **correct** code for this rule, when configured with
`{ allowedModules: ["Option"] }`:

```ts
import { Option, some } from "fp-ts/Option";

const x: Option<number> = some(42);
```
