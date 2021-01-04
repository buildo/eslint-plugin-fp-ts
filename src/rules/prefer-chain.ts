import {
  AST_NODE_TYPES,
  TSESLint,
} from "@typescript-eslint/experimental-utils";
import { option } from "fp-ts";
import { pipe } from "fp-ts/function";
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
        pipe(
          getAdjacentCombinators(
            node,
            {
              name: /map|mapWithIndex/,
              types: [AST_NODE_TYPES.CallExpression],
            },
            {
              name: "flatten",
              types: [
                AST_NODE_TYPES.Identifier,
                AST_NODE_TYPES.MemberExpression,
              ],
            },
            true
          ),
          option.bindTo("combinators"),
          option.bind("mapCalleeIdentifier", ({ combinators: [mapNode] }) =>
            calleeIdentifier(mapNode)
          ),
          option.map(
            ({ combinators: [mapNode, flattenNode], mapCalleeIdentifier }) => {
              const chainIndentifier =
                mapCalleeIdentifier.name === "mapWithIndex"
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
                        fixer.removeRange([
                          mapNode.range[1],
                          flattenNode.range[0],
                        ]),
                        fixer.replaceText(
                          mapCalleeIdentifier,
                          chainIndentifier
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
