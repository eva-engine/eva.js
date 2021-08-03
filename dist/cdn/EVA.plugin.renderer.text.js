(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('pixi.js'), require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter')) :
    typeof define === 'function' && define.amd ? define(['exports', 'pixi.js', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.text = {}), global.PIXI, global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter));
}(this, (function (exports, pixi_js, eva_js, pluginRenderer, rendererAdapter) { 'use strict';

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

    class Text$2 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.text = '';
            this.style = {};
        }
        init(obj) {
            const style = new pixi_js.TextStyle({
                fontSize: 20,
            });
            const newStyle = {};
            for (const key in style) {
                if (key.indexOf('_') === 0) {
                    newStyle[key.substring(1)] = style[key];
                }
            }
            this.style = newStyle;
            if (obj) {
                this.text = obj.text;
                Object.assign(this.style, obj.style);
            }
        }
    }
    Text$2.componentName = 'Text';
    __decorate([
        eva_js.decorators.IDEProp
    ], Text$2.prototype, "text", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Text$2.prototype, "style", void 0);

    let Text = class Text extends pluginRenderer.Renderer {
        constructor() {
            super(...arguments);
            this.name = 'Text';
            this.texts = {};
        }
        init() {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        Text.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component, text;
                return __generator(this, function (_a) {
                    if (changed.componentName !== 'Text')
                        return [2];
                    if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                        component = changed.component;
                        text = new rendererAdapter.Text(component.text, component.style);
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .addChildAt(text, 0);
                        this.texts[changed.gameObject.id] = {
                            text: text,
                            component: changed.component,
                        };
                        this.setSize(changed);
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .removeChild(this.texts[changed.gameObject.id].text);
                        this.texts[changed.gameObject.id].text.destroy(true);
                        delete this.texts[changed.gameObject.id];
                    }
                    else {
                        this.change(changed);
                        this.setSize(changed);
                    }
                    return [2];
                });
            });
        }
        change(changed) {
            const { text, component } = this.texts[changed.gameObject.id];
            if (changed.prop.prop[0] === 'text') {
                text.text = component.text;
            }
            else if (changed.prop.prop[0] === 'style') {
                Object.assign(text.style, changed.component.style);
            }
        }
        setSize(changed) {
            const { transform } = changed.gameObject;
            if (!transform)
                return;
            transform.size.width = this.texts[changed.gameObject.id].text.width;
            transform.size.height = this.texts[changed.gameObject.id].text.height;
        }
    };
    Text.systemName = 'Text';
    Text = __decorate([
        eva_js.decorators.componentObserver({
            Text: ['text', { prop: ['style'], deep: true }],
        })
    ], Text);
    var Text$1 = Text;

    exports.Text = Text$2;
    exports.TextSystem = Text$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
