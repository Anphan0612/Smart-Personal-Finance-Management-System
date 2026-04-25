const js = require("@eslint/js");
const ts = require("typescript-eslint");
const react = require("eslint-plugin-react");
const reactNative = require("eslint-plugin-react-native");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
  },
  {
    files: ["mobile/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "react-native": reactNative,
    },
    languageOptions: {
      parser: ts.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: [
      "**/node_modules/",
      "backend/",
      "ai-service/",
      "ml-models/",
      "dist/",
      "build/",
    ],
  },
];
