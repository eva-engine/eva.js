import fs from 'fs';
import path from 'path';
import replace from 'rollup-plugin-replace';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import { miniprogramPlugins1, miniprogramPlugins2 } from './rollup.miniprogram.plugin';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

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

const packages = fs
  .readdirSync(path.resolve(__dirname, 'packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'));

const IIFE_PREFIX = '_EVA_IIFE_';
const split = (str) => {
  return str.split('.')
}
const getInsert = (str) => {
  const arr = split(str)
  const footers = []
  const banners = []
  let lastFooter = 'window'
  arr.forEach((name, i) => {
    lastFooter += `.${name}`
    let footer
    if (i === arr.length - 1) {
      footer = `${lastFooter} = ${lastFooter} || ${IIFE_PREFIX + name}`
      footers.push(footer)
    } else {
      footer = `${lastFooter} = ${lastFooter} || {}`
      banners.push(footer)
    }
  })
  return [banners.join(`;\n`), footers.join(`;\n`)]
}

const sliteName = split(pkg.bundle)
const iifeName = IIFE_PREFIX + sliteName[sliteName.length - 1]
const insert = getInsert(pkg.bundle)

const outputConfigs = {
  esm: {
    file: resolve(`dist/${name}.esm.js`),
    format: 'es',
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  iife: {
    name: iifeName,
    file: resolve(`dist/${pkg.bundle}.js`),
    format: 'iife',
    banner: insert[0],
    footer: insert[1]
  },
  miniprogram: {
    file: resolve(`dist/miniprogram.js`),
    format: 'es',
  },
};

// ts检查优化
let hasTypesChecked = false;

// 开发环境 esm，cjs 打包
const defaultFormats = ['esm', 'cjs', 'iife'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split('-');
const packageFormats = packageOptions.formats || inlineFormats || defaultFormats;

const packageConfigs = [];
if (!process.env.PROD_ONLY) {
  packageFormats.forEach(format => {
    if (!outputConfigs[format]) return;

    if (format === 'esm' || format === 'cjs' || (format === 'iife' && pkg.bundle)) {
      packageConfigs.push(createConfig(format, outputConfigs[format]));
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

    if (format === 'iife' && pkg.bundle) {
      packageConfigs.push(createMinifiedConfig(format));
    }

    if (format === 'miniprogram') {
      packageConfigs.push(createMiniProgramConfig(format));
    }
  });
}

function createConfig(format, output, plugins1 = [], plugins2 = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  output.exports = 'auto';
  output.sourcemap = !!process.env.SOURCE_MAP;
  output.externalLiveBindings = false;

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

  let nodePlugins = [];
  if (format === 'iife') {
    nodePlugins = [
      require('@rollup/plugin-node-resolve').nodeResolve(),
      require('rollup-plugin-polyfill-node')(),
      require('@rollup/plugin-commonjs')({ sourceMap: false, ignore: ['lodash-es'] }),
    ];
  } else if (format === 'miniprogram') {
    nodePlugins = [
      require('@rollup/plugin-node-resolve').nodeResolve({
        resolveOnly: ['resource-loader', 'type-signals', 'parse-uri']
      }),
      require('@rollup/plugin-commonjs')({ sourceMap: false, ignore: ['lodash-es'] }),
    ]
  }

  let external = [];
  let internal = ['@eva/spine-base']
  if (format === 'esm' || format === 'cjs') {
    external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];
  } else {
    const evaDependencies = Array.from(Object.keys(pkg.dependencies || {})).filter(dep => {
      return dep.startsWith('@eva') && packages.indexOf(dep.substring(5)) > -1 && internal.indexOf(dep) === -1;
    });
    external = ['pixi.js', ...evaDependencies];
    output.plugins = [
      getBabelOutputPlugin({
        configFile: path.resolve(__dirname, 'babel.config.js'),
        allowAllFormats: true,
      }),
    ];
  }

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
    external,
    plugins: [
      ...plugins1,
      json({ preferConst: true }),
      replace({
        __TEST__: false,
        __DEV__: process.env.NODE_ENV === 'development',
        __VERSION__: pkg.version,
      }),
      ...nodePlugins,
      tsPlugin,
      ...plugins2
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

function createCjsProductionConfig(format) {
  return createConfig(
    format,
    {
      file: resolve(`dist/${name}.${format}.prod.js`),
      format: outputConfigs[format].format,
    },
    [
      terser({
        toplevel: true, // 开启最高级压缩
        mangle: { reserved: ['_extends'] }, // 不压缩 _extends
        compress: true, // 压缩整体代码
      }),
    ],
  );
}

function createMinifiedConfig(format) {
  const { file, name } = outputConfigs[format];
  const destFilename = file.replace(/\.js$/, '.min.js');
  return createConfig(
    format,
    {
      name,
      format,
      file: destFilename,
    },
    [
      terser({
        // toplevel: true, // 开启最高级压缩
        mangle: { reserved: ['_extends'] }, // 不压缩 _extends
        compress: true, // 压缩整体代码 
      }),
    ],
  );
}

function createMiniProgramConfig(format) {
  return createConfig(format, outputConfigs[format], miniprogramPlugins1, miniprogramPlugins2);
}
export default packageConfigs;
