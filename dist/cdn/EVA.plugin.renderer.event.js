
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.event = {}), global.EVA, global.EVA.plugin.renderer, global.PIXI));
}(this, (function (exports, eva_js, pluginRenderer, pixi_js) { 'use strict';

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

    exports.HIT_AREA_TYPE = void 0;
    (function (HIT_AREA_TYPE) {
        HIT_AREA_TYPE["Circle"] = "Circle";
        HIT_AREA_TYPE["Ellipse"] = "Ellipse";
        HIT_AREA_TYPE["Polygon"] = "Polygon";
        HIT_AREA_TYPE["Rect"] = "Rect";
        HIT_AREA_TYPE["RoundedRect"] = "RoundedRect";
    })(exports.HIT_AREA_TYPE || (exports.HIT_AREA_TYPE = {}));
    var Event$1 = (function (_super) {
        __extends(Event, _super);
        function Event() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.hitArea = undefined;
            return _this;
        }
        Event.prototype.init = function (params) {
            params && Object.assign(this, params);
        };
        Event.componentName = 'Event';
        return Event;
    }(eva_js.Component));

    var hitAreaFunc = {
        Circle: pixi_js.Circle,
        Ellipse: pixi_js.Ellipse,
        Polygon: pixi_js.Polygon,
        Rect: pixi_js.Rectangle,
        RoundedRect: pixi_js.RoundedRectangle,
    };
    var propertyForHitArea = {
        Circle: ['x', 'y', 'radius'],
        Ellipse: ['x', 'y', 'width', 'height'],
        Rect: ['x', 'y', 'width', 'height'],
        RoundedRect: ['x', 'y', 'width', 'height', 'radius'],
        Polygon: ['paths'],
    };
    var Event = (function (_super) {
        __extends(Event, _super);
        function Event() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'Event';
            return _this;
        }
        Event.prototype.init = function (_a) {
            var _b = (_a === void 0 ? {} : _a).moveWhenInside, moveWhenInside = _b === void 0 ? false : _b;
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
            try {
                this.renderSystem.application.renderer.plugins.interaction.moveWhenInside = moveWhenInside;
            }
            catch (e) {
                console.error('Setting moveWhenInside error.', e);
            }
        };
        Event.prototype.componentChanged = function (changed) {
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
        Event.prototype.add = function (changed) {
            var container = this.containerManager.getContainer(changed.gameObject.id);
            container.interactive = true;
            container.interactiveChildren = true;
            var component = changed.component;
            if (component.hitArea) {
                this.addHitArea(changed, container, component.hitArea);
            }
            container.on('pointertap', function (e) {
                component.emit('tap', {
                    stopPropagation: function () { return e.stopPropagation(); },
                    data: {
                        pointerId: e.data.pointerId,
                        position: {
                            x: e.data.global.x,
                            y: e.data.global.y,
                        },
                    },
                    gameObject: component.gameObject,
                });
            });
            container.on('pointerdown', function (e) {
                component.emit('touchstart', {
                    stopPropagation: function () { return e.stopPropagation(); },
                    data: {
                        pointerId: e.data.pointerId,
                        position: {
                            x: e.data.global.x,
                            y: e.data.global.y,
                        },
                    },
                    gameObject: component.gameObject,
                });
            });
            container.on('pointermove', function (e) {
                component.emit('touchmove', {
                    stopPropagation: function () { return e.stopPropagation(); },
                    data: {
                        pointerId: e.data.pointerId,
                        position: {
                            x: e.data.global.x,
                            y: e.data.global.y,
                        },
                    },
                    gameObject: component.gameObject,
                });
            });
            container.on('pointerup', function (e) {
                component.emit('touchend', {
                    stopPropagation: function () { return e.stopPropagation(); },
                    data: {
                        pointerId: e.data.pointerId,
                        position: {
                            x: e.data.global.x,
                            y: e.data.global.y,
                        },
                    },
                    gameObject: component.gameObject,
                });
            });
            container.on('pointerupoutside', function (e) {
                component.emit('touchendoutside', {
                    stopPropagation: function () { return e.stopPropagation(); },
                    data: {
                        pointerId: e.data.pointerId,
                        position: {
                            x: e.data.global.x,
                            y: e.data.global.y,
                        },
                    },
                    gameObject: component.gameObject,
                });
            });
            container.on('pointercancel', function (e) {
                component.emit('touchcancel', {
                    stopPropagation: function () { return e.stopPropagation(); },
                    data: {
                        pointerId: e.data.pointerId,
                        position: {
                            x: e.data.global.x,
                            y: e.data.global.y,
                        },
                    },
                    gameObject: component.gameObject,
                });
            });
        };
        Event.prototype.remove = function (changed) {
            var container = this.containerManager.getContainer(changed.gameObject.id);
            container.interactive = false;
            container.off('tap');
            container.off('pointerdown');
            container.off('pointermove');
            container.off('pointerup');
            container.off('pointerupoutside');
            container.off('pointercancel');
            changed.component.removeAllListeners();
        };
        Event.prototype.change = function (changed) {
            var container = this.containerManager.getContainer(changed.gameObject.id);
            container.interactive = true;
            var component = changed.component;
            if (component.hitArea) {
                this.addHitArea(changed, container, component.hitArea);
            }
            else {
                component.hitArea = null;
            }
        };
        Event.prototype.addHitArea = function (changed, container, hitArea) {
            var e_1, _a, _b;
            var type = hitArea.type, style = hitArea.style;
            if (!hitAreaFunc[type]) {
                console.error(changed.gameObject.name + "'s hitArea type is not defined");
                return;
            }
            var params = [];
            try {
                for (var _c = __values(propertyForHitArea[type]), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var key = _d.value;
                    params.push(style[key]);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var hitAreaShape = new ((_b = hitAreaFunc[type]).bind.apply(_b, __spread([void 0], params)))();
            container.hitArea = hitAreaShape;
        };
        Event.systemName = 'Event';
        Event = __decorate([
            eva_js.decorators.componentObserver({
                Event: [{ prop: ['hitArea'], deep: true }],
            })
        ], Event);
        return Event;
    }(pluginRenderer.Renderer));

    exports.Event = Event$1;
    exports.EventSystem = Event;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
