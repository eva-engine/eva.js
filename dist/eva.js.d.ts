import EE from 'eventemitter3';
import EventEmitter from 'eventemitter3';
import { Loader } from 'resource-loader';

/**
 * Component contain raw data apply to gameObject and how it interacts with the world
 * @public
 */
export declare class Component extends EventEmitter {
    /** Name of this component */
    static componentName: string;
    /** Name of this component */
    readonly name: string;
    /**
     * Represents the status of the component, If component has started, the value is true
     * @defaultValue false
     */
    started: boolean;
    /**
     * gameObject which this component had added on
     * @remarks
     * Component can only be added on one gameObject, otherwise an error will be thrown,
     * see {@link https://eva.js.org/#/tutorials/gameObject} for more details
     */
    gameObject: GameObject;
    /** Default paramaters for this component */
    __componentDefaultParams: string;
    constructor(params?: any);
    /**
     * Called during component construction
     * @param params - optional initial parameters
     * @override
     */
    init?(params?: any): void;
    /**
     * Called when component is added to a gameObject
     * @override
     */
    awake?(): void;
    /**
     * Called after all component's `awake` method has been called
     * @override
     */
    start?(): void;
    /**
     * Called in every tick, change self property or other component property
     * @param frame - frame info about this tick
     * @override
     */
    update?(frame: UpdateParams): void;
    /**
     * Called after all gameObject's `update` method has been called
     * @param frame - frame info about this tick
     * @override
     */
    lateUpdate?(frame: UpdateParams): void;
    /**
     * Called before game runing or every time game paused
     * @virtual
     * @override
     */
    onResume?(): void;
    /**
     * Called while the game paused.
     * @override
     */
    onPause?(): void;
    /**
     * Called while component be destroyed.
     * @override
     */
    onDestroy?(): void;
}

export declare interface ComponentChanged extends ObserverEventParams {
    gameObject?: GameObject;
    systemName?: string;
}

declare type ComponentName = string;

/**
 * Management observe events
 * @remarks
 * See {@link System} for more details
 * @public
 */
declare class ComponentObserver {
    /**
     * Component property change events
     * @defaultValue []
     */
    private events;
    /**
     * Add event
     * @remarks
     * The same event will be placed last
     * @param component - changed component
     * @param prop - changed property on `component`
     * @param type - change event type
     * @param componentName - `component.name` this parameter will deprecated
     */
    add({ component, prop, type, componentName }: ObserverEventParams): void;
    /** Return change events */
    getChanged(): ComponentChanged[];
    /**
     * Return change events
     * @readonly
     */
    get changed(): ComponentChanged[];
    /** Clear events */
    clear(): ComponentChanged[];
}

/**
 * Normailize system observer info
 * @param obj - system observer info
 */
export declare function componentObserver(observerInfo?: ObserverInfo): (constructor: any) => void;

/** type of Component is function */
declare type ComponentType = typeof Component;

/** Decorators util */
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
    /**
     * State of game
     * @defaultValue false
     */
    playing: boolean;
    started: boolean;
    multiScenes: Scene[];
    /**
     * Timeline for game
     */
    ticker: Ticker;
    /** Systems alled to this game */
    systems: System[];
    constructor({ autoStart, frameRate, systems, needScene, }?: GameParams);
    /**
    * Get scene on this game
    */
    get scene(): Scene;
    set scene(scene: Scene);
    get gameObjects(): any[];
    addSystem<T extends System>(S: T): T;
    addSystem<T extends SystemType>(S: T, obj?: any): InstanceType<T>;
    /**
     * Remove system from this game
     * @param system - one of system instance / system Class or system name
     */
    removeSystem(system: System | SystemType | string): void;
    /**
     * Get system
     * @param S - system class or system name
     * @returns system instance
     */
    getSystem(S: SystemType | string): System;
    /** Pause game */
    pause(): void;
    /** Start game */
    start(): void;
    /** Resume game */
    resume(): void;
    /**
     * add main render method to ticker
     * @remarks
     * the method added to ticker will called in each requestAnimationFrame,
     * 1. call update method on all gameObject
     * 2. call lastUpdate method on all gameObject
     * 3. call update method on all system
     * 4. call lastUpdate method on all system
     */
    initTicker(): void;
    /** Call onResume method on all gameObject's, and then call onResume method on all system */
    triggerResume(): void;
    /** Call onPause method on all gameObject */
    triggerPause(): void;
    /** remove all system on this game */
    destroySystems(): void;
    /** Destroy game instance */
    destroy(): void;
    loadScene({ scene, mode, params, }: LoadSceneParams): void;
}

