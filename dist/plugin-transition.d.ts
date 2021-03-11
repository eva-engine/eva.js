import { Component } from '@eva/eva.js';
import { System } from '@eva/eva.js';

declare interface AnimationStruct {
    name: string;
    component: Component;
    values: {
        time: number;
        value: number;
        tween?: string;
    }[];
}

declare interface GroupStruct {
    [propName: string]: AnimationStruct[];
}

export declare class Transition extends Component {
    static componentName: string;
    private animations;
    group: GroupStruct;
    init({ group }?: {
        group: any;
    }): void;
    awake(): void;
    play(name: string, iteration: number): void;
    newAnimation(name: any): void;
    stop(name: any): void;
    onDestroy(): void;
}

export declare class TransitionSystem extends System {
    static systemName: string;
    readonly name = "transition";
    update(): void;
    onDestroy(): void;
}

export { }
