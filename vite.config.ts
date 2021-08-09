import {resolve} from 'path';
import {defineConfig} from 'vite';
export default defineConfig({
  server: {
    open: true,
    port: 8083,
    host: '0.0.0.0',
  },
  publicDir: './public/',
  base: './',
  root: './examples',
  resolve: {
    alias: [
      {
        find: /@eva\/([pmer])(.*)/,
        replacement: resolve(__dirname, './packages/$1$2/lib'),
      },
    ],
  },
});
