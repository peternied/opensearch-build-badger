module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [{
    files: ['*'],
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 0
    }
  }],
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json'
  },
  rules: {
  }
}
