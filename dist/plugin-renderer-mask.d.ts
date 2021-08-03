/// <reference types="pixi.js" />
import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { Graphics } from '@eva/renderer-adapter';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';
import { Sprite } from '@eva/renderer-adapter';

export declare class Mask extends Component<MaskParams> {
    static componentName: string;
    type: MaskParams['type'];
    style?: MaskParams['style'];
    resource?: string;
    spriteName?: string;
    init(obj?: MaskParams): void;
}

export declare enum MASK_TYPE {
    Circle = "Circle",
    Ellipse = "Ellipse",
    Rect = "Rect",
    RoundedRect = "RoundedRect",
    Polygon = "Polygon",
    Img = "Img",
    Sprite = "Sprite"
}

export declare interface MaskParams {
    type: MASK_TYPE;
    style?: {
        x?: number;
        y?: number;
        radius?: number;
        width?: number;
        height?: number;
        paths?: number[];
    };
    resource?: string;
    spriteName?: string;
}

export declare class MaskSystem extends Renderer {
    static systemName: string;
    name: string;
    changedCache: {
        [propName: number]: boolean;
    };
    maskSpriteCache: {
        [propName: number]: Sprite;
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    rendererUpdate(): void;
    componentChanged(changed: ComponentChanged): void;
    add(changed: ComponentChanged): void;
    remove(changed: ComponentChanged): void;
    change(changed: ComponentChanged): void;
    createGraphics(component: Mask): Graphics;
    redrawGraphics(changed: any): void;
    draw(graphics: any, component: any): void;
    createSprite(component: Mask): PIXI.Sprite;
    changeSpriteStyle(component: Mask): void;
    changeSprite(component: Mask): void;
    setSprite(component: Mask, sprite: any): Promise<void>;
}

export { }
