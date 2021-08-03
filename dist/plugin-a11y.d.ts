import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import EE from 'eventemitter3';
import { GameObject } from '@eva/eva.js';
import { System } from '@eva/eva.js';
import { Transform } from '@eva/eva.js';

export declare class A11y extends Component<A11yParams> {
    static componentName: string;
    interactive: boolean;
    hint: string;
    event: Component;
    delay: number;
    role: string;
    props: object;
    state: object;
    attr: object;
    a11yId: string;
    constructor(param: A11yParams);
}

export declare enum A11yActivate {
    ENABLE = 0,
    DISABLE = 1,
    CHECK = 2
}

declare interface A11yParams {
    hint: string;
    event?: Component;
    delay?: number;
    role?: string;
    props?: object;
    state?: object;
    attr?: object;
    a11yId?: string;
    [propName: string]: string | object | number;
}

export declare class A11ySystem extends System {
    static systemName: string;
    div: HTMLDivElement;
    debug: boolean;
    _ratioX: number;
    _ratioY: number;
    eventPosition: EventPosition;
    activate: boolean;
    delay: number;
    cache: Map<String, HTMLElement>;
    eventCache: Map<String, Function>;
    constructor(opt?: SystemParam);
    get ratioX(): number;
    get ratioY(): number;
    init(opt?: SystemParam): Promise<void>;
    setRatio(): boolean;
    getRenderRect(): {
        renderWidth: any;
        renderHeight: any;
    };
    getCanvasBoundingClientRect(): {
        width: number;
        height: number;
        left: number;
        top: number;
    };
    initDiv(): void;
    update(): Promise<void>;
    remove(changed: ComponentChanged): void;
    add(changed: ComponentChanged): void;
    transformChange(changed: ComponentChanged): void;
    setEvent(element: HTMLElement, event: EE, gameObject: GameObject, id: any): void;
    addEvent(gameObject: GameObject): void;
    removeEvent(changed: ComponentChanged): void;
    setA11yAttr(element: HTMLElement, component: A11y): void;
    setPosition(element: HTMLElement, transform: Transform): void;
    onDestroy(): void;
}

declare interface EventPosition {
    x: number;
    y: number;
}

declare interface SystemParam {
    debug?: boolean;
    activate?: A11yActivate;
    delay?: number;
    checkA11yOpen?: () => Promise<boolean>;
}

export { }
