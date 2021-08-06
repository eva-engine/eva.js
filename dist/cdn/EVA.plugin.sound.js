(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.sound = {}), global.EVA));
}(this, (function (exports, eva_js) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
<<<<<<< HEAD
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
=======
>>>>>>> origin/dev
    }

    let SoundSystem = class SoundSystem extends eva_js.System {
        constructor(obj) {
            super();
            this.autoPauseAndStart = true;
            this.components = [];
            this.pausedComponents = [];
            this.audioBufferCache = {};
            this.decodeAudioPromiseMap = {};
            Object.assign(this, obj);
        }
        get muted() {
            return this.gainNode ? this.gainNode.gain.value === 0 : false;
        }
        set muted(v) {
            if (!this.gainNode) {
                return;
            }
            this.gainNode.gain.setValueAtTime(v ? 0 : 1, 0);
        }
        get volume() {
            return this.gainNode ? this.gainNode.gain.value : 1;
        }
        set volume(v) {
            if (!this.gainNode || typeof v !== 'number' || v < 0 || v > 1) {
                return;
            }
            this.gainNode.gain.setValueAtTime(v, 0);
        }
        get audioLocked() {
            if (!this.ctx) {
                return true;
            }
            return this.ctx.state !== 'running';
        }
        resumeAll() {
            const handleResume = () => {
                this.pausedComponents.forEach((component) => {
                    component.play();
                });
                this.pausedComponents = [];
            };
            this.ctx.resume().then(handleResume, handleResume);
        }
        pauseAll() {
            this.components.forEach((component) => {
                if (component.playing) {
                    this.pausedComponents.push(component);
                    component.pause();
                }
            });
            this.ctx.suspend().then();
        }
        stopAll() {
            this.components.forEach((component) => {
                if (component.playing) {
                    component.stop();
                }
            });
            this.pausedComponents = [];
            this.ctx.suspend().then();
        }
        init() {
            this.setupAudioContext();
        }
        update() {
            const changes = this.componentObserver.clear();
            for (const changed of changes) {
                this.componentChanged(changed);
            }
        }
        onPlay() {
            if (!this.autoPauseAndStart) {
                return;
            }
            this.resumeAll();
        }
        onPause() {
            if (!this.autoPauseAndStart) {
                return;
            }
            this.pauseAll();
        }
        onDestroy() {
            this.components.forEach((component) => {
                component.onDestroy();
            });
            this.components = [];
            if (this.ctx) {
                this.gainNode.disconnect();
                this.gainNode = null;
                this.ctx.close();
                this.ctx = null;
            }
        }
        componentChanged(changed) {
            return __awaiter(this, void 0, void 0, function* () {
                if (changed.componentName !== 'Sound') {
                    return;
                }
                if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                    this.add(changed);
                }
            });
        }
        setupAudioContext() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
            }
            catch (error) {
                console.error(error);
                if (this.onError) {
                    this.onError(error);
                }
            }
            if (!this.ctx) {
                return;
            }
            this.gainNode =
                typeof this.ctx.createGain === 'undefined'
                    ? this.ctx.createGainNode()
                    : this.ctx.createGain();
            this.gainNode.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
            this.gainNode.connect(this.ctx.destination);
            this.unlockAudio();
        }
        unlockAudio() {
            if (!this.ctx || !this.audioLocked) {
                return;
            }
            const unlock = () => {
                if (this.ctx) {
                    const removeListenerFn = () => {
                        document.body.removeEventListener('touchstart', unlock);
                        document.body.removeEventListener('touchend', unlock);
                        document.body.removeEventListener('click', unlock);
                    };
                    this.ctx.resume().then(removeListenerFn, removeListenerFn);
                }
            };
            document.body.addEventListener('touchstart', unlock);
            document.body.addEventListener('touchend', unlock);
            document.body.addEventListener('click', unlock);
        }
        add(changed) {
            return __awaiter(this, void 0, void 0, function* () {
                const component = changed.component;
                this.components.push(component);
                try {
                    const { config } = component;
                    component.state = 'loading';
                    const audio = yield eva_js.resource.getResource(config.resource);
                    if (!this.audioBufferCache[audio.name]) {
                        this.audioBufferCache[audio.name] = yield this.decodeAudioData(audio.data.audio, audio.name);
                    }
                    if (this.audioBufferCache[audio.name]) {
                        component.systemContext = this.ctx;
                        component.systemDestination = this.gainNode;
                        component.onload(this.audioBufferCache[audio.name]);
                    }
                }
                catch (error) {
                    console.error(error);
                    if (this.onError) {
                        this.onError(error);
                    }
                }
            });
        }
        decodeAudioData(arraybuffer, name) {
            if (this.decodeAudioPromiseMap[name]) {
                return this.decodeAudioPromiseMap[name];
            }
            const promise = new Promise((resolve, reject) => {
                if (!this.ctx) {
                    reject(new Error('No audio support'));
                }
                const error = (err) => {
                    if (this.decodeAudioPromiseMap[name]) {
                        delete this.decodeAudioPromiseMap[name];
                    }
                    reject(new Error(`${err}. arrayBuffer byteLength: ${arraybuffer ? arraybuffer.byteLength : 0}`));
                };
                const success = (decodedData) => {
                    if (this.decodeAudioPromiseMap[name]) {
                        delete this.decodeAudioPromiseMap[name];
                    }
                    if (decodedData) {
                        resolve(decodedData);
                    }
                    else {
                        reject(new Error(`Error decoding audio ${name}`));
                    }
                };
                this.ctx.decodeAudioData(arraybuffer, success, error);
            });
            this.decodeAudioPromiseMap[name] = promise;
            return promise;
        }
    };
    SoundSystem.systemName = 'SoundSystem';
    SoundSystem = __decorate([
        eva_js.decorators.componentObserver({
            Sound: [],
        })
    ], SoundSystem);
    var SoundSystem$1 = SoundSystem;

    class Sound extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.state = 'unloaded';
            this.config = {
                resource: '',
                autoplay: false,
                muted: false,
                volume: 1,
                loop: false,
                seek: 0,
            };
            this.playTime = 0;
            this.startTime = 0;
            this.duration = 0;
            this.actionQueue = [];
        }
        get muted() {
            return this.gainNode ? this.gainNode.gain.value === 0 : false;
        }
        set muted(v) {
            if (!this.gainNode) {
                return;
            }
            this.gainNode.gain.setValueAtTime(v ? 0 : this.config.volume, 0);
        }
        get volume() {
            return this.gainNode ? this.gainNode.gain.value : 1;
        }
        set volume(v) {
            if (typeof v !== 'number' || v < 0 || v > 1) {
                return;
            }
            this.config.volume = v;
            if (!this.gainNode) {
                return;
            }
            this.gainNode.gain.setValueAtTime(v, 0);
        }
        init(obj) {
            if (!obj) {
                return;
            }
            Object.assign(this.config, obj);
            if (this.config.autoplay) {
                this.actionQueue.push(this.play.bind(this));
            }
        }
        play() {
            if (this.state !== 'loaded') {
                this.actionQueue.push(this.play.bind(this));
            }
            this.destroySource();
            this.createSource();
            if (!this.sourceNode) {
                return;
            }
            const when = this.systemContext.currentTime;
            const offset = this.config.seek;
            const duration = this.config.duration;
            this.sourceNode.start(0, offset, duration);
            this.startTime = when;
            this.playTime = when - offset;
            this.paused = false;
            this.playing = true;
            this.resetConfig();
            this.endedListener = () => {
                if (!this.sourceNode) {
                    return;
                }
                if (this.config.onEnd) {
                    this.config.onEnd();
                }
                if (this.playing) {
                    this.destroySource();
                }
            };
            this.sourceNode.addEventListener('ended', this.endedListener);
        }
        pause() {
            if (this.state !== 'loaded') {
                this.actionQueue.push(this.pause.bind(this));
            }
            if (this.paused || !this.playing) {
                return;
            }
            this.paused = true;
            this.playing = false;
            this.config.seek = this.getCurrentTime();
            this.destroySource();
        }
        stop() {
            if (this.state !== 'loaded') {
                this.actionQueue.push(this.stop.bind(this));
            }
            if (!this.paused && !this.playing) {
                return;
            }
            this.playing = false;
            this.paused = false;
            this.destroySource();
            this.resetConfig();
        }
        onload(buffer) {
            this.state = 'loaded';
            this.buffer = buffer;
            this.duration = this.buffer.duration;
            this.actionQueue.forEach((action) => action());
            this.actionQueue.length = 0;
        }
        onDestroy() {
            this.actionQueue.length = 0;
            this.destroySource();
        }
        resetConfig() {
            this.config.seek = 0;
        }
        getCurrentTime() {
            if (this.config.loop && this.duration > 0) {
                return (this.systemContext.currentTime - this.playTime) % this.duration;
            }
            return this.systemContext.currentTime - this.playTime;
        }
        createSource() {
            if (!this.systemContext || this.state !== 'loaded') {
                return;
            }
            this.sourceNode = this.systemContext.createBufferSource();
            this.sourceNode.buffer = this.buffer;
            this.sourceNode.loop = this.config.loop;
            if (!this.gainNode) {
                this.gainNode = this.systemContext.createGain();
                this.gainNode.connect(this.systemDestination);
                Object.assign(this, this.config);
            }
            this.sourceNode.connect(this.gainNode);
        }
        destroySource() {
            if (!this.sourceNode)
                return;
            this.sourceNode.removeEventListener('ended', this.endedListener);
            this.sourceNode.stop();
            this.sourceNode.disconnect();
            this.sourceNode = null;
            this.startTime = 0;
            this.playTime = 0;
            this.playing = false;
        }
    }
    Sound.componentName = 'Sound';

    exports.Sound = Sound;
    exports.SoundSystem = SoundSystem$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
