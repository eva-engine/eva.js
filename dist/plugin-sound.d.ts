import { Component } from '@eva/eva.js';
import { ComponentChanged } from '@eva/eva.js';
import { System } from '@eva/eva.js';

export declare class Sound extends Component<SoundParams> {
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
    duration?: number;
    onEnd?: () => void;
}

export declare class SoundSystem extends System {
    static systemName: string;
    private ctx;
    private gainNode;
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
    resumeAll(): void;
    pauseAll(): void;
    stopAll(): void;
    init(): void;
    update(): void;
    onPlay(): void;
    onPause(): void;
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
