import { Container } from 'pixi.js';
import { decorators, ComponentChanged, OBSERVER_TYPE, resource, UpdateParams } from '@eva/eva.js';
import { Renderer, RendererSystem, RendererManager, ContainerManager } from '@eva/plugin-renderer';
import Spine from './Spine';
import getSpineData, { releaseSpineData } from './SpineData';
const MaxRetryCount = 20;

/**
 * Spine 骨骼动画系统
 *
 * SpineSystem 负责管理所有 Spine 组件的骨架创建、动画更新和资源管理。
 * 系统会监听 Spine 组件的变化，自动加载骨骼数据并创建动画实例，
 * 并在每帧更新所有活跃的 Spine 动画。
 *
 * 主要功能：
 * - 骨骼数据加载和缓存
 * - 动画实例创建和销毁
 * - 每帧动画状态更新
 * - WebGL 上下文恢复处理
 * - 资源重试机制
 */
@decorators.componentObserver({
  Spine: ['resource'],
})
export default class SpineSystem extends Renderer {
  /** 系统名称 */
  static systemName = 'SpineSystem';

  /** 骨架实例映射表（游戏对象 ID -> 骨架容器） */
  armatures: Record<number, Container> = {};

  /** 渲染系统引用 */
  renderSystem: RendererSystem;

  /** 渲染器管理器 */
  rendererManager: RendererManager;

  /** 容器管理器 */
  containerManager: ContainerManager;

  /** PixiJS Spine 插件实例 */
  pixiSpine: any;

  /**
   * 初始化系统
   * @param obj - 初始化参数
   * @param obj.pixiSpine - PixiJS Spine 插件实例
   */
  init({ pixiSpine }) {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
    this.pixiSpine = pixiSpine;
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

  /**
   * 每帧更新所有 Spine 动画
   * @param e - 更新参数，包含帧间隔时间
   */
  update(e: UpdateParams) {
    for (let key in this.armatures) {
      // TODO: 类型
      // @ts-ignore
      this.armatures[key].update(e.deltaTime * 0.001);
    }
    super.update();
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
    const spineData = await getSpineData(res, component.scale, this.pixiSpine);
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
    component.lastResource = component.resource;
    // @ts-ignore
    const armature: any = new this.pixiSpine.Spine({
      skeletonData: spineData,
      autoUpdate: false,
    });

    this.armatures[changed.gameObject.id] = armature;
    if (changed.gameObject && changed.gameObject.transform) {
      const tran = changed.gameObject.transform;
      armature.x = tran.size.width * tran.origin.x;
      armature.y = tran.size.height * tran.origin.y;
    }

    container.addChildAt(armature, 0);
    /** 保证第一帧显示正常 */
    armature.update();
    component._containerManager = this.renderSystem?.containerManager;
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
      // 销毁所有挂载到插槽的 GameObject
      component._destroySlotGameObjects();
      component.armature.destroy({ children: true });
      if (!component.keepResource) {
        const res = await resource.getResource(component.lastResource);
        const imageSrc = res.data?.image?.src || (res.data?.image as any)?.label;
        releaseSpineData(res, imageSrc);
      }
    }

    component.armature = null;
    delete this.armatures[changed.gameObject.id];
    if (changed.type === OBSERVER_TYPE.CHANGE) {
      // // @ts-ignore
      // component.removeAllListeners();
    }
  }
}
