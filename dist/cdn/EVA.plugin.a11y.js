(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.a11y = {}), global.EVA, global.EVA.plugin.renderer));
}(this, (function (exports, eva_js, pluginRenderer) { 'use strict';

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

    var global = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop() {}

    var on = noop;
    var addListener = noop;
    var once = noop;
    var off = noop;
    var removeListener = noop;
    var removeAllListeners = noop;
    var emit = noop;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var browser$1 = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var plugin_cjs_prod = createCommonjsModule(function (module, exports) {
    function t(t,r){return t.constructor.IDEProps||(t.constructor.IDEProps={}),t.constructor.IDEProps[r]||(t.constructor.IDEProps[r]={}),t.constructor.IDEProps[r]}Object.defineProperty(exports,"__esModule",{value:!0}),exports.step=function(r){return function(o,e){t(o,e).step=r;}},exports.type=function(r){return function(o,e){var n=t(o,e);n.key=e,n.type=r;}};
    });

    function getIDEPropsPropertyObj(target, propertyKey) {
        //@ts-ignore
        if (!target.constructor.IDEProps) {
            //@ts-ignore
            target.constructor.IDEProps = {};
        }
        if (!target.constructor.IDEProps[propertyKey]) {
            target.constructor.IDEProps[propertyKey] = {};
        }
        var propertyObj = target.constructor.IDEProps[propertyKey];
        return propertyObj;
    }

    function type(type) {
        return function (target, propertyKey) {
            var prop = getIDEPropsPropertyObj(target, propertyKey);
            //@ts-ignore
            prop.key = propertyKey;
            prop.type = type;
        };
    }

    function step(step) {
        return function (target, propertyKey) {
            var prop = getIDEPropsPropertyObj(target, propertyKey);
            //@ts-ignore
            prop.step = step;
        };
    }

    var step_1 = step;
    var type_1 = type;

    var plugin_cjs = /*#__PURE__*/Object.defineProperty({
    	step: step_1,
    	type: type_1
    }, '__esModule', {value: true});

    var inspectorDecorator = createCommonjsModule(function (module) {

    if (browser$1.env.NODE_ENV === 'production') {
      module.exports = plugin_cjs_prod;
    } else {
      module.exports = plugin_cjs;
    }
    });

    function uuid(len) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [];
        var radix = chars.length;
        for (var i = 0; i < len; i++)
            uuid[i] = chars[0 | (Math.random() * radix)];
        return uuid.join('');
    }
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

    var A11y = (function (_super) {
        __extends(A11y, _super);
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
            inspectorDecorator.type('boolean')
        ], A11y.prototype, "interactive", void 0);
        __decorate([
            inspectorDecorator.type('string')
        ], A11y.prototype, "hint", void 0);
        __decorate([
            inspectorDecorator.type('number'),
            inspectorDecorator.step(1)
        ], A11y.prototype, "delay", void 0);
        __decorate([
            inspectorDecorator.type('string')
        ], A11y.prototype, "role", void 0);
        __decorate([
            inspectorDecorator.type('string')
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
    var PointerEvents;
    (function (PointerEvents) {
        PointerEvents["NONE"] = "none";
        PointerEvents["AUTO"] = "auto";
    })(PointerEvents || (PointerEvents = {}));
    var MaskBackground;
    (function (MaskBackground) {
        MaskBackground["DEBUG"] = "rgba(255,0,0,0.5)";
        MaskBackground["NONE"] = "transparent";
    })(MaskBackground || (MaskBackground = {}));
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
    var A11ySystem = (function (_super) {
        __extends(A11ySystem, _super);
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
                                case exports.A11yActivate.CHECK: return [3, 1];
                                case exports.A11yActivate.DISABLE: return [3, 5];
                                case exports.A11yActivate.ENABLE: return [3, 6];
                            }
                            return [3, 7];
                        case 1:
                            _f.trys.push([1, 3, , 4]);
                            _e = this;
                            return [4, checkA11yOpen()];
                        case 2:
                            _e.activate = _f.sent();
                            return [3, 4];
                        case 3:
                            _f.sent();
                            this.activate = false;
                            return [3, 4];
                        case 4: return [3, 7];
                        case 5:
                            this.activate = false;
                            return [3, 7];
                        case 6:
                            this.activate = true;
                            return [3, 7];
                        case 7:
                            this.debug = opt.debug || false;
                            if (this.debug) {
                                this.activate = true;
                            }
                            if (!this.activate)
                                return [2];
                            div = document.createElement('div');
                            this.div = div;
                            if (this.game.canvas.parentNode) {
                                this.game.canvas.parentNode.appendChild(this.div);
                            }
                            return [2];
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
            var params = (this.game.getSystem(pluginRenderer.RendererSystem) || { width: 300, height: 300 }).params;
            var renderHeight = params.height, renderWidth = params.width;
            return { renderWidth: renderWidth, renderHeight: renderHeight };
        };
        A11ySystem.prototype.getCanvasBoundingClientRect = function () {
            var _a = this.game.canvas.getBoundingClientRect(), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
            return { width: width, height: height, left: left, top: top };
        };
        A11ySystem.prototype.initDiv = function () {
            var _this = this;
            var pageXOffset = window.pageXOffset, pageYOffset = window.pageYOffset;
            var _a = this.getCanvasBoundingClientRect(), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
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
            this.div.addEventListener('click', function (e) {
                var currentTarget = e.currentTarget;
                var _a = currentTarget.getBoundingClientRect(), left = _a.left, top = _a.top;
                var x = (e.pageX - left) / _this.ratioX;
                var y = (e.pageY - top) / _this.ratioY;
                _this.eventPosition = { x: x, y: y };
            }, true);
        };
        A11ySystem.prototype.update = function () {
            return __awaiter(this, void 0, void 0, function () {
                var changes, changes_1, changes_1_1, changed;
                var e_1, _a;
                return __generator(this, function (_b) {
                    changes = this.componentObserver.clear();
                    if (!this.activate) {
                        return [2];
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
                    return [2];
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
        A11ySystem.prototype.transformChange = function (changed) {
            var component = changed.component;
            var gameObject = changed.gameObject;
            var a11yComponent = gameObject.getComponent(A11y);
            if (!a11yComponent)
                return;
            var a11yId = a11yComponent.a11yId;
            if (!component.inScene) {
                var dom = this.div.querySelector("#" + a11yId);
                dom && this.div.removeChild(dom);
            }
            else {
                if (this.cache.has(a11yId)) {
                    var addDom = this.cache.get(a11yId);
                    addDom && this.div.appendChild(addDom);
                }
            }
        };
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
        A11ySystem.prototype.setA11yAttr = function (element, component) {
            var e_2, _a, e_3, _b, e_4, _c;
            var hint = component.hint, _d = component.props, props = _d === void 0 ? {} : _d, _e = component.state, state = _e === void 0 ? {} : _e, role = component.role, id = component.a11yId;
            var realRole = role || 'text';
            element.setAttribute('role', realRole);
            element.setAttribute('aria-label', hint);
            element.id = id;
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
        A11ySystem.prototype.setPosition = function (element, transform) {
            var _a = transform.size, width = _a.width, height = _a.height;
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
