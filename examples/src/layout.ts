import { Game, GameObject, Component } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Layout, LayoutChild, LayoutSystem } from '@eva/plugin-layout';

export const name = 'layout';

/**
 * 自动跟踪容器 size 变化并重绘 Graphics 背景的组件
 */
class AutoBackground extends Component {
  static componentName = 'AutoBackground';

  private graphics: any;
  private color: number = 0x2c3e50;
  private alpha: number = 0.7;
  private radius: number = 10;
  private lastW: number = 0;
  private lastH: number = 0;
  private onResize?: (w: number, h: number) => void;

  init(params?: { color?: number; alpha?: number; radius?: number; onResize?: (w: number, h: number) => void }) {
    this.color = params?.color ?? 0x2c3e50;
    this.alpha = params?.alpha ?? 0.7;
    this.radius = params?.radius ?? 10;
    this.onResize = params?.onResize;
  }

  awake() {
    this.graphics = this.gameObject.getComponent('Graphics');
  }

  lateUpdate() {
    if (!this.graphics) return;
    const s = this.gameObject.transform.size;
    const w = s.width;
    const h = s.height;
    if (w !== this.lastW || h !== this.lastH) {
      this.lastW = w;
      this.lastH = h;
      this.graphics.graphics.clear();
      this.graphics.graphics.beginFill(this.color, this.alpha);
      this.graphics.graphics.drawRoundedRect(0, 0, w, h, this.radius);
      this.graphics.graphics.endFill();
      if (this.onResize) this.onResize(w, h);
    }
  }
}

/**
 * Helper: create a colored box with optional text label
 */
function createBox(
  name: string,
  width: number,
  height: number,
  color: number,
  label?: string,
): GameObject {
  const go = new GameObject(name, {
    size: { width, height },
  });
  const g = go.addComponent(new Graphics());
  g.graphics.beginFill(color, 1);
  g.graphics.drawRoundedRect(0, 0, width, height, 6);
  g.graphics.endFill();

  if (label) {
    const textGo = new GameObject(name + '-label', {
      position: { x: 4, y: 2 },
    });
    textGo.addComponent(
      new Text({
        text: label,
        style: {
          fontSize: 18,
          fill: ['#ffffff'],
        },
      }),
    );
    go.addChild(textGo);
  }
  return go;
}

/**
 * Helper: create a section title
 */
function createTitle(text: string, y: number): GameObject {
  const go = new GameObject('title-' + text, {
    position: { x: 20, y },
  });
  go.addComponent(
    new Text({
      text,
      style: {
        fontSize: 22,
        fontWeight: 'bold',
        fill: ['#ffffff'],
      },
    }),
  );
  return go;
}

