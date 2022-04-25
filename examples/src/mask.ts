import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
import "@eva/plugin-renderer-sprite";
import { Mask, MaskSystem, MASK_TYPE } from "@eva/plugin-renderer-mask";
export const name = 'mask';
export async function init(canvas) {

  resource.addResource([
    {
      name: 'heart',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: '//gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png',
        },
      },
      preload: false,
    },
    {
      name: 'tag',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: '//gw.alicdn.com/mt/TB1KcVte4n1gK0jSZKPXXXvUXXa-150-50.png',
        },
        json: {
          type: 'json',
          url: '//gw.alicdn.com/mt/TB1d4lse4D1gK0jSZFsXXbldVXa.json',
        },
      },
      preload: true,
    },
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
      new MaskSystem(),
    ],
  });

  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  const image = new GameObject('image', {
    size: { width: 200, height: 200 },
  });
  image.addComponent(
    new Img({
      resource: 'heart',
    }),
  );
  game.scene.addChild(image);
  const m = image.addComponent(
    new Mask({
      type: MASK_TYPE.Circle,
      style: {
        x: 100,
        y: 100,
        radius: 70,
      },
    }),
  );

  const image1 = new GameObject('image', {
    size: { width: 200, height: 200 },
    position: { x: 400, y: 300 },
  });
  image1.addComponent(
    new Img({
      resource: 'heart',
    }),
  );

  image1.addComponent(
    new Mask({
      type: MASK_TYPE.Img,
      style: {
        width: 100,
        height: 100,
        x: 20,
        y: 20,
      },
      resource: 'heart',
    }),
  );
  game.scene.addChild(image1);

  setTimeout(()=>{
    m.type = MASK_TYPE.Rect,
    m.style = {
      x: 20,
      y: 20,
      width: 100,
      height: 100,
    }
    
    // m.resource= 'tag'
    // m.spriteName= 'task.png'
  }, 1000)

  const image2 = new GameObject('image', {
    size: { width: 200, height: 200 },
    position: { x: 100, y: 400 },
  });
  image2.addComponent(
    new Img({
      resource: 'heart',
    }),
  );

  image2.addComponent(
    new Mask({
      type: MASK_TYPE.Sprite,
      style: {
        width: 100,
        height: 100,
        x: 20,
        y: 20,
      },
      resource: 'tag',
      spriteName: 'task.png',
    }),
  );
  game.scene.addChild(image2);


  // @ts-ignore
  window.test = () => {
    setTimeout(() => {
      image2.removeComponent(Mask)
      setTimeout(() => {
        image2.removeComponent(Mask)
        setTimeout(() => {
          image2.addComponent(
            new Mask({
              type: MASK_TYPE.Sprite,
              style: {
                width: 100,
                height: 100,
                x: 20,
                y: 20,
              },
              resource: 'tag',
              spriteName: 'task.png',
            }),
          );
          console.log(123)
        }, 1000)
        console.log(1233)
      }, 1000)
      console.log(1223)
    }, 1000)
  }
}