(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.a11y = {}), global.EVA, global.EVA.plugin.renderer));
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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

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

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    /**
     * 生成唯一的标识符
     * @param len 长度
     * @param radix 基
     */
    function uuid(len) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [];
        var radix = chars.length;
        for (var i = 0; i < len; i++)
            uuid[i] = chars[0 | (Math.random() * radix)];
        return uuid.join('');
    }
    /**
     * 设置 dom 样式
     * @param div 需要设置样式的dom元素
     * @param style 样式属性
     */
    var setStyle = function (element, style) {
        var width = style.width, height = style.height, position = style.position, _a = style.left, left = _a === void 0 ? 0 : _a, _b = style.top, top = _b === void 0 ? 0 : _b, zIndex = style.zIndex, pointerEvents = style.pointerEvents, background = style.background;
        element.style.width = width + "px";
        element.style.height = height + "px";
        element.style.position = position;
        element.style.left = "" + left;
        element.style.top = "" + top;
        element.style.zIndex = "" + zIndex;
        element.style.pointerEvents = pointerEvents;
        element.style.background = background;
        element.style.border = 'none';
        element.style.overflow = 'hidden';
    };
    var setTransform = function (element, transform, ratioX, ratioY) {
        var worldTransform = transform.worldTransform;
        var a = worldTransform.a, b = worldTransform.b, c = worldTransform.c, d = worldTransform.d, tx = worldTransform.tx, ty = worldTransform.ty;
        var matrix = "matrix(" + a + ", " + b + ", " + c + ", " + d + ", " + tx * ratioX + ", " + ty * ratioY + ")";
        element.style.transform = "" + matrix;
        element.style.webkitTransform = "" + matrix;
        element.style.transformOrigin = 'left top';
        element.style.webkitTransformOrigin = 'left top';
    };

    var A11y = /** @class */ (function (_super) {
        __extends(A11y, _super);
        /**
         * 无障碍组件构造函数
         * @param param interactive 默认为 false，如果游戏对象可交互，传入 true
         * @example
         * // 为游戏对象提供朗读能力
         * new A11y({hint: '这是一个div'})
         * // 游戏对象有事件，传入 event 对象
         * new A11y({hint: '点击事件对象', event: event})
         * // 无障碍属性
         * new A11y({hint:'按钮', role: 'button', state: {aria-hidden="true"}})
         * // 自定义属性
         * new A11y({hint: '自定义属性', attr: {key: '1'}})
         */
        function A11y(param) {
            var _this = _super.call(this) || this;
            Object.assign(_this, param);
            var _a = param.hint, hint = _a === void 0 ? '' : _a, event = param.event, _b = param.delay, delay = _b === void 0 ? 0 : _b, _c = param.attr, attr = _c === void 0 ? {} : _c, _d = param.role, role = _d === void 0 ? '' : _d, _e = param.props, props = _e === void 0 ? {} : _e, _f = param.state, state = _f === void 0 ? {} : _f;
            _this.hint = hint;
            _this.event = event;
            _this.delay = delay;
            _this.attr = attr;
            _this.role = role;
            _this.props = props;
            _this.state = state;
            _this.a11yId = "_" + uuid(6);
            return _this;
        }
        A11y.componentName = 'A11y';
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "interactive", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "hint", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "event", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "delay", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "role", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "props", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "state", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "attr", void 0);
        __decorate([
            eva_js.decorators.IDEProp
        ], A11y.prototype, "a11yId", void 0);
        return A11y;
    }(eva_js.Component));

    var POSITION = 'absolute';
    var ZINDEX = 3;
    exports.A11yActivate = void 0;
    (function (A11yActivate) {
        A11yActivate[A11yActivate["ENABLE"] = 0] = "ENABLE";
        A11yActivate[A11yActivate["DISABLE"] = 1] = "DISABLE";
        A11yActivate[A11yActivate["CHECK"] = 2] = "CHECK";
    })(exports.A11yActivate || (exports.A11yActivate = {}));
    /**
     * 无障碍 DOM 的指针事件
     */
    var PointerEvents;
    (function (PointerEvents) {
        PointerEvents["NONE"] = "none";
        PointerEvents["AUTO"] = "auto";
    })(PointerEvents || (PointerEvents = {}));
    /**
     * 无障碍 DOM 层的样式
     */
    var MaskBackground;
    (function (MaskBackground) {
        MaskBackground["DEBUG"] = "rgba(255,0,0,0.5)";
        MaskBackground["NONE"] = "transparent";
    })(MaskBackground || (MaskBackground = {}));
    /**
     * 无障碍 DOM 的类型
     */
    var ElementType;
    (function (ElementType) {
        ElementType["BUTTON"] = "button";
        ElementType["DIV"] = "div";
    })(ElementType || (ElementType = {}));

    var notAttr = [
        'hint',
        'event',
        'delay',
        'attr',
        'role',
        'props',
        'state',
        'a11yId',
        'name',
    ];
    var getEventFunc = function (event, gameObject, e) {
        var _this = this;
        ['touchstart', 'touchend', 'tap'].forEach(function (name) {
            event.emit(name, {
                stopPropagation: function () { return e.stopPropagation(); },
                data: {
                    position: _this.eventPosition,
                },
                gameObject: gameObject,
            });
        });
    };
    var A11ySystem = /** @class */ (function (_super) {
        __extends(A11ySystem, _super);
        /**
         *
         * @param opt
         */
        /**
         * 无障碍插件初始化函数
         * @param opt 无障碍插件选项
         * @param opt.activate 是否开启无障碍能力，默认为自动根据系统读屏能力进行开启 AUTO | ENABLE | DISABLE
         * @example
         * // 开启调试，无障碍区域会显示红色透明背景
         * new A11ySystem({debug: true})
         * // 禁用无障碍
         * new A11ySystem({activate: A11yActivate.DISABLE})
         */
        function A11ySystem(opt) {
            var _this = _super.call(this, opt) || this;
            _this.cache = new Map();
            _this.eventCache = new Map();
            return _this;
        }
        Object.defineProperty(A11ySystem.prototype, "ratioX", {
            get: function () {
                if (this._ratioX) {
                    return this._ratioX;
                }
                else {
                    var success = this.setRatio();
                    if (success) {
                        return this._ratioX;
                    }
                    else {
                        return 0;
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(A11ySystem.prototype, "ratioY", {
            get: function () {
                if (this._ratioY) {
                    return this._ratioY;
                }
                else {
                    var success = this.setRatio();
                    if (success) {
                        return this._ratioY;
                    }
                    else {
                        return 0;
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        A11ySystem.prototype.init = function (opt) {
            if (opt === void 0) { opt = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var _a, activate, _b, delay, _c, checkA11yOpen, _d, _e, div;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _a = opt.activate, activate = _a === void 0 ? exports.A11yActivate.CHECK : _a, _b = opt.delay, delay = _b === void 0 ? 100 : _b, _c = opt.checkA11yOpen, checkA11yOpen = _c === void 0 ? function () { return Promise.resolve(false); } : _c;
                            this.delay = delay;
                            _d = activate;
                            switch (_d) {
                                case exports.A11yActivate.CHECK: return [3 /*break*/, 1];
                                case exports.A11yActivate.DISABLE: return [3 /*break*/, 3];
                                case exports.A11yActivate.ENABLE: return [3 /*break*/, 4];
                            }
                            return [3 /*break*/, 5];
                        case 1:
                            _e = this;
                            return [4 /*yield*/, checkA11yOpen()];
                        case 2:
                            _e.activate = _f.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            this.activate = false;
                            return [3 /*break*/, 5];
                        case 4:
                            this.activate = true;
                            return [3 /*break*/, 5];
                        case 5:
                            this.debug = opt.debug || false;
                            if (this.debug) {
                                this.activate = true;
                            }
                            if (!this.activate)
                                return [2 /*return*/];
                            div = document.createElement('div');
                            this.div = div;
                            // 如果存在父容器，则渲染这个 div，子元素则会相对这个 div 进行定位，否则直接相对于 body 进行定位
                            if (this.game.canvas.parentNode) {
                                this.game.canvas.parentNode.appendChild(this.div);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        A11ySystem.prototype.setRatio = function () {
            var _a = this.getCanvasBoundingClientRect(), width = _a.width, height = _a.height;
            var _b = this.getRenderRect(), renderWidth = _b.renderWidth, renderHeight = _b.renderHeight;
            this._ratioX = width / renderWidth;
            this._ratioY = height / renderHeight;
            if (width || height) {
                this.initDiv();
                return true;
            }
            else {
                return false;
            }
        };
        A11ySystem.prototype.getRenderRect = function () {
            // @ts-ignore
            var params = (this.game.getSystem(pluginRenderer.RendererSystem) || { width: 300, height: 300 }).params;
            var renderHeight = params.height, renderWidth = params.width;
            return { renderWidth: renderWidth, renderHeight: renderHeight };
        };
        A11ySystem.prototype.getCanvasBoundingClientRect = function () {
            // 渲染画布相对于视口的实际宽高以及位置，实际的像素
            var _a = this.game.canvas.getBoundingClientRect(), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
            return { width: width, height: height, left: left, top: top };
        };
        A11ySystem.prototype.initDiv = function () {
            var _this = this;
            var pageXOffset = window.pageXOffset, pageYOffset = window.pageYOffset;
            var _a = this.getCanvasBoundingClientRect(), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
            // 父容器位置
            var style = {
                width: width,
                height: height,
                left: left + pageXOffset + "px",
                top: top + pageYOffset + "px",
                position: POSITION,
                zIndex: ZINDEX,
                pointerEvents: PointerEvents.NONE,
                background: MaskBackground.NONE,
            };
            setStyle(this.div, style);
            // 给父容器设置捕获事件，用于监听事件坐标
            this.div.addEventListener('click', function (e) {
                var currentTarget = e.currentTarget;
                var _a = currentTarget.getBoundingClientRect(), left = _a.left, top = _a.top;
                var x = (e.pageX - left) / _this.ratioX;
                var y = (e.pageY - top) / _this.ratioY;
                _this.eventPosition = { x: x, y: y };
            }, true);
        };
        /**
         * 监听插件更新
         */
        A11ySystem.prototype.update = function () {
            return __awaiter(this, void 0, void 0, function () {
                var changes, changes_1, changes_1_1, changed;
                var e_1, _a;
                return __generator(this, function (_b) {
                    changes = this.componentObserver.clear();
                    if (!this.activate) {
                        return [2 /*return*/];
                    }
                    try {
                        for (changes_1 = __values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                            changed = changes_1_1.value;
                            switch (changed.type) {
                                case eva_js.OBSERVER_TYPE.ADD:
                                    changed.componentName === 'Event' &&
                                        this.addEvent(changed.gameObject);
                                    changed.componentName === 'A11y' && this.add(changed);
                                    break;
                                case eva_js.OBSERVER_TYPE.CHANGE:
                                    changed.componentName === 'Transform' &&
                                        this.transformChange(changed);
                                    break;
                                case eva_js.OBSERVER_TYPE.REMOVE:
                                    changed.componentName === 'Event' && this.removeEvent(changed);
                                    changed.componentName === 'A11y' && this.remove(changed);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return [2 /*return*/];
                });
            });
        };
        A11ySystem.prototype.remove = function (changed) {
            var component = changed.component;
            if (!component)
                return;
            var a11yId = component.a11yId;
            var element = this.div.querySelector("#" + a11yId);
            element && this.div.removeChild(element);
            this.cache.delete(a11yId);
        };
        /**
         * 监听组件被添加至游戏对象
         * @param changed 改变的组件
         */
        A11ySystem.prototype.add = function (changed) {
            var _this = this;
            if (!this.activate)
                return;
            var component = changed.component;
            var gameObject = changed.gameObject;
            var delay = component.delay, id = component.a11yId;
            var event = component.event;
            if (!gameObject)
                return;
            var transform = gameObject.transform;
            if (!transform)
                return;
            var element = document.createElement('div');
            this.cache.set(id, element);
            if (!event) {
                event = gameObject.getComponent('Event');
            }
            setTimeout(function () {
                _this.setPosition(element, transform);
                _this.setA11yAttr(element, component);
                if (event) {
                    _this.addEvent(gameObject);
                }
                if (gameObject.scene) {
                    _this.div.appendChild(element);
                }
            }, delay || this.delay);
        };
        // 监听 scene 改变
        A11ySystem.prototype.transformChange = function (changed) {
            var component = changed.component;
            var gameObject = changed.gameObject;
            var a11yComponent = gameObject.getComponent(A11y);
            if (!a11yComponent)
                return;
            var a11yId = a11yComponent.a11yId;
            if (!component.inScene) {
                // 监听 scene 删除游戏对象
                var dom = this.div.querySelector("#" + a11yId);
                dom && this.div.removeChild(dom);
                // this.cache.delete(a11yId)
            }
            else {
                // 监听 scene add
                // this.div.appendChild(this.cache)
                if (this.cache.has(a11yId)) {
                    var addDom = this.cache.get(a11yId);
                    addDom && this.div.appendChild(addDom);
                }
            }
        };
        /**
         * 为无障碍组件设置监听事件
         * @param element DOM 元素
         * @param event 事件组件对象
         * @param gameObject 游戏对象
         */
        A11ySystem.prototype.setEvent = function (element, event, gameObject, id) {
            if (!event) {
                return;
            }
            var func = getEventFunc.bind(this, event, gameObject);
            this.eventCache.set(id, func);
            element.addEventListener('click', func);
        };
        A11ySystem.prototype.addEvent = function (gameObject) {
            var a11y = gameObject.getComponent(A11y);
            if (!a11y)
                return;
            var event = gameObject.getComponent('Event');
            if (!event)
                return;
            var element = this.cache.get(a11y.a11yId);
            element && this.setEvent(element, event, gameObject, a11y.a11yId);
        };
        A11ySystem.prototype.removeEvent = function (changed) {
            var gameObject = changed.gameObject;
            var a11y = gameObject.getComponent(A11y);
            if (!a11y)
                return;
            var event = changed.component;
            if (!event)
                return;
            var a11yId = a11y.a11yId;
            var func = this.eventCache.get(a11yId);
            var element = this.cache.get(a11yId);
            element && element.removeEventListener('click', func);
        };
        /**
         * 设置无障碍属性标签
         * @param element DOM 元素
         * @param hint 无障碍朗读文字
         * @param interactive 是否可交互
         */
        A11ySystem.prototype.setA11yAttr = function (element, component) {
            var e_2, _a, e_3, _b, e_4, _c;
            var hint = component.hint, _d = component.props, props = _d === void 0 ? {} : _d, _e = component.state, state = _e === void 0 ? {} : _e, role = component.role, id = component.a11yId;
            var realRole = role || 'text';
            element.setAttribute('role', realRole);
            element.setAttribute('aria-label', hint);
            element.id = id;
            // 这里兼容
            var ariaProps = Object.keys(props);
            try {
                for (var ariaProps_1 = __values(ariaProps), ariaProps_1_1 = ariaProps_1.next(); !ariaProps_1_1.done; ariaProps_1_1 = ariaProps_1.next()) {
                    var key = ariaProps_1_1.value;
                    element.setAttribute(key, props[key]);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (ariaProps_1_1 && !ariaProps_1_1.done && (_a = ariaProps_1.return)) _a.call(ariaProps_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var ariaState = Object.keys(state);
            try {
                for (var ariaState_1 = __values(ariaState), ariaState_1_1 = ariaState_1.next(); !ariaState_1_1.done; ariaState_1_1 = ariaState_1.next()) {
                    var key = ariaState_1_1.value;
                    element.setAttribute(key, state[key]);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (ariaState_1_1 && !ariaState_1_1.done && (_b = ariaState_1.return)) _b.call(ariaState_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            try {
                for (var _f = __values(Object.keys(component)), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var key = _g.value;
                    if (typeof component[key] === 'string' &&
                        notAttr.indexOf(key) === -1 &&
                        key.indexOf('_') !== 1) {
                        element.setAttribute(key, component[key]);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        /**
         * 将无障碍元素设置到对应的位置
         * @param element DOM 元素
         * @param transform 位置属性
         */
        A11ySystem.prototype.setPosition = function (element, transform) {
            // 相对画布定位
            // const { x: anchorX, y: anchorY } = transform.anchor
            // 游戏对象的宽高
            var _a = transform.size, width = _a.width, height = _a.height;
            // position
            // const { x: positionX, y: positionY } = transform.position
            // 设置无障碍 DOM 的样式，龙骨动画默认 2px
            var style = {
                width: width === 0 ? 1 : width * this.ratioX,
                height: height === 0 ? 1 : height * this.ratioY,
                position: POSITION,
                zIndex: ZINDEX,
                pointerEvents: PointerEvents.AUTO,
                background: this.debug ? MaskBackground.DEBUG : MaskBackground.NONE,
            };
            var transformProps = __assign({}, transform);
            setStyle(element, style);
            // 调整 DOM 的位置
            setTransform(element, transformProps, this.ratioX, this.ratioY);
        };
        A11ySystem.prototype.onDestroy = function () {
            this.div.parentElement.removeChild(this.div);
            this.cache = null;
            this.eventCache = null;
        };
        A11ySystem.systemName = 'A11ySystem';
        A11ySystem = __decorate([
            eva_js.decorators.componentObserver({
                A11y: [],
                Transform: ['inScene'],
                Event: [],
            })
        ], A11ySystem);
        return A11ySystem;
    }(eva_js.System));

    exports.A11y = A11y;
    exports.A11ySystem = A11ySystem;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
