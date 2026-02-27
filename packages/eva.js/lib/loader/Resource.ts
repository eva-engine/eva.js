import { Assets, LoadParserName } from 'pixi.js';
import EE from 'eventemitter3';
import Progress, { EventParam } from './Progress';

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
  'AUDIO' = 'AUDIO',
  'VIDEO' = 'VIDEO',
  'FONT' = 'FONT',
}

/** Resource item */
interface SrcBase {
  type: string;
  url?: string;
  data?: any;
  size?: Size2;
  texture?: TextureBase[] | TextureBase;
  loadParser?: LoadParserName;
}
interface Size2 {
  width: number;
  height: number;
}
interface TextureBase {
  type: string;
  url: string;
  size?: Size2;
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
  v2?: boolean;
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
  v2?: boolean;
  instance?: any;
}

type ResourceName = string;
type ResourceProcessFn = (resource: ResourceStruct) => any;
type PreProcessResourceHandler = (res: ResourceBase) => void;

/**
 * 资源管理器类
 *
 * Resource 负责管理游戏中所有资源的加载、缓存和销毁。
 * 支持多种资源类型（图片、音频、视频、JSON 等），
 * 提供预加载、异步加载、资源实例化等功能。
 *
 * @example
 * ```typescript
 * import { resource, RESOURCE_TYPE } from '@eva/eva.js';
 *
 * // 添加资源配置
 * resource.addResource([{
 *   name: 'player',
 *   type: RESOURCE_TYPE.IMAGE,
 *   src: { image: { type: 'png', url: 'player.png' } },
 *   preload: true
 * }]);
 *
 * // 预加载资源
 * resource.preload();
 *
 * // 获取资源
 * const playerResource = await resource.getResource('player');
 * ```
 */
class Resource extends EE {
  // TODO: specify timeout in config to overwrite it
  /** 资源加载超时时间（毫秒） */
  public timeout: number = 6000;

  /** 资源预处理器列表 */
  private preProcessResourceHandlers: PreProcessResourceHandler[] = [];

  /** 资源缓存映射表 */
  public resourcesMap: Record<ResourceName, ResourceStruct> = {};

  /** 资源实例化函数集合 */
  private makeInstanceFunctions: Record<string, ResourceProcessFn> = {};

  /** 资源销毁函数集合 */
  private destroyInstanceFunctions: Record<string, ResourceProcessFn> = {};

  /** 资源加载 Promise 映射表 */
  private promiseMap = {};

  /** 资源名称到已加载资源 URL 的映射，用于清理 */
  private resourceUrlsMap: Record<ResourceName, string[]> = {};

  /** 加载进度管理器 */
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

      if (res) {
        this.resourcesMap[res.name] = res;
        this.resourcesMap[res.name].data = {};
      }
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
      if (resource.preload && !resource.complete && !this.promiseMap[key]) {
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

    // Unload assets using PixiJS Assets API
    // Prefer using resourceUrlsMap which tracks loaded URLs, fallback to src URLs
    const urlsToUnload: string[] = this.resourceUrlsMap[name] || [];

    // If resourceUrlsMap doesn't have URLs, try to extract from src (fallback)
    if (urlsToUnload.length === 0 && resource.src) {
      for (const key in resource.src) {
        let url = resource.src[key]?.url;
        if (url) {
          // Normalize URL (same logic as in loadResource)
          if (typeof url === 'string' && url.startsWith('//')) {
            url = `https:${url}`;
          }
          urlsToUnload.push(url);
        }
      }
    }

    // Unload all URLs associated with this resource
    if (urlsToUnload.length > 0) {
      try {
        // 1. Unload assets (releases textures and WebGL resources)
        await Assets.unload(urlsToUnload);

        // 2. Remove from Cache explicitly
        // PixiJS Assets uses an internal Cache that needs to be cleared
        for (const url of urlsToUnload) {
          try {
            // Also try to remove from resolver if it exists
            const resolver = (Assets as any).resolver || (Assets as any)._resolver;
            if (resolver && resolver._assetMap) {
              delete resolver._assetMap[url]
              delete resolver._resolverHash[url]
            }
          } catch (err) {
            // Ignore errors from internal cleanup attempts
          }
        }
      } catch (e) {
        console.warn(`Failed to unload assets for ${name}: ${e.message}`);
      }
    }

    // Clean up all tracking data
    delete this.promiseMap[name];
    delete this.resourceUrlsMap[name];
    resource.data = {};
    resource.complete = false;
    resource.instance = undefined;
    delete this.resourcesMap[name];
  }

