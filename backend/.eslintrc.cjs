module.exports = {
  root: true,
  env: {
    node: true,
    es2024: true
  },
  extends: ['standard'],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'import/no-unresolved': 'off'
  }
};
