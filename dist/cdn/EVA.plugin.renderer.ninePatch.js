(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.ninePatch = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter));
}(this, (function (exports, eva_js, pluginRenderer, rendererAdapter) { 'use strict';

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

<<<<<<< HEAD
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

    var NinePatch$1 = (function (_super) {
        __extends(NinePatch, _super);
        function NinePatch() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.resource = '';
            _this.spriteName = '';
            _this.leftWidth = 0;
            _this.topHeight = 0;
            _this.rightWidth = 0;
            _this.bottomHeight = 0;
            return _this;
=======
    class NinePatch$2 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.resource = '';
            this.spriteName = '';
            this.leftWidth = 0;
            this.topHeight = 0;
            this.rightWidth = 0;
            this.bottomHeight = 0;
>>>>>>> origin/dev
        }
        init(obj) {
            this.resource = obj.resource;
            this.spriteName = obj.spriteName;
            this.leftWidth = obj.leftWidth;
            this.topHeight = obj.topHeight;
            this.rightWidth = obj.rightWidth;
            this.bottomHeight = obj.bottomHeight;
<<<<<<< HEAD
        };
        NinePatch.componentName = 'NinePatch';
        __decorate([
            inspectorDecorator.type('string')
        ], NinePatch.prototype, "resource", void 0);
        __decorate([
            inspectorDecorator.type('string')
        ], NinePatch.prototype, "spriteName", void 0);
        __decorate([
            inspectorDecorator.type('number'),
            inspectorDecorator.step(1)
        ], NinePatch.prototype, "leftWidth", void 0);
        __decorate([
            inspectorDecorator.type('number'),
            inspectorDecorator.step(1)
        ], NinePatch.prototype, "topHeight", void 0);
        __decorate([
            inspectorDecorator.type('number'),
            inspectorDecorator.step(1)
        ], NinePatch.prototype, "rightWidth", void 0);
        __decorate([
            inspectorDecorator.type('number'),
            inspectorDecorator.step(1)
        ], NinePatch.prototype, "bottomHeight", void 0);
        return NinePatch;
    }(eva_js.Component));
=======
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
>>>>>>> origin/dev

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
                sprite.destroy(true);
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
