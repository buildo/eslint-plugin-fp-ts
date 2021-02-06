# Remove redundant uses of flow (fp-ts/no-redundant-flow)

Suggest removing `flow` when it only has one argument. This can happen after a
refactoring that removed some combinators from a flow expression.

**💡 Fixable**: This rule provides in-editor suggested fixes.

## Rule Details

Example of **incorrect** code for this rule:

```ts
import { flow } from "fp-ts/function";
import { some, Option } from "fp-ts/Option";

const f: (n: number): Option<number> = flow(some);
```

Example of **correct** code for this rule:

```ts
import { flow } from "fp-ts/function";
import { some, filter, Option } from "fp-ts/Option";

const f: (n: number): Option<number> =
  flow(
    some,
    filter((n) => n > 2)
  );
```
