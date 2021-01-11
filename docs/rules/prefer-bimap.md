# Replace map + mapLeft with bimap (fp-ts/prefer-bimap)

Suggest replacing the combination of `map` followed by `mapLeft` (or vice-versa)
with `bimap`.

**Fixable**: This rule is automatically fixable using the `--fix` flag on the
command line.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { pipe } from "fp-ts/function";
import { either } from "fp-ts";

pipe(
  getResult(),
  either.map((a) => a + 1),
  either.mapLeft((e) => e + 1)
);
```

```ts
import { pipe } from "fp-ts/function";
import { either } from "fp-ts";

pipe(
  getResult(),
  either.mapLeft((e) => e + 1),
  either.map((a) => a + 1)
);
```

Example of **correct** code for this rule:

```ts
import { pipe } from "fp-ts/function";
import { either } from "fp-ts";

pipe(
  getResult(),
  either.bimap(
    (e) => e + 1,
    (a) => a + 1
  )
);
```
