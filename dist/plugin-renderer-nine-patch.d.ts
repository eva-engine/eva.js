import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { GameObject } from '@eva/eva.js';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';

export declare class NinePatch extends Component<NinePatchParams> {
    static componentName: string;
    ninePatch: any;
    resource: string;
    spriteName: string;
    leftWidth: number;
    topHeight: number;
    rightWidth: number;
    bottomHeight: number;
    init(obj?: NinePatchParams): void;
}

export declare interface NinePatchParams {
    resource: string;
    spriteName?: string;
    leftWidth?: number;
    topHeight?: number;
    rightWidth?: number;
    bottomHeight?: number;
}

export declare class NinePatchSystem extends Renderer {
    static systemName: string;
    name: string;
    ninePatch: {
        [propName: number]: any;
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    rendererUpdate(gameObject: GameObject): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    add(changed: any): Promise<void>;
    remove(changed: any): void;
}

export { }
