import { Component, decorators } from '@eva/eva.js';

export interface SpineParams {
  resource: string;
  animationName: string;
  autoPlay: boolean;
}

export default class Spine extends Component {
  static componentName: string = 'Spine';

  @decorators.IDEProp
  resource: string = '';

  @decorators.IDEProp
  animationName: string = '';

  @decorators.IDEProp
  autoPlay: boolean = true;

  usingResource: string;
  armature: any;
  destroied: boolean;
  addHandler: any;

  init(obj?: SpineParams) {
    if (!obj) return;

    Object.assign(this, obj);
    if (this.autoPlay) {
      this.play(this.animationName);
    }
  }
  onDestroy() {
    this.destroied = true;
  }

  play(name?: string, loop?: boolean, track?: number) {
    try {
      if (name) this.animationName = name;
      if (!this.armature) {
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
