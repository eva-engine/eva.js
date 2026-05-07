import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Event, EventSystem } from '@eva/plugin-renderer-event';
import { AISystem } from '@eva/plugin-ai';

export const name = 'ai-click-test';

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
    preload: true,
  },
]);

resource.preload();

/**
 * AI DOM 覆盖层点击穿透测试
 *
 * 验证目标：debug 模式下的红色边框 DOM 不会阻碍 canvas 的点击事件
 * 测试方式：点击各按钮，观察控制台输出和视觉反馈
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
        backgroundColor: '#1a1a2e',
      }),
      new TextSystem(),
      new GraphicsSystem(),
      new ImgSystem(),
      new EventSystem(),
      new AISystem({ debug: true }), // 开启 debug 红框模式
    ],
    autoStart: true,
    frameRate: 60,
  });

  game.scene.transform.size = { width: 750, height: 1000 };

  // 标题
  const title = new GameObject('title', {
    position: { x: 100, y: 30 },
    size: { width: 550, height: 50 },
    anchor: { x: 0, y: 0 },
  });
  title.addComponent(
    new Text({
      text: 'Click Through Test (debug mode)',
      style: { fontSize: 34, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' },
    }),
  );
  game.scene.addChild(title);

  // 提示文字
  const hint = new GameObject('hint', {
    position: { x: 100, y: 90 },
    size: { width: 550, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  hint.addComponent(
    new Text({
      text: 'Click buttons below. Check console for events.',
      style: { fontSize: 20, fontFamily: 'Arial', fill: '#778da9' },
    }),
  );
  game.scene.addChild(hint);

  // 点击计数显示
  const counterText = new GameObject('counter-display', {
    position: { x: 150, y: 140 },
    size: { width: 450, height: 40 },
    anchor: { x: 0, y: 0 },
  });
  const counterComp = counterText.addComponent(
    new Text({
      text: 'Total clicks: 0',
      style: { fontSize: 28, fontFamily: 'Arial', fill: '#52b788', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(counterText);

  let totalClicks = 0;
  function updateCounter() {
    totalClicks++;
    counterComp.text = `Total clicks: ${totalClicks}`;
  }

  // ========== 按钮 1: 绿色矩形按钮 ==========
  const btn1 = new GameObject('btn-green', {
    position: { x: 100, y: 220 },
    size: { width: 250, height: 80 },
    anchor: { x: 0, y: 0 },
  });
  const btn1Graphics = btn1.addComponent(new Graphics());
  btn1Graphics.graphics.beginFill(0x52b788, 1);
  btn1Graphics.graphics.drawRoundedRect(0, 0, 250, 80, 16);
  btn1Graphics.graphics.endFill();
  const btn1Event = btn1.addComponent(new Event());
  btn1Event.on('tap', () => {
    console.log('[CLICK] Green button tapped!');
    updateCounter();
  });
  game.scene.addChild(btn1);

  const btn1Label = new GameObject('btn-green-label', {
    position: { x: 130, y: 240 },
    size: { width: 200, height: 40 },
    anchor: { x: 0, y: 0 },
  });
  btn1Label.addComponent(
    new Text({
      text: 'Green Button',
      style: { fontSize: 26, fontFamily: 'Arial', fill: '#ffffff', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(btn1Label);

  // ========== 按钮 2: 蓝色矩形按钮 ==========
  const btn2 = new GameObject('btn-blue', {
    position: { x: 400, y: 220 },
    size: { width: 250, height: 80 },
    anchor: { x: 0, y: 0 },
  });
  const btn2Graphics = btn2.addComponent(new Graphics());
  btn2Graphics.graphics.beginFill(0x4fc3f7, 1);
  btn2Graphics.graphics.drawRoundedRect(0, 0, 250, 80, 16);
  btn2Graphics.graphics.endFill();
  const btn2Event = btn2.addComponent(new Event());
  btn2Event.on('tap', () => {
    console.log('[CLICK] Blue button tapped!');
    updateCounter();
  });
  game.scene.addChild(btn2);

  const btn2Label = new GameObject('btn-blue-label', {
    position: { x: 440, y: 240 },
    size: { width: 200, height: 40 },
    anchor: { x: 0, y: 0 },
  });
  btn2Label.addComponent(
    new Text({
      text: 'Blue Button',
      style: { fontSize: 26, fontFamily: 'Arial', fill: '#ffffff', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(btn2Label);

  // ========== 按钮 3: 图片按钮（拖动测试） ==========
  const btn3 = new GameObject('btn-image', {
    position: { x: 275, y: 350 },
    size: { width: 200, height: 200 },
    anchor: { x: 0.5, y: 0.5 },
    origin: { x: 0.5, y: 0.5 },
  });
  btn3.addComponent(new Img({ resource: 'heart' }));
  const btn3Event = btn3.addComponent(new Event());
  btn3Event.on('tap', () => {
    console.log('[CLICK] Heart image tapped!');
    updateCounter();
  });
  let dragging = false;
  btn3Event.on('touchstart', () => {
    dragging = true;
    console.log('[DRAG] Heart drag start');
  });
  btn3Event.on('touchmove', (e) => {
    if (dragging) {
      e.gameObject.transform.position = e.data.position;
    }
  });
  btn3Event.on('touchend', () => {
    dragging = false;
    console.log('[DRAG] Heart drag end');
  });
  game.scene.addChild(btn3);

  const dragHint = new GameObject('drag-hint', {
    position: { x: 200, y: 560 },
    size: { width: 350, height: 30 },
    anchor: { x: 0, y: 0 },
  });
  dragHint.addComponent(
    new Text({
      text: 'Drag the heart above',
      style: { fontSize: 20, fontFamily: 'Arial', fill: '#778da9' },
    }),
  );
  game.scene.addChild(dragHint);

  // ========== 按钮 4: 大面积点击区域 ==========
  const btn4 = new GameObject('btn-large-area', {
    position: { x: 50, y: 620 },
    size: { width: 650, height: 120 },
    anchor: { x: 0, y: 0 },
  });
  const btn4Graphics = btn4.addComponent(new Graphics());
  btn4Graphics.graphics.beginFill(0x9b5de5, 1);
  btn4Graphics.graphics.drawRoundedRect(0, 0, 650, 120, 20);
  btn4Graphics.graphics.endFill();
  const btn4Event = btn4.addComponent(new Event());
  btn4Event.on('tap', (e) => {
    console.log(`[CLICK] Large purple area tapped at (${Math.round(e.data.position.x)}, ${Math.round(e.data.position.y)})`);
    updateCounter();
  });
  game.scene.addChild(btn4);

  const btn4Label = new GameObject('btn-large-label', {
    position: { x: 180, y: 660 },
    size: { width: 400, height: 40 },
    anchor: { x: 0, y: 0 },
  });
  btn4Label.addComponent(
    new Text({
      text: 'Large Click Area',
      style: { fontSize: 30, fontFamily: 'Arial', fill: '#ffffff', fontWeight: 'bold' },
    }),
  );
  game.scene.addChild(btn4Label);

  // ========== 底部状态 ==========
  const status = new GameObject('status', {
    position: { x: 50, y: 800 },
    size: { width: 650, height: 100 },
    anchor: { x: 0, y: 0 },
  });
  status.addComponent(
    new Text({
      text: 'If clicks register (counter increases), pointer-events: none is working correctly.\nThe red debug borders should NOT block any interaction.',
      style: { fontSize: 18, fontFamily: 'Arial', fill: '#778da9' },
    }),
  );
  game.scene.addChild(status);
}
