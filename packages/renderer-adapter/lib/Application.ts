import { Application as PIXIApplication } from 'pixi.js';
import type { ApplicationOptions } from "pixi.js";

export default class Application extends PIXIApplication {
  constructor(params: ApplicationOptions) {
    params.autoStart = false;
    super(params);
  }
  [propName: string]: any;
}
