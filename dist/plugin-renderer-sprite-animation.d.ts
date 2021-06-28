import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { GameObject } from '@eva/eva.js';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';
import { SpriteAnimation as SpriteAnimation_2 } from '@eva/renderer-adapter';

export declare class SpriteAnimation extends Component {
    static componentName: string;
    resource: string;
    autoPlay: boolean;
    speed: number;
    _animate: SpriteAnimation_2;
    private waitPlay;
    private waitStop;
    private times;
    private count;
    init(obj?: SpriteAnimationParams): void;
    play(times?: number): void;
    stop(): void;
    set animate(val: SpriteAnimation_2);
    get animate(): SpriteAnimation_2;
    gotoAndPlay(frameNumber: any): void;
    gotoAndStop(frameNumber: any): void;
}

export declare interface SpriteAnimationParams {
    resource: string;
    autoPlay: boolean;
    speed: number;
}

export declare class SpriteAnimationSystem extends Renderer {
    static systemName: string;
    name: string;
    animates: {
        [propName: number]: SpriteAnimation_2;
    };
    autoPlay: {
        [propName: number]: boolean;
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    rendererUpdate(gameObject: GameObject): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    add({ frames, id, component }: {
        frames: any;
        id: any;
        component: any;
    }): void;
    change({ frames, id, component }: {
        frames: any;
        id: any;
        component: any;
    }): void;
    remove(id: any, isChange?: boolean): void;
}

export { }
