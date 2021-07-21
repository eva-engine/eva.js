import DragonboneEngine from './engine';
import {Component, decorators} from '@eva/eva.js';

export interface DragonBoneParams {
  resource: string;
  armatureName: string;
  animationName: string;
  autoPlay: boolean;
}

export default class DragonBone extends Component<DragonBoneParams> {
  static componentName: string = 'DragonBone';
  private _armature: DragonboneEngine;
  private waitPlay: boolean = false;
  private waitStop: boolean = false;
  private waitPlayInfo: {animationName: string; times?: number} = {
    animationName: null,
  };
  @decorators.IDEProp resource: string = '';
  @decorators.IDEProp armatureName: string = '';
  @decorators.IDEProp animationName: string = '';
  @decorators.IDEProp autoPlay: boolean = true;

  init(obj?: DragonBoneParams) {
    if (!obj) return;
    if (!obj.armatureName) {
      throw new Error(
        `The dragonBone component on ${this.gameObject.name}, armatureName is required!`,
      );
    }
    Object.assign(this, obj);
    if (this.autoPlay) {
      this.play(this.animationName);
    }
  }

  play(name?: string, times?: number) {
    if (name) this.animationName = name;
    if (!this.armature) {
      this.waitPlayInfo = {animationName: name, times};
      this.waitPlay = true;
    } else {
      this.armature.play(this.animationName, times);
    }
  }
  stop(name?: string) {
    if (!this.armature) {
      this.waitPlayInfo = {animationName: name};
      this.waitStop = true;
    } else {
      this.armature.stop(name);
    }
    this.animationName = null;
  }
  set armature(val) {
    this._armature = val;
    if (!val) return;
    const {animationName, times} = this.waitPlayInfo;
    this.waitPlay && this.play(animationName, times);
    this.waitStop && this.stop(animationName);
    this.waitPlay = false;
    this.waitStop = false;
  }
  get armature() {
    return this._armature;
  }
  onDestroy() {
    this.removeAllListeners();
  }
}
