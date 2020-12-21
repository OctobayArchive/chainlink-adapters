module.exports = {
  env: {
    es2020: true,
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'standard/no-callback-literal': 0
  }
}
