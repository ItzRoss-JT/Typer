module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended-legacy',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'serve.mjs', 'screenshot.mjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'security'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Ban XSS / code-injection sinks. We avoid adding eslint-plugin-react just
    // for `react/no-danger`; an AST selector covers the same surface.
    'no-restricted-syntax': [
      'error',
      {
        selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
        message:
          'dangerouslySetInnerHTML is banned. Render text via React (escapes by default). For sanitized HTML, use DOMPurify with an explicit allowlist.',
      },
      {
        selector: "MemberExpression[property.name='innerHTML']",
        message: 'innerHTML is banned. Use textContent or React rendering.',
      },
      {
        selector: "MemberExpression[property.name='outerHTML']",
        message: 'outerHTML is banned.',
      },
      {
        selector: "CallExpression[callee.object.name='document'][callee.property.name='write']",
        message: 'document.write is banned.',
      },
      {
        selector: "CallExpression[callee.name='eval']",
        message: 'eval is banned.',
      },
      {
        selector: "NewExpression[callee.name='Function']",
        message: 'new Function() is banned (dynamic code execution).',
      },
    ],

    // detect-object-injection fires on essentially every computed-property access
    // (perKey[k], errorsByKey[bigram], lessonsCompleted[id], ...). It would drown
    // out signal in this codebase; we rely on TypeScript + Zod for input shaping.
    'security/detect-object-injection': 'off',
    // Same story — non-literal RegExps fire on every dynamic regex builder.
    'security/detect-non-literal-regexp': 'off',
  },
  overrides: [
    {
      // Tests routinely use dynamic property access; the recommended-set rules
      // here add no real safety inside test code.
      files: ['tests/**/*.ts', 'tests/**/*.tsx'],
      rules: {
        'security/detect-non-literal-fs-filename': 'off',
      },
    },
  ],
};
