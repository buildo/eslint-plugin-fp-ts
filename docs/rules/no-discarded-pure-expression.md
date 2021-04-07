# Disallow expressions returning pure data types (like `Task`, `IO`, or `Reader`) where `void` or `unknown` is expected or in statement position (fp-ts/no-discarded-pure-expression)

Expressions which return a pure data type, such as `IO`, `Task`, 'Reader' and
their variants, should normally be passed as an argument, returned, or run.

Failing to do so causes the program represented by `IO`, `Task`, or `Reader` to
never be run, leading to surprising behavior which is normally difficult to
debug.

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

declare const myCommand: (n: number) => Task<string>;

function woops() {
  myCommand(1); // the task will never run, since is not being run nor returned
}
```

```ts
declare const MyComponent: (props: { handler: () => void }) => JSX.Element;

declare const myCommand: (n: number) => Task<string>;

export function Foo() {
  return (
    <MyComponent
      handler={() => myCommand(1)} // bug, the Task will never execute
    />;
  )
}
```

```ts
import { task } from "fp-ts";

declare function foo(arg1: number, callbackUnknown: () => unknown): void;

declare const myCommand: (n: number) => Task<string>;

foo(
  2,
  () => myCommand(1) // bug, the Task will never execute
);
```

Examples of **correct** code for this rule:

```ts
import { task } from "fp-ts";

declare const myCommand: (n: number) => Task<string>;

function ok() {
  return myCommand(1);
}
```

```ts
declare const MyComponent: (props: { handler: () => void }) => JSX.Element;

declare const myCommand: (n: number) => Task<string>;

export function Foo() {
  return (
    <MyComponent
      handler={() => myCommand(1)()}
    />;
  )
}
```

```ts
import { task } from "fp-ts";

declare function foo(arg1: number, callbackUnknown: () => unknown): void;

declare const myCommand: (n: number) => Task<string>;

foo(2, () => myCommand(1)());
```
