(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.render = {}), global.EVA, global.EVA.plugin.renderer));
}(this, (function (exports, eva_js, pluginRenderer) { 'use strict';

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

    class Render$2 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.sortDirty = false;
            this.visible = true;
            this.alpha = 1;
            this.zIndex = 0;
            this.sortableChildren = false;
        }
        init(obj) {
            obj && Object.assign(this, obj);
        }
    }
    Render$2.componentName = 'Render';
    __decorate([
        eva_js.decorators.IDEProp
    ], Render$2.prototype, "visible", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Render$2.prototype, "alpha", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Render$2.prototype, "zIndex", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], Render$2.prototype, "sortableChildren", void 0);

    let Render = class Render extends pluginRenderer.Renderer {
        constructor() {
            super(...arguments);
            this.name = 'Render';
        }
        init() {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        }
        rendererUpdate(gameObject) {
            const component = gameObject.getComponent('Render');
            const container = this.containerManager.getContainer(gameObject.id);
            container.alpha = component.alpha;
            container.visible = component.visible;
            if (component.sortDirty && component.sortableChildren) {
                const gameObjects = gameObject.transform.children.map(({ gameObject }) => gameObject);
                const children = gameObjects
                    .sort((a, b) => {
                    const aRender = a.getComponent('Render');
                    const bRender = b.getComponent('Render');
                    if (!aRender) {
                        return -1;
                    }
                    if (!bRender) {
                        return 1;
                    }
                    return aRender.zIndex - bRender.zIndex;
                })
                    .map(gameObject => {
                    return this.containerManager.getContainer(gameObject.id);
                });
                const oldChildren = this.containerManager.getContainer(component.gameObject.id).children;
                const elements = oldChildren.filter(c => children.indexOf(c) === -1);
                oldChildren.length = 0;
                oldChildren.push(...elements, ...children);
                component.sortDirty = false;
            }
        }
        componentChanged(changed) {
            if (changed.type === eva_js.OBSERVER_TYPE.ADD ||
                changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                this.add(changed);
            }
            if (changed.type === eva_js.OBSERVER_TYPE.CHANGE) {
                this.change(changed);
            }
            if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                this.remove(changed);
            }
        }
        add(changed) {
            if (changed.component.name === 'Render') {
                this.setDirty(changed);
            }
        }
        change(changed) {
            if (changed.component.name === 'Render' &&
                changed.prop.prop[0] === 'zIndex') {
                this.setDirty(changed);
            }
        }
        remove(changed) {
            if (changed.component.name === 'Render') {
                const container = this.containerManager.getContainer(changed.gameObject.id);
                container.alpha = 1;
            }
        }
        setDirty(changed) {
            const parentRender = changed.gameObject.parent &&
                changed.gameObject.parent.getComponent('Render');
            if (parentRender) {
                parentRender.sortDirty = true;
            }
        }
    };
    Render.systemName = 'Render';
    Render = __decorate([
        eva_js.decorators.componentObserver({
            Render: ['zIndex'],
        })
    ], Render);
    var Render$1 = Render;

    exports.Render = Render$2;
    exports.RenderSystem = Render$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
