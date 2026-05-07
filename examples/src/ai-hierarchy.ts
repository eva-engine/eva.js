import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Sprite, SpriteSystem } from '@eva/plugin-renderer-sprite';
import { SpriteAnimation, SpriteAnimationSystem } from '@eva/plugin-renderer-sprite-animation';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { NinePatch, NinePatchSystem } from '@eva/plugin-renderer-nine-patch';
import { TilingSprite, TilingSpriteSystem } from '@eva/plugin-renderer-tiling-sprite';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';
import { Lottie, LottieSystem } from '@eva/plugin-renderer-lottie';
import { AISystem } from '@eva/plugin-ai';

export const name = 'ai-hierarchy';

resource.addResource([
  {
    name: 'bgImage',
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
    name: 'spriteAtlas',
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
  {
    name: 'fruitAnim',
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
  {
    name: 'panelRes',
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
  {
    name: 'tilingBg',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: 'https://gw.alicdn.com/tfs/TB1t7vtOvb2gK0jSZK9XXaEgFXa-300-431.png',
      },
    },
    preload: true,
  },
  {
    name: 'spineMonster',
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
  {
    name: 'lottieEffect',
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

/**
 * 复杂层级结构 Demo
 *
 * 层级关系:
 * scene
 * ├── header (容器)
 * │   ├── header-bg (Graphics 背景)
 * │   ├── title (Text 标题)
 * │   └── logo (Sprite 图标)
 * ├── main-content (容器)
 * │   ├── card-list (容器)
 * │   │   ├── card-1 (容器)
 * │   │   │   ├── card-1-bg (NinePatch 卡片背景)
 * │   │   │   ├── card-1-icon (Sprite 图标)
 * │   │   │   └── card-1-label (Text 标签)
 * │   │   ├── card-2 (容器)
 * │   │   │   ├── card-2-bg (NinePatch 卡片背景)
 * │   │   │   ├── card-2-anim (SpriteAnimation 动画)
 * │   │   │   └── card-2-label (Text 标签)
 * │   │   └── card-3 (容器)
 * │   │       ├── card-3-bg (NinePatch 卡片背景)
 * │   │       ├── card-3-img (Img 图片)
 * │   │       └── card-3-label (Text 标签)
 * │   └── sidebar (容器)
 * │       ├── sidebar-bg (TilingSprite 平铺背景)
 * │       └── sidebar-character (容器)
 * │           ├── character-spine (Spine 角色)
 * │           └── character-name (Text 名字)
 * └── footer (容器)
 *     ├── footer-bg (Graphics 背景)
 *     ├── progress-bar (容器)
 *     │   ├── progress-track (Graphics 轨道)
 *     │   └── progress-fill (Graphics 填充)
 *     └── effects-layer (容器)
 *         └── lottie-effect (Lottie 特效)
 */
export async function init(canvas) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundAlpha: 1,
        backgroundColor: '#0d1b2a',
      }),
      new TextSystem(),
      new ImgSystem(),
      new SpriteSystem(),
      new SpriteAnimationSystem(),
      new GraphicsSystem(),
      new NinePatchSystem(),
      new TilingSpriteSystem(),
      new SpineSystem(),
      new LottieSystem(),
      new AISystem({ debug: false }),
    ],
    autoStart: true,
    frameRate: 60,
  });

  game.scene.transform.size = { width: 750, height: 1000 };

  // ============================================================
  // HEADER (depth: 1)
  // ============================================================
  const header = new GameObject('header', {
    position: { x: 0, y: 0 },
    size: { width: 750, height: 100 },
    anchor: { x: 0, y: 0 },
  });
  game.scene.addChild(header);

  // header > header-bg (depth: 2)
  const headerBg = new GameObject('header-bg', {
    position: { x: 0, y: 0 },
    size: { width: 750, height: 100 },
    anchor: { x: 0, y: 0 },
  });
  const headerBgGraphics = headerBg.addComponent(new Graphics());
  headerBgGraphics.graphics.beginFill(0x1b263b, 1);
  headerBgGraphics.graphics.drawRect(0, 0, 750, 100);
  headerBgGraphics.graphics.endFill();
  header.addChild(headerBg);

  // header > title (depth: 2)
  const title = new GameObject('title', {
    position: { x: 80, y: 25 },
    size: { width: 400, height: 50 },
    anchor: { x: 0, y: 0 },
  });
  title.addComponent(
    new Text({
      text: 'Game Dashboard',
      style: {
        fontSize: 40,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#e0e1dd',
      },
    }),
  );
  header.addChild(title);

  // header > logo (depth: 2)
  const logo = new GameObject('logo', {
    position: { x: 15, y: 15 },
    size: { width: 60, height: 70 },
    anchor: { x: 0, y: 0 },
  });
  logo.addComponent(new Sprite({ resource: 'spriteAtlas', spriteName: 'symbol_1' }));
  header.addChild(logo);

  // ============================================================
  // MAIN CONTENT (depth: 1)
  // ============================================================
  const mainContent = new GameObject('main-content', {
    position: { x: 0, y: 110 },
    size: { width: 750, height: 680 },
    anchor: { x: 0, y: 0 },
  });
  game.scene.addChild(mainContent);

  // ============================================================
  // CARD LIST (depth: 2)
  // ============================================================
  const cardList = new GameObject('card-list', {
    position: { x: 20, y: 0 },
    size: { width: 480, height: 680 },
    anchor: { x: 0, y: 0 },
  });
  mainContent.addChild(cardList);

  // --- Card 1 (depth: 3) ---
  const card1 = new GameObject('card-1', {
    position: { x: 0, y: 0 },
    size: { width: 220, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  cardList.addChild(card1);

  // card-1 > bg (depth: 4)
  const card1Bg = new GameObject('card-1-bg', {
    position: { x: 0, y: 0 },
    size: { width: 220, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  card1Bg.addComponent(
    new NinePatch({
      resource: 'panelRes',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
    }),
  );
  card1.addChild(card1Bg);

  // card-1 > icon (depth: 4)
  const card1Icon = new GameObject('card-1-icon', {
    position: { x: 60, y: 20 },
    size: { width: 100, height: 120 },
    anchor: { x: 0, y: 0 },
  });
  card1Icon.addComponent(new Sprite({ resource: 'spriteAtlas', spriteName: 'symbol_2' }));
  card1.addChild(card1Icon);

  // card-1 > label (depth: 4)
  const card1Label = new GameObject('card-1-label', {
    position: { x: 50, y: 155 },
    size: { width: 120, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  card1Label.addComponent(
    new Text({
      text: 'Card One',
      style: { fontSize: 22, fontFamily: 'Arial', fill: '#ffffff' },
    }),
  );
  card1.addChild(card1Label);

  // --- Card 2 (depth: 3) ---
  const card2 = new GameObject('card-2', {
    position: { x: 240, y: 0 },
    size: { width: 220, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  cardList.addChild(card2);

  // card-2 > bg (depth: 4)
  const card2Bg = new GameObject('card-2-bg', {
    position: { x: 0, y: 0 },
    size: { width: 220, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  card2Bg.addComponent(
    new NinePatch({
      resource: 'panelRes',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
    }),
  );
  card2.addChild(card2Bg);

  // card-2 > anim (depth: 4)
  const card2Anim = new GameObject('card-2-anim', {
    position: { x: 40, y: 20 },
    size: { width: 140, height: 110 },
    anchor: { x: 0, y: 0 },
  });
  const anim = card2Anim.addComponent(
    new SpriteAnimation({
      resource: 'fruitAnim',
      speed: 100,
      autoPlay: true,
      forwards: true,
    }),
  );
  anim.play(4);
  card2.addChild(card2Anim);

  // card-2 > label (depth: 4)
  const card2Label = new GameObject('card-2-label', {
    position: { x: 40, y: 155 },
    size: { width: 140, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  card2Label.addComponent(
    new Text({
      text: 'Card Two',
      style: { fontSize: 22, fontFamily: 'Arial', fill: '#ffffff' },
    }),
  );
  card2.addChild(card2Label);

  // --- Card 3 (depth: 3) ---
  const card3 = new GameObject('card-3', {
    position: { x: 0, y: 220 },
    size: { width: 220, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  cardList.addChild(card3);

  // card-3 > bg (depth: 4)
  const card3Bg = new GameObject('card-3-bg', {
    position: { x: 0, y: 0 },
    size: { width: 220, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  card3Bg.addComponent(
    new NinePatch({
      resource: 'panelRes',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
    }),
  );
  card3.addChild(card3Bg);

  // card-3 > img (depth: 4)
  const card3Img = new GameObject('card-3-img', {
    position: { x: 30, y: 15 },
    size: { width: 160, height: 130 },
    anchor: { x: 0, y: 0 },
  });
  card3Img.addComponent(new Img({ resource: 'bgImage' }));
  card3.addChild(card3Img);

  // card-3 > label (depth: 4)
  const card3Label = new GameObject('card-3-label', {
    position: { x: 40, y: 155 },
    size: { width: 140, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  card3Label.addComponent(
    new Text({
      text: 'Card Three',
      style: { fontSize: 22, fontFamily: 'Arial', fill: '#ffffff' },
    }),
  );
  card3.addChild(card3Label);

  // ============================================================
  // SIDEBAR (depth: 2)
  // ============================================================
  const sidebar = new GameObject('sidebar', {
    position: { x: 520, y: 0 },
    size: { width: 210, height: 680 },
    anchor: { x: 0, y: 0 },
  });
  mainContent.addChild(sidebar);

  // sidebar > bg (depth: 3)
  const sidebarBg = new GameObject('sidebar-bg', {
    position: { x: 0, y: 0 },
    size: { width: 210, height: 680 },
    anchor: { x: 0, y: 0 },
  });
  sidebarBg.addComponent(
    new TilingSprite({
      resource: 'tilingBg',
      tileScale: { x: 0.2, y: 0.2 },
      tilePosition: { x: 0, y: 0 },
    }),
  );
  sidebar.addChild(sidebarBg);

  // sidebar > character container (depth: 3)
  const sidebarCharacter = new GameObject('sidebar-character', {
    position: { x: 10, y: 300 },
    size: { width: 190, height: 350 },
    anchor: { x: 0, y: 0 },
  });
  sidebar.addChild(sidebarCharacter);

  // sidebar > character > spine (depth: 4)
  const characterSpine = new GameObject('character-spine', {
    position: { x: 95, y: 200 },
    anchor: { x: 0, y: 0 },
    scale: { x: 0.25, y: 0.25 },
  });
  const spine = new Spine({ resource: 'spineMonster', animationName: 'idle' });
  characterSpine.addComponent(spine);
  spine.play('idle');
  sidebarCharacter.addChild(characterSpine);

  // sidebar > character > name tag (depth: 4)
  const characterName = new GameObject('character-name', {
    position: { x: 30, y: 300 },
    size: { width: 130, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  characterName.addComponent(
    new Text({
      text: 'Monster',
      style: { fontSize: 20, fontFamily: 'Arial', fill: '#ffd700', align: 'center' },
    }),
  );
  sidebarCharacter.addChild(characterName);

  // ============================================================
  // FOOTER (depth: 1)
  // ============================================================
  const footer = new GameObject('footer', {
    position: { x: 0, y: 800 },
    size: { width: 750, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  game.scene.addChild(footer);

  // footer > bg (depth: 2)
  const footerBg = new GameObject('footer-bg', {
    position: { x: 0, y: 0 },
    size: { width: 750, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  const footerBgGraphics = footerBg.addComponent(new Graphics());
  footerBgGraphics.graphics.beginFill(0x1b263b, 0.8);
  footerBgGraphics.graphics.drawRect(0, 0, 750, 200);
  footerBgGraphics.graphics.endFill();
  footer.addChild(footerBg);

  // footer > progress-bar container (depth: 2)
  const progressBar = new GameObject('progress-bar', {
    position: { x: 50, y: 30 },
    size: { width: 400, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  footer.addChild(progressBar);

  // progress-bar > track (depth: 3)
  const progressTrack = new GameObject('progress-track', {
    position: { x: 0, y: 0 },
    size: { width: 400, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  const trackGraphics = progressTrack.addComponent(new Graphics());
  trackGraphics.graphics.beginFill(0x415a77, 1);
  trackGraphics.graphics.drawRoundedRect(0, 0, 400, 30, 15);
  trackGraphics.graphics.endFill();
  progressBar.addChild(progressTrack);

  // progress-bar > fill (depth: 3)
  const progressFill = new GameObject('progress-fill', {
    position: { x: 3, y: 3 },
    size: { width: 250, height: 24 },
    anchor: { x: 0, y: 0 },
  });
  const fillGraphics = progressFill.addComponent(new Graphics());
  fillGraphics.graphics.beginFill(0x52b788, 1);
  fillGraphics.graphics.drawRoundedRect(0, 0, 250, 24, 12);
  fillGraphics.graphics.endFill();
  progressBar.addChild(progressFill);

  // footer > progress label (depth: 2)
  const progressLabel = new GameObject('progress-label', {
    position: { x: 470, y: 33 },
    size: { width: 100, height: 24 },
    anchor: { x: 0, y: 0 },
  });
  progressLabel.addComponent(
    new Text({
      text: '62%',
      style: { fontSize: 20, fontFamily: 'Arial', fill: '#52b788', fontWeight: 'bold' },
    }),
  );
  footer.addChild(progressLabel);

  // footer > effects-layer (depth: 2)
  const effectsLayer = new GameObject('effects-layer', {
    position: { x: 0, y: 80 },
    size: { width: 750, height: 120 },
    anchor: { x: 0, y: 0 },
  });
  footer.addChild(effectsLayer);

  // effects-layer > lottie (depth: 3)
  const lottieEffect = new GameObject('lottie-effect', {
    position: { x: 200, y: 0 },
    anchor: { x: 0, y: 0 },
    scale: { x: 0.3, y: 0.3 },
  });
  const lottie = new Lottie({ resource: 'lottieEffect' });
  lottie.play([], { repeats: 0, infinite: true });
  lottieEffect.addComponent(lottie);
  effectsLayer.addChild(lottieEffect);

  // effects-layer > status text (depth: 3)
  const statusText = new GameObject('status-text', {
    position: { x: 50, y: 50 },
    size: { width: 300, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  statusText.addComponent(
    new Text({
      text: 'Loading resources...',
      style: { fontSize: 18, fontFamily: 'Arial', fill: '#778da9' },
    }),
  );
  effectsLayer.addChild(statusText);
}
