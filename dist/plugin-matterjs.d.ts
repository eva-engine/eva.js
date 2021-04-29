import { Component } from '@eva/eva.js';
import { System } from '@eva/eva.js';

export declare class Physics extends Component {
    static componentName: string;
    private bodyParams;
    body: any;
    private PhysicsEngine;
    constructor(params: any);
    init(params: any): void;
    update(): void;
    onDestroy(): void;
}

export declare class PhysicsSystem extends System {
    static systemName: string;
    private engine;
    init(param?: any): void;
    awake(): void;
    start(): void;
    update(): void;
    componentChanged(changed: any): void;
    lateUpdate(): void;
    onResume(): void;
    onPause(): void;
    onDestroy(): void;
}

export declare enum PhysicsType {
    RECTANGLE = "rectangle",
    CIRCLE = "circle"
}

export { }
