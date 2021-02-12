import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import { boolean, option, readonlyNonEmptyArray } from "fp-ts"
import { constant, constVoid, flow, pipe } from "fp-ts/function"
import { calleeIdentifier, contextUtils, createRule } from "../utils"

const hasName = (name: string) => (identifier: TSESTree.Identifier) => identifier.name === name

const isArrowFunctionExpression = (node: TSESTree.Node): node is TSESTree.ArrowFunctionExpression => node.type === AST_NODE_TYPES.ArrowFunctionExpression

const isCallExpression = (node: TSESTree.Node): node is TSESTree.CallExpression => node.type === AST_NODE_TYPES.CallExpression

const isMemberExpression = (node: TSESTree.Node): node is TSESTree.MemberExpression => node.type === AST_NODE_TYPES.MemberExpression

const isIdentifier = (node: TSESTree.Node): node is TSESTree.Identifier => node.type === AST_NODE_TYPES.Identifier

const getParent = (identifier: TSESTree.BaseNode) => pipe(
  identifier.parent,
  option.fromNullable
)

export default createRule({
  name: "prefer-constructor",
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    docs: {
      category: "Best Practices",
      description: "afsafaf",
      recommended: "warn"
    },
    messages: {
      eitherFoldIsOptionFromEither: "cacsaffg",
      replaceEitherFoldWithOptionFromEither: "dsagdgdsg"
    }
  },
  defaultOptions: [],
  create(context) {
    const { isIdentifierImportedFrom } = contextUtils(context)
    return {
      CallExpression(node) {
        const isEitherFold = (node: TSESTree.CallExpression) => {
          return pipe(
            node,
            calleeIdentifier,
            option.filter(hasName("fold")),
            option.chain(getParent),
            option.filter(isMemberExpression),
            option.map((parent) => parent.object),
            option.filter(isIdentifier),
            option.exists(hasName("either"))
          )
        }

        const isOptionNoneArrowFunctionExpression = (node: TSESTree.ArrowFunctionExpression) => {
          return pipe(
            node.body,
            option.of,
            option.filter(isMemberExpression),
            option.exists(isOptionNoneMemberExpression)
          )
        }

        const isOptionNoneMemberExpression = (node: TSESTree.MemberExpression) => {
          return pipe(
            node,
            option.of,
            option.filter(flow(
              (n) => n.object,
              option.of,
              option.filter(isIdentifier),
              option.filter(hasName("option")),
              option.isSome
            )),
            option.filter(flow(
              (n) => n.property,
              option.of,
              option.filter(isIdentifier),
              option.filter(hasName("none")),
              option.isSome
            )),
            option.isSome
          )
        }

        const isOptionNoneCallExpression = (node: TSESTree.CallExpression) => {
          return pipe(
            node,
            calleeIdentifier,
            option.filter(hasName("constant")),
            option.filter((callee) => isIdentifierImportedFrom(callee, /fp-ts\//, context)),
            option.chain(() => pipe(node.arguments[0], option.fromNullable)),
            option.filter(isMemberExpression),
            option.exists(isOptionNoneMemberExpression)
          )
        }

        const isOptionNone = (node: TSESTree.Expression) => {
          switch (node.type) {
            case AST_NODE_TYPES.ArrowFunctionExpression:
              return isOptionNoneArrowFunctionExpression(node)
            case AST_NODE_TYPES.CallExpression:
              return isOptionNoneCallExpression(node)
            case AST_NODE_TYPES.MemberExpression:
              return isOptionNoneMemberExpression(node)
            default:
              return false
          }
        }

        const isOptionSomeValue = (node: TSESTree.Expression) => {
          return pipe(
            node,
            option.of,
            option.map((n) => pipe(
              n,
              option.of,
              option.filter(isArrowFunctionExpression),
              option.map((f) => f.body),
              option.filter(isCallExpression),
              option.map((e) => e.callee),
              option.getOrElse(constant(n))
            )),
            option.filter(isMemberExpression),
            option.filter((body) => pipe(
              body.object,
              option.of,
              option.filter(isIdentifier),
              option.exists(hasName("option"))
            )),
            option.filter((body) => pipe(
              body.property,
              option.of,
              option.filter(isIdentifier),
              option.exists(hasName("some"))
            )),
            option.map((body) => body.parent),
            option.exists((parent) => (
                parent?.type !== AST_NODE_TYPES.CallExpression
                || parent.parent?.type !== AST_NODE_TYPES.ArrowFunctionExpression
                || (
                  parent.arguments.length === 1
                  && parent.parent.params.length === 1
                  && parent.arguments[0]?.type === AST_NODE_TYPES.Identifier
                  && parent.parent.params[0]?.type === AST_NODE_TYPES.Identifier
                  && parent.arguments[0].name === parent.parent.params[0].name
                )
              )
            )
          )
        }
        pipe(
          node,
          isEitherFold,
          boolean.fold(constVoid, () =>
            pipe(
              readonlyNonEmptyArray.fromArray(node.arguments),
              option.filter((args) => args.length === 2),
              option.filter(flow(readonlyNonEmptyArray.head, isOptionNone)),
              option.filter(flow(readonlyNonEmptyArray.last, isOptionSomeValue)),
              option.map(() => {
                context.report({
                  loc: {
                    start: node.loc.start,
                    end: node.loc.end
                  },
                  messageId: "eitherFoldIsOptionFromEither",
                  suggest: [
                    {
                      messageId: "replaceEitherFoldWithOptionFromEither",
                      fix(fixer) {
                        return [
                          fixer.replaceTextRange(
                            node.range,
                            `option.fromEither`
                          )
                        ]
                      }
                    }
                  ]
                })
              })
            )
          )
        )
      }
    }
  }
})
