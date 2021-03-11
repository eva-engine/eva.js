import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';

export declare class DragonBone extends Component {
    static componentName: string;
    private _armature;
    private waitPlay;
    private waitStop;
    private waitPlayInfo;
    resource: string;
    armatureName: string;
    animationName: string;
    autoPlay: boolean;
    init(obj?: DragonBoneParams): void;
    play(name?: string, times?: number): void;
    stop(name?: string): void;
    set armature(val: DragonBone_2);
    get armature(): DragonBone_2;
    onDestroy(): void;
}

declare class DragonBone_2 {
    armature: any;
    factory: any;
    constructor({ armatureName }: {
        armatureName: any;
    });
    play(name: any, time: any): any;
    stop(name: any): any;
}

export declare interface DragonBoneParams {
    resource: string;
    armatureName: string;
    animationName: string;
    autoPlay: boolean;
}

export declare class DragonBoneSystem extends Renderer {
    static systemName: string;
    name: string;
    armatures: {
        [propName: number]: DragonBone_2;
    };
    autoPlay: {
        [propName: number]: boolean;
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    add(changed: ComponentChanged): Promise<void>;
    change(changed: ComponentChanged): void;
    remove(changed: ComponentChanged): void;
}

export { }
