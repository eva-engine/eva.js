(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.sprite = {}), global.EVA, global.EVA.plugin.renderer, global.PIXI));
}(this, (function (exports, eva_js, pluginRenderer, pixi_js) { 'use strict';

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

    class Sprite$3 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.resource = '';
            this.spriteName = '';
        }
        init(obj) {
            if (obj && obj.resource) {
                this.resource = obj.resource;
                this.spriteName = obj.spriteName;
            }
        }
    }
    Sprite$3.componentName = 'Sprite';
    __decorate([
        eva_js.decorators.IDEProp
    ], Sprite$3.prototype, "resource", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Sprite$3.prototype, "spriteName", void 0);

    class Sprite$2 {
        constructor(image) {
            this._image = null;
            this._image = image;
            if (image) {
                if (image instanceof HTMLImageElement) {
                    this.sprite = pixi_js.Sprite.from(image);
                }
                else if (image instanceof pixi_js.Texture) {
                    this.sprite = new pixi_js.Sprite(image);
                }
            }
            else {
                this.sprite = new pixi_js.Sprite();
            }
        }
        set image(val) {
            if (this._image === val) {
                return;
            }
            if (val instanceof HTMLImageElement) {
                this.sprite.texture && this.sprite.texture.destroy(false);
                this.sprite.texture = pixi_js.Texture.from(val);
            }
            else if (val instanceof pixi_js.Texture) {
                this.sprite.texture = val;
            }
            this._image = val;
        }
        get image() {
            return this._image;
        }
    }

    const resourceKeySplit = '_s|r|c_';
    eva_js.resource.registerInstance(eva_js.RESOURCE_TYPE.SPRITE, ({ name, data }) => {
        return new Promise(r => {
            const textureObj = data.json;
            const texture = pixi_js.BaseTexture.from(data.image);
            const frames = textureObj.frames || {};
            const animations = textureObj.animations || {};
            const newFrames = {};
            for (const key in frames) {
                const newKey = name + resourceKeySplit + key;
                newFrames[newKey] = frames[key];
            }
            for (const key in animations) {
                let spriteList = [];
                if (animations[key] && animations[key].length >= 0) {
                    for (let spriteName of animations[key]) {
                        const newSpriteName = name + resourceKeySplit + spriteName;
                        spriteList.push(newSpriteName);
                    }
                }
                animations[key] = spriteList;
            }
            textureObj.frames = newFrames;
            const spriteSheet = new pixi_js.Spritesheet(texture, textureObj);
            spriteSheet.parse(() => {
                const { textures } = spriteSheet;
                r(textures);
            });
        });
    });
    eva_js.resource.registerDestroy(eva_js.RESOURCE_TYPE.SPRITE, ({ instance }) => {
        if (!instance)
            return;
        for (let key in instance) {
            instance[key].destroy(true);
        }
    });
    let Sprite = class Sprite extends pluginRenderer.Renderer {
        constructor() {
            super(...arguments);
            this.name = 'Sprite';
            this.sprites = {};
        }
        init() {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        }
        rendererUpdate(gameObject) {
            const { width, height } = gameObject.transform.size;
            if (this.sprites[gameObject.id]) {
                this.sprites[gameObject.id].sprite.width = width;
                this.sprites[gameObject.id].sprite.height = height;
            }
        }
        componentChanged(changed) {
            return __awaiter(this, void 0, void 0, function* () {
                if (changed.componentName === 'Sprite') {
                    const component = changed.component;
                    if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                        const sprite = new Sprite$2(null);
                        eva_js.resource.getResource(component.resource).then(({ instance }) => __awaiter(this, void 0, void 0, function* () {
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
                                sprite.sprite.destroy(true);
                                delete this.sprites[changed.gameObject.id];
                            }
                            sprite.image =
                                instance[component.resource + resourceKeySplit + component.spriteName];
                        }));
                        this.sprites[changed.gameObject.id] = sprite;
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .addChildAt(sprite.sprite, 0);
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.CHANGE) {
                        const { instance } = yield eva_js.resource.getResource(component.resource);
                        if (!instance) {
                            throw new Error(`GameObject:${changed.gameObject.name}'s Sprite resource load error`);
                        }
                        this.sprites[changed.gameObject.id].image =
                            instance[component.resource + resourceKeySplit + component.spriteName];
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                        const sprite = this.sprites[changed.gameObject.id];
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .removeChild(sprite.sprite);
                        delete this.sprites[changed.gameObject.id];
                    }
                }
            });
        }
    };
    Sprite.systemName = 'Sprite';
    Sprite = __decorate([
        eva_js.decorators.componentObserver({
            Sprite: ['spriteName'],
        })
    ], Sprite);
    var Sprite$1 = Sprite;

    exports.Sprite = Sprite$3;
    exports.SpriteSystem = Sprite$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
