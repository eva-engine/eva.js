import { Component } from '@eva/eva.js';

export default class StatsComponent extends Component {
  static componentName: string = 'Stats';
  stats;

  /** @deprecated Stats timing now follows the physical System frame hooks. */
  update() {}
}
