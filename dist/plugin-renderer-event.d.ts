import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';

declare class Event_2 extends Component {
    static componentName: string;
    hitArea: HitArea;
    init(params?: EventParams): void;
}
export { Event_2 as Event }

export declare interface EventParams {
    hitArea: HitArea;
}

export declare class EventSystem extends Renderer {
    static systemName: string;
    name: string;
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    componentChanged(changed: ComponentChanged): void;
    add(changed: ComponentChanged): void;
    remove(changed: ComponentChanged): void;
    change(changed: ComponentChanged): void;
    addHitArea(changed: ComponentChanged, container: any, hitArea: any): void;
}

export declare enum HIT_AREA_TYPE {
    Circle = "Circle",
    Ellipse = "Ellipse",
    Polygon = "Polygon",
    Rect = "Rect",
    RoundedRect = "RoundedRect"
}

declare interface HitArea {
    type: HIT_AREA_TYPE;
    style?: {
        x?: number;
        y?: number;
        radius?: number;
        width?: number;
        height?: number;
        paths?: number[];
    };
}

export { }
