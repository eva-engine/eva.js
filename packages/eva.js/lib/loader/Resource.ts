import { Loader, XhrResponseType, ImageLoadStrategy, XhrLoadStrategy, VideoLoadStrategy, AbstractLoadStrategy } from 'resource-loader';
import EE from 'eventemitter3';
import Progress, { EventParam } from './Progress';
import  * as _resourceLoader  from 'resource-loader'
export const resourceLoader = _resourceLoader
/** Load event */
export enum LOAD_EVENT {
  'START' = 'start',
  'PROGRESS' = 'progress',
  'LOADED' = 'loaded',
  'COMPLETE' = 'complete',
  'ERROR' = 'error',
}

/** Resource type */
export enum RESOURCE_TYPE {
  'IMAGE' = 'IMAGE',
  'SPRITE' = 'SPRITE',
  'SPRITE_ANIMATION' = 'SPRITE_ANIMATION',
  'DRAGONBONE' = 'DRAGONBONE',
  'SPINE' = 'SPINE',
  'AUDIO' = 'AUDIO',
  'VIDEO' = 'VIDEO',
}

/** Resource item */
interface SrcBase {
  type: string;
  url?: string;
  data?: any;
  size?: Size2,
  texture?: TextureBase[] | TextureBase
}
interface Size2 {
  width: number,
  height: number,
}
interface TextureBase {
  type: string,
  url: string,
  size?: Size2,
}

/** Eva resource base */
export interface ResourceBase {
  name: string;
  type: RESOURCE_TYPE;
  src: {
    json?: SrcBase;
    image?: SrcBase;
    tex?: SrcBase;
    ske?: SrcBase;
    video?: SrcBase;
    audio?: SrcBase;
    [propName: string]: SrcBase;
  };
  complete?: boolean;
  preload?: boolean;
}

/** Resource with entity */
export interface ResourceStruct extends ResourceBase {
  data?: {
    json?: any;
    image?: HTMLImageElement;
    tex?: any;
    ske?: any;
    video?: HTMLVideoElement;
    audio?: ArrayBuffer;
    [propName: string]: any;
  };
  instance?: any;
}

XhrLoadStrategy.setExtensionXhrType('json', XhrResponseType.Json);
XhrLoadStrategy.setExtensionXhrType('tex', XhrResponseType.Json);
XhrLoadStrategy.setExtensionXhrType('ske', XhrResponseType.Json);

XhrLoadStrategy.setExtensionXhrType('mp3', XhrResponseType.Buffer);
XhrLoadStrategy.setExtensionXhrType('wav', XhrResponseType.Buffer);
XhrLoadStrategy.setExtensionXhrType('aac', XhrResponseType.Buffer);
XhrLoadStrategy.setExtensionXhrType('ogg', XhrResponseType.Buffer);

export const RESOURCE_TYPE_STRATEGY: { [type: string]: new (...args: any[]) => AbstractLoadStrategy } = {
  png: ImageLoadStrategy,
  jpg: ImageLoadStrategy,
  jpeg: ImageLoadStrategy,
  webp: ImageLoadStrategy,
  json: XhrLoadStrategy,
  tex: XhrLoadStrategy,
  ske: XhrLoadStrategy,
  audio: XhrLoadStrategy,
  video: VideoLoadStrategy,
};

type ResourceName = string;
type ResourceProcessFn = (resource: ResourceStruct) => any;
type PreProcessResourceHandler = (res: ResourceBase) => void;


/**
 * Resource manager
 * @public
 */
class Resource extends EE {
  // TODO: specify timeout in config to overwrite it
  /** load resource timeout */
  public timeout: number = 6000;

  private preProcessResourceHandlers: PreProcessResourceHandler[] = []

  /** Resource cache  */
  private resourcesMap: Record<ResourceName, ResourceStruct> = {};

  /** Collection of make resource instance function */
  private makeInstanceFunctions: Record<string, ResourceProcessFn> = {};

  /** Collection of destroy resource instance function */
  private destroyInstanceFunctions: Record<string, ResourceProcessFn> = {};

  /** Resource load promise */
  private promiseMap = {};

  private loaders: Loader[] = [];

  progress: Progress;

  constructor(options?: { timeout: number }) {
    super();
    if (options && typeof options.timeout === 'number') {
      this.timeout = options.timeout;
    }
  }

  /** Add resource configs and then preload */
  public loadConfig(resources: ResourceBase[]): void {
    this.addResource(resources);
    this.preload();
  }

  /** Add single resource config and then preload */
  public loadSingle(resource: ResourceBase): Promise<ResourceStruct> {
    this.addResource([resource]);
    return this.getResource(resource.name);
  }

  /** Add resource configs */
  public addResource(resources: ResourceBase[]): void {
    if (!resources || resources.length < 1) {
      console.warn('no resources');
      return;
    }
    for (const res of resources) {
      if (this.resourcesMap[res.name]) {
        console.warn(res.name + ' was already added');
        continue;
      }
      for (const handler of this.preProcessResourceHandlers) {
        handler(res);
      }
      this.resourcesMap[res.name] = res;
      this.resourcesMap[res.name].data = {};
    }
  }

