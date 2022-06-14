import { resource } from '@eva/eva.js';
import { cleanTextures, getTexture, releaseTexture, retainTexture } from './TexCache';
let dataMap: any = {};

function createSpineData(name, data, scale, pixiSpine) {
  let spineData: any = null;
  const img = getTexture(data.image.src, data);
  // @ts-ignore
  new pixiSpine.core.TextureAtlas(
    (data as any).atlas,
    // @ts-ignore
    (line, callback) => {
      callback(img.baseTexture);
    },
    spineAtlas => {
      if (spineAtlas) {
        // @ts-ignore
        const attachmentLoader = new pixiSpine.core.AtlasAttachmentLoader(spineAtlas);
        // @ts-ignore
        const spineJsonParser = new pixiSpine.core.SkeletonJson(attachmentLoader);
        if (scale) {
          spineJsonParser.scale = scale;
        }
        spineData = spineJsonParser.readSkeletonData(data.ske);
      }
    },
  );
  const obj = { spineData, ref: 0, imageSrc: data.image.src };
  dataMap[name] = obj;
  return obj;
}

export const registryResource = (pixiSpine) => {

  resource.registerInstance('SPINE' as any, info => {
    return createSpineData(info.name, info.data, (info as any).scale, pixiSpine);
  });

  resource.registerDestroy('SPINE' as any, info => {
    if (info.instance) {
      // if (info.instance.img) {
      // 用true，baseTexture的缓存和webgl的绑定一起删除
      // info.instance.img.destroy(true);

      // }
      releaseTexture(info.data.image.src as string);
      info.instance = null;
    }
  });
}

export default async function getSpineData(res, pixiSpine) {
  let data = dataMap[res.name];
  if (!data) {
    if (res.complete) {
      data = createSpineData(res.name, res.data, (res as any).scale, pixiSpine);
    } else if (!data) {
      return;
    }
  }

  retainTexture(res.data.image.src, res.data);

  data.ref++;
  return data.spineData;
}

export function clearCache() {
  cleanTextures();
  dataMap = {};
}

export function releaseSpineData(resourceName, imageSrc) {
  const data = dataMap[resourceName];
  if (!data) {
    return;
  }
  data.ref--;
  if (data.ref <= 0) {
    releaseTexture(imageSrc);
    delete dataMap[resourceName];
  }
}
