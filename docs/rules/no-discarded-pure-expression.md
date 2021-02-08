# Disallow expressions returning pure data types (like `Task` or `IO`) where `void` or `unknown` is expected or in statement position (fp-ts/no-discarded-pure-expression)

Expressions which return a pure data type, such as `IO`, `Task` and their
variants, should normally be passed as an argument, returned, or run.

Failing to do so causes the program represented by `IO` or `Task` to never be
run, leading to surprising behavior which is normally difficult to debug.

This rule covers two common scenarios that are common programming errors:

- returning pure data types where `void` or `unknown` is expected (for instance,
  in event handlers) without running them

- writing expressions that return pure data types in statement position (without
  returning them or running them)

**💡 Fixable**: This rule provides in-editor suggested fixes.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { task } from "fp-ts";

function myCommand(): Task<string> {
  return task.of("hello");
}

function woops() {
  myCommand(); // the task will never run, since is not being run nor returned
}
```

```ts
declare const MyComponent: (props: { handler: () => void }) => JSX.Element;
declare const myCommand: () => Task<string>;

export function Foo() {
  return (
    <MyComponent
      handler={() => myCommand()} // bug, the Task will never execute
    />;
  )
}
```

Examples of **correct** code for this rule:

```ts
import { task } from "fp-ts";

function myCommand(): Task<string> {
  return task.of("hello");
}

function woops() {
  return myCommand();
}
```

```ts
declare const MyComponent: (props: { handler: () => void }) => JSX.Element;
declare const myCommand: () => Task<string>;

export function Foo() {
  return (
    <MyComponent
      handler={() => myCommand()()}
    />;
  )
}
```
