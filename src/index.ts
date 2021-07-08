import { array, record, semigroup } from "fp-ts";
import { pipe } from "fp-ts/function";

const potentialErrors = {
  "no-lib-imports": require("./rules/no-lib-imports").default,
  "no-pipeable": require("./rules/no-pipeable").default,
  "no-module-imports": require("./rules/no-module-imports").default,
  "no-discarded-pure-expression": require("./rules/no-discarded-pure-expression")
    .default,
};

const suggestions = {
  "prefer-traverse": require("./rules/prefer-traverse").default,
  "no-redundant-flow": require("./rules/no-redundant-flow").default,
  "prefer-chain": require("./rules/prefer-chain").default,
  "prefer-bimap": require("./rules/prefer-bimap").default,
  "prefer-constant": require("./rules/prefer-constant").default,
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
  "recommended-requiring-type-checking": {
    plugins: ["fp-ts"],
    rules: {
      "fp-ts/no-discarded-pure-expression": "error",
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
