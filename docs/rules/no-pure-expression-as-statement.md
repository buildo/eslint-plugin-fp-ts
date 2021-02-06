# Disallow expressions returning pure data types (like `Task` or `IO`) in statement position (fp-ts/no-pure-expression-as-statement)

Expressions which return a pure data type, such as `IO` and `Task`, should
normally be passed as an argument, returned, or run. When they appear in
statement position, it's usually an indication of a mistake, and this rule warns
about it, suggesting to either return or run the expression.

This rule consideres all expressions returning `IO`, `Task` and their variants
(`TaskEither`, `IOEither`, ...) as pure.

**💡 Fixable**: This rule provides in-editor suggested fixes.

## Rule Details

Example of **incorrect** code for this rule:

```ts
import { task } from "fp-ts";

function myCommand(): Task<string> {
  return task.of("hello");
}

function woops() {
  myCommand(); // the task will never run, since is not being run nor returned
}
```

Example of **correct** code for this rule:

```ts
import { task } from "fp-ts";

function myCommand(): Task<string> {
  return task.of("hello");
}

function woops() {
  return myCommand();
}
```
