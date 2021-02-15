import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import { option, readonlyNonEmptyArray } from "fp-ts"
import { constant, flow, pipe } from "fp-ts/function"
import { calleeIdentifier, ContextUtils, contextUtils, createRule, isFromModule, Module } from "../utils"

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

const hasModuleObjectIdentifier = ({ typeOfNode }: ContextUtils) => (name: Module) => (node: TSESTree.MemberExpression) => pipe(
  node.object,
  typeOfNode,
  option.exists(isFromModule(name))
)

const hasPropertyIdentifierWithName = (name: string) => (node: TSESTree.MemberExpression) => pipe(
  node.property,
  isIdentifierWithName(name)
)

const isEitherFold = ({ typeOfNode }: ContextUtils) => (node: TSESTree.CallExpression) => pipe(
  node,
  calleeIdentifier,
  option.filter((node) => hasName("fold")(node)),
  option.chain(typeOfNode),
  option.exists((node) => isFromModule("Either")(node))
)

const isOptionNone = (utils: ContextUtils) => (node: TSESTree.MemberExpression) => pipe(
  node,
  option.of,
  option.filter(hasModuleObjectIdentifier(utils)("Option")),
  option.exists(hasPropertyIdentifierWithName("none"))
)

const findMemberExpressionFromArrowFunctionExpression = (node: TSESTree.ArrowFunctionExpression) => pipe(
  node.body,
  option.of,
  option.filter(isMemberExpression),
);

const findMemberExpressionFromCallExpression = (utils: ContextUtils) => (node: TSESTree.CallExpression) => pipe(
  node,
  option.of,
  option.filter<TSESTree.CallExpression>(flow(
    calleeIdentifier,
    option.filter(hasName("constant")),
    option.chain(utils.typeOfNode),
    option.exists(isFromModule("function"))
  )),
  option.chain(getFirstArgument),
  option.filter(isMemberExpression),
)

const findMemberExpression = (utils: ContextUtils) => (node: TSESTree.Expression) => {
  switch (node.type) {
    case AST_NODE_TYPES.ArrowFunctionExpression:
      return findMemberExpressionFromArrowFunctionExpression(node)
    case AST_NODE_TYPES.CallExpression:
      return findMemberExpressionFromCallExpression(utils)(node)
    default:
      return option.none
  }
}

const isCallToOptionNone = (utils: ContextUtils) => flow(
  findMemberExpression(utils),
  option.exists(isOptionNone(utils))
)

const getBodyCallee = (node: TSESTree.Expression) => pipe(
  node,
  option.of,
  option.filter(isArrowFunctionExpression),
  option.map((f) => f.body),
  option.filter(isCallExpression),
  option.map((e) => e.callee)
)

const getBodyCalleeOrNode = (node: TSESTree.Expression) => pipe(
  node,
  getBodyCallee,
  option.getOrElse(constant(node))
)

const isOptionSomeValue = ({ typeOfNode }: ContextUtils) => (node: TSESTree.Expression) => pipe(
  node,
  getBodyCalleeOrNode,
  option.of,
  option.filter(isMemberExpression),
  option.filter(hasPropertyIdentifierWithName("some")),
  option.filter(flow(
    (node) => node.object,
    typeOfNode,
    option.exists(isFromModule("Option"))
  )),
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
    const utils = contextUtils(context)
    return {
      CallExpression(node) {
        pipe(
          node,
          option.of,
          option.filter(isEitherFold(utils)),
          option.chain(getArguments),
          option.filter(hasLength(2)),
          option.filter(flow(readonlyNonEmptyArray.head, isCallToOptionNone(utils))),
          option.filter(flow(readonlyNonEmptyArray.last, isOptionSomeValue(utils))),
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
