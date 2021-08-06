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

    class NinePatch$2 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.resource = '';
            this.spriteName = '';
            this.leftWidth = 0;
            this.topHeight = 0;
            this.rightWidth = 0;
            this.bottomHeight = 0;
        }
        init(obj) {
            this.resource = obj.resource;
            this.spriteName = obj.spriteName;
            this.leftWidth = obj.leftWidth;
            this.topHeight = obj.topHeight;
            this.rightWidth = obj.rightWidth;
            this.bottomHeight = obj.bottomHeight;
        }
    }
    NinePatch$2.componentName = 'NinePatch';
    __decorate([
        eva_js.decorators.IDEProp
    ], NinePatch$2.prototype, "resource", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], NinePatch$2.prototype, "spriteName", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], NinePatch$2.prototype, "leftWidth", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], NinePatch$2.prototype, "topHeight", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], NinePatch$2.prototype, "rightWidth", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], NinePatch$2.prototype, "bottomHeight", void 0);

    const resourceKeySplit = '_s|r|c_';
    let NinePatch = class NinePatch extends pluginRenderer.Renderer {
        constructor() {
            super(...arguments);
            this.name = 'NinePatch';
            this.ninePatch = {};
        }
        init() {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        }
        rendererUpdate(gameObject) {
            const { width, height } = gameObject.transform.size;
            if (this.ninePatch[gameObject.id]) {
                this.ninePatch[gameObject.id].width = width;
                this.ninePatch[gameObject.id].height = height;
            }
        }
        componentChanged(changed) {
            return __awaiter(this, void 0, void 0, function* () {
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
            });
        }
        add(changed) {
            return __awaiter(this, void 0, void 0, function* () {
                const component = changed.component;
                const { type, data } = yield eva_js.resource.getResource(component.resource);
                if (!data) {
                    throw new Error(`GameObject:${changed.gameObject.name}'s NinePatch resource load error`);
                }
                let img;
                if (type === eva_js.RESOURCE_TYPE.SPRITE) {
                    img = component.resource + resourceKeySplit + component.spriteName;
                }
                else {
                    img = data.image;
                }
                const { leftWidth, topHeight, rightWidth, bottomHeight } = component;
                const np = new rendererAdapter.NinePatch(img, leftWidth, topHeight, rightWidth, bottomHeight);
                this.ninePatch[changed.gameObject.id] = np;
                component.ninePatch = np;
                this.containerManager
                    .getContainer(changed.gameObject.id)
                    .addChildAt(np, 0);
            });
        }
        remove(changed) {
            const sprite = this.ninePatch[changed.gameObject.id];
            if (sprite) {
                this.containerManager
                    .getContainer(changed.gameObject.id)
                    .removeChild(sprite);
                delete this.ninePatch[changed.gameObject.id];
                sprite.destroy({ children: true });
            }
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
    var NinePatch$1 = NinePatch;

    exports.NinePatch = NinePatch$2;
    exports.NinePatchSystem = NinePatch$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
