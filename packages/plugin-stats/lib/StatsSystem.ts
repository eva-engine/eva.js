import { System } from '@eva/eva.js';
import type { RendererSystem } from '@eva/plugin-renderer';
import type { Application } from '@eva/renderer-adapter';
import StatsComponent from './StatsComponent';
import Stats from './Stats';
import { BaseHooks } from './hooks/BaseHooks';
interface StatsParams {
  show?: boolean;
  style?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

export default class StatsSystem extends System {
  static systemName = 'Stats';
  public app: Application;
  public renderSystem: RendererSystem;
  show: boolean = true;
  stats;
  style;
  hook;
  component: StatsComponent;
  init(param: StatsParams = { show: true }) {
    this.show = param.show;
    this.style = param.style;
    this.renderSystem = this.game.getSystem('Renderer') as RendererSystem;
    this.app = this.renderSystem.application;
    if (this.app && this.show) {
      // @ts-ignore
      const gl = this.app.renderer.gl as WebGLRenderingContext;
      this.hook = new BaseHooks();
      this.hook.attach(gl);
    }
  }
  start() {
    if (!this.show) return;
    this.component = this.game.scene.addComponent(new StatsComponent());
    this.stats = Stats(this.style);
    this.component.stats = this.stats;
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  }
  lateUpdate() {
    if (!this.show) return;
    this.stats && this.stats.end(this.hook);
  }
}
