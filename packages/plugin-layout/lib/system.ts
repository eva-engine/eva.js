import { System, decorators } from '@eva/eva.js';
import Layout from './layout';
import LayoutChild from './layoutChild';
import type { Padding } from './types';

interface LayoutNode {
  gameObject: any;
  layout: Layout;
  depth: number;
}

/**
 * LayoutSystem — 在 lateUpdate 中执行布局计算
 *
 * 时序：TextSystem.update() 回写 text size → LayoutSystem.lateUpdate() 读取并布局
 * 布局写回后立即同步到 RendererSystem 的 pixi container，确保当帧渲染无闪烁。
 */
@decorators.componentObserver({
  Layout: [
    { prop: ['direction'], deep: false },
    { prop: ['gap'], deep: false },
    { prop: ['justifyContent'], deep: false },
    { prop: ['alignItems'], deep: false },
    { prop: ['autoSize'], deep: false },
    { prop: ['padding'], deep: true },
  ],
  LayoutChild: [
    { prop: ['flexGrow'], deep: false },
    { prop: ['flexShrink'], deep: false },
    { prop: ['alignSelf'], deep: false },
    { prop: ['margin'], deep: true },
    { prop: ['fixedSize'], deep: true },
  ],
})
export default class LayoutSystem extends System {
  static systemName = 'LayoutSystem';

  /** 脏节点集合 (gameObject.id) */
  private dirtySet = new Set<number>();

  /** 上一帧各子元素的 size 快照 */
  private sizeSnapshot = new Map<number, { w: number; h: number }>();

  /** 首帧需要布局的容器 */
  private pendingFirstLayout = new Set<number>();

  /**
   * RendererSystem 的 containerManager 引用（延迟获取）
   * 用于在 lateUpdate 中布局后立即同步 transform → pixi container，
   * 避免因 RendererSystem.update() 已执行完毕而导致的 1 帧延迟。
   */
  private _containerManager: any = null;
  private _containerManagerResolved = false;

  private _reordered = false;

  init() {}

  /**
   * 调整系统执行顺序：将 LayoutSystem 移到 RendererSystem 之前。
   *
   * Eva.js 的 System.update() / lateUpdate() 按 game.systems 数组顺序执行。
   * RendererSystem 必须最先注册（init 时创建 pixi Application），
   * 但渲染（lateUpdate）应在布局计算之后。
   *
   * 调整后的 lateUpdate 顺序：
   *   TextSystem → LayoutSystem（计算布局 + 同步 pixi）→ RendererSystem（渲染）
   * 确保新增子元素在首帧就被正确定位，消除闪烁。
   */
  private reorderBeforeRenderer() {
    const systems: any[] = (this.game as any).systems;
    if (!systems) return;

    const myIdx = systems.indexOf(this);
    let rendererIdx = -1;
    for (let i = 0; i < systems.length; i++) {
      if (i !== myIdx && (
        systems[i].containerManager ||
        (systems[i].constructor as any).systemName === 'Renderer'
      )) {
        rendererIdx = i;
        break;
      }
    }

    // 仅当 LayoutSystem 在 RendererSystem 之后时才需要调整
    if (rendererIdx >= 0 && myIdx > rendererIdx) {
      systems.splice(myIdx, 1);
      systems.splice(rendererIdx, 0, this);
    }
  }

  lateUpdate() {
    if (!this._reordered) {
      this._reordered = true;
      this.reorderBeforeRenderer();
    }
    this.consumeObserverChanges();
    this.detectSizeChanges();

    // 首帧标记的容器也加入脏集合
    for (const id of this.pendingFirstLayout) {
      this.dirtySet.add(id);
    }
    this.pendingFirstLayout.clear();

    if (this.dirtySet.size > 0) {
      this.runLayout();
      this.syncToRenderer();
      this.refreshSizeSnapshots();
      this.dirtySet.clear();
    }
  }

