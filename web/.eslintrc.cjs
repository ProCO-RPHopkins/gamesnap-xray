/**
 * ESLint config for Next.js 15 + TypeScript
 * - Core Web Vitals rules
 * - No unused imports
 * - No explicit `any`
 * - Friendly import ordering
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // Clean imports
    'unused-imports/no-unused-imports': 'error',
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // TS hygiene
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // Next.js best practices are in the "next/core-web-vitals" preset
  },
  ignorePatterns: [
    '.next/**',
    'node_modules/**',
    'tmp/**',
    'public/**',
    // generated assets in standalone runtime when building
    '.next/standalone/**',
  ],
};
