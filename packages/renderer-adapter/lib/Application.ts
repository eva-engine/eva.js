import PIXI, { Application as PIXIApplication } from 'pixi.js';

export default class Application extends PIXIApplication {
  constructor(params?: PIXI.ApplicationOptions) {
    params.autoStart = false;
    super(params);
  }
  [propName: string]: any;
}
