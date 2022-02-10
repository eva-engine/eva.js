import { Transform, GameObject } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';

export class EvaTransformHelper {
  constructor(private manager: ContainerManager, private scene: GameObject) { }

  updateChainTransform(go: GameObject) {
    if (
      go === this.scene ||
      !go.parent ||
      !this.manager.getContainer(go.parent.id)
    )
      return;
    if (go.parent !== this.scene) {
      this.updateChainTransform(go.parent);
    }
    this.manager.updateTransform({ name: go.id, transform: go.transform });

    this.manager
      .getContainer(go.id)
      .transform.updateTransform(
        this.manager.getContainer(go.parent.id).transform
      );
  }

  transformMatrix(target: Transform, parentTransform: Transform, origin = target.origin, anchor = target.anchor) {
    const pt = new PIXI.Transform();
    const worldMatrix = target.worldTransform as PIXI.Matrix;
    if (!worldMatrix) return;
    const parentWorldMatrix = parentTransform.worldTransform as PIXI.Matrix;
    const localMatrix = parentWorldMatrix.clone().invert().append(worldMatrix);
    localMatrix.decompose(pt);
    if (!localMatrix) {
      return;
    }
    const {
      size: { width, height },
    } = target;

    pt.position.x +=
      origin.x * width * localMatrix.a + origin.y * height * localMatrix.c;
    pt.position.y +=
      origin.x * width * localMatrix.b + origin.y * height * localMatrix.d;

    const newParentSize = parentTransform.size;
    return {
      size: {
        width,
        height,
      },
      origin: {
        x: origin.x,
        y: origin.y,
      },
      anchor: {
        x: anchor.x,
        y: anchor.y,
      },
      rotation: pt.rotation,
      scale: {
        x: pt.scale.x,
        y: pt.scale.y,
      },
      skew: {
        x: pt.skew.x,
        y: pt.skew.y,
      },
      position: {
        x: pt.position.x - anchor.x * newParentSize.width +
          (
            (origin.x - target.origin.x) * width * localMatrix.a
            + (origin.y - target.origin.y) * height * localMatrix.c
          ),
        y: pt.position.y - anchor.y * newParentSize.height +
          (
            (origin.x - target.origin.x) * width * localMatrix.b +
            (origin.y - target.origin.y) * height * localMatrix.d
          )
      }
    };
  }

  calculateTransformWhenChangeParent(
    go: GameObject,
    newParent: GameObject = this.scene
  ) {
    if (
      !go.parent ||
      !this.manager.getContainer(go.parent.id) ||
      !this.manager.getContainer(go.id)
    )
      return;
    this.updateChainTransform(go);
    this.updateChainTransform(newParent);
    return this.transformMatrix(go.transform, newParent.transform);
  }
}
