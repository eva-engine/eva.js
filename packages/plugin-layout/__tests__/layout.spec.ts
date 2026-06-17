import { GameObject } from '@eva/eva.js';
import { Layout, LayoutChild, LayoutSystem, normalizePadding } from '../lib';

/**
 * 工具:构造一个最小可用的 fake game,LayoutSystem 只读 game.gameObjects + game.systems,
 * 不依赖真实 ticker / scene / renderer。
 */
function makeFakeGame(gameObjects: GameObject[]) {
  return {
    gameObjects,
    systems: [] as any[],
  };
}

/**
 * 工具:构造一个挂了 Layout 的容器,size 已知,父子关系建立完毕。
 */
function makeContainer(
  name: string,
  width: number,
  height: number,
  layoutParams: Parameters<Layout['init']>[0] = {},
) {
  const go = new GameObject(name, { size: { width, height } });
  const layout = new Layout();
  go.addComponent(layout);
  layout.init({ autoSize: false, ...layoutParams });
  return { go, layout };
}

/**
 * 工具:构造一个普通子元素,不挂 LayoutChild。
 */
function makeChild(name: string, width: number, height: number) {
  return new GameObject(name, { size: { width, height } });
}

/**
 * 工具:构造一个挂了 LayoutChild 的子元素。
 */
function makeFlexChild(
  name: string,
  width: number,
  height: number,
  childParams: Parameters<LayoutChild['init']>[0] = {},
) {
  const go = new GameObject(name, { size: { width, height } });
  const lc = new LayoutChild();
  go.addComponent(lc);
  lc.init(childParams);
  return { go, lc };
}

/**
 * 工具:把 children 挂到 parent 上,顺序就是参数顺序。
 */
function attach(parent: GameObject, ...children: GameObject[]) {
  for (const c of children) parent.addChild(c);
}

/**
 * 工具:跑一次 LayoutSystem 的 lateUpdate。
 * 第一次调用时,所有容器会被识别为 firstLayout,从而触发布局。
 */
function runLayout(...gos: GameObject[]) {
  const sys = new LayoutSystem();
  (sys as any).game = makeFakeGame(gos);
  sys.lateUpdate();
  return sys;
}

