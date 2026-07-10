import { Game, GameObject, resource, RESOURCE_TYPE, Component } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Sprite, SpriteSystem } from '@eva/plugin-renderer-sprite';
import { createFrameRecorder, createRateMeter } from './benchmark-metrics';
import type { BenchmarkFrame, FrameRecorderReport, RateSnapshot } from './benchmark-metrics';

export const name = 'Benchmark - 多元素移动性能测试';

// 配置参数
const SPRITE_COUNT = 100; // 精灵数量
const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 1000;
const SPRITE_SIZE = 100; // 精灵大小
const SPEED_MIN = 60; // 最小移动速度（像素/秒）
const SPEED_MAX = 180; // 最大移动速度（像素/秒）

// 移动组件
class Movement extends Component<{ velocity: { x: number; y: number } }> {
  static componentName = 'Movement';

  velocity = {
    x: 0,
    y: 0,
  };

  init(obj?: { velocity: { x: number; y: number } }) {
    if (obj) {
      Object.assign(this, obj);
    }
  }

  update(e: { deltaTime: number }) {
    const position = this.gameObject.transform.position;
    const deltaSeconds = e.deltaTime / 1000;

    // 计算新位置并直接修改position对象的属性
    position.x += this.velocity.x * deltaSeconds;
    position.y += this.velocity.y * deltaSeconds;

    // 边界检测和反弹
    if (position.x <= 0 || position.x >= CANVAS_WIDTH) {
      this.velocity.x = -this.velocity.x;
      position.x = Math.max(0, Math.min(CANVAS_WIDTH, position.x));
    }

    if (position.y <= 0 || position.y >= CANVAS_HEIGHT) {
      this.velocity.y = -this.velocity.y;
      position.y = Math.max(0, Math.min(CANVAS_HEIGHT, position.y));
    }
  }
}

