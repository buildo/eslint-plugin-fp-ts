import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import { boolean, option, readonlyNonEmptyArray } from "fp-ts"
import { constVoid, flow, pipe } from "fp-ts/function"
import { calleeIdentifier, contextUtils, createRule } from "../utils"

const hasName = (name: string) => (identifier: TSESTree.Identifier) => identifier.name === name

const isMemberExpression = (node: TSESTree.Node): node is TSESTree.MemberExpression => node.type === AST_NODE_TYPES.MemberExpression

const isIdentifier = (node: TSESTree.Node): node is TSESTree.Identifier => node.type === AST_NODE_TYPES.Identifier

const getParent = (identifier: TSESTree.BaseNode) => pipe(
  identifier.parent,
  option.fromNullable,
);

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
            option.filter(() => node.object?.type === AST_NODE_TYPES.Identifier && node.object.name === "option"),
            option.filter(() => node.property?.type === AST_NODE_TYPES.Identifier && node.property.name === "none"),
            option.isSome
          )
        }

        const isOptionNoneCallExpression = (node: TSESTree.CallExpression) => {
          return pipe(
            node,
            calleeIdentifier,
            option.filter(
              (callee) =>
                callee.name === "constant" &&
                isIdentifierImportedFrom(callee, /fp-ts\//, context)
            ),
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
            option.map((n) => n.type === AST_NODE_TYPES.ArrowFunctionExpression && n.body.type === AST_NODE_TYPES.CallExpression ? n.body.callee : n),
            option.filter(isMemberExpression),
            option.exists(
              (body) =>
                body.object?.type === AST_NODE_TYPES.Identifier && body.object.name === "option"
                &&
                body.property?.type === AST_NODE_TYPES.Identifier && body.property.name === "some"
                &&
                (body.parent?.type !== AST_NODE_TYPES.CallExpression || body.parent.parent?.type !== AST_NODE_TYPES.ArrowFunctionExpression
                  ||
                  (body.parent.arguments.length === 1 && body.parent.parent.params.length === 1 && body.parent.arguments[0]?.type === AST_NODE_TYPES.Identifier && body.parent.parent.params[0]?.type === AST_NODE_TYPES.Identifier && body.parent.arguments[0].name === body.parent.parent.params[0].name))
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
