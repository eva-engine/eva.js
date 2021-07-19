import { Component } from '@eva/eva.js';
import { Group } from '@tweenjs/tween.js';
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

export declare class Transition extends Component {
    static componentName: string;
    private animations;
    tweenGroup: Group;
    group: Record<string, AnimationStruct[]>;
    init({ group }?: {
        group: {};
    }): void;
    awake(): void;
    play(name: string, iteration: number): void;
    stop(name: any): void;
    onPause(): void;
    onResume(): void;
    onDestroy(): void;
    update(): void;
    newAnimation(name: any): void;
}

export declare class TransitionSystem extends System {
    static systemName: string;
    readonly name = "transition";
}

export { }
