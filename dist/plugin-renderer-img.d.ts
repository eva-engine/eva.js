import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { GameObject } from '@eva/eva.js';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';
import { Sprite } from '@eva/renderer-adapter';

export declare class Img extends Component {
    static componentName: string;
    resource: string;
    init(obj?: ImgParams): void;
}

export declare interface ImgParams {
    resource: string;
}

export declare class ImgSystem extends Renderer {
    static systemName: string;
    name: string;
    imgs: {
        [propName: number]: Sprite;
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    rendererUpdate(gameObject: GameObject): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
}

export { }
