import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Sprite, SpriteSystem } from '@eva/plugin-renderer-sprite';
import { SpriteAnimation, SpriteAnimationSystem } from '@eva/plugin-renderer-sprite-animation';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { NinePatch, NinePatchSystem } from '@eva/plugin-renderer-nine-patch';
import { TilingSprite, TilingSpriteSystem } from '@eva/plugin-renderer-tiling-sprite';
import { PerspectiveMesh, MeshSystem } from '@eva/plugin-renderer-mesh';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';
import { Lottie, LottieSystem } from '@eva/plugin-renderer-lottie';
import { AISystem } from '@eva/plugin-ai';

export const name = 'ai';

resource.addResource([
  // Image resource
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
  // Sprite atlas resource
  {
    name: 'spriteName',
    type: RESOURCE_TYPE.SPRITE,
    src: {
      image: {
        type: 'png',
        url: '/sprite/symbol.png',
      },
      json: {
        type: 'json',
        url: '/sprite/symbol.json',
      },
    },
    preload: true,
  },
  // Sprite animation resource
  {
    name: 'fruit',
    type: RESOURCE_TYPE.SPRITE_ANIMATION,
    src: {
      image: {
        type: 'png',
        url: 'https://gw.alicdn.com/bao/uploaded/TB15pMkkrsTMeJjSszhXXcGCFXa-377-1070.png',
      },
      json: {
        type: 'json',
        url: 'https://gw.alicdn.com/mt/TB1qCvumsyYBuNkSnfoXXcWgVXa.json',
      },
    },
    preload: true,
  },
  // NinePatch resource
  {
    name: 'ninePatchRes',
    type: RESOURCE_TYPE.SPRITE,
    src: {
      image: {
        type: 'png',
        url: 'https://dev.g.alicdn.com/eva/hd25-spring-assets/0.0.5/gohome/tp.png',
      },
      json: {
        type: 'json',
        url: 'https://dev.g.alicdn.com/eva/hd25-spring-assets/0.0.5/gohome/tp.json',
      },
    },
    preload: true,
  },
  // TilingSprite resource
  {
    name: 'tilingImg',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: 'https://gw.alicdn.com/tfs/TB1t7vtOvb2gK0jSZK9XXaEgFXa-300-431.png',
      },
    },
    preload: true,
  },
  // Spine resource
  {
    name: 'spineAnim',
    type: RESOURCE_TYPE.SPINE,
    src: {
      ske: {
        type: 'ske',
        url: 'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/nianmonster/spine42/Monster.skel',
      },
      atlas: {
        type: 'atlas',
        url: 'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/nianmonster/spine42/Monster.atlas',
      },
      image: {
        type: 'png',
        url: 'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/nianmonster/spine42/Monster.png',
      },
    },
    preload: true,
  },
  // Lottie resource
  {
    name: 'lottieAnim',
    //@ts-ignore
    type: 'LOTTIE',
    src: {
      json: {
        type: 'json',
        url: 'https://gw.alipayobjects.com/os/bmw-prod/61d9cc77-12de-47a7-b6e5-06c836ce7083.json',
      },
    },
  },
]);

resource.preload();

