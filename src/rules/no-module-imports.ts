import {
  ASTUtils,
  AST_NODE_TYPES,
  TSESLint,
} from "@typescript-eslint/experimental-utils";
import { array } from "fp-ts";
import { pipe } from "fp-ts/function";
import { contextUtils } from "../utils";

const messages = {
  importNotAllowed:
    "Importing from modules is not allowed, import from 'fp-ts' instead",
  importValuesNotAllowed:
    "Importing values from modules is not allowed, import from 'fp-ts' instead",
  convertImportToIndex: "Import all members from fp-ts",
  convertImportValuesToIndex: "Import values from fp-ts",
} as const;
type MessageIds = keyof typeof messages;

type Options = ["always" | "allow-types"];

export const meta: TSESLint.RuleMetaData<MessageIds> = {
  type: "suggestion",
  fixable: "code",
  schema: [
    {
      enum: ["always", "allow-types"],
    },
  ],
  messages,
};

export function create(
  context: TSESLint.RuleContext<MessageIds, Options>
): TSESLint.RuleListener {
  const allowTypes = context.options[0] === "allow-types";
  const allowedModules = ["function"];

  const {
    addNamedImportIfNeeded,
    isOnlyUsedAsType,
    removeImportDeclaration,
  } = contextUtils(context);

  return {
    ImportDeclaration(node) {
      const sourceValue = node.source.value?.toString();
      if (sourceValue) {
        const forbiddenImportPattern = /^fp-ts\/(.+)/;
        const matches = sourceValue.match(forbiddenImportPattern);

        if (matches != null) {
          const matchedModule = matches[1]!.replace("lib/", "");
          if (allowedModules.includes(matchedModule)) {
            return;
          }

          const importSpecifiers = node.specifiers.filter(
            (importClause) =>
              importClause.type === AST_NODE_TYPES.ImportSpecifier
          );

          const nonTypeImports = pipe(
            importSpecifiers,
            array.filter((i) => !isOnlyUsedAsType(i))
          );

          if (allowTypes && nonTypeImports.length === 0) {
            return;
          }

          if (importSpecifiers.length > 0) {
            context.report({
              node: node.source,
              messageId: allowTypes
                ? "importValuesNotAllowed"
                : "importNotAllowed",
              suggest: [
                {
                  messageId: allowTypes
                    ? "convertImportValuesToIndex"
                    : "convertImportToIndex",
                  fix(fixer) {
                    const indexExport =
                      matchedModule.charAt(0).toLowerCase() +
                      matchedModule.slice(1);

                    const referencesFixes = importSpecifiers.flatMap(
                      (importSpecifier) => {
                        const variable = ASTUtils.findVariable(
                          context.getScope(),
                          importSpecifier.local.name
                        );
                        if (variable) {
                          return variable.references
                            .filter((ref) =>
                              allowTypes
                                ? ref.identifier.parent?.type !==
                                  AST_NODE_TYPES.TSTypeReference
                                : true
                            )
                            .filter(
                              (ref) =>
                                ref.identifier.parent?.type !==
                                AST_NODE_TYPES.MemberExpression
                            )
                            .map((ref) =>
                              fixer.insertTextBefore(
                                ref.identifier,
                                `${indexExport}.`
                              )
                            );
                        } else {
                          return [];
                        }
                      }
                    );

                    const importFixes =
                      !allowTypes ||
                      nonTypeImports.length === importSpecifiers.length
                        ? [removeImportDeclaration(node, fixer)]
                        : nonTypeImports.map((node) => {
                            if (
                              context.getSourceCode().getTokenAfter(node)
                                ?.value === ","
                            ) {
                              return fixer.removeRange([
                                node.range[0],
                                node.range[1] + 1,
                              ]);
                            } else {
                              return fixer.remove(node);
                            }
                          });

                    return [
                      ...importFixes,
                      ...addNamedImportIfNeeded(indexExport, "fp-ts", fixer),
                      ...referencesFixes,
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
