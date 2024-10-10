module.exports = {
    root: true,
    env: {
      es6: true,
      node: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
      "google",
      "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json",
      sourceType: "module",
    },
    ignorePatterns: [
      "/lib/**/*", // Ignore built files.
    ],
    plugins: [
      "@typescript-eslint",
      "import",
    ],
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        "quotes": ["error", "double"],
        "import/no-unresolved": 0,
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "@typescript-eslint/dot-notation": "error",
    },
  };
