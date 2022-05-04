import rule from "../../src/rules/no-discarded-pure-expression";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import path from "path";
import { stripIndent } from "common-tags";

const fixtureProjectPath = path.join(
  __dirname,
  "..",
  "fixtures",
  "fp-ts-project"
);

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: fixtureProjectPath,
    project: "./tsconfig.json",
  },
});

ruleTester.run("no-discarded-pure-expression", rule, {
  valid: [
    {
      code: stripIndent`
        import { task } from "fp-ts"
        function ok() {
          return task.of(42)
        }
      `,
    },
    {
      code: stripIndent`
        import { task } from "fp-ts"
        function ok() {
          task.of(42)()
        }
      `,
    },
    {
      code: stripIndent`
        import { io } from "fp-ts"
        function ok() {
          io.of(42)()
        }
      `,
    },
    {
      code: stripIndent`
        import { reader } from "fp-ts"
        function ok() {
          return reader.of(42)
        }
      `,
    },
    {
      code: stripIndent`
        import { reader } from "fp-ts"
        function ok() {
          reader.of(42)(null)
        }
      `,
    },
    {
      parserOptions: { ecmaFeatures: { jsx: true } },
      code: stripIndent`
        import { task } from "fp-ts"

        function Foo(props: { handlerVoid: () => void; handlerUnknown: () => unknown }) {
          return null
        }

        const myCommand = task.of(42)

        const myComponent = <Foo handlerVoid={() => myCommand()} handlerUnknown={() => myCommand()} />
      `,
    },
    {
      code: stripIndent`
        import { task } from "fp-ts"

        function foo(arg1: number, callbackVoid: () => void, callbackUnknown: () => unknown) {
          return null
        }

        const myCommand = task.of(42)

        foo(2, () => myCommand(), () => myCommand())
      `,
    },
    {
      // https://github.com/buildo/eslint-plugin-fp-ts/issues/62
      code: stripIndent`
        import { IO } from "fp-ts/IO";
        import { IORef } from "fp-ts/IORef";

        class Foo {
          private readonly errors: IORef<string[]>;
          readonly getErrors: IO<string[]>;

          constructor() {
            this.errors = new IORef([]);
            this.getErrors = this.errors.read;
          }
        }
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import { task } from "fp-ts"

        function woops() {
          task.of(42)
        }
      `,
      errors: [
        {
          messageId: "pureExpressionInStatementPosition",
          data: {
            dataType: "Task",
          },
          suggestions: [
            {
              messageId: "addReturn",
              output: stripIndent`
                import { task } from "fp-ts"

                function woops() {
                  return task.of(42)
                }
              `,
            },
            {
              messageId: "runExpression",
              output: stripIndent`
                import { task } from "fp-ts"

                function woops() {
                  task.of(42)()
                }
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { task } from "fp-ts"

        function woops() {
          const x = task.of(42)
          x
        }
      `,
      errors: [
        {
          messageId: "pureExpressionInStatementPosition",
          data: {
            dataType: "Task",
          },
          suggestions: [
            {
              messageId: "addReturn",
              output: stripIndent`
                import { task } from "fp-ts"

                function woops() {
                  const x = task.of(42)
                  return x
                }
              `,
            },
            {
              messageId: "runExpression",
              output: stripIndent`
                import { task } from "fp-ts"

                function woops() {
                  const x = task.of(42)
                  x()
                }
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { taskEither } from "fp-ts"

        function woops() {
          taskEither.of(42)
        }
      `,
      errors: [
        {
          messageId: "pureExpressionInStatementPosition",
          data: {
            dataType: "TaskEither",
          },
          suggestions: [
            {
              messageId: "addReturn",
              output: stripIndent`
                import { taskEither } from "fp-ts"

                function woops() {
                  return taskEither.of(42)
                }
              `,
            },
            {
              messageId: "runExpression",
              output: stripIndent`
                import { taskEither } from "fp-ts"

                function woops() {
                  taskEither.of(42)()
                }
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { io } from "fp-ts"

        function woops() {
          io.of(42)
        }
      `,
      errors: [
        {
          messageId: "pureExpressionInStatementPosition",
          data: {
            dataType: "IO",
          },
          suggestions: [
            {
              messageId: "addReturn",
              output: stripIndent`
                import { io } from "fp-ts"

                function woops() {
                  return io.of(42)
                }
              `,
            },
            {
              messageId: "runExpression",
              output: stripIndent`
                import { io } from "fp-ts"

                function woops() {
                  io.of(42)()
                }
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { reader } from "fp-ts"

        function woops() {
          reader.of(42)
        }
      `,
      errors: [
        {
          messageId: "pureExpressionInStatementPosition",
          data: {
            dataType: "Reader",
          },
          suggestions: [
            {
              messageId: "addReturn",
              output: stripIndent`
                import { reader } from "fp-ts"

                function woops() {
                  return reader.of(42)
                }
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { task, taskEither } from "fp-ts"

        function f(n: number) {
          if (n > 1) {
            return taskEither.of("foo")
          }
          return task.of(42)
        }

        function woops() {
          f(2)
        }
      `,
      errors: [
        {
          messageId: "pureExpressionInStatementPosition",
          data: {
            dataType: "TaskEither",
          },
          suggestions: [
            {
              messageId: "addReturn",
              output: stripIndent`
                import { task, taskEither } from "fp-ts"

                function f(n: number) {
                  if (n > 1) {
                    return taskEither.of("foo")
                  }
                  return task.of(42)
                }

                function woops() {
                  return f(2)
                }
              `,
            },
            {
              messageId: "runExpression",
              output: stripIndent`
                import { task, taskEither } from "fp-ts"

                function f(n: number) {
                  if (n > 1) {
                    return taskEither.of("foo")
                  }
                  return task.of(42)
                }

                function woops() {
                  f(2)()
                }
              `,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        import { task, reader } from "fp-ts"

        function f(n: number) {
          if (n > 1) {
            return reader.of("foo")
          }
          return task.of(42)
        }

        function woops() {
          f(2)
        }
      `,
      errors: [
        {
          messageId: "pureExpressionInStatementPosition",
          data: {
            dataType: "Reader",
          },
          suggestions: [
            {
              messageId: "addReturn",
              output: stripIndent`
                import { task, reader } from "fp-ts"

                function f(n: number) {
                  if (n > 1) {
                    return reader.of("foo")
                  }
                  return task.of(42)
                }

                function woops() {
                  return f(2)
                }
              `,
            }
          ],
        },
      ],
    },
    {
      parserOptions: { ecmaFeatures: { jsx: true } },
      code: stripIndent`
        import { task } from "fp-ts"

        function Foo(props: { handlerVoid: () => void; handlerUnknown: () => unknown }) {
          return null
        }

        const myCommand = task.of(42)

        const myComponent = <Foo handlerVoid={() => myCommand} handlerUnknown={() => myCommand} />
      `,
      errors: [
        {
          messageId: "discardedDataTypeJsx",
          data: {
            jsxAttributeName: "handlerVoid",
            expectedReturnType: "void",
            dataType: "Task",
          },
        },
        {
          messageId: "discardedDataTypeJsx",
          data: {
            jsxAttributeName: "handlerUnknown",
            expectedReturnType: "unknown",
            dataType: "Task",
          },
        },
      ],
    },
    {
      parserOptions: { ecmaFeatures: { jsx: true } },
      code: stripIndent`
        import { task } from "fp-ts"

        const myCommand = task.of(42)

        const myComponent = <div onClick={() => myCommand} />
      `,
      errors: [
        {
          messageId: "discardedDataTypeJsx",
          data: {
            jsxAttributeName: "onClick",
            expectedReturnType: "void",
            dataType: "Task",
          },
        },
      ],
    },
    {
      code: stripIndent`
        import { task } from "fp-ts"

        function foo(arg1: number, callbackVoid: () => void, callbackUnknown: () => unknown) {
          return null
        }

        const myCommand = task.of(42)

        foo(2, () => myCommand, () => myCommand)
      `,
      errors: [
        {
          messageId: "discardedDataTypeArgument",
          data: {
            functionName: "foo",
            expectedReturnType: "void",
            dataType: "Task",
          },
        },
        {
          messageId: "discardedDataTypeArgument",
          data: {
            functionName: "foo",
            expectedReturnType: "unknown",
            dataType: "Task",
          },
        },
      ],
    },
  ],
});
