import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import { pipe } from "fp-ts/function";
import { option } from "fp-ts";
import {
  calleeIdentifier,
  getAdjacentCombinators,
  isPipeOrFlowExpression,
  prettyPrint,
} from "../utils";

const messages = {
  mapSequenceIsTraverse: "map followed by sequence can be replaced by traverse",
  replaceMapSequenceWithTraverse: "replace map and sequence with traverse",
} as const;
type MessageIds = keyof typeof messages;

export const meta: TSESLint.RuleMetaData<MessageIds> = {
  type: "suggestion",
  fixable: "code",
  schema: [],
  messages,
};

export function create(
  context: TSESLint.RuleContext<MessageIds, []>
): TSESLint.RuleListener {
  return {
    CallExpression(node) {
      if (isPipeOrFlowExpression(node, context)) {
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
            ({ combinators: [mapNode, sequenceNode], mapCalleeIdentifier }) => {
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
        );
      }
    },
  };
}
