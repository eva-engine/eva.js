import { Component, GameObject } from '@eva/eva.js';
import { Container } from 'pixi.js';
import { type } from '@eva/inspector-decorator';

export interface SpineParams {
  resource: string;
  animationName?: string;
  scale?: number;
  autoPlay?: boolean;
}

/**
 * Spine 骨骼动画组件
 *
 * Spine 组件用于播放 Esoteric Software 的 Spine 骨骼动画。
 * 支持骨骼动画播放控制、动画混合、附件替换等高级功能，
 * 适用于角色动画、复杂特效等需要骨骼动画的场景。
 *
 * 主要功能：
 * - 骨骼动画播放和控制
 * - 动画轨道管理（多动画并行）
 * - 动画混合过渡
 * - 骨骼和附件访问
 * - 支持 Spine 3.6 和 3.8 版本
 *
 * @example
 * ```typescript
 * // 创建 Spine 动画
 * const character = new GameObject('character');
 * const spine = new Spine({
 *   resource: 'heroSpine', // Spine 资源
 *   animationName: 'idle', // 默认动画
 *   autoPlay: true, // 自动播放
 *   scale: 0.5 // 缩放比例
 * });
 * character.addComponent(spine);
 *
 * // 播放动画
 * spine.play('walk', true); // 循环播放 walk 动画
 *
 * // 停止动画
 * spine.stop();
 *
 * // 动画混合
 * spine.setMix('idle', 'walk', 0.3); // 设置过渡时间
 * spine.play('walk');
 *
 * // 添加动画队列
 * spine.play('attack', false); // 播放攻击动画
 * spine.addAnimation('idle', 0, true); // 攻击完成后回到 idle
 *
 * // 替换附件（换装）
 * spine.setAttachment('weapon', 'sword'); // 将武器槽替换为剑
 *
 * // 访问骨骼
 * const headBone = spine.getBone('head');
 * if (headBone) {
 *   headBone.rotation = 15; // 旋转头部
 * }
 *
 * // 多轨道动画
 * spine.play('walk', true, 0); // 轨道0：身体动画
 * spine.play('shoot', false, 1); // 轨道1：上半身动画
 * ```
 */
export default class Spine extends Component<SpineParams> {
  /** 组件名称 */
  static componentName: string = 'Spine';

  /** Spine 资源名称 */
  @type('string')
  resource: string = '';

  /** 动画缩放比例 */
  @type('number')
  scale: number = 1;

  /** 当前播放的动画名称 */
  @type('string')
  animationName: string = '';

  /** 是否自动播放动画 */
  @type('boolean')
  autoPlay: boolean = true;

  /** 是否保留资源（销毁时不释放） */
  @type('boolean')
  keepResource: boolean = false;

  /** Spine 骨架实例（内部使用） */
  private _armature: any;

  /** 容器管理器引用（由 SpineSystem 设置） */
  _containerManager: any;

  /** 挂载到插槽的 GameObject 映射（GameObject -> { slot, wrapper }） */
  private _slotGameObjects: Map<GameObject, { slot: string | number; wrapper: Container }> = new Map();

  /** 等待容器就绪的 slot 挂载请求 */
  _pendingSlotObjects: { slot: number | string; gameObject: GameObject; options?: { followAttachmentTimeline?: boolean } }[] = [];

  /** 等待执行的动画操作队列 */
  private waitExecuteInfos: { playType: boolean; track?: number; name?: string; loop?: boolean }[] = [];

  /**
   * 设置骨架实例
   * 当骨架加载完成后自动执行等待队列中的动画操作
   */
  set armature(val) {
    this._armature = val;
    if (!val) return;
    if (this.autoPlay) {
      this.play(this.animationName);
    }
    for (const info of this.waitExecuteInfos) {
      if (info.playType) {
        const { name, loop, track } = info;
        this.play(name, loop, track);
      } else {
        this.stop(info.track);
      }
    }
    this.waitExecuteInfos = [];
  }

  /** 获取骨架实例 */
  get armature() {
    return this._armature;
  }

  /** 组件是否已销毁 */
  destroied: boolean;

  /** 动画事件处理器 */
  addHandler: any;

  /** 上一次使用的资源名称 */
  lastResource: string;

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - Spine 资源名称
   * @param obj.animationName - 默认动画名称
   * @param obj.scale - 缩放比例
   * @param obj.autoPlay - 是否自动播放
   */
  init(obj?: SpineParams) {
    if (!obj) return;

    Object.assign(this, obj);
  }

