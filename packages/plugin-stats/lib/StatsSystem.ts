import {System} from '@eva/eva.js';
import StatsComponent from './StatsComponent';
import Stats from './Stats';

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
  show: boolean = true;
  stats;
  style;
  component: StatsComponent;
  init(param: StatsParams = {show: true}) {
    this.show = param.show;
    this.style = param.style;
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
    this.stats && this.stats.end();
  }
}
