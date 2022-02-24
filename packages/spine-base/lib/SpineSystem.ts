import { DisplayObject } from 'pixi.js';
import { decorators, ComponentChanged, OBSERVER_TYPE, resource, UpdateParams } from '@eva/eva.js';
import { Renderer, RendererSystem, RendererManager, ContainerManager } from '@eva/plugin-renderer';
import Spine from './Spine';
// import pixiSpine from './pixi-spine.js';
import getSpineData, { releaseSpineData } from './SpineData';
const MaxRetryCount = 20;

@decorators.componentObserver({
  Spine: ['resource'],
})
export default class SpineSystem extends Renderer {
  static systemName = 'SpineSystem';
  armatures: Record<number, DisplayObject> = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  pixiSpine: any;
  init({ pixiSpine }) {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
    this.pixiSpine = pixiSpine
    this.game.canvas.addEventListener(
      'webglcontextrestored',
      () => {
        // 重建所有spine
        const objs = this.game.gameObjects;
        // clearCache();
        let toAdd: any[] = [];
        for (let k in this.armatures) {
          const id = +k;
          for (let i = 0; i < objs.length; ++i) {
            let obj = objs[i];
            if (obj.id === id) {
              let sp = obj.getComponent(Spine);
              if (sp) {
                this.remove({
                  type: OBSERVER_TYPE.REMOVE,
                  gameObject: obj,
                  component: sp,
                  componentName: Spine.componentName,
                });
                toAdd.push({
                  type: OBSERVER_TYPE.ADD,
                  gameObject: obj,
                  component: sp,
                  componentName: Spine.componentName,
                });
              }
              break;
            }
          }
        }

        setTimeout(() => {
          toAdd.forEach(obj => {
            this.add(obj);
          });
        }, 1000);
      },
      false,
    );
  }
  update(e: UpdateParams) {
    for (let key in this.armatures) {
      // TODO: 类型
      // @ts-ignore
      this.armatures[key].update(e.deltaTime * 0.001)
      this.armatures[key].updateTransform()
    }
    super.update()
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'Spine') {
      if (changed.type === OBSERVER_TYPE.ADD) {
        this.add(changed);
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        switch (changed.prop.prop[0]) {
          case 'resource':
            this.change(changed);
            break;
        }
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.remove(changed);
      }
    }
  }
  async add(changed: ComponentChanged, count?: number) {
    const component = changed.component as Spine;
    clearTimeout(component.addHandler);
    const gameObjectId = changed.gameObject.id;
    const asyncId = this.increaseAsyncId(gameObjectId);
    const res = await resource.getResource(component.resource);
    if (!this.validateAsyncId(gameObjectId, asyncId)) return;
    const spineData = await getSpineData(res, this.pixiSpine);
    if (!this.validateAsyncId(gameObjectId, asyncId)) return;
    if (!spineData) {
      component.addHandler = setTimeout(() => {
        if (!component.destroied) {
          if (count === undefined) {
            // 最大重试次数
            count = MaxRetryCount;
          }
          count--;
          if (count > 0) {
            this.add(changed, count);
          } else {
            console.log('retry exceed max times', component.resource);
          }
        }
      }, 1000);
      return;
    }
    this.remove(changed);
    const container = this.renderSystem?.containerManager?.getContainer(changed.gameObject.id);
    if (!container) {
      // console.warn('添加spine的container不存在');
      return;
    }
    component.lastResource = component.resource
    // @ts-ignore
    const armature: any = new this.pixiSpine.Spine(spineData);
    this.armatures[changed.gameObject.id] = armature;
    if (changed.gameObject && changed.gameObject.transform) {
      const tran = changed.gameObject.transform;
      armature.x = tran.size.width * tran.origin.x;
      armature.y = tran.size.height * tran.origin.y;
    }

    container.addChildAt(armature, 0);
    /** 保证第一帧显示正常 */
    armature.update()
    armature.updateTransform()
    component.armature = armature;
    // @ts-ignore
    component.emit('loaded', { resource: component.resource });
    armature.state.addListener({
      // @ts-ignore
      start: (track, event) => {
        component.emit('start', { track, name: track.animation.name });
      },
      // @ts-ignore
      complete: (track, event) => {
        component.emit('complete', { track, name: track.animation.name });
      },
      // @ts-ignore
      interrupt: (track, event) => {
        component.emit('interrupt', { track, name: track.animation.name });
      },
      end: (
        track, // @ts-ignore
        event,
      ) => {
        component.emit('end', { track, name: track.animation.name });
      },
      event: (track, event) => {
        // @ts-ignore
        component.emit('event', track, event);
      },
    });
  }
  change(changed: ComponentChanged) {
    this.remove(changed);
    this.add(changed);
  }
  async remove(changed: ComponentChanged) {
    this.increaseAsyncId(changed.gameObject.id);
    const component = changed.component as Spine;
    clearTimeout(component.addHandler);
    const armature = this.armatures[changed.gameObject.id];

    const container = this.renderSystem?.containerManager?.getContainer(changed.gameObject.id);
    if (container && armature) {
      container.removeChild(armature);
    } else {
      // console.warn('remove时container不存在');
    }

    if (component.armature) {
      component.armature.destroy({ children: true });
      const res = await resource.getResource(component.lastResource);
      releaseSpineData(res.name, res.data?.image?.src);
    }

    component.armature = null;
    delete this.armatures[changed.gameObject.id];
    if (changed.type === OBSERVER_TYPE.CHANGE) {
      // // @ts-ignore
      // component.removeAllListeners();
    }
  }
}
