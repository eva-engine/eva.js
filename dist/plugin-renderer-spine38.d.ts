import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { DisplayObject } from 'pixi.js';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';

export declare class Spine extends Component<SpineParams> {
    static componentName: string;
    resource: string;
    animationName: string;
    autoPlay: boolean;
    usingResource: string;
    armature: any;
    destroied: boolean;
    addHandler: any;
    init(obj?: SpineParams): void;
    onDestroy(): void;
    play(name?: string, loop?: boolean, track?: number): void;
    stop(track?: number): void;
    addAnimation(name?: string, delay?: number, loop?: boolean, track?: number): void;
    setMix(from: string, to: string, duration: number): void;
    getAnim(track?: number): any;
    setDefaultMix(duration: number): void;
    setAttachment(slotName: string, attachmentName: string): void;
    getBone(boneName: string): any;
}

export declare interface SpineParams {
    resource: string;
    animationName: string;
    autoPlay: boolean;
}

export declare class SpineSystem extends Renderer {
    static systemName: string;
    armatures: Record<number, DisplayObject>;
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    add(changed: ComponentChanged, count?: number): Promise<void>;
    change(changed: ComponentChanged): void;
    remove(changed: ComponentChanged): void;
}

export { }
