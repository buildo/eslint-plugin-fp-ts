import {
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import { boolean, option, apply } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import {
  calleeIdentifier,
  contextUtils,
  createRule,
  getAdjacentCombinators,
  inferIndent,
  prettyPrint,
} from "../utils";

export default createRule({
  name: "prefer-bimap",
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    docs: {
      category: "Best Practices",
      description: "Replace map + mapLeft with bimap",
      recommended: "warn",
    },
    messages: {
      mapMapLeftIsBimap:
        "{{firstNode}} followed by {{secondNode}} can be replaced by bimap",
      replaceMapMapLeftBimap:
        "replace {{firstNode}} and {{secondNode}} with bimap",
    },
  },
  defaultOptions: [],
  create(context) {
    const { isPipeOrFlowExpression } = contextUtils(context);

    return {
      CallExpression(node) {
        const mapThenMapLeft = () =>
          getAdjacentCombinators<
            TSESTree.CallExpression,
            TSESTree.CallExpression
          >(
            node,
            {
              name: "map",
              types: [AST_NODE_TYPES.CallExpression],
            },
            {
              name: "mapLeft",
              types: [AST_NODE_TYPES.CallExpression],
            },
            true
          );

        const mapLeftThenMap = () =>
          getAdjacentCombinators<
            TSESTree.CallExpression,
            TSESTree.CallExpression
          >(
            node,
            {
              name: "mapLeft",
              types: [AST_NODE_TYPES.CallExpression],
            },
            {
              name: "map",
              types: [AST_NODE_TYPES.CallExpression],
            },
            true
          );

        pipe(
          node,
          isPipeOrFlowExpression,
          boolean.fold(constVoid, () =>
            pipe(
              mapThenMapLeft(),
              option.alt(mapLeftThenMap),
              option.bindTo("combinators"),
              option.bind("calleeIdentifiers", ({ combinators }) =>
                apply.sequenceT(option.option)(
                  calleeIdentifier(combinators[0]),
                  calleeIdentifier(combinators[1])
                )
              ),
              option.map(({ combinators, calleeIdentifiers }) => {
                context.report({
                  loc: {
                    start: combinators[0].loc.start,
                    end: combinators[1].loc.end,
                  },
                  messageId: "mapMapLeftIsBimap",
                  data: {
                    firstNode: calleeIdentifiers[0].name,
                    secondNode: calleeIdentifiers[1].name,
                  },
                  suggest: [
                    {
                      messageId: "replaceMapMapLeftBimap",
                      data: {
                        firstNode: calleeIdentifiers[0].name,
                        secondNode: calleeIdentifiers[1].name,
                      },
                      fix(fixer) {
                        const mapFirst = calleeIdentifiers[0].name === "map";
                        const mapNode = mapFirst
                          ? combinators[0]
                          : combinators[1];
                        const mapLeftNode = mapFirst
                          ? combinators[1]
                          : combinators[0];
                        return [
                          fixer.replaceTextRange(
                            [combinators[0].range[0], combinators[1].range[1]],
                            `${prettyPrint(mapNode.callee).replace(
                              /map$/,
                              "bimap"
                            )}(\n${inferIndent(mapNode)}  ${prettyPrint(
                              mapLeftNode.arguments[0]!
                            )},\n${inferIndent(mapNode)}  ${prettyPrint(
                              mapNode.arguments[0]!
                            )}\n${inferIndent(mapNode)})`
                          ),
                        ];
                      },
                    },
                  ],
                });
              })
            )
          )
        );
      },
    };
  },
});
