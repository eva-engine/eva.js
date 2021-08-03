(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.mask = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter));
}(this, (function (exports, eva_js, pluginRenderer, rendererAdapter) { 'use strict';

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

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    exports.MASK_TYPE = void 0;
    (function (MASK_TYPE) {
        MASK_TYPE["Circle"] = "Circle";
        MASK_TYPE["Ellipse"] = "Ellipse";
        MASK_TYPE["Rect"] = "Rect";
        MASK_TYPE["RoundedRect"] = "RoundedRect";
        MASK_TYPE["Polygon"] = "Polygon";
        MASK_TYPE["Img"] = "Img";
        MASK_TYPE["Sprite"] = "Sprite";
    })(exports.MASK_TYPE || (exports.MASK_TYPE = {}));
    var Mask$1 = (function (_super) {
        __extends(Mask, _super);
        function Mask() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.style = {};
            _this.resource = '';
            _this.spriteName = '';
            return _this;
        }
        Mask.prototype.init = function (obj) {
            Object.assign(this, obj);
        };
        Mask.componentName = 'Mask';
        __decorate([
            eva_js.decorators.IDEProp
        ], Mask.prototype, "type", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], Mask.prototype, "style", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], Mask.prototype, "resource", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], Mask.prototype, "spriteName", void 0);
        return Mask;
    }(eva_js.Component));

    var resourceKeySplit = '_s|r|c_';
    var propertyForGraphics = {
        Circle: ['x', 'y', 'radius'],
        Ellipse: ['x', 'y', 'width', 'height'],
        Rect: ['x', 'y', 'width', 'height'],
        RoundedRect: ['x', 'y', 'width', 'height', 'radius'],
        Polygon: ['paths'],
    };
    var functionForGraphics = {
        Circle: 'drawCircle',
        Ellipse: 'drawEllipse',
        Rect: 'drawRect',
        RoundedRect: 'drawRoundedRect',
        Polygon: 'drawPolygon',
    };
    var MASK_TYPE;
    (function (MASK_TYPE) {
        MASK_TYPE["Circle"] = "Circle";
        MASK_TYPE["Ellipse"] = "Ellipse";
        MASK_TYPE["Rect"] = "Rect";
        MASK_TYPE["RoundedRect"] = "RoundedRect";
        MASK_TYPE["Polygon"] = "Polygon";
        MASK_TYPE["Img"] = "Img";
        MASK_TYPE["Sprite"] = "Sprite";
    })(MASK_TYPE || (MASK_TYPE = {}));
    var Mask = (function (_super) {
        __extends(Mask, _super);
        function Mask() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'Mask';
            _this.changedCache = {};
            _this.maskSpriteCache = {};
            return _this;
        }
        Mask.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        Mask.prototype.rendererUpdate = function () {
            this.changedCache = {};
        };
        Mask.prototype.componentChanged = function (changed) {
            if (changed.component.name !== 'Mask')
                return;
            switch (changed.type) {
                case eva_js.OBSERVER_TYPE.ADD:
                    this.add(changed);
                    break;
                case eva_js.OBSERVER_TYPE.REMOVE:
                    this.remove(changed);
                    break;
                case eva_js.OBSERVER_TYPE.CHANGE:
                    this.change(changed);
                    break;
            }
        };
        Mask.prototype.add = function (changed) {
            var component = changed.component;
            if (!(component.type in MASK_TYPE)) {
                throw new Error('no have Mask type: ' + component.type);
            }
            if (!component.style) {
                throw new Error('no have Mask style: ' + component.type);
            }
            var mask;
            switch (component.type) {
                case MASK_TYPE.Circle:
                    mask = this.createGraphics(component);
                    break;
                case MASK_TYPE.Ellipse:
                    mask = this.createGraphics(component);
                    break;
                case MASK_TYPE.Rect:
                    mask = this.createGraphics(component);
                    break;
                case MASK_TYPE.RoundedRect:
                    mask = this.createGraphics(component);
                    break;
                case MASK_TYPE.Polygon:
                    mask = this.createGraphics(component);
                    break;
                case MASK_TYPE.Img:
                    mask = this.createSprite(component);
                    break;
                case MASK_TYPE.Sprite:
                    mask = this.createSprite(component);
                    break;
            }
            if (!mask) {
                throw new Error('no have mask instance, check your mask params: ' + component.type);
            }
            var container = this.containerManager.getContainer(changed.gameObject.id);
            container.mask = mask;
            container.addChild(mask);
        };
        Mask.prototype.remove = function (changed) {
            var container = this.containerManager.getContainer(changed.gameObject.id);
            container.removeChild(container.mask);
            container.mask.destroy(true);
            container.mask = null;
            delete this.maskSpriteCache[changed.component.gameObject.id];
        };
        Mask.prototype.change = function (changed) {
            if (this.changedCache[changed.gameObject.id])
                return;
            var component = changed.component;
            if (changed.prop.prop[0] === 'type') {
                this.changedCache[changed.gameObject.id] = true;
                if ([MASK_TYPE.Sprite, MASK_TYPE.Img].indexOf(component.type) > -1) {
                    this.remove(changed);
                    this.add(changed);
                }
                else {
                    this.redrawGraphics(changed);
                }
            }
            else if (changed.prop.prop[0] === 'style') {
                if ([MASK_TYPE.Sprite, MASK_TYPE.Img].indexOf(component.type) > -1) {
                    this.changeSpriteStyle(component);
                }
                else {
                    this.redrawGraphics(changed);
                }
            }
            else if (changed.prop.prop[0] === 'resource') {
                this.changedCache[changed.gameObject.id] = true;
                this.changeSprite(component);
            }
            else if (changed.prop.prop[0] === 'spriteName') {
                this.changedCache[changed.gameObject.id] = true;
                this.changeSprite(component);
            }
        };
        Mask.prototype.createGraphics = function (component) {
            var graphics = new rendererAdapter.Graphics();
            this.draw(graphics, component);
            return graphics;
        };
        Mask.prototype.redrawGraphics = function (changed) {
            var container = this.containerManager.getContainer(changed.gameObject.id);
            var graphics = container.mask;
            graphics.clear();
            this.draw(graphics, changed.component);
        };
        Mask.prototype.draw = function (graphics, component) {
            var e_1, _a;
            var params = [];
            try {
                for (var _b = __values(propertyForGraphics[component.type]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    params.push(component.style[key]);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            graphics.beginFill(0x000000, 1);
            graphics[functionForGraphics[component.type]].apply(graphics, __spread(params));
            graphics.endFill();
        };
        Mask.prototype.createSprite = function (component) {
            var sprite = new rendererAdapter.Sprite(null);
            this.maskSpriteCache[component.gameObject.id] = sprite;
            this.setSprite(component, sprite);
            return sprite.sprite;
        };
        Mask.prototype.changeSpriteStyle = function (component) {
            var sprite = this.maskSpriteCache[component.gameObject.id];
            sprite.sprite.width = component.style.width;
            sprite.sprite.height = component.style.height;
            sprite.sprite.position.x = component.style.x;
            sprite.sprite.position.y = component.style.y;
        };
        Mask.prototype.changeSprite = function (component) {
            var sprite = this.maskSpriteCache[component.gameObject.id];
            this.setSprite(component, sprite);
        };
        Mask.prototype.setSprite = function (component, sprite) {
            return __awaiter(this, void 0, void 0, function () {
                var res, img, texture;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, eva_js.resource.getResource(component.resource)];
                        case 1:
                            res = _a.sent();
                            return [3, 3];
                        case 2:
                            _a.sent();
                            throw new Error('mask resource load error');
                        case 3:
                            if (component.type === MASK_TYPE.Sprite) {
                                img = component.resource + resourceKeySplit + component.spriteName;
                                texture = res.instance[img];
                                sprite.image = texture;
                            }
                            else {
                                sprite.image = res.data.image;
                            }
                            sprite.sprite.width = component.style.width;
                            sprite.sprite.height = component.style.height;
                            sprite.sprite.position.x = component.style.x;
                            sprite.sprite.position.y = component.style.y;
                            return [2];
                    }
                });
            });
        };
        Mask.systemName = 'Mask';
        Mask = __decorate([
            eva_js.decorators.componentObserver({
                Mask: ['type', { prop: ['style'], deep: true }, 'resource', 'spriteName'],
            })
        ], Mask);
        return Mask;
    }(pluginRenderer.Renderer));

    exports.Mask = Mask$1;
    exports.MaskSystem = Mask;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
