import GameObject from '../core/GameObject';
import { TransformParams } from '../core/Transform';

/**
 * Scene is a gameObject container
 */
class Scene extends GameObject {
  gameObjects: GameObject[] = [];
  canvas: HTMLCanvasElement;

  constructor(name, obj?: TransformParams) {
    super(name, obj);
    this.scene = this; // gameObject.scene = this
  }

  /**
   * Add gameObject
   * @param gameObject - game object
   */
  addGameObject(gameObject: GameObject) {
    this.gameObjects.push(gameObject);
    if (gameObject.transform) {
      gameObject.transform.inScene = true;
    }
  }

  /**
   * Remove gameObject
   * @param gameObject - game object
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
   * Destroy scene
   */
  destroy() {
    this.scene = null;
    super.destroy();
    this.gameObjects = null;
    this.canvas = null;
  }
}

export default Scene;
