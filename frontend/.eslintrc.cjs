// Minimal lint gate: parser for TS + eslint:recommended.
// tsc --noEmit remains the strict unused-code gate.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist/', 'node_modules/', 'vite.config.ts', 'postcss.config.js', 'tailwind.config.js'],
  rules: {
    // tsc --noEmit is the strict gate for locals; eslint watches vars only.
    // args: none (destructured optional props); no-undef: off (tsc owns it).
    'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
    'no-undef': 'off',
  },
};
