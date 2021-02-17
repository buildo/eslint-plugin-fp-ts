# Replace destructors with constructors (fp-ts/prefer-constructor)

Suggest replacing the combination of a destructor and constructors with a constructor when changing types.

This rule covers:

- `Option.fromEither`

**💡 Fixable**: This rule provides in-editor suggested fixes.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { either, option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  either.of(1),
  either.fold(() => option.none, option.some)
)
```

Examples of **correct** code for this rule:

```ts
import { either, option } from "fp-ts"
import { pipe } from "fp-ts/function"

pipe(
  either.of(1),
  option.fromEither
)
```
