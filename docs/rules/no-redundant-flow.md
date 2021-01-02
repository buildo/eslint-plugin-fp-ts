# Remove redundant uses of flow (fp-ts/no-redundant-flow)

Suggest removing `flow` when it only has one argument. This can happen after a
refactoring that removed some combinators from a flow expression.

**Fixable**: This rule is automatically fixable using the `--fix` flag on the
command line.

## Rule Details

Example of **incorrect** code for this rule:

```ts
import { flow } from "fp-ts/pipeable";
import { some, Option } from "fp-ts/Option";

const f: (n: number): Option<number> = flow(some);
```

Example of **correct** code for this rule:

```ts
import { flow } from "fp-ts/pipeable";
import { some, filter, Option } from "fp-ts/Option";

const f: (n: number): Option<number> =
  flow(
    some,
    filter((n) => n > 2)
  );
```