  /** 组件销毁时调用 */
  onDestroy() {
    this.destroied = true;
  }

  /**
   * 播放指定动画
   *
   * 如果骨架尚未加载完成，动画操作将被加入等待队列。
   *
   * @param name - 动画名称，不指定则使用 animationName 属性
   * @param loopAnimation - 是否循环播放，默认跟随 autoPlay 属性
   * @param track - 动画轨道编号，默认为 0
   */
  play(name?: string, loopAnimation?: boolean, track?: number) {
    try {
      const loop = loopAnimation ?? this.autoPlay;
      if (name) this.animationName = name;
      if (!this.armature) {
        this.waitExecuteInfos.push({
          playType: true,
          name,
          /**
           * 在 v1.2.2 之前，Spine 动画的 autoPlay 为 true，动画会循环播放 https://github.com/eva-engine/eva.js/pull/164/files#diff-46e9ae36c04e7a0abedc1e14fd9d1c4e81d8386e9bb851f85971ccdba8957804L131
           * 在 v1.2.2 之前，Spine 动画在每加载完( armature 设置之前)调用 play 是不生效的， 在 v1.2.2 [#164](https://github.com/eva-engine/eva.js/pull/164) 解决了这个问题
           * 解决了不生效的问题以后，加载完成之前调用 play 默认循环是false，导致 autoPlay 下本来循环动画不循环了，和之前表现不一致
           * 为了解决这个问题，在 autoPlay 的情况下，未加载完之前调用 play ，默认循环播放，除非设置不循环参数
           */
          loop,
          track,
        });
      } else {
        if (track === undefined) {
          track = 0;
        }
        this.armature.state.setAnimation(track, this.animationName, loop);
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 停止指定轨道的动画
   *
   * 如果骨架尚未加载完成，停止操作将被加入等待队列。
   *
   * @param track - 动画轨道编号，默认为 0
   */
  stop(track?: number) {
    if (!this.armature) {
      this.waitExecuteInfos.push({
        playType: false,
        track,
      });
      return;
    }
    if (track === undefined) {
      track = 0;
    }
    this.armature.state.setEmptyAnimation(track, 0);
  }

  /**
   * 在当前动画之后添加新动画到队列
   *
   * 用于创建动画序列，当前动画播放完毕后自动播放下一个动画。
   *
   * @param name - 动画名称
   * @param delay - 延迟时间（秒）
   * @param loop - 是否循环播放
   * @param track - 动画轨道编号，默认为 0
   */
  addAnimation(name?: string, delay?: number, loop?: boolean, track?: number) {
    try {
      if (!this.armature) {
      } else {
        if (track === undefined) {
          track = 0;
        }
        this.armature.state.addAnimation(track, name, loop, delay);
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 设置两个动画之间的混合过渡时间
   *
   * 当从一个动画切换到另一个动画时，会在指定时间内进行平滑过渡。
   *
   * @param from - 起始动画名称
   * @param to - 目标动画名称
   * @param duration - 过渡时长（秒）
   */
  setMix(from: string, to: string, duration: number) {
    if (!this.armature) {
    } else {
      this.armature.state.data.setMix(from, to, duration);
    }
  }

  /**
   * 获取指定轨道当前播放的动画名称
   *
   * @param track - 动画轨道编号，默认为 0
   * @returns 动画名称，如果未找到则返回 undefined
   */
  getAnim(track: number = 0) {
    try {
      if (!this.armature) {
      } else {
        return this.armature.state.tracks[track].animation.name;
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 设置默认的动画混合时间
   *
   * 当没有为特定动画对指定混合时间时，将使用此默认值。
   *
   * @param duration - 默认混合时长（秒）
   */
  setDefaultMix(duration: number) {
    if (!this.armature) {
    } else {
      this.armature.state.data.defaultMix = duration;
    }
  }

  /**
   * 替换指定插槽的附件
   *
   * 用于换装、武器切换等场景。
   *
   * @param slotName - 插槽名称
   * @param attachmentName - 附件名称
   */
  setAttachment(slotName: string, attachmentName: string) {
    if (!this.armature) {
      return;
    }
    this.armature.skeleton.setAttachment(slotName, attachmentName);
  }

  /**
   * 获取指定名称的骨骼
   *
   * 可用于直接操作骨骼的位置、旋转、缩放等属性。
   *
   * @param boneName - 骨骼名称
   * @returns 骨骼对象，如果未找到则返回 undefined
   */
  getBone(boneName: string) {
    if (!this.armature) {
      return;
    }
    return this.armature.skeleton.findBone(boneName);
  }

  /**
   * 将一个 GameObject 挂载到 Spine 的指定插槽上
   *
   * 挂载后 GameObject 会跟随骨骼运动。当 Spine 组件销毁时，
   * 挂载的 GameObject 也会被自动销毁。
   *
   * @param slot - 插槽名称或索引
   * @param gameObject - 要挂载的 GameObject
   * @param options - 可选配置
   * @param options.followAttachmentTimeline - 是否跟随插槽的附件时间线
   */
  addSlotObject(slot: number | string, gameObject: GameObject, options?: { followAttachmentTimeline?: boolean }) {
    if (!this.armature) {
      console.warn('Spine armature is not ready, cannot addSlotObject');
      return;
    }
    if (!this._containerManager) {
      console.warn('ContainerManager is not available');
      return;
    }
    const container = this._containerManager.getContainer(gameObject.id);
    if (!container) {
      // 容器尚未就绪，加入 pending 队列，等待下一帧自动处理
      this._pendingSlotObjects.push({ slot, gameObject, options });
      return;
    }
    this._doAddSlotObject(slot, gameObject, container, options);
  }

  private _doAddSlotObject(slot: number | string, gameObject: GameObject, container: Container, options?: { followAttachmentTimeline?: boolean }) {
    // 创建 wrapper 容器：Spine 骨骼矩阵作用在 wrapper 上，
    // gameObject 的 container 作为子节点，其 transform 作为相对 slot 的局部偏移
    const wrapper = new Container();
    wrapper.addChild(container);
    this.armature.addSlotObject(slot, wrapper, options);
    this._slotGameObjects.set(gameObject, { slot, wrapper });
    // slot object 可能不在 game.gameObjects 中，RendererSystem 不会自动同步 transform
    // 手动同步 gameObject 及其子树的 transform 到 container
    this._syncTransformTree(gameObject);
  }

  /**
   * 递归同步 gameObject 及其子树的 transform 到对应的渲染容器
   */
  private _syncTransformTree(gameObject: GameObject) {
    if (!this._containerManager) return;
    this._containerManager.updateTransform({
      name: gameObject.id,
      transform: gameObject.transform,
    });
    if (gameObject.transform?.children) {
      for (const childTransform of gameObject.transform.children) {
        if (childTransform.gameObject) {
          this._syncTransformTree(childTransform.gameObject);
        }
      }
    }
  }

  /**
   * 处理等待容器就绪的 slot 挂载请求（由 SpineSystem 每帧调用）
   */
  _flushPendingSlotObjects() {
    if (this._pendingSlotObjects.length === 0) return;
    if (!this.armature || !this._containerManager) return;
    const still: typeof this._pendingSlotObjects = [];
    for (const pending of this._pendingSlotObjects) {
      const container = this._containerManager.getContainer(pending.gameObject.id);
      if (container) {
        this._doAddSlotObject(pending.slot, pending.gameObject, container, pending.options);
      } else {
        still.push(pending);
      }
    }
    this._pendingSlotObjects = still;
  }

  /**
   * 从插槽上移除挂载的 GameObject
   *
   * @param gameObject - 要移除的 GameObject
   */
  removeSlotObject(gameObject: GameObject) {
    // 从 pending 队列中移除
    this._pendingSlotObjects = this._pendingSlotObjects.filter(p => p.gameObject !== gameObject);
    const entry = this._slotGameObjects.get(gameObject);
    if (entry && this.armature) {
      this.armature.removeSlotObject(entry.wrapper);
      entry.wrapper.destroy({ children: false });
    }
    this._slotGameObjects.delete(gameObject);
  }

  /**
   * 销毁所有挂载到插槽的 GameObject（内部使用）
   */
  _destroySlotGameObjects() {
    for (const [gameObject, entry] of this._slotGameObjects) {
      if (!gameObject.destroyed) {
        // 先从 spine 插槽移除 wrapper，避免 destroy 时重复操作
        if (this.armature) {
          this.armature.removeSlotObject(entry.wrapper);
        }
        entry.wrapper.destroy({ children: false });
        gameObject.destroy();
      }
    }
    this._slotGameObjects.clear();
    this._pendingSlotObjects = [];
  }
}
