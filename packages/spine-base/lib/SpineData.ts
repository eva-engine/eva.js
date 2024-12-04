import { resource } from '@eva/eva.js';
import { cleanTextures, releaseTexture, retainTexture } from './TexCache';
let dataMap: any = {};

function createSpineData(name, data, scale, pixiSpine) {
  const skeletonAsset = data.ske;
  const atlasAsset = data.atlas;
  const attachmentLoader = new pixiSpine.AtlasAttachmentLoader(atlasAsset);
  const parser =
    skeletonAsset instanceof Uint8Array
      ? new pixiSpine.SkeletonBinary(attachmentLoader)
      : new pixiSpine.SkeletonJson(attachmentLoader);

  parser.scale = scale || 1;
  const skeletonData = parser.readSkeletonData(skeletonAsset);

  dataMap[name] = skeletonData;
  const obj = { spineData: skeletonData, ref: 0, imageSrc: data.image.label };
  return obj;
}

export const registryResource = pixiSpine => {
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
};

export default async function getSpineData(res, scale, pixiSpine) {
  let data = dataMap[res.name];
  if (!data) {
    if (res.complete) {
      data = createSpineData(res.name, res.data, scale, pixiSpine);
    } else if (!data) {
      return;
    }
  }

  retainTexture(res.data.image.label, res.data);

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
