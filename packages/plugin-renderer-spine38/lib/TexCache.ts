import {Texture} from 'pixi.js';

let texCache: {[name: string]: {tex: Texture; count: number}} = {};

function cacheImage(data: any) {
  const oldImg = data.image;
  const newImg = data.image.cloneNode();
  // newImg.src = oldImg.src;
  data.image = newImg;

  return {
    tex: Texture.from(oldImg),
    count: 0,
  };
}

export function retainTexture(name: string, data: any) {
  let cache = texCache[name];
  if (!cache) {
    cache = cacheImage(data);
    texCache[name] = cache;
  }
  cache.count++;
  return cache.tex;
}

export function getTexture(name: string, data: any) {
  let cache = texCache[name];
  if (!cache) {
    cache = cacheImage(data);
    texCache[name] = cache;
  }
  return cache.tex;
}

export function cleanTextures() {
  for (let k in texCache) {
    let cache = texCache[k];
    if (cache && cache.tex) {
      cache.tex.destroy(true);
    }
  }
  texCache = {};
}

export function releaseTexture(name: string) {
  // 如果要取消上一个timeout，注意count--不要写timeout里面
  setTimeout(() => {
    // 延迟销毁，避免快速重用
    const cache = texCache[name];
    if (cache) {
      cache.count--;
      if (cache.count <= 0) {
        if (cache.tex) {
          cache.tex.destroy(true);
          cache.tex = null;
        }
        delete texCache[name];
      }
    }
  }, 100);
}
