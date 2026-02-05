import { resolve } from "path";
import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'fs';

var alias = [];
var paths = readdirSync('./packages');
paths.forEach(path => {
  if (statSync(resolve('./packages', path)).isDirectory()) {
    alias.push({
      find: `@eva/${path}`,
      replacement: resolve(__dirname, `../packages/${path}/lib`)
    })
  }
});

// Add pixi-spine aliases (internal project files, not npm packages)
alias.push({
  find: 'pixi-spine',
  replacement: resolve(__dirname, '../packages/plugin-renderer-spine/lib/pixi-spine.js')
});
alias.push({
  find: 'pixi-spine36',
  replacement: resolve(__dirname, '../packages/plugin-renderer-spine36/lib/pixi-spine.js')
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
  optimizeDeps: {
    exclude: ['pixi-spine', 'pixi-spine36']
  },
});
