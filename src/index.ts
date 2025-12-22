import { array, record, semigroup } from "fp-ts";
import { pipe } from "fp-ts/function";
import {ESLint} from 'eslint'

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
};

const pkg = require('../package.json');

export const meta: ESLint.Plugin["meta"] & {namespace?: string} = {
  name: pkg.name,
  version: pkg.version,
  namespace: 'fp-ts'
}

export const rules: ESLint.Plugin["rules"] = {
  ...potentialErrors,
  ...suggestions,
};

export const configs: ESLint.Plugin["configs"] = {};

const plugin: ESLint.Plugin = {
  meta,
  rules,
  configs
}

// assign configs here so we can reference `plugin`
Object.assign(configs, {
  // flat config format
  "flat/recommended": {
    plugins: {"fp-ts": plugin},
    rules: {
      "fp-ts/no-lib-imports": "error",
      "fp-ts/no-pipeable": "error",
    },
  },
  "flat/recommended-requiring-type-checking": {
    plugins: {"fp-ts": plugin},
    rules: {
      "fp-ts/no-discarded-pure-expression": "error",
    },
  },
  "flat/all": {
    plugins: {"fp-ts": plugin},
    rules: {
      ...configuredRules(potentialErrors, "error"),
      ...configuredRules(suggestions, "warn"),
    },
  },
  
  // eslintrc format
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
});

export default plugin

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
