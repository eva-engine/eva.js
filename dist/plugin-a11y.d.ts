import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import EE from 'eventemitter3';
import { GameObject } from '@eva/eva.js';
import { System } from '@eva/eva.js';
import { Transform } from '@eva/eva.js';

export declare class A11y extends Component {
    static componentName: string;
    /**
     * 是否可交互
     */
    interactive: boolean;
    /**
     * 无障碍标签朗读内容
     */
    hint: string;
    /**
     * 弃用，将根据Event组件自动添加
     * 事件对象
     */
    event: Component;
    /**
     * 延时加载时间（millisecond）
     */
    delay: number;
    /**
     * role 属性
     */
    role: string;
    /**
     * 弃用，将属性写在component上
     * aria-value 属性
     * @example
     * aria-valuemin = "0"
     */
    props: object;
    /**
     * 弃用，将属性写在component上
     * aria state 属性
     * @example
     * aria-hidden = "true"
     */
    state: object;
    /**
     * 弃用，将属性写在component上
     * 传入自定义属性
     */
    attr: object;
    /**
     * 辅助Dom id 自动生成
     */
    a11yId: string;
    /**
     * 无障碍组件构造函数
     * @param param interactive 默认为 false，如果游戏对象可交互，传入 true
     * @example
     * // 为游戏对象提供朗读能力
     * new A11y({hint: '这是一个div'})
     * // 游戏对象有事件，传入 event 对象
     * new A11y({hint: '点击事件对象', event: event})
     * // 无障碍属性
     * new A11y({hint:'按钮', role: 'button', state: {aria-hidden="true"}})
     * // 自定义属性
     * new A11y({hint: '自定义属性', attr: {key: '1'}})
     */
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
    /**
     * 无障碍覆盖层
     */
    div: HTMLDivElement;
    /**
     * 是否开启调试
     */
    debug: boolean;
    /**
     * 横向的比例
     */
    _ratioX: number;
    /**
     * 纵向的比例
     */
    _ratioY: number;
    /**
     * 事件坐标
     */
    eventPosition: EventPosition;
    /**
     * 是否开启无障碍能力
     */
    activate: boolean;
    /**
     * dom 延迟放置
     */
    delay: number;
    cache: Map<String, HTMLElement>;
    eventCache: Map<String, Function>;
    /**
     *
     * @param opt
     */
    /**
     * 无障碍插件初始化函数
     * @param opt 无障碍插件选项
     * @param opt.activate 是否开启无障碍能力，默认为自动根据系统读屏能力进行开启 AUTO | ENABLE | DISABLE
     * @example
     * // 开启调试，无障碍区域会显示红色透明背景
     * new A11ySystem({debug: true})
     * // 禁用无障碍
     * new A11ySystem({activate: A11yActivate.DISABLE})
     */
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
    /**
     * 监听插件更新
     */
    update(): Promise<void>;
    remove(changed: ComponentChanged): void;
    /**
     * 监听组件被添加至游戏对象
     * @param changed 改变的组件
     */
    add(changed: ComponentChanged): void;
    transformChange(changed: ComponentChanged): void;
    /**
     * 为无障碍组件设置监听事件
     * @param element DOM 元素
     * @param event 事件组件对象
     * @param gameObject 游戏对象
     */
    setEvent(element: HTMLElement, event: EE, gameObject: GameObject, id: any): void;
    addEvent(gameObject: GameObject): void;
    removeEvent(changed: ComponentChanged): void;
    /**
     * 设置无障碍属性标签
     * @param element DOM 元素
     * @param hint 无障碍朗读文字
     * @param interactive 是否可交互
     */
    setA11yAttr(element: HTMLElement, component: A11y): void;
    /**
     * 将无障碍元素设置到对应的位置
     * @param element DOM 元素
     * @param transform 位置属性
     */
    setPosition(element: HTMLElement, transform: Transform): void;
    onDestroy(): void;
}

/**
 * 点击事件位置
 */
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
