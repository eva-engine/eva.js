import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { GameObject } from '@eva/eva.js';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';
import { TilingSprite as TilingSprite_2 } from '@eva/renderer-adapter';

export declare class TilingSprite extends Component {
    static componentName: string;
    resource: string;
    tileScale: TilingSpriteParams['tileScale'];
    tilePosition: TilingSpriteParams['tilePosition'];
    init(obj?: TilingSpriteParams): void;
}

export declare interface TilingSpriteParams {
    resource: string;
    tileScale: {
        x: number;
        y: number;
    };
    tilePosition: {
        x: number;
        y: number;
    };
}

export declare class TilingSpriteSystem extends Renderer {
    name: string;
    imgs: {
        [propName: number]: TilingSprite_2;
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    rendererUpdate(gameObject: GameObject): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    setProp(id: number, component: TilingSprite): void;
}

export { }
