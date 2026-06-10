const {pathsToModuleNameMapper} = require('ts-jest/utils');
const tsconfig = require('./tsconfig');

const moduleNameMapper = pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {prefix: '<rootDir>/'});

module.exports = {
  preset: 'ts-jest',
  rootDir: __dirname,
  setupFilesAfterEnv: ['./scripts/setupJestEnv.ts'],
  globals: {
    DEV: true,
    __DEV__: true,
    __TEST__: true,
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [5055],
      },
    },
  },
  testURL: 'http://local.pages.tmall.com',
  verbose: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'json', 'lcov'],
  collectCoverageFrom: ['packages/eva.js/lib/**/*.ts', '!packages/eva.js/lib/loader/resource-loader'],
  moduleNameMapper: {
    ...moduleNameMapper,
    '^@eva/inspector-decorator$': '<rootDir>/../inspector-decorators/src',
    '^lodash-es$': 'lodash',
    '^lodash-es/(.*)$': 'lodash/$1',
    // 根 monorepo 的 pixi.js v8 是 ESM-only(require earcut 时爆 SyntaxError),
    // 单元测试不需要真实渲染,这里 stub 掉。
    '^pixi.js$': '<rootDir>/packages/eva.js/__tests__/__mocks__/pixi.js.ts',
    '^pixi-spine$': '<rootDir>/packages/plugin-renderer-spine/__tests__/__mocks__/pixi-spine.ts',
    '^\\./lottie-pixi$': '<rootDir>/packages/plugin-renderer-lottie/__tests__/__mocks__/lottie-pixi.ts',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.git/',
    'packages/plugin-renderer-test',
    'packages/eva-plugin-tiny',
    'packages/plugin-alive',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.spec.ts',
    '<rootDir>/packages/**/__tests__/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/resource-loader/',
    'packages/plugin-renderer-test',
    'packages/eva-plugin-tiny',
    'packages/plugin-alive',
  ],
};