/**
 * GameObject is a general purpose object. It consists of a unique id and components.
 * @public
 */
export declare class GameObject {
    /** Name of this gameObject */
    private _name;
    /** Scene is an abstraction, represent a canvas layer */
    private _scene;
    /** A key-value map for components on this gameObject */
    private _componentCache;
    /** Identifier of this gameObject */
    id: number;
    /** Components apply to this gameObject */
    components: Component[];
    /**
     * Consruct a new gameObject
     * @param name - the name of this gameObject
     * @param obj - optional transform parameters for default Transform component
     */
    constructor(name: string, obj?: TransformParams);
    /**
     * Get default transform component
     * @returns transform component on this gameObject
     * @readonly
     */
    get transform(): Transform;
    /**
     * Get parent gameObject
     * @returns parent gameObject
     * @readonly
     */
    get parent(): GameObject;
    /**
     * Get the name of this gameObject
     * @readonly
     */
    get name(): string;
    set scene(val: Scene);
    /**
     * Get the scene which this gameObject added on
     * @returns scene
     * @readonly
     */
    get scene(): Scene;
    /**
     * Add child gameObject
     * @param gameObject - child gameobject
     */
    addChild(gameObject: GameObject): void;
    /**
     * Remove child gameObject
     * @param gameObject - child gameobject
     */
    removeChild(gameObject: GameObject): GameObject;
    /**
     * Add component to this gameObject
     * @remarks
     * If component has already been added on a gameObject, it will throw an error
     * @param C - component instance or Component class
     */
    addComponent<T extends Component>(C: T): T;
    addComponent<T extends ComponentType>(C: T, obj?: any): InstanceType<T>;
    /**
     * Remove component on this gameObject
     * @remarks
     * default Transform component can not be removed, if the paramter represent a transform component, an error will be thrown.
     * @param c - one of the compnoentName, component instance, component Class
     * @returns
     */
    removeComponent<T extends Component>(c: string): T;
    removeComponent<T extends Component>(c: T): T;
    removeComponent<T extends ComponentType>(c: T): InstanceType<T>;
    private _removeComponent;
    /**
     * Get component on this gameObject
     * @param c - one of the compnoentName, component instance, component Class
     * @returns
     */
    getComponent<T extends Component>(c: string): T;
    getComponent<T extends Component>(c: T): T;
    getComponent<T extends ComponentType>(c: T): InstanceType<T>;
    /**
     * Remove this gameObject on its parent
     * @returns return this gameObject
     */
    remove(): GameObject;
    /** Destory this gameObject */
    destroy(): void;
}

declare interface GameParams {
    /** isn't game will auto start */
    autoStart?: boolean;
    /** fps for this game */
    frameRate?: number;
    /** systems in this game */
    systems?: System[];
    /** whether or not need to create scene */
    needScene?: boolean;
}

/**
 * Collect property which react in Editor, such as EVA Design
 * @param target - component instance
 * @param propertyKey - property name
 */
export declare function IDEProp(target: any, propertyKey: any): void;

/** Load event */
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

/** Observer event type */
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

/**
 * Normailized observer info
 * @example
 * ```typescript
 * {
 *   Transform: [{ prop: ['size'], deep: false }],
 *   OtherComponent: [{ prop: ['style', 'transform'], deep: true }]
 * }
 * ```
 */
export declare type ObserverInfo = Record<ComponentName, ObserverValue[]>;

declare interface ObserverProp {
    deep: boolean;
    prop: observableKeys;
}

declare type ObserverValue = observableKeys | ObserverProp;

/** eva plugin struct */
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

/**
 * Observer Info
 * @remarks
 * The key of this map always be component's name, the value of this map is an array of `PureObserverProp`
 */
export declare type PureObserverInfo = Record<string, PureObserverProp[]>;

/**
 * Observer property
 * @remarks
 * If `deep` is true then all descendants of `prop` will be observed
 * @example
 * ```typescript
 * @observerComponent({
 *   Transform: [{ prop: 'size', deep: true }]
 * })
 * class TestSystem extends System {}
 * ```
 */
