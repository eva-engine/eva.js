import GameObject from '../core/GameObject';
import { TransformParams } from '../core/Transform';

/**
 * 场景类，游戏对象的容器
 *
 * Scene 是一个特殊的 GameObject，用于管理和组织游戏中的所有游戏对象。
 * 它提供了游戏对象的添加、移除、销毁等管理功能，
 * 可以理解为游戏世界的一个独立层级或关卡。
 *
 * @example
 * ```typescript
 * const scene = new Scene('mainScene');
 *
 * const player = new GameObject('player');
 * scene.addGameObject(player);
 *
 * const enemy = new GameObject('enemy');
 * scene.addGameObject(enemy);
 * ```
 */
class Scene extends GameObject {
  /** 场景中的所有游戏对象列表 */
  gameObjects: GameObject[] = [];

  /** 场景关联的画布元素 */
  canvas: HTMLCanvasElement;

  /** 按名字索引游戏对象，用于 O(1) 查找 */
  private _nameIndex: Map<string, Set<GameObject>> = new Map();

  /**
   * 构造一个新的场景
   * @param name - 场景名称
   * @param obj - 可选的 Transform 初始化参数
   */
  constructor(name, obj?: TransformParams) {
    super(name, obj);
    this.scene = this; // gameObject.scene = this
  }

  /**
   * 向场景添加游戏对象
   *
   * 将游戏对象加入场景的管理列表，
   * 并标记其 Transform 组件为在场景中。
   *
   * @param gameObject - 要添加的游戏对象
   */
  addGameObject(gameObject: GameObject) {
    this.gameObjects.push(gameObject);
    if (gameObject.transform) {
      gameObject.transform.inScene = true;
    }
    if (gameObject.name) {
      let set = this._nameIndex.get(gameObject.name);
      if (!set) {
        set = new Set();
        this._nameIndex.set(gameObject.name, set);
      }
      set.add(gameObject);
    }
  }

  /**
   * 从场景移除游戏对象
   *
   * 将游戏对象从场景的管理列表中移除，
   * 但不会销毁游戏对象本身。
   *
   * @param gameObject - 要移除的游戏对象
   */
  removeGameObject(gameObject: GameObject) {
    const index = this.gameObjects.indexOf(gameObject);
    if (index === -1) return;
    if (gameObject.transform) {
      gameObject.transform.inScene = false;
    }
    this.gameObjects.splice(index, 1);
    if (gameObject.name) {
      const set = this._nameIndex.get(gameObject.name);
      if (set) {
        set.delete(gameObject);
        if (set.size === 0) {
          this._nameIndex.delete(gameObject.name);
        }
      }
    }
  }

  /**
   * 通过名字查找场景中的游戏对象
   *
   * @param name - 游戏对象名称
   * @returns 第一个匹配且未销毁的游戏对象，无则返回 null
   */
  findByName(name: string): GameObject | null {
    const set = this._nameIndex.get(name);
    if (!set) return null;
    for (const go of set) {
      if (!go.destroyed) return go;
    }
    return null;
  }

  /**
   * 通过名字查找场景中所有匹配的游戏对象
   *
   * @param name - 游戏对象名称
   * @returns 所有匹配且未销毁的游戏对象数组
   */
  findAllByName(name: string): GameObject[] {
    const set = this._nameIndex.get(name);
    if (!set) return [];
    const result: GameObject[] = [];
    for (const go of set) {
      if (!go.destroyed) result.push(go);
    }
    return result;
  }

  destroy() {
    this.scene = null;
    super.destroy();
    this.gameObjects = null;
    this.canvas = null;
    this._nameIndex = null;
  }
}

export default Scene;
