import {
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/utils";
import { constVoid, pipe } from "fp-ts/function";
import { boolean, option } from "fp-ts";
import {
  calleeIdentifier,
  getAdjacentCombinators,
  prettyPrint,
  contextUtils,
  createRule,
} from "../utils";

export default createRule({
  name: "prefer-traverse",
  meta: {
    type: "suggestion",
    fixable: "code",
    hasSuggestions: true,
    schema: [],
    docs: {
      description: "Replace map + sequence with traverse",
    },
    messages: {
      mapSequenceIsTraverse:
        "map followed by sequence can be replaced by traverse",
      replaceMapSequenceWithTraverse: "replace map and sequence with traverse",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isPipeOrFlowExpression } = contextUtils(context);
    return {
      CallExpression(node) {
        pipe(
          node,
          isPipeOrFlowExpression,
          boolean.fold(constVoid, () =>
            pipe(
              getAdjacentCombinators<
                TSESTree.CallExpression,
                TSESTree.CallExpression
              >(
                node,
                {
                  name: /map|mapWithIndex/,
                  types: [AST_NODE_TYPES.CallExpression],
                },
                {
                  name: "sequence",
                  types: [AST_NODE_TYPES.CallExpression],
                },
                true
              ),
              option.bindTo("combinators"),
              option.bind("mapCalleeIdentifier", ({ combinators: [mapNode] }) =>
                calleeIdentifier(mapNode)
              ),
              option.map(
                ({
                  combinators: [mapNode, sequenceNode],
                  mapCalleeIdentifier,
                }) => {
                  const traverseIdentifier =
                    mapCalleeIdentifier.name === "mapWithIndex"
                      ? "traverseWithIndex"
                      : "traverse";

                  context.report({
                    loc: {
                      start: mapNode.loc.start,
                      end: sequenceNode.loc.end,
                    },
                    messageId: "mapSequenceIsTraverse",
                    suggest: [
                      {
                        messageId: "replaceMapSequenceWithTraverse",
                        fix(fixer) {
                          return [
                            fixer.remove(sequenceNode),
                            fixer.removeRange([
                              mapNode.range[1],
                              sequenceNode.range[0],
                            ]),
                            fixer.replaceText(
                              mapCalleeIdentifier,
                              traverseIdentifier
                            ),
                            fixer.insertTextAfter(
                              mapNode.callee,
                              `(${prettyPrint(sequenceNode.arguments[0]!)})`
                            ),
                          ];
                        },
                      },
                    ],
                  });
                }
              )
            )
          )
        );
      },
    };
  },
});
