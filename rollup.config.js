import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import {terser} from 'rollup-plugin-terser';
import miniProgramPlugin from './rollup.miniprogram.plugin';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.');
}

const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const name = path.basename(packageDir);
const resolve = p => path.resolve(packageDir, p);

const entryFile = resolve('lib/index.ts');
const pkg = require(resolve(`package.json`));
const packageOptions = pkg.buildOptions || {};

const exampleDir = path.resolve(__dirname, 'examples');
const evajsCDNDir = path.resolve(__dirname);

const outputConfigs = {
  esm: {
    file: resolve(`dist/${name}.esm.js`),
    format: 'es',
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  umd: {
    name: pkg.bundle,
    file: path.resolve(evajsCDNDir, `${pkg.bundle}.js`),
    format: 'umd',
  },
  miniprogram: {
    file: resolve(`dist/miniprogram.js`),
    format: 'cjs',
  },
};

// ts检查优化
let hasTypesChecked = false;

// 开发环境 esm，cjs 打包
const defaultFormats = ['esm', 'cjs'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split('-');
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats;

const packageConfigs = [];
if (!process.env.PROD_ONLY) {
  packageFormats.forEach(format => {
    if (!outputConfigs[format]) return;

    if (format === 'esm') {
      packageConfigs.push(createEsmDevelopConfig(format));
    }

    if (format === 'cjs') {
      packageConfigs.push(createCjsDevelopConfig(format));
    }

    if (format === 'umd' && pkg.bundle) {
      packageConfigs.push(createUmdDevelopConfig(format));
    }
  });
}

// 为生产环境创建rollup配置
if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach(format => {
    if (!outputConfigs[format]) return;

    if (format === 'cjs') {
      packageConfigs.push(createCjsProductionConfig(format));
    }

    if (format === 'umd' && pkg.bundle) {
      packageConfigs.push(createMinifiedConfig(format));
    }

    if (format === 'miniprogram') {
      packageConfigs.push(createMiniProgramConfig(format));
    }
  });
}

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  output.sourcemap = !!process.env.SOURCE_MAP;
  const shouldEmitDeclaration = process.env.TYPES != null && !hasTypesChecked;

  const tsPlugin = typescript({
    check: process.env.NODE_ENV === 'production' && !hasTypesChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    objectHashIgnoreUnknownHack: true,
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclaration,
        declarationMap: shouldEmitDeclaration,
      },
      exclude: ['**/__tests__'],
    },
  });
  hasTypesChecked = true;

  return {
    input: entryFile,
    output: {
      ...output,
      globals: {
        'pixi.js': 'PIXI',
        '@eva/eva.js': 'EVA',
        '@eva/plugin-renderer': 'EVA.plugin.renderer',
        '@eva/renderer-adapter': 'EVA.rendererAdapter',
      },
    },
    external: [
      'pixi.js',
      '@eva/eva.js',
      '@eva/plugin-renderer',
      '@eva/renderer-adapter',
      '@eva/miniprogram-pixi',
      '@eva/miniprogram-adapter',
    ],
    plugins: [
      ...plugins,
      globals(),
      builtins(),
      json({preferConst: true}),
      commonjs(),
      tsPlugin,
      replace({
        __DEV__: process.env.NODE_ENV === 'development',
        __TEST__: false,
      }),
    ],
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
  };
}

function createCjsDevelopConfig(format) {
  return createConfig(format, {
    file: outputConfigs[format].file,
    format: outputConfigs[format].format,
  });
}

function createEsmDevelopConfig(format) {
  return createConfig(format, {
    file: outputConfigs[format].file,
    format: outputConfigs[format].format,
  });
}

function createUmdDevelopConfig(format) {
  let plugins = [
    nodeResolve({
      browser: true,
      mainFields: ['jsnext', 'esnext', 'module', 'main'],
      rootDir: packageDir,
    }),
    copy({
      targets: [{src: outputConfigs[format].file, dest: resolve(`dist`)}],
      hook: 'writeBundle',
      copyOnce: true,
    }),
  ];

  if (process.env.ROLLUP_WATCH) {
    plugins.push(
      ...[
        serve({
          open: true,
          contentBase: [exampleDir, evajsCDNDir],
          host: 'localhost',
          port: 8080,
        }),
        livereload(evajsCDNDir),
      ],
    );
  }

  return createConfig(format, outputConfigs[format], plugins);
}

function createCjsProductionConfig(format) {
  return createConfig(
    format,
    {
      file: resolve(`dist/${name}.${format}.prod.js`),
      format: outputConfigs[format].format,
    },
    [
      terser({
        toplevel: true,
        mangle: true,
        output: {comments: false},
        compress: true,
      }),
    ],
  );
}

function createMinifiedConfig(format) {
  const {file, name} = outputConfigs[format];
  const destFilename = file.replace('dist/cdn', 'dist/cdn/min').replace(/\.js$/, '.min.js');
  return createConfig(
    format,
    {
      name,
      format,
      file: destFilename,
    },
    [
      nodeResolve({
        browser: true,
        mainFields: ['jsnext', 'esnext', 'module', 'main'],
        rootDir: packageDir,
        preferBuiltins: true,
      }),
      terser({
        toplevel: true,
        mangle: true,
        output: {comments: false},
        compress: true,
      }),
      copy({
        targets: [{src: destFilename, dest: resolve(`dist`)}],
        hook: 'writeBundle',
      }),
    ],
  );
}

function createMiniProgramConfig(format) {
  return createConfig(format, outputConfigs[format], miniProgramPlugin);
}

export default packageConfigs;
