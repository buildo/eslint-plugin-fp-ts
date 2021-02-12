import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import { option, readonlyNonEmptyArray } from "fp-ts"
import { constant, flow, pipe } from "fp-ts/function"
import { calleeIdentifier, contextUtils, createRule } from "../utils"

const hasName = (name: string) => (identifier: TSESTree.Identifier) => identifier.name === name

const hasLength = (length: number) => <T>(array: ReadonlyArray<T>) => array.length === length

const isArrowFunctionExpression = (node: TSESTree.Node): node is TSESTree.ArrowFunctionExpression => node.type === AST_NODE_TYPES.ArrowFunctionExpression

const isFunctionExpression = (node: TSESTree.Node): node is TSESTree.FunctionExpression => node.type === AST_NODE_TYPES.FunctionExpression

const isFunctionLike = (node: TSESTree.Node): node is TSESTree.FunctionLike => isArrowFunctionExpression(node) || isFunctionExpression(node)

const isCallExpression = (node: TSESTree.Node): node is TSESTree.CallExpression => node.type === AST_NODE_TYPES.CallExpression

const isMemberExpression = (node: TSESTree.Node): node is TSESTree.MemberExpression => node.type === AST_NODE_TYPES.MemberExpression

const isIdentifier = (node: TSESTree.Node): node is TSESTree.Identifier => node.type === AST_NODE_TYPES.Identifier

const getParent = (identifier: TSESTree.BaseNode) => pipe(
  identifier.parent,
  option.fromNullable
)

const getArguments = (call: TSESTree.CallExpression) => pipe(
  call.arguments,
  readonlyNonEmptyArray.fromArray
)

const getFirstArgument = (call: TSESTree.CallExpression) => pipe(
  call,
  getArguments,
  option.map(readonlyNonEmptyArray.head)
)

const getParams = (call: TSESTree.FunctionLike) => pipe(
  call.params,
  readonlyNonEmptyArray.fromArray
)

const getFirstParam = (call: TSESTree.FunctionLike) => pipe(
  call,
  getParams,
  option.map(readonlyNonEmptyArray.head)
)

const isIdentifierWithName = (name: string) => (node: TSESTree.Node) => pipe(
  node,
  option.of,
  option.filter(isIdentifier),
  option.exists(hasName(name))
)

const hasObjectIdentifierWithName = (name: string) => (node: TSESTree.MemberExpression) => pipe(
  node.object,
  isIdentifierWithName(name)
)

const hasPropertyIdentifierWithName = (name: string) => (node: TSESTree.MemberExpression) => pipe(
  node.property,
  isIdentifierWithName(name)
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
            option.exists(hasObjectIdentifierWithName("either"))
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
            option.filter(hasObjectIdentifierWithName("option")),
            option.exists(hasPropertyIdentifierWithName("none"))
          )
        }

        const isOptionNoneCallExpression = (node: TSESTree.CallExpression) => {
          return pipe(
            node,
            option.of,
            option.filter<TSESTree.CallExpression>(flow(
              calleeIdentifier,
              option.filter(hasName("constant")),
              option.exists((callee) => isIdentifierImportedFrom(callee, /fp-ts\//, context))
            )),
            option.chain(getFirstArgument),
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

        const getBodyCallee = (node: TSESTree.Expression) => {
          return pipe(
            node,
            option.of,
            option.filter(isArrowFunctionExpression),
            option.map((f) => f.body),
            option.filter(isCallExpression),
            option.map((e) => e.callee)
          )
        }

        const getBodyCalleeOrNode = (node: TSESTree.Expression) => {
          return pipe(
            node,
            getBodyCallee,
            option.getOrElse(constant(node))
          )
        }

        const isOptionSomeValue = (node: TSESTree.Expression) => {
          return pipe(
            node,
            getBodyCalleeOrNode,
            option.of,
            option.filter(isMemberExpression),
            option.filter(hasObjectIdentifierWithName("option")),
            option.filter(hasPropertyIdentifierWithName("some")),
            option.chain(getParent),
            option.exists((parent) => (
              !isCallExpression(parent)
              || !(parent.parent)
              || !isArrowFunctionExpression(parent.parent)
              || pipe(
                option.Do,
                option.bind("argument", () => pipe(parent, getFirstArgument, option.filter(isIdentifier))),
                option.bind("param", () => pipe(parent, getParent, option.filter(isFunctionLike), option.chain(getFirstParam), option.filter(isIdentifier))),
                option.exists(({ argument, param }) => hasName(argument.name)(param))
              )
            ))
          )
        }
        pipe(
          node,
          option.of,
          option.filter(isEitherFold),
          option.chain(getArguments),
          option.filter(hasLength(2)),
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
      }
    }
  }
})
