import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';

declare interface ExtendOptions extends IOptions {
    autoStart: boolean;
}

declare interface IExpandOpts {
    repeats?: number;
    infinite?: boolean;
    slot?: Array<{
        name: string;
        type: 'TEXT' | 'IMAGE';
        value: string;
        style: {
            [key: string]: any;
        };
    }>;
}

declare interface IOptions {
    resource: string;
    width?: number;
    height?: number;
}

export declare class Lottie extends Component {
    slot: {
        [key: string]: string;
    };
    static componentName: string;
    static application: any;
    anim: any;
    options: ExtendOptions;
    loadStatus: boolean;
    firstPlay: () => void | null;
    slotCache: {
        [key: string]: any;
    };
    prevSlot: {
        [name: string]: any;
    };
    currentSlot: {
        [name: string]: any;
    };
    constructor(options: IOptions);
    play(params?: Array<number>, expandOpts?: IExpandOpts): void;
    playParamsHandle(params: any): any[];
    onTap(name: any, callback: any): void;
}

export declare class LottieSystem extends Renderer {
    static systemName: string;
    manager: any;
    app: any;
    renderSystem: any;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    managerLife: string[];
    init(): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    add(changed: ComponentChanged): Promise<void>;
    remove(changed: ComponentChanged): void;
}

export { }
