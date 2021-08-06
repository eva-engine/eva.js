(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.render = {}), global.EVA, global.EVA.plugin.renderer));
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
            inspectorDecorator.type('boolean')
        ], Render.prototype, "visible", void 0);
        __decorate([
            inspectorDecorator.type('number'),
            inspectorDecorator.step(0.1)
        ], Render.prototype, "alpha", void 0);
        __decorate([
            inspectorDecorator.type('number'),
            inspectorDecorator.step(1)
        ], Render.prototype, "zIndex", void 0);
        __decorate([
            inspectorDecorator.type('boolean')
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
