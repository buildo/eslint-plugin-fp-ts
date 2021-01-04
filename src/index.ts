import { array, record, semigroup } from "fp-ts";
import { pipe } from "fp-ts/function";

export const rules = {
  "no-lib-imports": require("./rules/no-lib-imports"),
  "no-pipeable": require("./rules/no-pipeable"),
  "prefer-traverse": require("./rules/prefer-traverse"),
  "no-redundant-flow": require("./rules/no-redundant-flow"),
  "prefer-chain": require("./rules/prefer-chain"),
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
    rules: rulesConfiguredAsError(rules),
  },
};

function rulesConfiguredAsError(
  rules: Record<string, unknown>
): Record<string, string> {
  return pipe(
    rules,
    record.keys,
    array.map<string, [string, string]>((k) => [`fp-ts/${k}`, "error"]),
    record.fromFoldable(semigroup.getFirstSemigroup<string>(), array.Foldable)
  );
}
