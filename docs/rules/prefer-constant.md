# Prefer-constant

It is suggested to replace functions that always return a specific value with `constant`.

**💡 Fixable**: This rule provides in-editor suggested fixes.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
pipe(
  getResult(),
  either.mapLeft(() => empty)
);
```

Example of **correct** code for this rule:

```ts
import { constant } from "fp-ts/function"

pipe(
  getResult(),
  either.mapLeft(constant(empty))
);
```