  /**
   * 消费 componentObserver 的变化事件
   */
  private consumeObserverChanges() {
    const changes = this.componentObserver.clear();
    if (!changes || changes.length === 0) return;

    for (const changed of changes) {
      if (!changed || !changed.gameObject) continue;
      const go = changed.gameObject;

      // 如果变化的是 Layout 组件，标记自身
      if (go.getComponent('Layout')) {
        this.dirtySet.add(go.id);
      }

      // 如果变化的是 LayoutChild 组件，标记其父容器
      if (go.getComponent('LayoutChild') && go.transform.parent) {
        const parentGo = go.transform.parent.gameObject;
        if (parentGo && parentGo.getComponent('Layout')) {
          this.dirtySet.add(parentGo.id);
        }
      }
    }
  }

  /**
   * 检测子元素 size 变化（如 Text 内容变化导致的 size 变化）
   */
  private detectSizeChanges() {
    const gameObjects = this.game.gameObjects;
    if (!gameObjects) return;

    for (const go of gameObjects) {
      const layout = go.getComponent('Layout') as Layout;
      if (!layout) continue;

      const children = go.transform.children;
      if (!children || children.length === 0) continue;

      for (const childTransform of children) {
        const childGo = childTransform.gameObject;
        if (!childGo) continue;

        const id = childGo.id;
        const w = childGo.transform.size.width;
        const h = childGo.transform.size.height;
        const prev = this.sizeSnapshot.get(id);

        if (!prev) {
          // 首次见到的子元素，记录快照并标记脏
          this.sizeSnapshot.set(id, { w, h });
          this.pendingFirstLayout.add(go.id);
        } else if (prev.w !== w || prev.h !== h) {
          this.sizeSnapshot.set(id, { w, h });
          this.dirtySet.add(go.id);
        }
      }
    }
  }

  /**
   * 刷新所有 Layout 容器子元素的 size 快照
   * 在 runLayout() 之后调用，避免 measure 改变的 autoSize 在下帧被误判为脏
   */
  private refreshSizeSnapshots() {
    const gameObjects = this.game.gameObjects;
    if (!gameObjects) return;

    for (const go of gameObjects) {
      const layout = go.getComponent('Layout') as Layout;
      if (!layout) continue;

      const children = go.transform.children;
      if (!children || children.length === 0) continue;

      for (const childTransform of children) {
        const childGo = childTransform.gameObject;
        if (!childGo) continue;

        this.sizeSnapshot.set(childGo.id, {
          w: childGo.transform.size.width,
          h: childGo.transform.size.height,
        });
      }
    }
  }

  /**
   * 将布局结果立即同步到 pixi container
   *
   * 背景：Eva.js 帧循环中 System.update() 先于 System.lateUpdate() 执行。
   * RendererSystem.update() 将 transform 同步到 pixi container，
   * 但 LayoutSystem.lateUpdate() 在其之后才写回新的 position/size，
   * 导致当帧渲染仍使用旧值（1 帧延迟 → 闪烁）。
   *
   * 此方法在 runLayout() 后主动调用 containerManager.updateTransform()，
   * 确保 RendererSystem.lateUpdate() 渲染时 pixi container 已持有最新值。
   */
  private syncToRenderer() {
    // 延迟获取 containerManager（避免硬依赖 @eva/plugin-renderer）
    if (!this._containerManagerResolved) {
      this._containerManagerResolved = true;
      for (const sys of (this.game as any).systems) {
        if (sys.containerManager && typeof sys.containerManager.updateTransform === 'function') {
          this._containerManager = sys.containerManager;
          break;
        }
      }
    }

    const cm = this._containerManager;
    if (!cm) return;

    // 仅同步 Layout 容器及其子元素（而非全量 gameObjects）
    const gameObjects = this.game.gameObjects;
    if (!gameObjects) return;

    for (const go of gameObjects) {
      const layout = go.getComponent('Layout') as Layout;
      if (!layout) continue;

      // 同步容器自身（autoSize 可能改变了 size）
      cm.updateTransform({ name: go.id, transform: go.transform });

      // 同步所有子元素（position 被 layoutNode 修改）
      const children = go.transform.children;
      if (!children) continue;
      for (const childTransform of children) {
        const childGo = childTransform.gameObject;
        if (!childGo) continue;
        cm.updateTransform({ name: childGo.id, transform: childGo.transform });
      }
    }
  }

