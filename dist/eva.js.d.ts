import EE from 'eventemitter3';
import EventEmitter from 'eventemitter3';
import { Loader } from 'resource-loader';

export declare class Component<T extends ComponentParams = {}> extends EventEmitter {
    static componentName: string;
    readonly name: string;
    started: boolean;
    gameObject: GameObject;
    __componentDefaultParams: T;
    constructor(params?: T);
    init?(params?: T): void;
    awake?(): void;
    start?(): void;
    update?(frame: UpdateParams): void;
    lateUpdate?(frame: UpdateParams): void;
    onResume?(): void;
    onPause?(): void;
    onDestroy?(): void;
}

export declare interface ComponentChanged extends ObserverEventParams {
    gameObject?: GameObject;
    systemName?: string;
}

declare interface ComponentConstructor<T extends Component<ComponentParams>> {
    componentName: string;
    new (params?: ComponentParams): T;
}

declare type ComponentName = string;

declare class ComponentObserver {
    private events;
    add({ component, prop, type, componentName }: ObserverEventParams): void;
    getChanged(): ComponentChanged[];
    get changed(): ComponentChanged[];
    clear(): ComponentChanged[];
}

export declare function componentObserver(observerInfo?: ObserverInfo): (constructor: any) => void;

declare interface ComponentParams {
}

declare type ComponentType = typeof Component;

export declare const decorators: {
    IDEProp: typeof IDEProp;
    componentObserver: typeof componentObserver;
};

declare interface EventParam {
    name: string;
    resource: ResourceStruct;
    success: boolean;
    errMsg?: string;
}

export declare class Game extends EventEmitter {
    _scene: Scene;
    canvas: HTMLCanvasElement;
    playing: boolean;
    started: boolean;
    multiScenes: Scene[];
    ticker: Ticker;
    systems: System[];
    constructor({ systems, frameRate, autoStart, needScene, }?: GameParams);
    get scene(): Scene;
    set scene(scene: Scene);
    get gameObjects(): any[];
    addSystem<T extends System>(S: T): T;
    addSystem<T extends SystemType>(S: T, obj?: any): InstanceType<T>;
    removeSystem(system: System | SystemType | string): void;
    getSystem(S: SystemType | string): System;
    pause(): void;
    start(): void;
    resume(): void;
    initTicker(): void;
    triggerResume(): void;
    triggerPause(): void;
    destroySystems(): void;
    destroy(): void;
    loadScene({ scene, mode, params, }: LoadSceneParams): void;
}

export declare class GameObject {
    private _name;
    private _scene;
    private _componentCache;
    id: number;
    components: Component<ComponentParams>[];
    constructor(name: string, obj?: TransformParams);
    get transform(): Transform;
    get parent(): GameObject;
    get name(): string;
    set scene(val: Scene);
    get scene(): Scene;
    addChild(gameObject: GameObject): void;
    removeChild(gameObject: GameObject): GameObject;
    addComponent<T extends Component<ComponentParams>>(C: T): T;
    addComponent<T extends Component<ComponentParams>>(C: ComponentConstructor<T>, obj?: ComponentParams): T;
    removeComponent<T extends Component>(c: string): T;
    removeComponent<T extends Component>(c: T): T;
    removeComponent<T extends ComponentType>(c: T): InstanceType<T>;
    private _removeComponent;
    getComponent<T extends Component<ComponentParams>>(c: ComponentConstructor<T>): T;
    getComponent<T extends Component>(c: string): T;
    remove(): GameObject;
    destroy(): void;
}

declare interface GameParams {
    autoStart?: boolean;
    frameRate?: number;
    systems?: System[];
    needScene?: boolean;
}

export declare function IDEProp(target: any, propertyKey: any): void;

export declare enum LOAD_EVENT {
    'START' = "start",
    'PROGRESS' = "progress",
    'LOADED' = "loaded",
    'COMPLETE' = "complete",
    'ERROR' = "error"
}

export declare enum LOAD_SCENE_MODE {
    SINGLE = "SINGLE",
    MULTI_CANVAS = "MULTI_CANVAS"
}

declare interface LoadSceneParams {
    scene: Scene;
    mode?: LOAD_SCENE_MODE;
    params?: any;
}

declare type observableKeys = string | string[];

export declare enum OBSERVER_TYPE {
    ADD = "ADD",
    REMOVE = "REMOVE",
    CHANGE = "CHANGE"
}

declare interface ObserverEventParams {
    type: OBSERVER_TYPE;
    component: Component;
    componentName: string;
    prop?: PureObserverProp;
}

export declare type ObserverInfo = Record<ComponentName, ObserverValue[]>;

declare interface ObserverProp {
    deep: boolean;
    prop: observableKeys;
}

declare type ObserverValue = observableKeys | ObserverProp;

