import { Plugin } from "esbuild";
import { resolve } from "path";

export const evaAlias = (): Plugin => {
  return {
    name: 'eva-alias',

    setup(build) {
      build.onResolve({ filter: new RegExp(`^@eva\/(.+)$`) }, (args) => {
        const pkg = args.path.split('/')[1];
        console.log(pkg)
        return {
          path: resolve(`./packages/${pkg}/lib/index.ts`)
        }
      });

    }
  };
}