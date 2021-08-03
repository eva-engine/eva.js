(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.mask = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter));
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
    class Mask$2 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.style = {};
            this.resource = '';
            this.spriteName = '';
        }
        init(obj) {
            Object.assign(this, obj);
        }
    }
    Mask$2.componentName = 'Mask';
    __decorate([
        eva_js.decorators.IDEProp
    ], Mask$2.prototype, "type", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Mask$2.prototype, "style", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Mask$2.prototype, "resource", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Mask$2.prototype, "spriteName", void 0);

    const resourceKeySplit = '_s|r|c_';
    const propertyForGraphics = {
        Circle: ['x', 'y', 'radius'],
        Ellipse: ['x', 'y', 'width', 'height'],
        Rect: ['x', 'y', 'width', 'height'],
        RoundedRect: ['x', 'y', 'width', 'height', 'radius'],
        Polygon: ['paths'],
    };
    const functionForGraphics = {
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
    let Mask = class Mask extends pluginRenderer.Renderer {
        constructor() {
            super(...arguments);
            this.name = 'Mask';
            this.changedCache = {};
            this.maskSpriteCache = {};
        }
        init() {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        }
        rendererUpdate() {
            this.changedCache = {};
        }
        componentChanged(changed) {
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
        }
        add(changed) {
            const component = changed.component;
            if (!(component.type in MASK_TYPE)) {
                throw new Error('no have Mask type: ' + component.type);
            }
            if (!component.style) {
                throw new Error('no have Mask style: ' + component.type);
            }
            let mask;
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
            const container = this.containerManager.getContainer(changed.gameObject.id);
            container.mask = mask;
            container.addChild(mask);
        }
        remove(changed) {
            const container = this.containerManager.getContainer(changed.gameObject.id);
            container.removeChild(container.mask);
            container.mask.destroy(true);
            container.mask = null;
            delete this.maskSpriteCache[changed.component.gameObject.id];
        }
        change(changed) {
            if (this.changedCache[changed.gameObject.id])
                return;
            const component = changed.component;
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
        }
        createGraphics(component) {
            const graphics = new rendererAdapter.Graphics();
            this.draw(graphics, component);
            return graphics;
        }
        redrawGraphics(changed) {
            const container = this.containerManager.getContainer(changed.gameObject.id);
            const graphics = container.mask;
            graphics.clear();
            this.draw(graphics, changed.component);
        }
        draw(graphics, component) {
            const params = [];
            for (const key of propertyForGraphics[component.type]) {
                params.push(component.style[key]);
            }
            graphics.beginFill(0x000000, 1);
            graphics[functionForGraphics[component.type]](...params);
            graphics.endFill();
        }
        createSprite(component) {
            const sprite = new rendererAdapter.Sprite(null);
            this.maskSpriteCache[component.gameObject.id] = sprite;
            this.setSprite(component, sprite);
            return sprite.sprite;
        }
        changeSpriteStyle(component) {
            const sprite = this.maskSpriteCache[component.gameObject.id];
            sprite.sprite.width = component.style.width;
            sprite.sprite.height = component.style.height;
            sprite.sprite.position.x = component.style.x;
            sprite.sprite.position.y = component.style.y;
        }
        changeSprite(component) {
            const sprite = this.maskSpriteCache[component.gameObject.id];
            this.setSprite(component, sprite);
        }
        setSprite(component, sprite) {
            return __awaiter(this, void 0, void 0, function* () {
                let res;
                try {
                    res = yield eva_js.resource.getResource(component.resource);
                }
                catch (e) {
                    throw new Error('mask resource load error');
                }
                if (component.type === MASK_TYPE.Sprite) {
                    const img = component.resource + resourceKeySplit + component.spriteName;
                    const texture = res.instance[img];
                    sprite.image = texture;
                }
                else {
                    sprite.image = res.data.image;
                }
                sprite.sprite.width = component.style.width;
                sprite.sprite.height = component.style.height;
                sprite.sprite.position.x = component.style.x;
                sprite.sprite.position.y = component.style.y;
            });
        }
    };
    Mask.systemName = 'Mask';
    Mask = __decorate([
        eva_js.decorators.componentObserver({
            Mask: ['type', { prop: ['style'], deep: true }, 'resource', 'spriteName'],
        })
    ], Mask);
    var Mask$1 = Mask;

    exports.Mask = Mask$2;
    exports.MaskSystem = Mask$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
