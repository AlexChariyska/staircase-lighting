module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    'no-unused-vars': [2, {'vars': 'all', 'args': 'none'}],
    "require-jsdoc": 0, 
  },
  'globals': {
    Promise: true
  }
};
