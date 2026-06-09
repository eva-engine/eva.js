import { resource } from '@eva/eva.js';

let dataMap: any = {};

function resolveImageSrc(image: any): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  // PixiJS v8 Texture / TextureSource shapes vary depending on loader; try every
  // common label/url accessor before bailing out.
  return (
    image.label ||
    image.source?.label ||
    image.source?.resource?.src ||
    image.source?._sourceOrigin ||
    image.src ||
    image.baseTexture?.cacheId ||
    ''
  );
}

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

  const obj = { spineData: skeletonData, ref: 0, imageSrc: resolveImageSrc(data.image) };
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

export function releaseSpineData(res, _imageSrc: string) {
  const resourceName = res.name;
  const data = dataMap[resourceName];
  if (!data) {
    return;
  }
  data.ref--;
  setTimeout(async () => {
    if (data.ref <= 0) {
      resource.destroy(resourceName);
      delete dataMap[resourceName];
    }
  }, 100);
}
