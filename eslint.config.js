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
      // ═══════════════════════════════════════
      // NAMING CONVENTIONS
      // ═══════════════════════════════════════
      "camelcase": ["error", { 
        "properties": "never",
        "ignoreDestructuring": true,
        "allow": ["^UPPER_CASE"]  // Permite constantes en UPPER_SNAKE_CASE
      }],
      
      "new-cap": ["error", { 
        "newIsCap": true,    // Clases en PascalCase
        "capIsNew": false    // No todas PascalCase son clases
      }],
      
      // ═══════════════════════════════════════
      // VARIABLES
      // ═══════════════════════════════════════
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      
      "prefer-const": "error",  // Usar const cuando sea posible
      "no-var": "error",        // No usar var
      
      // ═══════════════════════════════════════
      // FUNCIONES
      // ═══════════════════════════════════════
      "func-names": ["warn", "as-needed"],
      "arrow-body-style": ["error", "as-needed"],
      
      // ═══════════════════════════════════════
      // SEGURIDAD BÁSICA
      // ═══════════════════════════════════════
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      
      // ═══════════════════════════════════════
      // BEST PRACTICES
      // ═══════════════════════════════════════
      "eqeqeq": ["error", "always"],
      "no-console": "warn",
      "no-debugger": "error"
    }
  },
  {
    files: ["test/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      "no-console": "off"  // Permitir console.log en tests
    }
  },
  tseslint.configs.recommended,
]);