export async function init(canvas) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundAlpha: 1,
        backgroundColor: '#1a1a2e',
      }),
      new TextSystem(),
      new ImgSystem(),
      new SpriteSystem(),
      new SpriteAnimationSystem(),
      new GraphicsSystem(),
      new NinePatchSystem(),
      new TilingSpriteSystem(),
      new MeshSystem(),
      new SpineSystem(),
      new LottieSystem(),
      new AISystem({ debug: true }),
    ],
    autoStart: true,
    frameRate: 60,
  });

  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  // ====== Row 1: Text ======
  const textObj = new GameObject('title-text', {
    position: { x: 130, y: 20 },
    size: { width: 500, height: 60 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  textObj.addComponent(
    new Text({
      text: 'AI Plugin Demo - All Renderers',
      style: {
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
    }),
  );
  game.scene.addChild(textObj);

  // ====== Row 2: Img + Sprite + SpriteAnimation ======

  // Image
  const imgObj = new GameObject('demo-image', {
    position: { x: 20, y: 90 },
    size: { width: 150, height: 260 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  imgObj.addComponent(new Img({ resource: 'imageName' }));
  game.scene.addChild(imgObj);

  // Sprite (from atlas)
  const spriteObj = new GameObject('sprite-symbol', {
    position: { x: 200, y: 90 },
    size: { width: 150, height: 183 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  spriteObj.addComponent(new Sprite({ resource: 'spriteName', spriteName: 'symbol_1' }));
  game.scene.addChild(spriteObj);

  // SpriteAnimation (frame animation)
  const frameAnimObj = new GameObject('frame-animation', {
    position: { x: 380, y: 90 },
    size: { width: 180, height: 120 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  const frameAnim = frameAnimObj.addComponent(
    new SpriteAnimation({
      resource: 'fruit',
      speed: 100,
      autoPlay: true,
      forwards: true,
    }),
  );
  frameAnim.play(4);
  game.scene.addChild(frameAnimObj);

  // ====== Row 3: Graphics + NinePatch + TilingSprite ======

  // Graphics - progress bar
  const graphicsObj = new GameObject('graphics-progress', {
    position: { x: 20, y: 380 },
    size: { width: 200, height: 24 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  const graphics = graphicsObj.addComponent(new Graphics());
  graphics.graphics.beginFill(0xde3249, 1);
  graphics.graphics.drawRoundedRect(0, 0, 200, 24, 12);
  graphics.graphics.endFill();
  game.scene.addChild(graphicsObj);

  // Graphics - circle
  const circleObj = new GameObject('graphics-circle', {
    position: { x: 80, y: 420 },
    size: { width: 60, height: 60 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  const circleGraphics = circleObj.addComponent(new Graphics());
  circleGraphics.graphics.beginFill(0x4fc3f7, 1);
  circleGraphics.graphics.drawCircle(30, 30, 30);
  circleGraphics.graphics.endFill();
  game.scene.addChild(circleObj);

  // NinePatch - panel
  const ninePatchObj = new GameObject('nine-patch-panel', {
    position: { x: 250, y: 370 },
    size: { width: 220, height: 110 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  ninePatchObj.addComponent(
    new NinePatch({
      resource: 'ninePatchRes',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
    }),
  );
  game.scene.addChild(ninePatchObj);

  // TilingSprite - tiled background
  const tilingObj = new GameObject('tiling-background', {
    position: { x: 500, y: 370 },
    size: { width: 220, height: 110 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  tilingObj.addComponent(
    new TilingSprite({
      resource: 'tilingImg',
      tileScale: { x: 0.3, y: 0.3 },
      tilePosition: { x: 0, y: 0 },
    }),
  );
  game.scene.addChild(tilingObj);

  // ====== Row 4: Mesh + Spine + Lottie ======

  // Mesh - perspective transform
  const meshObj = new GameObject('mesh-perspective', {
    position: { x: 20, y: 520 },
    size: { width: 150, height: 200 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
  });
  meshObj.addComponent(
    new PerspectiveMesh({
      resource: 'imageName',
      verticesX: 2,
      verticesY: 2,
    }),
  );
  game.scene.addChild(meshObj);

  // Spine
  const spineObj = new GameObject('spine-monster', {
    position: { x: 350, y: 750 },
    anchor: { x: 0, y: 0 },
    scale: { x: 0.3, y: 0.3 },
  });
  const spine = new Spine({ resource: 'spineAnim', animationName: 'idle' });
  spineObj.addComponent(spine);
  spine.play('idle');
  game.scene.addChild(spineObj);

  // Lottie
  const lottieObj = new GameObject('lottie-halo', {
    position: { x: 500, y: 520 },
    anchor: { x: 0, y: 0 },
  });
  const lottie = new Lottie({ resource: 'lottieAnim' });
  lottie.play([], { repeats: 0, infinite: true });
  lottieObj.addComponent(lottie);
  game.scene.addChild(lottieObj);
}
