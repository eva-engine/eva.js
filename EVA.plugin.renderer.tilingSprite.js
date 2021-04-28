(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.tilingSprite = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter));
}(this, (function (exports, eva_js, pluginRenderer, rendererAdapter) { 'use strict';

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

    var TilingSprite$1 = /** @class */ (function (_super) {
        __extends(TilingSprite, _super);
        function TilingSprite() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.resource = '';
            _this.tileScale = {
                x: 1,
                y: 1,
            };
            _this.tilePosition = {
                x: 0,
                y: 0,
            };
            return _this;
        }
        TilingSprite.prototype.init = function (obj) {
            if (obj) {
                this.resource = obj.resource;
                this.tileScale = obj.tileScale;
                this.tilePosition = obj.tilePosition;
            }
        };
        TilingSprite.componentName = 'TilingSprite';
        __decorate([
            eva_js.decorators.IDEProp
        ], TilingSprite.prototype, "resource", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], TilingSprite.prototype, "tileScale", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], TilingSprite.prototype, "tilePosition", void 0);
        return TilingSprite;
    }(eva_js.Component));

    var TilingSprite = /** @class */ (function (_super) {
        __extends(TilingSprite, _super);
        function TilingSprite() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'TilingSprite';
            _this.imgs = {};
            return _this;
        }
        TilingSprite.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        TilingSprite.prototype.rendererUpdate = function (gameObject) {
            var _a = gameObject.transform.size, width = _a.width, height = _a.height;
            var img = this.imgs[gameObject.id];
            if (img) {
                img.tilingSprite.width = width;
                img.tilingSprite.height = height;
            }
        };
        TilingSprite.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component, sprite_1, data, sprite;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(changed.componentName === 'TilingSprite')) return [3 /*break*/, 6];
                            component = changed.component;
                            if (!(changed.type === eva_js.OBSERVER_TYPE.ADD)) return [3 /*break*/, 1];
                            sprite_1 = new rendererAdapter.TilingSprite(null);
                            eva_js.resource.getResource(component.resource).then(function (_a) {
                                var data = _a.data;
                                if (!data) {
                                    throw new Error("GameObject:" + changed.gameObject.name + "'s TilingSprite resource load error");
                                }
                                sprite_1.image = data.image;
                            });
                            this.imgs[changed.gameObject.id] = sprite_1;
                            this.containerManager
                                .getContainer(changed.gameObject.id)
                                .addChildAt(sprite_1.tilingSprite, 0);
                            this.setProp(changed.gameObject.id, component);
                            return [3 /*break*/, 6];
                        case 1:
                            if (!(changed.type === eva_js.OBSERVER_TYPE.CHANGE)) return [3 /*break*/, 5];
                            if (!(changed.prop.prop[0] === 'resource')) return [3 /*break*/, 3];
                            return [4 /*yield*/, eva_js.resource.getResource(component.resource)];
                        case 2:
                            data = (_a.sent()).data;
                            if (!data) {
                                throw new Error("GameObject:" + changed.gameObject.name + "'s TilingSprite resource load error");
                            }
                            this.imgs[changed.gameObject.id].image = data.image;
                            return [3 /*break*/, 4];
                        case 3:
                            this.setProp(changed.gameObject.id, component);
                            _a.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                                sprite = this.imgs[changed.gameObject.id];
                                this.containerManager
                                    .getContainer(changed.gameObject.id)
                                    .removeChild(sprite.tilingSprite);
                                delete this.imgs[changed.gameObject.id];
                            }
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        TilingSprite.prototype.setProp = function (id, component) {
            this.imgs[id].tilingSprite.tilePosition = component.tilePosition;
            this.imgs[id].tilingSprite.tileScale = component.tileScale;
        };
        TilingSprite = __decorate([
            eva_js.decorators.componentObserver({
                TilingSprite: [
                    { prop: ['resource'], deep: false },
                    { prop: ['tileScale'], deep: true },
                    { prop: ['tilePosition'], deep: true },
                ],
            })
        ], TilingSprite);
        return TilingSprite;
    }(pluginRenderer.Renderer));

    exports.TilingSprite = TilingSprite$1;
    exports.TilingSpriteSystem = TilingSprite;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
