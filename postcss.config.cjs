const postcssPresetEnv = require("postcss-preset-env");

module.exports = {
  plugins: [
    postcssPresetEnv({
      browsers: [
        "last 2 chrome versions",
        "last 2 firefox versions",
        "opera >= 9",
        "safari >= 6",
      ],
    }),
  ],
};
