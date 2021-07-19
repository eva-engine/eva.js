(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.img = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter, global.PIXI));
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

    var Img$1 = (function (_super) {
        __extends(Img, _super);
        function Img() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.resource = '';
            return _this;
        }
        Img.prototype.init = function (obj) {
            if (obj && obj.resource) {
                this.resource = obj.resource;
            }
        };
        Img.componentName = 'Img';
        __decorate([
            eva_js.decorators.IDEProp
        ], Img.prototype, "resource", void 0);
        return Img;
    }(eva_js.Component));

    eva_js.resource.registerInstance(eva_js.RESOURCE_TYPE.IMAGE, function (_a) {
        var _b = _a.data, data = _b === void 0 ? {} : _b;
        var image = data.image;
        if (image) {
            var texture = pixi_js.Texture.from(image);
            return texture;
        }
        return;
    });
    eva_js.resource.registerDestroy(eva_js.RESOURCE_TYPE.IMAGE, function (_a) {
        var instance = _a.instance;
        if (instance) {
            instance.destroy(true);
        }
    });
    var Img = (function (_super) {
        __extends(Img, _super);
        function Img() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'Img';
            _this.imgs = {};
            return _this;
        }
        Img.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        Img.prototype.rendererUpdate = function (gameObject) {
            var _a = gameObject.transform.size, width = _a.width, height = _a.height;
            if (this.imgs[gameObject.id]) {
                this.imgs[gameObject.id].sprite.width = width;
                this.imgs[gameObject.id].sprite.height = height;
            }
        };
        Img.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component, sprite_1, instance, sprite;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(changed.componentName === 'Img')) return [3, 4];
                            component = changed.component;
                            if (!(changed.type === eva_js.OBSERVER_TYPE.ADD)) return [3, 1];
                            sprite_1 = new rendererAdapter.Sprite(null);
                            eva_js.resource.getResource(component.resource).then(function (_a) {
                                var instance = _a.instance;
                                if (!instance) {
                                    console.error("GameObject:" + changed.gameObject.name + "'s Img resource load error");
                                }
                                sprite_1.image = instance;
                            });
                            this.imgs[changed.gameObject.id] = sprite_1;
                            this.containerManager
                                .getContainer(changed.gameObject.id)
                                .addChildAt(sprite_1.sprite, 0);
                            return [3, 4];
                        case 1:
                            if (!(changed.type === eva_js.OBSERVER_TYPE.CHANGE)) return [3, 3];
                            return [4, eva_js.resource.getResource(component.resource)];
                        case 2:
                            instance = (_a.sent()).instance;
                            if (!instance) {
                                console.error("GameObject:" + changed.gameObject.name + "'s Img resource load error");
                            }
                            this.imgs[changed.gameObject.id].image = instance;
                            return [3, 4];
                        case 3:
                            if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                                sprite = this.imgs[changed.gameObject.id];
                                this.containerManager
                                    .getContainer(changed.gameObject.id)
                                    .removeChild(sprite.sprite);
                                delete this.imgs[changed.gameObject.id];
                            }
                            _a.label = 4;
                        case 4: return [2];
                    }
                });
            });
        };
        Img.systemName = 'Img';
        Img = __decorate([
            eva_js.decorators.componentObserver({
                Img: [{ prop: ['resource'], deep: false }],
            })
        ], Img);
        return Img;
    }(pluginRenderer.Renderer));

    exports.Img = Img$1;
    exports.ImgSystem = Img;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
