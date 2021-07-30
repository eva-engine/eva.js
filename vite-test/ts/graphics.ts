import { Game, GameObject, resource, RESOURCE_TYPE } from "../../packages/eva.js/lib";
import { RendererSystem } from "../../packages/plugin-renderer/lib";
import { GraphicsSystem, Graphics } from "../../packages/plugin-renderer-graphics/lib";

export const name = 'graphics';
export async function init(canvas) {

  const game = new Game({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      //@ts-ignore
      new GraphicsSystem(),
    ],
  });

  const outter = new GameObject('container', {
    position: {
      x: 225,
      y: 450,
    },
    size: {
      width: 300,
      height: 24,
    },
  });
  const progress = new GameObject('container', {
    position: {
      x: 3,
      y: 3,
    },
  });

  const outterGraphics = outter.addComponent(new Graphics());
  outterGraphics.graphics.beginFill(0xde3249, 1);
  outterGraphics.graphics.drawRoundedRect(0, 0, 300, 24, 12);
  outterGraphics.graphics.endFill();

  const progressGraphics = progress.addComponent(new Graphics());

  let i = 0;
  setInterval(() => {
    setProgress(i++);
  }, 100);

  outter.addChild(progress);

  game.scene.addChild(outter);

  function setProgress(progress) {
    if (progress > 100) return;
    const width = Math.max(12, (296 * progress) / 100);
    progressGraphics.graphics.clear();
    progressGraphics.graphics.beginFill(0x000000, 1);
    progressGraphics.graphics.drawRoundedRect(0, 0, width, 18, 9);
    progressGraphics.graphics.endFill();
  }
}