  /** dd resource preprocesser*/
  public addPreProcessResourceHandler(handler: PreProcessResourceHandler) {
    this.preProcessResourceHandlers.push(handler);
  }

  public removePreProcessResourceHandler(handler: PreProcessResourceHandler) {
    this.preProcessResourceHandlers.splice(this.preProcessResourceHandlers.indexOf(handler), 1);
  }

  /** Start preload */
  public preload(): void {
    const names = [];
    for (const key in this.resourcesMap) {
      const resource = this.resourcesMap[key];
      if (resource.preload && !resource.complete) {
        names.push(resource.name);
      }
    }
    this.progress = new Progress({
      resource: this,
      resourceTotal: names.length,
    });
    this.loadResource({ names, preload: true });
  }

  /** Get resource by name */
  public async getResource(name: string): Promise<ResourceStruct> {
    this.loadResource({ names: [name] });
    return this.promiseMap[name] || Promise.resolve({});
  }

  /** Make resource instance by resource type */
  private async instance(name) {
    const res = this.resourcesMap[name];
    return this.makeInstanceFunctions[res.type] && (await this.makeInstanceFunctions[res.type](res));
  }

  /** destory this resource manager */
  async destroy(name: string) {
    await this._destroy(name);
  }
  private async _destroy(name, loadError = false) {
    const resource = this.resourcesMap[name];
    if (!resource) return;
    if (!loadError) {
      try {
        if (this.destroyInstanceFunctions[resource.type]) {
          await this.destroyInstanceFunctions[resource.type](resource);
        }
      } catch (e) {
        console.warn(`destroy resource ${resource.name} error with '${e.message}'`);
      }
    }
    delete this.promiseMap[name];
    resource.data = {};
    resource.complete = false;
    resource.instance = undefined;
  }

  /** Add resource instance function */
  public registerInstance(type: RESOURCE_TYPE | string, callback: ResourceProcessFn) {
    this.makeInstanceFunctions[type] = callback;
  }

  /** Add resource destroy function */
  public registerDestroy(type: RESOURCE_TYPE | string, callback: ResourceProcessFn) {
    this.destroyInstanceFunctions[type] = callback;
  }

  private loadResource({ names = [], preload = false }) {
    const unLoadNames = names.filter(name => !this.promiseMap[name] && this.resourcesMap[name]);
    if (!unLoadNames.length) return;

    const resolves = {};
    const loader = this.getLoader(preload);

    unLoadNames.forEach(name => {
      this.promiseMap[name] = new Promise(r => (resolves[name] = r));
      const res = this.resourcesMap[name];
      for (const key in res.src) {
        const resourceType = res.src[key].type;
        if (resourceType === 'data') {
          res.data[key] = res.src[key].data;
          this.doComplete(name, resolves[name], preload);
        } else {
          loader.add({
            url: res.src[key].url,
            name: `${res.name}_${key}`,
            strategy: RESOURCE_TYPE_STRATEGY[resourceType],
            metadata: {
              key,
              name: res.name,
              resolves,
            },
          });
        }
      }
    });

    loader.load();
  }

  async doComplete(name, resolve, preload = false) {
    const res = this.resourcesMap[name];
    const param: EventParam = {
      name,
      resource: this.resourcesMap[name],
      success: true,
    };
    if (this.checkAllLoaded(name)) {
      try {
        res.instance = await this.instance(name);
        res.complete = true;
        if (preload) {
          this.progress.onProgress(param);
        }
        resolve(res);
      } catch (err) {
        if (__DEV__) {
          console.error(err);
        }
        res.complete = false;
        if (preload) {
          param.errMsg = err.message;
          param.success = false;
          this.progress.onProgress(param);
        }
        resolve({});
      }
    }
  }

  checkAllLoaded(name) {
    const res = this.resourcesMap[name];
    return Array.from(Object.keys(res.src)).every(resourceKey => res.data[resourceKey]);
  }

  getLoader(preload: boolean = false) {
    let loader = this.loaders.find(({ loading }) => !loading);
    if (!loader) {
      loader = new Loader();
      this.loaders.push(loader);
    }
    if (preload) {
      loader.onStart.once(() => {
        this.progress.onStart();
      });
    }
    loader.onLoad.add((_, resource) => {
      this.onLoad({ preload, resource });
    });
    // @ts-ignore
    loader.onError.add((errMsg, _, resource) => {
      this.onError({ errMsg, resource, preload });
    });
    loader.onComplete.once(() => {
      loader.onLoad.detachAll();
      loader.onError.detachAll();
      loader.reset();
    });
    return loader;
  }

  private async onLoad({ preload = false, resource }) {
    const {
      metadata: { key, name, resolves },
      data,
    } = resource;
    const res = this.resourcesMap[name];
    res.data[key] = data;
    this.doComplete(name, resolves[name], preload);
  }

  private async onError({ errMsg, preload = false, resource }) {
    const {
      metadata: { name, resolves },
    } = resource;
    this._destroy(name, true);
    resolves[name]({});
    if (preload) {
      const param = {
        name,
        resource: this.resourcesMap[name],
        success: false,
        errMsg,
      };
      this.progress.onProgress(param);
    }
  }
}

/** Resource manager single instance */
export const resource: Resource = new Resource();
export default Resource;
