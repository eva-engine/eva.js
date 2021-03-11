import { Component } from '@eva/eva.js';
import { System } from '@eva/eva.js';

declare const _default: {
    Components: (typeof Stats)[];
    Systems: (typeof StatsSystem)[];
};
export default _default;

export declare class Stats extends Component {
    static componentName: string;
    stats: any;
    update(): void;
}

declare interface StatsParams {
    show?: boolean;
    style?: {
        width: number;
        height: number;
        x: number;
        y: number;
    };
}

export declare class StatsSystem extends System {
    static systemName: string;
    show: boolean;
    stats: any;
    style: any;
    component: Stats;
    init(param?: StatsParams): void;
    start(): void;
    lateUpdate(): void;
}

export { }
