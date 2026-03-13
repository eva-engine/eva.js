import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem, RENDERER_TYPE } from '@eva/plugin-renderer';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { Event, EventSystem } from '@eva/plugin-renderer-event';
import { Transition, TransitionSystem } from '@eva/plugin-transition';
import { SpriteAnimationSystem, SpriteAnimation } from '@eva/plugin-renderer-sprite-animation';
import { Render, RenderSystem } from '@eva/plugin-renderer-render';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine36';

export const name = 'canvas';
export async function init(canvas: HTMLCanvasElement) {
  resource.addResource([
    {
      name: 'heart',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png',
        },
      },
      preload: true,
    },
    {
      name: 'test-img',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'webp',
          url: 'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
        },
      },
      preload: false,
    },
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
      preload: false,
    },
    {
      name: 'spineAnim',
      type: RESOURCE_TYPE.SPINE,
      src: {
        ske: {
          type: 'ske',
          url: 'https://g.alicdn.com/eva-assets/32e307f6f38e8223b40fac1e3ccebbd0/0.0.1/tmp/953d6ec/c4c3af1b-d4f4-4436-8735-3353a061839c.json',
        },
        atlas: {
          type: 'atlas',
          url: 'https://g.alicdn.com/eva-assets/6f5817dd5a392c6cfbbc03acc2ba8778/0.0.1/tmp/05afd25/8d703ab1-2023-40f4-be69-ec2ed621b1e6.atlas',
        },
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/imgextra/i4/O1CN01AHYeJo24fxNQdlxOm_!!6000000007419-2-tps-553-551.png',
        },
      },
      preload: false,
    },
  ]);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 1750,
        height: 3900,
        backgroundColor: 0x1a1a2e,
        renderType: RENDERER_TYPE.CANVAS,
      }),
      new ImgSystem(),
      new TextSystem(),
      new GraphicsSystem(),
      new EventSystem(),
      new TransitionSystem(),
      new SpriteAnimationSystem(),
      new SpineSystem(),
      new RenderSystem(),
    ],
  });

  game.scene.transform.size = { width: 750, height: 1900 };

  // ==================== 标题区域 ====================
  createTitle(game);

  // ==================== Graphics 图形绘制 ====================
  createGraphicsDemo(game);

  // ==================== 图片展示 ====================
  createImageDemo(game);

  // ==================== 帧动画 ====================
  createSpriteAnimationDemo(game);

  // ==================== Spine 骨骼动画 ====================
  createSpineDemo(game);

  // ==================== 文字渲染 ====================
  createTextDemo(game);

  // ==================== 过渡动画 + 交互事件 ====================
  createTransitionDemo(game);
}

function createTitle(game: Game) {
  const title = new GameObject('title', {
    position: { x: 0, y: 30 },
    anchor: { x: 0.5, y: 0 },
    origin: { x: 0.5, y: 0 },
  });
  title.addComponent(
    new Text({
      text: 'Eva.js Canvas Demo',
      style: {
        fontSize: 48,
        fontWeight: 'bold',
        fill: ['#e94560', '#0f3460'],
        fontFamily: 'Arial',
      },
    }),
  );
  title.addComponent(new Render({ resolution: 2 }));
  game.scene.addChild(title);

  const subtitle = new GameObject('subtitle', {
    position: { x: 0, y: 100 },
    anchor: { x: 0.5, y: 0 },
    origin: { x: 0.5, y: 0 },
  });
  subtitle.addComponent(
    new Text({
      text: 'Graphics · Image · Animation · Spine · Text · Event',
      style: {
        fontSize: 24,
        fill: ['#aaaacc'],
        fontFamily: 'Arial',
      },
    }),
  );
  game.scene.addChild(subtitle);
}

