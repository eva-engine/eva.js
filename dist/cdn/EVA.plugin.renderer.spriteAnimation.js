(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.spriteAnimation = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter, global.PIXI));
}(this, (function (exports, eva_js, pluginRenderer, rendererAdapter, pixi_js) { 'use strict';

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

    var SpriteAnimation$1 = (function (_super) {
        __extends(SpriteAnimation, _super);
        function SpriteAnimation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.resource = '';
            _this.autoPlay = true;
            _this.speed = 100;
            _this.waitPlay = false;
            _this.waitStop = false;
            return _this;
        }
        SpriteAnimation.prototype.init = function (obj) {
            obj && Object.assign(this, obj);
        };
        SpriteAnimation.prototype.play = function () {
            if (!this.animate) {
                this.waitPlay = true;
            }
            else {
                this.animate.play();
            }
        };
        SpriteAnimation.prototype.stop = function () {
            if (!this.animate) {
                this.waitStop = true;
            }
            else {
                this.animate.stop();
            }
        };
        Object.defineProperty(SpriteAnimation.prototype, "animate", {
            get: function () {
                return this._animate;
            },
            set: function (val) {
                this._animate = val;
                if (this.waitPlay) {
                    this.waitPlay = false;
                    this.play();
                }
                if (this.waitStop) {
                    this.waitStop = false;
                    this.stop();
                }
            },
            enumerable: false,
            configurable: true
        });
        SpriteAnimation.componentName = 'SpriteAnimation';
        __decorate([
            eva_js.decorators.IDEProp
        ], SpriteAnimation.prototype, "resource", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], SpriteAnimation.prototype, "autoPlay", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], SpriteAnimation.prototype, "speed", void 0);
        return SpriteAnimation;
    }(eva_js.Component));

    var resourceKeySplit = '_s|r|c_';
    eva_js.resource.registerInstance(eva_js.RESOURCE_TYPE.SPRITE_ANIMATION, function (_a) {
        var name = _a.name, data = _a.data;
        return new Promise(function (r) {
            var e_1, _a;
            var textureObj = data.json;
            var texture = pixi_js.BaseTexture.from(data.image);
            var frames = textureObj.frames || {};
            var animations = textureObj.animations || {};
            var newFrames = {};
            for (var key in frames) {
                var newKey = name + resourceKeySplit + key;
                newFrames[newKey] = frames[key];
            }
            for (var key in animations) {
                var spriteList = [];
                if (animations[key] && animations[key].length >= 0) {
                    try {
                        for (var _b = (e_1 = void 0, __values(animations[key])), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var spriteName = _c.value;
                            var newSpriteName = name + resourceKeySplit + spriteName;
                            spriteList.push(newSpriteName);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                animations[key] = spriteList;
            }
            textureObj.frames = newFrames;
            var spriteSheet = new pixi_js.Spritesheet(texture, textureObj);
            spriteSheet.parse(function () {
                var textures = spriteSheet.textures;
                var spriteFrames = [];
                for (var key in textures) {
                    spriteFrames.push(textures[key]);
                }
                r(spriteFrames);
            });
        });
    });
    eva_js.resource.registerDestroy(eva_js.RESOURCE_TYPE.SPRITE_ANIMATION, function (_a) {
        var e_2, _b;
        var instance = _a.instance;
        if (!instance)
            return;
        try {
            for (var instance_1 = __values(instance), instance_1_1 = instance_1.next(); !instance_1_1.done; instance_1_1 = instance_1.next()) {
                var texture = instance_1_1.value;
                texture.destroy(true);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (instance_1_1 && !instance_1_1.done && (_b = instance_1.return)) _b.call(instance_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    });
    var SpriteAnimation = (function (_super) {
        __extends(SpriteAnimation, _super);
        function SpriteAnimation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'SpriteAnimation';
            _this.animates = {};
            _this.autoPlay = {};
            return _this;
        }
        SpriteAnimation.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        SpriteAnimation.prototype.rendererUpdate = function (gameObject) {
            var _a = gameObject.transform.size, width = _a.width, height = _a.height;
            if (this.animates[gameObject.id]) {
                this.animates[gameObject.id].animatedSprite.width = width;
                this.animates[gameObject.id].animatedSprite.height = height;
            }
        };
        SpriteAnimation.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component, frames_1, frames_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(changed.componentName === 'SpriteAnimation')) return [3, 7];
                            component = changed.component;
                            this.autoPlay[changed.gameObject.id] = component.autoPlay;
                            if (!(changed.type === eva_js.OBSERVER_TYPE.ADD)) return [3, 2];
                            return [4, eva_js.resource.getResource(component.resource)];
                        case 1:
                            frames_1 = (_a.sent()).instance;
                            if (!frames_1) {
                                console.error("GameObject:" + changed.gameObject.name + "'s Img resource load error");
                            }
                            this.add({
                                frames: frames_1,
                                id: changed.gameObject.id,
                                component: component,
                            });
                            return [3, 7];
                        case 2:
                            if (!(changed.type === eva_js.OBSERVER_TYPE.CHANGE)) return [3, 6];
                            if (!(changed.prop && changed.prop.prop[0] === 'speed')) return [3, 3];
                            this.animates[changed.gameObject.id].speed =
                                1000 / 60 / component.speed;
                            return [3, 5];
                        case 3: return [4, eva_js.resource.getResource(component.resource)];
                        case 4:
                            frames_2 = (_a.sent()).instance;
                            if (!frames_2) {
                                console.error("GameObject:" + changed.gameObject.name + "'s Img resource load error");
                            }
                            this.change({
                                frames: frames_2,
                                id: changed.gameObject.id,
                                component: component,
                            });
                            _a.label = 5;
                        case 5: return [3, 7];
                        case 6:
                            if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                                this.remove(changed.gameObject.id);
                            }
                            _a.label = 7;
                        case 7: return [2];
                    }
                });
            });
        };
        SpriteAnimation.prototype.add = function (_a) {
            var frames = _a.frames, id = _a.id, component = _a.component;
            var animate = new rendererAdapter.SpriteAnimation({ frames: frames });
            this.animates[id] = animate;
            this.containerManager
                .getContainer(id)
                .addChildAt(animate.animatedSprite, 0);
            component.animate = this.animates[id];
            this.animates[id].speed = 1000 / 60 / component.speed;
            if (this.autoPlay[id]) {
                animate.animatedSprite.play();
            }
        };
        SpriteAnimation.prototype.change = function (_a) {
            var frames = _a.frames, id = _a.id, component = _a.component;
            this.remove(id, true);
            this.add({ frames: frames, id: id, component: component });
        };
        SpriteAnimation.prototype.remove = function (id, isChange) {
            var animate = this.animates[id];
            this.autoPlay[id] = animate.animatedSprite.playing;
            this.containerManager.getContainer(id).removeChild(animate.animatedSprite);
            animate.animatedSprite.destroy();
            delete this.animates[id];
            if (!isChange) {
                delete this.autoPlay[id];
            }
        };
        SpriteAnimation.systemName = 'SpriteAnimation';
        SpriteAnimation = __decorate([
            eva_js.decorators.componentObserver({
                SpriteAnimation: ['speed', 'resource'],
            })
        ], SpriteAnimation);
        return SpriteAnimation;
    }(pluginRenderer.Renderer));

    exports.SpriteAnimation = SpriteAnimation$1;
    exports.SpriteAnimationSystem = SpriteAnimation;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
