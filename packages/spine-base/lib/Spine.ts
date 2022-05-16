import { Component, resource } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

export interface SpineParams {
  resource: string;
  animationName?: string;
  autoPlay?: boolean;
}

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

export default class Spine extends Component<SpineParams> {
  static componentName: string = 'Spine';

  @Field({ type: 'resource' })
  resource: string = '';

  @Field({
    type: 'selector',
    options: async function (that: Spine) {
      await sleep(0);
      if (!that.resource || !(resource as any).promiseMap[that.resource]) {
        return {};
      }
      await (resource as any).promiseMap[that.resource];
      const animations = resource.resourcesMap[that.resource]?.data?.ske?.animations;
      return animations ? Object.keys(animations).reduce((prev, key) => ({ ...prev, [key]: key }), {}) : {};
    },
  })
  animationName: string = '';

  @Field()
  autoPlay: boolean = true;

  private _armature: any;

  private waitExecuteInfos: { playType: boolean; track?: number; name?: string; loop?: boolean }[] = [];

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
  get armature() {
    return this._armature;
  }

  destroied: boolean;
  addHandler: any;

  lastResource: string;

  init(obj?: SpineParams) {
    if (!obj) return;

    Object.assign(this, obj);
  }
  onDestroy() {
    this.destroied = true;
  }

  play(name?: string, loop?: boolean, track?: number) {
    try {
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
          loop: loop ?? this.autoPlay,
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
  setMix(from: string, to: string, duration: number) {
    if (!this.armature) {
    } else {
      this.armature.stateData.setMix(from, to, duration);
    }
  }

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

  setDefaultMix(duration: number) {
    if (!this.armature) {
    } else {
      this.armature.stateData.defaultMix = duration;
    }
  }

  setAttachment(slotName: string, attachmentName: string) {
    if (!this.armature) {
      return;
    }
    this.armature.skeleton.setAttachment(slotName, attachmentName);
  }

  getBone(boneName: string) {
    if (!this.armature) {
      return;
    }
    return this.armature.skeleton.findBone(boneName);
  }
}
