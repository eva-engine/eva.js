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

    var Render$1 = (function (_super) {
        __extends(Render, _super);
        function Render() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.sortDirty = false;
            _this.visible = true;
            _this.alpha = 1;
            _this.zIndex = 0;
            _this.sortableChildren = false;
            return _this;
        }
        Render.prototype.init = function (obj) {
            obj && Object.assign(this, obj);
        };
        Render.componentName = 'Render';
        __decorate([
            eva_js.decorators.IDEProp
        ], Render.prototype, "visible", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], Render.prototype, "alpha", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], Render.prototype, "zIndex", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], Render.prototype, "sortableChildren", void 0);
        return Render;
    }(eva_js.Component));

    var Render = (function (_super) {
        __extends(Render, _super);
        function Render() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'Render';
            return _this;
        }
        Render.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        Render.prototype.rendererUpdate = function (gameObject) {
            var _this = this;
            var component = gameObject.getComponent('Render');
            var container = this.containerManager.getContainer(gameObject.id);
            container.alpha = component.alpha;
            container.visible = component.visible;
            if (component.sortDirty && component.sortableChildren) {
                var gameObjects = gameObject.transform.children.map(function (_a) {
                    var gameObject = _a.gameObject;
                    return gameObject;
                });
                var children_1 = gameObjects
                    .sort(function (a, b) {
                    var aRender = a.getComponent('Render');
                    var bRender = b.getComponent('Render');
                    if (!aRender) {
                        return -1;
                    }
                    if (!bRender) {
                        return 1;
                    }
                    return aRender.zIndex - bRender.zIndex;
                })
                    .map(function (gameObject) {
                    return _this.containerManager.getContainer(gameObject.id);
                });
                var oldChildren = this.containerManager.getContainer(component.gameObject.id).children;
                var elements = oldChildren.filter(function (c) { return children_1.indexOf(c) === -1; });
                oldChildren.length = 0;
                oldChildren.push.apply(oldChildren, __spread(elements, children_1));
                component.sortDirty = false;
            }
        };
        Render.prototype.componentChanged = function (changed) {
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
        };
        Render.prototype.add = function (changed) {
            if (changed.component.name === 'Render') {
                this.setDirty(changed);
            }
        };
        Render.prototype.change = function (changed) {
            if (changed.component.name === 'Render' &&
                changed.prop.prop[0] === 'zIndex') {
                this.setDirty(changed);
            }
        };
        Render.prototype.remove = function (changed) {
            if (changed.component.name === 'Render') {
                var container = this.containerManager.getContainer(changed.gameObject.id);
                container.alpha = 1;
            }
        };
        Render.prototype.setDirty = function (changed) {
            var parentRender = changed.gameObject.parent &&
                changed.gameObject.parent.getComponent('Render');
            if (parentRender) {
                parentRender.sortDirty = true;
            }
        };
        Render.systemName = 'Render';
        Render = __decorate([
            eva_js.decorators.componentObserver({
                Render: ['zIndex'],
            })
        ], Render);
        return Render;
    }(pluginRenderer.Renderer));

    exports.Render = Render$1;
    exports.RenderSystem = Render;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
