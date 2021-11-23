import inject from 'rollup-plugin-inject';
import modify from 'rollup-plugin-modify';
import fs from 'fs'

const packages = fs
  .readdirSync(path.resolve(__dirname, 'packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'));

const moduleName = '@eva/miniprogram-adapter';

function register(name) {
  return [moduleName, name];
}

const adapterArray = {
  window: 'windowAlias',
  atob: 'atob',
  devicePixelRatio: 'devicePixelRatio',
  document: 'documentAlias',
  Element: 'Element',
  Event: 'Event',
  EventTarget: 'EventTarget',
  HTMLCanvasElement: 'HTMLCanvasElement',
  HTMLElement: 'HTMLElement',
  HTMLMediaElement: 'HTMLMediaElement',
  HTMLVideoElement: 'HTMLVideoElement',
  Image: 'Image',
  navigator: 'navigator',
  Node: 'Node',
  requestAnimationFrame: 'requestAnimationFrame',
  cancelAnimationFrame: 'cancelAnimationFrame',
  screen: 'screen',
  XMLHttpRequest: 'XMLHttpRequestAlias',
  performance: 'performance',
  HTMLImageElement: 'Image',
};
const adapterVars = {};

for (let name in adapterArray) {
  adapterVars[name] = register(adapterArray[name]);
}

export const miniprogramPlugins1 = [
  modify({
    find: /@eva\/([\w\.\/-]*)/g,
    replace: (match, moduleName) => {
      if(moduleName === 'miniprogram-pixi' || moduleName === 'miniprogram-adapter') {
        return `@eva/${moduleName}`;
      }
      if (moduleName.indexOf('/dist/miniprogram') > -1) {
        return `@eva/${moduleName}`;
      }
      if (packages.indexOf(moduleName) > -1) {
        return `@eva/${moduleName}/dist/miniprogram`;
      }
      return `@eva/${moduleName}`;
    },
  }),
  modify({
    find: /pixi\.js/g,
    replace: `@eva/miniprogram-pixi`,
  })
];

export const miniprogramPlugins2 = [
  inject(adapterVars)
]
