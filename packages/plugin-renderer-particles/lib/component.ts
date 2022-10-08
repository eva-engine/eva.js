import { Component, resource } from '@eva/eva.js';
import {
  Emitter,
  ParticleUtils,
  PathParticle,
  AnimatedParticle
} from './pixi-particles.js'

import { Container } from '@eva/renderer-adapter';


interface ParticleParams {
  resource: string,
  type?: 'anim' | 'path',
  colorStep?: number
}

export default class ParticleComponent extends Component<ParticleParams> {
  static componentName: string = 'ParticleComponent';
  emitter: any;
  updateHook: any;
  stage: any;
  colorStep: any;
  _resource: string;
  type: 'anim' | 'path';
  launched: boolean = false;
  ready: boolean = false;
  private times
  set resource(val) {
    if (val === this._resource) return
    this._resource = val
    this.stage?.removeChild()
    this.emitter?.destroy()
    this.emitter = undefined
    this.ready = false
    this.launched = false
  }
  get resource() {
    return this._resource
  }
  init(
    {
      resource,
      type,
      colorStep
    }
  ) {
    this.updateHook = null;
    this.stage = null;
    this.resource = resource;
    this.colorStep = colorStep;
    this.type = type;
  }
  /**
   * 设置发射器的Container
   * @param stage Container
   */
  async setStage(stage?: Container) {
    this.stage = stage || this.stage;
    const container = new Container();
    this.stage.addChild(container);

    const { instance, data } = await resource.getResource(this.resource)
    this.emitter = new Emitter(container, instance, data.json);
    if (this.colorStep) {
      this.emitter.startColor = ParticleUtils.createSteppedGradient(
        data.json.color.list,
        this.colorStep
      );
    }
    if (this.type === 'path') {
      this.emitter.particleConstructor = PathParticle;
    } else if (this.type === 'anim') {
      this.emitter.particleConstructor = AnimatedParticle;
    }
    this.ready && this.play()
  }
  play(times: number = 1) {
    if (!this.emitter) {
      this.ready = true
      this.times = times
      return;
    }
    this.launched = true;
    let currentTimes = 0;
    const loop = () => {
      currentTimes++
      if (currentTimes < this.times) {
        this.emitter.playOnce(loop)
      }
    }
    this.emitter.playOnce(loop)
  }
  update(e) {
    if (!this.launched) return
    this.emitter && this.emitter.update(e.deltaTime * 0.001)
    this.updateHook && this.emitter && this.updateHook(e.deltaTime);
  }
  change() {
    this.setStage()
  }
  /**
   * 停止粒子活动
   * @param clear 是否在画布中清除所有粒子
   */
  pause(clear: boolean = false) {
    if (clear) {
      this.emitter.destroy()
      return;
    }
    this.launched = false;
  }
  resume() {
    this.launched = true
  }

  destroy() {
    this.emitter.destroy()
  }
}
