import { Transform } from '@eva/eva.js';
import { Point, ObservablePoint } from 'pixi.js';
import { Container } from '@eva/renderer-adapter';

export default class ContainerManager {
  containerMap: { [propName: number]: Container } = {};
  addContainer({ name, container }: { name: number; container: Container }) {
    this.containerMap[name] = container;
  }
  getContainer(name: number) {
    return this.containerMap[name];
  }
  removeContainer(name: number) {
    this.containerMap[name]?.destroy({ children: true });
    delete this.containerMap[name];
  }
  updateTransform({ name, transform }: { name: number; transform: Transform }) {
    const container = this.containerMap[name];
    if (!container) return;
    const { anchor, origin, position, rotation, scale, size, skew } = transform;
    container.rotation = rotation;
    container.scale = scale as Point;
    container.pivot.x = size.width * origin.x;
    container.pivot.y = size.height * origin.y;
    container.skew = skew as ObservablePoint;
    let x = position.x;
    let y = position.y;
    if (transform.parent) {
      const parent = transform.parent;
      x = x + parent.size.width * anchor.x;
      y = y + parent.size.height * anchor.y;
    }

    container.position = { x, y } as Point;
  }
}
