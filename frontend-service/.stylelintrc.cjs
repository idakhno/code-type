module.exports = {
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "layer",
          "responsive",
          "variants",
          "screen",
          "config",
        ],
      },
    ],
  },
};

