# Replace map + sequence with traverse (fp-ts/prefer-traverse)

Suggest replacing the combination of `map` (or `mapWithIndex`) followed by
`sequence` with `traverse` (or `traverseWithIndex`).

**💡 Fixable**: This rule provides in-editor suggested fixes.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { pipe } from "fp-ts/pipeable";
import { map, sequence } from "fp-ts/Array";
import { option, some } from "fp-ts/Option";

pipe(
  [1, 2, 3],
  map((n) => some(n)),
  sequence(option)
);
```

```ts
import { pipe } from "fp-ts/pipeable";
import { mapWithIndex, sequence } from "fp-ts/Array";
import { option, some } from "fp-ts/Option";

pipe(
  [1, 2, 3],
  mapWithIndex((i) => some(i)),
  sequence(option)
);
```

Examples of **correct** code for this rule:

```ts
import { pipe } from "fp-ts/pipeable";
import { traverse } from "fp-ts/Array";
import { option, some } from "fp-ts/Option";

pipe(
  [1, 2, 3],
  traverse(option)((n) => some(n))
);
```

```ts
import { pipe } from "fp-ts/pipeable";
import { traverseWithIndex } from "fp-ts/Array";
import { option, some } from "fp-ts/Option";

pipe(
  [1, 2, 3],
  traverseWithIndex(option)((i) => some(i))
);
```