declare interface PureObserverProp {
    deep: boolean;
    prop: string[];
}

/**
 * Resource manager
 * @public
 */
declare class Resource extends EE {
    /** load resource timeout */
    timeout: number;
    /** Resource cache  */
    private resourcesMap;
    /** Collection of make resource instance function */
    private makeInstanceFunctions;
    /** Collection of destroy resource instance function */
    private destroyInstanceFunctions;
    /** Resource load promise */
    private promiseMap;
    private loaders;
    progress: Progress;
    constructor(options?: {
        timeout: number;
    });
    /** Add resource configs and then preload */
    loadConfig(resources: ResourceBase[]): void;
    /** Add single resource config and then preload */
    loadSingle(resource: ResourceBase): Promise<ResourceStruct>;
    /** Add resource configs */
    addResource(resources: ResourceBase[]): void;
    /** Start preload */
    preload(): void;
    /** Get resource by name */
    getResource(name: string): Promise<ResourceStruct>;
    /** Make resource instance by resource type */
    private instance;
    /** destory this resource manager */
    destroy(name: string): Promise<void>;
    private _destroy;
    /** Add resource instance function */
    registerInstance(type: RESOURCE_TYPE | string, callback: ResourceProcessFn): void;
    /** Add resource destroy function */
    registerDestroy(type: RESOURCE_TYPE | string, callback: ResourceProcessFn): void;
    private loadResource;
    doComplete(name: any, resolve: any, preload?: boolean): Promise<void>;
    checkAllLoaded(name: any): boolean;
    getLoader(preload?: boolean): Loader;
    private onLoad;
    private onError;
    private getXhrType;
}

/** Resource manager single instance */
export declare const resource: Resource;

/** Resource type */
export declare enum RESOURCE_TYPE {
    'IMAGE' = "IMAGE",
    'SPRITE' = "SPRITE",
    'SPRITE_ANIMATION' = "SPRITE_ANIMATION",
    'DRAGONBONE' = "DRAGONBONE",
    'SPINE' = "SPINE",
    'AUDIO' = "AUDIO",
    'VIDEO' = "VIDEO"
}

/** Eva resource base */
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

/** Resource with entity */
declare interface ResourceStruct extends ResourceBase {
    data?: {
        json?: any;
        image?: HTMLImageElement;
        tex?: any;
        ske?: any;
        video?: HTMLVideoElement;
        audio?: HTMLAudioElement;
        [propName: string]: any;
    };
    instance?: any;
}

/**
 * Scene is a gameObject container
 */
export declare class Scene extends GameObject {
    gameObjects: GameObject[];
    canvas: HTMLCanvasElement;
    constructor(name: any, obj?: TransformParams);
    /**
     * Add gameObject
     * @param gameObject - game object
     */
    addGameObject(gameObject: GameObject): void;
    /**
     * Remove gameObject
     * @param gameObject - game object
     */
    removeGameObject(gameObject: GameObject): void;
    /**
     * Destroy scene
     */
    destroy(): void;
}

/**
 * Two dimensional size
 */
declare interface Size2 {
    width: number;
    height: number;
}

/** Resource item */
declare interface SrcBase {
    type: string;
    url?: string;
    data?: any;
}

/**
 * Each System runs continuously and performs global actions on every Entity that possesses a Component of the same aspect as that System.
 * @public
 */
export declare class System {
    /** System name */
    static systemName: string;
    name: string;
    /**
     * The collection of component properties observed by the System. System will respond to these changes
     * @example
     * ```typescript
     * // TestSystem will respond to changes of `size` and `position` property of the Transform component
     * class TestSystem extends System {
     *   static observerInfo = {
     *     Transform: [{ prop: 'size', deep: true }, { prop: 'position', deep: true }]
     *   }
     * }
     * ```
     */
    static observerInfo: PureObserverInfo;
    /** Component Observer */
    componentObserver: ComponentObserver;
    /** Game instance */
    game: Game;
    /** Represents the status of the component, if component has started, the value is true */
    started: boolean;
    /** Default paramaters for this system */
    __systemDefaultParams: any;
    constructor(params?: any);
    /**
     * Called when system is added to a gameObject
     * @remarks
     * The difference between init and awake is that `init` method recieves params.
     * Both of those methods are called early than `start` method.
     * Use this method to prepare data, ect.
     * @param param - optional params
     * @override
     */
    init?(param?: any): void;
    /**
     * Calleen system installed
     * @override
     */
    awake?(): void;
    /**
     * Called after all system `awake` method has been called
     * @override
     */
    start?(): void;
    /**
     * Called in each tick
     * @example
     * ```typescript
     * // run TWEEN `update` method in main requestAnimationFrame loop
     * class TransitionSystem extends System {
     *   update() {
     *     TWEEN.update()
     *   }
     * }
     * ```
     * @param e - info about this tick
     * @override
     */
    update?(e: UpdateParams): void;
    /**
     * Called after all system have called the `update` method
     * @param e - info about this tick
     * @override
     */
    lateUpdate?(e: UpdateParams): void;
    /**
     * Called before game runing or every time game paused
     * @override
     */
    onResume?(): void;
    /**
     * Called while the game paused
     * @override
     */
    onPause?(): void;
    /**
     * Called while the system be destroyed.
     * @override
     */
    onDestroy?(): void;
    /** Default destory method */
    destroy(): void;
}