function createGraphicsDemo(game: Game) {
  const sectionLabel = new GameObject('graphics-label', {
    position: { x: 30, y: 160 },
  });
  sectionLabel.addComponent(
    new Text({
      text: '▎Graphics 图形',
      style: { fontSize: 28, fill: ['#e94560'], fontFamily: 'Arial', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(sectionLabel);

  const circle = new GameObject('circle', {
    position: { x: 100, y: 240 },
  });
  const circleG = circle.addComponent(new Graphics());
  circleG.graphics.beginFill(0xe94560, 0.9);
  circleG.graphics.drawCircle(0, 0, 60);
  circleG.graphics.endFill();
  game.scene.addChild(circle);

  const roundedRect = new GameObject('rounded-rect', {
    position: { x: 250, y: 200 },
    size: { width: 180, height: 80 },
  });
  const rrG = roundedRect.addComponent(new Graphics());
  rrG.graphics.beginFill(0x0f3460, 1);
  rrG.graphics.drawRoundedRect(0, 0, 180, 80, 16);
  rrG.graphics.endFill();
  game.scene.addChild(roundedRect);

  const progressBg = new GameObject('progress-bg', {
    position: { x: 500, y: 220 },
    size: { width: 200, height: 20 },
  });
  const bgG = progressBg.addComponent(new Graphics());
  bgG.graphics.beginFill(0x16213e, 1);
  bgG.graphics.drawRoundedRect(0, 0, 200, 20, 10);
  bgG.graphics.endFill();
  game.scene.addChild(progressBg);

  const progressBar = new GameObject('progress-bar', {
    position: { x: 502, y: 222 },
  });
  const barG = progressBar.addComponent(new Graphics());
  game.scene.addChild(progressBar);

  let progress = 0;
  setInterval(() => {
    progress = (progress + 1) % 101;
    const width = Math.max(10, (196 * progress) / 100);
    barG.graphics.clear();
    barG.graphics.beginFill(0x533483, 1);
    barG.graphics.drawRoundedRect(0, 0, width, 16, 8);
    barG.graphics.endFill();
  }, 60);

  const triangle = new GameObject('triangle', {
    position: { x: 100, y: 340 },
  });
  const triG = triangle.addComponent(new Graphics());
  triG.graphics.beginFill(0x533483, 0.85);
  triG.graphics.moveTo(0, -40);
  triG.graphics.lineTo(45, 30);
  triG.graphics.lineTo(-45, 30);
  triG.graphics.closePath();
  triG.graphics.endFill();
  game.scene.addChild(triangle);

  const star = new GameObject('star', {
    position: { x: 250, y: 320 },
  });
  const starG = star.addComponent(new Graphics());
  starG.graphics.beginFill(0xe94560, 0.9);
  drawStar(starG.graphics, 0, 0, 5, 40, 20);
  starG.graphics.endFill();
  game.scene.addChild(star);
}

function drawStar(g: any, cx: number, cy: number, points: number, outerR: number, innerR: number) {
  const step = Math.PI / points;
  g.moveTo(cx, cy - outerR);
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (i + 1) * step;
    g.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  g.closePath();
}

function createImageDemo(game: Game) {
  const sectionLabel = new GameObject('image-label', {
    position: { x: 30, y: 400 },
  });
  sectionLabel.addComponent(
    new Text({
      text: '▎Image 图片',
      style: { fontSize: 28, fill: ['#e94560'], fontFamily: 'Arial', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(sectionLabel);

  const heart1 = new GameObject('heart1', {
    size: { width: 150, height: 150 },
    position: { x: 50, y: 460 },
    origin: { x: 0, y: 0 },
  });
  heart1.addComponent(new Img({ resource: 'heart' }));
  game.scene.addChild(heart1);

  const heart2 = new GameObject('heart2', {
    size: { width: 120, height: 120 },
    position: { x: 250, y: 475 },
    origin: { x: 0, y: 0 },
    rotation: 0.3,
  });
  heart2.addComponent(new Img({ resource: 'heart' }));
  game.scene.addChild(heart2);

  const heart3 = new GameObject('heart3', {
    size: { width: 100, height: 100 },
    position: { x: 420, y: 490 },
    origin: { x: 0, y: 0 },
    scale: { x: 1.2, y: 1.2 },
  });
  heart3.addComponent(new Img({ resource: 'heart' }));
  game.scene.addChild(heart3);

  const bgImg = new GameObject('bg-img', {
    size: { width: 150, height: 260 },
    position: { x: 570, y: 450 },
    origin: { x: 0, y: 0 },
  });
  bgImg.addComponent(new Img({ resource: 'test-img' }));
  game.scene.addChild(bgImg);
}

function createSpriteAnimationDemo(game: Game) {
  const sectionLabel = new GameObject('anim-label', {
    position: { x: 30, y: 720 },
  });
  sectionLabel.addComponent(
    new Text({
      text: '▎SpriteAnimation 帧动画',
      style: { fontSize: 28, fill: ['#e94560'], fontFamily: 'Arial', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(sectionLabel);

  const anim = new GameObject('fruit-anim', {
    position: { x: 100, y: 790 },
    size: { width: 200, height: 160 },
    origin: { x: 0, y: 0 },
  });
  const frame = anim.addComponent(
    new SpriteAnimation({
      resource: 'fruit',
      speed: 120,
      autoPlay: true,
      forwards: true,
    }),
  );
  frame.play(0);
  game.scene.addChild(anim);

  const animHint = new GameObject('anim-hint', {
    position: { x: 350, y: 850 },
  });
  animHint.addComponent(
    new Text({
      text: '← 自动循环播放的帧动画',
      style: { fontSize: 22, fill: ['#aaaacc'], fontFamily: 'Arial' },
    }),
  );
  game.scene.addChild(animHint);
}

function createSpineDemo(game: Game) {
  const sectionLabel = new GameObject('spine-label', {
    position: { x: 30, y: 980 },
  });
  sectionLabel.addComponent(
    new Text({
      text: '▎Spine 骨骼动画',
      style: { fontSize: 28, fill: ['#e94560'], fontFamily: 'Arial', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(sectionLabel);

  const spineObj = new GameObject('spine-demo', {
    anchor: { x: 0.5, y: 0.5 },
    position: { x: 200, y: 1140 },
    scale: { x: 0.5, y: 0.5 },
  });
  const spine = new Spine({ resource: 'spineAnim', animationName: 'animation', scale: 1 });
  spineObj.addComponent(spine);
  spine.on('loaded', () => {
    spine.play('animation');
  });
  game.scene.addChild(spineObj);

  const spineObj2 = new GameObject('spine-demo2', {
    anchor: { x: 0.5, y: 0.5 },
    position: { x: 500, y: 1140 },
    scale: { x: -0.4, y: 0.4 },
  });
  const spine2 = new Spine({ resource: 'spineAnim', animationName: 'animation', scale: 1 });
  spineObj2.addComponent(spine2);
  spine2.on('loaded', () => {
    spine2.play('animation');
  });
  game.scene.addChild(spineObj2);

  const spineHint = new GameObject('spine-hint', {
    position: { x: 50, y: 1240 },
  });
  spineHint.addComponent(
    new Text({
      text: 'Spine3.6 骨骼动画 (正向 + 镜像)',
      style: { fontSize: 22, fill: ['#aaaacc'], fontFamily: 'Arial' },
    }),
  );
  game.scene.addChild(spineHint);
}

function createTextDemo(game: Game) {
  const sectionLabel = new GameObject('text-label', {
    position: { x: 30, y: 1290 },
  });
  sectionLabel.addComponent(
    new Text({
      text: '▎Text 文字渲染',
      style: { fontSize: 28, fill: ['#e94560'], fontFamily: 'Arial', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(sectionLabel);

  const plainText = new GameObject('plain-text', {
    position: { x: 50, y: 1350 },
  });
  plainText.addComponent(
    new Text({
      text: 'Hello Eva.js!',
      style: {
        fontSize: 36,
        fill: ['#ffffff'],
        fontFamily: 'Arial',
      },
    }),
  );
  game.scene.addChild(plainText);

  const gradientText = new GameObject('gradient-text', {
    position: { x: 50, y: 1410 },
  });
  gradientText.addComponent(
    new Text({
      text: 'Gradient Style',
      style: {
        fontSize: 40,
        fontWeight: 'bold',
        fontStyle: 'italic',
        fill: ['#e94560', '#533483', '#0f3460'],
        fontFamily: 'Arial',
      },
    }),
  );
  gradientText.addComponent(new Render({ resolution: 2 }));
  game.scene.addChild(gradientText);

  const styledText = new GameObject('styled-text', {
    position: { x: 50, y: 1480 },
  });
  styledText.addComponent(
    new Text({
      text: '描边 + 阴影效果',
      style: {
        fontSize: 36,
        fill: ['#ffffff'],
        fontFamily: 'Arial',
        stroke: { color: '#e94560', width: 4 },
        dropShadow: {
          color: '#000000',
          blur: 4,
          angle: Math.PI / 4,
          distance: 3,
        },
      },
    }),
  );
  game.scene.addChild(styledText);
}

function createTransitionDemo(game: Game) {
  const sectionLabel = new GameObject('transition-label', {
    position: { x: 30, y: 1570 },
  });
  sectionLabel.addComponent(
    new Text({
      text: '▎Transition + Event 动画与交互',
      style: { fontSize: 28, fill: ['#e94560'], fontFamily: 'Arial', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(sectionLabel);

  const hint = new GameObject('tap-hint', {
    position: { x: 50, y: 1630 },
  });
  hint.addComponent(
    new Text({
      text: '点击下方的爱心试试 👇',
      style: { fontSize: 22, fill: ['#aaaacc'], fontFamily: 'Arial' },
    }),
  );
  game.scene.addChild(hint);

  const heartBtn = new GameObject('heart-btn', {
    size: { width: 150, height: 150 },
    position: { x: 300, y: 1750 },
    origin: { x: 0.5, y: 0.5 },
    anchor: { x: 0.5, y: 0.5 },
  });
  heartBtn.addComponent(new Img({ resource: 'heart' }));

  const transition = heartBtn.addComponent(new Transition());
  transition.group = {
    bounce: [
      {
        name: 'scale.x',
        component: heartBtn.transform,
        values: [
          { time: 0, value: 1, tween: 'ease-out' },
          { time: 150, value: 1.4, tween: 'ease-in' },
          { time: 300, value: 1 },
        ],
      },
      {
        name: 'scale.y',
        component: heartBtn.transform,
        values: [
          { time: 0, value: 1, tween: 'ease-out' },
          { time: 150, value: 1.4, tween: 'ease-in' },
          { time: 300, value: 1 },
        ],
      },
    ],
    rotate: [
      {
        name: 'rotation',
        component: heartBtn.transform,
        values: [
          { time: 0, value: 0, tween: 'ease-out' },
          { time: 400, value: Math.PI * 2 },
        ],
      },
    ],
  };

  const evt = heartBtn.addComponent(new Event());
  let tapCount = 0;
  evt.on('tap', () => {
    tapCount++;
    if (tapCount % 2 === 1) {
      transition.play('bounce', 1);
    } else {
      transition.play('rotate', 1);
    }
  });

  game.scene.addChild(heartBtn);

  const movingHeart = new GameObject('moving-heart', {
    size: { width: 80, height: 80 },
    position: { x: 100, y: 1750 },
    origin: { x: 0.5, y: 0.5 },
    anchor: { x: 0.5, y: 0.5 },
  });
  movingHeart.addComponent(new Img({ resource: 'heart' }));

  const moveTransition = movingHeart.addComponent(new Transition());
  moveTransition.group = {
    float: [
      {
        name: 'position.y',
        component: movingHeart.transform,
        values: [
          { time: 0, value: 1750, tween: 'ease-in-out' },
          { time: 1000, value: 1690, tween: 'ease-in-out' },
          { time: 2000, value: 1750 },
        ],
      },
      {
        name: 'scale.x',
        component: movingHeart.transform,
        values: [
          { time: 0, value: 1, tween: 'ease-in-out' },
          { time: 1000, value: 0.85, tween: 'ease-in-out' },
          { time: 2000, value: 1 },
        ],
      },
      {
        name: 'scale.y',
        component: movingHeart.transform,
        values: [
          { time: 0, value: 1, tween: 'ease-in-out' },
          { time: 1000, value: 1.15, tween: 'ease-in-out' },
          { time: 2000, value: 1 },
        ],
      },
    ],
  };
  moveTransition.play('float', Infinity);
  game.scene.addChild(movingHeart);

  const dragHeart = new GameObject('drag-heart', {
    size: { width: 120, height: 120 },
    position: { x: 550, y: 1750 },
    origin: { x: 0.5, y: 0.5 },
    anchor: { x: 0.5, y: 0.5 },
  });
  dragHeart.addComponent(new Img({ resource: 'heart' }));

  const dragEvt = dragHeart.addComponent(new Event());
  let dragging = false;
  dragEvt.on('touchstart', () => {
    dragging = true;
  });
  dragEvt.on('touchmove', e => {
    if (dragging) {
      dragHeart.transform.position = e.data.position;
    }
  });
  dragEvt.on('touchend', () => {
    dragging = false;
  });

  const dragLabel = new GameObject('drag-label', {
    position: { x: 490, y: 1830 },
  });
  dragLabel.addComponent(
    new Text({
      text: '可拖拽',
      style: { fontSize: 20, fill: ['#aaaacc'], fontFamily: 'Arial' },
    }),
  );
  game.scene.addChild(dragLabel);
  game.scene.addChild(dragHeart);
}