  /**
   * 执行布局：收集所有 Layout 容器 → 按深度排序 → measure → layout
   */
  private runLayout() {
    const layoutNodes = this.collectLayoutNodes();
    if (layoutNodes.length === 0) return;

    // Pass 1: Measure（自底向上，深层先算）
    layoutNodes.sort((a, b) => b.depth - a.depth);
    for (const node of layoutNodes) {
      this.measure(node);
    }

    // Pass 2: Layout（自顶向下）
    layoutNodes.sort((a, b) => a.depth - b.depth);
    for (const node of layoutNodes) {
      this.layoutNode(node);
    }
  }

  /**
   * 收集所有带 Layout 组件的 GameObject，计算深度
   */
  private collectLayoutNodes(): LayoutNode[] {
    const nodes: LayoutNode[] = [];
    const gameObjects = this.game.gameObjects;
    if (!gameObjects) return nodes;

    for (const go of gameObjects) {
      const layout = go.getComponent('Layout') as Layout;
      if (!layout) continue;

      const depth = this.getDepth(go);
      nodes.push({ gameObject: go, layout, depth });
    }

    return nodes;
  }

  /**
   * 计算 GameObject 在 Transform 树中的深度
   */
  private getDepth(go: any): number {
    let depth = 0;
    let current = go.transform;
    while (current.parent) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  /**
   * Measure Pass — 自底向上计算容器 autoSize
   */
  private measure(node: LayoutNode) {
    const { gameObject, layout } = node;
    const { padding, gap, direction, autoSize } = layout;
    const children = gameObject.transform.children;
    if (!children || children.length === 0) return;

    const isRow = direction === 'row';
    let mainSize = 0;
    let crossSize = 0;

    for (let i = 0; i < children.length; i++) {
      const childGo = children[i].gameObject;
      if (!childGo) continue;

      const lc = childGo.getComponent('LayoutChild') as LayoutChild | null;
      const margin: Padding = lc ? lc.margin : { top: 0, right: 0, bottom: 0, left: 0 };

      const childW = lc?.fixedSize?.width ?? childGo.transform.size.width;
      const childH = lc?.fixedSize?.height ?? childGo.transform.size.height;

      const childMainSize = isRow ? childW : childH;
      const childCrossSize = isRow ? childH : childW;
      const mainMargin = isRow ? margin.left + margin.right : margin.top + margin.bottom;
      const crossMargin = isRow ? margin.top + margin.bottom : margin.left + margin.right;

      mainSize += childMainSize + mainMargin;
      if (i > 0) mainSize += gap;
      crossSize = Math.max(crossSize, childCrossSize + crossMargin);
    }

    const contentWidth = isRow
      ? mainSize + padding.left + padding.right
      : crossSize + padding.left + padding.right;
    const contentHeight = isRow
      ? crossSize + padding.top + padding.bottom
      : mainSize + padding.top + padding.bottom;

    const transform = gameObject.transform;
    if (autoSize === true) {
      transform.size.width = contentWidth;
      transform.size.height = contentHeight;
    } else if (autoSize === 'width') {
      transform.size.width = contentWidth;
    } else if (autoSize === 'height') {
      transform.size.height = contentHeight;
    }
  }

  /**
   * Layout Pass — 自顶向下分配子元素位置
   */
  private layoutNode(node: LayoutNode) {
    const { gameObject, layout } = node;
    const { padding, gap, direction, justifyContent, alignItems } = layout;
    const children = gameObject.transform.children;
    if (!children || children.length === 0) return;

    const isRow = direction === 'row';
    const containerSize = gameObject.transform.size;

    // 可用空间
    const availableMain = isRow
      ? containerSize.width - padding.left - padding.right
      : containerSize.height - padding.top - padding.bottom;
    const availableCross = isRow
      ? containerSize.height - padding.top - padding.bottom
      : containerSize.width - padding.left - padding.right;

    // 第一遍：收集子元素信息
    let totalMain = 0;
    let totalGrow = 0;
    let totalShrink = 0;

    const childInfos: Array<{
      childGo: any;
      lc: LayoutChild | null;
      margin: Padding;
      mainSize: number;
      crossSize: number;
    }> = [];

    for (let i = 0; i < children.length; i++) {
      const childGo = children[i].gameObject;
      if (!childGo) continue;

      const lc = childGo.getComponent('LayoutChild') as LayoutChild | null;
      const margin: Padding = lc ? lc.margin : { top: 0, right: 0, bottom: 0, left: 0 };
      const mainMargin = isRow ? margin.left + margin.right : margin.top + margin.bottom;

      const mainSize = isRow ? childGo.transform.size.width : childGo.transform.size.height;
      const crossSize = isRow ? childGo.transform.size.height : childGo.transform.size.width;

      totalMain += mainSize + mainMargin + (childInfos.length > 0 ? gap : 0);
      totalGrow += lc?.flexGrow ?? 0;
      totalShrink += lc?.flexShrink ?? 0;

      childInfos.push({ childGo, lc, margin, mainSize, crossSize });
    }

    // 剩余空间
    const freeSpace = availableMain - totalMain;

    // 主轴起始偏移
    let mainOffset = isRow ? padding.left : padding.top;

    // justifyContent 起始偏移（仅在没有 flexGrow 且有剩余空间时生效）
    let spaceBetween = 0;
    let spaceAround = 0;

    if (freeSpace > 0 && totalGrow === 0) {
      switch (justifyContent) {
        case 'center':
          mainOffset += freeSpace / 2;
          break;
        case 'end':
          mainOffset += freeSpace;
          break;
        case 'space-between':
          if (childInfos.length > 1) {
            spaceBetween = freeSpace / (childInfos.length - 1);
          }
          break;
        case 'space-around':
          if (childInfos.length > 0) {
            spaceAround = freeSpace / childInfos.length;
            mainOffset += spaceAround / 2;
          }
          break;
      }
    }

    // 第二遍：逐个定位
    for (let i = 0; i < childInfos.length; i++) {
      const { childGo, lc, margin, mainSize, crossSize } = childInfos[i];

      // 弹性空间分配
      let finalMainSize = mainSize;
      if (freeSpace > 0 && totalGrow > 0) {
        finalMainSize += freeSpace * ((lc?.flexGrow ?? 0) / totalGrow);
      } else if (freeSpace < 0 && totalShrink > 0) {
        finalMainSize += freeSpace * ((lc?.flexShrink ?? 0) / totalShrink);
      }

      // 主轴定位
      const mainMarginStart = isRow ? margin.left : margin.top;
      const mainMarginEnd = isRow ? margin.right : margin.bottom;
      const mainPos = mainOffset + mainMarginStart;

      // 交叉轴定位
      const crossMarginStart = isRow ? margin.top : margin.left;
      const crossMarginEnd = isRow ? margin.bottom : margin.right;
      const align = lc?.alignSelf ?? alignItems;
      const crossPadStart = isRow ? padding.top : padding.left;

      let crossPos: number;
      let finalCrossSize = crossSize;

      switch (align) {
        case 'center':
          crossPos =
            crossPadStart +
            (availableCross - crossSize - crossMarginStart - crossMarginEnd) / 2 +
            crossMarginStart;
          break;
        case 'end':
          crossPos = crossPadStart + availableCross - crossSize - crossMarginEnd;
          break;
        case 'stretch':
          crossPos = crossPadStart + crossMarginStart;
          finalCrossSize = availableCross - crossMarginStart - crossMarginEnd;
          break;
        case 'start':
        default:
          crossPos = crossPadStart + crossMarginStart;
          break;
      }

      // 写回 transform
      if (isRow) {
        childGo.transform.position.x = mainPos;
        childGo.transform.position.y = crossPos;
        if (finalMainSize !== mainSize) childGo.transform.size.width = finalMainSize;
        if (finalCrossSize !== crossSize) childGo.transform.size.height = finalCrossSize;
      } else {
        childGo.transform.position.x = crossPos;
        childGo.transform.position.y = mainPos;
        if (finalMainSize !== mainSize) childGo.transform.size.height = finalMainSize;
        if (finalCrossSize !== crossSize) childGo.transform.size.width = finalCrossSize;
      }

      // 推进主轴偏移
      mainOffset += finalMainSize + mainMarginStart + mainMarginEnd + gap + spaceBetween + spaceAround;
    }
  }
}
