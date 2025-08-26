import { resource } from '@eva/eva.js';

import { Assets } from 'pixi.js';
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

  const obj = { spineData: skeletonData, ref: 0, imageSrc: data.image.label };
  dataMap[name] = obj;
  return obj;
}

export const registryResource = pixiSpine => {
  resource.registerInstance('SPINE' as any, info => {
    return createSpineData(info.name, info.data, (info as any).scale, pixiSpine);
  });

  resource.registerDestroy('SPINE' as any, info => {
    if (info.instance) {
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

  data.ref++;
  return data.spineData;
}

export function clearCache() {
  dataMap = {};
}

export function releaseSpineData(res, imageSrc: string) {
  const resourceName = res.name;
  const data = dataMap[resourceName];
  if (!data) {
    return;
  }
  data.ref--;
  setTimeout(async () => {
    if (data.ref <= 0) {
      await Assets.unload([res.src.image.url, res.src.atlas.url, res.src.ske.url]);
      const resolver: any = Assets.resolver;
      delete resolver._assetMap[res.src.image.url];
      delete resolver._assetMap[res.src.atlas.url];
      delete resolver._assetMap[res.src.ske.url];
      delete resolver._resolverHash[res.src.image.url];
      delete resolver._resolverHash[res.src.atlas.url];
      delete resolver._resolverHash[res.src.ske.url];
      resource.destroy(resourceName);
      delete dataMap[resourceName];
    }
  }, 100);
}
