import {Application as PIXIApplication} from 'pixi.js';
export default class Application extends PIXIApplication {
  constructor(params?: any) {
    params.autoStart = false;
    super(params);
  }
  [propName: string]: any;
}
