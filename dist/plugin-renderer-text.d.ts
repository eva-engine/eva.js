import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { ContainerManager } from '@eva/plugin-renderer';
import { Renderer } from '@eva/plugin-renderer';
import { RendererManager } from '@eva/plugin-renderer';
import { RendererSystem } from '@eva/plugin-renderer';
import { Text as Text_3 } from '@eva/renderer-adapter';

declare class Text_2 extends Component<TextParams> {
    static componentName: string;
    text: string;
    style: TextParams['style'];
    init(obj?: TextParams): void;
}
export { Text_2 as Text }

export declare interface TextParams {
    text: string;
    style?: {
        align?: string;
        breakWords?: boolean;
        dropShadow?: boolean;
        dropShadowAlpha?: number;
        dropShadowAngle?: number;
        dropShadowBlur?: number;
        dropShadowColor?: string | number;
        dropShadowDistance?: number;
        fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
        fillGradientType?: number;
        fillGradientStops?: number[];
        fontFamily?: string | string[];
        fontSize?: number | string;
        fontStyle?: string;
        fontVariant?: string;
        fontWeight?: string;
        letterSpacing?: number;
        lineHeight?: number;
        lineJoin?: string;
        miterLimit?: number;
        padding?: number;
        stroke?: string | number;
        strokeThickness?: number;
        textBaseline?: string;
        trim?: boolean;
        whiteSpace?: string;
        wordWrap?: boolean;
        wordWrapWidth?: number;
        leading?: number;
    };
}

export declare class TextSystem extends Renderer {
    static systemName: string;
    name: string;
    texts: {
        [propName: number]: {
            text: Text_3;
            component: Text_2;
        };
    };
    renderSystem: RendererSystem;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    init(): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    change(changed: ComponentChanged): void;
    setSize(changed: ComponentChanged): void;
}

export { }
