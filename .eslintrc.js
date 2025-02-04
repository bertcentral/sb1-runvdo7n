module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': ['error', { allow: ['info', 'error', 'warn'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}