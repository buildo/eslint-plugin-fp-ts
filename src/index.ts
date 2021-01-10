import { array, record, semigroup } from "fp-ts";
import { pipe } from "fp-ts/function";

const potentialErrors = {
  "no-lib-imports": require("./rules/no-lib-imports"),
  "no-pipeable": require("./rules/no-pipeable"),
  "no-module-imports": require("./rules/no-module-imports").default,
};

const suggestions = {
  "prefer-traverse": require("./rules/prefer-traverse"),
  "no-redundant-flow": require("./rules/no-redundant-flow"),
  "prefer-chain": require("./rules/prefer-chain"),
};

export const rules = {
  ...potentialErrors,
  ...suggestions,
};

export const configs = {
  recommended: {
    plugins: ["fp-ts"],
    rules: {
      "fp-ts/no-lib-imports": "error",
      "fp-ts/no-pipeable": "error",
    },
  },
  all: {
    plugins: ["fp-ts"],
    rules: {
      ...configuredRules(potentialErrors, "error"),
      ...configuredRules(suggestions, "warn"),
    },
  },
};

function configuredRules(
  rules: Record<string, unknown>,
  level: "warn" | "error"
): Record<string, string> {
  return pipe(
    rules,
    record.keys,
    array.map<string, [string, string]>((k) => [`fp-ts/${k}`, level]),
    record.fromFoldable(semigroup.getFirstSemigroup<string>(), array.Foldable)
  );
}