declare type SystemType = typeof System;

/**
 * Timeline tool
 */
declare class Ticker {
    /** Whether or not ticker should auto start */
    autoStart: boolean;
    /** FPS, The number of times that raf method is called per second */
    frameRate: number;
    /** Time between two frame */
    private _frameDuration;
    /** Ticker is a function will called in each raf */
    private _tickers;
    /** Block time */
    private _blockTime;
    /** raf handle id */
    _requestId: number;
    /** Last frame render time */
    private _lastTime;
    /** Frame count since from ticker beigning */
    private _frameCount;
    private _activeWithPause;
    /** Main ticker method handle */
    private _ticker;
    /** Represents the status of the Ticker, If ticker has started, the value is true */
    private _started;
    /** Last stop time */
    private _lastStopTime;
    /**
     * @param autoStart - auto start game
     * @param frameRate - game frame rate
     */
    constructor(options?: TickerOptions);
    /** Main loop, all _tickers will called in this method */
    update(): void;
    /** Add ticker function */
    add(fn: any): void;
    /** Remove ticker function */
    remove(fn: any): void;
    /** Start main loop */
    start(): void;
    /** Pause main loop */
    pause(): void;
    active(): void;
    background(): void;
    bindEvent(): void;
}

declare interface TickerOptions {
    autoStart: boolean;
    frameRate: number;
}

/** Basic component for gameObject, See {@link TransformParams}  */
export declare class Transform extends Component {
    /**
     * component's name
     * @readonly
     */
    static componentName: string;
    readonly name: string;
    private _parent;
    /** Whether this transform in a scene object */
    inScene: boolean;
    /** World coordinate system transformation matrix */
    worldTransform: TransformMatrix;
    /** Child transform components */
    children: Transform[];
    /**
     * Init component
     * @param params - Transform init data
     */
    init(params?: TransformParams): void;
    position: Vector2;
    size: Size2;
    origin: Vector2;
    anchor: Vector2;
    scale: Vector2;
    skew: Vector2;
    rotation: number;
    set parent(val: Transform);
    /**
     * Get parent of this component
     */
    get parent(): Transform;
    /**
     * Add Child Transform
     * @remarks
     * If `child` is already a child of this component, `child` will removed to the last of children list
     * If `child` is already a child of other component, `child` will removed from its parent first
     * @param child - child gameObject's transform component
     */
    addChild(child: Transform): void;
    /**
     * Remove child transform
     * @param child - child gameObject's transform component
     */
    removeChild(child: Transform): void;
    /** Clear all child transform */
    clearChildren(): void;
}

/**
 * Radiation transformation martix
 *
 * {@link https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/matrix() }
 */
declare interface TransformMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
    array?: number[];
}

/**
 * Transform propterty
 */
export declare interface TransformParams {
    position?: Vector2;
    size?: Size2;
    origin?: Vector2;
    anchor?: Vector2;
    scale?: Vector2;
    rotation?: number;
}

/** frame info pass to `Component.update` method */
export declare interface UpdateParams {
    /** delta time from last frame */
    deltaTime: number;
    /** frame count since game begining */
    frameCount: number;
    /** current timestamp */
    time: number;
    /** fps at current frame */
    fps: number;
}

/**
 * Two dimensional vector
 */
declare interface Vector2 {
    x: number;
    y: number;
}

export { }