export async function init(canvas) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1500,
      }),
      new TextSystem(),
      new GraphicsSystem(),
      new LayoutSystem(),
    ],
  });

  game.scene.transform.size = { width: 750, height: 1500 };

  // ── 1. Row layout with gap ──
  game.scene.addChild(createTitle('1. Row Layout (gap=16)', 10));

  const row = new GameObject('row-container', {
    position: { x: 20, y: 50 },
  });
  row.addComponent(new Layout({ direction: 'row', gap: 16 }));
  row.addChild(createBox('r1', 100, 50, 0xe74c3c, 'A'));
  row.addChild(createBox('r2', 120, 50, 0x2ecc71, 'B'));
  row.addChild(createBox('r3', 80, 50, 0x3498db, 'C'));
  game.scene.addChild(row);

  // ── 2. Column layout with gap ──
  game.scene.addChild(createTitle('2. Column Layout (gap=12)', 120));

  const col = new GameObject('col-container', {
    position: { x: 20, y: 160 },
  });
  col.addComponent(new Layout({ direction: 'column', gap: 12 }));
  col.addChild(createBox('c1', 200, 40, 0x9b59b6, 'Row 1'));
  col.addChild(createBox('c2', 200, 40, 0xf39c12, 'Row 2'));
  col.addChild(createBox('c3', 200, 40, 0x1abc9c, 'Row 3'));
  game.scene.addChild(col);

  // ── 3. Padding + autoSize ──
  game.scene.addChild(createTitle('3. Padding [20,30] + autoSize', 310));

  const padded = new GameObject('padded-container', {
    position: { x: 20, y: 350 },
  });
  padded.addComponent(
    new Layout({
      direction: 'row',
      gap: 10,
      padding: [20, 30],
      autoSize: true,
    }),
  );
  // Background drawn after layout sizes the container
  const paddedBg = padded.addComponent(new Graphics());
  padded.addChild(createBox('p1', 80, 40, 0xe67e22, 'X'));
  padded.addChild(createBox('p2', 80, 40, 0x2c3e50, 'Y'));
  game.scene.addChild(padded);

  // Draw background after a frame so autoSize has resolved
  setTimeout(() => {
    const s = padded.transform.size;
    paddedBg.graphics.clear();
    paddedBg.graphics.beginFill(0x34495e, 0.6);
    paddedBg.graphics.drawRoundedRect(0, 0, s.width, s.height, 10);
    paddedBg.graphics.endFill();
  }, 100);

  // ── 4. justifyContent: center ──
  game.scene.addChild(createTitle('4. justifyContent: center (w=500)', 450));

  const centered = new GameObject('center-container', {
    position: { x: 20, y: 490 },
    size: { width: 500, height: 60 },
  });
  centered.addComponent(
    new Layout({
      direction: 'row',
      gap: 16,
      justifyContent: 'center',
      autoSize: false,
    }),
  );
  const centeredBg = centered.addComponent(new Graphics());
  centeredBg.graphics.beginFill(0x2c3e50, 0.8);
  centeredBg.graphics.drawRoundedRect(0, 0, 500, 60, 10);
  centeredBg.graphics.endFill();
  centered.addChild(createBox('j1', 80, 40, 0xe74c3c, 'L'));
  centered.addChild(createBox('j2', 80, 40, 0x2ecc71, 'R'));
  game.scene.addChild(centered);

  // ── 5. alignItems: center + stretch ──
  game.scene.addChild(createTitle('5. alignItems: center (h=100)', 570));

  const aligned = new GameObject('align-container', {
    position: { x: 20, y: 610 },
    size: { width: 400, height: 100 },
  });
  aligned.addComponent(
    new Layout({
      direction: 'row',
      gap: 12,
      alignItems: 'center',
      autoSize: false,
    }),
  );
  const alignedBg = aligned.addComponent(new Graphics());
  alignedBg.graphics.beginFill(0x2c3e50, 0.8);
  alignedBg.graphics.drawRoundedRect(0, 0, 400, 100, 10);
  alignedBg.graphics.endFill();
  aligned.addChild(createBox('a1', 80, 30, 0xe74c3c, 'S'));
  aligned.addChild(createBox('a2', 80, 60, 0xf39c12, 'M'));
  aligned.addChild(createBox('a3', 80, 90, 0x3498db, 'L'));
  game.scene.addChild(aligned);

  // ── 6. Nested layout ──
  game.scene.addChild(createTitle('6. Nested: column > rows', 730));

  const outer = new GameObject('nested-outer', {
    position: { x: 20, y: 770 },
  });
  outer.addComponent(new Layout({ direction: 'column', gap: 10 }));

  // Inner row 1
  const innerRow1 = new GameObject('inner-row-1');
  innerRow1.addComponent(new Layout({ direction: 'row', gap: 8 }));
  innerRow1.addChild(createBox('n1', 100, 40, 0xe74c3c, 'A1'));
  innerRow1.addChild(createBox('n2', 100, 40, 0x2ecc71, 'A2'));

  // Inner row 2
  const innerRow2 = new GameObject('inner-row-2');
  innerRow2.addComponent(new Layout({ direction: 'row', gap: 8 }));
  innerRow2.addChild(createBox('n3', 60, 40, 0x9b59b6, 'B1'));
  innerRow2.addChild(createBox('n4', 60, 40, 0xf39c12, 'B2'));
  innerRow2.addChild(createBox('n5', 60, 40, 0x1abc9c, 'B3'));

  outer.addChild(innerRow1);
  outer.addChild(innerRow2);
  game.scene.addChild(outer);

  // ── 7. LayoutChild flexGrow ──
  game.scene.addChild(createTitle('7. flexGrow (container w=500)', 880));

  const flex = new GameObject('flex-container', {
    position: { x: 20, y: 920 },
    size: { width: 500, height: 50 },
  });
  flex.addComponent(
    new Layout({
      direction: 'row',
      gap: 8,
      autoSize: false,
    }),
  );
  const flexBg = flex.addComponent(new Graphics());
  flexBg.graphics.beginFill(0x2c3e50, 0.8);
  flexBg.graphics.drawRoundedRect(0, 0, 500, 50, 10);
  flexBg.graphics.endFill();

  const f1 = createBox('f1', 80, 40, 0xe74c3c, 'fixed');
  const f2 = createBox('f2', 50, 40, 0x2ecc71, 'grow=1');
  f2.addComponent(new LayoutChild({ flexGrow: 1 }));
  const f3 = createBox('f3', 80, 40, 0x3498db, 'fixed');
  flex.addChild(f1);
  flex.addChild(f2);
  flex.addChild(f3);
  game.scene.addChild(flex);

  // ── 8. space-between ──
  game.scene.addChild(createTitle('8. space-between (w=600)', 990));

  const spaced = new GameObject('space-container', {
    position: { x: 20, y: 1030 },
    size: { width: 600, height: 50 },
  });
  spaced.addComponent(
    new Layout({
      direction: 'row',
      justifyContent: 'space-between',
      autoSize: false,
    }),
  );
  const spacedBg = spaced.addComponent(new Graphics());
  spacedBg.graphics.beginFill(0x2c3e50, 0.8);
  spacedBg.graphics.drawRoundedRect(0, 0, 600, 50, 10);
  spacedBg.graphics.endFill();
  spaced.addChild(createBox('s1', 80, 40, 0xe74c3c, 'Left'));
  spaced.addChild(createBox('s2', 80, 40, 0xf39c12, 'Mid'));
  spaced.addChild(createBox('s3', 80, 40, 0x3498db, 'Right'));
  game.scene.addChild(spaced);

  // ── 9. Nested Layout + Dynamic Resize ──
  game.scene.addChild(createTitle('9. Nested autoSize + dynamic resize', 1100));

  // Status text to show outer size
  const statusGo = new GameObject('status-text', {
    position: { x: 20, y: 1140 },
  });
  const statusText = statusGo.addComponent(
    new Text({
      text: 'outer size: ...',
      style: { fontSize: 18, fill: ['#aaaaaa'] },
    }),
  );
  game.scene.addChild(statusGo);

  // Outer container: column layout, autoSize=true, with padding
  const outerDyn = new GameObject('dyn-outer', {
    position: { x: 20, y: 1170 },
  });
  outerDyn.addComponent(
    new Layout({ direction: 'column', gap: 12, padding: [16, 20], autoSize: true }),
  );
  outerDyn.addComponent(new Graphics());
  // AutoBackground: 每帧检查 size 变化，自动重绘背景（无闪烁）
  outerDyn.addComponent(
    new AutoBackground({
      color: 0x2c3e50,
      alpha: 0.7,
      radius: 10,
      onResize: (w, h) => {
        statusText.text = `outer size: ${w.toFixed(0)} x ${h.toFixed(0)}`;
      },
    }),
  );

  // Inner row A: fixed content
  const innerA = new GameObject('dyn-inner-a');
  innerA.addComponent(new Layout({ direction: 'row', gap: 8, autoSize: true }));
  innerA.addChild(createBox('da1', 80, 40, 0xe74c3c, 'A1'));
  innerA.addChild(createBox('da2', 80, 40, 0x2ecc71, 'A2'));

  // Inner row B: will grow dynamically
  const innerB = new GameObject('dyn-inner-b');
  innerB.addComponent(new Layout({ direction: 'row', gap: 8, autoSize: true }));
  const dynBox1 = createBox('db1', 60, 40, 0x3498db, 'B1');
  innerB.addChild(dynBox1);

  outerDyn.addChild(innerA);
  outerDyn.addChild(innerB);
  game.scene.addChild(outerDyn);

  // Dynamic: add boxes to innerB every 1.5s, then resize existing box
  let step = 0;
  const timer = setInterval(() => {
    step++;

    if (step <= 3) {
      // Steps 1-3: add a new box to inner row B
      const colors = [0xf39c12, 0x9b59b6, 0x1abc9c];
      const newBox = createBox(`db${step + 1}`, 60 + step * 20, 40, colors[step - 1], `B${step + 1}`);
      innerB.addChild(newBox);
    } else if (step === 4) {
      // Step 4: make dynBox1 taller → inner row B height changes → outer grows
      dynBox1.transform.size.height = 80;
      const g = dynBox1.getComponent('Graphics') as any;
      if (g) {
        g.graphics.clear();
        g.graphics.beginFill(0x3498db, 1);
        g.graphics.drawRoundedRect(0, 0, 60, 80, 6);
        g.graphics.endFill();
      }
    } else if (step === 5) {
      // Step 5: add a third inner row C
      const innerC = new GameObject('dyn-inner-c');
      innerC.addComponent(new Layout({ direction: 'row', gap: 8, autoSize: true }));
      innerC.addChild(createBox('dc1', 100, 30, 0xe67e22, 'C1'));
      innerC.addChild(createBox('dc2', 120, 30, 0x16a085, 'C2'));
      outerDyn.addChild(innerC);
    } else {
      clearInterval(timer);
    }
  }, 1500);
}