describe('plugin-layout — Flexbox 布局系统', () => {
  describe('normalizePadding', () => {
    it('未传参数返回全 0', () => {
      expect(normalizePadding(undefined)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });

    it('单个数值套用四边', () => {
      expect(normalizePadding(8)).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
    });

    it('两个数值 [v, h] -> 上下/左右', () => {
      expect(normalizePadding([12, 24])).toEqual({ top: 12, right: 24, bottom: 12, left: 24 });
    });

    it('四个数值 [top, right, bottom, left] 直接对应', () => {
      expect(normalizePadding([1, 2, 3, 4])).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
    });
  });

  describe('Layout / LayoutChild 组件', () => {
    it('Layout init 解析参数,默认值合理', () => {
      const l = new Layout();
      l.init();
      expect(l.direction).toBe('row');
      expect(l.gap).toBe(0);
      expect(l.justifyContent).toBe('start');
      expect(l.alignItems).toBe('start');
      expect(l.autoSize).toBe(true);
      expect(l.padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });

    it('Layout init 传参后 padding 数组会被 normalize', () => {
      const l = new Layout();
      l.init({
        direction: 'column',
        padding: [10, 20],
        gap: 8,
        justifyContent: 'center',
        alignItems: 'stretch',
        autoSize: false,
      });
      expect(l.direction).toBe('column');
      expect(l.padding).toEqual({ top: 10, right: 20, bottom: 10, left: 20 });
      expect(l.gap).toBe(8);
      expect(l.justifyContent).toBe('center');
      expect(l.alignItems).toBe('stretch');
      expect(l.autoSize).toBe(false);
    });

    it('LayoutChild init 解析参数', () => {
      const lc = new LayoutChild();
      lc.init({
        flexGrow: 2,
        flexShrink: 1,
        alignSelf: 'end',
        margin: [4, 8],
        fixedSize: { width: 50, height: 50 },
      });
      expect(lc.flexGrow).toBe(2);
      expect(lc.flexShrink).toBe(1);
      expect(lc.alignSelf).toBe('end');
      expect(lc.margin).toEqual({ top: 4, right: 8, bottom: 4, left: 8 });
      expect(lc.fixedSize).toEqual({ width: 50, height: 50 });
    });
  });

  describe('row 方向布局 + justifyContent', () => {
    it('justifyContent=start 子元素紧贴左侧依次排列', () => {
      const { go: parent } = makeContainer('row-start', 300, 100, {
        direction: 'row',
        justifyContent: 'start',
      });
      const a = makeChild('a', 50, 30);
      const b = makeChild('b', 60, 30);
      attach(parent, a, b);
      runLayout(parent);

      expect(a.transform.position.x).toBe(0);
      expect(b.transform.position.x).toBe(50);
    });

    it('justifyContent=center 剩余空间均分到两侧', () => {
      const { go: parent } = makeContainer('row-center', 300, 100, {
        direction: 'row',
        justifyContent: 'center',
      });
      const a = makeChild('a', 50, 30);
      const b = makeChild('b', 60, 30);
      attach(parent, a, b);
      runLayout(parent);

      // totalMain = 50 + 60 = 110, free = 190, center 起点 = 95
      expect(a.transform.position.x).toBe(95);
      expect(b.transform.position.x).toBe(95 + 50);
    });

    it('justifyContent=space-between 首末贴边,剩余空间均分到中间', () => {
      const { go: parent } = makeContainer('row-between', 300, 100, {
        direction: 'row',
        justifyContent: 'space-between',
      });
      const a = makeChild('a', 50, 30);
      const b = makeChild('b', 60, 30);
      const c = makeChild('c', 40, 30);
      attach(parent, a, b, c);
      runLayout(parent);

      // free = 300 - 150 = 150, gaps = 150 / 2 = 75
      expect(a.transform.position.x).toBe(0);
      expect(b.transform.position.x).toBe(50 + 75);
      expect(c.transform.position.x).toBe(50 + 75 + 60 + 75);
    });
  });

  describe('column 方向布局', () => {
    it('column + alignItems=center 子元素水平居中,垂直依次堆叠', () => {
      const { go: parent } = makeContainer('col-center', 200, 400, {
        direction: 'column',
        alignItems: 'center',
      });
      const a = makeChild('a', 80, 40);
      const b = makeChild('b', 60, 50);
      attach(parent, a, b);
      runLayout(parent);

      // 主轴 (Y) start: a at 0, b at 40
      expect(a.transform.position.y).toBe(0);
      expect(b.transform.position.y).toBe(40);
      // 交叉轴 (X) center: a 居中 (200-80)/2=60, b (200-60)/2=70
      expect(a.transform.position.x).toBe(60);
      expect(b.transform.position.x).toBe(70);
    });
  });

  describe('flexGrow / flexShrink', () => {
    it('flexGrow 按权重瓜分剩余空间', () => {
      const { go: parent } = makeContainer('grow', 300, 100, { direction: 'row' });
      const { go: a } = makeFlexChild('a', 40, 30, { flexGrow: 1 });
      const { go: b } = makeFlexChild('b', 40, 30, { flexGrow: 3 });
      attach(parent, a, b);
      runLayout(parent);

      // totalMain = 80, free = 220, totalGrow = 4
      // a.width = 40 + 220 * 1/4 = 95, b.width = 40 + 220 * 3/4 = 205
      expect(a.transform.size.width).toBe(95);
      expect(b.transform.size.width).toBe(205);
      expect(a.transform.position.x).toBe(0);
      expect(b.transform.position.x).toBe(95);
    });

    it('flexShrink 在空间不足时按权重收缩', () => {
      const { go: parent } = makeContainer('shrink', 100, 100, { direction: 'row' });
      const { go: a } = makeFlexChild('a', 80, 30, { flexShrink: 1 });
      const { go: b } = makeFlexChild('b', 80, 30, { flexShrink: 1 });
      attach(parent, a, b);
      runLayout(parent);

      // totalMain = 160, free = -60, totalShrink = 2
      // 每个 -= 60 * 1/2 = 30, 终值 = 50
      expect(a.transform.size.width).toBe(50);
      expect(b.transform.size.width).toBe(50);
      expect(a.transform.position.x).toBe(0);
      expect(b.transform.position.x).toBe(50);
    });
  });

  describe('alignItems / alignSelf', () => {
    it('alignItems=center 所有子元素交叉轴居中', () => {
      const { go: parent } = makeContainer('align', 300, 100, {
        direction: 'row',
        alignItems: 'center',
      });
      const a = makeChild('a', 50, 30);
      const b = makeChild('b', 50, 50);
      attach(parent, a, b);
      runLayout(parent);

      expect(a.transform.position.y).toBe((100 - 30) / 2);
      expect(b.transform.position.y).toBe((100 - 50) / 2);
    });

    it('alignSelf 覆盖父 alignItems', () => {
      const { go: parent } = makeContainer('align-self', 300, 100, {
        direction: 'row',
        alignItems: 'start',
      });
      const a = makeChild('a', 50, 30);
      const { go: b } = makeFlexChild('b', 50, 40, { alignSelf: 'end' });
      attach(parent, a, b);
      runLayout(parent);

      expect(a.transform.position.y).toBe(0);
      // alignSelf=end -> y = 100 - 40 = 60
      expect(b.transform.position.y).toBe(100 - 40);
    });

    it('alignItems=stretch 子元素被拉伸到容器交叉轴', () => {
      const { go: parent } = makeContainer('stretch', 300, 100, {
        direction: 'row',
        alignItems: 'stretch',
      });
      const a = makeChild('a', 50, 30);
      attach(parent, a);
      runLayout(parent);

      expect(a.transform.size.height).toBe(100);
      expect(a.transform.position.y).toBe(0);
    });
  });

  describe('padding / gap / margin', () => {
    it('padding 收缩可用空间,主轴起点偏移', () => {
      const { go: parent } = makeContainer('pad', 300, 100, {
        direction: 'row',
        padding: [10, 20],
      });
      const a = makeChild('a', 50, 30);
      const b = makeChild('b', 60, 30);
      attach(parent, a, b);
      runLayout(parent);

      // padding-left = 20 -> a.x 起始 20
      expect(a.transform.position.x).toBe(20);
      expect(b.transform.position.x).toBe(20 + 50);
      // padding-top = 10 -> y 偏移
      expect(a.transform.position.y).toBe(10);
    });

    it('gap 在每两个子元素之间增加间距', () => {
      const { go: parent } = makeContainer('gap', 400, 100, { direction: 'row', gap: 16 });
      const a = makeChild('a', 50, 30);
      const b = makeChild('b', 60, 30);
      const c = makeChild('c', 40, 30);
      attach(parent, a, b, c);
      runLayout(parent);

      expect(a.transform.position.x).toBe(0);
      expect(b.transform.position.x).toBe(50 + 16);
      expect(c.transform.position.x).toBe(50 + 16 + 60 + 16);
    });

    it('LayoutChild margin 影响子元素间距和起点', () => {
      const { go: parent } = makeContainer('margin', 400, 100, { direction: 'row' });
      const { go: a } = makeFlexChild('a', 50, 30, { margin: [0, 8] }); // left/right = 8
      const b = makeChild('b', 60, 30);
      attach(parent, a, b);
      runLayout(parent);

      // a 主轴起点 = 0 + margin.left(8) = 8
      expect(a.transform.position.x).toBe(8);
      // 推进:mainOffset += a.width(50) + margin.left(8) + margin.right(8) + gap(0) = 66
      // b 主轴起点 = 66 + 0(margin) = 66
      expect(b.transform.position.x).toBe(66);
    });
  });

  describe('fixedSize / 嵌套 / 边界', () => {
    it('fixedSize 排除参与 measure 的实际尺寸', () => {
      // measure 时,LayoutChild.fixedSize 会被用来代替 transform.size 计算父 autoSize。
      // 这里验证 measure 后父容器尺寸符合 fixedSize。
      const parent = new GameObject('auto', { size: { width: 0, height: 0 } });
      const layout = new Layout();
      parent.addComponent(layout);
      layout.init({ direction: 'row', autoSize: true });

      const { go: a } = makeFlexChild('a', 10, 10, { fixedSize: { width: 80, height: 60 } });
      const b = makeChild('b', 20, 30);
      attach(parent, a, b);
      runLayout(parent);

      // 父 autoSize=true -> width = 80(fixed) + 20 = 100, height = max(60, 30) = 60
      expect(parent.transform.size.width).toBe(100);
      expect(parent.transform.size.height).toBe(60);
    });

    it('嵌套布局:内层 row 在外层 column 中正确堆叠', () => {
      const { go: outer } = makeContainer('outer', 300, 200, {
        direction: 'column',
      });
      const { go: row1 } = makeContainer('row1', 300, 50, { direction: 'row' });
      const { go: row2 } = makeContainer('row2', 300, 60, { direction: 'row' });
      const a = makeChild('a', 30, 30);
      const b = makeChild('b', 40, 40);
      attach(row1, a);
      attach(row2, b);
      attach(outer, row1, row2);
      runLayout(outer, row1, row2);

      // 外层 column:row1 at y=0, row2 at y=50
      expect(row1.transform.position.y).toBe(0);
      expect(row2.transform.position.y).toBe(50);
      // 内层 row1:a at x=0
      expect(a.transform.position.x).toBe(0);
      // 内层 row2:b at x=0
      expect(b.transform.position.x).toBe(0);
    });

    it('空容器(无子元素)lateUpdate 不抛错且不写 size', () => {
      const parent = new GameObject('empty', { size: { width: 50, height: 50 } });
      const layout = new Layout();
      parent.addComponent(layout);
      layout.init({ autoSize: false });
      expect(() => runLayout(parent)).not.toThrow();
      // 容器自身 size 未被改写
      expect(parent.transform.size.width).toBe(50);
      expect(parent.transform.size.height).toBe(50);
    });

    it('LayoutSystem.systemName 暴露正确名字', () => {
      expect(LayoutSystem.systemName).toBe('LayoutSystem');
    });
  });
});
