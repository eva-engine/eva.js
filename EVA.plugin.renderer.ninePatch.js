(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.ninePatch = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter));
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

    var NinePatch$1 = /** @class */ (function (_super) {
        __extends(NinePatch, _super);
        function NinePatch() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.resource = '';
            _this.spriteName = '';
            _this.leftWidth = 0;
            _this.topHeight = 0;
            _this.rightWidth = 0;
            _this.bottomHeight = 0;
            return _this;
        }
        NinePatch.prototype.init = function (obj) {
            this.resource = obj.resource;
            this.spriteName = obj.spriteName;
            this.leftWidth = obj.leftWidth;
            this.topHeight = obj.topHeight;
            this.rightWidth = obj.rightWidth;
            this.bottomHeight = obj.bottomHeight;
        };
        NinePatch.componentName = 'NinePatch';
        __decorate([
            eva_js.decorators.IDEProp
        ], NinePatch.prototype, "resource", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], NinePatch.prototype, "spriteName", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], NinePatch.prototype, "leftWidth", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], NinePatch.prototype, "topHeight", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], NinePatch.prototype, "rightWidth", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], NinePatch.prototype, "bottomHeight", void 0);
        return NinePatch;
    }(eva_js.Component));

    var resourceKeySplit = '_s|r|c_'; // Notice: This key be created by sprite system.
    var NinePatch = /** @class */ (function (_super) {
        __extends(NinePatch, _super);
        function NinePatch() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'NinePatch';
            _this.ninePatch = {};
            return _this;
        }
        NinePatch.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        NinePatch.prototype.rendererUpdate = function (gameObject) {
            var _a = gameObject.transform.size, width = _a.width, height = _a.height;
            if (this.ninePatch[gameObject.id]) {
                this.ninePatch[gameObject.id].width = width;
                this.ninePatch[gameObject.id].height = height;
            }
        };
        NinePatch.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (changed.componentName === 'NinePatch') {
                        if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                            this.add(changed);
                        }
                        else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                            this.remove(changed);
                        }
                        else {
                            this.remove(changed);
                            this.add(changed);
                        }
                    }
                    return [2 /*return*/];
                });
            });
        };
        NinePatch.prototype.add = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component, _a, type, data, img, leftWidth, topHeight, rightWidth, bottomHeight, np;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            component = changed.component;
                            return [4 /*yield*/, eva_js.resource.getResource(component.resource)];
                        case 1:
                            _a = _b.sent(), type = _a.type, data = _a.data;
                            if (!data) {
                                throw new Error("GameObject:" + changed.gameObject.name + "'s NinePatch resource load error");
                            }
                            if (type === eva_js.RESOURCE_TYPE.SPRITE) {
                                img = component.resource + resourceKeySplit + component.spriteName;
                            }
                            else {
                                img = data.image;
                            }
                            leftWidth = component.leftWidth, topHeight = component.topHeight, rightWidth = component.rightWidth, bottomHeight = component.bottomHeight;
                            np = new rendererAdapter.NinePatch(img, leftWidth, topHeight, rightWidth, bottomHeight);
                            this.ninePatch[changed.gameObject.id] = np;
                            component.ninePatch = np;
                            this.containerManager
                                .getContainer(changed.gameObject.id)
                                // @ts-ignore
                                .addChildAt(np, 0);
                            return [2 /*return*/];
                    }
                });
            });
        };
        NinePatch.prototype.remove = function (changed) {
            var sprite = this.ninePatch[changed.gameObject.id];
            if (sprite) {
                this.containerManager
                    .getContainer(changed.gameObject.id)
                    .removeChild(sprite);
                delete this.ninePatch[changed.gameObject.id];
                sprite.destroy();
            }
        };
        NinePatch.systemName = 'NinePatch';
        NinePatch = __decorate([
            eva_js.decorators.componentObserver({
                NinePatch: [
                    'resource',
                    'spriteName',
                    'leftWidth',
                    'topHeight',
                    'rightWidth',
                    'bottomHeight',
                ],
            })
        ], NinePatch);
        return NinePatch;
    }(pluginRenderer.Renderer));

    exports.NinePatch = NinePatch$1;
    exports.NinePatchSystem = NinePatch;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
