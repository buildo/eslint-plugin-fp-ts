import {
  AST_NODE_TYPES,
  TSESLint,
} from "@typescript-eslint/experimental-utils";
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
        const result = getAdjacentCombinators(node, [
          { name: /map|mapWithIndex/ },
          { name: "sequence" },
        ]);
        if (result) {
          const [mapNode, sequenceNode] = result;

          // NOTE(gabro): this is a naive way of checking whether map and sequence are from the same module
          // We assume the most commonly used syntax is something like:
          //
          // import { array } from 'fp-ts'
          // pipe(
          //   [1, 2],
          //   array.map(...),
          //   array.sequence(...)
          // )
          //
          // So we check that array.map and array.sequence have the same prefix ("array." in this example)
          // by pretty-printing it and comparing the result.
          //
          // This works well enough in practice, but if needed this can be made more exact by using
          // TypeScript's compiler API and comparing the types.
          const mapPrefix =
            mapNode.callee.type === AST_NODE_TYPES.MemberExpression
              ? prettyPrint(mapNode.callee.object)
              : "";

          const sequencePrefix =
            sequenceNode.callee.type === AST_NODE_TYPES.MemberExpression
              ? prettyPrint(sequenceNode.callee.object)
              : "";

          const samePrefix = mapPrefix === sequencePrefix;

          const traverseIdentifier =
            calleeIdentifier(mapNode)?.name === "mapWithIndex"
              ? "traverseWithIndex"
              : "traverse";

          if (mapNode && sequenceNode && mapNode && samePrefix) {
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
      }
    },
  };
}