  /**
   * You should use this function and redefine RESOURCE_TYPE in global.d.ts at the same time.
   * such as:
   *
   * #### package plugin-renderer-lottie
   * - index.ts:
   * ``` typescript
   *      import {resource} from "@eva/eva.js"
   *      resource.registerResourceType('LOTTIE');
   * ```
   * - global.d.ts
   * ``` typescript
   *      import "@eva/eva.js";
   *      declare module "@eva/eva.js" {
   *        export enum RESOURCE_TYPE {
   *          'LOTTIE' = 'LOTTIE'
   *        }
   *      }
   *  ```
   * The another tip is that you should call it before you call resource.registerInstance/resource.registerDestroy.
   */
  public registerResourceType(type: string, value = type) {
    if (RESOURCE_TYPE[type]) {
      throw new Error(`The type ${type} already exists in RESOURCE_TYPE`);
    }
    RESOURCE_TYPE[type] = value;
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
    unLoadNames.forEach(async name => {
      this.promiseMap[name] = new Promise(r => (resolves[name] = r));
      const res = this.resourcesMap[name];

      // Initialize URL tracking for this resource
      if (!this.resourceUrlsMap[name]) {
        this.resourceUrlsMap[name] = [];
      }

      for (const handler of this.preProcessResourceHandlers) {
        handler(res);
      }
      for (const key in res.src) {
        const resourceType = res.src[key].type;
        if (resourceType === 'data') {
          res.data[key] = res.src[key].data;
          this.doComplete(name, resolves[name], preload);
        } else {
          let url = res.src[key]?.url;
          if (typeof url === 'string' && url.startsWith('//')) {
            url = `https:${res.src[key].url}`;
          }

          // Track this URL for later cleanup
          if (url && !this.resourceUrlsMap[name].includes(url)) {
            this.resourceUrlsMap[name].push(url);
          }

          if (key === 'atlas') {
            const loadImagePromise = Assets.load(res.src['image'].url).catch(e => {
              this.onError({
                preload,
                errMsg: e.message,
                resource: {
                  metadata: { key, name, resolves },
                },
              });
            });
            Assets.add({
              alias: url,
              src: url,
              loadParser: res.src[key].loadParser,
              data: {
                resolve: () => loadImagePromise,
                imageTexture: await loadImagePromise,
              },
            });
          } else {
            const options: any = {
              alias: url,
              src: url,
            };

            // Add loadParser if provided
            if (res.src[key].loadParser) {
              options.loadParser = res.src[key].loadParser;
            }

            if (res.type === RESOURCE_TYPE.SPRITE || res.type === RESOURCE_TYPE.SPRITE_ANIMATION) {
              if (res.src[key].type === 'json') {
                try {
                  const data = await Assets.load(res.src['image'].url);
                  options.data = {
                    texture: data,
                  };
                } catch (e) {
                  console.log('>>>E', e);
                  this.onError({
                    preload,
                    errMsg: e.message,
                    resource: {
                      metadata: { key, name, resolves },
                    },
                  });
                }
              }
            } else if (res.type === RESOURCE_TYPE.FONT) {
              options.data = {
                family: name,
              };
            }
            Assets.add(options);
          }
          Assets.load(url)
            .then(data => {
              this.onLoad({
                preload,
                resource: {
                  metadata: { key, name, resolves },
                  data: data,
                },
              });
            })
            .catch(e => {
              console.log('>>>E', e);
              this.onError({
                preload,
                errMsg: e.message,
                resource: {
                  metadata: { key, name, resolves },
                },
              });
            });
        }
      }
    });
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
        console.error(err);
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

  getLoader(_preload: boolean = false) {
    // if (preload) {
    //   loader.onStart.once(() => {
    //     this.progress.onStart();
    //   });
    // }
    // loader.onLoad.add((_, resource) => {
    //   this.onLoad({ preload, resource });
    // });
    // // @ts-ignore
    // loader.onError.add((errMsg, _, resource) => {
    //   this.onError({ errMsg, resource, preload });
    // });
    // loader.onComplete.once(() => {
    //   loader.onLoad.detachAll();
    //   loader.onError.detachAll();
    //   loader.reset();
    // });
    // return loader;
  }

  private async onLoad({ preload = false, resource }) {
    const {
      metadata: { key, name, resolves },
      data,
    } = resource;
    const res = this.resourcesMap[name];
    if (!res) {
      console.warn('no resource data found');
      return;
    }
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
