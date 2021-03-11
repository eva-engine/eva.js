import {Component} from '@eva/eva.js';
import {Graphics as GraphicsEngine} from '@eva/renderer-adapter';

export default class Graphics extends Component {
  static componentName: string = 'Graphics';
  graphics: GraphicsEngine = null;
  init() {
    this.graphics = new GraphicsEngine();
  }
}
