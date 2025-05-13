import { Texture, Assets } from 'pixi.js';

let texCache: { [name: string]: { tex: Texture; count: number } } = {};

interface CacheData {
  image?: any;
}

function cacheImage(data: CacheData) {
  const oldImg = data.image;

  return {
    tex: oldImg instanceof Texture ? oldImg : Texture.from(oldImg),
    count: 0,
  };
}

export function retainTexture(name: string, data: CacheData) {
  let cache = texCache[name];
  if (!cache) {
    cache = cacheImage(data);
    texCache[name] = cache;
  }
  cache.count++;
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

export async function releaseTexture(imageSrc: string) {
  if (!imageSrc) return;
  // 如果要取消上一个timeout，注意count--不要写timeout里面
  const cache = texCache[imageSrc];
  if (cache) {
    cache.count--;
    if (cache.count <= 0) {
      if (cache.tex) {
        await Assets.unload(imageSrc);
        cache.tex.destroy(true);
        cache.tex = null;
      }
      delete texCache[imageSrc];
    }
  }
}
