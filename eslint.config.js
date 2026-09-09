import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";


const sourceFiles = [
  "src/**/*.{js,jsx}",
];

const typescriptFiles = [
  "src/**/*.{ts,tsx}",
];

const testFiles = [
  "src/**/__tests__/**/*.{js,jsx,ts,tsx}",
  "src/**/*.test.{js,jsx,ts,tsx}",
];


/*
 * Historical service-engine modules under these two directories
 * are an isolated CommonJS surface and are not part of the Vite
 * browser runtime graph.
 *
 * Model their actual lexical environment so ESLint can validate
 * their source without falsely treating CommonJS identifiers as
 * browser globals.
 *
 * This does NOT convert them to ESM and does NOT add them to the
 * customer runtime.
 */
const legacyCommonJsFiles = [
  "src/services/crm/**/*.js",
  "src/services/order/**/*.js",
];


const browserGlobals = {
  ...globals.browser,
  ...globals.es2021,
};


const sharedRules = {
  ...js.configs.recommended.rules,

  /*
   * Existing production repository contains substantial historical
   * code. Unused bindings are useful quality signal but should not
   * convert this tooling bootstrap into an unrelated repo-wide
   * refactor.
   */
  "no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],

  /*
   * Empty catch blocks are intentionally used for fail-closed /
   * best-effort browser recovery paths throughout the application.
   */
  "no-empty": [
    "error",
    {
      allowEmptyCatch: true,
    },
  ],

  /*
   * Production build already owns console stripping.
   * ESLint must not duplicate that build-time authority.
   */
  "no-console": "off",

  /*
   * Keep redundant catch wrappers visible as quality debt without
   * turning unrelated historical cleanup into a release blocker.
   */
  "no-useless-catch":
    "warn",
};


export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".vite/**",
    ],
  },

  {
    files: sourceFiles,

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals:
        browserGlobals,

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react,
      "react-hooks":
        reactHooks,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...sharedRules,

      /*
       * React 17+ automatic JSX runtime.
       */
      "react/react-in-jsx-scope":
        "off",

      /*
       * High-signal JSX correctness checks only.
       * Do not introduce broad stylistic React policy here.
       */
      "react/jsx-no-undef":
        "error",

      /*
       * JSX references are real variable usage.
       * Without this rule core no-unused-vars produces false
       * positives for imported/rendered React components.
       */
      "react/jsx-uses-vars":
        "error",

      "react/jsx-key":
        "warn",

      /*
       * Hook call ordering is runtime correctness.
       */
      "react-hooks/rules-of-hooks":
        "error",

      /*
       * Dependency completeness is important, but historical code
       * should be surfaced incrementally rather than rewritten inside
       * this Wallet release checkpoint.
       */
      "react-hooks/exhaustive-deps":
        "warn",
    },
  },

  {
    files: typescriptFiles,

    languageOptions: {
      parser:
        tsParser,

      ecmaVersion: "latest",
      sourceType: "module",

      globals:
        browserGlobals,

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      "@typescript-eslint":
        tsPlugin,

      react,

      "react-hooks":
        reactHooks,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...sharedRules,

      /*
       * Core no-undef / no-unused-vars do not understand TypeScript
       * type space correctly. Delegate unused bindings to the
       * TypeScript-aware implementation.
       */
      "no-undef":
        "off",

      "no-unused-vars":
        "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "react/react-in-jsx-scope":
        "off",

      "react/jsx-no-undef":
        "error",

      /*
       * JSX references are real variable usage.
       * Without this rule core no-unused-vars produces false
       * positives for imported/rendered React components.
       */
      "react/jsx-uses-vars":
        "error",

      "react/jsx-key":
        "warn",

      "react-hooks/rules-of-hooks":
        "error",

      "react-hooks/exhaustive-deps":
        "warn",
    },
  },

  /*
   * Isolated historical CommonJS service engines.
   *
   * Keep sourceType unchanged because one legacy file contains an
   * ESM import; this override only describes the globals already
   * used by this non-browser surface.
   */
  {
    files:
      legacyCommonJsFiles,

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  /*
   * Tests live below src, so Node globals must augment the browser
   * environment rather than forcing production files into Node mode.
   */
  {
    files: testFiles,

    languageOptions: {
      globals: {
        ...browserGlobals,
        ...globals.node,
      },
    },
  },
];
