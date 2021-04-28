(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.lottie = {}), global.EVA, global.EVA.plugin.renderer, global.PIXI));
}(this, (function (exports, eva_js, pluginRenderer, pixi_js) { 'use strict';

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

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

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

    /**
     * get the type by Object.prototype.toString
     * @ignore
     * @param {*} val
     * @return {String} type string value
     */
    function _rt(val) {
      return Object.prototype.toString.call(val);
    }

    /**
     * some useful toolkit
     * @namespace
     */
    const Tools = {
      /**
       * simple copy a json data
       * @method
       * @param {JSON} json source data
       * @return {JSON} object
       */
      copyJSON: function (json) {
        return JSON.parse(JSON.stringify(json));
      },

      /**
       * detect the variable is array type
       * @method
       * @param {Array} variable input variable
       * @return {Boolean} result
       */
      isArray: (function () {
        let ks = _rt([]);
        return function (variable) {
          return _rt(variable) === ks;
        };
      })(),

      /**
       * detect the variable is string type
       * @method
       * @param {String} variable input variable
       * @return {Boolean} result
       */
      isString: (function () {
        let ks = _rt('s');
        return function (variable) {
          return _rt(variable) === ks;
        };
      })(),

      /**
       * detect the variable is number type
       * @method
       * @param {Number} variable input variable
       * @return {Boolean} result
       */
      isNumber: (function () {
        let ks = _rt(1);
        return function (variable) {
          return _rt(variable) === ks;
        };
      })(),

      /**
       * 判断变量是否为函数类型
       * @method
       * @param {Function} variable 待判断的变量
       * @return {Boolean} 判断的结果
       */
      isFunction: (function () {
        let ks = _rt(function () {});
        return function (variable) {
          return _rt(variable) === ks;
        };
      })(),

      /**
       * 判断变量是否为undefined
       * @method
       * @param {Function} variable 待判断的变量
       * @return {Boolean} 判断的结果
       */
      isUndefined: function (variable) {
        return typeof variable === 'undefined';
      },

      /**
       * detect the variable is boolean type
       * @method
       * @param {Boolean} variable input variable
       * @return {Boolean} result
       */
      isBoolean: (function () {
        let ks = _rt(true);
        return function (variable) {
          return _rt(variable) === ks;
        };
      })(),

      /**
       * detect the variable is object type
       * @method
       * @param {Object} variable input variable
       * @return {Boolean} result
       */
      isObject: (function () {
        let ks = _rt({});
        return function (variable) {
          return _rt(variable) === ks;
        };
      })(),

      /**
       * enhance random, random number in range or random one of array
       * @method
       * @param {Array | Number} min random number in range or random one of array
       * @param {Number} max range max edge
       * @return {ArrayItem | Number} number or one item of array
       */
      random: function (min, max) {
        if (this.isArray(min)) return min[~~(Math.random() * min.length)];
        if (!this.isNumber(max)) (max = min || 1), (min = 0);
        return min + Math.random() * (max - min);
      },

      /**
       * euclidean modulo
       * @method
       * @param {Number} n input value
       * @param {Number} m modulo
       * @return {Number} re-map to modulo area
       */
      euclideanModulo: function (n, m) {
        return ((n % m) + m) % m;
      },

      /**
       * bounce value when value spill codomain
       * @method
       * @param {Number} n input value
       * @param {Number} min lower boundary
       * @param {Number} max upper boundary
       * @return {Number} bounce back to boundary area
       */
      codomainBounce: function (n, min, max) {
        if (n < min) return 2 * min - n;
        if (n > max) return 2 * max - n;
        return n;
      },

      /**
       * clamp a value in range
       * @method
       * @param {Number} x input value
       * @param {Number} a lower boundary
       * @param {Number} b upper boundary
       * @return {Number} clamp in range
       */
      clamp: function (x, a, b) {
        return x < a ? a : x > b ? b : x;
      },

      /**
       * detect number was in [min, max]
       * @method
       * @param {number} v   value
       * @param {number} min lower
       * @param {number} max upper
       * @return {boolean} in [min, max] range ?
       */
      inRange(v, min, max) {
        return v >= min && v <= max;
      },

      /**
       * get assets from keyframes assets
       * @method
       * @param {string} id assets refid
       * @param {object} assets assets object
       * @return {object} asset object
       */
      getAssets(id, assets) {
        for (let i = 0; i < assets.length; i++) {
          if (id === assets[i].id) return assets[i];
        }
        console.error('have not assets name as', id);
        return {};
      },

      /**
       * get hex number from rgb array
       * @param {array} rgb rgb array
       * @return {number}
       */
      rgb2hex(rgb) {
        return (rgb[0] << 16) + (rgb[1] << 8) + (rgb[2] | 0);
      },
    };

    /**
     * Eventer, you can new it and bind custom event and emit it
     */
    class Eventer {
      /**
       * Eventer constructor
       */
      constructor() {
        /**
         * 事件监听列表
         *
         * @member {object}
         * @private
         */
        this.listeners = {};

        /**
         * rename from on method
         * @member {function}
         */
        this.addEventListener = this.on;

        /**
         * rename from off method
         * @member {function}
         */
        this.removeEventListener = this.off;
      }

      /**
       * 事件对象的事件绑定函数
       *
       * @param {String} type 事件类型
       * @param {Function} fn 回调函数
       * @return {this}
       */
      on(type, fn) {
        if (!Tools.isFunction(fn)) return this;
        if (Tools.isUndefined(this.listeners[type])) this.listeners[type] = [];
        this.listeners[type].push(fn);
        return this;
      }

      /**
       * 事件对象的事件解绑函数
       *
       * @param {String} type 事件类型
       * @param {Function} fn 注册时回调函数的引用
       * @return {this}
       */
      off(type, fn) {
        if (Tools.isUndefined(this.listeners[type])) return this;
        const cbs = this.listeners[type];
        let i = cbs.length;
        if (i > 0) {
          if (fn) {
            while (i--) {
              if (cbs[i] === fn) {
                cbs.splice(i, 1);
              }
            }
          } else {
            cbs.length = 0;
          }
        }
        return this;
      }

      /**
       * 事件对象的一次性事件绑定函数
       *
       * @param {String} type 事件类型
       * @param {Function} fn 回调函数
       * @return {this}
       */
      once(type, fn) {
        if (!Tools.isFunction(fn)) return this;
        const cb = ev => {
          fn(ev);
          this.off(type, cb);
        };
        this.on(type, cb);
        return this;
      }

      /**
       * 事件对象的触发事件函数
       *
       * @param {String} type 事件类型
       * @param {Object} ev 事件数据
       * @return {this}
       */
      emit(type, ...reset) {
        if (Tools.isUndefined(this.listeners[type])) return this;
        const cbs = this.listeners[type] || [];
        const cache = cbs.slice(0);
        for (let i = 0; i < cache.length; i++) {
          cache[i].apply(this, reset);
        }
        return this;
      }
    }

    /**
     * @namespace LoaderRegister
     */

    const loaders = {};

    /**
     * enum display element type for lottie layer
     * @enum {string}
     * @alias LoaderRegister.Type
     * @memberof LoaderRegister
     */
    const Type = {
      Ajax: 'Ajax',
      Texture: 'Texture',
    };

    /**
     * register an image loader
     * @param {LoaderRegister.Type} type one of Type
     * @param {Function} _Loader loader function
     * @alias registerLoaderByType
     * @memberof LoaderRegister
     */
    function registerLoaderByType(type, _Loader) {
      loaders[type] = _Loader;
    }

    /**
     * load some textures
     * @param {Array} assets assets images
     * @param {Object} options loader options
     * @param {String} [options.prefix] path prefix
     * @param {Boolean} [options.autoLoad=true] auto load
     * @return {LoadTexture} loadTexture
     * @alias loadTexture
     * @memberof LoaderRegister
     */
    function loadTexture$1(assets, options) {
      const loaderFunction = loaders[Type.Texture];
      if (!loaderFunction) {
        console.warn('must register an image loader, before you parse an animation some has image assets');
      }
      return loaderFunction(assets, options);
    }

    /**
     * load some json
     * @param {String} path json url path
     * @return {LoadJson} loadJson
     * @alias loadJson
     * @memberof LoaderRegister
     */
    function loadJson$1(path) {
      const loaderFunction = loaders[Type.Ajax];
      if (!loaderFunction) {
        console.warn('must register an ajax loader, before you parse an animation from path');
      }
      return loaderFunction(path);
    }

    var LoaderRegister = {Type, registerLoaderByType};

    /**
     * complete layers
     * @private
     * @param {*} layers
     * @param {*} comps
     * @param {*} fontManager
     */
    function completeLayers(layers, comps, fontManager) {
      let layerData;
      // let animArray; let lastFrame;
      let i;
      let len = layers.length;
      let j;
      let jLen;
      let k;
      let kLen;
      for (i = 0; i < len; i += 1) {
        layerData = layers[i];
        if (!('ks' in layerData) || layerData.completed) {
          continue;
        }
        layerData.completed = true;
        if (layerData.tt) {
          layers[i - 1].td = layerData.tt;
        }
        // animArray = [];
        // lastFrame = -1;
        if (layerData.hasMask) {
          let maskProps = layerData.masksProperties;
          jLen = maskProps.length;
          for (j = 0; j < jLen; j += 1) {
            if (maskProps[j].pt.k.i) {
              convertPathsToAbsoluteValues(maskProps[j].pt.k);
            } else {
              kLen = maskProps[j].pt.k.length;
              for (k = 0; k < kLen; k += 1) {
                if (maskProps[j].pt.k[k].s) {
                  convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
                }
                if (maskProps[j].pt.k[k].e) {
                  convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
                }
              }
            }
          }
        }
        if (layerData.ty === 0) {
          layerData.layers = findCompLayers(layerData.refId, comps);
          completeLayers(layerData.layers, comps);
        } else if (layerData.ty === 4) {
          completeShapes(layerData.shapes);
        } else if (layerData.ty == 5) {
          completeText(layerData);
        }
      }
    }

    /**
     * findComp Layers
     * @private
     * @param {*} id layer id
     * @param {*} comps comps
     * @return {Array}
     */
    function findCompLayers(id, comps) {
      let i = 0;
      let len = comps.length;
      while (i < len) {
        if (comps[i].id === id) {
          if (!comps[i].layers.__used) {
            comps[i].layers.__used = true;
            return comps[i].layers;
          }
          return JSON.parse(JSON.stringify(comps[i].layers));
        }
        i += 1;
      }
    }

    /**
     * completeShapes
     * @private
     * @param {*} arr shapes
     */
    function completeShapes(arr) {
      let i;
      let len = arr.length;
      let j;
      let jLen;
      // let hasPaths = false;
      for (i = len - 1; i >= 0; i -= 1) {
        if (arr[i].ty == 'sh') {
          if (arr[i].ks.k.i) {
            convertPathsToAbsoluteValues(arr[i].ks.k);
          } else {
            jLen = arr[i].ks.k.length;
            for (j = 0; j < jLen; j += 1) {
              if (arr[i].ks.k[j].s) {
                convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
              }
              if (arr[i].ks.k[j].e) {
                convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
              }
            }
          }
          // hasPaths = true;
        } else if (arr[i].ty == 'gr') {
          completeShapes(arr[i].it);
        }
      }
      /* if(hasPaths){
                  //mx: distance
                  //ss: sensitivity
                  //dc: decay
                  arr.splice(arr.length-1,0,{
                      "ty": "ms",
                      "mx":20,
                      "ss":10,
                       "dc":0.001,
                      "maxDist":200
                  });
              }*/
    }

    /**
     * convert relative position to absolute
     * @private
     * @param {path} path path data
     */
    function convertPathsToAbsoluteValues(path) {
      let i;
      let len = path.i.length;
      for (i = 0; i < len; i += 1) {
        path.i[i][0] += path.v[i][0];
        path.i[i][1] += path.v[i][1];
        path.o[i][0] += path.v[i][0];
        path.o[i][1] += path.v[i][1];
      }
    }

    /**
     * checkVersion
     * @private
     * @param {*} minimum minimum version
     * @param {*} animVersionString animate data version
     * @return {Boolean}
     */
    function checkVersion(minimum, animVersionString) {
      let animVersion = animVersionString ? animVersionString.split('.') : [100, 100, 100];
      if (minimum[0] > animVersion[0]) {
        return true;
      } else if (animVersion[0] > minimum[0]) {
        return false;
      }
      if (minimum[1] > animVersion[1]) {
        return true;
      } else if (animVersion[1] > minimum[1]) {
        return false;
      }
      if (minimum[2] > animVersion[2]) {
        return true;
      } else if (animVersion[2] > minimum[2]) {
        return false;
      }
    }

    let checkText = (function () {
      let minimumVersion = [4, 4, 14];

      /**
       * updateTextLayer
       * @param {*} textLayer textLayer
       */
      function updateTextLayer(textLayer) {
        let documentData = textLayer.t.d;
        textLayer.t.d = {
          k: [
            {
              s: documentData,
              t: 0,
            },
          ],
        };
      }

      /**
       * iterateLayers
       * @param {*} layers layers
       */
      function iterateLayers(layers) {
        let i;
        let len = layers.length;
        for (i = 0; i < len; i += 1) {
          if (layers[i].ty === 5) {
            updateTextLayer(layers[i]);
          }
        }
      }

      return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
          iterateLayers(animationData.layers);
          if (animationData.assets) {
            let i;
            let len = animationData.assets.length;
            for (i = 0; i < len; i += 1) {
              if (animationData.assets[i].layers) {
                iterateLayers(animationData.assets[i].layers);
              }
            }
          }
        }
      };
    })();

    let checkChars = (function () {
      let minimumVersion = [4, 7, 99];
      return function (animationData) {
        if (animationData.chars && !checkVersion(minimumVersion, animationData.v)) {
          let i;
          let len = animationData.chars.length;
          let j;
          let jLen; // let k; let kLen;
          let pathData;
          let paths;
          for (i = 0; i < len; i += 1) {
            if (animationData.chars[i].data && animationData.chars[i].data.shapes) {
              paths = animationData.chars[i].data.shapes[0].it;
              jLen = paths.length;

              for (j = 0; j < jLen; j += 1) {
                pathData = paths[j].ks.k;
                if (!pathData.__converted) {
                  convertPathsToAbsoluteValues(paths[j].ks.k);
                  pathData.__converted = true;
                }
              }
            }
          }
        }
      };
    })();

    let checkColors = (function () {
      let minimumVersion = [4, 1, 9];

      /**
       * iterateShapes
       * @param {*} shapes shapes
       */
      function iterateShapes(shapes) {
        let i;
        let len = shapes.length;
        let j;
        let jLen;
        for (i = 0; i < len; i += 1) {
          if (shapes[i].ty === 'gr') {
            iterateShapes(shapes[i].it);
          } else if (shapes[i].ty === 'fl' || shapes[i].ty === 'st') {
            if (shapes[i].c.k && shapes[i].c.k[0].i) {
              jLen = shapes[i].c.k.length;
              for (j = 0; j < jLen; j += 1) {
                if (shapes[i].c.k[j].s) {
                  shapes[i].c.k[j].s[0] /= 255;
                  shapes[i].c.k[j].s[1] /= 255;
                  shapes[i].c.k[j].s[2] /= 255;
                  shapes[i].c.k[j].s[3] /= 255;
                }
                if (shapes[i].c.k[j].e) {
                  shapes[i].c.k[j].e[0] /= 255;
                  shapes[i].c.k[j].e[1] /= 255;
                  shapes[i].c.k[j].e[2] /= 255;
                  shapes[i].c.k[j].e[3] /= 255;
                }
              }
            } else {
              shapes[i].c.k[0] /= 255;
              shapes[i].c.k[1] /= 255;
              shapes[i].c.k[2] /= 255;
              shapes[i].c.k[3] /= 255;
            }
          }
        }
      }

      /**
       * iterateLayers
       * @param {*} layers layers
       */
      function iterateLayers(layers) {
        let i;
        let len = layers.length;
        for (i = 0; i < len; i += 1) {
          if (layers[i].ty === 4) {
            iterateShapes(layers[i].shapes);
          }
        }
      }

      return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
          iterateLayers(animationData.layers);
          if (animationData.assets) {
            let i;
            let len = animationData.assets.length;
            for (i = 0; i < len; i += 1) {
              if (animationData.assets[i].layers) {
                iterateLayers(animationData.assets[i].layers);
              }
            }
          }
        }
      };
    })();

    let checkShapes = (function () {
      let minimumVersion = [4, 4, 18];

      /**
       * completeShapes
       * @param {*} arr arr
       */
      function completeShapes(arr) {
        let i;
        let len = arr.length;
        let j;
        let jLen;
        // let hasPaths = false;
        for (i = len - 1; i >= 0; i -= 1) {
          if (arr[i].ty == 'sh') {
            if (arr[i].ks.k.i) {
              arr[i].ks.k.c = arr[i].closed;
            } else {
              jLen = arr[i].ks.k.length;
              for (j = 0; j < jLen; j += 1) {
                if (arr[i].ks.k[j].s) {
                  arr[i].ks.k[j].s[0].c = arr[i].closed;
                }
                if (arr[i].ks.k[j].e) {
                  arr[i].ks.k[j].e[0].c = arr[i].closed;
                }
              }
            }
            // hasPaths = true;
          } else if (arr[i].ty == 'gr') {
            completeShapes(arr[i].it);
          }
        }
      }

      /**
       * iterateLayers
       * @param {*} layers layers
       */
      function iterateLayers(layers) {
        let layerData;
        let i;
        let len = layers.length;
        let j;
        let jLen;
        let k;
        let kLen;
        for (i = 0; i < len; i += 1) {
          layerData = layers[i];
          if (layerData.hasMask) {
            let maskProps = layerData.masksProperties;
            jLen = maskProps.length;
            for (j = 0; j < jLen; j += 1) {
              if (maskProps[j].pt.k.i) {
                maskProps[j].pt.k.c = maskProps[j].cl;
              } else {
                kLen = maskProps[j].pt.k.length;
                for (k = 0; k < kLen; k += 1) {
                  if (maskProps[j].pt.k[k].s) {
                    maskProps[j].pt.k[k].s[0].c = maskProps[j].cl;
                  }
                  if (maskProps[j].pt.k[k].e) {
                    maskProps[j].pt.k[k].e[0].c = maskProps[j].cl;
                  }
                }
              }
            }
          }
          if (layerData.ty === 4) {
            completeShapes(layerData.shapes);
          }
        }
      }

      return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
          iterateLayers(animationData.layers);
          if (animationData.assets) {
            let i;
            let len = animationData.assets.length;
            for (i = 0; i < len; i += 1) {
              if (animationData.assets[i].layers) {
                iterateLayers(animationData.assets[i].layers);
              }
            }
          }
        }
      };
    })();

    /**
     * completeData
     * @private
     * @param {*} animationData animationData
     * @param {*} fontManager fontManager
     */
    function completeData(animationData, fontManager) {
      if (animationData.__complete) {
        return;
      }
      checkColors(animationData);
      checkText(animationData);
      checkChars(animationData);
      checkShapes(animationData);
      completeLayers(animationData.layers, animationData.assets);
      animationData.__complete = true;
      // blitAnimation(animationData, animationData.assets, fontManager);
    }

    /**
     * completeText
     * @private
     * @param {*} data data
     * @param {*} fontManager fontManager
     */
    function completeText(data, fontManager) {
      if (data.t.a.length === 0 && !('m' in data.t.p)) {
        data.singleShape = true;
      }
    }

    var DataManager = {
      completeData,
      checkColors,
      checkChars,
      checkShapes,
      completeLayers,
    };

    /**
     * https://github.com/gre/bezier-easing
     * BezierEasing - use bezier curve for transition easing function
     * by Gaëtan Renaudeau 2014 - 2015 – MIT License
     * @private
     */

    const NEWTON_ITERATIONS = 4;
    const NEWTON_MIN_SLOPE = 0.001;
    const SUBDIVISION_PRECISION = 0.0000001;
    const SUBDIVISION_MAX_ITERATIONS = 10;

    let kSplineTableSize = 11;
    let kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    let float32ArraySupported = typeof Float32Array === 'function';

    /* eslint new-cap: 0 */

    /**
     * 公因式A
     *
     * @private
     * @param {number} aA1 控制分量
     * @param {number} aA2 控制分量
     * @return {number} 整个公式中的A公因式的值
     */
    function A(aA1, aA2) {
      return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }

    /**
     * 公因式B
     *
     * @private
     * @param {number} aA1 控制分量1
     * @param {number} aA2 控制分量2
     * @return {number} 整个公式中的B公因式的值
     */
    function B(aA1, aA2) {
      return 3.0 * aA2 - 6.0 * aA1;
    }

    /**
     * 公因式C
     *
     * @private
     * @param {number} aA1 控制分量1
     * @param {number} aA2 控制分量2
     * @return {number} 整个公式中的C公因式的值
     */
    function C(aA1) {
      return 3.0 * aA1;
    }

    /**
     * 获取aT处的值
     *
     * @private
     * @param {number} aT 三次贝塞尔曲线的t自变量
     * @param {number} aA1 控制分量1
     * @param {number} aA2 控制分量2
     * @return {number} 三次贝塞尔公式的因变量
     */
    function calcBezier(aT, aA1, aA2) {
      return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }

    /**
     * 获取aT处的斜率
     * @private
     * @param {number} aT 三次贝塞尔曲线的t自变量
     * @param {number} aA1 控制分量1
     * @param {number} aA2 控制分量2
     * @return {number} 三次贝塞尔公式的导数
     */
    function getSlope(aT, aA1, aA2) {
      return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }

    /**
     * 二分法查找
     * @private
     * @param {number} aX
     * @param {number} aA
     * @param {number} aB
     * @param {number} mX1
     * @param {number} mX2
     * @return {number} 二分法猜测t的值
     */
    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      let currentX;
      let currentT;
      let i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
      return currentT;
    }

    /**
     * 牛顿迭代算法，进一步的获取精确的T值
     * @private
     * @param {number} aX
     * @param {number} aGuessT
     * @param {number} mX1
     * @param {number} mX2
     * @return {number} 获取更精确的T值
     */
    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
        let currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) {
          return aGuessT;
        }
        let currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }

    /**
     * cubic-bezier曲线的两个控制点，默认起始点为 0，结束点为 1
     *
     * @class
     * @private
     * @param {number} mX1 控制点1的x分量
     * @param {number} mY1 控制点1的y分量
     * @param {number} mX2 控制点2的x分量
     * @param {number} mY2 控制点2的y分量
     */
    function BezierEasing(mX1, mY1, mX2, mY2) {
      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
        throw new Error('bezier x values must be in [0, 1] range');
      }
      this.mX1 = mX1;
      this.mY1 = mY1;
      this.mX2 = mX2;
      this.mY2 = mY2;
      this.sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

      this._preCompute();

      this.get = this.get.bind(this);
    }

    BezierEasing.prototype._preCompute = function () {
      // Precompute samples table
      if (this.mX1 !== this.mY1 || this.mX2 !== this.mY2) {
        for (let i = 0; i < kSplineTableSize; ++i) {
          this.sampleValues[i] = calcBezier(i * kSampleStepSize, this.mX1, this.mX2);
        }
      }
    };

    BezierEasing.prototype._getTForX = function (aX) {
      let intervalStart = 0.0;
      let currentSample = 1;
      let lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && this.sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }
      --currentSample;

      // Interpolate to provide an initial guess for t
      let dist = (aX - this.sampleValues[currentSample]) / (this.sampleValues[currentSample + 1] - this.sampleValues[currentSample]);
      let guessForT = intervalStart + dist * kSampleStepSize;

      let initialSlope = getSlope(guessForT, this.mX1, this.mX2);
      if (initialSlope >= NEWTON_MIN_SLOPE) {
        return newtonRaphsonIterate(aX, guessForT, this.mX1, this.mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, this.mX1, this.mX2);
      }
    };

    /**
     * 通过x轴近似获取y的值
     *
     * @param {number} x x轴的偏移量
     * @return {number} y 与输入值x对应的y值
     */
    BezierEasing.prototype.get = function (x) {
      if (this.mX1 === this.mY1 && this.mX2 === this.mY2) return x;
      if (x === 0) {
        return 0;
      }
      if (x === 1) {
        return 1;
      }
      return calcBezier(this._getTForX(x), this.mY1, this.mY2);
    };

    const beziers = {};

    /**
     * get a bezierEasing from real time or cache
     * @private
     * @param {*} a in control point x component
     * @param {*} b in control point y component
     * @param {*} c out control point x component
     * @param {*} d out control point y component
     * @param {*} [nm] curver name
     * @return {BezierEasing}
     */
    function getBezierEasing(a, b, c, d, nm) {
      const str = nm || ('bez_' + a + '_' + b + '_' + c + '_' + d).replace(/\./g, 'p');
      if (beziers[str]) {
        return beziers[str];
      }
      const bezEasing = new BezierEasing(a, b, c, d);
      beziers[str] = bezEasing;
      return bezEasing;
    }

    var BezierFactory = {getBezierEasing};

    /**
     * a
     * @private
     * @param {*} type a
     * @param {*} len a
     * @return {*}
     */
    function createRegularArray(type, len) {
      let i = 0;
      const arr = [];
      let value;
      switch (type) {
        case 'int16':
        case 'uint8c':
          value = 1;
          break;
        default:
          value = 1.1;
          break;
      }
      for (i = 0; i < len; i += 1) {
        arr.push(value);
      }
      return arr;
    }

    /**
     * a
     * @private
     * @param {*} type a
     * @param {*} len a
     * @return {*}
     */
    function _createTypedArray(type, len) {
      if (type === 'float32') {
        return new Float32Array(len);
      } else if (type === 'int16') {
        return new Int16Array(len);
      } else if (type === 'uint8c') {
        return new Uint8ClampedArray(len);
      }
    }

    let createTypedArray;
    //  = createTypedArray
    if (typeof Uint8ClampedArray === 'function' && typeof Float32Array === 'function') {
      createTypedArray = _createTypedArray;
    } else {
      createTypedArray = createRegularArray;
    }

    /**
     * a
     * @private
     * @param {*} len a
     * @return {*}
     */
    function createSizedArray(len) {
      return new Array(len);
    }

    /**
     * a
     * @private
     * @param {*} arr a
     * @return {*}
     */
    function double(arr) {
      return arr.concat(createSizedArray(arr.length));
    }

    var pooling = {double};

    const PoolFactory = function (initialLength, _create, _release) {
      let _length = 0;
      let _maxLength = initialLength;
      let pool = createSizedArray(_maxLength);

      const ob = {
        newElement: newElement,
        release: release,
      };

      /**
       * a
       * @return {*}
       */
      function newElement() {
        let element;
        if (_length) {
          _length -= 1;
          element = pool[_length];
        } else {
          element = _create();
        }
        return element;
      }

      /**
       * a
       * @param {*} element a
       */
      function release(element) {
        if (_length === _maxLength) {
          pool = pooling.double(pool);
          _maxLength = _maxLength * 2;
        }
        if (_release) {
          _release(element);
        }
        pool[_length] = element;
        _length += 1;
      }

      /**
       * @return {*}
       */
      // function clone() {
      //   var clonedElement = newElement();
      //   return _clone(clonedElement);
      // }

      return ob;
    };

    /**
     * a
     * @private
     * @return {*}
     */
    function create() {
      return createTypedArray('float32', 2);
    }
    const PointPool = PoolFactory(8, create);

    /**
     * a shape path
     * @private
     */
    class ShapePath {
      /**
       * shape path constructor
       */
      constructor() {
        this.c = false;
        this._length = 0;
        this._maxLength = 8;
        this.v = createSizedArray(this._maxLength);
        this.o = createSizedArray(this._maxLength);
        this.i = createSizedArray(this._maxLength);
      }

      /**
       * set path data
       * @param {*} closed path is closed ?
       * @param {*} len path vertex data length
       */
      setPathData(closed, len) {
        this.c = closed;
        this.setLength(len);
        let i = 0;
        while (i < len) {
          this.v[i] = PointPool.newElement();
          this.o[i] = PointPool.newElement();
          this.i[i] = PointPool.newElement();
          i += 1;
        }
      }

      /**
       * set array pool size
       * @param {*} len array length
       */
      setLength(len) {
        while (this._maxLength < len) {
          this.doubleArrayLength();
        }
        this._length = len;
      }

      /**
       * double array pool size
       */
      doubleArrayLength() {
        this.v = this.v.concat(createSizedArray(this._maxLength));
        this.i = this.i.concat(createSizedArray(this._maxLength));
        this.o = this.o.concat(createSizedArray(this._maxLength));
        this._maxLength *= 2;
      }

      /**
       * set x y to this.v | this.i | this.o
       * @param {*} x x component
       * @param {*} y y component
       * @param {*} type data type v | i | o
       * @param {*} pos data index
       * @param {*} replace need replace a new point
       */
      setXYAt(x, y, type, pos, replace) {
        let arr;
        this._length = Math.max(this._length, pos + 1);
        if (this._length >= this._maxLength) {
          this.doubleArrayLength();
        }
        switch (type) {
          case 'v':
            arr = this.v;
            break;
          case 'i':
            arr = this.i;
            break;
          case 'o':
            arr = this.o;
            break;
        }
        if (!arr[pos] || (arr[pos] && !replace)) {
          arr[pos] = PointPool.newElement();
        }
        arr[pos][0] = x;
        arr[pos][1] = y;
      }

      /**
       * setTripleAt
       * @param {*} vX vertex x
       * @param {*} vY vertex y
       * @param {*} oX out control x
       * @param {*} oY out control y
       * @param {*} iX in control x
       * @param {*} iY in control x
       * @param {*} pos index of pool
       * @param {*} replace replace point
       */
      setTripleAt(vX, vY, oX, oY, iX, iY, pos, replace) {
        this.setXYAt(vX, vY, 'v', pos, replace);
        this.setXYAt(oX, oY, 'o', pos, replace);
        this.setXYAt(iX, iY, 'i', pos, replace);
      }

      /**
       * reverse point
       * @return {*} renturn new shape path
       */
      reverse() {
        const newPath = new ShapePath();
        newPath.setPathData(this.c, this._length);
        const vertices = this.v;
        const outPoints = this.o;
        const inPoints = this.i;
        let init = 0;
        if (this.c) {
          newPath.setTripleAt(
            vertices[0][0],
            vertices[0][1],
            inPoints[0][0],
            inPoints[0][1],
            outPoints[0][0],
            outPoints[0][1],
            0,
            false,
          );
          init = 1;
        }
        let cnt = this._length - 1;
        const len = this._length;

        for (let i = init; i < len; i += 1) {
          newPath.setTripleAt(
            vertices[cnt][0],
            vertices[cnt][1],
            inPoints[cnt][0],
            inPoints[cnt][1],
            outPoints[cnt][0],
            outPoints[cnt][1],
            i,
            false,
          );
          cnt -= 1;
        }
        return newPath;
      }
    }

    /**
     * a
     * @private
     * @return {*}
     */
    function create$1() {
      return new ShapePath();
    }

    /**
     * a
     * FIXME: 这里可能不需要这么深度的做 release
     * @private
     * @param {*} shapePath a
     */
    function release(shapePath) {
      const len = shapePath._length;
      for (let i = 0; i < len; i += 1) {
        PointPool.release(shapePath.v[i]);
        PointPool.release(shapePath.i[i]);
        PointPool.release(shapePath.o[i]);
        shapePath.v[i] = null;
        shapePath.i[i] = null;
        shapePath.o[i] = null;
      }
      shapePath._length = 0;
      shapePath.c = false;
    }

    /**
     * a
     * @private
     * @param {*} shape a
     * @return {*}
     */
    function clone(shape) {
      const cloned = ShapePool.newElement();
      const len = shape._length === undefined ? shape.v.length : shape._length;
      cloned.setLength(len);
      cloned.c = shape.c;
      // var pt;

      for (let i = 0; i < len; i += 1) {
        cloned.setTripleAt(shape.v[i][0], shape.v[i][1], shape.o[i][0], shape.o[i][1], shape.i[i][0], shape.i[i][1], i);
      }
      return cloned;
    }

    const ShapePool = PoolFactory(4, create$1, release);
    ShapePool.clone = clone;

    /**
     * shape collection
     * @private
     */
    class ShapeCollection {
      /**
       * constructor shape collection
       */
      constructor() {
        this._length = 0;
        this._maxLength = 4;
        this.shapes = createSizedArray(this._maxLength);
      }

      /**
       * add shape to collection
       * @param {*} shapeData shape data
       */
      addShape(shapeData) {
        if (this._length === this._maxLength) {
          this.shapes = this.shapes.concat(createSizedArray(this._maxLength));
          this._maxLength *= 2;
        }
        this.shapes[this._length] = shapeData;
        this._length += 1;
      }

      /**
       * release shapes form shape pool
       */
      releaseShapes() {
        for (let i = 0; i < this._length; i += 1) {
          ShapePool.release(this.shapes[i]);
        }
        this._length = 0;
      }
    }

    let _length = 0;
    let _maxLength = 4;
    let pool = createSizedArray(_maxLength);

    /**
     * a
     * @private
     * @return {*}
     */
    function newShapeCollection() {
      let shapeCollection;
      if (_length) {
        _length -= 1;
        shapeCollection = pool[_length];
      } else {
        shapeCollection = new ShapeCollection();
      }
      return shapeCollection;
    }

    /**
     * a
     * @private
     * @param {*} shapeCollection a
     */
    function release$1(shapeCollection) {
      const len = shapeCollection._length;
      for (let i = 0; i < len; i += 1) {
        ShapePool.release(shapeCollection.shapes[i]);
      }
      shapeCollection._length = 0;

      if (_length === _maxLength) {
        pool = pooling.double(pool);
        _maxLength = _maxLength * 2;
      }
      pool[_length] = shapeCollection;
      _length += 1;
    }

    var ShapeCollectionPool = {newShapeCollection, release: release$1};

    /**
     * a
     * @private
     */
    class DynamicPropertyContainer {
      /**
       * a
       */
      outTypeExpressionMode() {
        this._hasOutTypeExpression = true;
        if (this.container) this.container.outTypeExpressionMode();
      }

      /**
       * a
       * @param {*} prop a
       */
      addDynamicProperty(prop) {
        if (this.dynamicProperties.indexOf(prop) === -1) {
          this.dynamicProperties.push(prop);
          this.container.addDynamicProperty(this);
          this._isAnimated = true;
          if (prop._hasOutTypeExpression) this.outTypeExpressionMode();
        }
      }

      /**
       * a
       * @param {*} frameNum a
       */
      iterateDynamicProperties(frameNum) {
        this._mdf = false;
        const len = this.dynamicProperties.length;
        for (let i = 0; i < len; i += 1) {
          this.dynamicProperties[i].getValue(frameNum);
          if (this.dynamicProperties[i]._mdf) {
            this._mdf = true;
          }
        }
      }

      /**
       * a
       * @param {*} container a
       */
      initDynamicPropertyContainer(container) {
        this.container = container;
        this.dynamicProperties = [];
        this._mdf = false;
        this._isAnimated = false;
        this._hasOutTypeExpression = false;
      }
    }

    const defaultCurveSegments = 200;
    /**
     * a
     * @private
     * @return {*}
     */
    function create$2() {
      return {
        addedLength: 0,
        percents: createTypedArray('float32', defaultCurveSegments),
        lengths: createTypedArray('float32', defaultCurveSegments),
      };
    }
    const BezierLengthPool = PoolFactory(8, create$2);

    /**
     * @private
     * @return {*}
     */
    function create$3() {
      return {
        lengths: [],
        totalLength: 0,
      };
    }

    /**
     * a
     * @private
     * @param {*} element a
     */
    function release$2(element) {
      const len = element.lengths.length;
      for (let i = 0; i < len; i += 1) {
        BezierLengthPool.release(element.lengths[i]);
      }
      element.lengths.length = 0;
    }

    const SegmentsLengthPool = PoolFactory(8, create$3, release$2);

    // var easingFunctions = [];
    const defaultCurveSegments$1 = 200;

    /**
     * a
     * @private
     * @param {*} x1 a
     * @param {*} y1 a
     * @param {*} x2 a
     * @param {*} y2 a
     * @param {*} x3 a
     * @param {*} y3 a
     * @return {*}
     */
    function pointOnLine2D(x1, y1, x2, y2, x3, y3) {
      const det1 = x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1;
      return det1 > -0.001 && det1 < 0.001;
    }

    /**
     * a
     * @private
     * @param {*} x1 a
     * @param {*} y1 a
     * @param {*} z1 a
     * @param {*} x2 a
     * @param {*} y2 a
     * @param {*} z2 a
     * @param {*} x3 a
     * @param {*} y3 a
     * @param {*} z3 a
     * @return {*}
     */
    function pointOnLine3D(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
      if (z1 === 0 && z2 === 0 && z3 === 0) {
        return pointOnLine2D(x1, y1, x2, y2, x3, y3);
      }
      const dist1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
      const dist2 = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2) + Math.pow(z3 - z1, 2));
      const dist3 = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2) + Math.pow(z3 - z2, 2));
      let diffDist;
      if (dist1 > dist2) {
        if (dist1 > dist3) {
          diffDist = dist1 - dist2 - dist3;
        } else {
          diffDist = dist3 - dist2 - dist1;
        }
      } else if (dist3 > dist2) {
        diffDist = dist3 - dist2 - dist1;
      } else {
        diffDist = dist2 - dist1 - dist3;
      }
      return diffDist > -0.0001 && diffDist < 0.0001;
    }

    /**
     * a
     * @private
     * @param {*} pt1 a
     * @param {*} pt2 a
     * @param {*} pt3 a
     * @param {*} pt4 a
     * @return {*}
     */
    function getBezierLength(pt1, pt2, pt3, pt4) {
      const curveSegments = defaultCurveSegments$1;
      // var i, len;
      let addedLength = 0;
      let ptDistance;
      const point = [];
      const lastPoint = [];
      const lengthData = BezierLengthPool.newElement();
      const len = pt3.length;
      for (let k = 0; k < curveSegments; k += 1) {
        const perc = k / (curveSegments - 1);
        ptDistance = 0;
        for (let i = 0; i < len; i += 1) {
          const ptCoord =
            Math.pow(1 - perc, 3) * pt1[i] +
            3 * Math.pow(1 - perc, 2) * perc * pt3[i] +
            3 * (1 - perc) * Math.pow(perc, 2) * pt4[i] +
            Math.pow(perc, 3) * pt2[i];
          point[i] = ptCoord;
          if (lastPoint[i] !== null) {
            ptDistance += Math.pow(point[i] - lastPoint[i], 2);
          }
          lastPoint[i] = point[i];
        }
        if (ptDistance) {
          ptDistance = Math.sqrt(ptDistance);
          addedLength += ptDistance;
        }
        lengthData.percents[k] = perc;
        lengthData.lengths[k] = addedLength;
      }
      lengthData.addedLength = addedLength;
      return lengthData;
    }

    /**
     * a
     * @private
     * @param {*} shapeData a
     * @return {*}
     */
    function getSegmentsLength(shapeData) {
      const segmentsLength = SegmentsLengthPool.newElement();
      const closed = shapeData.c;
      const pathV = shapeData.v;
      const pathO = shapeData.o;
      const pathI = shapeData.i;
      const len = shapeData._length;
      const lengths = segmentsLength.lengths;
      let totalLength = 0;
      let i = 0;
      for (; i < len - 1; i += 1) {
        lengths[i] = getBezierLength(pathV[i], pathV[i + 1], pathO[i], pathI[i + 1]);
        totalLength += lengths[i].addedLength;
      }
      if (closed && len) {
        lengths[i] = getBezierLength(pathV[i], pathV[0], pathO[i], pathI[0]);
        totalLength += lengths[i].addedLength;
      }
      segmentsLength.totalLength = totalLength;
      return segmentsLength;
    }

    /**
     * a
     * @private
     * @param {*} length a
     */
    function BezierData(length) {
      this.segmentLength = 0;
      this.points = new Array(length);
    }

    /**
     * a
     * @private
     * @param {*} partial a
     * @param {*} point a
     */
    function PointData(partial, point) {
      this.partialLength = partial;
      this.point = point;
    }

    const storedData = {};
    /**
     * a
     * @private
     * @param {*} pt1 a
     * @param {*} pt2 a
     * @param {*} pt3 a
     * @param {*} pt4 a
     * @return {*}
     */
    function buildBezierData(pt1, pt2, pt3, pt4) {
      const bezierName = (
        pt1[0] +
        '_' +
        pt1[1] +
        '_' +
        pt2[0] +
        '_' +
        pt2[1] +
        '_' +
        pt3[0] +
        '_' +
        pt3[1] +
        '_' +
        pt4[0] +
        '_' +
        pt4[1]
      ).replace(/\./g, 'p');
      if (!storedData[bezierName]) {
        let curveSegments = defaultCurveSegments$1;
        // var k, i, len;
        let addedLength = 0;
        let ptDistance;
        let point;
        let lastPoint = null;
        if (
          pt1.length === 2 &&
          (pt1[0] != pt2[0] || pt1[1] != pt2[1]) &&
          pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt1[0] + pt3[0], pt1[1] + pt3[1]) &&
          pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt2[0] + pt4[0], pt2[1] + pt4[1])
        ) {
          curveSegments = 2;
        }
        const bezierData = new BezierData(curveSegments);
        const len = pt3.length;
        for (let k = 0; k < curveSegments; k += 1) {
          point = createSizedArray(len);
          const perc = k / (curveSegments - 1);
          ptDistance = 0;
          for (let i = 0; i < len; i += 1) {
            const ptCoord =
              Math.pow(1 - perc, 3) * pt1[i] +
              3 * Math.pow(1 - perc, 2) * perc * (pt1[i] + pt3[i]) +
              3 * (1 - perc) * Math.pow(perc, 2) * (pt2[i] + pt4[i]) +
              Math.pow(perc, 3) * pt2[i];
            point[i] = ptCoord;
            if (lastPoint !== null) {
              ptDistance += Math.pow(point[i] - lastPoint[i], 2);
            }
          }
          ptDistance = Math.sqrt(ptDistance);
          addedLength += ptDistance;
          bezierData.points[k] = new PointData(ptDistance, point);
          lastPoint = point;
        }
        bezierData.segmentLength = addedLength;
        storedData[bezierName] = bezierData;
      }
      return storedData[bezierName];
    }

    /**
     * a
     * @private
     * @param {*} perc a
     * @param {*} bezierData a
     * @return {*}
     */
    function getDistancePerc(perc, bezierData) {
      const percents = bezierData.percents;
      const lengths = bezierData.lengths;
      const len = percents.length;
      let initPos = Math.floor((len - 1) * perc);
      const lengthPos = perc * bezierData.addedLength;
      let lPerc = 0;
      if (initPos === len - 1 || initPos === 0 || lengthPos === lengths[initPos]) {
        return percents[initPos];
      } else {
        const dir = lengths[initPos] > lengthPos ? -1 : 1;
        let flag = true;
        while (flag) {
          if (lengths[initPos] <= lengthPos && lengths[initPos + 1] > lengthPos) {
            lPerc = (lengthPos - lengths[initPos]) / (lengths[initPos + 1] - lengths[initPos]);
            flag = false;
          } else {
            initPos += dir;
          }
          if (initPos < 0 || initPos >= len - 1) {
            // FIX for TypedArrays that don't store floating point values with enough accuracy
            if (initPos === len - 1) {
              return percents[initPos];
            }
            flag = false;
          }
        }
        return percents[initPos] + (percents[initPos + 1] - percents[initPos]) * lPerc;
      }
    }

    /**
     * a
     * @private
     * @param {*} pt1 a
     * @param {*} pt2 a
     * @param {*} pt3 a
     * @param {*} pt4 a
     * @param {*} percent a
     * @param {*} bezierData a
     * @return {*}
     */
    function getPointInSegment(pt1, pt2, pt3, pt4, percent, bezierData) {
      const t1 = getDistancePerc(percent, bezierData);
      // var u0 = 1;
      const u1 = 1 - t1;
      const ptX =
        Math.round(
          (u1 * u1 * u1 * pt1[0] +
            (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[0] +
            (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[0] +
            t1 * t1 * t1 * pt2[0]) *
            1000,
        ) / 1000;
      const ptY =
        Math.round(
          (u1 * u1 * u1 * pt1[1] +
            (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[1] +
            (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[1] +
            t1 * t1 * t1 * pt2[1]) *
            1000,
        ) / 1000;
      return [ptX, ptY];
    }

    // function getSegmentArray() {

    // }

    const bezierSegmentPoints = createTypedArray('float32', 8);

    /**
     * a
     * @private
     * @param {*} pt1 a
     * @param {*} pt2 a
     * @param {*} pt3 a
     * @param {*} pt4 a
     * @param {*} startPerc a
     * @param {*} endPerc a
     * @param {*} bezierData a
     * @return {*}
     */
    function getNewSegment(pt1, pt2, pt3, pt4, startPerc, endPerc, bezierData) {
      /* eslint camelcase: 0 */
      startPerc = startPerc < 0 ? 0 : startPerc > 1 ? 1 : startPerc;
      const t0 = getDistancePerc(startPerc, bezierData);
      endPerc = endPerc > 1 ? 1 : endPerc;
      const t1 = getDistancePerc(endPerc, bezierData);
      const len = pt1.length;
      const u0 = 1 - t0;
      const u1 = 1 - t1;
      const u0u0u0 = u0 * u0 * u0;
      const t0u0u0_3 = t0 * u0 * u0 * 3;
      const t0t0u0_3 = t0 * t0 * u0 * 3;
      const t0t0t0 = t0 * t0 * t0;
      //
      const u0u0u1 = u0 * u0 * u1;
      const t0u0u1_3 = t0 * u0 * u1 + u0 * t0 * u1 + u0 * u0 * t1;
      const t0t0u1_3 = t0 * t0 * u1 + u0 * t0 * t1 + t0 * u0 * t1;
      const t0t0t1 = t0 * t0 * t1;
      //
      const u0u1u1 = u0 * u1 * u1;
      const t0u1u1_3 = t0 * u1 * u1 + u0 * t1 * u1 + u0 * u1 * t1;
      const t0t1u1_3 = t0 * t1 * u1 + u0 * t1 * t1 + t0 * u1 * t1;
      const t0t1t1 = t0 * t1 * t1;
      //
      const u1u1u1 = u1 * u1 * u1;
      const t1u1u1_3 = t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1;
      const t1t1u1_3 = t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1;
      const t1t1t1 = t1 * t1 * t1;
      for (let i = 0; i < len; i += 1) {
        bezierSegmentPoints[i * 4] =
          Math.round((u0u0u0 * pt1[i] + t0u0u0_3 * pt3[i] + t0t0u0_3 * pt4[i] + t0t0t0 * pt2[i]) * 1000) / 1000;
        bezierSegmentPoints[i * 4 + 1] =
          Math.round((u0u0u1 * pt1[i] + t0u0u1_3 * pt3[i] + t0t0u1_3 * pt4[i] + t0t0t1 * pt2[i]) * 1000) / 1000;
        bezierSegmentPoints[i * 4 + 2] =
          Math.round((u0u1u1 * pt1[i] + t0u1u1_3 * pt3[i] + t0t1u1_3 * pt4[i] + t0t1t1 * pt2[i]) * 1000) / 1000;
        bezierSegmentPoints[i * 4 + 3] =
          Math.round((u1u1u1 * pt1[i] + t1u1u1_3 * pt3[i] + t1t1u1_3 * pt4[i] + t1t1t1 * pt2[i]) * 1000) / 1000;
      }

      return bezierSegmentPoints;
    }

    var bez = {
      getSegmentsLength,
      getNewSegment,
      getPointInSegment,
      buildBezierData,
      pointOnLine2D,
      pointOnLine3D,
    };

    const initialDefaultFrame = -999999;
    const degToRads = Math.PI / 180;

    const defaultVector = [0, 0];

    const EX_REG = /(loopIn|loopOut)\(([^)]+)/;
    const STR_REG = /["']\w+["']/;

    /**
     * Cycle
     * @class
     * @private
     */
    class Cycle {
      /**
       * Pingpong
       * @param {*} type Pingpong
       * @param {*} begin Pingpong
       * @param {*} end Pingpong
       */
      constructor(type, begin, end) {
        this.begin = begin;
        this.end = end;
        this.total = this.end - this.begin;
        this.type = type;
      }

      /**
       * progress
       * @param {number} progress progress
       * @return {number} progress
       */
      update(progress) {
        if (this.type === 'in') {
          if (progress >= this.begin) return progress;
          return this.end - Tools.euclideanModulo(this.begin - progress, this.total);
        } else if (this.type === 'out') {
          if (progress <= this.end) return progress;
          return this.begin + Tools.euclideanModulo(progress - this.end, this.total);
        }
      }
    }

    /**
     * Pingpong
     * @class
     * @private
     */
    class Pingpong {
      /**
       * Pingpong
       * @param {*} type Pingpong
       * @param {*} begin Pingpong
       * @param {*} end Pingpong
       */
      constructor(type, begin, end) {
        this.begin = begin;
        this.end = end;
        this.total = this.end - this.begin;
        this.type = type;
      }

      /**
       * progress
       * @param {number} progress progress
       * @return {number} progress
       */
      update(progress) {
        if ((this.type === 'in' && progress < this.begin) || (this.type === 'out' && progress > this.end)) {
          const space = progress - this.end;
          return this.pingpong(space);
        }
        return progress;
      }

      /**
       * pingpong
       * @param {number} space
       * @return {number}
       */
      pingpong(space) {
        const dir = Math.floor(space / this.total) % 2;
        if (dir) {
          return this.begin + Tools.euclideanModulo(space, this.total);
        } else {
          return this.end - Tools.euclideanModulo(space, this.total);
        }
      }
    }

    const FN_MAPS = {
      loopIn(datak, mode, offset) {
        const begin = datak[0].t;
        const last = datak.length - 1;
        const endIdx = Math.min(last, offset);
        const end = datak[endIdx].t;
        switch (mode) {
          case 'cycle':
            return new Cycle('in', begin, end);
          case 'pingpong':
            return new Pingpong('in', begin, end);
        }
        return null;
      },
      loopOut(datak, mode, offset) {
        const last = datak.length - 1;
        const beginIdx = Math.max(0, last - offset);
        const begin = datak[beginIdx].t;
        const end = datak[last].t;
        switch (mode) {
          case 'cycle':
            return new Cycle('out', begin, end);
          case 'pingpong':
            return new Pingpong('out', begin, end);
        }
        return null;
      },
    };

    /**
     * parseParams
     * @ignore
     * @param {string} pStr string
     * @return {array}
     */
    function parseParams(pStr) {
      const params = pStr.split(/\s*,\s*/);
      return params.map(it => {
        if (STR_REG.test(it)) return it.replace(/"|'/g, '');
        return parseInt(it);
      });
    }

    /**
     * parseEx
     * @ignore
     * @param {string} ex string
     * @return {object}
     */
    function parseEx(ex) {
      const rs = ex.match(EX_REG);
      const ps = parseParams(rs[2]);
      return {
        name: rs[1],
        mode: ps[0],
        offset: ps[1],
      };
    }

    /**
     * hasSupportExpression
     * @ignore
     * @param {string} ksp string
     * @return {boolean}
     */
    function hasSupportExpression(ksp) {
      return ksp.x && EX_REG.test(ksp.x);
    }

    /**
     * getExpression
     * @ignore
     * @param {object} ksp ksp
     * @return {object}
     */
    function getExpression(ksp) {
      const {name, mode, offset = 0} = parseEx(ksp.x);
      const _offset = offset === 0 ? ksp.k.length - 1 : offset;
      return FN_MAPS[name] && FN_MAPS[name](ksp.k, mode, _offset);
    }

    var Expression = {hasSupportExpression, getExpression};

    /**
     * based on @Toji's https://github.com/toji/gl-matrix/
     * slerp with quaternion
     * @private
     * @param {*} a from a
     * @param {*} b to b
     * @param {*} t progress
     * @return {Array}
     */
    function slerp(a, b, t) {
      const out = [];
      const ax = a[0];
      const ay = a[1];
      const az = a[2];
      const aw = a[3];
      let bx = b[0];
      let by = b[1];
      let bz = b[2];
      let bw = b[3];

      let omega;
      let cosom;
      let sinom;
      let scale0;
      let scale1;

      cosom = ax * bx + ay * by + az * bz + aw * bw;
      if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      if (1.0 - cosom > 0.000001) {
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
      } else {
        scale0 = 1.0 - t;
        scale1 = t;
      }
      out[0] = scale0 * ax + scale1 * bx;
      out[1] = scale0 * ay + scale1 * by;
      out[2] = scale0 * az + scale1 * bz;
      out[3] = scale0 * aw + scale1 * bw;

      return out;
    }

    /**
     * quaternion to euler
     * @private
     * @param {Array} out out euler pointer
     * @param {Array} quat origin quaternion
     */
    function quaternionToEuler(out, quat) {
      const qx = quat[0];
      const qy = quat[1];
      const qz = quat[2];
      const qw = quat[3];
      const heading = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy * qy - 2 * qz * qz);
      const attitude = Math.asin(2 * qx * qy + 2 * qz * qw);
      const bank = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx * qx - 2 * qz * qz);
      out[0] = heading / degToRads;
      out[1] = attitude / degToRads;
      out[2] = bank / degToRads;
    }

    /**
     * create a quaternion from euler
     * @private
     * @param {Array} values origin euler
     * @return {Array} quaternion
     */
    function createQuaternion(values) {
      const heading = values[0] * degToRads;
      const attitude = values[1] * degToRads;
      const bank = values[2] * degToRads;
      const c1 = Math.cos(heading / 2);
      const c2 = Math.cos(attitude / 2);
      const c3 = Math.cos(bank / 2);
      const s1 = Math.sin(heading / 2);
      const s2 = Math.sin(attitude / 2);
      const s3 = Math.sin(bank / 2);
      const w = c1 * c2 * c3 - s1 * s2 * s3;
      const x = s1 * s2 * c3 + c1 * c2 * s3;
      const y = s1 * c2 * c3 + c1 * s2 * s3;
      const z = c1 * s2 * c3 - s1 * c2 * s3;

      return [x, y, z, w];
    }

    /**
     * basic property for animate property unit
     * @private
     */
    class BaseProperty {
      /**
       * interpolate value
       * @param {Number} frameNum now frame
       * @param {Object} caching caching object
       * @return {Array} newValue
       */
      interpolateValue(frameNum, caching) {
        // const offsetTime = this.offsetTime;
        let newValue;
        if (this.propType === 'multidimensional') {
          newValue = createTypedArray('float32', this.pv.length);
        }
        let iterationIndex = caching.lastIndex;
        let i = iterationIndex;
        let len = this.keyframes.length - 1;
        let flag = true;
        let keyData;
        let nextKeyData;

        while (flag) {
          keyData = this.keyframes[i];
          nextKeyData = this.keyframes[i + 1];
          if (i === len - 1 && frameNum >= nextKeyData.t) {
            if (keyData.h) {
              keyData = nextKeyData;
            }
            iterationIndex = 0;
            break;
          }
          if (nextKeyData.t > frameNum) {
            iterationIndex = i;
            break;
          }
          if (i < len - 1) {
            i += 1;
          } else {
            iterationIndex = 0;
            flag = false;
          }
        }

        let k;
        let kLen;
        let perc;
        let jLen;
        let j;
        let fnc;
        let nextKeyTime = nextKeyData.t;
        let keyTime = keyData.t;
        let endValue;
        if (keyData.to) {
          if (!keyData.bezierData) {
            keyData.bezierData = bez.buildBezierData(keyData.s, nextKeyData.s || keyData.e, keyData.to, keyData.ti);
          }
          let bezierData = keyData.bezierData;
          if (frameNum >= nextKeyTime || frameNum < keyTime) {
            let ind = frameNum >= nextKeyTime ? bezierData.points.length - 1 : 0;
            kLen = bezierData.points[ind].point.length;
            for (k = 0; k < kLen; k += 1) {
              newValue[k] = bezierData.points[ind].point[k];
            }
            // caching._lastKeyframeIndex = -1;
          } else {
            if (keyData.__fnct) {
              fnc = keyData.__fnct;
            } else {
              fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y, keyData.n).get;
              keyData.__fnct = fnc;
            }
            perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
            let distanceInLine = bezierData.segmentLength * perc;

            let segmentPerc;
            let addedLength = caching.lastFrame < frameNum && caching._lastKeyframeIndex === i ? caching._lastAddedLength : 0;
            j = caching.lastFrame < frameNum && caching._lastKeyframeIndex === i ? caching._lastPoint : 0;
            flag = true;
            jLen = bezierData.points.length;
            while (flag) {
              addedLength += bezierData.points[j].partialLength;
              if (distanceInLine === 0 || perc === 0 || j === bezierData.points.length - 1) {
                kLen = bezierData.points[j].point.length;
                for (k = 0; k < kLen; k += 1) {
                  newValue[k] = bezierData.points[j].point[k];
                }
                break;
              } else if (distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j + 1].partialLength) {
                segmentPerc = (distanceInLine - addedLength) / bezierData.points[j + 1].partialLength;
                kLen = bezierData.points[j].point.length;
                for (k = 0; k < kLen; k += 1) {
                  newValue[k] =
                    bezierData.points[j].point[k] + (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc;
                }
                break;
              }
              if (j < jLen - 1) {
                j += 1;
              } else {
                flag = false;
              }
            }
            caching._lastPoint = j;
            caching._lastAddedLength = addedLength - bezierData.points[j].partialLength;
            caching._lastKeyframeIndex = i;
          }
        } else {
          let outX;
          let outY;
          let inX;
          let inY;
          let keyValue;
          len = keyData.s.length;
          endValue = nextKeyData.s || keyData.e;
          if (this.sh && keyData.h !== 1) {
            if (frameNum >= nextKeyTime) {
              newValue[0] = endValue[0];
              newValue[1] = endValue[1];
              newValue[2] = endValue[2];
            } else if (frameNum <= keyTime) {
              newValue[0] = keyData.s[0];
              newValue[1] = keyData.s[1];
              newValue[2] = keyData.s[2];
            } else {
              let quatStart = createQuaternion(keyData.s);
              let quatEnd = createQuaternion(endValue);
              let time = (frameNum - keyTime) / (nextKeyTime - keyTime);
              quaternionToEuler(newValue, slerp(quatStart, quatEnd, time));
            }
          } else {
            for (i = 0; i < len; i += 1) {
              if (keyData.h !== 1) {
                if (frameNum >= nextKeyTime) {
                  perc = 1;
                } else if (frameNum < keyTime) {
                  perc = 0;
                } else {
                  if (keyData.o.x.constructor === Array) {
                    if (!keyData.__fnct) {
                      keyData.__fnct = [];
                    }
                    if (!keyData.__fnct[i]) {
                      outX = typeof keyData.o.x[i] === 'undefined' ? keyData.o.x[0] : keyData.o.x[i];
                      outY = typeof keyData.o.y[i] === 'undefined' ? keyData.o.y[0] : keyData.o.y[i];
                      inX = typeof keyData.i.x[i] === 'undefined' ? keyData.i.x[0] : keyData.i.x[i];
                      inY = typeof keyData.i.y[i] === 'undefined' ? keyData.i.y[0] : keyData.i.y[i];
                      fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
                      keyData.__fnct[i] = fnc;
                    } else {
                      fnc = keyData.__fnct[i];
                    }
                  } else {
                    if (!keyData.__fnct) {
                      outX = keyData.o.x;
                      outY = keyData.o.y;
                      inX = keyData.i.x;
                      inY = keyData.i.y;
                      fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
                      keyData.__fnct = fnc;
                    } else {
                      fnc = keyData.__fnct;
                    }
                  }
                  perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
                }
              }

              endValue = nextKeyData.s || keyData.e;
              keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i] + (endValue[i] - keyData.s[i]) * perc;

              if (this.propType === 'multidimensional') {
                newValue[i] = keyValue;
              } else {
                newValue = keyValue;
              }
            }
          }
        }
        caching.lastIndex = iterationIndex;
        return newValue;
      }

      /**
       * get value at comp frame
       * @param {*} frameNum a
       * @return {Array|Number}
       */
      getValueAtCurrentTime(frameNum) {
        // let frameNum = this.comp.renderedFrame;
        let initTime = this.keyframes[0].t;
        let endTime = this.keyframes[this.keyframes.length - 1].t;
        if (
          !(
            frameNum === this._caching.lastFrame ||
            (this._caching.lastFrame !== initialDefaultFrame &&
              ((this._caching.lastFrame >= endTime && frameNum >= endTime) ||
                (this._caching.lastFrame < initTime && frameNum < initTime)))
          )
        ) {
          if (this._caching.lastFrame >= frameNum) {
            this._caching._lastKeyframeIndex = -1;
            this._caching.lastIndex = 0;
          }

          let renderResult = this.interpolateValue(frameNum, this._caching);
          this.pv = renderResult;
        }
        this._caching.lastFrame = frameNum;
        return this.pv;
      }

      /**
       * set value to this.v prop
       * @param {Array|Number} val value
       */
      setVValue(val) {
        let multipliedValue;
        if (this.propType === 'unidimensional') {
          multipliedValue = val * this.mult;
          if (Math.abs(this.v - multipliedValue) > 0.00001) {
            this.v = multipliedValue;
            this._mdf = true;
          }
        } else {
          let i = 0;
          const len = this.v.length;
          while (i < len) {
            multipliedValue = val[i] * this.mult;
            if (Math.abs(this.v[i] - multipliedValue) > 0.00001) {
              this.v[i] = multipliedValue;
              this._mdf = true;
            }
            i += 1;
          }
        }
      }

      /**
       * process effects sequence
       * @param {*} frameNum a
       */
      processEffectsSequence(frameNum) {
        if (this.expression) {
          frameNum = this.expression.update(frameNum);
        }
        if (frameNum === this.frameId || !this.effectsSequence.length) {
          return;
        }
        if (this.lock) {
          this.setVValue(this.pv);
          return;
        }
        this.lock = true;
        this._mdf = this._isFirstFrame;
        // let multipliedValue;
        let i;
        let len = this.effectsSequence.length;
        let finalValue = this.kf ? this.pv : this.data.k;
        for (i = 0; i < len; i += 1) {
          finalValue = this.effectsSequence[i](frameNum);
        }
        this.setVValue(finalValue);
        this._isFirstFrame = false;
        this.lock = false;
        this.frameId = frameNum;
      }

      /**
       * a
       * @param {*} effectFunction a
       */
      addEffect(effectFunction) {
        this.effectsSequence.push(effectFunction);
        this.container.addDynamicProperty(this);
      }
    }

    /**
     * unidimensional value property
     * @private
     */
    class ValueProperty extends BaseProperty {
      /**
       * constructor unidimensional value property
       * @param {*} elem element node
       * @param {*} data unidimensional value property data
       * @param {*} mult data mult scale
       * @param {*} container value property container
       */
      constructor(elem, data, mult, container) {
        super();
        this.propType = 'unidimensional';
        this.mult = mult || 1;
        this.data = data;
        this.v = mult ? data.k * mult : data.k;
        this.pv = data.k;
        this._mdf = false;
        this.elem = elem;
        this.container = container;
        this.k = false;
        this.kf = false;
        this.vel = 0;
        this.effectsSequence = [];
        this._isFirstFrame = true;
        this.getValue = this.processEffectsSequence;
      }
    }

    /**
     * multidimensional value property
     * @private
     */
    class MultiDimensionalProperty extends BaseProperty {
      /**
       * constructor multidimensional value property
       * @param {*} elem element node
       * @param {*} data multidimensional value property data
       * @param {*} mult data mult scale
       * @param {*} container value property container
       */
      constructor(elem, data, mult, container) {
        super();
        this.propType = 'multidimensional';
        this.mult = mult || 1;
        this.data = data;
        this._mdf = false;
        this.elem = elem;
        this.container = container;
        this.comp = elem.comp;
        this.k = false;
        this.kf = false;
        this.frameId = -1;
        const len = data.k.length;
        this.v = createTypedArray('float32', len);
        this.pv = createTypedArray('float32', len);
        // var arr = createTypedArray('float32', len);
        this.vel = createTypedArray('float32', len);
        for (let i = 0; i < len; i += 1) {
          this.v[i] = data.k[i] * this.mult;
          this.pv[i] = data.k[i];
        }
        this._isFirstFrame = true;
        this.effectsSequence = [];
        this.getValue = this.processEffectsSequence;
      }
    }

    /**
     * keyframed unidimensional value property
     * @private
     */
    class KeyframedValueProperty extends BaseProperty {
      /**
       * constructor keyframed unidimensional value property
       * @param {*} elem element node
       * @param {*} data keyframed unidimensional value property data
       * @param {*} mult data mult scale
       * @param {*} container value property container
       */
      constructor(elem, data, mult, container) {
        super();
        this.propType = 'unidimensional';
        this.keyframes = data.k;
        // this.offsetTime = elem.data.st;
        this.frameId = -1;
        this._caching = {lastFrame: initialDefaultFrame, lastIndex: 0, value: 0, _lastKeyframeIndex: -1};
        this.k = true;
        this.kf = true;
        this.data = data;
        this.mult = mult || 1;
        this.elem = elem;
        this.container = container;
        this.comp = elem.comp;
        this.v = initialDefaultFrame;
        this.pv = initialDefaultFrame;
        this._isFirstFrame = true;
        this.getValue = this.processEffectsSequence;
        // this.setVValue = setVValue;
        // this.interpolateValue = interpolateValue;
        this.effectsSequence = [this.getValueAtCurrentTime.bind(this)];
        // this.addEffect = addEffect;

        this._hasOutTypeExpression = false;
        if (Expression.hasSupportExpression(data)) {
          this.expression = Expression.getExpression(data);
          this._hasOutTypeExpression = this.expression.type === 'out';
        }
      }
    }

    /**
     * keyframed multidimensional value property
     * @private
     */
    class KeyframedMultidimensionalProperty extends BaseProperty {
      /**
       * constructor keyframed multidimensional value property
       * @param {*} elem element node
       * @param {*} data keyframed multidimensional value property data
       * @param {*} mult data mult scale
       * @param {*} container value property container
       */
      constructor(elem, data, mult, container) {
        super();
        this.propType = 'multidimensional';
        let i;
        let len = data.k.length;
        let s;
        let e;
        let to;
        let ti;
        for (i = 0; i < len - 1; i += 1) {
          if (data.k[i].to && data.k[i].s && data.k[i + 1] && data.k[i + 1].s) {
            s = data.k[i].s;
            e = data.k[i + 1].s;
            to = data.k[i].to;
            ti = data.k[i].ti;
            if (
              (s.length === 2 &&
                !(s[0] === e[0] && s[1] === e[1]) &&
                bez.pointOnLine2D(s[0], s[1], e[0], e[1], s[0] + to[0], s[1] + to[1]) &&
                bez.pointOnLine2D(s[0], s[1], e[0], e[1], e[0] + ti[0], e[1] + ti[1])) ||
              (s.length === 3 &&
                !(s[0] === e[0] && s[1] === e[1] && s[2] === e[2]) &&
                bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], s[0] + to[0], s[1] + to[1], s[2] + to[2]) &&
                bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], e[0] + ti[0], e[1] + ti[1], e[2] + ti[2]))
            ) {
              data.k[i].to = null;
              data.k[i].ti = null;
            }
            if (s[0] === e[0] && s[1] === e[1] && to[0] === 0 && to[1] === 0 && ti[0] === 0 && ti[1] === 0) {
              if (s.length === 2 || (s[2] === e[2] && to[2] === 0 && ti[2] === 0)) {
                data.k[i].to = null;
                data.k[i].ti = null;
              }
            }
          }
        }
        this.effectsSequence = [this.getValueAtCurrentTime.bind(this)];
        this.keyframes = data.k;
        // this.offsetTime = elem.data.st;
        this.k = true;
        this.kf = true;
        this._isFirstFrame = true;
        this.mult = mult || 1;
        this.elem = elem;
        this.container = container;
        this.comp = elem.comp;
        this.getValue = this.processEffectsSequence;
        // this.setVValue = setVValue;
        // this.interpolateValue = interpolateValue;
        this.frameId = -1;
        let arrLen = data.k[0].s.length;
        this.v = createTypedArray('float32', arrLen);
        this.pv = createTypedArray('float32', arrLen);
        for (i = 0; i < arrLen; i += 1) {
          this.v[i] = initialDefaultFrame;
          this.pv[i] = initialDefaultFrame;
        }
        this._caching = {lastFrame: initialDefaultFrame, lastIndex: 0, value: createTypedArray('float32', arrLen)};
        // this.addEffect = addEffect;

        this._hasOutTypeExpression = false;
        if (Expression.hasSupportExpression(data)) {
          this.expression = Expression.getExpression(data);
          this._hasOutTypeExpression = this.expression.type === 'out';
        }
      }
    }

    /**
     * getProp by data
     * @private
     * @param {*} elem element node
     * @param {*} data keyframed multidimensional value property data
     * @param {*} type keyframed type or not
     * @param {*} mult data mult scale
     * @param {*} container value property container
     * @return {ValueProperty|MultiDimensionalProperty|KeyframedValueProperty|KeyframedMultidimensionalProperty}
     */
    function getProp(elem, data, type, mult, container) {
      let p;
      if (!data.k.length) {
        p = new ValueProperty(elem, data, mult, container);
      } else if (typeof data.k[0] === 'number') {
        p = new MultiDimensionalProperty(elem, data, mult, container);
      } else {
        switch (type) {
          case 0:
            p = new KeyframedValueProperty(elem, data, mult, container);
            break;
          case 1:
            p = new KeyframedMultidimensionalProperty(elem, data, mult, container);
            break;
        }
      }
      if (p.effectsSequence.length) {
        container.addDynamicProperty(p);
      }
      return p;
    }

    var PropertyFactory = {getProp};

    // import { hasExpression, getExpression } from '../../utils/Expression';
    // const initFrame = -999999;
    // const degToRads = Math.PI/180;

    /**
     * basic shape property
     * @private
     */
    class BaseShapeProperty {
      /**
       * interpolate shape
       * @param {*} frameNum frame number
       * @param {*} previousValue previous value
       * @param {*} caching caching object
       */
      interpolateShape(frameNum, previousValue, caching) {
        let iterationIndex = caching.lastIndex;
        let keyPropS;
        let keyPropE;
        let isHold;
        let j;
        let k;
        let jLen;
        let kLen;
        let perc;
        let vertexValue;
        let kf = this.keyframes;
        if (frameNum < kf[0].t) {
          keyPropS = kf[0].s[0];
          isHold = true;
          iterationIndex = 0;
        } else if (frameNum >= kf[kf.length - 1].t) {
          keyPropS = kf[kf.length - 1].s ? kf[kf.length - 1].s[0] : kf[kf.length - 2].e[0];
          /* if(kf[kf.length - 1].s){
                      keyPropS = kf[kf.length - 1].s[0];
                  }else{
                      keyPropS = kf[kf.length - 2].e[0];
                  }*/
          isHold = true;
        } else {
          let i = iterationIndex;
          let len = kf.length - 1;
          let flag = true;
          let keyData;
          let nextKeyData;
          while (flag) {
            keyData = kf[i];
            nextKeyData = kf[i + 1];
            if (nextKeyData.t > frameNum) {
              break;
            }
            if (i < len - 1) {
              i += 1;
            } else {
              flag = false;
            }
          }
          isHold = keyData.h === 1;
          iterationIndex = i;
          if (!isHold) {
            if (frameNum >= nextKeyData.t) {
              perc = 1;
            } else if (frameNum < keyData.t) {
              perc = 0;
            } else {
              let fnc;
              if (keyData.__fnct) {
                fnc = keyData.__fnct;
              } else {
                fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y).get;
                keyData.__fnct = fnc;
              }
              perc = fnc((frameNum - keyData.t) / (nextKeyData.t - keyData.t));
            }
            keyPropE = nextKeyData.s ? nextKeyData.s[0] : keyData.e[0];
          }
          keyPropS = keyData.s[0];
        }
        jLen = previousValue._length;
        kLen = keyPropS.i[0].length;
        caching.lastIndex = iterationIndex;

        for (j = 0; j < jLen; j += 1) {
          for (k = 0; k < kLen; k += 1) {
            vertexValue = isHold ? keyPropS.i[j][k] : keyPropS.i[j][k] + (keyPropE.i[j][k] - keyPropS.i[j][k]) * perc;
            previousValue.i[j][k] = vertexValue;
            vertexValue = isHold ? keyPropS.o[j][k] : keyPropS.o[j][k] + (keyPropE.o[j][k] - keyPropS.o[j][k]) * perc;
            previousValue.o[j][k] = vertexValue;
            vertexValue = isHold ? keyPropS.v[j][k] : keyPropS.v[j][k] + (keyPropE.v[j][k] - keyPropS.v[j][k]) * perc;
            previousValue.v[j][k] = vertexValue;
          }
        }
      }

      /**
       * interpolate shape with currentTime
       * @param {*} frameNum frame number
       * @return {*}
       */
      interpolateShapeCurrentTime(frameNum) {
        let initTime = this.keyframes[0].t;
        let endTime = this.keyframes[this.keyframes.length - 1].t;
        let lastFrame = this._caching.lastFrame;
        if (
          !(
            lastFrame !== initialDefaultFrame &&
            ((lastFrame < initTime && frameNum < initTime) || (lastFrame > endTime && frameNum > endTime))
          )
        ) {
          // //
          this._caching.lastIndex = lastFrame < frameNum ? this._caching.lastIndex : 0;
          this.interpolateShape(frameNum, this.pv, this._caching);
          // //
        }
        this._caching.lastFrame = frameNum;
        return this.pv;
      }

      /**
       * reset shape
       */
      resetShape() {
        this.paths = this.localShapeCollection;
      }

      /**
       * is shapes is equal
       * @param {*} shape1 shape1
       * @param {*} shape2 shape2
       * @return {*}
       */
      shapesEqual(shape1, shape2) {
        if (shape1._length !== shape2._length || shape1.c !== shape2.c) {
          return false;
        }
        let i;
        let len = shape1._length;
        for (i = 0; i < len; i += 1) {
          if (
            shape1.v[i][0] !== shape2.v[i][0] ||
            shape1.v[i][1] !== shape2.v[i][1] ||
            shape1.o[i][0] !== shape2.o[i][0] ||
            shape1.o[i][1] !== shape2.o[i][1] ||
            shape1.i[i][0] !== shape2.i[i][0] ||
            shape1.i[i][1] !== shape2.i[i][1]
          ) {
            return false;
          }
        }
        return true;
      }

      /**
       * set new path to this.v
       * @param {*} newPath new path
       */
      setVValue(newPath) {
        if (!this.shapesEqual(this.v, newPath)) {
          this.v = ShapePool.clone(newPath);
          this.localShapeCollection.releaseShapes();
          this.localShapeCollection.addShape(this.v);
          this._mdf = true;
          this.paths = this.localShapeCollection;
        }
      }

      /**
       * process effects sequence
       * @param {*} frameNum frame number
       */
      processEffectsSequence(frameNum) {
        if (frameNum === this.frameId) {
          return;
        } else if (!this.effectsSequence.length) {
          this._mdf = false;
          return;
        }
        if (this.lock) {
          this.setVValue(this.pv);
          return;
        }
        this.lock = true;
        this._mdf = false;
        let finalValue = this.kf ? this.pv : this.data.ks ? this.data.ks.k : this.data.pt.k;
        let i;
        let len = this.effectsSequence.length;
        for (i = 0; i < len; i += 1) {
          finalValue = this.effectsSequence[i](frameNum);
        }
        this.setVValue(finalValue);
        this.lock = false;
        this.frameId = frameNum;
      }

      /**
       * add effect
       * @param {*} effectFunction effect funstion
       */
      addEffect(effectFunction) {
        this.effectsSequence.push(effectFunction);
        this.container.addDynamicProperty(this);
      }
    }

    /**
     * shape property
     * @private
     */
    class ShapeProperty extends BaseShapeProperty {
      /**
       * constructor shape property
       * @param {*} elem element node
       * @param {*} data shape value property data
       * @param {*} type shape propType
       */
      constructor(elem, data, type) {
        super();
        this.propType = 'shape';
        this.comp = elem.comp;
        this.container = elem;
        this.elem = elem;
        this.data = data;
        this.k = false;
        this.kf = false;
        this._mdf = false;
        let pathData = type === 3 ? data.pt.k : data.ks.k;
        this.v = ShapePool.clone(pathData);
        this.pv = ShapePool.clone(this.v);
        this.localShapeCollection = ShapeCollectionPool.newShapeCollection();
        this.paths = this.localShapeCollection;
        this.paths.addShape(this.v);
        this.reset = this.resetShape;
        this.effectsSequence = [];
        this.getValue = this.processEffectsSequence;
      }
    }

    /**
     * keyframed shape property
     * @private
     */
    class KeyframedShapeProperty extends BaseShapeProperty {
      /**
       * constructor keyframed shape property
       * @param {*} elem element node
       * @param {*} data shape value property data
       * @param {*} type shape propType
       */
      constructor(elem, data, type) {
        super();
        this.propType = 'shape';
        this.comp = elem.comp;
        this.elem = elem;
        this.container = elem;
        // this.offsetTime = elem.data.st;
        this.keyframes = type === 3 ? data.pt.k : data.ks.k;
        this.k = true;
        this.kf = true;
        let len = this.keyframes[0].s[0].i.length;
        // let jLen = this.keyframes[0].s[0].i[0].length;
        this.v = ShapePool.newElement();
        this.v.setPathData(this.keyframes[0].s[0].c, len);
        this.pv = ShapePool.clone(this.v);
        this.localShapeCollection = ShapeCollectionPool.newShapeCollection();
        this.paths = this.localShapeCollection;
        this.paths.addShape(this.v);
        this.lastFrame = initialDefaultFrame;
        this.reset = this.resetShape;
        this._caching = {lastFrame: initialDefaultFrame, lastIndex: 0};
        this.effectsSequence = [this.interpolateShapeCurrentTime.bind(this)];
        this.getValue = this.processEffectsSequence;

        this._hasOutTypeExpression = false;
        if (Expression.hasSupportExpression(data)) {
          this.expression = Expression.getExpression(data);
          this._hasOutTypeExpression = this.expression.type === 'out';
        }
      }
    }

    /**
     * ellipse shape property
     * @private
     */
    class EllShapeProperty extends DynamicPropertyContainer {
      /**
       * constructor ellipse shape property
       * @param {*} elem element node
       * @param {*} data shape value property data
       */
      constructor(elem, data) {
        super();
        // this.v = {
        //   v: createSizedArray(4),
        //   i: createSizedArray(4),
        //   o: createSizedArray(4),
        //   c: true
        // };
        this.v = ShapePool.newElement();
        this.v.setPathData(true, 4);
        this.localShapeCollection = ShapeCollectionPool.newShapeCollection();
        this.paths = this.localShapeCollection;
        this.localShapeCollection.addShape(this.v);
        this.d = data.d;
        this.elem = elem;
        this.comp = elem.comp;
        this.frameId = -1;
        this.initDynamicPropertyContainer(elem);
        this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
        this.s = PropertyFactory.getProp(elem, data.s, 1, 0, this);
        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.k = false;
          this.convertEllToPath();
        }
      }

      /**
       * reset shape
       */
      reset() {
        this.paths = this.localShapeCollection;
      }

      /**
       * get point with frameId
       * @param {*} frameNum frame number
       */
      getValue(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }
        this.iterateDynamicProperties(frameNum);
        this.frameId = frameNum;

        if (this._mdf) {
          this.convertEllToPath();
        }
      }

      /**
       * convert ellipse to path
       */
      convertEllToPath() {
        const p0 = this.p.v[0];
        const p1 = this.p.v[1];
        const s0 = this.s.v[0] / 2;
        const s1 = this.s.v[1] / 2;
        const _cw = this.d !== 3;
        const _v = this.v;
        _v.v[0][0] = p0;
        _v.v[0][1] = p1 - s1;
        _v.v[1][0] = _cw ? p0 + s0 : p0 - s0;
        _v.v[1][1] = p1;
        _v.v[2][0] = p0;
        _v.v[2][1] = p1 + s1;
        _v.v[3][0] = _cw ? p0 - s0 : p0 + s0;
        _v.v[3][1] = p1;
        _v.i[0][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
        _v.i[0][1] = p1 - s1;
        _v.i[1][0] = _cw ? p0 + s0 : p0 - s0;
        _v.i[1][1] = p1 - s1 * cPoint;
        _v.i[2][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
        _v.i[2][1] = p1 + s1;
        _v.i[3][0] = _cw ? p0 - s0 : p0 + s0;
        _v.i[3][1] = p1 + s1 * cPoint;
        _v.o[0][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
        _v.o[0][1] = p1 - s1;
        _v.o[1][0] = _cw ? p0 + s0 : p0 - s0;
        _v.o[1][1] = p1 + s1 * cPoint;
        _v.o[2][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
        _v.o[2][1] = p1 + s1;
        _v.o[3][0] = _cw ? p0 - s0 : p0 + s0;
        _v.o[3][1] = p1 - s1 * cPoint;
      }
    }

    /**
     * star shape property
     * @private
     */
    class StarShapeProperty extends DynamicPropertyContainer {
      /**
       * constructor star shape property
       * @param {*} elem element node
       * @param {*} data shape value property data
       */
      constructor(elem, data) {
        super();
        this.v = ShapePool.newElement();
        this.v.setPathData(true, 0);
        this.elem = elem;
        this.comp = elem.comp;
        this.data = data;
        this.frameId = -1;
        this.d = data.d;
        this.initDynamicPropertyContainer(elem);
        if (data.sy === 1) {
          this.ir = PropertyFactory.getProp(elem, data.ir, 0, 0, this);
          this.is = PropertyFactory.getProp(elem, data.is, 0, 0.01, this);
          this.convertToPath = this.convertStarToPath;
        } else {
          this.convertToPath = this.convertPolygonToPath;
        }
        this.pt = PropertyFactory.getProp(elem, data.pt, 0, 0, this);
        this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
        this.r = PropertyFactory.getProp(elem, data.r, 0, degToRads, this);
        this.or = PropertyFactory.getProp(elem, data.or, 0, 0, this);
        this.os = PropertyFactory.getProp(elem, data.os, 0, 0.01, this);
        this.localShapeCollection = ShapeCollectionPool.newShapeCollection();
        this.localShapeCollection.addShape(this.v);
        this.paths = this.localShapeCollection;
        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.k = false;
          this.convertToPath();
        }
      }

      /**
       * reset shape
       */
      reset() {
        this.paths = this.localShapeCollection;
      }

      /**
       * get point with frameId
       * @param {*} frameNum frame number
       */
      getValue(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties(frameNum);

        if (this._mdf) {
          this.convertToPath();
        }
      }

      /**
       * convert star to path
       */
      convertStarToPath() {
        let numPts = Math.floor(this.pt.v) * 2;
        let angle = (Math.PI * 2) / numPts;
        /* this.v.v.length = numPts;
                  this.v.i.length = numPts;
                  this.v.o.length = numPts;*/
        let longFlag = true;
        let longRad = this.or.v;
        let shortRad = this.ir.v;
        let longRound = this.os.v;
        let shortRound = this.is.v;
        let longPerimSegment = (2 * Math.PI * longRad) / (numPts * 2);
        let shortPerimSegment = (2 * Math.PI * shortRad) / (numPts * 2);
        let i;
        let rad;
        let roundness;
        let perimSegment;
        let currentAng = -Math.PI / 2;
        currentAng += this.r.v;
        let dir = this.data.d === 3 ? -1 : 1;
        this.v._length = 0;
        for (i = 0; i < numPts; i += 1) {
          rad = longFlag ? longRad : shortRad;
          roundness = longFlag ? longRound : shortRound;
          perimSegment = longFlag ? longPerimSegment : shortPerimSegment;
          let x = rad * Math.cos(currentAng);
          let y = rad * Math.sin(currentAng);
          let ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
          let oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
          x += +this.p.v[0];
          y += +this.p.v[1];
          this.v.setTripleAt(
            x,
            y,
            x - ox * perimSegment * roundness * dir,
            y - oy * perimSegment * roundness * dir,
            x + ox * perimSegment * roundness * dir,
            y + oy * perimSegment * roundness * dir,
            i,
            true,
          );

          /* this.v.v[i] = [x,y];
                      this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                      this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];
                      this.v._length = numPts;*/
          longFlag = !longFlag;
          currentAng += angle * dir;
        }
      }

      /**
       * convert polygon to path
       */
      convertPolygonToPath() {
        let numPts = Math.floor(this.pt.v);
        let angle = (Math.PI * 2) / numPts;
        let rad = this.or.v;
        let roundness = this.os.v;
        let perimSegment = (2 * Math.PI * rad) / (numPts * 4);
        let i;
        let currentAng = -Math.PI / 2;
        let dir = this.data.d === 3 ? -1 : 1;
        currentAng += this.r.v;
        this.v._length = 0;
        for (i = 0; i < numPts; i += 1) {
          let x = rad * Math.cos(currentAng);
          let y = rad * Math.sin(currentAng);
          let ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
          let oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
          x += +this.p.v[0];
          y += +this.p.v[1];
          this.v.setTripleAt(
            x,
            y,
            x - ox * perimSegment * roundness * dir,
            y - oy * perimSegment * roundness * dir,
            x + ox * perimSegment * roundness * dir,
            y + oy * perimSegment * roundness * dir,
            i,
            true,
          );
          currentAng += angle * dir;
        }
        this.paths.length = 0;
        this.paths[0] = this.v;
      }
    }

    const roundCorner = 0.5519;
    const cPoint = roundCorner;

    /**
     * rect shape property
     * @private
     */
    class RectShapeProperty extends DynamicPropertyContainer {
      /**
       * constructor rect shape property
       * @param {*} elem element node
       * @param {*} data shape value property data
       */
      constructor(elem, data) {
        super();
        this.v = ShapePool.newElement();
        this.v.c = true;
        this.localShapeCollection = ShapeCollectionPool.newShapeCollection();
        this.localShapeCollection.addShape(this.v);
        this.paths = this.localShapeCollection;
        this.elem = elem;
        this.comp = elem.comp;
        this.frameId = -1;
        this.d = data.d;
        this.initDynamicPropertyContainer(elem);
        this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
        this.s = PropertyFactory.getProp(elem, data.s, 1, 0, this);
        this.r = PropertyFactory.getProp(elem, data.r, 0, 0, this);
        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.k = false;
          this.convertRectToPath();
        }
      }

      /**
       * reset shape
       */
      reset() {
        this.paths = this.localShapeCollection;
      }

      /**
       * get point with frameId
       * @param {*} frameNum frame number
       */
      getValue(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties(frameNum);

        if (this._mdf) {
          this.convertRectToPath();
        }
      }

      /**
       * convert rect to path
       */
      convertRectToPath() {
        let p0 = this.p.v[0];
        let p1 = this.p.v[1];
        let v0 = this.s.v[0] / 2;
        let v1 = this.s.v[1] / 2;
        let round = Math.min(v0, v1, this.r.v);
        let cPoint = round * (1 - roundCorner);
        this.v._length = 0;

        if (this.d === 2 || this.d === 1) {
          this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, 0, true);
          this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, p0 + v0, p1 + v1 - round, 1, true);
          if (round !== 0) {
            this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, 2, true);
            this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0 + round, p1 + v1, 3, true);
            this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, 4, true);
            this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1 + round, 5, true);
            this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, 6, true);
            this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, p0 + v0 - round, p1 - v1, 7, true);
          } else {
            this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0, p1 + v1, 2);
            this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1, 3);
          }
        } else {
          this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, p0 + v0, p1 - v1 + round, 0, true);
          if (round !== 0) {
            this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, 1, true);
            this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0 + round, p1 - v1, 2, true);
            this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, 3, true);
            this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1 - round, 4, true);
            this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, 5, true);
            this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0 - round, p1 + v1, 6, true);
            this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, 7, true);
          } else {
            this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0, p1 - v1, 1, true);
            this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1, 2, true);
            this.v.setTripleAt(p0 + v0, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0, p1 + v1, 3, true);
          }
        }
      }
    }

    /**
     * get shape prop with data
     * @private
     * @param {*} elem element node
     * @param {*} data shape value property data
     * @param {*} type lottie shape type
     * @return {*}
     */
    function getShapeProp(elem, data, type) {
      let prop;
      if (type === 3 || type === 4) {
        const dataProp = type === 3 ? data.pt : data.ks;
        const keys = dataProp.k;
        if (keys.length) {
          prop = new KeyframedShapeProperty(elem, data, type);
        } else {
          prop = new ShapeProperty(elem, data, type);
        }
      } else if (type === 5) {
        prop = new RectShapeProperty(elem, data);
      } else if (type === 6) {
        prop = new EllShapeProperty(elem, data);
      } else if (type === 7) {
        prop = new StarShapeProperty(elem, data);
      }
      if (prop.k) {
        // FIXME: maybe not needed
        elem.addDynamicProperty(prop);
      }
      return prop;
    }

    /**
     * get ShapeProperty class
     * @private
     * @return {ShapeProperty}
     */
    function getConstructorFunction() {
      return ShapeProperty;
    }

    /**
     * get KeyframedShapeProperty class
     * @private
     * @return {KeyframedShapeProperty}
     */
    function getKeyframedConstructorFunction() {
      return KeyframedShapeProperty;
    }

    var ShapePropertyFactory = {getShapeProp, getConstructorFunction, getKeyframedConstructorFunction};

    // import {

    /**
     * a
     * @private
     */
    class MaskFrames extends DynamicPropertyContainer {
      /**
       * a
       * @param {*} elem a
       * @param {*} masksProperties a
       * @param {*} session a
       */
      constructor(elem, masksProperties, session) {
        super();
        this.frameId = -1;
        this.elem = elem;
        this.session = session;
        this.masksProperties = masksProperties || [];
        this.initDynamicPropertyContainer(elem);
        this.viewData = createSizedArray(this.masksProperties.length);
        const len = this.masksProperties.length;
        let hasMasks = false;
        for (let i = 0; i < len; i++) {
          if (this.masksProperties[i].mode !== 'n') {
            hasMasks = true;
          }
          this.viewData[i] = ShapePropertyFactory.getShapeProp(this, this.masksProperties[i], 3);
          this.viewData[i].inv = this.masksProperties[i].inv;
        }
        this.hasMasks = hasMasks;
      }

      /**
       * a
       * @param {number} frameNum frameNum
       */
      getValue(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }

        this.iterateDynamicProperties(frameNum);

        this.frameId = frameNum;
      }
    }

    /* eslint-disable */
    /*!
       Transformation Matrix v2.0
       (c) Epistemex 2014-2015
       www.epistemex.com
       By Ken Fyrstenberg
       Contributions by leeoniya.
       License: MIT, header required.
       */

    /**
     * 2D transformation matrix object initialized with identity matrix.
     *
     * The matrix can synchronize a canvas context by supplying the context
     * as an argument, or later apply current absolute transform to an
     * existing context.
     *
     * All values are handled as floating point values.
     *
     * @private
     * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
     * @prop {number} a - scale x
     * @prop {number} b - shear y
     * @prop {number} c - shear x
     * @prop {number} d - scale y
     * @prop {number} e - translate x
     * @prop {number} f - translate y
     * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
     * @constructor
     */

    var Matrix = (function () {
      var _cos = Math.cos;
      var _sin = Math.sin;
      var _tan = Math.tan;
      var _rnd = Math.round;

      function reset() {
        this.props[0] = 1;
        this.props[1] = 0;
        this.props[2] = 0;
        this.props[3] = 0;
        this.props[4] = 0;
        this.props[5] = 1;
        this.props[6] = 0;
        this.props[7] = 0;
        this.props[8] = 0;
        this.props[9] = 0;
        this.props[10] = 1;
        this.props[11] = 0;
        this.props[12] = 0;
        this.props[13] = 0;
        this.props[14] = 0;
        this.props[15] = 1;
        return this;
      }

      function rotate(angle) {
        if (angle === 0) {
          return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      }

      function rotateX(angle) {
        if (angle === 0) {
          return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(1, 0, 0, 0, 0, mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1);
      }

      function rotateY(angle) {
        if (angle === 0) {
          return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos, 0, mSin, 0, 0, 1, 0, 0, -mSin, 0, mCos, 0, 0, 0, 0, 1);
      }

      function rotateZ(angle) {
        if (angle === 0) {
          return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      }

      function shear(sx, sy) {
        return this._t(1, sy, sx, 1, 0, 0);
      }

      function skew(ax, ay) {
        return this.shear(_tan(ax), _tan(ay));
      }

      function skewFromAxis(ax, angle) {
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos, mSin, 0, 0, -mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
          ._t(1, 0, 0, 0, _tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
          ._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        //return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, _tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
      }

      function scale(sx, sy, sz) {
        if (!sz && sz !== 0) {
          sz = 1;
        }
        if (sx === 1 && sy === 1 && sz === 1) {
          return this;
        }
        return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
      }

      function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
        this.props[0] = a;
        this.props[1] = b;
        this.props[2] = c;
        this.props[3] = d;
        this.props[4] = e;
        this.props[5] = f;
        this.props[6] = g;
        this.props[7] = h;
        this.props[8] = i;
        this.props[9] = j;
        this.props[10] = k;
        this.props[11] = l;
        this.props[12] = m;
        this.props[13] = n;
        this.props[14] = o;
        this.props[15] = p;
        return this;
      }

      function translate(tx, ty, tz) {
        tz = tz || 0;
        if (tx !== 0 || ty !== 0 || tz !== 0) {
          return this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1);
        }
        return this;
      }

      function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {
        var _p = this.props;

        if (
          a2 === 1 &&
          b2 === 0 &&
          c2 === 0 &&
          d2 === 0 &&
          e2 === 0 &&
          f2 === 1 &&
          g2 === 0 &&
          h2 === 0 &&
          i2 === 0 &&
          j2 === 0 &&
          k2 === 1 &&
          l2 === 0
        ) {
          //NOTE: commenting this condition because TurboFan deoptimizes code when present
          //if(m2 !== 0 || n2 !== 0 || o2 !== 0){
          _p[12] = _p[12] * a2 + _p[15] * m2;
          _p[13] = _p[13] * f2 + _p[15] * n2;
          _p[14] = _p[14] * k2 + _p[15] * o2;
          _p[15] = _p[15] * p2;
          //}
          this._identityCalculated = false;
          return this;
        }

        var a1 = _p[0];
        var b1 = _p[1];
        var c1 = _p[2];
        var d1 = _p[3];
        var e1 = _p[4];
        var f1 = _p[5];
        var g1 = _p[6];
        var h1 = _p[7];
        var i1 = _p[8];
        var j1 = _p[9];
        var k1 = _p[10];
        var l1 = _p[11];
        var m1 = _p[12];
        var n1 = _p[13];
        var o1 = _p[14];
        var p1 = _p[15];

        /* matrix order (canvas compatible):
         * ace
         * bdf
         * 001
         */
        _p[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
        _p[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2;
        _p[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2;
        _p[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2;

        _p[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2;
        _p[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2;
        _p[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2;
        _p[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2;

        _p[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2;
        _p[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2;
        _p[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2;
        _p[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2;

        _p[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2;
        _p[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2;
        _p[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2;
        _p[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2;

        this._identityCalculated = false;
        return this;
      }

      function isIdentity() {
        if (!this._identityCalculated) {
          this._identity = !(
            this.props[0] !== 1 ||
            this.props[1] !== 0 ||
            this.props[2] !== 0 ||
            this.props[3] !== 0 ||
            this.props[4] !== 0 ||
            this.props[5] !== 1 ||
            this.props[6] !== 0 ||
            this.props[7] !== 0 ||
            this.props[8] !== 0 ||
            this.props[9] !== 0 ||
            this.props[10] !== 1 ||
            this.props[11] !== 0 ||
            this.props[12] !== 0 ||
            this.props[13] !== 0 ||
            this.props[14] !== 0 ||
            this.props[15] !== 1
          );
          this._identityCalculated = true;
        }
        return this._identity;
      }

      function equals(matr) {
        var i = 0;
        while (i < 16) {
          if (matr.props[i] !== this.props[i]) {
            return false;
          }
          i += 1;
        }
        return true;
      }

      function clone(matr) {
        var i;
        for (i = 0; i < 16; i += 1) {
          matr.props[i] = this.props[i];
        }
      }

      function cloneFromProps(props) {
        var i;
        for (i = 0; i < 16; i += 1) {
          this.props[i] = props[i];
        }
      }

      function applyToPoint(x, y, z) {
        return {
          x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
          y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
          z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14],
        };
        /*return {
               x: x * me.a + y * me.c + me.e,
               y: x * me.b + y * me.d + me.f
               };*/
      }
      function applyToX(x, y, z) {
        return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
      }
      function applyToY(x, y, z) {
        return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
      }
      function applyToZ(x, y, z) {
        return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
      }

      function inversePoint(pt) {
        var determinant = this.props[0] * this.props[5] - this.props[1] * this.props[4];
        var a = this.props[5] / determinant;
        var b = -this.props[1] / determinant;
        var c = -this.props[4] / determinant;
        var d = this.props[0] / determinant;
        var e = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / determinant;
        var f = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / determinant;
        return [pt[0] * a + pt[1] * c + e, pt[0] * b + pt[1] * d + f, 0];
      }

      function inversePoints(pts) {
        var i,
          len = pts.length,
          retPts = [];
        for (i = 0; i < len; i += 1) {
          retPts[i] = inversePoint(pts[i]);
        }
        return retPts;
      }

      function applyToTriplePoints(pt1, pt2, pt3) {
        var arr = createTypedArray('float32', 6);
        if (this.isIdentity()) {
          arr[0] = pt1[0];
          arr[1] = pt1[1];
          arr[2] = pt2[0];
          arr[3] = pt2[1];
          arr[4] = pt3[0];
          arr[5] = pt3[1];
        } else {
          var p0 = this.props[0],
            p1 = this.props[1],
            p4 = this.props[4],
            p5 = this.props[5],
            p12 = this.props[12],
            p13 = this.props[13];
          arr[0] = pt1[0] * p0 + pt1[1] * p4 + p12;
          arr[1] = pt1[0] * p1 + pt1[1] * p5 + p13;
          arr[2] = pt2[0] * p0 + pt2[1] * p4 + p12;
          arr[3] = pt2[0] * p1 + pt2[1] * p5 + p13;
          arr[4] = pt3[0] * p0 + pt3[1] * p4 + p12;
          arr[5] = pt3[0] * p1 + pt3[1] * p5 + p13;
        }
        return arr;
      }

      function applyToPointArray(x, y, z) {
        var arr;
        if (this.isIdentity()) {
          arr = [x, y, z];
        } else {
          arr = [
            x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
            x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
            x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14],
          ];
        }
        return arr;
      }

      function applyToPointStringified(x, y) {
        if (this.isIdentity()) {
          return x + ',' + y;
        }
        var _p = this.props;
        return (
          Math.round((x * _p[0] + y * _p[4] + _p[12]) * 100) / 100 + ',' + Math.round((x * _p[1] + y * _p[5] + _p[13]) * 100) / 100
        );
      }

      function toCSS() {
        //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.
        /*if(this.isIdentity()) {
                  return '';
              }*/
        var i = 0;
        var props = this.props;
        var cssValue = 'matrix3d(';
        var v = 10000;
        while (i < 16) {
          cssValue += _rnd(props[i] * v) / v;
          cssValue += i === 15 ? ')' : ',';
          i += 1;
        }
        return cssValue;
      }

      function roundMatrixProperty(val) {
        var v = 10000;
        if ((val < 0.000001 && val > 0) || (val > -0.000001 && val < 0)) {
          return _rnd(val * v) / v;
        }
        return val;
      }

      function to2dCSS() {
        //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.
        /*if(this.isIdentity()) {
                  return '';
              }*/
        var props = this.props;
        var _a = roundMatrixProperty(props[0]);
        var _b = roundMatrixProperty(props[1]);
        var _c = roundMatrixProperty(props[4]);
        var _d = roundMatrixProperty(props[5]);
        var _e = roundMatrixProperty(props[12]);
        var _f = roundMatrixProperty(props[13]);
        return 'matrix(' + _a + ',' + _b + ',' + _c + ',' + _d + ',' + _e + ',' + _f + ')';
      }

      return function () {
        this.reset = reset;
        this.rotate = rotate;
        this.rotateX = rotateX;
        this.rotateY = rotateY;
        this.rotateZ = rotateZ;
        this.skew = skew;
        this.skewFromAxis = skewFromAxis;
        this.shear = shear;
        this.scale = scale;
        this.setTransform = setTransform;
        this.translate = translate;
        this.transform = transform;
        this.applyToPoint = applyToPoint;
        this.applyToX = applyToX;
        this.applyToY = applyToY;
        this.applyToZ = applyToZ;
        this.applyToPointArray = applyToPointArray;
        this.applyToTriplePoints = applyToTriplePoints;
        this.applyToPointStringified = applyToPointStringified;
        this.toCSS = toCSS;
        this.to2dCSS = to2dCSS;
        this.clone = clone;
        this.cloneFromProps = cloneFromProps;
        this.equals = equals;
        this.inversePoints = inversePoints;
        this.inversePoint = inversePoint;
        this._t = this.transform;
        this.isIdentity = isIdentity;
        this._identity = true;
        this._identityCalculated = false;

        this.props = createTypedArray('float32', 16);
        this.reset();
      };
    })();

    /**
     * a
     * @private
     */
    class ShapeTransformManager {
      /**
       * a
       */
      constructor() {
        this.sequences = {};
        this.sequenceList = [];
        this.transform_key_count = 0;
      }

      /**
       * a
       * @param {*} transforms a
       * @return {*}
       */
      addTransformSequence(transforms) {
        const len = transforms.length;
        let key = '_';
        for (let i = 0; i < len; i += 1) {
          key += transforms[i].transform.key + '_';
        }
        let sequence = this.sequences[key];
        if (!sequence) {
          sequence = {
            transforms: [].concat(transforms),
            finalTransform: new Matrix(),
            _mdf: false,
          };
          this.sequences[key] = sequence;
          this.sequenceList.push(sequence);
        }
        return sequence;
      }

      /**
       * a
       * @param {*} sequence a
       * @param {*} isFirstFrame a
       */
      processSequence(sequence, isFirstFrame) {
        let i = 0;
        let _mdf = isFirstFrame;
        const len = sequence.transforms.length;
        while (i < len && !isFirstFrame) {
          if (sequence.transforms[i].transform.mProps._mdf) {
            _mdf = true;
            break;
          }
          i += 1;
        }
        if (_mdf) {
          let props;
          sequence.finalTransform.reset();
          for (i = len - 1; i >= 0; i -= 1) {
            props = sequence.transforms[i].transform.mProps.v.props;
            sequence.finalTransform.transform(
              props[0],
              props[1],
              props[2],
              props[3],
              props[4],
              props[5],
              props[6],
              props[7],
              props[8],
              props[9],
              props[10],
              props[11],
              props[12],
              props[13],
              props[14],
              props[15],
            );
          }
        }
        sequence._mdf = _mdf;
      }

      /**
       * a
       * @param {*} isFirstFrame a
       */
      processSequences(isFirstFrame) {
        const len = this.sequenceList.length;
        for (let i = 0; i < len; i += 1) {
          this.processSequence(this.sequenceList[i], isFirstFrame);
        }
      }

      /**
       * a
       * @return {*}
       */
      getNewKey() {
        return '_' + this.transform_key_count++;
      }
    }

    /**
     * ProcessedElement class
     * @private
     */
    class ProcessedElement {
      /**
       * constructor processed elem
       * @param {*} elem
       * @param {*} position
       */
      constructor(elem, position) {
        this.elem = elem;
        this.pos = position;
      }
    }

    /**
     * ShapeData class
     * @private
     */
    class ShapeData {
      /**
       * constructor ShapeData
       * @param {*} element a
       * @param {*} data a
       * @param {*} styles a
       * @param {*} transformsManager a
       */
      constructor(element, data, styles, transformsManager) {
        this.styledShapes = [];
        this.tr = [0, 0, 0, 0, 0, 0];
        let ty = 4;
        if (data.ty == 'rc') {
          ty = 5;
        } else if (data.ty == 'el') {
          ty = 6;
        } else if (data.ty == 'sr') {
          ty = 7;
        }
        this.sh = ShapePropertyFactory.getShapeProp(element, data, ty);
        const len = styles.length;
        for (let i = 0; i < len; i += 1) {
          if (!styles[i].closed) {
            const styledShape = {
              transforms: transformsManager.addTransformSequence(styles[i].transforms),
              trNodes: [],
            };
            this.styledShapes.push(styledShape);
            styles[i].elements.push(styledShape);
          }
        }
      }

      /**
       * set as animated
       */
      setAsAnimated() {
        this._isAnimated = true;
      }
    }

    /**
     * @namespace DisplayRegister
     */
    const display = {};

    /**
     * enum display element type for lottie layer
     * @enum {string}
     * @alias DisplayRegister.Type
     * @memberof DisplayRegister
     */
    const Type$1 = {
      Null: 'Null',
      Path: 'Path',
      Shape: 'Shape',
      Solid: 'Solid',
      Sprite: 'Sprite',
      Component: 'Component',
      Container: 'Container',
    };

    /**
     * register display by type
     * @param {DisplayRegister.Type} type display type
     * @param {DisplayClass} displayClass display class
     * @alias registerDisplayByType
     * @memberof DisplayRegister
     */
    function registerDisplayByType(type, displayClass) {
      display[type] = displayClass;
    }

    /**
     * get display by type
     * @param {DisplayRegister.Type} type display type
     * @return {DisplayClass} DisplayClass display class
     * @alias getDisplayByType
     * @memberof DisplayRegister
     */
    function getDisplayByType(type) {
      return display[type];
    }

    var DisplayRegister = {Type: Type$1, registerDisplayByType};

    /**
     * a
     * @private
     */
    class PathPaint {
      /**
       * constructor style element
       * @param {*} elem item data
       * @param {*} data item data
       * @param {*} transforms transforms array
       */
      constructor(elem, data, transforms) {
        this.elem = elem;
        this.data = data;
        this.type = data.ty;
        this.preTransforms = transforms;
        this.transforms = [];
        this.elements = [];
        this.closed = data.hd === true;

        this.displayType = DisplayRegister.Type.Path;
        const DisplayClass = getDisplayByType(this.displayType);
        this.display = new DisplayClass(this, data);
        if (this.elem.innerDisplay) {
          this.elem.innerDisplay.addChild(this.display);
        } else {
          this.elem.display.addChild(this.display);
        }
      }

      /**
       * a
       */
      updateGrahpics() {
        this.display.updateLottieGrahpics(this);
      }
    }

    /**
     * transform property origin from tr
     * @private
     */
    class TransformProperty extends DynamicPropertyContainer {
      /**
       * constructor about transform property
       * @param {*} elem element node
       * @param {*} data multidimensional value property data
       * @param {*} container value property container
       */
      constructor(elem, data, container) {
        super();
        this.elem = elem;
        this.frameId = -1;
        this.propType = 'transform';
        this.data = data;
        this.v = new Matrix();
        // Precalculated matrix with non animated properties
        this.pre = new Matrix();
        this.appliedTransformations = 0;
        this.initDynamicPropertyContainer(container || elem);
        if (data.p && data.p.s) {
          this.px = PropertyFactory.getProp(elem, data.p.x, 0, 0, this);
          this.py = PropertyFactory.getProp(elem, data.p.y, 0, 0, this);
          if (data.p.z) {
            this.pz = PropertyFactory.getProp(elem, data.p.z, 0, 0, this);
          }
        } else {
          this.p = PropertyFactory.getProp(elem, data.p || {k: [0, 0, 0]}, 1, 0, this);
        }
        if (data.rx) {
          this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, this);
          this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, this);
          this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, this);
          if (data.or.k[0].ti) {
            let i;
            let len = data.or.k.length;
            for (i = 0; i < len; i += 1) {
              data.or.k[i].to = data.or.k[i].ti = null;
            }
          }
          this.or = PropertyFactory.getProp(elem, data.or, 1, degToRads, this);
          // sh Indicates it needs to be capped between -180 and 180
          this.or.sh = true;
        } else {
          this.r = PropertyFactory.getProp(elem, data.r || {k: 0}, 0, degToRads, this);
        }
        if (data.sk) {
          this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, this);
          this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, this);
        }
        this.a = PropertyFactory.getProp(elem, data.a || {k: [0, 0, 0]}, 1, 0, this);
        this.s = PropertyFactory.getProp(elem, data.s || {k: [100, 100, 100]}, 1, 0.01, this);
        // Opacity is not part of the transform properties, that's why it won't use this.dynamicProperties. That way transforms won't get updated if opacity changes.
        if (data.o) {
          this.o = PropertyFactory.getProp(elem, data.o, 0, 0.01, elem);
        } else {
          this.o = {_mdf: false, v: 1};
        }
        this._isDirty = true;
        if (!this.dynamicProperties.length) {
          this.getValue(initialDefaultFrame, true);
        }
      }

      /**
       * add Dynamic Property
       * @param {*} prop Dynamic Property
       */
      // addDynamicProperty(prop) {
      //   super.addDynamicProperty(prop);
      //   this.elem.addDynamicProperty(prop);
      //   this._isDirty = true;
      // }

      /**
       * get transform
       * @param {*} frameNum a
       * @param {Boolean} forceRender force render
       */
      getValue(frameNum, forceRender) {
        if (frameNum === this.frameId) {
          return;
        }
        if (this._isDirty) {
          this.precalculateMatrix();
          this._isDirty = false;
        }

        this.iterateDynamicProperties();

        if (this._mdf || forceRender) {
          this.v.cloneFromProps(this.pre.props);
          if (this.appliedTransformations < 1) {
            this.v.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
          }
          if (this.appliedTransformations < 2) {
            this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
          }
          if (this.sk && this.appliedTransformations < 3) {
            this.v.skewFromAxis(-this.sk.v, this.sa.v);
          }
          if (this.r && this.appliedTransformations < 4) {
            this.v.rotate(-this.r.v);
          } else if (!this.r && this.appliedTransformations < 4) {
            this.v
              .rotateZ(-this.rz.v)
              .rotateY(this.ry.v)
              .rotateX(this.rx.v)
              .rotateZ(-this.or.v[2])
              .rotateY(this.or.v[1])
              .rotateX(this.or.v[0]);
          }
          if (this.autoOriented) {
            let v1;
            let v2;
            // FIXME: should use frame interval
            const frameRate = this.elem.globalData.frameRate;
            if (this.p && this.p.keyframes && this.p.getValueAtTime) {
              if (this.p._caching.lastFrame + this.p.offsetTime <= this.p.keyframes[0].t) {
                v1 = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / frameRate, 0);
                v2 = this.p.getValueAtTime(this.p.keyframes[0].t / frameRate, 0);
              } else if (this.p._caching.lastFrame + this.p.offsetTime >= this.p.keyframes[this.p.keyframes.length - 1].t) {
                v1 = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t / frameRate, 0);
                v2 = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.05) / frameRate, 0);
              } else {
                v1 = this.p.pv;
                v2 = this.p.getValueAtTime((this.p._caching.lastFrame + this.p.offsetTime - 0.01) / frameRate, this.p.offsetTime);
              }
            } else if (this.px && this.px.keyframes && this.py.keyframes && this.px.getValueAtTime && this.py.getValueAtTime) {
              v1 = [];
              v2 = [];
              let px = this.px;
              let py = this.py;
              if (px._caching.lastFrame + px.offsetTime <= px.keyframes[0].t) {
                v1[0] = px.getValueAtTime((px.keyframes[0].t + 0.01) / frameRate, 0);
                v1[1] = py.getValueAtTime((py.keyframes[0].t + 0.01) / frameRate, 0);
                v2[0] = px.getValueAtTime(px.keyframes[0].t / frameRate, 0);
                v2[1] = py.getValueAtTime(py.keyframes[0].t / frameRate, 0);
              } else if (px._caching.lastFrame + px.offsetTime >= px.keyframes[px.keyframes.length - 1].t) {
                v1[0] = px.getValueAtTime(px.keyframes[px.keyframes.length - 1].t / frameRate, 0);
                v1[1] = py.getValueAtTime(py.keyframes[py.keyframes.length - 1].t / frameRate, 0);
                v2[0] = px.getValueAtTime((px.keyframes[px.keyframes.length - 1].t - 0.01) / frameRate, 0);
                v2[1] = py.getValueAtTime((py.keyframes[py.keyframes.length - 1].t - 0.01) / frameRate, 0);
              } else {
                v1 = [px.pv, py.pv];
                v2[0] = px.getValueAtTime((px._caching.lastFrame + px.offsetTime - 0.01) / frameRate, px.offsetTime);
                v2[1] = py.getValueAtTime((py._caching.lastFrame + py.offsetTime - 0.01) / frameRate, py.offsetTime);
              }
            } else {
              v1 = v2 = defaultVector;
            }
            this.v.rotate(-Math.atan2(v1[1] - v2[1], v1[0] - v2[0]));
          }
          if (this.data.p && this.data.p.s) {
            if (this.data.p.z) {
              this.v.translate(this.px.v, this.py.v, -this.pz.v);
            } else {
              this.v.translate(this.px.v, this.py.v, 0);
            }
          } else {
            this.v.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
          }
        }
        this.frameId = frameNum;
      }

      /**
       * pre calculate matrix for performance
       */
      precalculateMatrix() {
        if (!this.a.k) {
          this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
          this.appliedTransformations = 1;
        } else {
          return;
        }
        if (!this.s.effectsSequence.length) {
          this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
          this.appliedTransformations = 2;
        } else {
          return;
        }
        if (this.sk) {
          if (!this.sk.effectsSequence.length && !this.sa.effectsSequence.length) {
            this.pre.skewFromAxis(-this.sk.v, this.sa.v);
            this.appliedTransformations = 3;
          } else {
            return;
          }
        }
        if (this.r) {
          if (!this.r.effectsSequence.length) {
            this.pre.rotate(-this.r.v);
            this.appliedTransformations = 4;
          } else {
            return;
          }
        } else if (
          !this.rz.effectsSequence.length &&
          !this.ry.effectsSequence.length &&
          !this.rx.effectsSequence.length &&
          !this.or.effectsSequence.length
        ) {
          this.pre
            .rotateZ(-this.rz.v)
            .rotateY(this.ry.v)
            .rotateX(this.rx.v)
            .rotateZ(-this.or.v[2])
            .rotateY(this.or.v[1])
            .rotateX(this.or.v[0]);
          this.appliedTransformations = 4;
        }
      }

      /**
       * apply a matrix
       * @param {*} mat matrix
       */
      applyToMatrix(mat) {
        let _mdf = this._mdf;
        this.iterateDynamicProperties();
        this._mdf = this._mdf || _mdf;
        if (this.a) {
          mat.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
        }
        if (this.s) {
          mat.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
        }
        if (this.sk) {
          mat.skewFromAxis(-this.sk.v, this.sa.v);
        }
        if (this.r) {
          mat.rotate(-this.r.v);
        } else {
          mat
            .rotateZ(-this.rz.v)
            .rotateY(this.ry.v)
            .rotateX(this.rx.v)
            .rotateZ(-this.or.v[2])
            .rotateY(this.or.v[1])
            .rotateX(this.or.v[0]);
        }
        if (this.data.p.s) {
          if (this.data.p.z) {
            mat.translate(this.px.v, this.py.v, -this.pz.v);
          } else {
            mat.translate(this.px.v, this.py.v, 0);
          }
        } else {
          mat.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
        }
      }
    }

    /**
     * get a transform property
     * @private
     * @param {*} elem element node
     * @param {*} data multidimensional value property data
     * @param {*} container value property container
     * @return {TransformProperty}
     */
    function getTransformProperty(elem, data, container) {
      return new TransformProperty(elem, data, container);
    }

    // export default { getTransformProperty };

    /**
     * a
     * @private
     */
    class ShapeModifier extends DynamicPropertyContainer {
      /**
       * a
       */
      initModifierProperties() {}

      /**
       * a
       */
      addShapeToModifier() {}

      /**
       * a
       * @param {*} data a
       */
      addShape(data) {
        if (!this.closed) {
          // Adding shape to dynamic properties. It covers the case where a shape has no effects applied, to reset it's _mdf state on every tick.
          data.sh.container.addDynamicProperty(data.sh);

          const shapeData = {shape: data.sh, data: data, localShapeCollection: ShapeCollectionPool.newShapeCollection()};
          this.shapes.push(shapeData);
          this.addShapeToModifier(shapeData);
          if (this._isAnimated) {
            data.setAsAnimated();
          }
        }
      }

      /**
       * a
       * @param {*} elem a
       * @param {*} data a
       */
      init(elem, data) {
        this.shapes = [];
        this.elem = elem;
        this.initDynamicPropertyContainer(elem);
        this.initModifierProperties(elem, data);
        this.frameId = initialDefaultFrame;
        this.closed = false;
        this.k = false;
        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.getValue(true);
        }
      }

      /**
       * process keys
       * @param {number} frameNum frameNum
       */
      processKeys(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties(frameNum);
      }
    }

    /**
     * TrimModifier class
     * @private
     */
    class TrimModifier extends ShapeModifier {
      /**
       * init modifier properties
       * @param {*} elem element node
       * @param {*} data trim value property data
       */
      initModifierProperties(elem, data) {
        this.s = PropertyFactory.getProp(elem, data.s, 0, 0.01, this);
        this.e = PropertyFactory.getProp(elem, data.e, 0, 0.01, this);
        this.o = PropertyFactory.getProp(elem, data.o, 0, 0, this);
        this.sValue = 0;
        this.eValue = 0;
        this.getValue = this.processKeys;
        this.m = data.m;
        this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
      }

      /**
       * add shape to modifier
       * @param {*} shapeData shape data
       */
      addShapeToModifier(shapeData) {
        shapeData.pathsData = [];
      }

      /**
       * calculate shape edges
       * @param {*} s trim start
       * @param {*} e trim end
       * @param {*} shapeLength shape length
       * @param {*} addedLength added length
       * @param {*} totalModifierLength total modifier length
       * @return {*}
       */
      calculateShapeEdges(s, e, shapeLength, addedLength, totalModifierLength) {
        let segments = [];
        if (e <= 1) {
          segments.push({
            s: s,
            e: e,
          });
        } else if (s >= 1) {
          segments.push({
            s: s - 1,
            e: e - 1,
          });
        } else {
          segments.push({
            s: s,
            e: 1,
          });
          segments.push({
            s: 0,
            e: e - 1,
          });
        }
        let shapeSegments = [];
        let i;
        let len = segments.length;
        let segmentOb;
        for (i = 0; i < len; i += 1) {
          segmentOb = segments[i];
          if (segmentOb.e * totalModifierLength < addedLength || segmentOb.s * totalModifierLength > addedLength + shapeLength);
          else {
            let shapeS;
            let shapeE;
            if (segmentOb.s * totalModifierLength <= addedLength) {
              shapeS = 0;
            } else {
              shapeS = (segmentOb.s * totalModifierLength - addedLength) / shapeLength;
            }
            if (segmentOb.e * totalModifierLength >= addedLength + shapeLength) {
              shapeE = 1;
            } else {
              shapeE = (segmentOb.e * totalModifierLength - addedLength) / shapeLength;
            }
            shapeSegments.push([shapeS, shapeE]);
          }
        }
        if (!shapeSegments.length) {
          shapeSegments.push([0, 0]);
        }
        return shapeSegments;
      }

      /**
       * release paths data
       * @param {*} pathsData paths data
       * @return {*}
       */
      releasePathsData(pathsData) {
        const len = pathsData.length;
        for (let i = 0; i < len; i += 1) {
          SegmentsLengthPool.release(pathsData[i]);
        }
        pathsData.length = 0;
        return pathsData;
      }

      /**
       * a
       * @param {*} _isFirstFrame a
       */
      processShapes(_isFirstFrame) {
        let s;
        let e;
        if (this._mdf || _isFirstFrame) {
          let o = (this.o.v % 360) / 360;
          if (o < 0) {
            o += 1;
          }
          s = (this.s.v > 1 ? 1 : this.s.v < 0 ? 0 : this.s.v) + o;
          e = (this.e.v > 1 ? 1 : this.e.v < 0 ? 0 : this.e.v) + o;
          if (s > e) {
            let _s = s;
            s = e;
            e = _s;
          }
          s = Math.round(s * 10000) * 0.0001;
          e = Math.round(e * 10000) * 0.0001;
          this.sValue = s;
          this.eValue = e;
        } else {
          s = this.sValue;
          e = this.eValue;
        }
        let shapePaths;
        let i;
        let len = this.shapes.length;
        let j;
        let jLen;
        let pathsData;
        let pathData;
        let totalShapeLength;
        let totalModifierLength = 0;

        if (e === s) {
          for (i = 0; i < len; i += 1) {
            this.shapes[i].localShapeCollection.releaseShapes();
            this.shapes[i].shape._mdf = true;
            this.shapes[i].shape.paths = this.shapes[i].localShapeCollection;
            if (this._mdf) {
              this.shapes[i].pathsData.length = 0;
            }
          }
        } else if (!((e === 1 && s === 0) || (e === 0 && s === 1))) {
          let segments = [];
          let shapeData;
          let localShapeCollection;
          for (i = 0; i < len; i += 1) {
            shapeData = this.shapes[i];
            // if shape hasn't changed and trim properties haven't changed, cached previous path can be used
            if (!shapeData.shape._mdf && !this._mdf && !_isFirstFrame && this.m !== 2) {
              shapeData.shape.paths = shapeData.localShapeCollection;
            } else {
              shapePaths = shapeData.shape.paths;
              jLen = shapePaths._length;
              totalShapeLength = 0;
              if (!shapeData.shape._mdf && shapeData.pathsData.length) {
                totalShapeLength = shapeData.totalShapeLength;
              } else {
                pathsData = this.releasePathsData(shapeData.pathsData);
                for (j = 0; j < jLen; j += 1) {
                  pathData = bez.getSegmentsLength(shapePaths.shapes[j]);
                  pathsData.push(pathData);
                  totalShapeLength += pathData.totalLength;
                }
                shapeData.totalShapeLength = totalShapeLength;
                shapeData.pathsData = pathsData;
              }

              totalModifierLength += totalShapeLength;
              shapeData.shape._mdf = true;
            }
          }
          let shapeS = s;
          let shapeE = e;
          let addedLength = 0;
          let edges;
          for (i = len - 1; i >= 0; i -= 1) {
            shapeData = this.shapes[i];
            if (shapeData.shape._mdf) {
              localShapeCollection = shapeData.localShapeCollection;
              localShapeCollection.releaseShapes();
              // if m === 2 means paths are trimmed individually so edges need to be found for this specific shape relative to whoel group
              if (this.m === 2 && len > 1) {
                edges = this.calculateShapeEdges(s, e, shapeData.totalShapeLength, addedLength, totalModifierLength);
                addedLength += shapeData.totalShapeLength;
              } else {
                edges = [[shapeS, shapeE]];
              }
              jLen = edges.length;
              for (j = 0; j < jLen; j += 1) {
                shapeS = edges[j][0];
                shapeE = edges[j][1];
                segments.length = 0;
                if (shapeE <= 1) {
                  segments.push({
                    s: shapeData.totalShapeLength * shapeS,
                    e: shapeData.totalShapeLength * shapeE,
                  });
                } else if (shapeS >= 1) {
                  segments.push({
                    s: shapeData.totalShapeLength * (shapeS - 1),
                    e: shapeData.totalShapeLength * (shapeE - 1),
                  });
                } else {
                  segments.push({
                    s: shapeData.totalShapeLength * shapeS,
                    e: shapeData.totalShapeLength,
                  });
                  segments.push({
                    s: 0,
                    e: shapeData.totalShapeLength * (shapeE - 1),
                  });
                }
                let newShapesData = this.addShapes(shapeData, segments[0]);
                if (segments[0].s !== segments[0].e) {
                  if (segments.length > 1) {
                    let lastShapeInCollection = shapeData.shape.paths.shapes[shapeData.shape.paths._length - 1];
                    if (lastShapeInCollection.c) {
                      let lastShape = newShapesData.pop();
                      this.addPaths(newShapesData, localShapeCollection);
                      newShapesData = this.addShapes(shapeData, segments[1], lastShape);
                    } else {
                      this.addPaths(newShapesData, localShapeCollection);
                      newShapesData = this.addShapes(shapeData, segments[1]);
                    }
                  }
                  this.addPaths(newShapesData, localShapeCollection);
                }
              }
              shapeData.shape.paths = localShapeCollection;
            }
          }
        } else if (this._mdf) {
          for (i = 0; i < len; i += 1) {
            // Releasign Trim Cached paths data when no trim applied in case shapes are modified inbetween.
            // Don't remove this even if it's losing cached info.
            this.shapes[i].pathsData.length = 0;
            this.shapes[i].shape._mdf = true;
          }
        }
      }

      /**
       * add paths
       * @param {*} newPaths new paths
       * @param {*} localShapeCollection local shape collection
       */
      addPaths(newPaths, localShapeCollection) {
        const len = newPaths.length;
        for (let i = 0; i < len; i += 1) {
          localShapeCollection.addShape(newPaths[i]);
        }
      }

      /**
       * add segment
       * @param {*} pt1 point1
       * @param {*} pt2 point2
       * @param {*} pt3 point3
       * @param {*} pt4 point4
       * @param {*} shapePath target shape path
       * @param {*} pos data index
       * @param {*} newShape is new shape ?
       */
      addSegment(pt1, pt2, pt3, pt4, shapePath, pos, newShape) {
        shapePath.setXYAt(pt2[0], pt2[1], 'o', pos);
        shapePath.setXYAt(pt3[0], pt3[1], 'i', pos + 1);
        if (newShape) {
          shapePath.setXYAt(pt1[0], pt1[1], 'v', pos);
        }
        shapePath.setXYAt(pt4[0], pt4[1], 'v', pos + 1);
      }

      /**
       * add segment from points array
       * @param {*} points points
       * @param {*} shapePath target shape path
       * @param {*} pos data index
       * @param {*} newShape is new shape ?
       */
      addSegmentFromArray(points, shapePath, pos, newShape) {
        shapePath.setXYAt(points[1], points[5], 'o', pos);
        shapePath.setXYAt(points[2], points[6], 'i', pos + 1);
        if (newShape) {
          shapePath.setXYAt(points[0], points[4], 'v', pos);
        }
        shapePath.setXYAt(points[3], points[7], 'v', pos + 1);
      }

      /**
       * add shapes to this modifier
       * @param {*} shapeData shape data
       * @param {*} shapeSegment shape segment
       * @param {*} shapePath shape path
       * @return {*}
       */
      addShapes(shapeData, shapeSegment, shapePath) {
        let pathsData = shapeData.pathsData;
        let shapePaths = shapeData.shape.paths.shapes;
        let i;
        let len = shapeData.shape.paths._length;
        let j;
        let jLen;
        let addedLength = 0;
        let currentLengthData;
        let segmentCount;
        let lengths;
        let segment;
        let shapes = [];
        let initPos;
        let newShape = true;
        if (!shapePath) {
          shapePath = ShapePool.newElement();
          segmentCount = 0;
          initPos = 0;
        } else {
          segmentCount = shapePath._length;
          initPos = shapePath._length;
        }
        shapes.push(shapePath);
        for (i = 0; i < len; i += 1) {
          lengths = pathsData[i].lengths;
          shapePath.c = shapePaths[i].c;
          jLen = shapePaths[i].c ? lengths.length : lengths.length + 1;
          for (j = 1; j < jLen; j += 1) {
            currentLengthData = lengths[j - 1];
            if (addedLength + currentLengthData.addedLength < shapeSegment.s) {
              addedLength += currentLengthData.addedLength;
              shapePath.c = false;
            } else if (addedLength > shapeSegment.e) {
              shapePath.c = false;
              break;
            } else {
              if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + currentLengthData.addedLength) {
                this.addSegment(
                  shapePaths[i].v[j - 1],
                  shapePaths[i].o[j - 1],
                  shapePaths[i].i[j],
                  shapePaths[i].v[j],
                  shapePath,
                  segmentCount,
                  newShape,
                );
                newShape = false;
              } else {
                segment = bez.getNewSegment(
                  shapePaths[i].v[j - 1],
                  shapePaths[i].v[j],
                  shapePaths[i].o[j - 1],
                  shapePaths[i].i[j],
                  (shapeSegment.s - addedLength) / currentLengthData.addedLength,
                  (shapeSegment.e - addedLength) / currentLengthData.addedLength,
                  lengths[j - 1],
                );
                this.addSegmentFromArray(segment, shapePath, segmentCount, newShape);
                // this.addSegment(segment.pt1, segment.pt3, segment.pt4, segment.pt2, shapePath, segmentCount, newShape);
                newShape = false;
                shapePath.c = false;
              }
              addedLength += currentLengthData.addedLength;
              segmentCount += 1;
            }
          }
          if (shapePaths[i].c && lengths.length) {
            currentLengthData = lengths[j - 1];
            if (addedLength <= shapeSegment.e) {
              let segmentLength = lengths[j - 1].addedLength;
              if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + segmentLength) {
                this.addSegment(
                  shapePaths[i].v[j - 1],
                  shapePaths[i].o[j - 1],
                  shapePaths[i].i[0],
                  shapePaths[i].v[0],
                  shapePath,
                  segmentCount,
                  newShape,
                );
                newShape = false;
              } else {
                segment = bez.getNewSegment(
                  shapePaths[i].v[j - 1],
                  shapePaths[i].v[0],
                  shapePaths[i].o[j - 1],
                  shapePaths[i].i[0],
                  (shapeSegment.s - addedLength) / segmentLength,
                  (shapeSegment.e - addedLength) / segmentLength,
                  lengths[j - 1],
                );
                this.addSegmentFromArray(segment, shapePath, segmentCount, newShape);
                // this.addSegment(segment.pt1, segment.pt3, segment.pt4, segment.pt2, shapePath, segmentCount, newShape);
                newShape = false;
                shapePath.c = false;
              }
            } else {
              shapePath.c = false;
            }
            addedLength += currentLengthData.addedLength;
            segmentCount += 1;
          }
          if (shapePath._length) {
            shapePath.setXYAt(shapePath.v[initPos][0], shapePath.v[initPos][1], 'i', initPos);
            shapePath.setXYAt(
              shapePath.v[shapePath._length - 1][0],
              shapePath.v[shapePath._length - 1][1],
              'o',
              shapePath._length - 1,
            );
          }
          if (addedLength > shapeSegment.e) {
            break;
          }
          if (i < len - 1) {
            shapePath = ShapePool.newElement();
            newShape = true;
            shapes.push(shapePath);
            segmentCount = 0;
          }
        }
        return shapes;
      }
    }

    const roundCorner$1 = 0.5519;

    /**
     * a
     * @private
     */
    class RoundCornersModifier extends ShapeModifier {
      /**
       * init modifier properties
       * @param {*} elem element node
       * @param {*} data round corners value property data
       */
      initModifierProperties(elem, data) {
        this.getValue = this.processKeys;
        this.rd = PropertyFactory.getProp(elem, data.r, 0, null, this);
        this._isAnimated = !!this.rd.effectsSequence.length;
      }

      /**
       * process path
       * @param {*} path path
       * @param {*} round round
       * @return {*}
       */
      processPath(path, round) {
        const clonedPath = ShapePool.newElement();
        clonedPath.c = path.c;
        let i;
        let len = path._length;
        let currentV;
        let currentI;
        let currentO;
        let closerV;
        // let newV;
        // let newO;
        // let newI;
        let distance;
        let newPosPerc;
        let index = 0;
        let vX;
        let vY;
        let oX;
        let oY;
        let iX;
        let iY;
        for (i = 0; i < len; i += 1) {
          currentV = path.v[i];
          currentO = path.o[i];
          currentI = path.i[i];
          if (
            currentV[0] === currentO[0] &&
            currentV[1] === currentO[1] &&
            currentV[0] === currentI[0] &&
            currentV[1] === currentI[1]
          ) {
            if ((i === 0 || i === len - 1) && !path.c) {
              clonedPath.setTripleAt(currentV[0], currentV[1], currentO[0], currentO[1], currentI[0], currentI[1], index);
              /* clonedPath.v[index] = currentV;
                      clonedPath.o[index] = currentO;
                      clonedPath.i[index] = currentI;*/
              index += 1;
            } else {
              if (i === 0) {
                closerV = path.v[len - 1];
              } else {
                closerV = path.v[i - 1];
              }
              distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
              newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
              vX = iX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
              vY = iY = currentV[1] - (currentV[1] - closerV[1]) * newPosPerc;
              oX = vX - (vX - currentV[0]) * roundCorner$1;
              oY = vY - (vY - currentV[1]) * roundCorner$1;
              clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, index);
              index += 1;

              if (i === len - 1) {
                closerV = path.v[0];
              } else {
                closerV = path.v[i + 1];
              }
              distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
              newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
              vX = oX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
              vY = oY = currentV[1] + (closerV[1] - currentV[1]) * newPosPerc;
              iX = vX - (vX - currentV[0]) * roundCorner$1;
              iY = vY - (vY - currentV[1]) * roundCorner$1;
              clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, index);
              index += 1;
            }
          } else {
            clonedPath.setTripleAt(path.v[i][0], path.v[i][1], path.o[i][0], path.o[i][1], path.i[i][0], path.i[i][1], index);
            index += 1;
          }
        }
        return clonedPath;
      }

      /**
       * process shapes
       * @param {*} _isFirstFrame is first frame
       */
      processShapes(_isFirstFrame) {
        let shapePaths;
        let i;
        let len = this.shapes.length;
        let j;
        let jLen;
        let rd = this.rd.v;

        if (rd !== 0) {
          let shapeData;
          // let newPaths;
          let localShapeCollection;
          for (i = 0; i < len; i += 1) {
            shapeData = this.shapes[i];
            // newPaths = shapeData.shape.paths;
            localShapeCollection = shapeData.localShapeCollection;
            if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
              localShapeCollection.releaseShapes();
              shapeData.shape._mdf = true;
              shapePaths = shapeData.shape.paths.shapes;
              jLen = shapeData.shape.paths._length;
              for (j = 0; j < jLen; j += 1) {
                localShapeCollection.addShape(this.processPath(shapePaths[j], rd));
              }
            }
            shapeData.shape.paths = shapeData.localShapeCollection;
          }
        }
        if (!this.dynamicProperties.length) {
          this._mdf = false;
        }
      }
    }

    /**
     * a
     * @private
     */
    class RepeaterModifier extends ShapeModifier {
      /**
       * a
       * @param {*} elem a
       * @param {*} data a
       */
      initModifierProperties(elem, data) {
        this.getValue = this.processKeys;
        this.c = PropertyFactory.getProp(elem, data.c, 0, null, this);
        this.o = PropertyFactory.getProp(elem, data.o, 0, null, this);
        this.tr = getTransformProperty(elem, data.tr, this);
        this.so = PropertyFactory.getProp(elem, data.tr.so, 0, 0.01, this);
        this.eo = PropertyFactory.getProp(elem, data.tr.eo, 0, 0.01, this);
        this.data = data;
        if (!this.dynamicProperties.length) {
          this.getValue(true);
        }
        this._isAnimated = !!this.dynamicProperties.length;
        this.pMatrix = new Matrix();
        this.rMatrix = new Matrix();
        this.sMatrix = new Matrix();
        this.tMatrix = new Matrix();
        this.matrix = new Matrix();
      }

      /**
       * a
       * @param {*} pMatrix a
       * @param {*} rMatrix a
       * @param {*} sMatrix a
       * @param {*} transform a
       * @param {*} perc a
       * @param {*} inv a
       */
      applyTransforms(pMatrix, rMatrix, sMatrix, transform, perc, inv) {
        let dir = inv ? -1 : 1;
        let scaleX = transform.s.v[0] + (1 - transform.s.v[0]) * (1 - perc);
        let scaleY = transform.s.v[1] + (1 - transform.s.v[1]) * (1 - perc);
        pMatrix.translate(transform.p.v[0] * dir * perc, transform.p.v[1] * dir * perc, transform.p.v[2]);
        rMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
        rMatrix.rotate(-transform.r.v * dir * perc);
        rMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
        sMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
        sMatrix.scale(inv ? 1 / scaleX : scaleX, inv ? 1 / scaleY : scaleY);
        sMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
      }

      /**
       * a
       * @param {*} elem a
       * @param {*} arr a
       * @param {*} pos a
       * @param {*} elemsData a
       */
      init(elem, arr, pos, elemsData) {
        this.elem = elem;
        this.arr = arr;
        this.pos = pos;
        this.elemsData = elemsData;
        this._currentCopies = 0;
        this._elements = [];
        this._groups = [];
        this.frameId = -1;
        this.initDynamicPropertyContainer(elem);
        this.initModifierProperties(elem, arr[pos]);
        while (pos > 0) {
          pos -= 1;
          // this._elements.unshift(arr.splice(pos,1)[0]);
          this._elements.unshift(arr[pos]);
        }
        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.getValue(true);
        }
      }

      /**
       * a
       * @param {*} elements a
       */
      resetElements(elements) {
        const len = elements.length;
        for (let i = 0; i < len; i += 1) {
          elements[i]._processed = false;
          if (elements[i].ty === 'gr') {
            this.resetElements(elements[i].it);
          }
        }
      }

      /**
       * a
       * @param {*} elements a
       * @return {*}
       */
      cloneElements(elements) {
        let newElements = JSON.parse(JSON.stringify(elements));
        this.resetElements(newElements);
        return newElements;
      }

      /**
       * a
       * @param {*} elements a
       * @param {*} renderFlag a
       */
      changeGroupRender(elements, renderFlag) {
        const len = elements.length;
        for (let i = 0; i < len; i += 1) {
          elements[i]._render = renderFlag;
          if (elements[i].ty === 'gr') {
            this.changeGroupRender(elements[i].it, renderFlag);
          }
        }
      }

      /**
       * a
       * @param {*} _isFirstFrame a
       */
      processShapes(_isFirstFrame) {
        // let items, itemsTransform, i, dir, cont;
        if (this._mdf || _isFirstFrame) {
          let copies = Math.ceil(this.c.v);
          if (this._groups.length < copies) {
            while (this._groups.length < copies) {
              let group = {
                it: this.cloneElements(this._elements),
                ty: 'gr',
              };
              group.it.push({
                a: {a: 0, ix: 1, k: [0, 0]},
                nm: 'Transform',
                o: {a: 0, ix: 7, k: 100},
                p: {a: 0, ix: 2, k: [0, 0]},
                r: {
                  a: 1,
                  ix: 6,
                  k: [
                    {s: 0, e: 0, t: 0},
                    {s: 0, e: 0, t: 1},
                  ],
                },
                s: {a: 0, ix: 3, k: [100, 100]},
                sa: {a: 0, ix: 5, k: 0},
                sk: {a: 0, ix: 4, k: 0},
                ty: 'tr',
              });

              this.arr.splice(0, 0, group);
              this._groups.splice(0, 0, group);
              this._currentCopies += 1;
            }
            this.elem.reloadShapes();
          }
          let cont = 0;
          let i;
          let renderFlag;
          for (i = 0; i <= this._groups.length - 1; i += 1) {
            renderFlag = cont < copies;
            this._groups[i]._render = renderFlag;
            this.changeGroupRender(this._groups[i].it, renderFlag);
            cont += 1;
          }

          this._currentCopies = copies;
          // //

          let offset = this.o.v;
          let offsetModulo = offset % 1;
          let roundOffset = offset > 0 ? Math.floor(offset) : Math.ceil(offset);
          // let k;
          // let tMat = this.tr.v.props;
          let pProps = this.pMatrix.props;
          let rProps = this.rMatrix.props;
          let sProps = this.sMatrix.props;
          this.pMatrix.reset();
          this.rMatrix.reset();
          this.sMatrix.reset();
          this.tMatrix.reset();
          this.matrix.reset();
          let iteration = 0;

          if (offset > 0) {
            while (iteration < roundOffset) {
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false);
              iteration += 1;
            }
            if (offsetModulo) {
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, offsetModulo, false);
              iteration += offsetModulo;
            }
          } else if (offset < 0) {
            while (iteration > roundOffset) {
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, true);
              iteration -= 1;
            }
            if (offsetModulo) {
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, -offsetModulo, true);
              iteration -= offsetModulo;
            }
          }
          i = this.data.m === 1 ? 0 : this._currentCopies - 1;
          const dir = this.data.m === 1 ? 1 : -1;
          cont = this._currentCopies;
          while (cont) {
            const items = this.elemsData[i].it;
            const itemsTransform = items[items.length - 1].transform.mProps.v.props;
            const jLen = itemsTransform.length;
            items[items.length - 1].transform.mProps._mdf = true;
            items[items.length - 1].transform.op._mdf = true;
            items[items.length - 1].transform.op.v = this.so.v + (this.eo.v - this.so.v) * (i / (this._currentCopies - 1));
            if (iteration !== 0) {
              if ((i !== 0 && dir === 1) || (i !== this._currentCopies - 1 && dir === -1)) {
                this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false);
              }
              this.matrix.transform(
                rProps[0],
                rProps[1],
                rProps[2],
                rProps[3],
                rProps[4],
                rProps[5],
                rProps[6],
                rProps[7],
                rProps[8],
                rProps[9],
                rProps[10],
                rProps[11],
                rProps[12],
                rProps[13],
                rProps[14],
                rProps[15],
              );
              this.matrix.transform(
                sProps[0],
                sProps[1],
                sProps[2],
                sProps[3],
                sProps[4],
                sProps[5],
                sProps[6],
                sProps[7],
                sProps[8],
                sProps[9],
                sProps[10],
                sProps[11],
                sProps[12],
                sProps[13],
                sProps[14],
                sProps[15],
              );
              this.matrix.transform(
                pProps[0],
                pProps[1],
                pProps[2],
                pProps[3],
                pProps[4],
                pProps[5],
                pProps[6],
                pProps[7],
                pProps[8],
                pProps[9],
                pProps[10],
                pProps[11],
                pProps[12],
                pProps[13],
                pProps[14],
                pProps[15],
              );

              for (let j = 0; j < jLen; j += 1) {
                itemsTransform[j] = this.matrix.props[j];
              }
              this.matrix.reset();
            } else {
              this.matrix.reset();
              for (let j = 0; j < jLen; j += 1) {
                itemsTransform[j] = this.matrix.props[j];
              }
            }
            iteration += 1;
            cont -= 1;
            i += dir;
          }
        } else {
          let cont = this._currentCopies;
          let i = 0;
          const dir = 1;
          while (cont) {
            const items = this.elemsData[i].it;
            // const itemsTransform = items[items.length - 1].transform.mProps.v.props;
            items[items.length - 1].transform.mProps._mdf = false;
            items[items.length - 1].transform.op._mdf = false;
            cont -= 1;
            i += dir;
          }
        }
      }

      /**
       * a
       */
      addShape() {}
    }

    /**
     * MouseModifier class
     * @private
     */
    class MouseModifier extends ShapeModifier {
      /**
       * init modifier properties
       * @param {*} elem element node
       * @param {*} data mouse value property data
       */
      initModifierProperties(elem, data) {
        this.getValue = this.processKeys;
        this.data = data;
        this.positions = [];
      }

      /**
       * process keys
       * @param {number} frameNum frameNum
       * @param {*} forceRender force render
       */
      processKeys(frameNum, forceRender) {
        if (frameNum === this.frameId && !forceRender) {
          return;
        }
        this._mdf = true;
      }

      /**
       * add shape to modifier
       */
      addShapeToModifier() {
        this.positions.push([]);
      }

      /**
       * a
       * @param {*} path a
       * @param {*} mouseCoords a
       * @param {*} positions a
       * @return {*}
       */
      processPath(path, mouseCoords, positions) {
        let i;
        let len = path.v.length;
        let vValues = [];
        let oValues = [];
        let iValues = [];
        // let dist;
        let theta;
        let x;
        let y;
        // // OPTION A
        for (i = 0; i < len; i += 1) {
          if (!positions.v[i]) {
            positions.v[i] = [path.v[i][0], path.v[i][1]];
            positions.o[i] = [path.o[i][0], path.o[i][1]];
            positions.i[i] = [path.i[i][0], path.i[i][1]];
            positions.distV[i] = 0;
            positions.distO[i] = 0;
            positions.distI[i] = 0;
          }
          theta = Math.atan2(path.v[i][1] - mouseCoords[1], path.v[i][0] - mouseCoords[0]);

          x = mouseCoords[0] - positions.v[i][0];
          y = mouseCoords[1] - positions.v[i][1];
          let distance = Math.sqrt(x * x + y * y);
          positions.distV[i] += (distance - positions.distV[i]) * this.data.dc;

          positions.v[i][0] = (Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distV[i])) / 2 + path.v[i][0];
          positions.v[i][1] = (Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distV[i])) / 2 + path.v[i][1];

          theta = Math.atan2(path.o[i][1] - mouseCoords[1], path.o[i][0] - mouseCoords[0]);

          x = mouseCoords[0] - positions.o[i][0];
          y = mouseCoords[1] - positions.o[i][1];
          distance = Math.sqrt(x * x + y * y);
          positions.distO[i] += (distance - positions.distO[i]) * this.data.dc;

          positions.o[i][0] = (Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distO[i])) / 2 + path.o[i][0];
          positions.o[i][1] = (Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distO[i])) / 2 + path.o[i][1];

          theta = Math.atan2(path.i[i][1] - mouseCoords[1], path.i[i][0] - mouseCoords[0]);

          x = mouseCoords[0] - positions.i[i][0];
          y = mouseCoords[1] - positions.i[i][1];
          distance = Math.sqrt(x * x + y * y);
          positions.distI[i] += (distance - positions.distI[i]) * this.data.dc;

          positions.i[i][0] = (Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distI[i])) / 2 + path.i[i][0];
          positions.i[i][1] = (Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distI[i])) / 2 + path.i[i][1];

          // ///OPTION 1
          vValues.push(positions.v[i]);
          oValues.push(positions.o[i]);
          iValues.push(positions.i[i]);

          // ///OPTION 2
          // vValues.push(positions.v[i]);
          // iValues.push([path.i[i][0]+(positions.v[i][0]-path.v[i][0]),path.i[i][1]+(positions.v[i][1]-path.v[i][1])]);
          // oValues.push([path.o[i][0]+(positions.v[i][0]-path.v[i][0]),path.o[i][1]+(positions.v[i][1]-path.v[i][1])]);

          // ///OPTION 3
          // vValues.push(positions.v[i]);
          // iValues.push(path.i[i]);
          // oValues.push(path.o[i]);

          // ///OPTION 4
          // vValues.push(path.v[i]);
          // oValues.push(positions.o[i]);
          // iValues.push(positions.i[i]);
        }

        // // OPTION B
        /* for(i=0;i<len;i+=1){
                if(!positions.v[i]){
                    positions.v[i] = [path.v[i][0],path.v[i][1]];
                    positions.o[i] = [path.o[i][0],path.o[i][1]];
                    positions.i[i] = [path.i[i][0],path.i[i][1]];
                    positions.distV[i] = 0;
      
                }
                theta = Math.atan2(
                    positions.v[i][1] - mouseCoords[1],
                    positions.v[i][0] - mouseCoords[0]
                );
                x = mouseCoords[0] - positions.v[i][0];
                y = mouseCoords[1] - positions.v[i][1];
                var distance = this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );
      
                positions.v[i][0] += Math.cos(theta) * distance + (path.v[i][0] - positions.v[i][0]) * this.data.dc;
                positions.v[i][1] += Math.sin(theta) * distance + (path.v[i][1] - positions.v[i][1]) * this.data.dc;
      
      
                theta = Math.atan2(
                    positions.o[i][1] - mouseCoords[1],
                    positions.o[i][0] - mouseCoords[0]
                );
                x = mouseCoords[0] - positions.o[i][0];
                y = mouseCoords[1] - positions.o[i][1];
                var distance =  this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );
      
                positions.o[i][0] += Math.cos(theta) * distance + (path.o[i][0] - positions.o[i][0]) * this.data.dc;
                positions.o[i][1] += Math.sin(theta) * distance + (path.o[i][1] - positions.o[i][1]) * this.data.dc;
      
      
                theta = Math.atan2(
                    positions.i[i][1] - mouseCoords[1],
                    positions.i[i][0] - mouseCoords[0]
                );
                x = mouseCoords[0] - positions.i[i][0];
                y = mouseCoords[1] - positions.i[i][1];
                var distance =  this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );
      
                positions.i[i][0] += Math.cos(theta) * distance + (path.i[i][0] - positions.i[i][0]) * this.data.dc;
                positions.i[i][1] += Math.sin(theta) * distance + (path.i[i][1] - positions.i[i][1]) * this.data.dc;
      
                /////OPTION 1
                //vValues.push(positions.v[i]);
                // oValues.push(positions.o[i]);
                // iValues.push(positions.i[i]);
      
      
                /////OPTION 2
                //vValues.push(positions.v[i]);
                // iValues.push([path.i[i][0]+(positions.v[i][0]-path.v[i][0]),path.i[i][1]+(positions.v[i][1]-path.v[i][1])]);
                // oValues.push([path.o[i][0]+(positions.v[i][0]-path.v[i][0]),path.o[i][1]+(positions.v[i][1]-path.v[i][1])]);
      
      
                /////OPTION 3
                //vValues.push(positions.v[i]);
                //iValues.push(path.i[i]);
                //oValues.push(path.o[i]);
      
      
                /////OPTION 4
                //vValues.push(path.v[i]);
                // oValues.push(positions.o[i]);
                // iValues.push(positions.i[i]);
            }*/

        return {
          v: vValues,
          o: oValues,
          i: iValues,
          c: path.c,
        };
      }

      /**
       * process shapes
       */
      processShapes() {
        // FIXME: mouse modifier data
        let mouseX = this.elem.globalData.mouseX;
        let mouseY = this.elem.globalData.mouseY;
        let shapePaths;
        let i;
        let len = this.shapes.length;
        let j;
        let jLen;

        if (mouseX) {
          let localMouseCoords = this.elem.globalToLocal([mouseX, mouseY, 0]);

          let shapeData;
          let newPaths = [];
          for (i = 0; i < len; i += 1) {
            shapeData = this.shapes[i];
            if (!shapeData.shape._mdf && !this._mdf) {
              shapeData.shape.paths = shapeData.last;
            } else {
              shapeData.shape._mdf = true;
              shapePaths = shapeData.shape.paths;
              jLen = shapePaths.length;
              for (j = 0; j < jLen; j += 1) {
                if (!this.positions[i][j]) {
                  this.positions[i][j] = {
                    v: [],
                    o: [],
                    i: [],
                    distV: [],
                    distO: [],
                    distI: [],
                  };
                }
                newPaths.push(this.processPath(shapePaths[j], localMouseCoords, this.positions[i][j]));
              }
              shapeData.shape.paths = newPaths;
              shapeData.last = newPaths;
            }
          }
        }
      }
    }

    const modifiers = {};

    /**
     * a
     * @private
     * @param {*} nm a
     * @param {*} factory a
     */
    function registerModifier(nm, factory) {
      if (!modifiers[nm]) {
        modifiers[nm] = factory;
      }
    }

    /**
     * a
     * @private
     * @param {*} nm a
     * @param {*} elem a
     * @param {*} data a
     * @return {*}
     */
    function getModifier(nm, elem, data) {
      return new modifiers[nm](elem, data);
    }

    registerModifier('tm', TrimModifier);
    registerModifier('rd', RoundCornersModifier);
    registerModifier('rp', RepeaterModifier);
    registerModifier('ms', MouseModifier);

    var ShapeModifiers = {getModifier};

    /**
     * a
     * @private
     */
    class DashProperty extends DynamicPropertyContainer {
      /**
       * a
       * @param {*} elem a
       * @param {*} data a
       * @param {*} container a
       */
      constructor(elem, data, container) {
        super();
        this.elem = elem;
        this.frameId = -1;
        this.dataProps = createSizedArray(data.length);
        // this.renderer = renderer;
        this.k = false;
        // this.dashStr = '';
        this.dashArray = createTypedArray('float32', data.length ? data.length - 1 : 0);
        this.dashoffset = createTypedArray('float32', 1);
        this.initDynamicPropertyContainer(container);
        let i;
        let len = data.length || 0;
        let prop;
        for (i = 0; i < len; i += 1) {
          prop = PropertyFactory.getProp(elem, data[i].v, 0, 0, this);
          this.k = prop.k || this.k;
          this.dataProps[i] = {n: data[i].n, p: prop};
        }
        if (!this.k) {
          this.getValue(true);
        }
        this._isAnimated = this.k;
      }

      /**
       * a
       * @param {number} frameNum frameNum
       * @param {*} forceRender a
       */
      getValue(frameNum, forceRender) {
        if (frameNum === this.frameId && !forceRender) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties();
        this._mdf = this._mdf || forceRender;
        if (this._mdf) {
          let i = 0;
          let len = this.dataProps.length;
          // if (this.renderer === 'svg') {
          //   this.dashStr = '';
          // }
          for (i = 0; i < len; i += 1) {
            if (this.dataProps[i].n != 'o') {
              // if (this.renderer === 'svg') {
              //   this.dashStr += ' ' + this.dataProps[i].p.v;
              // } else {
              //   this.dashArray[i] = this.dataProps[i].p.v;
              // }
              this.dashArray[i] = this.dataProps[i].p.v;
            } else {
              this.dashoffset[0] = this.dataProps[i].p.v;
            }
          }
        }
      }
    }

    /**
     * GradientProperty class
     * @private
     */
    class GradientProperty extends DynamicPropertyContainer {
      /**
       * constructor GradientProperty
       * @param {*} elem element node
       * @param {*} data gradient property data
       * @param {*} container container
       */
      constructor(elem, data, container) {
        super();
        this.data = data;
        this.c = createTypedArray('uint8c', data.p * 4);
        let cLength = data.k.k[0].s ? data.k.k[0].s.length - data.p * 4 : data.k.k.length - data.p * 4;
        this.o = createTypedArray('float32', cLength);
        this._cmdf = false;
        this._omdf = false;
        this._collapsable = this.checkCollapsable();
        this._hasOpacity = cLength;
        this.initDynamicPropertyContainer(container);
        this.prop = PropertyFactory.getProp(elem, data.k, 1, null, this);
        this.k = this.prop.k;
        this.getValue(true);
      }

      /**
       * compare points
       * @param {*} values values
       * @param {*} points points
       * @return {*}
       */
      comparePoints(values, points) {
        let i = 0;
        let len = this.o.length / 2;
        let diff;
        while (i < len) {
          diff = Math.abs(values[i * 4] - values[points * 4 + i * 2]);
          if (diff > 0.01) {
            return false;
          }
          i += 1;
        }
        return true;
      }

      /**
       * check collapsable
       * @return {*}
       */
      checkCollapsable() {
        if (this.o.length / 2 !== this.c.length / 4) {
          return false;
        }
        if (this.data.k.k[0].s) {
          let i = 0;
          let len = this.data.k.k.length;
          while (i < len) {
            if (!this.comparePoints(this.data.k.k[i].s, this.data.p)) {
              return false;
            }
            i += 1;
          }
        } else if (!this.comparePoints(this.data.k.k, this.data.p)) {
          return false;
        }
        return true;
      }

      /**
       * get value
       * @param {*} forceRender a
       */
      getValue(forceRender) {
        this.prop.getValue();
        this._mdf = false;
        this._cmdf = false;
        this._omdf = false;
        if (this.prop._mdf || forceRender) {
          let i;
          let len = this.data.p * 4;
          let mult;
          let val;
          for (i = 0; i < len; i += 1) {
            mult = i % 4 === 0 ? 100 : 255;
            val = Math.round(this.prop.v[i] * mult);
            if (this.c[i] !== val) {
              this.c[i] = val;
              this._cmdf = !forceRender;
            }
          }
          if (this.o.length) {
            len = this.prop.v.length;
            for (i = this.data.p * 4; i < len; i += 1) {
              mult = i % 2 === 0 ? 100 : 1;
              val = i % 2 === 0 ? Math.round(this.prop.v[i] * 100) : this.prop.v[i];
              if (this.o[i - this.data.p * 4] !== val) {
                this.o[i - this.data.p * 4] = val;
                this._omdf = !forceRender;
              }
            }
          }
          this._mdf = !forceRender;
        }
      }
    }

    /**
     * ShapesFrames class
     * @private
     */
    class ShapesFrames extends DynamicPropertyContainer {
      /**
       * a
       * @param {*} keyframesManager a
       * @param {*} shapes a
       * @param {*} session a
       */
      constructor(keyframesManager, shapes, session) {
        super();
        this.frameId = -1;
        this.keyframesManager = keyframesManager;
        this.elem = keyframesManager.elem;
        this.session = session;
        this.shapes = [];
        this.shapesData = shapes;
        this.stylesList = [];
        this.itemsData = [];
        this.prevViewData = [];
        this.shapeModifiers = [];
        this.processedElements = [];
        this.transformsManager = new ShapeTransformManager();
        this.initDynamicPropertyContainer(keyframesManager);

        this.lcEnum = {
          1: 'butt',
          2: 'round',
          3: 'square',
        };
        this.ljEnum = {
          1: 'miter',
          2: 'round',
          3: 'bevel',
        };

        // set to true when inpoint is rendered
        this._isFirstFrame = true;

        this.transformHelper = {opacity: 1, _opMdf: false};
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
        if (!this._isAnimated) {
          this.transformHelper.opacity = 1;
          this.transformHelper._opMdf = false;
          this.updateModifiers(this.frameId);
          this.transformsManager.processSequences(this._isFirstFrame);
          this.updateShape(this.transformHelper, this.shapesData, this.itemsData);

          this.updateGrahpics();
        }
      }

      /**
       * a
       * @param {number} frameNum frameNum
       */
      // prepareProperties(frameNum) {
      //   let i;
      //   const len = this.dynamicProperties.length;
      //   for (i = 0; i < len; i += 1) {
      //     this.dynamicProperties[i].getValue(frameNum);
      //     if (this.dynamicProperties[i]._mdf) {
      //       this._mdf = true;
      //     }
      //   }
      // }

      /**
       * a
       * @param {*} prop a
       */
      // addDynamicProperty(prop) {
      //   if (this.dynamicProperties.indexOf(prop) === -1) {
      //     this.dynamicProperties.push(prop);
      //   }
      // }

      /**
       * create style element
       * @param {*} data style item data
       * @param {*} transforms transforms array
       * @return {*}
       */
      createStyleElement(data, transforms) {
        // let styleElem = {
        //   data: data,
        //   type: data.ty,
        //   preTransforms: this.transformsManager.addTransformSequence(transforms),
        //   transforms: [],
        //   elements: [],
        //   closed: data.hd === true,
        // };
        const styleElem = new PathPaint(this.elem, data, this.transformsManager.addTransformSequence(transforms));
        const elementData = {};
        if (data.ty == 'fl' || data.ty == 'st') {
          elementData.c = PropertyFactory.getProp(this, data.c, 1, 255, this);
          if (!elementData.c.k) {
            styleElem.co = elementData.c.v; // 'rgb('+bm_floor(elementData.c.v[0])+','+bm_floor(elementData.c.v[1])+','+bm_floor(elementData.c.v[2])+')';
          }
        } else if (data.ty === 'gf' || data.ty === 'gs') {
          elementData.s = PropertyFactory.getProp(this, data.s, 1, null, this);
          elementData.e = PropertyFactory.getProp(this, data.e, 1, null, this);
          elementData.h = PropertyFactory.getProp(this, data.h || {k: 0}, 0, 0.01, this);
          elementData.a = PropertyFactory.getProp(this, data.a || {k: 0}, 0, degToRads, this);
          elementData.g = new GradientProperty(this, data.g, this);
        }
        elementData.o = PropertyFactory.getProp(this, data.o, 0, 0.01, this);
        if (data.ty == 'st' || data.ty == 'gs') {
          styleElem.lc = this.lcEnum[data.lc] || 'round';
          styleElem.lj = this.ljEnum[data.lj] || 'round';
          if (data.lj == 1) {
            styleElem.ml = data.ml;
          }
          elementData.w = PropertyFactory.getProp(this, data.w, 0, null, this);
          if (!elementData.w.k) {
            styleElem.wi = elementData.w.v;
          }
          if (data.d) {
            let d = new DashProperty(this, data.d, 'canvas', this);
            elementData.d = d;
            if (!elementData.d.k) {
              styleElem.da = elementData.d.dashArray;
              styleElem.do = elementData.d.dashoffset[0];
            }
          }
        } else {
          styleElem.r = data.r === 2 ? 'evenodd' : 'nonzero';
        }
        this.stylesList.push(styleElem);
        elementData.style = styleElem;
        return elementData;
      }

      /**
       * a
       * @param {*} data a
       */
      addShapeToModifiers(data) {
        let i;
        let len = this.shapeModifiers.length;
        for (i = 0; i < len; i += 1) {
          this.shapeModifiers[i].addShape(data);
        }
      }

      /**
       * a
       * @param {*} data a
       * @return {Boolean}
       */
      isShapeInAnimatedModifiers(data) {
        let i = 0;
        let len = this.shapeModifiers.length;
        while (i < len) {
          if (this.shapeModifiers[i].isAnimatedWithShape(data)) {
            return true;
          }
        }
        return false;
      }

      /**
       * a
       * @param {number} frameNum frameNum
       */
      updateModifiers(frameNum) {
        if (!this.shapeModifiers.length) {
          return;
        }
        let i;
        let len = this.shapes.length;
        for (i = 0; i < len; i += 1) {
          this.shapes[i].sh.reset();
        }

        len = this.shapeModifiers.length;
        for (i = len - 1; i >= 0; i -= 1) {
          this.shapeModifiers[i].processShapes(frameNum, this._isFirstFrame);
        }
      }

      /**
       * a
       * @param {*} elem a
       * @return {number}
       */
      searchProcessedElement(elem) {
        let elements = this.processedElements;
        let i = 0;
        let len = elements.length;
        while (i < len) {
          if (elements[i].elem === elem) {
            return elements[i].pos;
          }
          i += 1;
        }
        return 0;
      }

      /**
       * a
       * @param {*} elem a
       * @param {*} pos a
       */
      addProcessedElement(elem, pos) {
        let elements = this.processedElements;
        let i = elements.length;
        while (i) {
          i -= 1;
          if (elements[i].elem === elem) {
            elements[i].pos = pos;
            return;
          }
        }
        elements.push(new ProcessedElement(elem, pos));
      }

      /**
       * create group element
       * @return {*}
       */
      createGroupElement() {
        return {
          it: [],
          prevViewData: [],
        };
      }

      /**
       * create transform element
       * @param {*} data a
       * @return {*}
       */
      createTransformElement(data) {
        return {
          transform: {
            opacity: 1,
            _opMdf: false,
            key: this.transformsManager.getNewKey(),
            op: PropertyFactory.getProp(this, data.o, 0, 0.01, this),
            mProps: getTransformProperty(this, data, this),
          },
        };
      }

      /**
       * a
       * @param {*} data a
       * @return {*}
       */
      createShapeElement(data) {
        const elementData = new ShapeData(this, data, this.stylesList, this.transformsManager);

        this.shapes.push(elementData);
        this.addShapeToModifiers(elementData);
        return elementData;
      }

      /**
       * a
       */
      reloadShapes() {
        this._isFirstFrame = true;
        let i;
        let len = this.itemsData.length;
        for (i = 0; i < len; i += 1) {
          this.prevViewData[i] = this.itemsData[i];
        }
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
        len = this.dynamicProperties.length;
        for (i = 0; i < len; i += 1) {
          this.dynamicProperties[i].getValue();
        }
        this.updateModifiers();
        this.transformsManager.processSequences(this._isFirstFrame);
      }

      /**
       * a
       * @param {*} transform a
       */
      addTransformToStyleList(transform) {
        const len = this.stylesList.length;
        for (let i = 0; i < len; i += 1) {
          if (!this.stylesList[i].closed) {
            this.stylesList[i].transforms.push(transform);
          }
        }
      }

      /**
       * a
       */
      removeTransformFromStyleList() {
        const len = this.stylesList.length;
        for (let i = 0; i < len; i += 1) {
          if (!this.stylesList[i].closed) {
            this.stylesList[i].transforms.pop();
          }
        }
      }

      /**
       * a
       * @param {*} styles a
       */
      closeStyles(styles) {
        const len = styles.length;
        for (let i = 0; i < len; i += 1) {
          styles[i].closed = true;
        }
      }

      /**
       * a
       * @param {*} arr a
       * @param {*} itemsData a
       * @param {*} prevViewData a
       * @param {*} shouldRender a
       * @param {*} transforms a
       */
      searchShapes(arr, itemsData, prevViewData, shouldRender, transforms) {
        let i;
        let len = arr.length - 1;
        let j;
        let jLen;
        let ownStyles = [];
        let ownModifiers = [];
        let processedPos;
        let modifier;
        let currentTransform;
        let ownTransforms = [].concat(transforms);
        for (i = len; i >= 0; i -= 1) {
          processedPos = this.searchProcessedElement(arr[i]);
          if (!processedPos) {
            arr[i]._shouldRender = shouldRender;
          } else {
            itemsData[i] = prevViewData[processedPos - 1];
          }
          if (arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs') {
            if (!processedPos) {
              itemsData[i] = this.createStyleElement(arr[i], ownTransforms);
            } else {
              itemsData[i].style.closed = false;
            }

            ownStyles.push(itemsData[i].style);
          } else if (arr[i].ty == 'gr') {
            if (!processedPos) {
              itemsData[i] = this.createGroupElement(arr[i]);
            } else {
              jLen = itemsData[i].it.length;
              for (j = 0; j < jLen; j += 1) {
                itemsData[i].prevViewData[j] = itemsData[i].it[j];
              }
            }
            this.searchShapes(arr[i].it, itemsData[i].it, itemsData[i].prevViewData, shouldRender, ownTransforms);
          } else if (arr[i].ty == 'tr') {
            if (!processedPos) {
              currentTransform = this.createTransformElement(arr[i]);
              itemsData[i] = currentTransform;
            }
            ownTransforms.push(itemsData[i]);
            this.addTransformToStyleList(itemsData[i]);
          } else if (arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr') {
            if (!processedPos) {
              itemsData[i] = this.createShapeElement(arr[i]);
            }
          } else if (arr[i].ty == 'tm' || arr[i].ty == 'rd') {
            if (!processedPos) {
              modifier = ShapeModifiers.getModifier(arr[i].ty);
              modifier.init(this, arr[i]);
              itemsData[i] = modifier;
              this.shapeModifiers.push(modifier);
            } else {
              modifier = itemsData[i];
              modifier.closed = false;
            }
            ownModifiers.push(modifier);
          } else if (arr[i].ty == 'rp') {
            if (!processedPos) {
              modifier = ShapeModifiers.getModifier(arr[i].ty);
              itemsData[i] = modifier;
              modifier.init(this, arr, i, itemsData);
              this.shapeModifiers.push(modifier);
              shouldRender = false;
            } else {
              modifier = itemsData[i];
              modifier.closed = true;
            }
            ownModifiers.push(modifier);
          }
          this.addProcessedElement(arr[i], i + 1);
        }
        this.removeTransformFromStyleList();
        this.closeStyles(ownStyles);
        len = ownModifiers.length;
        for (i = 0; i < len; i += 1) {
          ownModifiers[i].closed = true;
        }
      }

      /**
       * a
       * @param {*} parentTransform a
       * @param {*} groupTransform a
       */
      updateShapeTransform(parentTransform, groupTransform) {
        if (parentTransform._opMdf || groupTransform.op._mdf || this._isFirstFrame) {
          groupTransform.opacity = parentTransform.opacity;
          groupTransform.opacity *= groupTransform.op.v;
          groupTransform._opMdf = true;
        }
      }

      /**
       * a
       * @param {*} styledShape a
       * @param {*} shape a
       */
      updateStyledShape(styledShape, shape) {
        if (this._isFirstFrame || shape._mdf || styledShape.transforms._mdf) {
          let shapeNodes = styledShape.trNodes;
          let paths = shape.paths;
          let i;
          let len;
          let j;
          let jLen = paths._length;
          shapeNodes.length = 0;
          let groupTransformMat = styledShape.transforms.finalTransform;
          for (j = 0; j < jLen; j += 1) {
            let pathNodes = paths.shapes[j];
            if (pathNodes && pathNodes.v) {
              len = pathNodes._length;
              for (i = 1; i < len; i += 1) {
                if (i === 1) {
                  shapeNodes.push({
                    t: 'm',
                    p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0),
                  });
                }
                shapeNodes.push({
                  t: 'c',
                  pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[i], pathNodes.v[i]),
                });
              }
              if (len === 1) {
                shapeNodes.push({
                  t: 'm',
                  p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0),
                });
              }
              if (pathNodes.c && len) {
                shapeNodes.push({
                  t: 'c',
                  pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[0], pathNodes.v[0]),
                });
                shapeNodes.push({
                  t: 'z',
                });
              }
            }
          }
          styledShape.trNodes = shapeNodes;
        }
      }

      /**
       * a
       * @param {*} pathData a
       * @param {*} itemData a
       */
      updatePath(pathData, itemData) {
        if (pathData.hd !== true && pathData._shouldRender) {
          let i;
          let len = itemData.styledShapes.length;
          for (i = 0; i < len; i += 1) {
            this.updateStyledShape(itemData.styledShapes[i], itemData.sh);
          }
        }
      }

      /**
       * a
       * @param {*} styleData a
       * @param {*} itemData a
       * @param {*} groupTransform a
       */
      updateFill(styleData, itemData, groupTransform) {
        const styleElem = itemData.style;

        if (itemData.c._mdf || this._isFirstFrame) {
          // styleElem.co = 'rgb('
          // + Math.floor(itemData.c.v[0]) + ','
          // + Math.floor(itemData.c.v[1]) + ','
          // + Math.floor(itemData.c.v[2]) + ')';
          styleElem.co = itemData.c.v; // rgb2hex(itemData.c.v);
        }
        if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
          styleElem.coOp = itemData.o.v * groupTransform.opacity;
        }
      }

      /**
       * a
       * @param {*} styleData a
       * @param {*} itemData aa
       * @param {*} groupTransform a
       */
      updateStroke(styleData, itemData, groupTransform) {
        let styleElem = itemData.style;
        let d = itemData.d;
        if (d && (d._mdf || this._isFirstFrame)) {
          styleElem.da = d.dashArray;
          styleElem.do = d.dashoffset[0];
        }
        if (itemData.c._mdf || this._isFirstFrame) {
          styleElem.co = itemData.c.v; // 'rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')';
        }
        if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
          styleElem.coOp = itemData.o.v * groupTransform.opacity;
        }
        if (itemData.w._mdf || this._isFirstFrame) {
          styleElem.wi = itemData.w.v;
        }
      }

      /**
       * a
       * @param {*} styleData a
       * @param {*} itemData a
       * @param {*} groupTransform a
       */
      updateGradientFill(styleData, itemData, groupTransform) {
        let styleElem = itemData.style;
        // if (!styleElem.grd || itemData.g._mdf || itemData.s._mdf || itemData.e._mdf || (styleData.t !== 1 && (itemData.h._mdf || itemData.a._mdf))) {
        //   let ctx = this.globalData.canvasContext;
        //   let grd;
        //   let pt1 = itemData.s.v; let pt2 = itemData.e.v;
        //   if (styleData.t === 1) {
        //     grd = ctx.createLinearGradient(pt1[0], pt1[1], pt2[0], pt2[1]);
        //   } else {
        //     let rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
        //     let ang = Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0]);

        //     let percent = itemData.h.v >= 1 ? 0.99 : itemData.h.v <= -1 ? -0.99: itemData.h.v;
        //     let dist = rad * percent;
        //     let x = Math.cos(ang + itemData.a.v) * dist + pt1[0];
        //     let y = Math.sin(ang + itemData.a.v) * dist + pt1[1];
        //     grd = ctx.createRadialGradient(x, y, 0, pt1[0], pt1[1], rad);
        //   }

        //   let i; let len = styleData.g.p;
        //   let cValues = itemData.g.c;
        //   let opacity = 1;

        //   for (i = 0; i < len; i += 1) {
        //     if (itemData.g._hasOpacity && itemData.g._collapsable) {
        //       opacity = itemData.g.o[i*2 + 1];
        //     }
        //     grd.addColorStop(cValues[i * 4] / 100, 'rgba('+ cValues[i * 4 + 1] + ',' + cValues[i * 4 + 2] + ','+cValues[i * 4 + 3] + ',' + opacity + ')');
        //   }
        //   styleElem.grd = grd;
        // }
        styleElem.grd = itemData.g.c;
        // styleElem.grdo = itemData.g.o;
        styleElem.coOp = itemData.o.v * groupTransform.opacity;
      }

      /**
       * a
       * @param {*} parentTransform a
       * @param {*} items a
       * @param {*} data a
       */
      updateShape(parentTransform, items, data) {
        const len = items.length - 1;
        let groupTransform = parentTransform;
        for (let i = len; i >= 0; i -= 1) {
          if (items[i].ty == 'tr') {
            groupTransform = data[i].transform;
            this.updateShapeTransform(parentTransform, groupTransform);
          } else if (items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc' || items[i].ty == 'sr') {
            this.updatePath(items[i], data[i]);
          } else if (items[i].ty == 'fl') {
            this.updateFill(items[i], data[i], groupTransform);
          } else if (items[i].ty == 'st') {
            this.updateStroke(items[i], data[i], groupTransform);
          } else if (items[i].ty == 'gf' || items[i].ty == 'gs') {
            this.updateGradientFill(items[i], data[i], groupTransform);
          } else if (items[i].ty == 'gr') {
            this.updateShape(groupTransform, items[i].it, data[i].it);
          }
        }
        // if (isMain) {
        //   this.drawLayer();
        // }
      }

      /**
       * a
       */
      updateGrahpics() {
        const len = this.stylesList.length;
        for (let i = 0; i < len; i += 1) {
          const currentStyle = this.stylesList[i];
          currentStyle.updateGrahpics();
        }
      }

      /**
       * a
       * @param {number} frameNum frameNum
       */
      getValue(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }
        this.iterateDynamicProperties(frameNum);
        this.transformHelper.opacity = 1;
        this.transformHelper._opMdf = false;
        this.updateModifiers(frameNum);
        this.transformsManager.processSequences(this._isFirstFrame);
        this.updateShape(this.transformHelper, this.shapesData, this.itemsData);

        this.updateGrahpics();

        this.frameId = frameNum;
      }
    }

    /**
     * a
     * @private
     */
    class TransformFrames extends TransformProperty {
      /**
       * a
       * @param {*} elem a
       * @param {*} hs a
       * @param {*} session a
       */
      constructor(elem, hs, session) {
        super(elem, hs);
        this.frameId = -1;
        this.hs = hs;
        this.session = session;
      }

      /**
       * get transform
       * @param {number} frameNum frameNum
       */
      getValue(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }

        this.iterateDynamicProperties(frameNum);

        this.frameId = frameNum;
      }

      /**
       * get position x
       */
      get x() {
        return this.p ? this.p.v[0] : this.px.v;
      }

      /**
       * get position x
       */
      get y() {
        return this.p ? this.p.v[1] : this.py.v;
      }

      /**
       * get anchor x
       */
      get anchorX() {
        return this.a.v[0];
      }

      /**
       * get anchor x
       */
      get anchorY() {
        return this.a.v[1];
      }

      /**
       * get scale x
       */
      get scaleX() {
        return this.s.v[0];
      }

      /**
       * get scale x
       */
      get scaleY() {
        return this.s.v[1];
      }

      /**
       * get rotation
       */
      get rotation() {
        return (this.r && this.r.v) || 0;
      }

      /**
       * get alpha
       */
      get alpha() {
        return this.o.v;
      }
    }

    /**
     * KeyframesManager
     * @class
     * @private
     */
    class KeyframesManager {
      /**
       * manager
       * @param {object} elem elem
       */
      constructor(elem) {
        // const { st, config } = session;

        this.elem = elem;
        // this.layer = layer;

        // const opst = this.layer.op + st;

        // this.isOverSide = opst >= config.op;

        // this.keyframes = [];

        // set to true when inpoint is rendered
        this._isFirstFrame = false;

        // list of animated properties
        this.dynamicProperties = [];

        // If layer has been modified in current tick this will be true
        this._mdf = false;

        this.transform = null;

        this.masks = null;

        this.shapes = null;

        this._hasOutTypeExpression = false;

        this.needUpdateOverlap = false;

        this.isOverlapMode = false;

        this.visible = true;

        this._isFirstFrame = true;
      }

      /**
       * inif frame data
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      initFrame(layer, session) {
        // this.elem = elem;
        this.layer = layer;

        const {local, global} = session;
        this.session = session;

        // const opst = this.layer.op + st;

        // ip, op, st session
        this.isOverlapLayer = this.layer.op >= local.op - local.st;

        this.isOverlapMode = global.overlapMode;

        this.parseLayer(layer, session);
      }

      /**
       * a
       */
      outTypeExpressionMode() {
        this._hasOutTypeExpression = true;
        if (this.isOverlapLayer) {
          this.needUpdateOverlap = true;
        }
      }

      /**
       * Calculates all dynamic values
       * @param {number} frameNum current frame number in Layer's time
       * @param {boolean} isVisible if layers is currently in range
       */
      prepareProperties(frameNum, isVisible) {
        let i;
        let len = this.dynamicProperties.length;
        for (i = 0; i < len; i += 1) {
          if (isVisible || this.needUpdateOverlap || (this.elem._isParent && this.dynamicProperties[i].propType === 'transform')) {
            this.dynamicProperties[i].getValue(frameNum);
            if (this.dynamicProperties[i]._mdf) {
              // this.globalData._mdf = true;
              this._mdf = true;
            }
          }
        }
      }

      /**
       * a
       * @param {*} prop a
       */
      addDynamicProperty(prop) {
        if (this.dynamicProperties.indexOf(prop) === -1) {
          this.dynamicProperties.push(prop);
        }
      }

      /**
       * parse
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      parseLayer({ks, hasMask, masksProperties, shapes, tm}, session) {
        if (ks) {
          this.transform = new TransformFrames(this, ks, session);
          // ao logic
        }

        if (hasMask) {
          this.masks = new MaskFrames(this, masksProperties, session);
        }
        if (shapes) {
          this.shapes = new ShapesFrames(this, shapes, session);
        }

        if (tm) {
          const {frameRate} = session.global;
          this.tm = PropertyFactory.getProp(this, tm, 0, frameRate, this);
        }
      }

      /**
       * update
       * @param {number} frameNum frameNum
       */
      updateFrame(frameNum) {
        this._mdf = false;
        const inIpOpRange = Tools.inRange(frameNum, this.layer.ip, this.layer.op);
        if (this.isOverlapMode && this.isOverlapLayer) {
          this.visible = frameNum >= this.layer.ip;
        } else {
          this.visible = inIpOpRange;
        }

        this.prepareProperties(frameNum, inIpOpRange);
      }

      /**
       * a
       */
      updateDisplay() {
        const display = this.elem.display;
        if (!this.elem._isRoot) {
          if (this.visible) {
            display.show();
          } else {
            display.hide();
          }
          if (this._mdf || this.transform._mdf || this._isFirstFrame) display.updateLottieTransform(this.transform);
          if (this.masks && (this.masks._mdf || this._isFirstFrame)) display.updateLottieMasks(this.masks);
        }
        this._isFirstFrame = false;
      }
    }

    /**
     * BaseElement, all lottie element are extend from this
     * @private
     */
    class BaseElement {
      /**
       * require lottie data about this layer
       * @param {object} layer lottie data about this layer
       */
      constructor(layer) {
        this.data = layer;
        if (this.data.sr === undefined) {
          this.data.sr = 1;
        }
        this.offsetTime = layer.st || 0;
        this.fullname = layer.nm || '';
        this.idname = layer.ln || '';
        this.classnames = layer.cl ? layer.cl.split(' ') : [];
        this.bodymovin = new KeyframesManager(this);
        this.displayType = '';
        this.display = null;
        this.hierarchy = null;

        this.lottieTreeParent = null;
      }

      /**
       * init bodymovin data
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      initBodymovin(layer, session) {
        this.bodymovin.initFrame(layer, session);
        if (this.display && this.display.onSetupLottie) this.display.onSetupLottie();
      }

      /**
       * has valid masks
       * @return {boolean}
       */
      hasValidMasks() {
        return !!(this.bodymovin.masks && this.bodymovin.masks.hasMasks);
      }

      /**
       * set hierarchy
       * @param {*} elem elem
       */
      setHierarchy(elem) {
        this.hierarchy = elem;
        this.display.setHierarchy(elem.display);
      }

      /**
       * init display instance, which register by registerDisplayByType
       * @param {string} type display type
       * @param {object} data display instance data
       * @return {DisplayInstance}
       */
      initDisplayInstance(type, data) {
        const DisplayClass = getDisplayByType(type);
        const displayInstance = new DisplayClass(this, data);
        return displayInstance;
      }

      /**
       * update frame
       * @param {*} frameNum current frame number
       */
      updateFrame(frameNum) {
        this.bodymovin.updateFrame(frameNum);
        this.bodymovin.updateDisplay();
      }
    }

    /**
     * CompElement, pre-comp lottie layer
     * @extends BaseElement
     */
    class CompElement$1 extends BaseElement {
      /**
       * require lottie data and parse session about this layer
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      constructor(layer, session) {
        super(layer);

        const {global} = session;
        this.session = session;

        const config = {
          layer,
          session,
        };

        if (global.maskComp) {
          config.maskComp = global.maskComp;
          const {w, h} = layer;
          config.viewport = {w, h};
        }
        this.config = config;

        this.childNodes = [];

        this.displayType = DisplayRegister.Type.Component;

        this.innerDisplay = null;
        this.display = this.initDisplayInstance(this.displayType, config);

        this.initBodymovin(layer, session);
      }

      /**
       * update frame
       * @param {*} frameNum current frame number
       */
      updateFrame(frameNum) {
        this.bodymovin.updateFrame(frameNum);
        this.bodymovin.updateDisplay();

        frameNum -= this.offsetTime;

        if (this.bodymovin.tm) {
          let timeRemapped = this.bodymovin.tm.v;
          if (timeRemapped === this.data.op) {
            timeRemapped = this.data.op - 1;
          }
          frameNum = timeRemapped;
        } else {
          frameNum = frameNum / this.data.sr;
        }
        for (let i = 0; i < this.childNodes.length; i++) {
          this.childNodes[i].updateFrame(frameNum);
        }
      }

      /**
       * add child element
       * @param {BaseElement} node child element
       */
      addChild(node) {
        node.lottieTreeParent = this;
        this.childNodes.push(node);
        if (this.innerDisplay) {
          this.innerDisplay.addChild(node.display);
        } else {
          this.display.addChild(node.display);
        }
      }
    }

    /**
     * SolidElement, lottie solid layer
     * @extends BaseElement
     */
    class SolidElement$1 extends BaseElement {
      /**
       * require lottie data and parse session about this layer
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      constructor(layer, session) {
        super(layer);

        const config = {
          layer,
          session,
          rect: {x: 0, y: 0, width: layer.sw, height: layer.sh},
          color: layer.sc,
        };
        this.config = config;
        this.session = session;

        this.displayType = DisplayRegister.Type.Solid;

        this.display = this.initDisplayInstance(this.displayType, config);

        this.initBodymovin(layer, session);
      }
    }

    /**
     * ShapeElement, lottie image layer
     * @extends BaseElement
     */
    class SpriteElement$1 extends BaseElement {
      /**
       * require lottie data and parse session about this layer
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      constructor(layer, session) {
        super(layer);

        const {
          global: {textureLoader, assets},
        } = session;
        const asset = Tools.getAssets(layer.refId, assets);

        const config = {
          layer,
          session,
          texture: textureLoader.getTextureById(asset.id),
          asset,
        };
        this.config = config;
        this.session = session;

        this.displayType = DisplayRegister.Type.Sprite;

        this.display = this.initDisplayInstance(this.displayType, config);

        this.initBodymovin(layer, session);
      }
    }

    /**
     * ShapeElement, lottie shape layer
     * @extends BaseElement
     */
    class ShapeElement extends BaseElement {
      /**
       * require lottie data and parse session about this layer
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      constructor(layer, session) {
        super(layer);

        const config = {
          layer,
          session,
        };
        this.config = config;
        this.session = session;

        this.displayType = DisplayRegister.Type.Shape;

        this.display = this.initDisplayInstance(this.displayType, config);

        this.initBodymovin(layer, session);
      }
    }

    /**
     * NullElement, lottie null layer
     * @extends BaseElement
     */
    class NullElement extends BaseElement {
      /**
       * require lottie data and parse session about this layer
       * @param {object} layer lottie data about this layer
       * @param {object} session parse session date
       */
      constructor(layer, session) {
        super(layer);

        const config = {
          layer,
          session,
        };
        this.config = config;
        this.session = session;

        this.displayType = DisplayRegister.Type.Null;

        this.display = this.initDisplayInstance(this.displayType, config);

        this.initBodymovin(layer, session);
      }
    }

    /**
     * an animation group, store and compute frame information, one lottie animate one AnimationGroup
     * @class
     * @extends Eventer
     */
    class AnimationGroup extends Eventer {
      /**
       * parser a bodymovin data, and you can post some config for this animation group
       * @param {object} options lottie animation setting
       * @param {object} options.keyframes bodymovin data, which export from AE by bodymovin
       * @param {number} [options.repeats=0] need repeat some times?
       * @param {boolean} [options.infinite=false] play this animation round and round forever
       * @param {boolean} [options.alternate=false] alternate play direction every round
       * @param {number} [options.wait=0] need wait how much millisecond to start
       * @param {number} [options.delay=0] need delay how much millisecond to begin, effect every loop round
       * @param {number} [options.timeScale=1] animation speed, time scale factor
       * @param {boolean} [options.autoLoad=true] auto load assets, if this animation have
       * @param {boolean} [options.autoStart=true] auto start animation after assets loaded
       * @param {boolean} [options.copyJSON=false] copy json when this lottie data has two parse instance
       * @param {boolean} [options.overlapMode=false] enable overlap mode, it is useful when you have a overlap expression
       * @param {object} [options.segments={}] animation segments, splite by start and end keyframe number
       * @param {boolean} [options.initSegment=''] animation segments, init finite state machine
       * @param {boolean} [options.justDisplayOnImagesLoaded=true] just display group when all images loaded
       * @param {boolean} [options.maskComp=false] add mask for each comp
       * @param {string} [options.prefix=''] assets url prefix, look like link path
       */
      constructor(options) {
        super();
        /**
         * 动画是否是激活状态
         * @member {boolean}
         */
        this.living = true;

        /**
         * 动画无限循环播放
         * @member {boolean}
         */
        this.infinite = options.infinite || false;

        /**
         * 动画循环多少次
         * @member {number}
         */
        this.repeats = options.repeats || 0;

        /**
         * 动画交替播放
         * @member {boolean}
         */
        this.alternate = options.alternate || false;

        /**
         * 动画延迟多长时间启动
         * @member {number}
         */
        this.wait = options.wait || 0;

        /**
         * 动画延迟多长时间开始
         * @member {number}
         */
        this.delay = options.delay || 0;

        /**
         * 动画是否启动 overlap 模式
         * @member {number}
         */
        this.overlapMode = options.overlapMode || false;

        /**
         * 动画速度
         * @member {number}
         */
        this.timeScale = Tools.isNumber(options.timeScale) ? options.timeScale : 1;

        /**
         * 当前帧数
         * @member {number}
         */
        this.frameNum = 0;

        /**
         * 是否暂停状态，可以使用
         * @member {number}
         */
        this.isPaused = true;

        /**
         * 动画方向，1 or -1
         * @member {number}
         */
        this.direction = 1;

        /**
         * 记录帧位，初始值随意设置为负无穷大
         * @member {number}
         * @private
         */
        this._lastFrame = -Infinity;

        /**
         * 缓存重复多少次
         * @member {number}
         * @private
         */
        this._repeatsCut = this.repeats;

        /**
         * 缓存延迟多少时间
         * @member {number}
         * @private
         */
        this._delayCut = this.delay;

        /**
         * 缓存等待多少时间
         * @member {number}
         * @private
         */
        this._waitCut = this.wait;

        /**
         * 分段动画配置，和 segmentName 参数配合使用
         * @member {object}
         */
        this.segments = options.segments || {};

        /**
         * 有限状态机，记录当前的状态机，和 segments 参数配合使用
         * @member {string}
         * @private
         */
        this._segmentName = options.initSegment || '';

        /**
         * 资源相对地址前缀
         * @member {string}
         * @private
         */
        this._prefix = options.prefix || '';

        /**
         * 是否自动加载图片
         * @member {boolean}
         * @private
         */
        this._autoLoad = Tools.isBoolean(options.autoLoad) ? options.autoLoad : true;

        /**
         * 资源就绪后是否自动开始播放
         * @member {boolean}
         * @private
         */
        this._autoStart = Tools.isBoolean(options.autoStart) ? options.autoStart : true;

        /**
         * 资源就绪后才展示动画
         * @member {boolean}
         * @private
         */
        this._justDisplayOnImagesLoaded = Tools.isBoolean(options.justDisplayOnImagesLoaded)
          ? options.justDisplayOnImagesLoaded
          : true;

        /**
         * 是否为每个预合成增加画布遮罩
         * @member {boolean}
         * @private
         */
        this._maskComp = options.maskComp || false;

        /**
         * 图片加载
         * @member {Loader}
         */
        this.textureLoader = null;

        /**
         * json加载
         * @member {Loader}
         */
        this.jsonLoader = null;

        /**
         * 该动画组的根节点
         * @member {CompElement}
         */
        this.root = null;

        /**
         * 该动画组的父容器
         * @member {AnimationManager}
         */
        this.parent = null;

        const Container = getDisplayByType(DisplayRegister.Type.Container);
        /**
         * 该动画组的根节点显示对象
         * @member {Display}
         */
        this.group = new Container();

        /**
         * 该动画组的动画节点显示对象
         * @member {Display}
         */
        this.display = null;

        /**
         * 显示对象是否就绪
         * @member {boolean}
         */
        this.isDisplayLoaded = false;

        /**
         * 图片资源是否就绪
         * @member {boolean}
         */
        this.isImagesLoaded = false;

        /**
         * 是否拷贝json数据
         * @member {boolean}
         * @private
         */
        this._copyJSON = options.copyJSON || false;

        if (options.keyframes) {
          if (!this._prefix && options.keyframes.prefix) this._prefix = options.keyframes.prefix;
          this._setupDate(options.keyframes);
        } else if (options.path) {
          let prefix = '';
          if (options.path.lastIndexOf('\\') !== -1) {
            prefix = options.path.substr(0, options.path.lastIndexOf('\\') + 1);
          } else {
            prefix = options.path.substr(0, options.path.lastIndexOf('/') + 1);
          }
          if (!this._prefix && prefix) this._prefix = prefix;

          this.jsonLoader = loadJson$1(options.path);
          this.jsonLoader.once('success', response => {
            this._setupDate(response);
          });
          this.jsonLoader.once('error', error => {
            this.emit('error', error);
          });
        }
      }

      /**
       * 安装动画数据
       * @private
       * @param {Object} data data.json
       */
      _setupDate(data) {
        /**
         * copyJSON 为 true 时，存储的是原始数据
         * @private
         */
        this._sourceData = data;

        if (this._copyJSON) data = Tools.copyJSON(data);

        DataManager.completeData(data);

        /**
         * 动画数据
         * @member {object}
         */
        this.keyframes = data;

        /**
         * 提取全局信息
         */
        const {w, h, st = 0, fr, ip, op, assets} = data;

        /**
         * 帧率
         * @member {number}
         */
        this.frameRate = fr;

        /**
         * 帧素
         * @member {number}
         */
        this.frameMult = fr / 1000;

        /**
         * 默认动画配置
         * @private
         */
        this._defaultSegment = [ip, op];

        // 获取初始化分段
        const segment = (this._segmentName && this.segments[this._segmentName]) || this._defaultSegment;

        /**
         * 当前segment播放的开始帧
         * @member {number}
         */
        this.beginFrame = segment[0];

        /**
         * 当前segment播放的结束帧
         * @member {number}
         */
        this.endFrame = segment[1];

        /**
         * 每帧时间
         * @member {number}
         * @private
         */
        this._timePerFrame = 1000 / fr;

        /**
         * 总帧数
         * @member {number}
         */
        this.duration = Math.floor(this.endFrame - this.beginFrame);

        let textureLoader = null;
        const images = assets.filter(it => {
          return it.u || it.p;
        });
        if (images.length > 0) {
          this.textureLoader = textureLoader = loadTexture$1(images, {prefix: this._prefix, autoLoad: this._autoLoad});
          if (textureLoader.loaded) {
            this.isImagesLoaded = true;
            this.isPaused = !this._autoStart;
            this.emit('ImageReady');
          } else {
            textureLoader.once('complete', () => {
              this.isImagesLoaded = true;
              this.emit('ImageReady');
            });

            if (this._pausedNeedSet !== null) {
              this._pausedNeedSet = true;
              textureLoader.once('complete', () => {
                if (this._pausedNeedSet) {
                  this._pausedNeedSet = false;
                  this.isPaused = !this._autoStart;
                }
              });
            }
          }
        } else {
          this.isImagesLoaded = true;
          this.isPaused = !this._autoStart;
        }

        const session = {
          global: {
            assets,
            textureLoader,
            frameRate: fr,
            maskComp: this._maskComp,
            overlapMode: this.overlapMode,
          },
          local: {
            w,
            h,
            ip,
            op,
            st,
          },
        };
        this._buildElements(session);

        if (
          this.textureLoader !== null &&
          this._justDisplayOnImagesLoaded &&
          !this.textureLoader.loaded &&
          this._justDisplayNeedSet !== null
        ) {
          this.group.visible = false;
          this._justDisplayNeedSet = true;
          this.textureLoader.once('complete', () => {
            if (this._justDisplayNeedSet) {
              this._justDisplayNeedSet = false;
              this.group.visible = true;
            }
          });
        }

        this.isDisplayLoaded = true;

        this.update(0, true);
      }

      /**
       * 创建动画元素
       * @private
       * @param {Object} session session information
       */
      _buildElements(session) {
        this.root = this._extraCompositions(this.keyframes, session, true);
        this.display = this.root.display;

        this.group.addChild(this.display);

        this.emit('DOMLoaded').emit('DisplayReady');
        if (this.textureLoader === null) {
          this.emit('success');
        } else {
          if (this.textureLoader.loaded) {
            this.emit('success');
          } else {
            this.textureLoader.once('complete', () => this.emit('success'));
          }
        }
      }

      /**
       * 提取预合成
       * @private
       * @param {object} data layers
       * @param {object} assets object
       * @param {boolean} isRoot isRoot
       * @return {container}
       */
      _extraCompositions(data, {global, local}, isRoot = false) {
        const {w, h, ip, op, st = 0} = data;
        const container = new CompElement$1(data, {global, local});
        container._isRoot = isRoot;
        const layers = data.layers || Tools.getAssets(data.refId, global.assets).layers;

        const session = {
          global,
          local: {
            w,
            h,
            ip,
            op,
            st,
          },
        };

        const elementsMap = this._createElements(layers, session);
        for (let i = layers.length - 1; i >= 0; i--) {
          const layer = layers[i];
          const item = elementsMap[layer.ind];
          if (!item) continue;
          if (!Tools.isUndefined(layer.parent)) {
            const parent = elementsMap[layer.parent];
            parent._isParent = true;
            item.setHierarchy(parent);
          }
          // const nameHierarchy = parentName + '.' + item.name;
          // global.register.setLayer(nameHierarchy, item);
          container.addChild(item);
        }
        return container;
      }

      /**
       * createElements
       * @private
       * @param {arrya} layers layers
       * @param {object} session parse session date
       * @return {object}
       */
      _createElements(layers, session) {
        const elementsMap = {};
        for (let i = layers.length - 1; i >= 0; i--) {
          const layer = layers[i];
          let element = null;

          if (layer.td !== undefined) continue;

          switch (layer.ty) {
            case 0:
              element = this._extraCompositions(layer, session);
              break;
            case 1:
              element = new SolidElement$1(layer, session);
              break;
            case 2:
              element = new SpriteElement$1(layer, session);
              break;
            case 3:
              element = new NullElement(layer, session);
              break;
            case 4:
              element = new ShapeElement(layer, session);
              break;
            default:
              continue;
          }

          if (element) {
            if (layer.ind === undefined) layer.ind = i;
            elementsMap[layer.ind] = element;
            element.name = layer.nm || null;
          }
        }
        return elementsMap;
      }

      /**
       * get layer display by selector
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {string} selector layer classname or idname
       * @return {display}
       */
      getDisplayByQuerySelector(selector) {
        const layer = this.querySelector(selector);
        if (layer && layer.display) return layer.display;
        console.warn('can not find display which query with ', selector);
        return null;
      }

      /**
       * query match
       * @private
       * @param {string} selector layer classname or idname
       * @param {*} node start node
       * @param {*} nodes match result
       * @return {Boolean}
       */
      _queryMatch(selector, node, nodes) {
        const selType = selector.substr(0, 1);
        const selName = selector.substr(1, selector.length);
        let matched = false;
        if (selType === '#') {
          matched = node.idname === selName;
        } else if (selType === '.') {
          matched = node.classnames.indexOf(selName) !== -1;
        } else {
          matched = node.fullname === selector;
        }
        if (matched) nodes.push(node);
        return matched;
      }

      /**
       * search node tree
       * @private
       * @param {string} selector layer classname or idname
       * @param {*} node start node
       * @param {*} nodes match result
       * @param {*} returnWhenMatch just match one
       * @return {Boolean}
       */
      _searchNodes(selector, node, nodes, returnWhenMatch = false) {
        if (node.childNodes && node.childNodes.length > 0) {
          const preComps = [];
          for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            if (this._queryMatch(selector, childNode, nodes) && returnWhenMatch) return true;
            if (childNode.childNodes && childNode.childNodes.length > 0) preComps.push(childNode);
          }

          for (let j = 0; j < preComps.length; j++) {
            if (this._searchNodes(selector, preComps[j], nodes, returnWhenMatch)) return true;
          }
        }
        return false;
      }

      /**
       * get layer by classname or idname
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {string} selector layer classname or idname
       * @return {Element}
       */
      querySelector(selector) {
        const nodes = [];
        if (this._queryMatch(selector, this.root, nodes)) return nodes[0];
        this._searchNodes(selector, this.root, nodes, true);

        return nodes[0] || null;
      }

      /**
       * get layers by classname
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {string} selector layer classname
       * @return {Element}
       */
      querySelectorAll(selector) {
        const nodes = [];
        const selType = selector.substr(0, 1);
        const idType = selType === '#';
        if (this._queryMatch(selector, this.root, nodes) && idType) return nodes;
        this._searchNodes(selector, this.root, nodes, idType);

        return nodes;
      }

      /**
       * bind other animation-group or display-object to this animation-group with name path
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {*} selector
       * @param {*} child
       * @return {this}
       */
      bindSlot(selector, child) {
        const slotDisplay = this.getDisplayByQuerySelector(selector);
        slotDisplay.addChild(child);
        return this;
      }

      /**
       * unbind other animation-group or display-object to this animation-group with name path
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {*} selector
       * @param {*} child
       * @return {this}
       */
      unbindSlot(selector, child) {
        const slotDisplay = this.getDisplayByQuerySelector(selector);
        slotDisplay.removeChild(child);
        return this;
      }

      /**
       * emit frame
       * @private
       * @param {*} np now frame
       */
      _emitFrame(np) {
        this.emit(`@${np}`);
      }

      /**
       * update with time snippet, just support for AnimationManager
       * @param {number} snippetCache snippet
       * @param {number} firstFrame snippet
       */
      update(snippetCache, firstFrame = false) {
        if (!this.living || !this.isDisplayLoaded || (this.isPaused && !firstFrame)) return;

        const isEnd = this._updateTime(snippetCache);

        const correctedFrameNum = this.beginFrame + this.frameNum;
        this.root.updateFrame(correctedFrameNum);

        const np = correctedFrameNum >> 0;
        if (this._lastFrame !== np) {
          this._emitFrame(this.direction > 0 ? np : this._lastFrame);
          this._lastFrame = np;
        }
        if (isEnd === false) {
          this.emit('enterFrame', correctedFrameNum);
          this.emit('update', this.frameNum / this.duration);
        } else if (this.hadEnded !== isEnd && isEnd === true) {
          this.emit('complete');
        }
        this.hadEnded = isEnd;
      }

      /**
       * update timeline with time snippet
       * @private
       * @param {number} snippet snippet
       * @return {boolean} frameNum status
       */
      _updateTime(snippet) {
        const snippetCache = this.direction * this.timeScale * snippet;
        if (this._waitCut > 0) {
          this._waitCut -= Math.abs(snippetCache);
          return null;
        }
        if (this.isPaused || this._delayCut > 0) {
          if (this._delayCut > 0) this._delayCut -= Math.abs(snippetCache);
          return null;
        }

        this.frameNum += snippetCache / this._timePerFrame;
        let isEnd = false;

        if (this._spill()) {
          if (this._repeatsCut > 0 || this.infinite) {
            if (this._repeatsCut > 0) --this._repeatsCut;
            this._delayCut = this.delay;
            if (this.alternate) {
              this.direction *= -1;
              this.frameNum = Tools.codomainBounce(this.frameNum, 0, this.duration);
            } else {
              this.direction = 1;
              this.frameNum = Tools.euclideanModulo(this.frameNum, this.duration);
            }
            this.emit('loopComplete');
          } else {
            if (!this.overlapMode) {
              this.frameNum = Tools.clamp(this.frameNum, 0, this.duration);
              this.living = false;
            }
            isEnd = true;
          }
        }

        return isEnd;
      }

      /**
       * is this time frameNum spill the range
       * @private
       * @return {boolean}
       */
      _spill() {
        const bottomSpill = this.frameNum <= 0 && this.direction === -1;
        const topSpill = this.frameNum >= this.duration && this.direction === 1;
        return bottomSpill || topSpill;
      }

      /**
       * get time
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {number} frame frame index
       * @return {number}
       */
      frameToTime(frame) {
        return frame * this._timePerFrame;
      }

      /**
       * set animation speed, time scale
       * @param {number} speed
       */
      setSpeed(speed) {
        this.timeScale = speed;
      }

      /**
       * set finite state machine
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {String|Array} name segment name which define in segments props, you can also pass an array like [10, 30]
       * @param {Object} options animation config
       * @param {Number} [options.repeats=0] need repeat somt times?
       * @param {Boolean} [options.infinite=false] play this animation round and round forever
       * @param {Boolean} [options.alternate=false] alternate direction every round
       * @param {Number} [options.wait=0] need wait how much millisecond to start
       * @param {Number} [options.delay=0] need delay how much millisecond to begin, effect every loop round
       */
      playSegment(name, options = {}) {
        if (!name) return;

        let segment = null;
        if (Tools.isArray(name)) {
          segment = name;
        } else if (Tools.isString(name)) {
          segment = this.segments[name];
          if (Tools.isArray(segment)) this._segmentName = name;
        }

        if (!Tools.isArray(segment)) return;

        this.beginFrame = Tools.isNumber(segment[0]) ? segment[0] : this._defaultSegment[0];
        this.endFrame = Tools.isNumber(segment[1]) ? segment[1] : this._defaultSegment[1];

        if (Tools.isNumber(options.repeats)) this.repeats = options.repeats;
        if (Tools.isBoolean(options.infinite)) this.infinite = options.infinite;
        if (Tools.isBoolean(options.alternate)) this.alternate = options.alternate;
        if (Tools.isNumber(options.wait)) this.wait = options.wait;
        if (Tools.isNumber(options.delay)) this.delay = options.delay;

        this.replay();
      }

      /**
       * impl same as lottie goToAndStop
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {number} value number value
       * @param {boolean} isFrame frame base or time base
       */
      goToAndStop(value, isFrame = false) {
        this.frameNum = isFrame ? value : value * this.frameMult;
        this.update(0, true);
        this.pause();
      }

      /**
       * impl same as lottie goToAndStop
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {number} value number value
       * @param {boolean} isFrame frame base or time base
       */
      goToAndPlay(value, isFrame = false) {
        this.frameNum = isFrame ? value : value * this.frameMult;
        this.update(0, true);
        this.resume();
      }

      /**
       * get total duration
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @param {boolean} isFrame frame base or time base
       * @return {number}
       */
      getDuration(isFrame) {
        const totalFrames = this.endFrame - this.beginFrame;
        return isFrame ? totalFrames : totalFrames / this.frameRate;
      }

      /**
       * set direction
       * @param {number} val change play direction -1 or 1
       * @return {this}
       */
      setDirection(val) {
        this.direction = val < 0 ? -1 : 1;
        return this;
      }

      /**
       * pause this animation group
       * @return {this}
       */
      pause() {
        if (this._pausedNeedSet) {
          this._pausedNeedSet = false;
        } else {
          this._pausedNeedSet = null;
        }
        this.isPaused = true;
        return this;
      }

      /**
       * resume or play this animation group
       * @return {this}
       */
      resume() {
        if (this._pausedNeedSet) {
          this._pausedNeedSet = false;
        } else {
          this._pausedNeedSet = null;
        }
        this.isPaused = false;
        return this;
      }

      /**
       * resume or play this animation group
       * @return {this}
       */
      play() {
        return this.resume();
      }

      /**
       * replay this animation group from begin frame
       * <br/> `Note:` only can use after data was setup or after DisplayReady event
       * @return {this}
       */
      replay() {
        if (this._pausedNeedSet) {
          this._pausedNeedSet = false;
        } else {
          this._pausedNeedSet = null;
        }
        this.isPaused = false;
        this._repeatsCut = this.repeats;
        this._delayCut = this.delay;
        this.living = true;
        this.frameNum = 0;
        this.duration = Math.floor(this.endFrame - this.beginFrame);
        this.direction = 1;
        return this;
      }

      /**
       * show animation root display
       */
      show() {
        if (this._justDisplayNeedSet) {
          this._justDisplayNeedSet = false;
        } else {
          this._justDisplayNeedSet = null;
        }
        this.group.visible = true;
      }

      /**
       * hide animation root display
       */
      hide() {
        if (this._justDisplayNeedSet) {
          this._justDisplayNeedSet = false;
        } else {
          this._justDisplayNeedSet = null;
        }
        this.group.visible = false;
      }

      /**
       * destroy animation group and remove it from its parent
       */
      destroy() {
        // remove group from animation manager
        if (this.parent) this.parent.remove(this);

        // remove root display from display tree
        if (this.group.parent) this.group.parent.removeChild(this.group);

        // pause and cancel texture loader handle
        this.pause();

        this.root = null;
        this.group = null;
        this.display = null;

        if (this.textureLoader) {
          this.textureLoader.off('complete');
          this.textureLoader = null;
        }
        if (this.jsonLoader) {
          this.jsonLoader.off('success');
          this.jsonLoader = null;
        }

        this.keyframes = null;

        this.living = false;
      }
    }

    /**
     * all lottie animations manager, manage update loop and animation groups, one Application one AnimationManager
     * @example
     * const manager = new PIXI.AnimationManager(app);
     * const ani = manager.parseAnimation({
     *   keyframes: data,
     *   infinite: true,
     * });
     * @class
     * @extends Eventer
     */
    class AnimationManager extends Eventer {
      /**
       * animation manager, require an PIXI.Application instance
       * @param {Application} app app object
       */
      constructor(app) {
        super();
        /**
         * pre-time cache
         *
         * @member {Number}
         * @private
         */
        this._lastTime = 0;

        /**
         * how long the time through, at this tick
         *
         * @member {Number}
         * @private
         */
        this._snippet = 0;

        /**
         * time scale, just like speed scalar
         *
         * @member {Number}
         */
        this.timeScale = 1;

        /**
         * mark the manager was pause or not
         *
         * @member {Boolean}
         */
        this.isPaused = false;

        /**
         * get shared ticker from app object
         * @member {ticker}
         */
        this.ticker = app.ticker ? app.ticker : app;

        /**
         * all animation groups
         * @member {AnimationGroup[]}
         */
        this.groups = [];

        this.update = this.update.bind(this);

        if (this.ticker) this.start();
      }

      /**
       * add a animationGroup child to array
       * @param {AnimationGroup} child AnimationGroup instance
       * @return {AnimationGroup} child
       */
      add(child) {
        const argumentsLength = arguments.length;

        if (argumentsLength > 1) {
          for (let i = 0; i < argumentsLength; i++) {
            /* eslint prefer-rest-params: 0 */
            this.add(arguments[i]);
          }
        } else {
          if (child.parent !== null) {
            child.parent.remove(child);
          }
          child.parent = this;
          this.groups.push(child);
        }

        return child;
      }

      /**
       * remove a animationGroup child to array
       * @param {AnimationGroup} child AnimationGroup instance
       */
      remove(child) {
        if (arguments.length > 1) {
          for (let i = 0; i < arguments.length; i++) {
            this.remove(arguments[i]);
          }
        }
        const index = this.groups.indexOf(child);
        if (index !== -1) {
          child.parent = null;
          this.groups.splice(index, 1);
        }
      }

      /**
       * parser a bodymovin data, and post some config for this animation group
       * @param {object} options lottie animation setting
       * @param {object} options.keyframes bodymovin data, which export from AE by bodymovin
       * @param {number} [options.repeats=0] need repeat some times?
       * @param {boolean} [options.infinite=false] play this animation round and round forever
       * @param {boolean} [options.alternate=false] alternate play direction every round
       * @param {number} [options.wait=0] need wait how much millisecond to start
       * @param {number} [options.delay=0] need delay how much millisecond to begin, effect every loop round
       * @param {number} [options.timeScale=1] animation speed, time scale factor
       * @param {boolean} [options.autoLoad=true] auto load assets, if this animation have
       * @param {boolean} [options.autoStart=true] auto start animation after assets loaded
       * @param {boolean} [options.copyJSON=false] copy json when this lottie data has two parse instance
       * @param {boolean} [options.overlapMode=false] enable overlap mode, it is useful when you have a overlap expression
       * @param {object} [options.segments={}] animation segments, splite by start and end keyframe number
       * @param {boolean} [options.initSegment=''] animation segments, init finite state machine
       * @param {boolean} [options.justDisplayOnImagesLoaded=true] just display group when all images loaded
       * @param {boolean} [options.maskComp=false] add mask for each comp
       * @param {string} [options.prefix=''] assets url prefix, look like link path
       * @return {AnimationGroup}
       * @example
       * const manager = new PIXI.AnimationManager(app);
       * const ani = manager.parseAnimation({
       *   keyframes: data,
       *   infinite: true,
       * });
       */
      parseAnimation(options) {
        const animate = new AnimationGroup(options);
        return this.add(animate);
      }

      /**
       * set animation speed, time scale
       * @param {number} speed
       */
      setSpeed(speed) {
        this.timeScale = speed;
      }

      /**
       * start update loop
       * @return {this}
       */
      start() {
        this._lastTime = Date.now();
        this.ticker.add(this.update);
        return this;
      }

      /**
       * stop update loop
       * @return {this}
       */
      stop() {
        this.ticker.remove(this.update);
        return this;
      }

      /**
       * pause all animation groups
       * @return {this}
       */
      pause() {
        this.isPaused = true;
        return this;
      }

      /**
       * pause all animation groups
       * @return {this}
       */
      resume() {
        this.isPaused = false;
        return this;
      }

      /**
       * update all active animation
       * @private
       */
      update() {
        this.timeline();
        if (this.isPaused) return;
        const snippetCache = this.timeScale * this._snippet;
        const length = this.groups.length;
        for (let i = 0; i < length; i++) {
          const animationGroup = this.groups[i];
          animationGroup.update(snippetCache);
        }
        this.emit('update', this._snippet);
      }

      /**
       * get timeline snippet
       * @private
       */
      timeline() {
        let snippet = Date.now() - this._lastTime;
        if (!this._lastTime || snippet > 200) {
          this._lastTime = Date.now();
          snippet = Date.now() - this._lastTime;
        }
        this._lastTime += snippet;
        this._snippet = snippet;
      }

      /**
       * destroy animation group and remove it from its parent
       */
      destroy() {
        const length = this.groups.length;
        for (let i = length - 1; i >= 0; i--) {
          this.groups[i].destroy();
        }
      }
    }

    // import { Graphics } from '@pixi/graphics';

    /**
     * Lottie Graphics Mask
     * @private
     */
    class LottieGraphicsMask extends pixi_js.Graphics {
      /**
       * a
       * @param {*} parentCompBox a
       */
      constructor(parentCompBox) {
        super();
        this.parentCompBox = parentCompBox;
        this.lineStyle(0);
      }

      /**
       * a
       * @param {*} masks a
       */
      updateLayerMask(masks) {
        for (let i = 0; i < masks.viewData.length; i++) {
          if (masks.viewData[i].inv) {
            const size = this.parentCompBox;
            this.moveTo(0, 0);
            this.lineTo(size.w, 0);
            this.lineTo(size.w, size.h);
            this.lineTo(0, size.h);
            this.lineTo(0, 0);
          }

          const data = masks.viewData[i].v;
          const start = data.v[0];
          this.moveTo(start[0], start[1]);
          const jLen = data._length;
          let j = 1;
          for (; j < jLen; j++) {
            const oj = data.o[j - 1];
            const ij = data.i[j];
            const vj = data.v[j];
            this.bezierCurveTo(oj[0], oj[1], ij[0], ij[1], vj[0], vj[1]);
          }
          const oj = data.o[j - 1];
          const ij = data.i[0];
          const vj = data.v[0];
          this.bezierCurveTo(oj[0], oj[1], ij[0], ij[1], vj[0], vj[1]);

          if (masks.viewData[i].inv) {
            this.addHole();
          }
        }
      }

      /**
       * a
       * @param {*} masks a
       */
      updateMasks(masks) {
        this.clear();
        this.beginFill(0x000000);

        this.updateLayerMask(masks);

        this.endFill();
      }
    }

    // import { Graphics } from '@pixi/graphics';

    /**
     * Lottie Graphics Mask
     * @private
     */
    class PreCompMask extends pixi_js.Graphics {
      /**
       * a
       * @param {*} viewport a
       */
      constructor(viewport) {
        super();
        this.viewport = viewport;
        this.lineStyle(0);
        this.initCompMask();
      }

      /**
       * init pre-comp mask
       */
      initCompMask() {
        this.clear();
        this.beginFill(0x000000);

        const size = this.viewport;
        this.moveTo(0, 0);
        this.lineTo(size.w, 0);
        this.lineTo(size.w, size.h);
        this.lineTo(0, size.h);
        this.lineTo(0, 0);

        this.endFill();
      }
    }

    /**
     * CompElement class
     * @class
     * @private
     */
    class CompElement extends pixi_js.Container {
      /**
       * CompElement constructor
       * @param {object} lottieElement lottie element object
       * @param {object} config layer data information
       */
      constructor(lottieElement, config) {
        super();
        this.lottieElement = lottieElement;
        this.config = config;
      }

      /**
       * call it when this layer had finish lottie parse
       */
      onSetupLottie() {
        if (this.config.maskComp) {
          const viewport = this.config.viewport;
          this.preCompMask = new PreCompMask(viewport);
          this.mask = this.preCompMask;
          this.addChild(this.mask);
        }
        if (this.lottieElement.hasValidMasks()) {
          const parentCompBox = this.config.session.local;
          this.graphicsMasks = new LottieGraphicsMask(parentCompBox);
          if (this.mask) {
            const innerDisplay = new pixi_js.Container();
            innerDisplay.mask = this.graphicsMasks;
            innerDisplay.addChild(this.mask);
            this.lottieElement.innerDisplay = innerDisplay;
            this.addChild(innerDisplay);
          } else {
            this.mask = this.graphicsMasks;
            this.addChild(this.mask);
          }
        }
      }

      /**
       * a
       * @param {*} parent a
       */
      setHierarchy(parent) {
        this.hierarchy = parent;
      }

      /**
       * a
       */
      show() {
        this.visible = true;
      }

      /**
       * a
       */
      hide() {
        this.visible = false;
      }

      /**
       * a
       * @param {*} transform
       */
      updateLottieTransform(transform) {
        this.x = transform.x;
        this.y = transform.y;
        this.pivot.x = transform.anchorX;
        this.pivot.y = transform.anchorY;
        this.scale.x = transform.scaleX;
        this.scale.y = transform.scaleY;
        this.rotation = transform.rotation;
        this.alpha = transform.alpha;
      }

      /**
       * a
       * @param {*} masks a
       */
      updateLottieMasks(masks) {
        if (!this.graphicsMasks) return;
        this.graphicsMasks.updateMasks(masks);
      }
    }

    /**
     * This shader is used to draw simple primitive shapes for {@link PIXI.Graphics}.
     *
     * @class
     * @private
     * @extends Shader
     */
    class PrimitiveShader extends pixi_js.Shader {
      /**
       * @param {WebGLRenderingContext} gl - The webgl shader manager this shader works for.
       */
      constructor(gl) {
        super(
          gl,
          // vertex shader
          [
            'attribute vec2 aVertexPosition;',

            'uniform mat3 translationMatrix;',
            'uniform mat3 projectionMatrix;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '}',
          ].join('\n'),
          // fragment shader
          [
            'uniform float alpha;',
            'uniform vec3 color;',

            'void main(void){',
            '   gl_FragColor = vec4(color * alpha, alpha);',
            '}',
          ].join('\n'),
        );
      }
    }

    /**
     * a
     * @private
     * @param {*} BufferType a
     * @param {*} length a
     */
    function TypedArray(BufferType, length) {
      this.buffer = new BufferType(10);
      this.length = 0;
    }

    TypedArray.prototype = {
      reset() {
        this.length = 0;
      },
      destroy() {
        this.buffer = null;
        this.length = 0;
      },
      push(...reset) {
        if (this.length + reset.length > this.buffer.length) {
          // grow buffer
          const newBuffer = new this.buffer.constructor(Math.max(this.length + reset.length, Math.round(this.buffer.length * 2)));
          newBuffer.set(this.buffer, 0);
          this.buffer = newBuffer;
        }
        for (let i = 0; i < reset.length; i++) {
          this.buffer[this.length++] = reset[i];
        }
        return this.length;
      },
      setBuffer(buffer) {
        this.buffer = buffer;
        this.length = this.buffer.length;
      },
    };

    /**
     * An object containing WebGL specific properties to be used by the WebGL renderer
     *
     * @class
     * @private
     */
    class WebGLGraphicsData {
      /**
       * @param {WebGLRenderingContext} gl - The current WebGL drawing context
       * @param {PIXI.Shader} shader - The shader
       * @param {object} attribsState - The state for the VAO
       */
      constructor(gl, shader, attribsState) {
        /**
         * The current WebGL drawing context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        this.vertices = new TypedArray(Float32Array);
        this.indices = new TypedArray(Uint16Array);

        /**
         * The main buffer
         * @member {WebGLBuffer}
         */
        this.buffer = pixi_js.glCore.GLBuffer.createVertexBuffer(gl);

        /**
         * The index buffer
         * @member {WebGLBuffer}
         */
        this.indexBuffer = pixi_js.glCore.GLBuffer.createIndexBuffer(gl);

        /**
         * Whether this graphics is dirty or not
         * @member {boolean}
         */
        this.dirty = true;

        /**
         *
         * @member {PIXI.Shader}
         */
        this.shader = shader;

        this.vao = new pixi_js.glCore.VertexArrayObject(gl, attribsState)
          .addIndex(this.indexBuffer)
          .addAttribute(this.buffer, shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 2, 0);
      }

      /**
       * Resets the vertices and the indices
       */
      reset() {
        this.vertices.reset();
        this.indices.reset();
      }

      /**
       * Binds the buffers and uploads the data
       */
      upload() {
        // this.glPoints = new Float32Array(this.points);
        this.buffer.upload(this.vertices.buffer);

        // this.glIndices = new Uint16Array(this.indices);
        this.indexBuffer.upload(this.indices.buffer);

        this.dirty = false;
      }

      /**
       * Empties all the data
       */
      destroy() {
        this.vertices.destroy();
        this.indices.destroy();

        this.vao.destroy();
        this.buffer.destroy();
        this.indexBuffer.destroy();

        this.gl = null;

        this.buffer = null;
        this.indexBuffer = null;
      }
    }

    const ARC_RESOLUTION = 1;
    const BEZIER_CURVE_RESOLUTION = 10;

    /**
     * a
     * @private
     * @param {*} points a
     * @param {*} x a
     * @param {*} y a
     * @return {points}
     */
    function lineTo(points, x, y) {
      points.push(x, y);
      return points;
    }

    /**
     * a
     * @private
     * @param {*} a a
     * @param {*} b a
     * @return {length}
     */
    function getLength(a, b) {
      return Math.sqrt(a * a + b * b);
    }

    /**
     * a
     * @private
     * @param {*} t a
     * @param {*} p a
     * @return {number}
     */
    function CubicBezierP0(t, p) {
      const k = 1 - t;
      return k * k * k * p;
    }

    /**
     * a
     * @private
     * @param {*} t a
     * @param {*} p a
     * @return {number}
     */
    function CubicBezierP1(t, p) {
      const k = 1 - t;
      return 3 * k * k * t * p;
    }

    /**
     * a
     * @private
     * @param {*} t a
     * @param {*} p a
     * @return {number}
     */
    function CubicBezierP2(t, p) {
      return 3 * (1 - t) * t * t * p;
    }

    /**
     * a
     * @private
     * @param {*} t a
     * @param {*} p a
     * @return {number}
     */
    function CubicBezierP3(t, p) {
      return t * t * t * p;
    }

    /**
     * a
     * @private
     * @param {*} t a
     * @param {*} p0 a
     * @param {*} p1 a
     * @param {*} p2 a
     * @param {*} p3 a
     * @return {number}
     */
    function CubicBezier(t, p0, p1, p2, p3) {
      return CubicBezierP0(t, p0) + CubicBezierP1(t, p1) + CubicBezierP2(t, p2) + CubicBezierP3(t, p3);
    }

    /**
     * a
     * @private
     * @param {*} x0 a
     * @param {*} y0 a
     * @param {*} x1 a
     * @param {*} y1 a
     * @param {*} x2 a
     * @param {*} y2 a
     * @param {*} x3 a
     * @param {*} y3 a
     * @return {number}
     */
    function estimateBezierCurveLength(x0, y0, x1, y1, x2, y2, x3, y3) {
      const a = x3 - x2;
      const b = y3 - y2;
      const c = x2 - x1;
      const d = y2 - y1;
      const e = x1 - x0;
      const f = y1 - y0;
      return getLength(a, b) + getLength(c, d) + getLength(e, f);
    }

    /**
     * a
     * @private
     * @param {*} points a
     * @param {*} x1 a
     * @param {*} y1 a
     * @param {*} x2 a
     * @param {*} y2 a
     * @param {*} x3 a
     * @param {*} y3 a
     * @return {points}
     */
    function bezierCurveTo(points, x1, y1, x2, y2, x3, y3) {
      if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2) || !isFinite(x3) || !isFinite(y3)) return points;

      const x0 = points[points.length - 2];
      const y0 = points[points.length - 1];

      const lengthEstimate = estimateBezierCurveLength(x0, y0, x1, y1, x2, y2, x3, y3);
      const step = Math.min(BEZIER_CURVE_RESOLUTION / lengthEstimate, 0.5);

      for (let t = step; t < 1; t += step) {
        const x = CubicBezier(t, x0, x1, x2, x3);
        const y = CubicBezier(t, y0, y1, y2, y3);
        points.push(x, y);
      }
      points.push(x3, y3);
      return points;
    }

    /**
     * a
     * @private
     * @param {*} cmds a
     * @param {*} points a
     * @return {points}
     */
    function PathToPoints(cmds, points) {
      for (let i = 0; i < cmds.length; i++) {
        const {cmd, args} = cmds[i];
        switch (cmd) {
          case 'M':
          case 'L':
            lineTo(points, args[0], args[1]);
            break;
          case 'C':
            bezierCurveTo(points, args[0], args[1], args[2], args[3], args[4], args[5]);
            break;
        }
      }
      return points;
    }

    /**
     * a
     * @private
     * @param {*} vertices a
     * @param {*} x a
     * @param {*} y a
     * @param {*} radius a
     * @param {*} startAngle a
     * @param {*} endAngle a
     * @param {*} anticlockwise a
     */
    function addArc(vertices, x, y, radius, startAngle, endAngle, anticlockwise) {
      // bring angles all in [0, 2*PI] range
      startAngle = startAngle % (2 * Math.PI);
      endAngle = endAngle % (2 * Math.PI);
      if (startAngle < 0) startAngle += 2 * Math.PI;
      if (endAngle < 0) endAngle += 2 * Math.PI;

      if (startAngle >= endAngle) {
        endAngle += 2 * Math.PI;
      }

      let diff = endAngle - startAngle;
      let direction = 1;
      if (anticlockwise) {
        direction = -1;
        diff = 2 * Math.PI - diff;
        if (diff == 0) diff = 2 * Math.PI;
      }

      const length = diff * radius;
      let nrOfInterpolationPoints = Math.sqrt(length / ARC_RESOLUTION) >> 0;
      nrOfInterpolationPoints = nrOfInterpolationPoints % 2 === 0 ? nrOfInterpolationPoints + 1 : nrOfInterpolationPoints;
      const dangle = diff / nrOfInterpolationPoints;

      // console.log('ARC_RESOLUTION', ARC_RESOLUTION, length);
      // console.log('nrOfInterpolationPoints', nrOfInterpolationPoints);
      let angle = startAngle;
      for (let j = 0; j < nrOfInterpolationPoints + 1; j++) {
        vertices.push(x, y, x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        angle += direction * dangle;
      }
      // console.log([].concat(vertices));
    }

    /**
     * a
     * @private
     * @param {*} contour a
     * @return {Number}
     */
    function area(contour) {
      const n = contour.length;
      let a = 0.0;

      for (let p = n - 1, q = 0; q < n; p = q++) {
        a += contour[p][0] * contour[q][1] - contour[q][0] * contour[p][1];
      }

      return a * 0.5;
    }

    /**
     * a
     * @private
     * @param {*} pts a
     * @return {Boolean}
     */
    function isClockWise(pts) {
      return area(pts) > 0;
    }

    /**
     * del dash with path line
     * @private
     * @param {*} points path line pints
     * @param {*} closed is closed or not
     * @param {*} lineDash dash array
     * @param {*} lineDashOffset dash offset
     * @return {object}
     */
    function prepareLineDash(points, closed, lineDash, lineDashOffset) {
      if (closed) {
        points.push(points[0], points[1]);
      }

      let currentOffset = lineDashOffset;
      let dashIndex = 0;
      let draw = 1;
      while (currentOffset > lineDash[dashIndex]) {
        currentOffset -= lineDash[dashIndex];
        dashIndex++;
        if (draw) draw = 0;
        else draw = 1;
        if (dashIndex == lineDash.length) {
          dashIndex = 0;
        }
      }

      let newPoints = [points[0], points[1]];
      let toDrawOrNotToDraw = [draw];
      // var skipped_dash_switch = false;
      for (let i = 2; i < points.length; i += 2) {
        let line = [points[i] - points[i - 2], points[i + 1] - points[i - 1]];
        let lineLength = getLength(line[0], line[1]);
        line[0] /= lineLength;
        line[1] /= lineLength;
        let progress = 0;
        while (lineLength - progress + currentOffset >= lineDash[dashIndex]) {
          progress += lineDash[dashIndex] - currentOffset;

          currentOffset = 0;
          if (draw) draw = 0;
          else draw = 1;
          dashIndex++;
          if (dashIndex == lineDash.length) {
            dashIndex = 0;
          }

          toDrawOrNotToDraw.push(draw);
          newPoints.push(points[i - 2] + progress * line[0], points[i - 1] + progress * line[1]);
        }
        if (lineLength - progress != 0) {
          newPoints.push(points[i], points[i + 1]);
          toDrawOrNotToDraw.push(draw);
        }
        currentOffset += lineLength - progress;
      }

      // I've once wished this was available so I could continue a dash pattern with a different stroked points, so now it is
      // this.currentLineDashOffset = currentOffset;
      // for (var i = 0; i < dashIndex; i++) {
      //   this.currentLineDashOffset += lineDash[dashIndex];
      // }

      if (closed) {
        points.pop();
        points.pop();
        newPoints.pop();
        newPoints.pop();
        toDrawOrNotToDraw.pop();
      }

      return {newPoints, toDrawOrNotToDraw};
    }

    /**
     * a
     * @private
     * @param {*} path a
     * @param {*} style a
     * @param {*} vertices a
     * @return {array}
     */
    function PathToStroke(path, style, vertices) {
      // Polyline algorithm, take a piece of paper and draw it if you want to understand what is happening
      // If stroking turns out to be slow, here will be your problem. This should and can easily
      // be implemented in a geometry shader or something so it runs on the gpu. But webgl doesn't
      // support geometry shaders for some reason.

      const points = PathToPoints(path.cmds, []);
      const closed = path.isClosed;
      const useLinedash = style.lineDash.length >= 2;
      const lineWidthDiv2 = style.lineWidth / 2;
      // console.log(useLinedash, lineWidthDiv2);

      // remove duplicate points, they mess up the math
      let array = [points[0], points[1]];
      for (let i = 2; i < points.length; i += 2) {
        if (points[i] != array[array.length - 2] || points[i + 1] != array[array.length - 1]) {
          array.push(points[i], points[i + 1]);
        }
      }

      // implicitly close
      if (closed && (array[array.length - 2] != array[0] || array[array.length - 1] != array[1])) {
        array.push(array[0], array[1]);
      }

      let toDrawOrNotToDraw;
      if (useLinedash) {
        const result = prepareLineDash(array, closed, style.lineDash, style.lineDashOffset);
        toDrawOrNotToDraw = result.toDrawOrNotToDraw;
        array = result.newPoints;
      }

      const vertexOffset = vertices.length;
      let vertexProgress = vertices.length;
      const toDrawBuffer = [];

      // process lineCap
      if (!closed) {
        const line = [array[2] - array[0], array[3] - array[1]];

        const l = getLength(line[0], line[1]);
        line[0] /= l;
        line[1] /= l;
        const normal = [-line[1], line[0]];

        const a = [array[0] + lineWidthDiv2 * normal[0], array[1] + lineWidthDiv2 * normal[1]];
        const b = [array[0] - lineWidthDiv2 * normal[0], array[1] - lineWidthDiv2 * normal[1]];

        if (style.lineCap == 'butt') {
          vertices.push(a[0], a[1], b[0], b[1]);
        } else if (style.lineCap == 'square') {
          vertices.push(
            a[0] - lineWidthDiv2 * line[0],
            a[1] - lineWidthDiv2 * line[1],
            b[0] - lineWidthDiv2 * line[0],
            b[1] - lineWidthDiv2 * line[1],
          );
        } else {
          // round
          vertices.push(array[0], array[1], a[0], a[1]);
          const startAngle = Math.atan2(a[1] - array[1], a[0] - array[0]);
          const endAngle = Math.atan2(b[1] - array[1], b[0] - array[0]);
          addArc(vertices, array[0], array[1], lineWidthDiv2, startAngle, endAngle);
          vertices.push(array[0], array[1], b[0], b[1]);
          vertices.push(a[0], a[1], b[0], b[1]);
        }

        if (useLinedash) {
          const toDraw = toDrawOrNotToDraw[0];
          for (let j = vertexProgress; j < vertices.length; j += 2) {
            toDrawBuffer.push(toDraw);
          }
          vertexProgress = vertices.length;
        }
      } else {
        array.push(array[2], array[3]);
      }

      // process lineJoin
      for (let i = 2; i < array.length - 2; i += 2) {
        const line = [array[i] - array[i - 2], array[i + 1] - array[i - 1]];

        const normal = [-line[1], line[0]];
        let l = getLength(normal[0], normal[1]);
        normal[0] /= l;
        normal[1] /= l;

        let p2minp1 = [array[i + 2] - array[i], array[i + 3] - array[i + 1]];
        l = getLength(p2minp1[0], p2minp1[1]);
        p2minp1[0] /= l;
        p2minp1[1] /= l;

        let p1minp0 = [array[i] - array[i - 2], array[i + 1] - array[i - 1]];
        l = getLength(p1minp0[0], p1minp0[1]);
        p1minp0[0] /= l;
        p1minp0[1] /= l;

        let tangent = [p1minp0[0] + p2minp1[0], p1minp0[1] + p2minp1[1]];
        l = getLength(tangent[0], tangent[1]);

        let length = 0;
        let dot;
        let miter;
        if (l > 0) {
          tangent[0] /= l;
          tangent[1] /= l;
          miter = [-tangent[1], tangent[0]];
          dot = miter[0] * normal[0] + miter[1] * normal[1];
          length = lineWidthDiv2 / dot;
        } else {
          length = 0;
          miter = [-tangent[1], tangent[0]];
        }

        const a = [array[i] + length * miter[0], array[i + 1] + length * miter[1]];
        const b = [array[i] - length * miter[0], array[i + 1] - length * miter[1]];

        if (style.lineJoin == 'miter' && 1 / dot <= style.miterLimit) {
          // miter
          vertices.push(a[0], a[1], b[0], b[1]);
        } else {
          const sinAngle = p1minp0[1] * p2minp1[0] - p1minp0[0] * p2minp1[1];

          if (style.lineJoin == 'round') {
            // round
            if (sinAngle < 0) {
              const n1 = [array[i] + p1minp0[1] * lineWidthDiv2, array[i + 1] - p1minp0[0] * lineWidthDiv2];
              const n2 = [array[i] + p2minp1[1] * lineWidthDiv2, array[i + 1] - p2minp1[0] * lineWidthDiv2];
              vertices.push(a[0], a[1], n1[0], n1[1]);
              const startAngle = Math.atan2(n1[1] - array[i + 1], n1[0] - array[i]);
              const endAngle = Math.atan2(n2[1] - array[i + 1], n2[0] - array[i]);
              addArc(vertices, array[i], array[i + 1], lineWidthDiv2, startAngle, endAngle);
              vertices.push(a[0], a[1], n2[0], n2[1]);
            } else {
              const n1 = [array[i] - p1minp0[1] * lineWidthDiv2, array[i + 1] + p1minp0[0] * lineWidthDiv2];
              const n2 = [array[i] - p2minp1[1] * lineWidthDiv2, array[i + 1] + p2minp1[0] * lineWidthDiv2];
              vertices.push(n1[0], n1[1], b[0], b[1]);
              const startAngle = Math.atan2(n2[1] - array[i + 1], n2[0] - array[i]);
              const endAngle = Math.atan2(n1[1] - array[i + 1], n1[0] - array[i]);
              addArc(vertices, array[i], array[i + 1], lineWidthDiv2, startAngle, endAngle);
              vertices.push(n2[0], n2[1], b[0], b[1]);
            }
          } else {
            // bevel
            if (sinAngle < 0) {
              const n1 = [array[i] + p1minp0[1] * lineWidthDiv2, array[i + 1] - p1minp0[0] * lineWidthDiv2];
              const n2 = [array[i] + p2minp1[1] * lineWidthDiv2, array[i + 1] - p2minp1[0] * lineWidthDiv2];
              vertices.push(a[0], a[1], n1[0], n1[1], a[0], a[1], n2[0], n2[1]);
            } else {
              const n1 = [array[i] - p1minp0[1] * lineWidthDiv2, array[i + 1] + p1minp0[0] * lineWidthDiv2];
              const n2 = [array[i] - p2minp1[1] * lineWidthDiv2, array[i + 1] + p2minp1[0] * lineWidthDiv2];
              vertices.push(n1[0], n1[1], b[0], b[1], n2[0], n2[1], b[0], b[1]);
            }
          }
        }

        if (useLinedash) {
          const toDraw = toDrawOrNotToDraw[i / 2];
          for (let j = vertexProgress; j < vertices.length; j += 2) {
            toDrawBuffer.push(toDraw);
          }
          vertexProgress = vertices.length;
        }
      }

      if (!closed) {
        const line = [array[array.length - 2] - array[array.length - 4], array[array.length - 1] - array[array.length - 3]];

        const l = Math.sqrt(Math.pow(line[0], 2) + Math.pow(line[1], 2));
        line[0] /= l;
        line[1] /= l;
        const normal = [-line[1], line[0]];

        const a = [array[array.length - 2] + lineWidthDiv2 * normal[0], array[array.length - 1] + lineWidthDiv2 * normal[1]];
        const b = [array[array.length - 2] - lineWidthDiv2 * normal[0], array[array.length - 1] - lineWidthDiv2 * normal[1]];

        if (style.lineCap == 'butt') {
          vertices.push(a[0], a[1], b[0], b[1]);
        } else if (style.lineCap == 'square') {
          vertices.push(
            a[0] + lineWidthDiv2 * line[0],
            a[1] + lineWidthDiv2 * line[1],
            b[0] + lineWidthDiv2 * line[0],
            b[1] + lineWidthDiv2 * line[1],
          );
        } else {
          // round
          vertices.push(a[0], a[1], b[0], b[1]);
          vertices.push(array[array.length - 2], array[array.length - 1], b[0], b[1]);
          const startAngle = Math.atan2(b[1] - array[array.length - 1], b[0] - array[array.length - 2]);
          const endAngle = Math.atan2(a[1] - array[array.length - 1], a[0] - array[array.length - 2]);
          addArc(vertices, array[array.length - 2], array[array.length - 1], lineWidthDiv2, startAngle, endAngle);
          vertices.push(array[array.length - 2], array[array.length - 1], a[0], a[1]);
        }
      } else {
        vertices.push(
          vertices.buffer[vertexOffset],
          vertices.buffer[vertexOffset + 1],
          vertices.buffer[vertexOffset + 2],
          vertices.buffer[vertexOffset + 3],
        );
      }

      if (useLinedash) {
        const toDraw = toDrawOrNotToDraw[toDrawOrNotToDraw.length - 1];
        for (let j = vertexProgress; j < vertices.length; j += 2) {
          toDrawBuffer.push(toDraw);
        }
        vertexProgress = vertices.length;
      }

      return toDrawBuffer;
    }

    /**
     * build shape from path
     * @private
     * @param {*} path path line
     * @param {*} vertices vertices
     * @param {*} holes holes
     * @return {Boolean} shape empty or not
     */
    function PathToShape(path, vertices) {
      const closed = path.isClosed;
      let empty = true;

      const points = PathToPoints(path.cmds, []);

      // remove duplicate points, they mess up the math
      let array = [points[0], points[1]];
      for (let i = 2; i < points.length; i += 2) {
        if (points[i] != array[array.length - 2] || points[i + 1] != array[array.length - 1]) {
          array.push(points[i], points[i + 1]);
        }
      }

      // implicitly close
      if (closed && (array[array.length - 2] != array[0] || array[array.length - 1] != array[1])) {
        array.push(array[0], array[1]);
      }

      if (array.length >= 6) {
        for (let i = 0; i < array.length; i++) {
          vertices.push(array[i]);
        }
        empty = false;
      }
      return empty;
    }

    // import { hex2rgb } from '../../utils';

    /**
     * Renders the graphics object.
     *
     * @class
     * @private
     * @extends PIXI.ObjectRenderer
     */
    class LottieGraphicsRenderer extends pixi_js.ObjectRenderer {
      /**
       * @param {PIXI.WebGLRenderer} renderer - The renderer this object renderer works for.
       */
      constructor(renderer) {
        super(renderer);

        this.graphicsDataPool = [];

        this.primitiveShader = null;

        this.webGLData = null;

        this.gl = renderer.gl;

        // easy access!
        this.CONTEXT_UID = 0;
      }

      /**
       * Called when there is a WebGL context change
       *
       * @private
       *
       */
      onContextChange() {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
        this.primitiveShader = new PrimitiveShader(this.gl);
      }

      /**
       * Destroys this renderer.
       *
       */
      destroy() {
        pixi_js.ObjectRenderer.prototype.destroy.call(this);

        for (let i = 0; i < this.graphicsDataPool.length; ++i) {
          this.graphicsDataPool[i].destroy();
        }

        this.graphicsDataPool = null;
      }

      /**
       * Renders a graphics object.
       *
       * @param {PIXI.Graphics} graphics - The graphics object to render.
       */
      render(graphics) {
        const renderer = this.renderer;
        const gl = renderer.gl;

        const webGLData = this.getWebGLData(graphics);

        if (graphics.isDirty) this.updateGraphics(graphics, webGLData);

        if (webGLData.indices.length === 0) return;

        // This  could be speeded up for sure!
        const shader = this.primitiveShader;

        renderer.bindShader(shader);
        renderer.state.setBlendMode(graphics.blendMode);

        shader.uniforms.translationMatrix = graphics.transform.worldTransform.toArray(true);
        shader.uniforms.color = pixi_js.utils.hex2rgb(graphics.color);
        shader.uniforms.alpha = graphics.worldAlpha;

        // TODO: 需要增加是否开启开关
        // if (graphics.drawType === 'stroke') {
        //   this.renderer.state.setDepthTest(true);
        // }

        renderer.bindVao(webGLData.vao);

        webGLData.vao.draw(gl.TRIANGLES, webGLData.indices.length);

        // if (graphics.drawType === 'stroke') {
        //   this.renderer.state.setDepthTest(false);
        // }
      }

      /**
       * Updates the graphics object
       *
       * @private
       * @param {PIXI.Graphics} graphics - The graphics object to update
       * @param {PIXI.Graphics} webGLData - The graphics object to update
       */
      updateGraphics(graphics, webGLData) {
        webGLData.reset();
        if (graphics.drawType === 'stroke') {
          this.buildStroke(graphics, webGLData);
        } else {
          this.buildFill(graphics, webGLData);
        }
        // console.log('groups', this.vertices.buffer, this.indices.buffer);
        graphics.isDirty = false;
      }

      /**
       * a
       * @param {*} graphics a
       * @param {PIXI.Graphics} webGLData - The graphics object to update
       */
      buildStroke(graphics, webGLData) {
        const {vertices, indices} = webGLData;

        const {paths, lineStyle} = graphics;
        const useLinedash = lineStyle.lineDash.length >= 2;

        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];

          const vertexOffset = vertices.length / 2;
          const toDrawBuffer = PathToStroke(path, lineStyle, vertices);
          if (useLinedash) {
            for (let i = vertexOffset + 2; i < vertices.length / 2; i += 2) {
              if (toDrawBuffer[i - vertexOffset - 1]) {
                indices.push(i - 2, i, i - 1, i, i + 1, i - 1);
              }
            }
          } else {
            for (let i = vertexOffset + 2; i < vertices.length / 2; i += 2) {
              indices.push(i - 2, i, i - 1, i, i + 1, i - 1);
            }
          }
        }
        webGLData.upload();
      }

      /**
       * a
       * @param {*} graphics a
       * @param {PIXI.Graphics} webGLData - The graphics object to update
       */
      buildFill(graphics, webGLData) {
        const {vertices, indices} = webGLData;
        const {paths} = graphics;

        let meshVertices = [];
        const meshIndices = [];
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];

          const fillVertices = [];
          const isEmpty = PathToShape(path, fillVertices);

          if (isEmpty) break;

          const holes = path.holes;
          const holeIndices = [];
          for (let j = 0; j < holes.length; j++) {
            const pathHole = holes[j];
            const cacheLength = fillVertices.length;
            const isEmpty = PathToShape(pathHole, fillVertices);
            if (isEmpty) break;
            holeIndices.push(cacheLength / 2);
          }
          const triangles = pixi_js.utils.earcut(fillVertices, holeIndices, 2);

          const vertexOffset = meshVertices.length / 2;
          for (let j = 0; j < fillVertices.length; j += 2) {
            meshVertices.push(fillVertices[j], fillVertices[j + 1]);
          }
          for (let j = 0; j < triangles.length; j += 3) {
            meshIndices.push(vertexOffset + triangles[j], vertexOffset + triangles[j + 1], vertexOffset + triangles[j + 2]);
          }
        }

        if (meshVertices.length < 6 || meshIndices < 3) return;

        vertices.setBuffer(new Float32Array(meshVertices));
        indices.setBuffer(new Uint16Array(meshIndices));
        webGLData.upload();
      }

      /**
       *
       * @private
       * @param {PIXI.Graphics} graphics - The graphics object to render.
       * @return {WebGLGraphicsData} webGLData
       */
      getWebGLData(graphics) {
        if (!graphics.webGLData || this.CONTEXT_UID !== graphics.webGLData.CONTEXT_UID) {
          graphics.webGLData = new WebGLGraphicsData(this.renderer.gl, this.primitiveShader, this.renderer.state.attribState);
          graphics.webGLData.CONTEXT_UID = this.CONTEXT_UID;
        }
        return graphics.webGLData;
      }
    }

    pixi_js.WebGLRenderer.registerPlugin('lottiegraphics', LottieGraphicsRenderer);

    /**
     * Renders the graphics object.
     *
     * @class
     * @private
     * @extends PIXI.ObjectRenderer
     */
    class CanvasLottieGraphicsRenderer {
      /**
       * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
       */
      constructor(renderer) {
        this.renderer = renderer;
      }

      /**
       * Destroys this renderer.
       *
       */
      destroy() {
        this.renderer = null;
      }

      /**
       * Renders a graphics object.
       *
       * @param {PIXI.Graphics} graphics - The graphics object to render.
       */
      render(graphics) {
        const renderer = this.renderer;
        const context = renderer.context;
        const lineStyle = graphics.lineStyle;
        const worldAlpha = graphics.worldAlpha;
        const transform = graphics.transform.worldTransform;
        const resolution = renderer.resolution;

        context.setTransform(
          transform.a * resolution,
          transform.b * resolution,
          transform.c * resolution,
          transform.d * resolution,
          transform.tx * resolution,
          transform.ty * resolution,
        );

        renderer.setBlendMode(graphics.blendMode);

        context.globalAlpha = worldAlpha;
        if (graphics.drawType === 'stroke') {
          context.lineWidth = lineStyle.lineWidth;
          context.lineJoin = lineStyle.lineJoin;
          context.miterLimit = lineStyle.miterLimit;
          context.lineCap = lineStyle.lineCap;
          context.lineDashOffset = lineStyle.lineDashOffset;
          context.setLineDash(lineStyle.lineDash || []);
          this.buildStroke(graphics);
        } else {
          this.buildFill(graphics);
        }
      }

      /**
       * a
       * @param {*} graphics a
       */
      buildStroke(graphics) {
        const renderer = this.renderer;
        const context = renderer.context;
        const color = `#${`00000${(graphics.color | 0).toString(16)}`.substr(-6)}`;
        const {paths, lineStyle} = graphics;

        context.lineWidth = lineStyle.lineWidth;
        context.lineJoin = lineStyle.lineJoin;
        context.miterLimit = lineStyle.miterLimit;
        context.lineCap = lineStyle.lineCap;
        context.lineDashOffset = lineStyle.lineDashOffset;
        context.setLineDash(lineStyle.lineDash || []);

        context.beginPath();
        for (let i = 0; i < paths.length; i++) {
          this.drawPath(context, paths[i]);
        }

        context.strokeStyle = color;
        context.stroke();
      }

      /**
       * a
       * @param {*} graphics a
       */
      buildFill(graphics) {
        const renderer = this.renderer;
        const context = renderer.context;
        const color = `#${`00000${(graphics.color | 0).toString(16)}`.substr(-6)}`;
        const {paths} = graphics;

        context.beginPath();
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];

          this.drawPath(context, path);

          for (let j = 0; j < path.holes.length; j++) {
            this.drawPath(context, path.holes[j]);
          }
        }
        context.fillStyle = color;
        context.fill();
      }

      /**
       * a
       * @param {*} context a
       * @param {*} path a
       */
      drawPath(context, path) {
        for (let i = 0; i < path.cmds.length; i++) {
          const {cmd, args} = path.cmds[i];
          switch (cmd) {
            case 'M':
              context.moveTo(args[0], args[1]);
              break;
            case 'L':
              context.lineTo(args[0], args[1]);
              break;
            case 'C':
              context.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
              break;
          }
        }
      }
    }

    pixi_js.CanvasRenderer.registerPlugin('lottiegraphics', CanvasLottieGraphicsRenderer);

    /**
     * a
     * @private
     */
    class PathCMD {
      /**
       * a
       */
      constructor() {
        this.cmds = [];
        this.holes = [];
        this.isClosed = false;
        this.isClockWise = false;
      }

      /**
       * a
       * @return {number}
       */
      getLength() {
        return this.cmds.length;
      }

      /**
       * a
       * @param {*} cmd a
       * @param {*} args a
       */
      add(cmd, args) {
        this.cmds.push({cmd, args});
      }

      /**
       * Moves the current drawing position to x, y.
       *
       * @param {number} x - the X coordinate to move to
       * @param {number} y - the Y coordinate to move to
       */
      moveTo(x = 0, y = 0) {
        this.add('M', [x, y]);
      }

      /**
       * Moves the current drawing position to x, y.
       *
       * @param {number} x - the X coordinate to move to
       * @param {number} y - the Y coordinate to move to
       */
      lineTo(x, y) {
        this.add('L', [x, y]);
      }

      /**
       * Calculate the points for a bezier curve and then draws it.
       *
       * @param {number} cpX - Control point x
       * @param {number} cpY - Control point y
       * @param {number} cpX2 - Second Control point x
       * @param {number} cpY2 - Second Control point y
       * @param {number} toX - Destination point x
       * @param {number} toY - Destination point y
       */
      bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
        this.add('C', [cpX, cpY, cpX2, cpY2, toX, toY]);
      }

      /**
       * a
       */
      closePath() {
        this.isClosed = true;
      }
    }

    /**
     * LottieGraphics class
     * @class
     * @private
     * @extends Container
     */
    class LottieGraphics extends pixi_js.Container {
      /**
       * LottieGraphics class
       */
      constructor() {
        super();
        this.paths = [];
        this._samplerPoints = [];
        this.currentPath = null;
        this.color = 0x000000;
        this.lineStyle = {
          lineWidth: 1,
          lineJoin: 'miter',
          miterLimit: 10.0,
          lineCap: 'butt',
          lineDash: [], // [5, 5],
          lineDashOffset: 0,
        };
        this.isDirty = true;

        this.drawType = '';

        /**
         * The blend mode to be applied to the graphic shape. Apply a value of
         * `BLEND_MODES.NORMAL` to reset the blend mode.
         *
         * @member {number}
         * @default BLEND_MODES.NORMAL
         */
        this.blendMode = pixi_js.BLEND_MODES.NORMAL;

        /**
         * store webgl data object
         */
        this.webGLData = null;

        /**
         * mark first shape is clock wise or not
         */
        this.firstIsClockWise = true;

        /**
         * mark pre shape is clock wise or not
         */
        this.preClockWiseStatus = null;
      }

      /**
       * clear all paths
       */
      clear() {
        this.paths.length = 0;
        this.currentPath = null;

        this.firstIsClockWise = true;
        this.preClockWiseStatus = null;

        this.isDirty = true;
      }

      /**
       * Moves the current drawing position to x, y.
       *
       * @param {number} x - the X coordinate to move to
       * @param {number} y - the Y coordinate to move to
       */
      moveTo(x = 0, y = 0) {
        this.endPath();
        this.currentPath = new PathCMD();
        this.currentPath.moveTo(x, y);

        this._samplerPoints.push([x, y]);
      }

      /**
       * Moves the current drawing position to x, y.
       *
       * @param {number} x - the X coordinate to move to
       * @param {number} y - the Y coordinate to move to
       */
      lineTo(x, y) {
        this.currentPath.lineTo(x, y);

        this._samplerPoints.push([x, y]);
      }

      /**
       * Calculate the points for a bezier curve and then draws it.
       *
       * @param {number} cpX - Control point x
       * @param {number} cpY - Control point y
       * @param {number} cpX2 - Second Control point x
       * @param {number} cpY2 - Second Control point y
       * @param {number} toX - Destination point x
       * @param {number} toY - Destination point y
       */
      bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
        this.currentPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);

        this._samplerPoints.push([toX, toY]);
      }

      /**
       * end a path
       */
      endPath() {
        if (this.currentPath && this.currentPath.getLength() > 1) {
          const length = this.paths.length;
          const newPathIsClockWise = isClockWise(this._samplerPoints);
          this.currentPath.isClockWise = newPathIsClockWise;

          if (length === 0) this.firstIsClockWise = newPathIsClockWise;

          const needHole =
            length > 0 && this.preClockWiseStatus === this.firstIsClockWise && this.preClockWiseStatus !== newPathIsClockWise;

          if (needHole) {
            const prePath = length > 0 ? this.paths[length - 1] : null;
            prePath.holes.push(this.currentPath);
          } else {
            this.paths.push(this.currentPath);
            this.preClockWiseStatus = newPathIsClockWise;
          }

          this.currentPath = null;
          this.isDirty = true;
        }
        this._samplerPoints.length = 0;
      }

      /**
       * close a path
       */
      closePath() {
        this.currentPath.closePath();
      }

      /**
       * stroke paths
       */
      stroke() {
        this.endPath();
        this.drawType = 'stroke';
      }

      /**
       * fill paths
       */
      fill() {
        if (this.currentPath === null) return;
        this.closePath();
        this.endPath();
        this.drawType = 'fill';
      }

      /**
       * Renders the object using the WebGL renderer
       *
       * @private
       * @param {PIXI.WebGLRenderer} renderer - The renderer
       */
      _renderWebGL(renderer) {
        renderer.setObjectRenderer(renderer.plugins.lottiegraphics);
        renderer.plugins.lottiegraphics.render(this);
      }

      /**
       * Renders the object using the WebGL renderer
       *
       * @private
       * @param {PIXI.WebGLRenderer} renderer - The renderer
       */
      _renderCanvas(renderer) {
        renderer.plugins.lottiegraphics.render(this);
      }
    }

    /**
     * PathLottie class
     * @class
     * @private
     */
    class PathLottie extends LottieGraphics {
      /**
       * PathLottie constructor
       * @param {object} lottieElement lottie element object
       * @param {object} config layer data information
       */
      constructor(lottieElement, config) {
        super();
        this.lottieElement = lottieElement;
        this.config = config;
        this.passMatrix = new pixi_js.Matrix();
      }

      /**
       * a
       */
      setShapeTransform() {
        const trProps = this.lottieElement.preTransforms.finalTransform.props;
        this.passMatrix.set(trProps[0], trProps[1], trProps[4], trProps[5], trProps[12], trProps[13]);
        this.transform.setFromMatrix(this.passMatrix);
      }

      /**
       * Updates the object transform for rendering
       */
      updateTransform() {
        this.setShapeTransform();
        this.transform.updateTransform(this.parent.transform);
        // multiply the alphas..
        this.worldAlpha = this.alpha * this.parent.worldAlpha;

        this._bounds.updateID++;
      }

      /**
       * a
       * @param {*} style a
       */
      updateLottieGrahpics(style) {
        // Skipping style when
        // Stroke width equals 0
        // style should not be rendered (extra unused repeaters)
        // current opacity equals 0
        // global opacity equals 0
        const type = style.type;
        this.clear();
        if (((type === 'st' || type === 'gs') && style.wi === 0) || !style.data._shouldRender || style.coOp === 0) {
          return;
        }

        // ctx.save();
        const shapes = style.elements;
        const jLen = shapes.length;
        for (let j = 0; j < jLen; j += 1) {
          const nodes = shapes[j].trNodes;
          const kLen = nodes.length;

          for (let k = 0; k < kLen; k++) {
            if (nodes[k].t == 'm') {
              this.moveTo(nodes[k].p[0], nodes[k].p[1]);
            } else if (nodes[k].t == 'c') {
              this.bezierCurveTo(
                nodes[k].pts[0],
                nodes[k].pts[1],
                nodes[k].pts[2],
                nodes[k].pts[3],
                nodes[k].pts[4],
                nodes[k].pts[5],
              );
            } else {
              this.closePath();
            }
          }
        }

        if (type === 'st' || type === 'gs') {
          if (style.da) {
            this.lineStyle.lineDash = style.da;
            this.lineStyle.lineDashOffset = style.do;
          } else {
            this.lineStyle.lineDash = [];
          }
        }

        if (type === 'st' || type === 'gs') {
          this.lineStyle.lineWidth = style.wi;
          this.lineStyle.lineCap = style.lc;
          this.lineStyle.lineJoin = style.lj;
          this.lineStyle.miterLimit = style.ml || 0;
          this.color = Tools.rgb2hex(style.co || style.grd);
          this.alpha = style.coOp;
          this.stroke();
        } else {
          this.color = Tools.rgb2hex(style.co || style.grd);
          this.alpha = style.coOp;
          this.fill();
        }
      }
    }

    /**
     * SolidElement class
     * @class
     * @private
     */
    class SolidElement extends pixi_js.Graphics {
      /**
       * SolidElement constructor
       * @param {object} lottieElement lottie element object
       * @param {object} config layer data information
       */
      constructor(lottieElement, config) {
        super();
        this.lottieElement = lottieElement;
        this.config = config;

        const hex = parseInt(config.color.replace('#', ''), 16);
        this.beginFill(hex);
        this.drawRect(0, 0, config.rect.width, config.rect.height);
        this.endFill();
      }

      /**
       * call it when this layer had finish lottie parse
       */
      onSetupLottie() {
        if (this.lottieElement.hasValidMasks()) {
          const preCompBox = this.config.session.local;
          this.graphicsMasks = new LottieGraphicsMask(preCompBox);
          this.mask = this.graphicsMasks;
          this.addChild(this.mask);
        }
      }

      /**
       * a
       * @param {*} parent a
       */
      setHierarchy(parent) {
        this.hierarchy = parent;
      }

      /**
       * a
       */
      show() {
        this.visible = true;
      }

      /**
       * a
       */
      hide() {
        this.visible = false;
      }

      /**
       * a
       * @param {*} transform
       */
      updateLottieTransform(transform) {
        this.x = transform.x;
        this.y = transform.y;
        this.pivot.x = transform.anchorX;
        this.pivot.y = transform.anchorY;
        this.scale.x = transform.scaleX;
        this.scale.y = transform.scaleY;
        this.rotation = transform.rotation;
        this.alpha = transform.alpha;
      }

      /**
       * a
       * @param {*} masks a
       */
      updateLottieMasks(masks) {
        if (!this.graphicsMasks) return;
        this.graphicsMasks.updateMasks(masks);
      }
    }

    /**
     * SpriteElement class
     * @class
     * @private
     */
    class SpriteElement extends pixi_js.Sprite {
      /**
       * SpriteElement constructor
       * @param {object} lottieElement lottie element object
       * @param {object} config layer data information
       */
      constructor(lottieElement, config) {
        const {texture, asset} = config;
        super(texture);

        if (texture.baseTexture.hasLoaded) {
          texture.orig = new pixi_js.Rectangle(0, 0, asset.w, asset.h);
          texture._updateUvs();
        } else {
          texture.baseTexture.on('loaded', () => {
            texture.orig = new pixi_js.Rectangle(0, 0, asset.w, asset.h);
            texture._updateUvs();
          });
        }

        this.lottieElement = lottieElement;
        this.config = config;
      }

      /**
       * call it when this layer had finish lottie parse
       */
      onSetupLottie() {
        if (this.lottieElement.hasValidMasks()) {
          const preCompBox = this.config.session.local;
          this.graphicsMasks = new LottieGraphicsMask(preCompBox);
          this.mask = this.graphicsMasks;
          this.addChild(this.mask);
        }
      }

      /**
       * a
       * @param {*} parent a
       */
      setHierarchy(parent) {
        this.hierarchy = parent;
      }

      /**
       * a
       */
      show() {
        this.visible = true;
      }

      /**
       * a
       */
      hide() {
        this.visible = false;
      }

      /**
       * a
       * @param {*} transform
       */
      updateLottieTransform(transform) {
        this.x = transform.x;
        this.y = transform.y;
        this.pivot.x = transform.anchorX;
        this.pivot.y = transform.anchorY;
        this.scale.x = transform.scaleX;
        this.scale.y = transform.scaleY;
        this.rotation = transform.rotation;
        this.alpha = transform.alpha;
      }

      /**
       * a
       * @param {*} masks a
       */
      updateLottieMasks(masks) {
        if (!this.graphicsMasks) return;
        this.graphicsMasks.updateMasks(masks);
      }
    }

    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Path, PathPrimitive);
    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Null, CompElement);
    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Path, PathLottie);
    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Shape, CompElement);
    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Solid, SolidElement);
    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Sprite, SpriteElement);
    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Component, CompElement);
    // DisplayRegister.registerDisplayByType(DisplayRegister.Type.Container, Container);

    const regHttp = /^(https?:)?\/\//;

    /**
     * prefix
     * @private
     * @param {object} asset asset
     * @param {string} prefix prefix
     * @return {string}
     */
    function createUrl(asset, prefix) {
      if (asset.e === 1) return asset.p;
      if (prefix) prefix = prefix.replace(/\/?$/, '/');
      const up = asset.u + asset.p;
      let url = '';
      if (asset.up) {
        url = asset.up;
      } else {
        url = regHttp.test(up) ? up : prefix + up;
      }
      return url;
    }

    /**
     * an texture loader
     * @private
     */
    class LoadTexture extends Eventer {
      /**
       * an texture loader
       * @param {array} assets assets
       * @param {object} options options
       * @param {string} [options.prefix] prefix
       * @param {boolean} [options.autoLoad=true] autoLoad
       */
      constructor(assets, {prefix, autoLoad = true}) {
        super();
        this.assets = assets;
        this.prefix = prefix || '';
        this.textures = {};
        this._total = 0;
        this._failed = 0;
        this._received = 0;
        this.loaded = false;
        if (autoLoad) this.load();
      }

      /**
       * load assets
       */
      load() {
        this.assets.forEach(asset => {
          const id = asset.id;
          const url = createUrl(asset, this.prefix);
          const texture = pixi_js.Texture.fromImage(url, '*');
          this.textures[id] = texture;
          this._total++;
          if (texture.baseTexture.hasLoaded) {
            this._received++;
            this.emit('update');
            if (this._received + this._failed >= this._total) this._onComplete();
          } else {
            texture.baseTexture.once('loaded', () => {
              this._received++;
              this.emit('update');
              if (this._received + this._failed >= this._total) this._onComplete();
            });
            texture.baseTexture.once('error', () => {
              this._failed++;
              this.emit('update');
              if (this._received + this._failed >= this._total) this._onComplete();
            });
          }
        });
      }

      /**
       * complete handle
       */
      _onComplete() {
        this.loaded = true;
        this.emit('complete');
        if (this._failed > 0) {
          if (this._failed >= this._total) {
            this.emit('fail');
          } else {
            this.emit('partlyfail', this._failed);
          }
        }
      }

      /**
       * get texture by id
       * @param {string} id id
       * @return {Texture} texture
       */
      getTextureById(id) {
        return this.textures[id];
      }
    }

    /**
     * format response
     * @private
     * @param {*} xhr xhr object
     * @return {object}
     */
    function formatResponse(xhr) {
      if (xhr.response && typeof xhr.response === 'object') {
        return xhr.response;
      } else if (xhr.response && typeof xhr.response === 'string') {
        return JSON.parse(xhr.response);
      } else if (xhr.responseText) {
        return JSON.parse(xhr.responseText);
      }
    }

    /**
     * load a json data
     * @private
     * @param {String} path json url path
     * @param {Function} callback success callback
     * @param {Function} errorCallback error callback
     */
    function loadAjax(path, callback, errorCallback) {
      let response;
      let xhr = new XMLHttpRequest();
      xhr.open('GET', path, true);
      // set responseType after calling open or IE will break.
      try {
        // This crashes on Android WebView prior to KitKat
        xhr.responseType = 'json';
      } catch (err) {
        console.error('lottie-pixi loadAjax:', err);
      }
      xhr.send();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            response = formatResponse(xhr);
            callback(response);
          } else {
            try {
              response = formatResponse(xhr);
              callback(response);
            } catch (err) {
              if (errorCallback) {
                errorCallback(err);
              }
            }
          }
        }
      };
    }

    /**
     * load json
     * @private
     */
    class LoadJson extends Eventer {
      /**
       * load json
       * @param {String} path json url
       */
      constructor(path) {
        super();
        this.path = path;
        this.onSuccess = this.onSuccess.bind(this);
        this.onFail = this.onFail.bind(this);
        loadAjax(path, this.onSuccess, this.onFail);
      }

      /**
       * on success handle
       * @param {Object} response response json
       */
      onSuccess(response) {
        this.emit('success', response);
        this.emit('complete', response);
      }

      /**
       * on fail handle
       * @param {Object} error error
       */
      onFail(error) {
        this.emit('fail', error);
        this.emit('error', error);
      }
    }

    /* eslint no-cond-assign: "off" */
    /* eslint new-cap: 0 */
    /* eslint max-len: 0 */

    /**
     * timing-function set
     *
     * ```js
     * // demo-A
     * dispayA.animate({
     *   from: {x: 100},
     *   to: {x: 200},
     *   ease: Tween.Ease.In, // use which timing-function ?
     * })
     *
     * // demo-B
     * dispayB.animate({
     *   from: {x: 100},
     *   to: {x: 200},
     *   ease: Tween.Ease.Bezier(0.4, 0.34, 0.6, 0.78), // use which timing-function ?
     * })
     * ```
     * @namespace Tween
     */

    const Tween = {
      /**
       * Tween.Linear timing-function set
       *
       * @alias Linear
       * @memberof Tween
       * @enum {function}
       */
      Linear: {
        /**
         * Tween.Linear.None
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        None(k) {
          return k;
        },
      },

      /**
       * Tween.Ease timing-function set
       *
       * 其中 `Ease.Bezier` 比较特殊，是个工厂函数，传入控制点可以构造你想要的贝塞尔曲线。{@link https://jasonchen1982.github.io/jcc2d/examples/demo_animation_bezier/index.html}
       * ```javascript
       * const ease = Tween.Ease.Bezier(0.4, 0.34, 0.6, 0.78);
       * ```
       * @alias Ease
       * @memberof Tween
       * @enum {function}
       */
      Ease: {
        /**
         * Tween.Ease.In
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        In: (function () {
          const bezier = new BezierEasing(0.42, 0, 1, 1);
          return function (k) {
            return bezier.get(k);
          };
        })(),

        /**
         * Tween.Ease.Out
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        Out: (function () {
          const bezier = new BezierEasing(0, 0, 0.58, 1);
          return function (k) {
            return bezier.get(k);
          };
        })(),

        /**
         * Tween.Ease.InOut
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        InOut: (function () {
          const bezier = new BezierEasing(0.42, 0, 0.58, 1);
          return function (k) {
            return bezier.get(k);
          };
        })(),

        /**
         * Tween.Ease.Bezier
         * @param {*} x1 control point-in x component
         * @param {*} y1 control point-in y component
         * @param {*} x2 control point-out x component
         * @param {*} y2 control point-out y component
         * @return {bezier} return bezier function and cacl number
         */
        Bezier(x1, y1, x2, y2) {
          const bezier = new BezierEasing(x1, y1, x2, y2);
          return function (k) {
            return bezier.get(k);
          };
        },
      },

      /**
       * Tween.Elastic timing-function set
       *
       * @alias Elastic
       * @memberof Tween
       * @enum {function}
       */
      Elastic: {
        /**
         * Tween.Elastic.In
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        In(k) {
          if (k === 0) {
            return 0;
          }
          if (k === 1) {
            return 1;
          }
          return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
        },

        /**
         * Tween.Elastic.Out
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        Out(k) {
          if (k === 0) {
            return 0;
          }
          if (k === 1) {
            return 1;
          }
          return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
        },

        /**
         * Tween.Elastic.InOut
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        InOut(k) {
          if (k === 0) {
            return 0;
          }
          if (k === 1) {
            return 1;
          }
          k *= 2;
          if (k < 1) {
            return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
          }
          return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
        },
      },

      /**
       * Tween.Back timing-function set
       *
       * @alias Back
       * @memberof Tween
       * @enum {function}
       */
      Back: {
        /**
         * Tween.Back.In
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        In(k) {
          const s = 1.70158;
          return k * k * ((s + 1) * k - s);
        },

        /**
         * Tween.Back.Out
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        Out(k) {
          const s = 1.70158;
          return --k * k * ((s + 1) * k + s) + 1;
        },

        /**
         * Tween.Back.InOut
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        InOut(k) {
          const s = 1.70158 * 1.525;
          if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
          }
          return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        },
      },

      /**
       * Tween.Bounce timing-function set
       *
       * @alias Bounce
       * @memberof Tween
       * @enum {function}
       */
      Bounce: {
        /**
         * Tween.Bounce.In
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        In(k) {
          return 1 - Tween.Bounce.Out(1 - k);
        },

        /**
         * Tween.Bounce.Out
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        Out(k) {
          if (k < 1 / 2.75) {
            return 7.5625 * k * k;
          } else if (k < 2 / 2.75) {
            return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
          } else if (k < 2.5 / 2.75) {
            return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
          }
          return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
        },

        /**
         * Tween.Bounce.InOut
         * @param {number} k 0 - 1 time progress
         * @return {number}
         */
        InOut(k) {
          if (k < 0.5) {
            return Tween.Bounce.In(k * 2) * 0.5;
          }
          return Tween.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        },
      },
    };

    /**
     * 动画对象的基本类型
     *
     * @class
     * @private
     * @extends Eventer
     * @param {object} [options] 动画配置信息
     */
    function Animator(options) {
      Eventer.call(this);

      /**
       * 渲染对象
       * @member {PIXI.Display}
       */
      this.element = options.element || {};

      /**
       * 动画时长
       * @member {number}
       */
      this.duration = options.duration || 300;

      /**
       * 动画是否有效
       * @member {boolean}
       */
      this.living = true;

      /**
       * 动画是否需要常驻/永生
       * @member {boolean}
       */
      this.resident = options.resident || false;

      /**
       * 动画是否无限循环播放
       * @member {boolean}
       */
      this.infinite = options.infinite || false;

      /**
       * 动画是否交替播放
       * @member {boolean}
       */
      this.alternate = options.alternate || false;

      /**
       * 动画重复播放次数
       * @member {number}
       */
      this.repeats = options.repeats || 0;

      /**
       * 动画开始前延迟时间
       * @member {number}
       */
      this.delay = options.delay || 0;

      /**
       * 动画开始前等待时间，只影响首轮播放
       * @member {number}
       */
      this.wait = options.wait || 0;

      /**
       * 动画播放时间缩放因子
       * @member {number}
       */
      this.timeScale = Tools.isNumber(options.timeScale) ? options.timeScale : 1;

      if (options.onComplete) {
        this.on('complete', options.onComplete.bind(this));
      }
      if (options.onUpdate) {
        this.on('update', options.onUpdate.bind(this));
      }

      this.init();

      /**
       * 动画是否暂停
       * @member {number}
       */
      this.paused = false;
    }

    Animator.prototype = Object.create(Eventer.prototype);

    /**
     * 更新动画
     * @param {number} snippet 时间片段
     * @return {object} pose
     */
    Animator.prototype.update = function (snippet) {
      const snippetCache = this.direction * this.timeScale * snippet;
      if (this.waitCut > 0) {
        this.waitCut -= Math.abs(snippetCache);
        return;
      }
      if (this.paused || !this.living || this.delayCut > 0) {
        if (this.delayCut > 0) this.delayCut -= Math.abs(snippetCache);
        return;
      }

      this.progress += snippetCache;
      let isEnd = false;
      const progressCache = this.progress;

      if (this.spill()) {
        if (this.repeatsCut > 0 || this.infinite) {
          if (this.repeatsCut > 0) --this.repeatsCut;
          this.delayCut = this.delay;
          if (this.alternate) {
            this.direction *= -1;
            this.progress = Tools.codomainBounce(this.progress, 0, this.duration);
          } else {
            this.direction = 1;
            this.progress = Tools.euclideanModulo(this.progress, this.duration);
          }
        } else {
          isEnd = true;
        }
      }

      let pose;
      if (!isEnd) {
        pose = this.nextPose();
        this.emit('update', pose, this.progress / this.duration);
      } else {
        if (!this.resident) this.living = false;
        this.progress = Tools.clamp(progressCache, 0, this.duration);
        pose = this.nextPose();
        this.emit('complete', pose, progressCache - this.progress);
      }
      return pose;
    };

    /**
     * 检查动画是否到了边缘
     * @private
     * @return {boolean}
     */
    Animator.prototype.spill = function () {
      const bottomSpill = this.progress <= 0 && this.direction === -1;
      const topSpill = this.progress >= this.duration && this.direction === 1;
      return bottomSpill || topSpill;
    };

    /**
     * 初始化动画状态
     * @private
     */
    Animator.prototype.init = function () {
      this.direction = 1;
      this.progress = 0;
      this.repeatsCut = this.repeats;
      this.delayCut = this.delay;
      this.waitCut = this.wait;
    };

    /**
     * 下一帧的数据
     * @private
     */
    Animator.prototype.nextPose = function () {
      console.warn('should be overwrite');
    };

    /**
     * 线性插值
     * @private
     * @param {number} p0 起始位置
     * @param {number} p1 结束位置
     * @param {number} t  进度位置
     * @return {number} value
     */
    Animator.prototype.linear = function (p0, p1, t) {
      return (p1 - p0) * t + p0;
    };

    /**
     * 设置动画的速率
     * @param {number} speed 设置播放速度，时间缩放因子
     * @return {this}
     */
    Animator.prototype.setSpeed = function (speed) {
      this.timeScale = speed;
      return this;
    };

    /**
     * 暂停动画
     * @return {this}
     */
    Animator.prototype.pause = function () {
      this.paused = true;
      return this;
    };

    /**
     * 恢复动画
     * @return {this}
     */
    Animator.prototype.resume = function () {
      this.paused = false;
      return this;
    };

    Animator.prototype.restart = Animator.prototype.resume;

    /**
     * 停止动画，并把状态置为最后一帧，会触发事件
     * @return {this}
     */
    Animator.prototype.stop = function () {
      this.repeats = 0;
      this.infinite = false;
      this.progress = this.duration;
      return this;
    };

    /**
     * 取消动画，不会触发事件
     * @return {this}
     */
    Animator.prototype.cancel = function () {
      this.living = false;
      return this;
    };

    /**
     * Transition类型动画对象
     *
     * @class
     * @extends Animator
     * @param {object} options 动画配置参数
     * @param {object} [options.from] 设置对象的起始位置和起始姿态等，该项配置可选
     * @param {object} options.to 设置对象的结束位置和结束姿态等
     * @param {string} [options.ease] 执行动画使用的缓动函数 默认值为 Tween.Ease.InOut
     * @param {number} [options.repeats] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {boolean} [options.infinite] 设置动画无限循环，优先级高于repeats
     * @param {boolean} [options.alternate] 设置动画是否偶数次回返
     * @param {number} [options.duration] 设置动画执行时间 默认 300ms
     * @param {number} [options.wait] 设置动画延迟时间，在重复动画不会生效 默认 0ms
     * @param {number} [options.delay] 设置动画延迟时间，在重复动画也会生效 默认 0ms
     */
    function Transition(options) {
      Animator.call(this, options);

      // collect from pose, when from was not complete
      options.from = options.from || {};
      for (const i in options.to) {
        if (Tools.isUndefined(options.from[i])) {
          options.from[i] = this.element[i];
        }
      }

      /**
       * 动画缓动函数
       * @member {boolean}
       */
      this.ease = options.ease || Tween.Ease.InOut;

      /**
       * 动画起始状态
       * @member {boolean}
       */
      this.from = options.from;

      /**
       * 动画结束状态
       * @member {boolean}
       */
      this.to = options.to;
    }
    Transition.prototype = Object.create(Animator.prototype);

    /**
     * 计算下一帧状态
     * @private
     * @return {object}
     */
    Transition.prototype.nextPose = function () {
      const pose = {};
      const t = this.ease(this.progress / this.duration);
      for (const i in this.to) {
        if (this.element[i] === undefined) continue;
        this.element[i] = pose[i] = this.linear(this.from[i], this.to[i], t);
      }
      return pose;
    };

    /**
     * Bodymovin 类型动画对象
     *
     * @class
     * @extends Animator
     * @param {object} options 动画配置参数
     * @param {object} options.keyframes lottie 动画数据
     * @param {number} [options.frameRate] lottie 动画帧率，对应 json 里面的 fr
     * @param {array} [options.ignoreProps] 忽略 keyframes 动画数据中的哪些属性的动画描述 position|x|y|pivot|pivotX|pivotY|scale|scaleX|scaleY|rotation|alpha
     * @param {number} [options.repeats] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {boolean} [options.infinite] 设置动画无限循环，优先级高于repeats
     * @param {boolean} [options.alternate] 设置动画是否偶数次回返
     * @param {number} [options.duration] 设置动画执行时间 默认 300ms
     * @param {number} [options.wait] 设置动画延迟时间，在重复动画不会生效 默认 0ms
     * @param {number} [options.delay] 设置动画延迟时间，在重复动画也会生效 默认 0ms
     */
    function Bodymovin(options) {
      Animator.call(this, options);

      /**
       * list of animated properties
       * @private
       * @member {array}
       */
      this.dynamicProperties = [];

      // If layer has been modified in current tick this will be true
      this._mdf = false;

      /**
       * 动画帧数据
       * @member {object}
       */
      this.keyframes = Tools.copyJSON(options.keyframes);

      /**
       * 动画帧率，可以从 data.json 字段中的 fr 字段拿
       * @member {number}
       * @default 30
       */
      this.frameRate = options.frameRate || 30;

      /**
       * 动画帧素
       * @private
       * @member {number}
       */
      this.tpf = 1000 / this.frameRate;
      // this.frameNum = -1;

      /**
       * 动画起始帧
       * @private
       * @member {number}
       */
      this.ip = Tools.isUndefined(options.ip) ? this.keyframes.ip : options.ip;

      /**
       * 动画结束帧
       * @private
       * @member {number}
       */
      this.op = Tools.isUndefined(options.ip) ? this.keyframes.op : options.op;

      /**
       * 动画总帧数
       * @private
       * @member {number}
       */
      this.tfs = this.op - this.ip;

      /**
       * 动画总时长
       * @member {number}
       */
      this.duration = this.tfs * this.tpf;

      /**
       * 动画需要忽略哪些属性
       * @member {array}
       */
      this.ignoreProps = Tools.isArray(options.ignoreProps) ? options.ignoreProps : [];

      /**
       * 动画transform解析对象
       * @private
       * @member {TransformFrames}
       */
      this.transform = new TransformFrames(this, this.keyframes.ks);
    }
    Bodymovin.prototype = Object.create(Animator.prototype);

    /**
     * Calculates all dynamic values
     * @private
     * @param {number} frameNum current frame number in Layer's time
     */
    Bodymovin.prototype.prepareProperties = function (frameNum) {
      const len = this.dynamicProperties.length;
      let i;
      for (i = 0; i < len; i += 1) {
        this.dynamicProperties[i].getValue(frameNum);
        if (this.dynamicProperties[i]._mdf) {
          this._mdf = true;
        }
      }
    };

    /**
     * add dynamic property
     * @private
     * @param {*} prop dynamic property
     */
    Bodymovin.prototype.addDynamicProperty = function (prop) {
      if (this.dynamicProperties.indexOf(prop) === -1) {
        this.dynamicProperties.push(prop);
      }
    };

    /**
     * 计算下一帧状态
     * @private
     * @return {object} pose
     */
    Bodymovin.prototype.nextPose = function () {
      const pose = {};
      const frameNum = this.ip + this.progress / this.tpf;
      this.prepareProperties(frameNum);

      if (this.ignoreProps.indexOf('position') === -1) {
        if (this.ignoreProps.indexOf('x') === -1) {
          pose.x = this.element.x = this.transform.x;
        }
        if (this.ignoreProps.indexOf('y') === -1) {
          pose.y = this.element.y = this.transform.y;
        }
      }

      if (this.ignoreProps.indexOf('pivot') === -1) {
        pose.pivot = {};
        if (this.ignoreProps.indexOf('pivotX') === -1) {
          pose.pivot.x = this.element.pivot.x = this.transform.anchorX;
        }
        if (this.ignoreProps.indexOf('pivotY') === -1) {
          pose.pivot.y = this.element.pivot.y = this.transform.anchorY;
        }
      }

      if (this.ignoreProps.indexOf('scale') === -1) {
        pose.scale = {};
        if (this.ignoreProps.indexOf('scaleX') === -1) {
          pose.scale.x = this.element.scale.x = this.transform.scaleX;
        }
        if (this.ignoreProps.indexOf('scaleY') === -1) {
          pose.scale.y = this.element.scale.y = this.transform.scaleY;
        }
      }

      if (this.ignoreProps.indexOf('rotation') === -1) {
        pose.rotation = this.element.rotation = this.transform.rotation;
      }

      if (this.ignoreProps.indexOf('alpha') === -1) {
        pose.alpha = this.element.alpha = this.transform.alpha;
      }

      return pose;
    };

    /**
     * AnimateRunner类型动画类
     *
     * @class
     * @extends Animator
     * @param {object} runner 添加动画，可以是 animate 动画配置
     * @param {object} [options={}] 整个动画的循环等配置
     * @param {object} [options.repeats=0] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {object} [options.infinite=false] 设置动画无限循环，优先级高于repeats
     * @param {number} [options.wait] 设置动画延迟时间，在重复动画`不会`生效 默认 0ms
     * @param {number} [options.delay] 设置动画延迟时间，在重复动画`会`生效 默认 0ms
     */
    function Queues(runner, options) {
      Animator.call(this, options);

      /**
       * 动画段对象数组
       * @member {array}
       */
      this.runners = [];

      /**
       * 动画段数据数组
       * @member {array}
       */
      this.queues = [];

      /**
       * 当前动画段标记
       * @member {number}
       */
      this.cursor = 0;

      /**
       * 总动画段数
       * @member {number}
       */
      this.total = 0;

      /**
       * 强制不能交替播放
       * @private
       * @member {boolean}
       */
      this.alternate = false;

      if (runner) this.then(runner);
    }
    Queues.prototype = Object.create(Animator.prototype);

    /**
     * 更新下一个`runner`
     * @param {Object} runner 动画配置
     * @return {this}
     */
    Queues.prototype.then = function (runner) {
      this.queues.push(runner);

      this.total = this.queues.length;
      return this;
    };

    /**
     * 更新下一个`runner`
     * @private
     * @param {Object} _ 当前进度
     * @param {Number} time 剩余的时间
     */
    Queues.prototype.nextOne = function (_, time) {
      this.runners[this.cursor].init();
      this.cursor++;
      this._residueTime = Math.abs(time);
    };

    /**
     * 初始化当前`runner`
     * @private
     */
    Queues.prototype.initOne = function () {
      const runner = this.queues[this.cursor];
      runner.infinite = false;
      runner.resident = true;
      runner.element = this.element;

      let animate = null;
      if (runner.keyframes) {
        animate = new Bodymovin(runner);
      } else if (runner.to) {
        animate = new Transition(runner);
      }
      if (animate !== null) {
        animate.on('complete', this.nextOne.bind(this));
        this.runners.push(animate);
      }
    };

    /**
     * 下一帧的状态
     * @private
     * @param {number} snippetCache 时间片段
     * @return {object}
     */
    Queues.prototype.nextPose = function (snippetCache) {
      if (!this.runners[this.cursor] && this.queues[this.cursor]) {
        this.initOne();
      }
      if (this._residueTime > 0) {
        snippetCache += this._residueTime;
        this._residueTime = 0;
      }
      return this.runners[this.cursor].update(snippetCache);
    };

    /**
     * 更新动画数据
     * @private
     * @param {number} snippet 时间片段
     * @return {object}
     */
    Queues.prototype.update = function (snippet) {
      if (this.wait > 0) {
        this.wait -= Math.abs(snippet);
        return;
      }
      if (this.paused || !this.living || this.delayCut > 0) {
        if (this.delayCut > 0) this.delayCut -= Math.abs(snippet);
        return;
      }

      const cc = this.cursor;

      const pose = this.nextPose(this.timeScale * snippet);

      this.emit(
        'update',
        {
          index: cc,
          pose,
        },
        this.progress / this.duration,
      );

      if (this.spill()) {
        if (this.repeats > 0 || this.infinite) {
          if (this.repeats > 0) --this.repeats;
          this.delayCut = this.delay;
          this.cursor = 0;
        } else {
          if (!this.resident) this.living = false;
          this.emit('complete', pose);
        }
      }
      return pose;
    };

    /**
     * 检查动画是否到了边缘
     * @private
     * @return {boolean}
     */
    Queues.prototype.spill = function () {
      const topSpill = this.cursor >= this.total;
      return topSpill;
    };

    const Ticker = {
      settings: pixi_js.settings,
      UPDATE_PRIORITY: pixi_js.UPDATE_PRIORITY,
      animationTicker: pixi_js.ticker.shared,
    };

    /**
     * Animation类型动画类，该类上的功能将以`add-on`的形势增加到`DisplayObject`上
     *
     * @class
     * @private
     * @param {DisplayObject} element display object
     */
    function Animations(element) {
      this.element = element;

      /**
       * 自身当前动画队列
       *
       * @member {array}
       */
      this.animates = [];

      /**
       * 自身及后代动画的缩放比例
       *
       * @member {number}
       */
      this.timeScale = 1;

      /**
       * 是否暂停自身的动画
       *
       * @member {Boolean}
       */
      this.paused = false;

      this.updateDeltaTime = this.updateDeltaTime.bind(this);

      Ticker.animationTicker.add(this.updateDeltaTime, Ticker.UPDATE_PRIORITY.HIGH);
    }

    /**
     * 清理需要移除的动画
     * @param {Array} needClearIdx 需要清理的对象索引
     * @private
     */
    Animations.prototype.clearAnimators = function (needClearIdx) {
      if (this.paused) return;
      const animates = this.animates;
      for (let i = 0; i < needClearIdx.length; i++) {
        const idx = needClearIdx[i];
        if (!animates[idx].living && !animates[idx].resident) {
          this.animates.splice(idx, 1);
        }
      }
    };

    /**
     * 更新动画数据
     * @private
     * @param {number} deltaTime 时间片段
     */
    Animations.prototype.updateDeltaTime = function (deltaTime) {
      if (this.animates.length <= 0) return;
      const snippet = deltaTime / Ticker.settings.TARGET_FPMS;
      this.update(snippet);
    };

    /**
     * 更新动画数据
     * @private
     * @param {number} snippet 时间片段
     */
    Animations.prototype.update = function (snippet) {
      if (this.paused) return;
      if (this.animates.length <= 0) return;

      snippet = this.timeScale * snippet;
      const needClearIdx = [];
      for (let i = 0; i < this.animates.length; i++) {
        if (!this.animates[i].living && !this.animates[i].resident) {
          needClearIdx.push(i);
          continue;
        }
        this.animates[i].update(snippet);
      }
      if (needClearIdx.length > 0) this.clearAnimators(needClearIdx);
    };

    /**
     * animate动画，指定动画的启始位置和结束位置
     *
     * ```js
     * display.animate({
     *   from: {x: 100},
     *   to: {x: 200},
     *   ease: Tween.Bounce.Out, // 执行动画使用的缓动函数 默认值为 Tween.Ease.InOut
     *   repeats: 10, // 动画运动完后再重复10次
     *   infinite: true, // 无限循环动画
     *   alternate: true, // 偶数次的时候动画回放
     *   duration: 1000, // 动画时长 ms单位 默认 300ms
     *   onUpdate: function(state,rate){},
     *   onComplete: function(){ console.log('end'); } // 动画执行结束回调
     * });
     * ```
     *
     * @param {Object} options 动画配置参数
     * @param {Object} [options.from] 设置对象的起始位置和起始姿态等，该项配置可选
     * @param {Object} options.to 设置对象的结束位置和结束姿态等
     * @param {String} [options.ease] 执行动画使用的缓动函数 默认值为 Tween.Ease.InOut
     * @param {Number} [options.repeats] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {Boolean} [options.infinite] 设置动画无限循环，优先级高于repeats
     * @param {Boolean} [options.alternate] 设置动画是否偶数次回返
     * @param {Number} [options.duration] 设置动画执行时间 默认 300ms
     * @param {Number} [options.wait] 设置动画延迟时间，在重复动画不会生效 默认 0ms
     * @param {Number} [options.delay] 设置动画延迟时间，在重复动画也会生效 默认 0ms
     * @param {Function} [options.onUpdate] 设置动画更新时的回调函数
     * @param {Function} [options.onComplete] 设置动画结束时的回调函数，如果infinite为true该事件将不会触发
     * @param {Boolean} clear 是否清除该对象上之前所有的动画
     * @return {Transition} Transition 实例
     */
    Animations.prototype.animate = function (options, clear) {
      options.element = this.element;
      return this._addMove(new Transition(options), clear);
    };

    /**
     * 以链式调用的方式触发一串动画 （不支持`alternate`）
     *
     * ```js
     * display.queues({ from: { x: 1 }, to: { x: 2 } })
     *   .then({ from: { x: 2 }, to: { x: 1 } })
     *   .then({ from: { scale: 1 }, to: { scale: 0 } })
     *   .on('complete', function() {
     *     console.log('end queues');
     *   });
     * ```
     *
     * @param {Object} [runner] 添加动画，可以是 animate 或者 motion 动画配置
     * @param {Object} [options={}] 整个动画的循环等配置
     * @param {Object} [options.repeats=0] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {Object} [options.infinite=false] 设置动画无限循环，优先级高于repeats
     * @param {Number} [options.wait] 设置动画延迟时间，在重复动画`不会`生效 默认 0ms
     * @param {Number} [options.delay] 设置动画延迟时间，在重复动画`会`生效 默认 0ms
     * @param {Boolean} [clear=false] 是否清除该对象上之前所有的动画
     * @return {Queues} Queues 实例
     */
    Animations.prototype.queues = function (runner, options, clear) {
      options.element = this.element;
      return this._addMove(new Queues(runner, options), clear);
    };

    /**
     * 播放一个bodymovin动画
     *
     * ```js
     * import data from './animations/data.js';
     * display.bodymovin({
     *   keyframes: data.layers[3],
     *   frameRate: data.fr,
     *   ignoreProps: [ 'position', 'scaleX ],
     * }).on('complete', function() {
     *   console.log('end queues');
     * });
     * ```
     *
     * @param {Object} options 动画配置参数
     * @param {Object} options.keyframes lottie 动画数据
     * @param {Number} [options.frameRate] lottie 动画帧率，对应 json 里面的 fr
     * @param {Array} [options.ignoreProps] 忽略 keyframes 动画数据中的哪些属性的动画描述 position|x|y|pivot|pivotX|pivotY|scale|scaleX|scaleY|rotation|alpha
     * @param {Number} [options.repeats] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {Boolean} [options.infinite] 设置动画无限循环，优先级高于repeats
     * @param {Boolean} [options.alternate] 设置动画是否偶数次回返
     * @param {Number} [options.duration] 设置动画执行时间 默认 300ms
     * @param {Number} [options.wait] 设置动画延迟时间，在重复动画不会生效 默认 0ms
     * @param {Number} [options.delay] 设置动画延迟时间，在重复动画也会生效 默认 0ms
     * @param {Function} [options.onUpdate] 设置动画更新时的回调函数
     * @param {Function} [options.onComplete] 设置动画结束时的回调函数，如果infinite为true该事件将不会触发
     * @param {Boolean} clear 是否清除该对象上之前所有的动画
     * @return {Bodymovin} Bodymovin 实例
     */
    Animations.prototype.bodymovin = function (options, clear) {
      options.element = this.element;
      return this._addMove(new Bodymovin(options), clear);
    };

    /**
     * 添加到动画队列
     * @private
     * @param {object} animate 创建出来的动画对象
     * @param {boolean} clear 是否清除之前的动画
     * @return {Bodymovin|Queues|Transition} 动画实例
     */
    Animations.prototype._addMove = function (animate, clear) {
      if (clear) this.clearAll();
      this.animates.push(animate);
      return animate;
    };

    /**
     * 暂停动画组
     */
    Animations.prototype.pause = function () {
      this.paused = true;
    };

    /**
     * 恢复动画组
     */
    Animations.prototype.resume = function () {
      this.paused = false;
    };

    Animations.prototype.restart = Animations.prototype.resume;

    /**
     * 设置动画组的播放速率
     * @param {number} speed a
     */
    Animations.prototype.setSpeed = function (speed) {
      this.timeScale = speed;
    };

    /**
     * 清除动画队列
     * @private
     */
    Animations.prototype.clearAll = function () {
      this.animates.length = 0;
    };

    /**
     * lottie-pixi 为 pixi 的所有渲染对象扩展了基础动画能力，我们可以直接在渲染对象上使用 Tween 动画，目前支持三类动画 `animate` 、 `queues` 和 `bodymovin`，具体代码如下：
     *
     * ```js
     * // play a from-to animate
     * dispayA.animate({
     *   from: {x: 100},
     *   to: {x: 200},
     * })
     *
     * // play a queues animate
     * display.queues({ from: { x: 1 }, to: { x: 2 } })
     *   .then({ from: { x: 2 }, to: { x: 1 } })
     *   .then({ from: { scale: 1 }, to: { scale: 0 } });
     *
     * // play a bodymovin animate, parsing transform-alpha animation
     * display.bodymovin({
     *   keyframes: data.layers[3], // lottie 动画某一个动画层的数据
     *   frameRate: data.fr,
     *   ignoreProps: [ 'position', 'scaleX ],
     * })
     * ```
     *
     * @namespace BasicAnimation
     */

    /**
     * 创建一个 animations 对象
     * @private
     */
    pixi_js.DisplayObject.prototype.setupAnimations = function () {
      if (!this.animations) this.animations = new Animations(this);
    };

    /**
     * animate动画，指定动画的启始位置和结束位置
     *
     * ```js
     * display.animate({
     *   from: {x: 100},
     *   to: {x: 200},
     *   ease: Tween.Bounce.Out, // 执行动画使用的缓动函数 默认值为 Tween.Ease.InOut
     *   repeats: 10, // 动画运动完后再重复10次
     *   infinite: true, // 无限循环动画
     *   alternate: true, // 偶数次的时候动画回放
     *   duration: 1000, // 动画时长 ms单位 默认 300ms
     *   onUpdate(state,rate){},
     *   onComplete(){ console.log('end'); } // 动画执行结束回调
     * }, clear)
     * .on('update', function() {
     *   console.log('update');
     * })
     * .on('complete', function() {
     *   console.log('complete');
     * });
     * ```
     *
     * @alias animate
     * @memberof BasicAnimation
     * @param {object} options 动画配置参数
     * @param {object} [options.from] 设置对象的起始位置和起始姿态等，该项配置可选
     * @param {object} options.to 设置对象的结束位置和结束姿态等
     * @param {string} [options.ease] 执行动画使用的缓动函数 默认值为 Tween.Ease.InOut
     * @param {number} [options.repeats] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {boolean} [options.infinite] 设置动画无限循环，优先级高于repeats
     * @param {boolean} [options.alternate] 设置动画是否偶数次回返
     * @param {number} [options.duration] 设置动画执行时间 默认 300ms
     * @param {number} [options.wait] 设置动画延迟时间，在重复动画不会生效 默认 0ms
     * @param {number} [options.delay] 设置动画延迟时间，在重复动画也会生效 默认 0ms
     * @param {boolean} clear 是否清除该对象上之前所有的动画
     * @return {Transition} Transition 实例
     */
    pixi_js.DisplayObject.prototype.animate = function (options, clear) {
      if (!this.animations) this.setupAnimations();
      return this.animations.animate(options, clear);
    };

    /**
     * 以链式调用的方式触发一串动画 （不支持`alternate`）
     *
     * ```js
     * display.queues({ from: { x: 1 }, to: { x: 2 } }, options, clear)
     *   .then({ from: { x: 2 }, to: { x: 1 } })
     *   .then({ from: { scale: 1 }, to: { scale: 0 } })
     *   .on('complete', function() {
     *     console.log('end queues');
     *   });
     * ```
     *
     * @alias queues
     * @memberof BasicAnimation
     * @param {object} runner 添加动画，可以是 animate
     * @param {object} [options={}] 整个动画的循环等配置
     * @param {object} [options.repeats=0] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {object} [options.infinite=false] 设置动画无限循环，优先级高于repeats
     * @param {number} [options.wait] 设置动画延迟时间，在重复动画`不会`生效 默认 0ms
     * @param {number} [options.delay] 设置动画延迟时间，在重复动画`会`生效 默认 0ms
     * @param {boolean} [clear=false] 是否清除该对象上之前所有的动画
     * @return {Queues} Queues 实例
     */
    pixi_js.DisplayObject.prototype.queues = function (runner, options = {}, clear) {
      if (!this.animations) this.setupAnimations();
      return this.animations.queues(runner, options, clear);
    };

    /**
     * 播放一个bodymovin动画
     *
     * ```js
     * import data from './animations/data.js';
     * display.bodymovin({
     *   keyframes: data.layers[3],
     *   frameRate: data.fr,
     *   ignoreProps: [ 'position', 'scaleX ],
     * }, clear)
     * .on('update', function() {
     *   console.log('update');
     * })
     * .on('complete', function() {
     *   console.log('complete');
     * });
     * ```
     *
     * @alias bodymovin
     * @memberof BasicAnimation
     * @param {object} options 动画配置参数
     * @param {object} options.keyframes lottie 动画数据
     * @param {number} [options.frameRate] lottie 动画帧率，对应 json 里面的 fr
     * @param {array} [options.ignoreProps] 忽略 keyframes 动画数据中的哪些属性的动画描述 position|x|y|pivot|pivotX|pivotY|scale|scaleX|scaleY|rotation|alpha
     * @param {number} [options.repeats] 设置动画执行完成后再重复多少次，优先级没有infinite高
     * @param {boolean} [options.infinite] 设置动画无限循环，优先级高于repeats
     * @param {boolean} [options.alternate] 设置动画是否偶数次回返
     * @param {number} [options.duration] 设置动画执行时间 默认 300ms
     * @param {number} [options.wait] 设置动画延迟时间，在重复动画不会生效 默认 0ms
     * @param {number} [options.delay] 设置动画延迟时间，在重复动画也会生效 默认 0ms
     * @param {boolean} clear 是否清除该对象上之前所有的动画
     * @return {Bodymovin} Bodymovin 实例
     */
    pixi_js.DisplayObject.prototype.bodymovin = function (options, clear) {
      if (!this.animations) this.setupAnimations();
      return this.animations.bodymovin(options, clear);
    };

    /**
     * add some prototype short access symbol
     * @ignore
     */
    Object.defineProperties(pixi_js.DisplayObject.prototype, {
      /**
       * An alias to scale.x
       * @member {number}
       * @ignore
       */
      scaleXY: {
        get() {
          return this.scale.x;
        },
        set(value) {
          this.scale.set(value);
        },
      },
      /**
       * An alias to scale.x
       * @member {number}
       * @ignore
       */
      scaleX: {
        get() {
          return this.scale.x;
        },
        set(value) {
          this.scale.x = value;
        },
      },
      /**
       * An alias to scale.x
       * @member {number}
       * @ignore
       */
      scaleY: {
        get() {
          return this.scale.y;
        },
        set(value) {
          this.scale.y = value;
        },
      },
      /**
       * An alias to pivot.x
       * @member {number}
       * @ignore
       */
      pivotX: {
        get() {
          return this.pivot.x;
        },
        set(value) {
          this.pivot.x = value;
        },
      },
      /**
       * An alias to pivot.x
       * @member {number}
       * @ignore
       */
      pivotY: {
        get() {
          return this.pivot.y;
        },
        set(value) {
          this.pivot.y = value;
        },
      },
    });

    /**
     * override pixi updateTransform, because lottie has hierarchy
     * @private
     */
    pixi_js.Container.prototype.updateTransform = function () {
      this.emit('pretransform');
      this._boundsID++;
      if (this.hierarchy && this.hierarchy.transform) {
        this.hierarchy.updateTransform();
        this.transform.updateTransform(this.hierarchy.transform);
      } else {
        this.transform.updateTransform(this.parent.transform);
      }
      this.worldAlpha = this.alpha * this.parent.worldAlpha;

      for (let i = 0, j = this.children.length; i < j; ++i) {
        const child = this.children[i];

        if (child.visible) {
          child.updateTransform();
        }
      }
      this.emit('posttransform');
    };

    /**
     * override pixi updateTransform, because lottie has hierarchy
     * @private
     */
    pixi_js.Container.prototype.containerUpdateTransform = pixi_js.Container.prototype.updateTransform;

    var _isFinite = Number.isFinite || function (value) {
    	return !(typeof value !== 'number' || value !== value || value === Infinity || value === -Infinity);
    };

    // https://github.com/paulmillr/es6-shim
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger

    var isInteger = Number.isInteger || function(val) {
      return typeof val === "number" &&
        _isFinite(val) &&
        Math.floor(val) === val;
    };

    var isIntegerRegex = /^-?\d+$/;

    var _parseInt = function parseIntStrict (integer) {
      if (typeof integer === 'number') {
        return isInteger(integer) ? integer : undefined
      }
      if (typeof integer === 'string') {
        return isIntegerRegex.test(integer) ? parseInt(integer, 10) : undefined
      }
    };

    var REGEX = /OS (\d\d?_\d(_\d)?)/;

    var iosVersion = function iOsVersion (agent) {
      if (!agent) return null

      var matches = REGEX.exec(agent);
      if (!matches) return null

      var parts = matches[1].split('_').map(_parseInt);

      return {
        major: parts[0],
        minor: parts[1],
        patch: parts[2] || 0
      }
    };

    const { major } = iosVersion(window.navigator.userAgent) || {};

    /**
     * dataURL 转成 blob
     * @param dataURL
     * @return blob
     */
    function dataURL2blob(dataURL) {
      let binaryString = atob(dataURL.split(',')[1]);
      let arrayBuffer = new ArrayBuffer(binaryString.length);
      let intArray = new Uint8Array(arrayBuffer);
      let mime = dataURL.split(',')[0].match(/:(.*?);/)[1];
      for (let i = 0, j = binaryString.length; i < j; i++) {
        intArray[i] = binaryString.charCodeAt(i);
      }
      let data = [intArray];
      let result;
      try {
        result = new Blob(data, { type: mime });
      } catch (error) {
        console.log(error);
      }
      return result;
    }

    /**
     * 创建新的URL 对象表示指定的 File 对象或 Blob 对象。
     * @param {string} dataURL  base64
     */
    function dataURL2ObjUrl(dataURL) {
      window.URL = window.URL || window.webkitURL;
      if (window.URL && URL.createObjectURL) {
        // dataURL2blob 此方法需额外定义
        const blob = dataURL2blob(dataURL);
        return URL.createObjectURL(blob)
      }
      return dataURL
    }

    function imageHandle(source) {
      // if (!imageHandle.systemOs) {
      //   imageHandle.systemOs = UA().os
      // }
      // const {
      //   version: {
      //     original = ''
      //   },
      //   name = ''
      // } = imageHandle.systemOs;
      // const isBase64Reg = /^data:image\/png;base64/;
      // const isLtiOS10 = name === 'iOS' && (+original.split('.')[0] <= 10)
      if (major <= 8 && isBase64Reg.test(source)) {
        return dataURL2ObjUrl(source);
      }

      return source;
    }

    function loadTexture(assets, options) {
        if (options === void 0) { options = {}; }
        return new LoadTexture(assets, options);
    }
    function loadJson(path) {
        return new LoadJson(path);
    }
    LoaderRegister.registerLoaderByType(LoaderRegister.Type.Texture, loadTexture);
    LoaderRegister.registerLoaderByType(LoaderRegister.Type.Ajax, loadJson);
    DisplayRegister.registerDisplayByType(DisplayRegister.Type.Null, CompElement);
    DisplayRegister.registerDisplayByType(DisplayRegister.Type.Path, PathLottie);
    DisplayRegister.registerDisplayByType(DisplayRegister.Type.Shape, CompElement);
    DisplayRegister.registerDisplayByType(DisplayRegister.Type.Solid, SolidElement);
    DisplayRegister.registerDisplayByType(DisplayRegister.Type.Sprite, SpriteElement);
    DisplayRegister.registerDisplayByType(DisplayRegister.Type.Component, CompElement);
    DisplayRegister.registerDisplayByType(DisplayRegister.Type.Container, pixi_js.Container);
    var LottieSystem = (function (_super) {
        __extends(LottieSystem, _super);
        function LottieSystem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.managerLife = [
                'DisplayReady',
                'ImageReady',
                'success',
                'error',
                'complete',
                'loopComplete',
                'enterFrame',
                'update'
            ];
            return _this;
        }
        LottieSystem.prototype.init = function () {
            this.renderSystem = this.game.systems.find(function (s) { return (s.application); });
            this.app = this.renderSystem.application;
        };
        LottieSystem.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (changed.componentName === 'Lottie') {
                        if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                            this.add(changed);
                        }
                        else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                            this.remove(changed);
                        }
                    }
                    return [2];
                });
            });
        };
        LottieSystem.prototype.add = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                var component, container, _a, rn, otherOpts, data, json, assets, anim;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.manager = new AnimationManager(this.app);
                            component = changed.component;
                            container = this.renderSystem.containerManager.getContainer(changed.gameObject.id);
                            if (!container)
                                return [2];
                            _a = component.options, rn = _a.resource, otherOpts = __rest(_a, ["resource"]);
                            return [4, eva_js.resource.getResource(rn)];
                        case 1:
                            data = (_b.sent()).data;
                            json = __assign({}, (data.json || {}));
                            assets = json.assets || [];
                            assets.forEach(function (item) {
                                if (item.p)
                                    item.p = imageHandle(item.p);
                            });
                            anim = this.manager.parseAnimation(__assign({ keyframes: json }, otherOpts));
                            component.anim = anim;
                            container.addChildAt(anim.group, 0);
                            this.managerLife.forEach(function (eventName) {
                                anim.on(eventName, function (e) { return component.emit(eventName, e); });
                            });
                            if (anim.isImagesLoaded)
                                component.emit('success', {});
                            return [2];
                    }
                });
            });
        };
        LottieSystem.prototype.remove = function (changed) {
            var component = changed.component;
            var container = this.renderSystem.containerManager.getContainer(changed.gameObject.id);
            if (container) {
                container.removeChild(component.anim.group);
            }
            component.anim = null;
        };
        LottieSystem.systemName = 'LottieSystem';
        LottieSystem = __decorate([
            eva_js.decorators.componentObserver({
                Lottie: []
            })
        ], LottieSystem);
        return LottieSystem;
    }(pluginRenderer.Renderer));

    var Lottie = (function (_super) {
        __extends(Lottie, _super);
        function Lottie(options) {
            var _this = _super.call(this) || this;
            _this.loadStatus = false;
            _this.firstPlay = null;
            _this.prevSlot = {};
            _this.currentSlot = {};
            _this.options = __assign({ autoStart: false }, options);
            _this.on('success', function () {
                _this.loadStatus = true;
                var _a = _this.anim.keyframes, ip = _a.ip, op = _a.op;
                var _loop_1 = function (i) {
                    var event_1 = "@" + i;
                    _this.anim.on(event_1, function (e) { return _this.emit(event_1, e); });
                };
                for (var i = ip; i <= op; i++) {
                    _loop_1(i);
                }
                _this.firstPlay && _this.firstPlay();
            });
            return _this;
        }
        Lottie.prototype.play = function (params, expandOpts) {
            var _this = this;
            if (params === void 0) { params = []; }
            if (expandOpts === void 0) { expandOpts = {
                repeats: 0
            }; }
            if (!this.loadStatus) {
                this.firstPlay = function () {
                    _this.play(params, expandOpts);
                };
                return;
            }
            var _a = expandOpts.slot, slot = _a === void 0 ? [] : _a;
            slot.forEach(function (_a) {
                var name = _a.name, type = _a.type, value = _a.value, _b = _a.style, style = _b === void 0 ? {} : _b;
                var x = style.x, y = style.y, _c = style.anchor, anchor = _c === void 0 ? { x: 0, y: 0 } : _c, _d = style.pivot, pivot = _d === void 0 ? { x: 0, y: 0 } : _d, width = style.width, height = style.height;
                if (type === 'IMAGE') {
                    _this.currentSlot[name] = pixi_js.Sprite.from(value);
                }
                else if (type === 'TEXT') {
                    _this.currentSlot[name] = new pixi_js.Text(value, new pixi_js.TextStyle(style));
                }
                if (x)
                    _this.currentSlot[name].x = x;
                if (y)
                    _this.currentSlot[name].y = y;
                if (width)
                    _this.currentSlot[name].width = width;
                if (height)
                    _this.currentSlot[name].height = height;
                _this.currentSlot[name].anchor.set(anchor.x || 0, anchor.y || 0);
                _this.currentSlot[name].pivot.set(_this.currentSlot[name].width * (pivot.x || 0), _this.currentSlot[name].height * (pivot.y || 0));
                if (_this.prevSlot[name])
                    _this.anim.unbindSlot(name, _this.prevSlot[name]);
                _this.anim.bindSlot(name, _this.currentSlot[name]);
                _this.prevSlot[name] = _this.currentSlot[name];
            });
            this.anim.playSegment(this.playParamsHandle(params), expandOpts);
        };
        Lottie.prototype.playParamsHandle = function (params) {
            var p = [].concat(params);
            var keyframes = this.anim.keyframes;
            if (!p.length || p.length > 2) {
                p = [keyframes.ip, keyframes.op];
            }
            else if (p.length === 1) {
                p = [p[0] % keyframes.op, keyframes.op];
            }
            return p;
        };
        Lottie.prototype.onTap = function (name, callback) {
            var _this = this;
            var g = new pixi_js.Graphics();
            this.on('success', function () {
                var ele = _this.anim.querySelector(name);
                var display = ele.display;
                g.beginFill(0xFFFFFF);
                g.drawRect(0, 0, 100, 100);
                g.endFill();
                g.alpha = 0;
                display.addChild(g);
                ele.display.interactive = true;
                ele.display.on('pointertap', function () {
                    callback();
                });
            });
        };
        Lottie.componentName = 'Lottie';
        __decorate([
            eva_js.decorators.IDEProp
        ], Lottie.prototype, "slot", void 0);
        return Lottie;
    }(eva_js.Component));

    exports.Lottie = Lottie;
    exports.LottieSystem = LottieSystem;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
