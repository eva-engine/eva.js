import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { GameObject } from '@eva/eva.js';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';
import { Sprite as Sprite_2 } from '@eva/renderer-adapter';

export declare class Sprite extends Component<SpriteParams> {
    static componentName: string;
    resource: string;
    spriteName: string;
    init(obj?: SpriteParams): void;
}

export declare interface SpriteParams {
    resource: string;
    spriteName: string;
}

export declare class SpriteSystem extends Renderer {
    static systemName: string;
    name: string;
    sprites: {
        [propName: number]: Sprite_2;
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    rendererUpdate(gameObject: GameObject): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
}

export { }