export declare interface PluginStruct {
    Components?: typeof Component[];
    Systems?: typeof System[];
}

declare class Progress extends EE {
    progress: number;
    resourceTotal: number;
    resourceLoadedCount: number;
    resource: Resource;
    constructor({ resource, resourceTotal }: {
        resource: any;
        resourceTotal: any;
    });
    onStart(): void;
    onProgress(param: EventParam): void;
}

export declare type PureObserverInfo = Record<string, PureObserverProp[]>;

declare interface PureObserverProp {
    deep: boolean;
    prop: string[];
}

declare class Resource extends EE {
    timeout: number;
    private resourcesMap;
    private makeInstanceFunctions;
    private destroyInstanceFunctions;
    private promiseMap;
    private loaders;
    progress: Progress;
    constructor(options?: {
        timeout: number;
    });
    loadConfig(resources: ResourceBase[]): void;
    loadSingle(resource: ResourceBase): Promise<ResourceStruct>;
    addResource(resources: ResourceBase[]): void;
    preload(): void;
    getResource(name: string): Promise<ResourceStruct>;
    private instance;
    destroy(name: string): Promise<void>;
    private _destroy;
    registerInstance(type: RESOURCE_TYPE | string, callback: ResourceProcessFn): void;
    registerDestroy(type: RESOURCE_TYPE | string, callback: ResourceProcessFn): void;
    private loadResource;
    doComplete(name: any, resolve: any, preload?: boolean): Promise<void>;
    checkAllLoaded(name: any): boolean;
    getLoader(preload?: boolean): Loader;
    private onLoad;
    private onError;
}

export declare const resource: Resource;

export declare enum RESOURCE_TYPE {
    'IMAGE' = "IMAGE",
    'SPRITE' = "SPRITE",
    'SPRITE_ANIMATION' = "SPRITE_ANIMATION",
    'DRAGONBONE' = "DRAGONBONE",
    'SPINE' = "SPINE",
    'AUDIO' = "AUDIO",
    'VIDEO' = "VIDEO"
}

declare interface ResourceBase {
    name?: string;
    type?: RESOURCE_TYPE;
    src?: {
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

declare type ResourceProcessFn = (resource: ResourceStruct) => any;

declare interface ResourceStruct extends ResourceBase {
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

export declare class Scene extends GameObject {
    gameObjects: GameObject[];
    canvas: HTMLCanvasElement;
    constructor(name: any, obj?: TransformParams);
    addGameObject(gameObject: GameObject): void;
    removeGameObject(gameObject: GameObject): void;
    destroy(): void;
}

declare interface Size2 {
    width: number;
    height: number;
}

declare interface SrcBase {
    type: string;
    url?: string;
    data?: any;
}

export declare class System {
    static systemName: string;
    name: string;
    static observerInfo: PureObserverInfo;
    componentObserver: ComponentObserver;
    game: Game;
    started: boolean;
    __systemDefaultParams: any;
    constructor(params?: any);
    init?(param?: any): void;
    awake?(): void;
    start?(): void;
    update?(e: UpdateParams): void;
    lateUpdate?(e: UpdateParams): void;
    onResume?(): void;
    onPause?(): void;
    onDestroy?(): void;
    destroy(): void;
}

declare type SystemType = typeof System;

declare class Ticker {
    autoStart: boolean;
    frameRate: number;
    private timeline;
    private _frameDuration;
    private _tickers;
    _requestId: number;
    private _lastFrameTime;
    private _frameCount;
    private _ticker;
    private _started;
    constructor(options?: TickerOptions);
    update(): void;
    add(fn: any): void;
    remove(fn: any): void;
    start(): void;
    pause(): void;
}

declare interface TickerOptions {
    autoStart?: boolean;
    frameRate?: number;
}

export declare class Transform extends Component<TransformParams> {
    static componentName: string;
    readonly name: string;
    private _parent;
    inScene: boolean;
    worldTransform: TransformMatrix;
    children: Transform[];
    init(params?: TransformParams): void;
    position: Vector2;
    size: Size2;
    origin: Vector2;
    anchor: Vector2;
    scale: Vector2;
    skew: Vector2;
    rotation: number;
    set parent(val: Transform);
    get parent(): Transform;
    addChild(child: Transform): void;
    removeChild(child: Transform): void;
    clearChildren(): void;
}

declare interface TransformMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
    array?: number[];
}

export declare interface TransformParams extends ComponentParams {
    position?: Vector2;
    size?: Size2;
    origin?: Vector2;
    anchor?: Vector2;
    scale?: Vector2;
    rotation?: number;
}

export declare interface UpdateParams {
    deltaTime: number;
    frameCount: number;
    time: number;
    currentTime: number;
    fps: number;
}

declare interface Vector2 {
    x: number;
    y: number;
}

export { }
