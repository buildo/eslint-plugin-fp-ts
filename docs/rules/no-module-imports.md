# Disallow imports from fp-ts modules (fp-ts/no-module-imports)

Disallow imports from fp-ts modules, such as `fp-ts/Option`.

The `function` module is an exception and it's allowed nonetheless, since it's
not exported from fp-ts's index.

**Fixable**: This rule is automatically fixable using the `--fix` flag on the
command line.

## Rule Details

Possible configurations:

- `"always"`: disallow importing any member from a module. This is the default
  value.
- `"allow-types"`: allow importing type members from a module.

Example of **incorrect** code for this rule, when configured as `always`:

```ts
import { Option, some } from "fp-ts/Option";

const x: Option<number> = some(42);
```

Example of **incorrect** code for this rule, when configured as `allow-types`:

```ts
import { some } from "fp-ts/Option";

const x = some(42);
```

Example of **correct** code for this rule, when configured as `always`:

```ts
import { option } from "fp-ts";

const x: option.Option<number> = option.some(42);
```

Example of **correct** code for this rule, when configured as `allow-types`:

```ts
import { option } from "fp-ts";
import { Option } from "fp-ts/Option";

const x: Option<number> = option.some(42);
```
