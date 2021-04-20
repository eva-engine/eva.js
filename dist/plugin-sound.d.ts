import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { System } from '@eva/eva.js';

export declare class Sound extends Component {
    static componentName: string;
    systemContext: AudioContext;
    systemDestination: GainNode;
    playing: boolean;
    state: 'unloaded' | 'loading' | 'loaded';
    config: SoundParams;
    private buffer;
    private sourceNode;
    private gainNode;
    private paused;
    private playTime;
    private startTime;
    private duration;
    private actionQueue;
    private endedListener;
    get muted(): boolean;
    set muted(v: boolean);
    get volume(): number;
    set volume(v: number);
    init(obj?: SoundParams): void;
    play(): void;
    pause(): void;
    stop(): void;
    onload(buffer: AudioBuffer): void;
    onDestroy(): void;
    private resetConfig;
    private getCurrentTime;
    private createSource;
    private destroySource;
}

declare interface SoundParams {
    resource: string;
    autoplay?: boolean;
    muted?: boolean;
    volume?: number;
    loop?: boolean;
    seek?: number;
    onEnd?: () => void;
}

export declare class SoundSystem extends System {
    static systemName: string;
    private ctx;
    private gainNode;
    /** 是否和游戏同步暂停和启动 */
    private autoPauseAndStart;
    private onError;
    private components;
    private pausedComponents;
    private audioBufferCache;
    private decodeAudioPromiseMap;
    get muted(): boolean;
    set muted(v: boolean);
    get volume(): number;
    set volume(v: number);
    get audioLocked(): boolean;
    constructor(obj?: SoundSystemParams);
    /**
     * 恢复播放所有被暂停的音频
     */
    resumeAll(): void;
    /**
     * 暂停所有正在播放的音频
     */
    pauseAll(): void;
    /**
     * 停止所有正在播放的音频
     */
    stopAll(): void;
    /**
     * System 初始化用，可以配置参数，游戏未开始
     *
     * System init, set params, game is not begain
     */
    init(): void;
    update(): void;
    /**
     * 游戏开始和游戏暂停后开始播放的时候调用。
     *
     * Called while the game to play when game pause.
     */
    onPlay(): void;
    /**
     * 游戏暂停的时候调用。
     *
     * Called while the game paused.
     */
    onPause(): void;
    /**
     * System 被销毁的时候调用。
     * Called while the system be destroyed.
     */
    onDestroy(): void;
    componentChanged(changed: ComponentChanged): Promise<void>;
    private setupAudioContext;
    private unlockAudio;
    private add;
    private decodeAudioData;
}

declare interface SoundSystemParams {
    autoPauseAndStart?: boolean;
    onError: (error: any) => void;
}

export { }
