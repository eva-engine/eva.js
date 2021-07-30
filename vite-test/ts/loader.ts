import { LOAD_EVENT, resource, RESOURCE_TYPE } from "../../packages/eva.js/lib"

export const name = 'loader';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'imageName',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
        },
      },
      preload: true,
    },
    {
      name: 'error',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'aaa.jpg',
        },
      },
      preload: true,
    },
    {
      name: 'imgData',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'data',
          data: new Image(),
        },
      },
      preload: true,
    },
    {
      name: 'jsonData',
      type: 'xxxx',
      src: {
        json: {
          type: 'data',
          data: { a: 1, b: 2 },
        },
      },
      preload: true,
    },
    {
      name: 'jsonImageData',
      type: 'xxxx',
      src: {
        json: {
          type: 'data',
          data: { a: 1, b: 2 },
        },
        image: {
          type: 'data',
          data: new Image(),
        },
      },
      preload: true,
    },
    {
      name: 'anim',
      type: RESOURCE_TYPE.SPINE,
      src: {
        ske: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/b5fdf74313d5ff2609ab82f6b6fd83e6.json',
        },
        atlas: {
          type: 'atlas',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/b8597f298a5d6fe47095d43ef03210d4.atlas',
        },
        image: {
          type: 'png',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/TB1YHC8Vxz1gK0jSZSgXXavwpXa-711-711.png',
        },
      },
      preload: true,
    },
    {
      name: 'mix',
      type: RESOURCE_TYPE.SPINE,
      src: {
        ske: {
          type: 'data',
          data: { a: 1, b: 2 },
        },
        atlas: {
          type: 'atlas',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/b8597f298a5d6fe47095d43ef03210d4.atlas',
        },
        image: {
          type: 'png',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/TB1YHC8Vxz1gK0jSZSgXXavwpXa-711-711.png',
        },
      },
      preload: true,
    },
  ]);

  resource.registerInstance('SPINE', async res => {
    console.log(res, 999);
    await (() => new Promise(r => setTimeout(r, 2000)))();
  });

  resource.on(LOAD_EVENT.START, e => {
    console.log('start', e);
  }); // 开始loader
  resource.on(LOAD_EVENT.PROGRESS, e => {
    console.log('progress', e);
  }); // 加载进度更新
  resource.on(LOAD_EVENT.LOADED, e => {
    console.log('LOADED', e);
  }); // 某文件加载成功
  resource.on(LOAD_EVENT.COMPLETE, e => {
    console.log('COMPLETE', e);
  }); // 加载进度更新
  resource.on(LOAD_EVENT.ERROR, e => {
    console.log('error', e);
  }); // 某文件加载失败
  resource.preload();
}