import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.ts"],

    languageOptions: {
      parser: tseslint.parser,

      parserOptions: {
        project: "./tsconfig.json"
      },

      globals: {
        ...globals.node
      }
    },

    rules: {
      "no-console": "off",

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          // Some params can't be dropped (Express error handlers require
          // exactly 4 args, catch blocks sometimes keep the binding for
          // clarity even when unused). Prefix with `_` to mark intentional.
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],

      "prefer-const": "off",
      "no-empty": "off",
      "no-useless-catch": "off",
      "no-useless-assignment": "off",
      "no-useless-escape": "off",
      "no-constant-binary-expression": "off",

      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-unused-expressions": "off"
    }
  }
];
