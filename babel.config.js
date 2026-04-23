module.exports = {
  comments: false,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '>0.3%, not dead',
        loose: true,
        bugfixes: true,
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-object-assign',
  ],
};
