import { Component } from '@eva/eva.js';
import { System } from '@eva/eva.js';

export declare class Physics extends Component {
    static componentName: string;
    private bodyParams;
    body: any;
    private PhysicsEngine;
    constructor(params: any);
    init(params: any): void;
    update(): void;
    onDestroy(): void;
}

export declare class PhysicsSystem extends System {
    static systemName: string;
    private engine;
    /**
     * System 初始化用，可以配置参数，游戏未开始
     *
     * System init, set params, game is not begain
     * @param param init params
     */
    init(param?: any): void;
    /**
     * System 被安装的时候，如果游戏还没有开始，那么会在游戏开始的时候调用。用于前置操作，初始化数据等。
     *
     * Called while the System installed, if game is not begain, it will be called while begain. use to pre operation, init data.
     */
    awake(): void;
    /**
     * System 被安装后，所有的 awake 执行完后
     *
     * Called while the System installed, after all of systems' awake been called
     */
    start(): void;
    /**
     * 每一次游戏循环调用，可以做一些游戏操作，控制改变一些组件属性。
     *
     * Called by every loop, can do some operation, change some property or other component property.
     */
    update(): void;
    componentChanged(changed: any): void;
    /**
     * 和 update?() 类似，在所有System和组件的 update?() 执行以后调用。
     *
     * Like update, called all of gameobject update.
     */
    lateUpdate(): void;
    /**
     * 游戏开始和游戏暂停后开始播放的时候调用。
     *
     * Called while the game to play when game pause.
     */
    onResume(): void;
    /**
     * 游戏暂停的时候调用。
     *
     * Called while the game paused.
     */
    onPause(): void;
    /**
     * System 被销毁的时候调用。
     * Called while the system be destroyed.
     */
    onDestroy(): void;
}

export declare enum PhysicsType {
    RECTANGLE = "rectangle",
    CIRCLE = "circle"
}

export { }
