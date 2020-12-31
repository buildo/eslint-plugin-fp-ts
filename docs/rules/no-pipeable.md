# Disallow imports from the 'pipeable' module (fp-ts/no-pipeable)

Disallow imports from the `pipeable` module. `pipeable` has been deprecated and
it will be removed in future versions of fp-ts. It's recommended to import
`pipe` from the `function` module instead.

**Fixable**: This rule is automatically fixable using the `--fix` flag on the
command line.

> Note: the autofix is available only when importing `pipe`

## Rule Details

Example of **incorrect** code for this rule:

```ts
import { pipe } from "fp-ts/pipeable";
```

Example of **correct** code for this rule:

```ts
import { pipe } from "fp-ts/function";
```
