import { build as esbuild } from "esbuild";
import { swcPlugin } from "esbuild-plugin-swc";
import { evaAlias } from "./plugins/eva-alias";
import { esbuildDecorators } from "esbuild-plugin-typescript-decorators";
import { NodeResolvePlugin } from "@esbuild-plugins/node-resolve";
import { resolve } from "path";

(async () => {
  console.time('build');
  await build();
  console.timeEnd('build');
})();


async function build() {
  const result = await esbuild({
    entryPoints: ['./packages/eva.js/lib/index.ts'],
    sourcemap: true,
    outfile: './packages/eva.js/dist/EVA.js',
    target: 'es2015',
    minify: true,
    bundle: true,
    tsconfig: './tsconfig.json',
    plugins: [
      NodeResolvePlugin({
        extensions: ['.ts', '.js']
      }),
      // evaAlias(),/
      // swcPlugin({
      //   configFile: './.swcrc'
      // }),
    ]
  });
  console.log(result)

}