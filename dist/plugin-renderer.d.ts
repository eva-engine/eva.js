import { Application } from '@eva/renderer-adapter';
import { ComponentChanged } from '@eva/eva.js';
import { Container } from '@eva/renderer-adapter';
import EventEmitter from 'eventemitter3';
import { Game } from '@eva/eva.js';
import { GameObject } from '@eva/eva.js';
import { LOAD_SCENE_MODE } from '@eva/eva.js';
import { PureObserverInfo } from '@eva/eva.js';
import { Scene } from '@eva/eva.js';
import { System } from '@eva/eva.js';
import { Transform } from '@eva/eva.js';

export declare class ContainerManager {
    containerMap: {
        [propName: number]: Container;
    };
    addContainer({ name, container }: {
        name: number;
        container: Container;
    }): void;
    getContainer(name: number): Container;
    removeContainer(name: number): void;
    updateTransform({ name, transform }: {
        name: number;
        transform: Transform;
    }): void;
}

export declare class Renderer extends System {
    name: string;
    game: Game;
    static observerInfo: PureObserverInfo;
    observerInfo: PureObserverInfo;
    containerManager: ContainerManager;
    rendererManager: RendererManager;
    constructor(params: any);
    init?(arg?: any): void;
    componentChanged?(changed: ComponentChanged): void;
    rendererUpdate?(gameObject: GameObject): void;
    update(): void;
}

export declare enum RENDERER_TYPE {
    UNKNOWN = 0,
    WEBGL = 1,
    CANVAS = 2
}

export declare class RendererManager {
    game: Game;
    rendererSystem: RendererSystem;
    constructor({ game, rendererSystem }: {
        game: any;
        rendererSystem: any;
    });
    renderers: Renderer[];
    register(...renderers: Renderer[]): void;
    componentChanged(changes: ComponentChanged[]): void;
    update(gameObject: GameObject): void;
}

export declare class RendererSystem extends System {
    static systemName: string;
    params: any;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    application: Application;
    game: Game;
    transform: Transform_2;
    multiApps: Application[];
    init(params: any): void;
    registerObserver(observerInfo: any): void;
    createMultiApplication({ params }: {
        params: any;
    }): Application;
    createApplication(params: any): Application;
    update(): void;
    lateUpdate(e: any): void;
    onDestroy(): void;
    resize(width: any, height: any): void;
}

declare class Transform_2 extends EventEmitter {
    name: string;
    waitRemoveIds: number[];
    waitSceneId: number;
    system: RendererSystem;
    containerManager: ContainerManager;
    waitChangeScenes: {
        scene: Scene;
        mode: LOAD_SCENE_MODE;
        application: Application;
    }[];
    constructor({ system, containerManager }: {
        system: any;
        containerManager: any;
    });
    init(system: RendererSystem): void;
    update(): void;
    componentChanged(changed: ComponentChanged): void;
    addContainer(changed: ComponentChanged): void;
    change(changed: ComponentChanged): void;
    destroy(): void;
}

export { }
