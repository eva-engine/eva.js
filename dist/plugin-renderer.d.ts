import { Application } from '@eva/renderer-adapter';
import { ComponentChanged } from '@eva/eva.js';
import { Container } from '@eva/renderer-adapter';
import EventEmitter from 'eventemitter3';
import { Game } from '@eva/eva.js';
import { GameObject } from '@eva/eva.js';
import { LOAD_SCENE_MODE } from '@eva/eva.js';
import { PureObserverInfo } from '@eva/eva.js';
import { Scene } from '@eva/eva.js';
import { System } from '@eva/eva.js';
import { Transform } from '@eva/eva.js';

export declare class ContainerManager {
    containerMap: {
        [propName: number]: Container;
    };
    addContainer({ name, container }: {
        name: number;
        container: Container;
    }): void;
    getContainer(name: number): Container;
    removeContainer(name: number): void;
    updateTransform({ name, transform }: {
        name: number;
        transform: Transform;
    }): void;
}

export declare const INTERNAL_FORMAT_TO_BYTES_PER_PIXEL: {
    [id: number]: number;
};

export declare enum INTERNAL_FORMATS {
    COMPRESSED_RGB_S3TC_DXT1_EXT = 33776,
    COMPRESSED_RGBA_S3TC_DXT1_EXT = 33777,
    COMPRESSED_RGBA_S3TC_DXT3_EXT = 33778,
    COMPRESSED_RGBA_S3TC_DXT5_EXT = 33779,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 35917,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 35918,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 35919,
    COMPRESSED_SRGB_S3TC_DXT1_EXT = 35916,
    COMPRESSED_R11_EAC = 37488,
    COMPRESSED_SIGNED_R11_EAC = 37489,
    COMPRESSED_RG11_EAC = 37490,
    COMPRESSED_SIGNED_RG11_EAC = 37491,
    COMPRESSED_RGB8_ETC2 = 37492,
    COMPRESSED_RGBA8_ETC2_EAC = 37496,
    COMPRESSED_SRGB8_ETC2 = 37493,
    COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 37497,
    COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37494,
    COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37495,
    COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 35840,
    COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 35842,
    COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 35841,
    COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 35843,
    COMPRESSED_RGB_ETC1_WEBGL = 36196,
    COMPRESSED_RGB_ATC_WEBGL = 35986,
    COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 35986,
    COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 34798,
    COMPRESSED_RGBA_ASTC_10x10_KHR = 37819,
    COMPRESSED_RGBA_ASTC_10x5_KHR = 37816,
    COMPRESSED_RGBA_ASTC_10x6_KHR = 37817,
    COMPRESSED_RGBA_ASTC_10x8_KHR = 37818,
    COMPRESSED_RGBA_ASTC_12x10_KHR = 37820,
    COMPRESSED_RGBA_ASTC_12x12_KHR = 37821,
    COMPRESSED_RGBA_ASTC_4x4_KHR = 37808,
    COMPRESSED_RGBA_ASTC_5x4_KHR = 37809,
    COMPRESSED_RGBA_ASTC_5x5_KHR = 37810,
    COMPRESSED_RGBA_ASTC_6x5_KHR = 37811,
    COMPRESSED_RGBA_ASTC_6x6_KHR = 37812,
    COMPRESSED_RGBA_ASTC_8x5_KHR = 37813,
    COMPRESSED_RGBA_ASTC_8x6_KHR = 37814,
    COMPRESSED_RGBA_ASTC_8x8_KHR = 37815,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 3781,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 37847,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 37849,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 37850,
    COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 37852,
    COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 37853,
    COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 37840,
    COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 37841,
    COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 37842,
    COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 37843,
    COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 37844,
    COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 37845,
    COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 37846,
    COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 37847
}

export declare const INTERNAL_FORMATS_TO_EXTENSION_NAME: {
    [key: number]: string;
};

export declare class Renderer extends System {
    name: string;
    game: Game;
    static observerInfo: PureObserverInfo;
    observerInfo: PureObserverInfo;
    containerManager: ContainerManager;
    rendererManager: RendererManager;
    constructor(params?: any);
    componentChanged(_changed: ComponentChanged): void;
    rendererUpdate(_gameObject: GameObject): void;
    update(): void;
}

export declare enum RENDERER_TYPE {
    UNKNOWN = 0,
    WEBGL = 1,
    CANVAS = 2
}

export declare class RendererManager {
    game: Game;
    rendererSystem: RendererSystem;
    constructor({ game, rendererSystem }: {
        game: any;
        rendererSystem: any;
    });
    renderers: Renderer[];
    register(...renderers: Renderer[]): void;
    componentChanged(changes: ComponentChanged[]): void;
    update(gameObject: GameObject): void;
}

export declare class RendererSystem extends System {
    static systemName: string;
    params: any;
    rendererManager: RendererManager;
    containerManager: ContainerManager;
    application: Application;
    game: Game;
    transform: Transform_2;
    multiApps: Application[];
    init(params: any): void;
    registerObserver(observerInfo: any): void;
    createMultiApplication({ params }: {
        params: any;
    }): Application;
    createApplication(params: any): Application;
    update(): void;
    lateUpdate(e: any): void;
    onDestroy(): void;
    resize(width: any, height: any): void;
}

declare class Transform_2 extends EventEmitter {
    name: string;
    waitRemoveIds: number[];
    waitSceneId: number;
    system: RendererSystem;
    containerManager: ContainerManager;
    waitChangeScenes: {
        scene: Scene;
        mode: LOAD_SCENE_MODE;
        application: Application;
    }[];
    constructor({ system, containerManager }: {
        system: any;
        containerManager: any;
    });
    init(system: RendererSystem): void;
    update(): void;
    componentChanged(changed: ComponentChanged): void;
    addContainer(changed: ComponentChanged): void;
    change(changed: ComponentChanged): void;
    destroy(): void;
}

export { }
