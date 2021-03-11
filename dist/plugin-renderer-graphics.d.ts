import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { Graphics as Graphics_2 } from '@eva/renderer-adapter';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';

export declare class Graphics extends Component {
    static componentName: string;
    graphics: Graphics_2;
    init(): void;
}

export declare class GraphicsSystem extends Renderer {
    static systemName: string;
    name: string;
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
}

export { }
