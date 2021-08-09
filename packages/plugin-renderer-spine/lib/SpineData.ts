import { resource } from '@eva/eva.js';
import pixispine from './pixi-spine.js';
import { cleanTextures, getTexture, releaseTexture, retainTexture } from './TexCache';
let dataMap: any = {};

function createSpineData(name, imgName, data, scale) {
  let spineData: any = null;
  const img = getTexture(imgName, data); // Texture.from(data.image);
  // const img = Texture.from(imgName,data.image);
  // @ts-ignore
  new pixispine.core.TextureAtlas(
    (data as any).atlas,
    // @ts-ignore
    (line, callback) => {
      callback(img.baseTexture);
    },
    spineAtlas => {
      if (spineAtlas) {
        // @ts-ignore
        const attachmentLoader = new pixispine.core.AtlasAttachmentLoader(spineAtlas);
        // @ts-ignore
        const spineJsonParser = new pixispine.core.SkeletonJson(attachmentLoader);
        if (scale) {
          spineJsonParser.scale = scale;
        }
        spineData = spineJsonParser.readSkeletonData(data.ske);
      }
    },
  );
  const obj = { spineData, ref: 0, imgName: imgName };
  dataMap[name] = obj;
  return obj;
}
resource.registerInstance('SPINE' as any, info => {
  return createSpineData(info.name, info.name, info.data, (info as any).scale);
});

resource.registerDestroy('SPINE' as any, info => {
  if (info.instance) {
    // if (info.instance.img) {
    // 用true，baseTexture的缓存和webgl的绑定一起删除
    // info.instance.img.destroy(true);

    // }
    releaseTexture(info.name as string);
    info.instance = null;
  }
});

export default async function getSpineData(name: string) {
  // const res = await resource.getResource(name);
  // if (!res.instance) {
  //   console.log(`加载资源${name}失败`);
  //   return;
  // }
  // retainTexture(res.name as string, res.data.image);
  // return res.instance.spineData;
  const res = await resource.getResource(name);
  let data = dataMap[name];
  if (!data) {
    if (res.complete) {
      data = createSpineData(name, res.name, res.data, (res as any).scale);
    } else if (!data) {
      return;
    }
  }

  retainTexture(res.name as string, res.data);

  data.ref++;
  return data.spineData;
}

export function clearCache() {
  cleanTextures();
  dataMap = {};
}

export function releaseSpineData(name) {
  // const res = await resource.getResource(name);
  // if (!res) {
  //   return;
  // }
  // if (!res.instance) {
  //   console.log(`释放资源${name}失败`);
  //   return;
  // }
  // releaseTexture(res.name as string);
  const data = dataMap[name];
  if (!data) {
    return;
  }
  data.ref--;
  if (data.ref <= 0) {
    releaseTexture(data.imgName as string);
    delete dataMap[name];
    resource.destroy(name);
  }
}
