import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
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
        const result = getAdjacentCombinators(
          node,
          [{ name: /map|mapWithIndex/ }, { name: "sequence" }],
          true
        );
        if (result) {
          const mapNode = result[0] as TSESTree.CallExpression;
          const sequenceNode = result[1] as TSESTree.CallExpression;

          const traverseIdentifier =
            calleeIdentifier(mapNode)?.name === "mapWithIndex"
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
                      calleeIdentifier(mapNode)!,
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
      }
    },
  };
}
