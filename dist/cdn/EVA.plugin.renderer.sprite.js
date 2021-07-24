(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.sprite = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter, global.PIXI));
}(this, (function (exports, eva_js, pluginRenderer, rendererAdapter, pixi_js) { 'use strict';

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
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    var Sprite$1 = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.resource = '';
            _this.spriteName = '';
            return _this;
        }
        Sprite.prototype.init = function (obj) {
            if (obj && obj.resource) {
                this.resource = obj.resource;
                this.spriteName = obj.spriteName;
            }
        };
        Sprite.componentName = 'Sprite';
        __decorate([
            eva_js.decorators.IDEProp
        ], Sprite.prototype, "resource", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], Sprite.prototype, "spriteName", void 0);
        return Sprite;
    }(eva_js.Component));

    var resourceKeySplit = '_s|r|c_';
    eva_js.resource.registerInstance(eva_js.RESOURCE_TYPE.SPRITE, function (_a) {
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
                r(textures);
            });
        });
    });
    eva_js.resource.registerDestroy(eva_js.RESOURCE_TYPE.SPRITE, function (_a) {
        var instance = _a.instance;
        if (!instance)
            return;
        for (var key in instance) {
            instance[key].destroy(true);
        }
    });
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'Sprite';
            _this.sprites = {};
            return _this;
        }
        Sprite.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        Sprite.prototype.rendererUpdate = function (gameObject) {
            var _a = gameObject.transform.size, width = _a.width, height = _a.height;
            if (this.sprites[gameObject.id]) {
                this.sprites[gameObject.id].sprite.width = width;
                this.sprites[gameObject.id].sprite.height = height;
            }
        };
        Sprite.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component_1, sprite_1, instance, sprite;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(changed.componentName === 'Sprite')) return [3, 4];
                            component_1 = changed.component;
                            if (!(changed.type === eva_js.OBSERVER_TYPE.ADD)) return [3, 1];
                            sprite_1 = new rendererAdapter.Sprite(null);
                            eva_js.resource.getResource(component_1.resource).then(function (_a) {
                                var instance = _a.instance;
                                return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_b) {
                                        if (!instance) {
                                            throw new Error("GameObject:" + changed.gameObject.name + "'s Sprite resource load error");
                                        }
                                        sprite_1.image =
                                            instance[component_1.resource + resourceKeySplit + component_1.spriteName];
                                        return [2];
                                    });
                                });
                            });
                            this.sprites[changed.gameObject.id] = sprite_1;
                            this.containerManager
                                .getContainer(changed.gameObject.id)
                                .addChildAt(sprite_1.sprite, 0);
                            return [3, 4];
                        case 1:
                            if (!(changed.type === eva_js.OBSERVER_TYPE.CHANGE)) return [3, 3];
                            return [4, eva_js.resource.getResource(component_1.resource)];
                        case 2:
                            instance = (_a.sent()).instance;
                            if (!instance) {
                                throw new Error("GameObject:" + changed.gameObject.name + "'s Sprite resource load error");
                            }
                            this.sprites[changed.gameObject.id].image =
                                instance[component_1.resource + resourceKeySplit + component_1.spriteName];
                            return [3, 4];
                        case 3:
                            if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                                sprite = this.sprites[changed.gameObject.id];
                                this.containerManager
                                    .getContainer(changed.gameObject.id)
                                    .removeChild(sprite.sprite);
                                delete this.sprites[changed.gameObject.id];
                            }
                            _a.label = 4;
                        case 4: return [2];
                    }
                });
            });
        };
        Sprite.systemName = 'Sprite';
        Sprite = __decorate([
            eva_js.decorators.componentObserver({
                Sprite: ['spriteName'],
            })
        ], Sprite);
        return Sprite;
    }(pluginRenderer.Renderer));

    exports.Sprite = Sprite$1;
    exports.SpriteSystem = Sprite;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
