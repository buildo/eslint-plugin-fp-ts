# Disallow imports from 'fp-ts/lib' (fp-ts/no-lib-imports)

Disallow imports from the `fp-ts/lib` module. `fp-ts` exports modules directly
without the `lib` prefix, which improves ergonomics and tree-shakeability.

> Note: this change was introduced in fp-ts 2.8.0. If you are using an older
> version, do not enable this rule

**🔧 Fixable**: This rule is automatically fixable using the `--fix` flag on the
command line.

## Rule Details

Example of **incorrect** code for this rule:

```ts
import { Option } from "fp-ts/lib/Option";
```

Example of **correct** code for this rule:

```ts
import { Option } from "fp-ts/Option";
import { option } from "fp-ts";
```
