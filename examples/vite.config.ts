import { resolve } from "path";
import { defineConfig } from 'vite';
import { readdirSync, statSync, existsSync } from 'fs';

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

// 在 teva monorepo 下 @eva/inspector-decorator 会被 workspace 解析到
// libs/inspector-decorators(其 dist 通常未构建),强制指向源码以保证
// examples 在 monorepo 与独立运行下都可用。
const tevaInspectorSrc = resolve(__dirname, '../../inspector-decorators/src/index.ts');
if (existsSync(tevaInspectorSrc)) {
  alias.push({
    find: /^@eva\/inspector-decorator$/,
    replacement: tevaInspectorSrc,
  });
}

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
    exclude: ['pixi-spine', 'pixi-spine36', 'poly-decomp']
  },
});
