/** @type{import('eslint').ESLint.ConfigData} */
module.exports = {
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    /**
     * custom
     */
    'import/order': [
      'error',
      { groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin', 'object', 'type'] },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // ignore var start with _
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: '.',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
