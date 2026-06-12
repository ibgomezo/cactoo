import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import stylisticJs from "@stylistic/eslint-plugin-js";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: {...globals.browser, ...globals.node, LOGGER: "readonly", MODELS: "readonly", process: "readonly"}} },
  {
    plugins: { "@stylistic/js": stylisticJs },
    rules: { 
      "@stylistic/js/indent": ["error", 2],
      "@stylistic/js/no-process-env": "off",
      "@stylistic/js/no-path-concat": "off",
      "@stylistic/js/quotes": ["error", "double"],
      "@stylistic/js/keyword-spacing": ["error", { before: true, after: true }],
    }
  }
]);