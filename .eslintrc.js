module.exports = {
  parser: '@babel/eslint-parser',
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 7,
    requireConfigFile: false,
  },
  env: {
    node: true,
  },
};
