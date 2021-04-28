(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.sound = {}), global.EVA));
}(this, (function (exports, eva_js) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
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
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    var SoundSystem = /** @class */ (function (_super) {
        __extends(SoundSystem, _super);
        function SoundSystem(obj) {
            var _this = _super.call(this) || this;
            /** 是否和游戏同步暂停和启动 */
            _this.autoPauseAndStart = true;
            _this.components = [];
            _this.pausedComponents = [];
            _this.audioBufferCache = {};
            _this.decodeAudioPromiseMap = {};
            Object.assign(_this, obj);
            return _this;
        }
        Object.defineProperty(SoundSystem.prototype, "muted", {
            get: function () {
                return this.gainNode ? this.gainNode.gain.value === 0 : false;
            },
            set: function (v) {
                if (!this.gainNode) {
                    return;
                }
                this.gainNode.gain.setValueAtTime(v ? 0 : 1, 0);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SoundSystem.prototype, "volume", {
            get: function () {
                return this.gainNode ? this.gainNode.gain.value : 1;
            },
            set: function (v) {
                if (!this.gainNode || typeof v !== 'number' || v < 0 || v > 1) {
                    return;
                }
                this.gainNode.gain.setValueAtTime(v, 0);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SoundSystem.prototype, "audioLocked", {
            get: function () {
                if (!this.ctx) {
                    return true;
                }
                return this.ctx.state !== 'running';
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 恢复播放所有被暂停的音频
         */
        SoundSystem.prototype.resumeAll = function () {
            var _this = this;
            var handleResume = function () {
                _this.pausedComponents.forEach(function (component) {
                    component.play();
                });
                // 清理之前缓存的暂停列表
                _this.pausedComponents = [];
            };
            this.ctx.resume().then(handleResume, handleResume);
        };
        /**
         * 暂停所有正在播放的音频
         */
        SoundSystem.prototype.pauseAll = function () {
            var _this = this;
            this.components.forEach(function (component) {
                if (component.playing) {
                    _this.pausedComponents.push(component);
                    component.pause();
                }
            });
            this.ctx.suspend().then();
        };
        /**
         * 停止所有正在播放的音频
         */
        SoundSystem.prototype.stopAll = function () {
            this.components.forEach(function (component) {
                if (component.playing) {
                    component.stop();
                }
            });
            // 清理之前缓存的暂停列表
            this.pausedComponents = [];
            this.ctx.suspend().then();
        };
        /**
         * System 初始化用，可以配置参数，游戏未开始
         *
         * System init, set params, game is not begain
         */
        SoundSystem.prototype.init = function () {
            this.setupAudioContext();
        };
        SoundSystem.prototype.update = function () {
            var e_1, _a;
            var changes = this.componentObserver.clear();
            try {
                for (var changes_1 = __values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                    var changed = changes_1_1.value;
                    this.componentChanged(changed);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * 游戏开始和游戏暂停后开始播放的时候调用。
         *
         * Called while the game to play when game pause.
         */
        SoundSystem.prototype.onPlay = function () {
            if (!this.autoPauseAndStart) {
                return;
            }
            this.resumeAll();
        };
        /**
         * 游戏暂停的时候调用。
         *
         * Called while the game paused.
         */
        SoundSystem.prototype.onPause = function () {
            if (!this.autoPauseAndStart) {
                return;
            }
            this.pauseAll();
        };
        /**
         * System 被销毁的时候调用。
         * Called while the system be destroyed.
         */
        SoundSystem.prototype.onDestroy = function () {
            this.components.forEach(function (component) {
                component.onDestroy();
            });
            this.components = [];
            if (this.ctx) {
                this.gainNode.disconnect();
                this.gainNode = null;
                this.ctx.close();
                this.ctx = null;
            }
        };
        SoundSystem.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (changed.componentName !== 'Sound') {
                        return [2 /*return*/];
                    }
                    if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                        this.add(changed);
                    }
                    return [2 /*return*/];
                });
            });
        };
        SoundSystem.prototype.setupAudioContext = function () {
            try {
                var AudioContext_1 = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext_1();
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
        };
        SoundSystem.prototype.unlockAudio = function () {
            var _this = this;
            if (!this.ctx || !this.audioLocked) {
                return;
            }
            var unlock = function () {
                if (_this.ctx) {
                    var removeListenerFn = function () {
                        document.body.removeEventListener('touchstart', unlock);
                        document.body.removeEventListener('touchend', unlock);
                        document.body.removeEventListener('click', unlock);
                    };
                    _this.ctx.resume().then(removeListenerFn, removeListenerFn);
                }
            };
            document.body.addEventListener('touchstart', unlock);
            document.body.addEventListener('touchend', unlock);
            document.body.addEventListener('click', unlock);
        };
        SoundSystem.prototype.add = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component, config, audio, _a, _b, error_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            component = changed.component;
                            this.components.push(component);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 5, , 6]);
                            config = component.config;
                            component.state = 'loading';
                            return [4 /*yield*/, eva_js.resource.getResource(config.resource)];
                        case 2:
                            audio = _c.sent();
                            if (!!this.audioBufferCache[audio.name]) return [3 /*break*/, 4];
                            _a = this.audioBufferCache;
                            _b = audio.name;
                            return [4 /*yield*/, this.decodeAudioData(audio.data.audio, audio.name)];
                        case 3:
                            _a[_b] = _c.sent();
                            _c.label = 4;
                        case 4:
                            if (this.audioBufferCache[audio.name]) {
                                component.systemContext = this.ctx;
                                component.systemDestination = this.gainNode;
                                component.onload(this.audioBufferCache[audio.name]);
                            }
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _c.sent();
                            console.error(error_1);
                            if (this.onError) {
                                this.onError(error_1);
                            }
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        SoundSystem.prototype.decodeAudioData = function (arraybuffer, name) {
            var _this = this;
            if (this.decodeAudioPromiseMap[name]) {
                return this.decodeAudioPromiseMap[name];
            }
            var promise = new Promise(function (resolve, reject) {
                if (!_this.ctx) {
                    reject(new Error('No audio support'));
                }
                var error = function (err) {
                    if (_this.decodeAudioPromiseMap[name]) {
                        delete _this.decodeAudioPromiseMap[name];
                    }
                    reject(new Error(err + ". arrayBuffer byteLength: " + (arraybuffer ? arraybuffer.byteLength : 0)));
                };
                var success = function (decodedData) {
                    if (_this.decodeAudioPromiseMap[name]) {
                        delete _this.decodeAudioPromiseMap[name];
                    }
                    if (decodedData) {
                        resolve(decodedData);
                    }
                    else {
                        reject(new Error("Error decoding audio " + name));
                    }
                };
                _this.ctx.decodeAudioData(arraybuffer, success, error);
            });
            this.decodeAudioPromiseMap[name] = promise;
            return promise;
        };
        SoundSystem.systemName = 'SoundSystem';
        SoundSystem = __decorate([
            eva_js.decorators.componentObserver({
                Sound: [],
            })
        ], SoundSystem);
        return SoundSystem;
    }(eva_js.System));

    var Sound = /** @class */ (function (_super) {
        __extends(Sound, _super);
        function Sound() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = 'unloaded';
            _this.config = {
                resource: '',
                autoplay: false,
                muted: false,
                volume: 1,
                loop: false,
                seek: 0,
            };
            _this.playTime = 0;
            // @ts-ignore
            _this.startTime = 0;
            _this.duration = 0;
            _this.actionQueue = [];
            return _this;
        }
        Object.defineProperty(Sound.prototype, "muted", {
            get: function () {
                return this.gainNode ? this.gainNode.gain.value === 0 : false;
            },
            set: function (v) {
                if (!this.gainNode) {
                    return;
                }
                this.gainNode.gain.setValueAtTime(v ? 0 : this.config.volume, 0);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "volume", {
            get: function () {
                return this.gainNode ? this.gainNode.gain.value : 1;
            },
            set: function (v) {
                if (typeof v !== 'number' || v < 0 || v > 1) {
                    return;
                }
                this.config.volume = v;
                if (!this.gainNode) {
                    return;
                }
                this.gainNode.gain.setValueAtTime(v, 0);
            },
            enumerable: false,
            configurable: true
        });
        Sound.prototype.init = function (obj) {
            if (!obj) {
                return;
            }
            Object.assign(this.config, obj);
            if (this.config.autoplay) {
                this.actionQueue.push(this.play.bind(this));
            }
        };
        Sound.prototype.play = function () {
            var _this = this;
            if (this.state !== 'loaded') {
                this.actionQueue.push(this.play.bind(this));
            }
            this.destroySource();
            this.createSource();
            if (!this.sourceNode) {
                return;
            }
            var when = this.systemContext.currentTime;
            var offset = this.config.seek;
            this.sourceNode.start(0, offset);
            this.startTime = when;
            this.playTime = when - offset;
            this.paused = false;
            this.playing = true;
            this.resetConfig();
            this.endedListener = function () {
                if (!_this.sourceNode) {
                    return;
                }
                if (_this.config.onEnd) {
                    _this.config.onEnd();
                }
                // 非交互事件播放完成需要销毁资源
                if (_this.playing) {
                    _this.destroySource();
                }
            };
            this.sourceNode.addEventListener('ended', this.endedListener);
        };
        Sound.prototype.pause = function () {
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
        };
        Sound.prototype.stop = function () {
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
        };
        Sound.prototype.onload = function (buffer) {
            this.state = 'loaded';
            this.buffer = buffer;
            this.duration = this.buffer.duration;
            this.actionQueue.forEach(function (action) { return action(); });
            this.actionQueue = [];
        };
        Sound.prototype.onDestroy = function () {
            this.destroySource();
        };
        Sound.prototype.resetConfig = function () {
            this.config.seek = 0;
        };
        Sound.prototype.getCurrentTime = function () {
            if (this.config.loop && this.duration > 0) {
                return (this.systemContext.currentTime - this.playTime) % this.duration;
            }
            return this.systemContext.currentTime - this.playTime;
        };
        Sound.prototype.createSource = function () {
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
        };
        Sound.prototype.destroySource = function () {
            if (!this.sourceNode) {
                return;
            }
            this.sourceNode.removeEventListener('ended', this.endedListener);
            this.sourceNode.stop();
            this.sourceNode.disconnect();
            this.sourceNode = null;
            this.startTime = 0;
            this.playTime = 0;
            this.playing = false;
        };
        Sound.componentName = 'Sound';
        return Sound;
    }(eva_js.Component));

    exports.Sound = Sound;
    exports.SoundSystem = SoundSystem;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
