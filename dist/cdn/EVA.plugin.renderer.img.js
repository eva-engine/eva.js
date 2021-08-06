(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.img = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter, global.PIXI));
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

    class Img$2 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.resource = '';
        }
        init(obj) {
            if (obj && obj.resource) {
                this.resource = obj.resource;
            }
        }
    }
    Img$2.componentName = 'Img';
    __decorate([
        eva_js.decorators.IDEProp
    ], Img$2.prototype, "resource", void 0);

    eva_js.resource.registerInstance(eva_js.RESOURCE_TYPE.IMAGE, ({ data = {} }) => {
        const { image } = data;
        if (image) {
            const texture = pixi_js.Texture.from(image);
            return texture;
        }
        return;
    });
    eva_js.resource.registerDestroy(eva_js.RESOURCE_TYPE.IMAGE, ({ instance }) => {
        if (instance) {
            instance.destroy(true);
        }
    });
    let Img = class Img extends pluginRenderer.Renderer {
        constructor() {
            super(...arguments);
            this.name = 'Img';
            this.imgs = {};
        }
        init() {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        }
        rendererUpdate(gameObject) {
            const { width, height } = gameObject.transform.size;
            if (this.imgs[gameObject.id]) {
                this.imgs[gameObject.id].sprite.width = width;
                this.imgs[gameObject.id].sprite.height = height;
            }
        }
        componentChanged(changed) {
            return __awaiter(this, void 0, void 0, function* () {
                if (changed.componentName === 'Img') {
                    const component = changed.component;
                    if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                        const sprite = new rendererAdapter.Sprite(null);
                        eva_js.resource.getResource(component.resource).then(({ instance }) => {
                            if (!instance) {
                                console.error(`GameObject:${changed.gameObject.name}'s Img resource load error`);
                            }
                            sprite.image = instance;
                        });
                        this.imgs[changed.gameObject.id] = sprite;
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .addChildAt(sprite.sprite, 0);
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.CHANGE) {
                        const { instance } = yield eva_js.resource.getResource(component.resource);
                        if (!instance) {
                            console.error(`GameObject:${changed.gameObject.name}'s Img resource load error`);
                        }
                        this.imgs[changed.gameObject.id].image = instance;
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                        const sprite = this.imgs[changed.gameObject.id];
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .removeChild(sprite.sprite);
                        sprite.sprite.destroy({ children: true });
                        delete this.imgs[changed.gameObject.id];
                    }
                }
            });
        }
    };
    Img.systemName = 'Img';
    Img = __decorate([
        eva_js.decorators.componentObserver({
            Img: [{ prop: ['resource'], deep: false }],
        })
    ], Img);
    var Img$1 = Img;

    exports.Img = Img$2;
    exports.ImgSystem = Img$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
