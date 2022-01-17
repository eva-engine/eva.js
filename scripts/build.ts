/*
为开发和生产环境构建，并将d.ts文件整合

USAGE:

$tnpm run build eva.js 构建一个package
$tnpm run build eva.js plugin-renderer 构建多个 package
$tnpm run build 构建全部package

--all -a      根据模糊匹配构建多个 $tnpm run build plugin-renderer -- --all`，会构建包含`plugin-renderer`的所有package
--formats -f  指定构建格式       $tnpm run build -- --formats ejs-iife-esm
--types -t    生成d.ts             $tnpm run build -- --types
--sourcemap -s 生成sourceMap    $tnpm run build -- --sourcemap

常用命令

构建eva.js的包，$tnpm run build eva.js -- -ts -f cjs-esm-iife

*/

import fs, { writeFile } from "fs/promises";
import chalk from "chalk";
import path from "path";
import execa from 'execa';
import { gzipSync } from "zlib";
import { compress } from "brotli";
import { targets as allTargets, fuzzyMatchTarget } from "./utils";
import { build as esbuild, BuildOptions } from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";
import { resolve } from "core-js/fn/promise";
import { transformAsync } from "@babel/core";

const args = require('minimist')(process.argv.slice(2));
const targets = args._;
const formats: ('iife' | 'esm' | 'cjs' | 'miniprogram')[] = args.formats || args.f;
const sourceMap = args.sourcemap || args.s;
const isRelease = args.release;
const buildTypes = args.t || args.types || isRelease;
const buildAllMatching = args.all || args.a;
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7);
const { version } = require('../package.json')


run();

async function run() {
  if (!targets.length) {
    await buildAll(allTargets);
    // checkAllSizes(allTargets);
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching));
    // checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching));
  }
}



async function buildAll(targets: string[]) {
  const pkgStructs = targets.map(target => ([target, {
    entry: path.resolve(`./packages/${target}/lib/index.ts`),
    pkgDir: path.resolve(`./packages/${target}`),
    pkg: require(path.resolve(`./packages/${target}/package.json`))
  }] as const)).filter(([_, { pkg }]) => !isRelease || !pkg.private)

  const pkgMap = Object.fromEntries(pkgStructs);

  for (const struct of pkgStructs) {
    try {
      await fs.rm(`${struct[1].pkgDir}/dist`, {
        recursive: true,
      });
    } catch { } finally {
      await fs.mkdir(`${struct[1].pkgDir}/dist`);
      await fs.mkdir(`${struct[1].pkgDir}/dist/esm`);
      await fs.mkdir(`${struct[1].pkgDir}/dist/cjs`);
      await fs.mkdir(`${struct[1].pkgDir}/dist/browser`);
    }
  }

  const esmInternal: string[] = [];
  const cjsInternal: string[] = [];
  const iifeInternal: string[] = [];
  const internals = {
    esm: esmInternal,
    cjs: cjsInternal,
    iife: iifeInternal
  }

  function getBaseEsbuildConfig(mode: 'esm' | 'cjs' | 'iife'): BuildOptions {
    return {
      target: 'es2015',
      minify: false,
      define: {
        "__TEST__": 'false',
        "__DEV__": `${false}`,
        "__VERSION__": `"${version}"`
      },
      bundle: true,
      tsconfig: './tsconfig.json',
      treeShaking: true,
      write: false,
      outdir: '/',
      sourcemap: sourceMap,
      entryPoints: Object.fromEntries(pkgStructs.map(([name, { entry }]) => [name, entry])),
      format: mode,
      plugins: [
        nodeExternalsPlugin({
          packagePath: pkgStructs.map(([_, { pkgDir }]) => path.resolve(pkgDir, 'package.json')),
          dependencies: true,
          peerDependencies: true,
          allowList: internals[mode]
        })
      ]
    }
  }

  const modeType = {
    esm: 'esm',
    cjs: 'cjs',
    iife: 'browser'
  } as const;

  for (const mode of formats && ['esm'] as const) {
    const config = getBaseEsbuildConfig(mode);
    const result = await esbuild(config);
    const buildStrust = {} as Record<string, {
      content: string,
      sourceMap?: string
    }>;
    for (const res of result.outputFiles) {
      const pkg = res.path.slice(1).replace(/\.js(\.map)?$/, '');
      buildStrust[pkg] = {
        content: res.text,
        sourceMap: result.outputFiles.find(s => s.path === `/${pkg}.js.map`).text
      }
    };
    for (const [pkg, { content, sourceMap: sourceCode }] of Object.entries(buildStrust)) {
      // writeFile(path.resolve(`./packages/${pkg}/dist/${modeType[mode]}/index.js`), content);
      const result = await transformAsync(content, {
        inputSourceMap: JSON.parse(sourceCode),
        sourceMaps: sourceMap
      })
      console.log(result.code)
    }
  }

}

function checkAllSizes(targets) {
  console.log();
  for (const target of targets) {
    checkSize(target);
  }
  console.log();
}

function checkSize(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);
  checkFileSize(`${pkgDir}/dist/${pkg.bundle}.min.js`);
}

async function checkFileSize(filePath) {
  const file = await fs.readFile(filePath);
  const minSize = (file.length / 1024).toFixed(2) + 'kb';
  const gzipped = await gzipSync(file);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  const compressed = compress(file);
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath)),
    )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`,
  );
}
