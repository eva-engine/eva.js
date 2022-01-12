import { build as esbuild } from "esbuild";
import { swcPlugin } from "esbuild-plugin-swc";
import { evaAlias } from "./plugins/eva-alias";
import { esbuildDecorators } from "esbuild-plugin-typescript-decorators";
import { NodeResolvePlugin } from "@esbuild-plugins/node-resolve";
import external from "@chialab/esbuild-plugin-external";
import EsmExternals from '@esbuild-plugins/esm-externals'
import { transform } from "@swc/core";

import { minify } from "terser";

import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";

(async () => {
  console.time('build');
  await build();
  console.timeEnd('build');
})();


async function build() {
  const result = await esbuild({
    entryPoints: ['./packages/eva.js/lib/index.ts'],
    sourcemap: false,
    outfile: './packages/eva.js/dist/EVA.esbuild.js',
    target: 'es2015',
    minify: false,
    bundle: true,
    tsconfig: './tsconfig.json',
    treeShaking: true,
    format: 'iife',
    globalName: 'EVA',
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
        ]
      }),
      // NodeResolvePlugin({
      //   extensions: ['.ts', '.js'],
      // })
      // evaAlias(),/

      // swcPlugin({
      //   configFile: './.swcrc',
      //   minify: true
      // }),
    ]
  });

  const result2 = await transform(result.outputFiles[0].text, {
    configFile: './.swcrc',
    swcrc: true,
  });

  writeFileSync('./packages/eva.js/dist/EVA.esbuild.js', result2.code)

  const result3 = await minify(result2.code, {
    ecma: 5,
    output: {
      wrap_iife: true,
      ecma: 5
    }
  })
  // console.log(result2)
  writeFileSync('./packages/eva.js/dist/EVA.esbuild.min.js', result3.code);

}