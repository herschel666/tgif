module.exports = {
  parser: 'esprima',
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 7,
  },
  env: {
    node: true,
  },
};
