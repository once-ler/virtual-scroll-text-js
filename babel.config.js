module.exports = function (api) {
  api.cache(true);

  const presets = [
    ["@babel/preset-env", {
      "targets": {
        "browsers": [
          "last 2 versions",
          "ie >= 11"
        ],
      },
      "corejs": "3.1.3",
      "useBuiltIns": "entry"
    }]
  ];
  const plugins = [
    "@babel/plugin-proposal-class-properties"
  ];

  return {
    presets,
    plugins
  };
}