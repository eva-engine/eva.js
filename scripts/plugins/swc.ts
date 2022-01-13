import { promises } from "fs";
import { transform, Options } from "@swc/core";
const { readFile } = promises;
import { resolve } from "path";

export function swcPlugin(options = {}) {
  return {
    name: 'esbuild:swc',
    setup(builder) {
      builder.onResolve({ filter: /\.([tj]s)$/ }, (args) => {
        const fullPath = resolve(args.resolveDir, args.path);
        return {
          path: fullPath
        };
      });
      builder.onLoad({ filter: /\.([tj]s)$/ }, async (args) => {
        const code = await readFile(args.path, 'utf8');
        const initialOptions: Options = {
          jsc: {
            parser: {
              syntax: 'typescript',
              decorators: true
            },
            target: 'es5',
          },
          configFile: './.swcrc',

          minify: true,
          filename: args.path,
          sourceMaps: false,
          sourceFileName: args.path,
          isModule: true,

          module: {
            type: "es6",
            noInterop: true
          },

        };
        const result = await transform(code, initialOptions);
        // if (args.path.endsWith('Progress.ts')) {
        //   console.log(result.code.length)
        //   console.log(result.code)
        // }
        return {
          contents: result.code,
          loader: 'js'
        };
      });
    }
  };
}