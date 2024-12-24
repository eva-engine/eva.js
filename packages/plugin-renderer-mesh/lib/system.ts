import { GameObject, decorators, resource, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import { PerspectiveMesh as PerspectiveMeshComponent } from './perspective-mesh';
import { RendererSystem, Renderer } from '@eva/plugin-renderer';
import { PerspectiveMesh } from 'pixi.js';

@decorators.componentObserver({
  PerspectiveMesh: ['resource', '_forceUpdate'],
})
export class MeshSystem extends Renderer {
  static systemName = 'PerspectiveMesh';
  name: string = 'PerspectiveMesh';

  renderSystem: RendererSystem;

  meshes = {};

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }

  rendererUpdate(gameObject: GameObject): void {
    const { width, height } = gameObject.transform.size;
    if (this.meshes[gameObject.id]) {
      this.meshes[gameObject.id].width = width;
      this.meshes[gameObject.id].height = height;
    }
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'PerspectiveMesh') {
      const gameObjectId = changed.gameObject!.id;
      const component: PerspectiveMeshComponent = changed.component as PerspectiveMeshComponent;

      if (changed.type === OBSERVER_TYPE.ADD) {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const res = await resource.getResource(component.resource);
        const texture = res.data?.image;
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!texture) {
          console.error(`GameObject:${changed.gameObject!.name}'s Mesh resource load error`);
          return;
        }
        const mesh = new PerspectiveMesh({ texture: texture as any });
        if (component.corners) {
          this.meshes[changed.gameObject!.id].setCorners(
            component.corners.x0,
            component.corners.y0,
            component.corners.x1,
            component.corners.y1,
            component.corners.x2,
            component.corners.y2,
            component.corners.x3,
            component.corners.y3,
          );
        } else {
          mesh.setCorners(0, 0, texture.width, 0, texture.width, texture.height, 0, texture.height);
        }
        this.meshes[changed.gameObject!.id] = mesh;
        this.containerManager.getContainer(changed.gameObject!.id).addChildAt(mesh, 0);
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const res = await resource.getResource(component.resource);
        const texture = res.data?.image;
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!texture) {
          console.error(`GameObject:${changed.gameObject!.name}'s Mesh resource load error`);
          return;
        }
        this.meshes[changed.gameObject!.id].texture = texture;
        if (component.corners) {
          this.meshes[changed.gameObject!.id].setCorners(
            component.corners.x0,
            component.corners.y0,
            component.corners.x1,
            component.corners.y1,
            component.corners.x2,
            component.corners.y2,
            component.corners.x3,
            component.corners.y3,
          );
        }
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.increaseAsyncId(gameObjectId);
        const mesh = this.meshes[changed.gameObject!.id];
        this.containerManager.getContainer(changed.gameObject!.id).removeChild(mesh);
        mesh.destroy();
        delete this.meshes[changed.gameObject!.id];
      }
    }
  }
}
