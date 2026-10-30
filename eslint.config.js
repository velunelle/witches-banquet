import js from "@eslint/js";
import globals from "globals";
export default [
  { ignores: ["dist/**", "public/**", "release/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, Peer: "readonly" },
    },
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "tests/**/*.mjs", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
];
