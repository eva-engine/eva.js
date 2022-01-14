import { build as esbuild } from "esbuild";
import { swcPlugin } from "./plugins/swc";
import { evaAlias } from "./plugins/eva-alias";
import { esbuildDecorators } from "esbuild-plugin-typescript-decorators";
import { NodeResolvePlugin } from "@esbuild-plugins/node-resolve";
import external from "@chialab/esbuild-plugin-external";
import EsmExternals from '@esbuild-plugins/esm-externals'
import { transform, bundle, Compiler } from "@swc/core";
import { transformAsync } from "@babel/core";

import { minify } from "terser";

import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";


const pkg = 'eva.js';

const entry = `./packages/${pkg}/lib/index.ts`;
const preoutput = `./packages/${pkg}/dist/${pkg}.esbuild.raw.js`
const output = `./packages/${pkg}/dist/${pkg}.esbuild.js`
const outputes5 = `./packages/${pkg}/dist/${pkg}.esbuild.es5.js`
const minoutput = `./packages/${pkg}/dist/${pkg}.esbuild.min.js`;


(async () => {
  console.time('build');
  await build();
  console.timeEnd('build');
})();

async function build() {
  console.time('esbuild');
  const result = await esbuild({
    entryPoints: [entry],
    sourcemap: false,
    target: 'es2015',
    minify: false,
    define: {
      __TEST__: 'false',
      __DEV__: `${process.env.NODE_ENV === 'development'}`,
      __VERSION__: `'0.0.0'`,
    },
    bundle: true,
    tsconfig: './tsconfig.json',
    treeShaking: true,
    format: 'esm',
    write: false,
    plugins: [

      EsmExternals({

        externals: [
          // "@eva/inspector-decorator",
          // "eventemitter3",
          // "lodash-es",
          // "mini-signals",
          // "parse-uri",
          // "resource-loader",
          // "sprite-timeline",
          "pixi.js"
        ]
      }),
    ]
  });
  console.timeEnd('esbuild');

  const temp = result.outputFiles[0].text;

  writeFileSync(preoutput, temp);

  console.time('swc');
  const result2 = await transform(temp, {
    configFile: './.swcrc',
    swcrc: true,
    minify: false,
    isModule: true,
    module: {
      type: 'es6',
      noInterop: false
    }
  });
  console.timeEnd('swc');

  writeFileSync(output, result2.code);

  console.time('esbuild2');
  const result3 = await esbuild({
    entryPoints: [output],
    target: 'es5',
    globalName: 'EVA',
    format: 'iife',
    write: false,
    bundle: true,
    plugins: [
      EsmExternals({
        externals: [
          "pixi.js"
        ]
      }),
    ]
  })
  console.timeEnd('esbuild2');
  writeFileSync(outputes5, result2.code);


  console.time('terser');
  const result4 = await minify(result3.outputFiles[0].text, {
    ecma: 5,
    output: {
      wrap_iife: false,
      ecma: 5,
    },

  });
  console.timeEnd('terser')
  writeFileSync(minoutput, result4.code);

  // console.log(`${result3.code.length / 1024}`.slice(0, 6), 'KB');

}