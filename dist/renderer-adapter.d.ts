import { Application as Application_2 } from 'pixi.js';
import { Container as Container_2 } from 'pixi.js';
import { extras } from 'pixi.js';
import { Graphics as Graphics_2 } from 'pixi.js';
import { mesh } from 'pixi.js';
import { Sprite as Sprite_2 } from 'pixi.js';
import { Text as Text_3 } from 'pixi.js';
import { Texture } from 'pixi.js';

export declare class Application extends Application_2 {
    constructor(params?: any);
    [propName: string]: any;
}

export declare class Container extends Container_2 {
    [propName: string]: any;
}

export declare class Graphics extends Graphics_2 {
    [propName: string]: any;
}

export declare class NinePatch extends mesh.NineSlicePlane {
    constructor(img: any, leftWidth: any, topHeight: any, rightWidth: any, bottomHeight: any);
}

export declare class Sprite {
    _image: HTMLImageElement | Texture;
    sprite: Sprite_2;
    constructor(image: HTMLImageElement | Texture);
    set image(val: HTMLImageElement | Texture);
    get image(): HTMLImageElement | Texture;
}

export declare class SpriteAnimation {
    animatedSprite: extras.AnimatedSprite;
    constructor({ frames }: {
        frames: any;
    });
    play(): void;
    stop(): void;
    set speed(val: number);
    get speed(): number;
}

declare class Text_2 extends Text_3 {
    text: string;
    style: any;
    width: number;
    height: number;
    constructor(text: any, style: any);
}
export { Text_2 as Text }

export declare class TilingSprite {
    _image: HTMLImageElement | Texture;
    tilingSprite: any;
    constructor(image: HTMLImageElement | Texture);
    set image(val: HTMLImageElement | Texture);
    get image(): HTMLImageElement | Texture;
}

export { }
