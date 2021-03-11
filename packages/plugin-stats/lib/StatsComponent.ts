import {Component} from '@eva/eva.js';

export default class StatsComponent extends Component {
  static componentName: string = 'Stats';
  stats;

  update() {
    this.stats && this.stats.begin();
  }
}
