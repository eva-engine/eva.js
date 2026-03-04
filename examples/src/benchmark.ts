import { Game, GameObject, resource, RESOURCE_TYPE, Component } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Sprite, SpriteSystem } from '@eva/plugin-renderer-sprite';

export const name = 'Benchmark - 多元素移动性能测试';

// 配置参数
const SPRITE_COUNT = 100; // 精灵数量
const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 1000;
const SPRITE_SIZE = 100; // 精灵大小
const SPEED_MIN = 60; // 最小移动速度（像素/秒）
const SPEED_MAX = 180; // 最大移动速度（像素/秒）

// Delta时间记录器
const deltaRecorder = {
  recording: false,
  startTime: 0,
  deltas: [] as Array<{ time: number; deltaTime: number; fps: number }>,
  maxDuration: 60000, // 60秒
  sampleInterval: 1, // 每帧都记录

  start() {
    this.recording = true;
    this.startTime = performance.now();
    this.deltas = [];
    console.log('开始记录 delta 时间，持续 60 秒...');
  },

  record(deltaTime: number) {
    if (!this.recording) return;

    const elapsed = performance.now() - this.startTime;
    if (elapsed > this.maxDuration) {
      this.stop();
      return;
    }

    // 只记录每N帧或者异常帧
    if (this.deltas.length % this.sampleInterval === 0 || deltaTime > 20) {
      this.deltas.push({
        time: elapsed,
        deltaTime: deltaTime,
        fps: Math.round(1000 / deltaTime),
      });
    }
  },

  stop() {
    if (!this.recording) return;
    this.recording = false;

    console.log('记录完成！共记录', this.deltas.length, '帧');

    // 分析数据
    const analysis = this.analyze();
    console.log('===== Delta 时间分析 =====');
    console.log('平均 deltaTime:', analysis.avgDelta.toFixed(2), 'ms');
    console.log('最小 deltaTime:', analysis.minDelta.toFixed(2), 'ms');
    console.log('最大 deltaTime:', analysis.maxDelta.toFixed(2), 'ms');
    console.log('标准差:', analysis.stdDev.toFixed(2), 'ms');
    console.log('大于 20ms 的帧数:', analysis.slowFrames, '个 (', ((analysis.slowFrames / this.deltas.length) * 100).toFixed(2), '%)');
    console.log('大于 30ms 的帧数:', analysis.verySlowFrames, '个');

    // 找出最慢的10帧
    console.log('===== 最慢的 10 帧 =====');
    const slowest = [...this.deltas].sort((a, b) => b.deltaTime - a.deltaTime).slice(0, 10);
    slowest.forEach((frame, i) => {
      console.log(`${i + 1}. 时间: ${frame.time.toFixed(0)}ms, deltaTime: ${frame.deltaTime.toFixed(2)}ms, FPS: ${frame.fps}`);
    });

    // 导出为CSV
    console.log('===== 导出数据 (复制下面的CSV) =====');
    const csv = this.exportCSV();
    console.log(csv.substring(0, 500) + '...\n(数据已保存到 window.deltaData)');

    // 保存到全局变量
    (window as any).deltaData = {
      raw: this.deltas,
      analysis,
      csv,
    };
  },

  analyze() {
    if (this.deltas.length === 0) {
      return { avgDelta: 0, minDelta: 0, maxDelta: 0, stdDev: 0, slowFrames: 0, verySlowFrames: 0 };
    }

    const deltas = this.deltas.map((d) => d.deltaTime);
    let sum = 0;
    let minDelta = Infinity;
    let maxDelta = -Infinity;
    let slowFrames = 0;
    let verySlowFrames = 0;

    // 一次遍历完成所有计算
    for (let i = 0; i < deltas.length; i++) {
      const delta = deltas[i];
      sum += delta;
      if (delta < minDelta) minDelta = delta;
      if (delta > maxDelta) maxDelta = delta;
      if (delta > 20) slowFrames++;
      if (delta > 30) verySlowFrames++;
    }

    const avgDelta = sum / deltas.length;

    // 计算标准差
    let varianceSum = 0;
    for (let i = 0; i < deltas.length; i++) {
      varianceSum += Math.pow(deltas[i] - avgDelta, 2);
    }
    const stdDev = Math.sqrt(varianceSum / deltas.length);

    return { avgDelta, minDelta, maxDelta, stdDev, slowFrames, verySlowFrames };
  },

  exportCSV() {
    let csv = 'Time(ms),DeltaTime(ms),FPS\n';
    this.deltas.forEach((d) => {
      csv += `${d.time.toFixed(2)},${d.deltaTime.toFixed(2)},${d.fps}\n`;
    });
    return csv;
  },
};

// 移动组件
class Movement extends Component<{ velocity: { x: number; y: number } }> {
  static componentName = 'Movement';
  static isFirstUpdate = true;

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
    // 只在第一个组件上记录（避免重复记录）
    if (Movement.isFirstUpdate) {
      deltaRecorder.record(e.deltaTime);
      Movement.isFirstUpdate = false;
    }

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

    Movement.isFirstUpdate = true;
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

  // 性能统计
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;

  // FPS 统计循环
  game.ticker.add(() => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
      fps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastTime = currentTime;

      // 只在 FPS 更新时才更新 DOM（减少 DOM 操作）
      const spriteCount = game.scene.children.length;
      fpsText.textContent = `FPS: ${fps} | 精灵: ${spriteCount} | 画布: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`;
    }
  });

  // 更新显示的辅助函数
  const updateDisplay = () => {
    const spriteCount = game.scene.children.length;
    fpsText.textContent = `FPS: ${fps} | 精灵: ${spriteCount} | 画布: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`;
  };

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
    deltaRecorder.start();
  }, 2000);
}
