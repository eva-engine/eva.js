import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { GameObject } from '@eva/eva.js';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';

export declare class Render extends Component {
    static componentName: string;
    sortDirty: boolean;
    visible: boolean;
    alpha: number;
    zIndex: number;
    sortableChildren: boolean;
    init(obj?: RenderParams): void;
}

export declare interface RenderParams {
    alpha?: number;
    zIndex?: number;
    visible?: boolean;
    sortableChildren?: boolean;
}

export declare class RenderSystem extends Renderer {
    static systemName: string;
    name: string;
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    rendererUpdate(gameObject: GameObject): void;
    componentChanged(changed: ComponentChanged): void;
    add(changed: ComponentChanged): void;
    change(changed: ComponentChanged): void;
    remove(changed: ComponentChanged): void;
    setDirty(changed: ComponentChanged): void;
}

export { }
