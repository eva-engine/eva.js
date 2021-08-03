import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import EventEmitter from 'eventemitter3';
import { System } from '@eva/eva.js';

declare const _default: {
    Components: (typeof EvaX)[];
    Systems: (typeof EvaXSystem)[];
};
export default _default;

export declare class EvaX extends Component<EvaXParams> {
    static componentName: string;
    constructor(gameObject: any);
    evax: EvaXSystem;
    events: Events;
    init(option?: EvaXParams): void;
}

declare interface EvaXParams {
    events: Events;
}

export declare class EvaXSystem extends System {
    static systemName: string;
    store: any;
    private ee;
    changeList: {
        key: string;
        oldStore: any;
    }[];
    init({ store }?: {
        store?: {};
    }): void;
    bindDefaultListener(): void;
    changeCallback(key: any, oldStore: any): void;
    updateStore(store: any): void;
    forceUpdateStore(store: any): void;
    bindListener(key: any, deep: any): void;
    update(): void;
    lateUpdate(): void;
    add(changed: ComponentChanged): void;
    remove(changed: ComponentChanged): void;
    on(eventName: any, func: any): EventEmitter<string | symbol>;
    off(eventName: any, func: any): EventEmitter<string | symbol>;
    emit(eventName: any, ...args: any[]): boolean;
    onDestroy(): void;
}

declare interface Events {
    [propName: string]: Function & {
        deep: boolean;
        handler: Function;
    };
}

export { }
