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
  }

  /**
   * 销毁场景
   *
   * 清理场景的所有资源，包括所有游戏对象。
   * 销毁后的场景不应再被使用。
   */
  destroy() {
    this.scene = null;
    super.destroy();
    this.gameObjects = null;
    this.canvas = null;
  }
}

export default Scene;
