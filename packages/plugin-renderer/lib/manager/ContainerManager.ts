import { GameObject, Transform } from '@eva/eva.js';
import { Point, ObservablePoint } from 'pixi.js';
import { Container } from '@eva/renderer-adapter';

export default class ContainerManager {
  containerMap: { [propName: number]: Container } = {};
  gameObjectMap: { [propName: string]: GameObject } = {};

  addContainer({ name, container, gameObject }: { name: number; container: Container; gameObject: GameObject }) {
    this.containerMap[name] = container;
    container.gName = gameObject.name || name;
    this.gameObjectMap[gameObject.name || name] = gameObject;
  }

  getContainer(name: number) {
    return this.containerMap[name];
  }

  removeContainer(name: number) {
    const container = this.containerMap[name];
    if (container) {
      delete this.gameObjectMap[container.gName];
      container.destroy({ children: true });
    }
    delete this.containerMap[name];
  }

  getGameObjectByName(name: string): GameObject | undefined {
    return this.gameObjectMap[name];
  }

  updateTransform({ name, transform }: { name: number; transform: Transform }) {
    const container = this.containerMap[name];
    if (!container || !transform) return;
    const { anchor, origin, position, rotation, scale, size, skew } = transform;
    container.rotation = rotation;
    // @ts-ignore
    container.scale = scale as Point;
    container.pivot.x = size.width * origin.x;
    container.pivot.y = size.height * origin.y;
    // @ts-ignore
    container.skew = skew as ObservablePoint;
    let x = position.x;
    let y = position.y;
    if (transform.parent) {
      const parent = transform.parent;
      x = x + parent.size.width * anchor.x;
      y = y + parent.size.height * anchor.y;
    }

    // @ts-ignore
    container.position = { x, y } as Point;
  }
}
