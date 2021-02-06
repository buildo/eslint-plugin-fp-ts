# Replace map + flatten with chain (fp-ts/prefer-chain)

Suggest replacing the combination of `map` (or `mapWithIndex`) followed by
`flatten` with `chain` (or `chainWithIndex`).

**💡 Fixable**: This rule provides in-editor suggested fixes.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { pipe } from "fp-ts/function";
import { map, flatten } from "fp-ts/Array";

pipe(
  [1, 2, 3],
  map((n) => [n, n + 1]),
  flatten
);
```

```ts
import { pipe } from "fp-ts/function";
import { mapWithIndex, flatten } from "fp-ts/Array";

pipe(
  [1, 2, 3],
  mapWithIndex((i, n) => [i, n]),
  flatten
);
```

Examples of **correct** code for this rule:

```ts
import { pipe } from "fp-ts/function";
import { chain } from "fp-ts/Array";

pipe(
  [1, 2, 3],
  chain((n) => [n, n + 1])
);
```

```ts
import { pipe } from "fp-ts/function";
import { chainWithIndex } from "fp-ts/Array";

pipe(
  [1, 2, 3],
  chainWithIndex((i, n) => [i, n])
);
```