export async function init(canvas: HTMLCanvasElement) {
  // 添加图集资源
  resource.addResource([
    {
      name: 'fuluSprite',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: 'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/fulu/tp.png',
        },
        json: {
          type: 'json',
          url: 'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/fulu/tp.json',
        },
      },
      preload: true,
    },
  ]);

  // 初始化游戏
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: 0x1a1a2e,
        preference: 'webgl', // 强制使用WebGL
        antialias: false, // 关闭抗锯齿提升性能
        powerPreference: 'high-performance', // 使用高性能GPU
      }),
      new SpriteSystem(),
    ],
  });

  window.game = game;

  // 图集中可用的精灵名称
  const spriteNames = ['fu.png', 'lu.png', 'cai.png', 'xi.png', 'shou.png'];

  // 创建精灵的辅助函数
  const createSprite = (id: string | number) => {
    const x = Math.random() * (CANVAS_WIDTH - SPRITE_SIZE);
    const y = Math.random() * (CANVAS_HEIGHT - SPRITE_SIZE);

    // 随机选择一个精灵
    const spriteName = spriteNames[Math.floor(Math.random() * spriteNames.length)];

    const gameObject = new GameObject(`sprite_${id}`, {
      size: { width: SPRITE_SIZE, height: SPRITE_SIZE },
      position: { x, y },
      origin: { x: 0.5, y: 0.5 },
    });

    gameObject.addComponent(
      new Sprite({
        resource: 'fuluSprite',
        spriteName: spriteName,
      }),
    );

    // 随机速度和方向
    const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
    const angle = Math.random() * Math.PI * 2;

    gameObject.addComponent(
      new Movement({
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
      }),
    );

    return gameObject;
  };

  // 初始化精灵
  for (let i = 0; i < SPRITE_COUNT; i++) {
    game.scene.addChild(createSprite(i));
  }

  // FPS 显示
  const fpsText = document.createElement('div');
  fpsText.style.position = 'fixed';
  fpsText.style.top = '10px';
  fpsText.style.left = '10px';
  fpsText.style.color = '#00ff00';
  fpsText.style.fontFamily = 'monospace';
  fpsText.style.fontSize = '20px';
  fpsText.style.fontWeight = 'bold';
  fpsText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  fpsText.style.padding = '10px';
  fpsText.style.borderRadius = '5px';
  fpsText.style.zIndex = '1000';
  document.body.appendChild(fpsText);

  const rateMeter = createRateMeter();
  const frameRecorder = createFrameRecorder();
  let latestRateSnapshot: RateSnapshot | undefined;
  let publishedReport: FrameRecorderReport | undefined;

  const updateDisplay = () => {
    const spriteCount = game.scene.children.length;
    const rafFps = latestRateSnapshot ? latestRateSnapshot.rafFps.toFixed(1) : '--';
    const logicUps = latestRateSnapshot ? latestRateSnapshot.logicUps.toFixed(1) : '--';
    const updateBins = latestRateSnapshot ? latestRateSnapshot.updatesPerRaf.join('/') : '0/0/0/0/0/0';
    fpsText.textContent = `RAF FPS: ${rafFps} | Logic UPS: ${logicUps} | U/RAF [0..5]: ${updateBins} | 精灵: ${spriteCount} | 画布: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`;
  };

  const publishReport = (report: FrameRecorderReport) => {
    if (report === publishedReport) return;
    publishedReport = report;
    const { analysis } = report;
    const slowPercent = analysis.sampleCount ? (analysis.slowFrames / analysis.sampleCount) * 100 : 0;

    (window as any).deltaData = report;
    console.log('记录完成！共记录', analysis.sampleCount, '个物理帧样本');
    console.log('保留/覆盖样本:', analysis.retainedSampleCount, '/', analysis.droppedSampleCount);
    console.log('===== RAF Delta 时间分析 =====');
    console.log('平均 rafDeltaTime:', analysis.avgDelta.toFixed(2), 'ms');
    console.log('最小 rafDeltaTime:', analysis.minDelta.toFixed(2), 'ms');
    console.log('最大 rafDeltaTime:', analysis.maxDelta.toFixed(2), 'ms');
    console.log('标准差:', analysis.stdDev.toFixed(2), 'ms');
    console.log('大于 20ms 的物理帧:', analysis.slowFrames, '个 (', slowPercent.toFixed(2), '%)');
    console.log('大于 30ms 的物理帧:', analysis.verySlowFrames, '个');
    console.log('U/RAF [0..5]:', analysis.updatesPerRaf.join('/'));
    console.log('===== 最慢的 10 个物理帧 =====');
    analysis.slowestFrames.forEach((sample, index) => {
      console.log(
        `${index + 1}. 时间: ${sample.time.toFixed(0)}ms, rafDeltaTime: ${sample.deltaTime.toFixed(2)}ms, RAF FPS: ${
          sample.fps
        }, Updates: ${sample.updateCount}`,
      );
    });
    console.log('原始有界样本和 CSV 可通过 window.deltaData.raw / window.deltaData.csv 按需读取');
  };

  const deltaRecorder = {
    get recording() {
      return frameRecorder.recording;
    },
    get capacity() {
      return frameRecorder.capacity;
    },
    get sampleCount() {
      return frameRecorder.sampleCount;
    },
    start() {
      frameRecorder.start();
      console.log('开始记录物理帧 delta，最长持续 60 秒...');
    },
    record(frame: BenchmarkFrame) {
      const report = frameRecorder.record(frame);
      if (report) publishReport(report);
      return report;
    },
    stop() {
      const report = frameRecorder.stop();
      if (report) publishReport(report);
      return report;
    },
  };

  game.ticker.addFrame(frame => {
    const snapshot = rateMeter.record(frame);
    deltaRecorder.record(frame);
    if (!snapshot) return;
    latestRateSnapshot = snapshot;
    updateDisplay();
  });

  updateDisplay();

  // 暴露到 window 用于调试
  // @ts-ignore
  window.benchmark = {
    game,
    deltaRecorder,
    startRecording: () => deltaRecorder.start(),
    stopRecording: () => deltaRecorder.stop(),
    addSprites: (count: number) => {
      for (let i = 0; i < count; i++) {
        const gameObject = createSprite(`dynamic_${Date.now()}_${i}`);
        game.scene.addChild(gameObject);
      }
      const spriteCount = game.scene.children.length;
      console.log(`Added ${count} sprites. Total: ${spriteCount}`);
      updateDisplay();
    },
    removeSprites: (count: number) => {
      const actualCount = Math.min(count, game.scene.children.length);
      for (let i = 0; i < actualCount; i++) {
        const child = game.scene.children[game.scene.children.length - 1];
        if (child) {
          game.scene.removeChild(child);
        }
      }
      const spriteCount = game.scene.children.length;
      console.log(`Removed ${actualCount} sprites. Total: ${spriteCount}`);
      updateDisplay();
    },
  };

  console.log('Benchmark 场景已启动！');
  console.log('可以使用以下命令进行测试：');
  console.log('- window.benchmark.addSprites(50) // 添加 50 个精灵');
  console.log('- window.benchmark.removeSprites(30) // 移除 30 个精灵');
  console.log('- window.benchmark.startRecording() // 开始记录 delta 时间（60秒）');
  console.log('- window.benchmark.stopRecording() // 手动停止记录');
  console.log('- window.deltaData // 查看记录的数据');

  // 自动开始记录
  setTimeout(() => {
    if (!deltaRecorder.recording) deltaRecorder.start();
  }, 2000);
}
