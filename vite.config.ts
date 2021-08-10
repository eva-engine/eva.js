import { resolve } from 'path';
import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'fs';

var alias = [];
var paths = readdirSync('./packages');
paths.forEach(path => {
  if (statSync(resolve('./packages', path)).isDirectory()) {
    alias.push({
      find: `@eva/${path}`,
      replacement: resolve(__dirname, `./packages/${path}/lib`)
    })
  }
});

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
    alias
  },
});
