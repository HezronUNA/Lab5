import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: ["test/**", "node_modules/**", "coverage/**"],
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // Naming conventions básicas
      "camelcase": ["error", { 
        "properties": "never",
        "ignoreDestructuring": true
      }],
      
      // Variables sin usar
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      
      // Seguridad básica
      "no-eval": "error",
      "no-var": "error"
    }
  },
  {
    files: ["test/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },
  tseslint.configs.recommended,
]);
