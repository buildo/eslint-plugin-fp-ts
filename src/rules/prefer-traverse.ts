import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import { generate } from "astring";
import { calleeIdentifier } from "../utils";

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
      const callee = calleeIdentifier(node);
      if (callee && ["pipe", "flow"].includes(callee.name)) {
        const mapNodeIndex = node.arguments.findIndex((a, index) => {
          if (
            a.type === AST_NODE_TYPES.CallExpression &&
            index < node.arguments.length - 1
          ) {
            const b = node.arguments[index + 1];
            if (b?.type === AST_NODE_TYPES.CallExpression) {
              if (
                calleeIdentifier(a)?.name === "map" &&
                calleeIdentifier(b)?.name === "sequence"
              ) {
                return true;
              }
            }
          }
          return false;
        });
        if (mapNodeIndex >= 0) {
          const mapNode = node.arguments[
            mapNodeIndex
          ] as TSESTree.CallExpression;
          const sequenceNode = node.arguments[
            mapNodeIndex + 1
          ] as TSESTree.CallExpression;

          const mapPrefix =
            mapNode.callee.type === AST_NODE_TYPES.MemberExpression
              ? generate(mapNode.callee.object as any)
              : "";
          const sequencePrefix =
            sequenceNode.callee.type === AST_NODE_TYPES.MemberExpression
              ? generate(sequenceNode.callee.object as any)
              : "";

          if (
            mapNode &&
            sequenceNode &&
            mapNode &&
            mapPrefix === sequencePrefix
          ) {
            context.report({
              node: mapNode,
              messageId: "mapSequenceIsTraverse",
              suggest: [
                {
                  messageId: "replaceMapSequenceWithTraverse",
                  fix(fixer) {
                    return [
                      fixer.remove(sequenceNode),
                      fixer.removeRange([
                        mapNode.range[1],
                        mapNode.range[1] + 1,
                      ]),
                      fixer.replaceText(calleeIdentifier(mapNode)!, "traverse"),
                      fixer.insertTextAfter(
                        mapNode.callee,
                        `(${generate(sequenceNode.arguments[0] as any)})`
                      ),
                    ];
                  },
                },
              ],
            });
          }
        }
      }
    },
  };
}
