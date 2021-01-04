import { TSESLint } from "@typescript-eslint/experimental-utils";
import {
  calleeIdentifier,
  getAdjacentCombinators,
  isPipeOrFlowExpression,
} from "../utils";

const messages = {
  mapFlattenIsChain: "map followed by flatten can be replaced by chain",
  replaceMapFlattenWithChain: "replace map and flatten with chain",
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
          [{ name: /map|mapWithIndex/ }, { name: "flatten" }],
          true
        );
        if (result) {
          const [mapNode, flattenNode] = result;

          const chainIndentifier =
            calleeIdentifier(mapNode)?.name === "mapWithIndex"
              ? "chainWithIndex"
              : "chain";

          context.report({
            loc: {
              start: mapNode.loc.start,
              end: flattenNode.loc.end,
            },
            messageId: "mapFlattenIsChain",
            suggest: [
              {
                messageId: "replaceMapFlattenWithChain",
                fix(fixer) {
                  return [
                    fixer.remove(flattenNode),
                    fixer.removeRange([mapNode.range[1], flattenNode.range[0]]),
                    fixer.replaceText(
                      calleeIdentifier(mapNode)!,
                      chainIndentifier
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
