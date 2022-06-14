import { RendererSystem } from "@eva/plugin-renderer";
import { Game, GameObject, RESOURCE_TYPE, resource } from "@eva/eva.js"
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
export const name = 'gameStart';
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
  ]);
  const game = new Game({
    // autoStart: false,
    frameRate: 45,
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
    ],
  });



  const image = new GameObject('image', {
    size: { width: 750, height: 1319 },
    origin: { x: 0, y: 0 },
    position: {
      x: 0,
      y: -319,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });
  window.game = game

  let start = performance.now()
  console.log(game.ticker.time.currentTime, 'add')
  game.ticker.setTimeout(() => {
    console.log(game.ticker.time.currentTime, 'begin')
    console.log(performance.now() - start,3)
    
    image.addComponent(
      new Img({
        resource: 'imageName',
      }),
    );
  }, 1000)


  // game.ticker.setTimeout(() => {
  //   console.log(game.ticker.time.frameCount)
  //   console.log(performance.now() - start,1)
  // }, 2890)

  // game.ticker.setTimeout(() => {
  //   console.log(game.ticker.time.frameCount)
  //   console.log(performance.now() - start, 2)
  // }, 2990)

  game.scene.addChild(image);

  // setTimeout(()=>{
  //     game.start()
  // }, 3000)
}