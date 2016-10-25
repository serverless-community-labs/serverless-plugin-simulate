module.exports = {
  "extends": "airbnb",
  "plugins": [],
  "rules": {
    // http://eslint.org/docs/rules/semi
    // no semi-colons (YOLO) .. if you really want semicolons, remove this rule and run
    // '.\node_modules\.bin\eslint --fix src' from the app root to re-add
    "semi": [ 2, "never" ],

    "comma-dangle": ["error", "always-multiline"],

    "func-names": "off",

    // doesn't work in node v4 :(
    "strict": "off",
    "prefer-rest-params": "off",
    "react/require-extension" : "off",
    "import/no-extraneous-dependencies" : "off"
  },
  "env": {
       "mocha": true,
       "node": true
   }
};