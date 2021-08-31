module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        targets: '>0.3%, not dead',
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
