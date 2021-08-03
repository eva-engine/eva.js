(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.a11y = {}), global.EVA, global.PIXI));
}(this, (function (exports, eva_js, pixi_js) { 'use strict';

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

    function uuid(len) {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = [];
        let radix = chars.length;
        for (let i = 0; i < len; i++)
            uuid[i] = chars[0 | (Math.random() * radix)];
        return uuid.join('');
    }
    const setStyle = (element, style) => {
        const { width, height, position, left = 0, top = 0, zIndex, pointerEvents, background, } = style;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.position = position;
        element.style.left = `${left}`;
        element.style.top = `${top}`;
        element.style.zIndex = `${zIndex}`;
        element.style.pointerEvents = pointerEvents;
        element.style.background = background;
        element.style.border = 'none';
        element.style.overflow = 'hidden';
    };
    const setTransform = (element, transform, ratioX, ratioY) => {
        const { worldTransform } = transform;
        const { a, b, c, d, tx, ty } = worldTransform;
        const matrix = `matrix(${a}, ${b}, ${c}, ${d}, ${tx * ratioX}, ${ty * ratioY})`;
        element.style.transform = `${matrix}`;
        element.style.webkitTransform = `${matrix}`;
        element.style.transformOrigin = 'left top';
        element.style.webkitTransformOrigin = 'left top';
    };

    class A11y extends eva_js.Component {
        constructor(param) {
            super();
            Object.assign(this, param);
            const { hint = '', event, delay = 0, attr = {}, role = '', props = {}, state = {}, } = param;
            this.hint = hint;
            this.event = event;
            this.delay = delay;
            this.attr = attr;
            this.role = role;
            this.props = props;
            this.state = state;
            this.a11yId = `_${uuid(6)}`;
        }
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

    const POSITION = 'absolute';
    const ZINDEX = 3;
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

    var extendStatics$1 = function(d, b) {
        extendStatics$1 = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics$1(d, b);
    };

    function __extends$1(d, b) {
        extendStatics$1(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var Application = (function (_super) {
        __extends$1(Application, _super);
        function Application(params) {
            var _this = this;
            params.autoStart = false;
            _this = _super.call(this, params) || this;
            return _this;
        }
        return Application;
    }(pixi_js.Application));

    var Container = (function (_super) {
        __extends$1(Container, _super);
        function Container() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Container;
    }(pixi_js.Container));

    ((function (_super) {
        __extends$1(Graphics, _super);
        function Graphics() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Graphics;
    })(pixi_js.Graphics));

    ((function (_super) {
        __extends$1(NinePatch, _super);
        function NinePatch(img, leftWidth, topHeight, rightWidth, bottomHeight) {
            var _this = this;
            var texture;
            if (img === 'string') {
                texture = pixi_js.Texture.fromFrame(img);
            }
            else {
                texture = pixi_js.Texture.from(img);
            }
            _this = _super.call(this, texture, leftWidth, topHeight, rightWidth, bottomHeight) || this;
            return _this;
        }
        return NinePatch;
    })(pixi_js.mesh.NineSlicePlane));

    ((function () {
        function Sprite(image) {
            this._image = null;
            this._image = image;
            if (image) {
                if (image instanceof HTMLImageElement) {
                    this.sprite = pixi_js.Sprite.from(image);
                }
                else if (image instanceof pixi_js.Texture) {
                    this.sprite = new pixi_js.Sprite(image);
                }
            }
            else {
                this.sprite = new pixi_js.Sprite();
            }
        }
        Object.defineProperty(Sprite.prototype, "image", {
            get: function () {
                return this._image;
            },
            set: function (val) {
                if (this._image === val) {
                    return;
                }
                if (val instanceof HTMLImageElement) {
                    this.sprite.texture && this.sprite.texture.destroy(false);
                    this.sprite.texture = pixi_js.Texture.from(val);
                }
                else if (val instanceof pixi_js.Texture) {
                    this.sprite.texture = val;
                }
                this._image = val;
            },
            enumerable: false,
            configurable: true
        });
        return Sprite;
    })());

    ((function () {
        function SpriteAnimation(_a) {
            var frames = _a.frames;
            this.animatedSprite = new pixi_js.extras.AnimatedSprite(frames);
        }
        SpriteAnimation.prototype.play = function () {
            this.animatedSprite.play();
        };
        SpriteAnimation.prototype.stop = function () {
            this.animatedSprite.stop();
        };
        SpriteAnimation.prototype.gotoAndPlay = function (frameNumber) {
            this.animatedSprite.gotoAndPlay(frameNumber);
        };
        SpriteAnimation.prototype.gotoAndStop = function (frameNumber) {
            this.animatedSprite.gotoAndStop(frameNumber);
        };
        Object.defineProperty(SpriteAnimation.prototype, "speed", {
            get: function () {
                return this.animatedSprite.animationSpeed;
            },
            set: function (val) {
                this.animatedSprite.animationSpeed = val;
            },
            enumerable: false,
            configurable: true
        });
        return SpriteAnimation;
    })());

    ((function (_super) {
        __extends$1(Text, _super);
        function Text(text, style) {
            return _super.call(this, text, style) || this;
        }
        return Text;
    })(pixi_js.Text));

    var PIXITilingSprite = pixi_js.extras.TilingSprite;
    ((function () {
        function TilingSprite(image) {
            this._image = null;
            this._image = image;
            if (image) {
                if (image instanceof HTMLImageElement) {
                    this.tilingSprite = new PIXITilingSprite(pixi_js.Texture.from(image));
                }
                else if (image instanceof pixi_js.Texture) {
                    this.tilingSprite = new PIXITilingSprite(image);
                }
            }
            else {
                this.tilingSprite = new PIXITilingSprite(pixi_js.Texture.EMPTY);
            }
        }
        Object.defineProperty(TilingSprite.prototype, "image", {
            get: function () {
                return this._image;
            },
            set: function (val) {
                if (this._image === val) {
                    return;
                }
                if (val instanceof HTMLImageElement) {
                    this.tilingSprite.texture = pixi_js.Texture.from(val);
                }
                else if (val instanceof pixi_js.Texture) {
                    this.tilingSprite.texture = val;
                }
                this._image = val;
            },
            enumerable: false,
            configurable: true
        });
        return TilingSprite;
    })());

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Built-in value references. */
    var Symbol$1 = root.Symbol;

    /** Used for built-in method references. */
    var objectProto$b = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$b.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$b.toString;

    /** Built-in value references. */
    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty$8.call(value, symToStringTag$1),
          tag = value[symToStringTag$1];

      try {
        value[symToStringTag$1] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString$1.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag$1] = tag;
        } else {
          delete value[symToStringTag$1];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto$a.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag$1 = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto = Function.prototype,
        objectProto$9 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty$7).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /* Built-in method references that are verified to be native. */
    var Map$1 = getNative(root, 'Map');

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED$2 ? undefined : result;
      }
      return hasOwnProperty$6.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$5.call(data, key);
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map$1 || ListCache),
        'string': new Hash
      };
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$3 = 1,
        COMPARE_UNORDERED_FLAG$1 = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Check that cyclic values are equal.
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG$1) ? new SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    /** Built-in value references. */
    var Uint8Array$1 = root.Uint8Array;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$2 = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /** `Object#toString` result references. */
    var boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        errorTag$1 = '[object Error]',
        mapTag$2 = '[object Map]',
        numberTag$1 = '[object Number]',
        regexpTag$1 = '[object RegExp]',
        setTag$2 = '[object Set]',
        stringTag$1 = '[object String]',
        symbolTag = '[object Symbol]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$2 = '[object DataView]';

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag$2:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag$1:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
            return false;
          }
          return true;

        case boolTag$1:
        case dateTag$1:
        case numberTag$1:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag$1:
          return object.name == other.name && object.message == other.message;

        case regexpTag$1:
        case stringTag$1:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag$2:
          var convert = mapToArray;

        case setTag$2:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable$1.call(object, symbol);
      });
    };

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag$2;
    }

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty$4.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    /** Detect free variable `exports`. */
    var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

    /** Built-in value references. */
    var Buffer = moduleExports$1 ? root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$1 : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        mapTag$1 = '[object Map]',
        numberTag = '[object Number]',
        objectTag$2 = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag$1 = '[object Set]',
        stringTag = '[object String]',
        weakMapTag$1 = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag$1 = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag$1] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag$2] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag$1] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag$1] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /** Detect free variable `exports`. */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$3.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$3;

      return value === proto;
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = overArg(Object.keys, Object);

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$2.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$1 = 1;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
          return false;
        }
      }
      // Check that cyclic values are equal.
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    /* Built-in method references that are verified to be native. */
    var DataView$1 = getNative(root, 'DataView');

    /* Built-in method references that are verified to be native. */
    var Promise$1 = getNative(root, 'Promise');

    /* Built-in method references that are verified to be native. */
    var Set = getNative(root, 'Set');

    /* Built-in method references that are verified to be native. */
    var WeakMap = getNative(root, 'WeakMap');

    /** `Object#toString` result references. */
    var mapTag = '[object Map]',
        objectTag$1 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag = '[object Set]',
        weakMapTag = '[object WeakMap]';

    var dataViewTag = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView$1),
        mapCtorString = toSource(Map$1),
        promiseCtorString = toSource(Promise$1),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((DataView$1 && getTag(new DataView$1(new ArrayBuffer(1))) != dataViewTag) ||
        (Map$1 && getTag(new Map$1) != mapTag) ||
        (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    var getTag$1 = getTag;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        objectTag = '[object Object]';

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag : getTag$1(object),
          othTag = othIsArr ? arrayTag : getTag$1(other);

      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;

      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are compared by strict equality, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }

    class RendererManager {
        constructor({ game, rendererSystem }) {
            this.renderers = [];
            this.game = game;
            this.rendererSystem = rendererSystem;
        }
        register(...renderers) {
            for (const renderer of renderers) {
                renderer.game = this.game;
                renderer.rendererManager = this.rendererSystem.rendererManager;
                renderer.containerManager = this.rendererSystem.containerManager;
                this.renderers.push(renderer);
            }
        }
        componentChanged(changes) {
            for (const changed of changes) {
                for (const renderer of this.renderers) {
                    const props = renderer.observerInfo[changed.componentName];
                    if (props) {
                        if ([eva_js.OBSERVER_TYPE.ADD, eva_js.OBSERVER_TYPE.REMOVE].indexOf(changed.type) > -1) {
                            try {
                                renderer.componentChanged && renderer.componentChanged(changed);
                            }
                            catch (e) {
                                console.error(`gameObject: ${changed.gameObject.name}, ${changed.componentName} is error.`, changed, e);
                            }
                            continue;
                        }
                        const index = props.findIndex(prop => {
                            return isEqual(prop, changed.prop);
                        });
                        if (index > -1) {
                            try {
                                renderer.componentChanged && renderer.componentChanged(changed);
                            }
                            catch (e) {
                                console.error(`gameObject: ${changed.gameObject && changed.gameObject.name}, ${changed.componentName} is componentChanged error.`, changed, e);
                            }
                        }
                    }
                }
            }
        }
        update(gameObject) {
            for (const component of gameObject.components) {
                for (const renderer of this.renderers) {
                    const cache = [];
                    const props = renderer.observerInfo[component.name];
                    if (props && cache.indexOf(gameObject) === -1) {
                        cache.push(gameObject);
                        try {
                            renderer.rendererUpdate && renderer.rendererUpdate(gameObject);
                        }
                        catch (e) {
                            console.info(`gameObject: ${gameObject.name}, ${component.name} is update error`, e);
                        }
                    }
                }
            }
        }
    }

    class ContainerManager {
        constructor() {
            this.containerMap = {};
        }
        addContainer({ name, container }) {
            this.containerMap[name] = container;
        }
        getContainer(name) {
            return this.containerMap[name];
        }
        removeContainer(name) {
            var _a;
            (_a = this.containerMap[name]) === null || _a === void 0 ? void 0 : _a.destroy(true);
            delete this.containerMap[name];
        }
        updateTransform({ name, transform }) {
            const container = this.containerMap[name];
            if (!container)
                return;
            const { anchor, origin, position, rotation, scale, size, skew } = transform;
            container.rotation = rotation;
            container.scale = scale;
            container.pivot.x = size.width * origin.x;
            container.pivot.y = size.height * origin.y;
            container.skew = skew;
            let x = position.x;
            let y = position.y;
            if (transform.parent) {
                const parent = transform.parent;
                x = x + parent.size.width * anchor.x;
                y = y + parent.size.height * anchor.y;
            }
            container.position = { x, y };
        }
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var eventemitter3 = createCommonjsModule(function (module) {

    var has = Object.prototype.hasOwnProperty
      , prefix = '~';

    /**
     * Constructor to create a storage for our `EE` objects.
     * An `Events` instance is a plain object whose properties are event names.
     *
     * @constructor
     * @private
     */
    function Events() {}

    //
    // We try to not inherit from `Object.prototype`. In some engines creating an
    // instance in this way is faster than calling `Object.create(null)` directly.
    // If `Object.create(null)` is not supported we prefix the event names with a
    // character to make sure that the built-in object properties are not
    // overridden or used as an attack vector.
    //
    if (Object.create) {
      Events.prototype = Object.create(null);

      //
      // This hack is needed because the `__proto__` property is still inherited in
      // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
      //
      if (!new Events().__proto__) prefix = false;
    }

    /**
     * Representation of a single event listener.
     *
     * @param {Function} fn The listener function.
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
     * @constructor
     * @private
     */
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }

    /**
     * Add a listener for a given event.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} once Specify if the listener is a one-time listener.
     * @returns {EventEmitter}
     * @private
     */
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
      }

      var listener = new EE(fn, context || emitter, once)
        , evt = prefix ? prefix + event : event;

      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];

      return emitter;
    }

    /**
     * Clear event by name.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} evt The Event name.
     * @private
     */
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }

    /**
     * Minimal `EventEmitter` interface that is molded against the Node.js
     * `EventEmitter` interface.
     *
     * @constructor
     * @public
     */
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }

    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     *
     * @returns {Array}
     * @public
     */
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = []
        , events
        , name;

      if (this._eventsCount === 0) return names;

      for (name in (events = this._events)) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }

      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }

      return names;
    };

    /**
     * Return the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Array} The registered listeners.
     * @public
     */
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event
        , handlers = this._events[evt];

      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];

      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }

      return ee;
    };

    /**
     * Return the number of listeners listening to a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Number} The number of listeners.
     * @public
     */
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event
        , listeners = this._events[evt];

      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };

    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @public
     */
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return false;

      var listeners = this._events[evt]
        , len = arguments.length
        , args
        , i;

      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
          case 1: return listeners.fn.call(listeners.context), true;
          case 2: return listeners.fn.call(listeners.context, a1), true;
          case 3: return listeners.fn.call(listeners.context, a1, a2), true;
          case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++) {
          args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length
          , j;

        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

          switch (len) {
            case 1: listeners[i].fn.call(listeners[i].context); break;
            case 2: listeners[i].fn.call(listeners[i].context, a1); break;
            case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
            case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
            default:
              if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                args[j - 1] = arguments[j];
              }

              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }

      return true;
    };

    /**
     * Add a listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };

    /**
     * Add a one-time listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn Only remove the listeners that match this function.
     * @param {*} context Only remove the listeners that have this context.
     * @param {Boolean} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }

      var listeners = this._events[evt];

      if (listeners.fn) {
        if (
          listeners.fn === fn &&
          (!once || listeners.once) &&
          (!context || listeners.context === context)
        ) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (
            listeners[i].fn !== fn ||
            (once && !listeners[i].once) ||
            (context && listeners[i].context !== context)
          ) {
            events.push(listeners[i]);
          }
        }

        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }

      return this;
    };

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {(String|Symbol)} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;

      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }

      return this;
    };

    //
    // Alias methods names because people roll like that.
    //
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    //
    // Expose the prefix.
    //
    EventEmitter.prefixed = prefix;

    //
    // Allow `EventEmitter` to be imported as module namespace.
    //
    EventEmitter.EventEmitter = EventEmitter;

    //
    // Expose the module.
    //
    {
      module.exports = EventEmitter;
    }
    });

    let Transform = class Transform extends eventemitter3 {
        constructor({ system, containerManager }) {
            super();
            this.name = 'Transform';
            this.waitRemoveIds = [];
            this.waitChangeScenes = [];
            this.containerManager = containerManager;
            this.init(system);
        }
        init(system) {
            this.system = system;
            this.on('changeScene', ({ scene, mode, application }) => {
                this.waitChangeScenes.push({ scene, mode, application });
            });
        }
        update() {
            for (const id of this.waitRemoveIds) {
                this.containerManager.removeContainer(id);
            }
            this.waitRemoveIds = [];
            for (const sceneInfo of this.waitChangeScenes) {
                const container = this.containerManager.getContainer(sceneInfo.scene.id);
                if (container) {
                    sceneInfo.application.stage.removeChildren();
                    sceneInfo.application.stage.addChild(container);
                }
            }
            this.waitChangeScenes = [];
        }
        componentChanged(changed) {
            if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                this.addContainer(changed);
            }
            else if (changed.type === eva_js.OBSERVER_TYPE.CHANGE) {
                this.change(changed);
            }
            else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                this.waitRemoveIds.push(changed.gameObject.id);
            }
        }
        addContainer(changed) {
            const container = new Container();
            container.name = changed.gameObject.name;
            this.containerManager.addContainer({
                name: changed.gameObject.id,
                container,
            });
            const transform = changed.component;
            transform.worldTransform = container.transform.worldTransform;
        }
        change(changed) {
            const transform = changed.component;
            if (transform.parent) {
                const parentContainer = this.containerManager.getContainer(transform.parent.gameObject.id);
                parentContainer.addChild(this.containerManager.getContainer(changed.gameObject.id));
                const render = changed.gameObject.transform.parent &&
                    changed.gameObject.transform.parent.gameObject.getComponent('Render');
                if (render) {
                    render.sortDirty = true;
                }
            }
            else {
                const container = this.containerManager.getContainer(changed.gameObject.id);
                delete transform.worldTransform;
                container.parent && container.parent.removeChild(container);
            }
        }
        destroy() {
            this.removeAllListeners();
            this.waitRemoveIds = null;
            this.waitChangeScenes = null;
            this.system = null;
            this.containerManager = null;
        }
    };
    Transform = __decorate([
        eva_js.decorators.componentObserver({
            Transform: ['_parent'],
        })
    ], Transform);
    var Transform$1 = Transform;

    let res = undefined;
    function getAbilities() {
        if (res)
            return res;
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.warn('WebGL not available for compressed textures. Silently failing.');
            return;
        }
        const extensions = {
            s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
            s3tc_sRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'),
            etc: gl.getExtension('WEBGL_compressed_texture_etc'),
            etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
            pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc')
                || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
            atc: gl.getExtension('WEBGL_compressed_texture_atc'),
            astc: gl.getExtension('WEBGL_compressed_texture_astc')
        };
        const textureFormats = {};
        for (const extensionName in extensions) {
            const extension = extensions[extensionName];
            if (!extension) {
                continue;
            }
            Object.assign(textureFormats, Object.getPrototypeOf(extension));
        }
        let formats = Object.values(textureFormats);
        res = {
            extensions,
            textureFormats,
            formats
        };
        return res;
    }

    /*!
     * type-signals - v1.1.0
     * https://github.com/englercj/type-signals
     * Compiled Wed, 22 Apr 2020 17:58:58 UTC
     *
     * type-signals is licensed under the MIT license.
     * http://www.opensource.org/licenses/mit-license
     */
    var SignalBindingImpl = (function () {
        function SignalBindingImpl(fn, once, thisArg) {
            if (once === void 0) { once = false; }
            this.next = null;
            this.prev = null;
            this.owner = null;
            this.fn = fn;
            this.once = once;
            this.thisArg = thisArg;
        }
        SignalBindingImpl.prototype.detach = function () {
            if (this.owner === null)
                return false;
            this.owner.detach(this);
            return true;
        };
        SignalBindingImpl.prototype.dispose = function () {
            this.detach();
        };
        return SignalBindingImpl;
    }());
    var Signal = (function () {
        function Signal() {
            this._head = null;
            this._tail = null;
            this._filter = null;
        }
        Signal.prototype.handlers = function () {
            var node = this._head;
            var handlers = [];
            while (node) {
                handlers.push(node);
                node = node.next;
            }
            return handlers;
        };
        Signal.prototype.hasAny = function () {
            return !!this._head;
        };
        Signal.prototype.has = function (node) {
            return node.owner === this;
        };
        Signal.prototype.dispatch = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var node = this._head;
            if (!node)
                return false;
            if (this._filter && !this._filter.apply(this, args))
                return false;
            while (node) {
                if (node.once)
                    this.detach(node);
                node.fn.apply(node.thisArg, args);
                node = node.next;
            }
            return true;
        };
        Signal.prototype.add = function (fn, thisArg) {
            if (thisArg === void 0) { thisArg = null; }
            return this._addSignalBinding(new SignalBindingImpl(fn, false, thisArg));
        };
        Signal.prototype.once = function (fn, thisArg) {
            if (thisArg === void 0) { thisArg = null; }
            return this._addSignalBinding(new SignalBindingImpl(fn, true, thisArg));
        };
        Signal.prototype.detach = function (node_) {
            var node = node_;
            if (node.owner !== this)
                return this;
            if (node.prev)
                node.prev.next = node.next;
            if (node.next)
                node.next.prev = node.prev;
            if (node === this._head) {
                this._head = node.next;
                if (node.next === null) {
                    this._tail = null;
                }
            }
            else if (node === this._tail) {
                this._tail = node.prev;
                if (this._tail)
                    this._tail.next = null;
            }
            node.owner = null;
            return this;
        };
        Signal.prototype.detachAll = function () {
            var node = this._head;
            if (!node)
                return this;
            this._head = null;
            this._tail = null;
            while (node) {
                node.owner = null;
                node = node.next;
            }
            return this;
        };
        Signal.prototype.filter = function (filter) {
            this._filter = filter;
        };
        Signal.prototype.proxy = function () {
            var _this = this;
            var signals = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                signals[_i] = arguments[_i];
            }
            var fn = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.dispatch.apply(_this, args);
            };
            for (var i = 0; i < signals.length; ++i) {
                signals[i].add(fn);
            }
            return this;
        };
        Signal.prototype._addSignalBinding = function (node_) {
            var node = node_;
            if (!this._head) {
                this._head = node;
                this._tail = node;
            }
            else {
                if (this._tail)
                    this._tail.next = node;
                node.prev = this._tail;
                this._tail = node;
            }
            node.owner = this;
            return node;
        };
        return Signal;
    }());

    function parseURI (str, opts) {
      if (!str) return undefined

      opts = opts || {};

      var o = {
        key: [
          'source',
          'protocol',
          'authority',
          'userInfo',
          'user',
          'password',
          'host',
          'port',
          'relative',
          'path',
          'directory',
          'file',
          'query',
          'anchor'
        ],
        q: {
          name: 'queryKey',
          parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
          strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
      };

      var m = o.parser[opts.strictMode ? 'strict' : 'loose'].exec(str);
      var uri = {};
      var i = 14;

      while (i--) uri[o.key[i]] = m[i] || '';

      uri[o.q.name] = {};
      uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
      });

      return uri
    }

    var parseUri = parseURI;

    /*!
     * resource-loader - v4.0.0-rc4
     * https://github.com/englercj/resource-loader
     * Compiled Sun, 08 Mar 2020 16:55:29 UTC
     *
     * resource-loader is licensed under the MIT license.
     * http://www.opensource.org/licenses/mit-license
     */

    var AbstractLoadStrategy = (function () {
        function AbstractLoadStrategy(config) {
            this.config = config;
            this.onError = new Signal();
            this.onComplete = new Signal();
            this.onProgress = new Signal();
        }
        return AbstractLoadStrategy;
    }());

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

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    function getExtension(url) {
        var isDataUrl = url.indexOf('data:') === 0;
        var ext = '';
        if (isDataUrl) {
            var slashIndex = url.indexOf('/');
            ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
        }
        else {
            var queryStart = url.indexOf('?');
            var hashStart = url.indexOf('#');
            var index = Math.min(queryStart > -1 ? queryStart : url.length, hashStart > -1 ? hashStart : url.length);
            url = url.substring(0, index);
            ext = url.substring(url.lastIndexOf('.') + 1);
        }
        return ext.toLowerCase();
    }
    function assertNever(x) {
        throw new Error('Unexpected value. Should have been never.');
    }

    var ResourceType;
    (function (ResourceType) {
        ResourceType[ResourceType["Unknown"] = 0] = "Unknown";
        ResourceType[ResourceType["Buffer"] = 1] = "Buffer";
        ResourceType[ResourceType["Blob"] = 2] = "Blob";
        ResourceType[ResourceType["Json"] = 3] = "Json";
        ResourceType[ResourceType["Xml"] = 4] = "Xml";
        ResourceType[ResourceType["Image"] = 5] = "Image";
        ResourceType[ResourceType["Audio"] = 6] = "Audio";
        ResourceType[ResourceType["Video"] = 7] = "Video";
        ResourceType[ResourceType["Text"] = 8] = "Text";
    })(ResourceType || (ResourceType = {}));
    var ResourceState;
    (function (ResourceState) {
        ResourceState[ResourceState["NotStarted"] = 0] = "NotStarted";
        ResourceState[ResourceState["Loading"] = 1] = "Loading";
        ResourceState[ResourceState["Complete"] = 2] = "Complete";
    })(ResourceState || (ResourceState = {}));

    var MediaElementLoadStrategy = (function (_super) {
        __extends(MediaElementLoadStrategy, _super);
        function MediaElementLoadStrategy(config, elementType) {
            var _this = _super.call(this, config) || this;
            _this.elementType = elementType;
            _this._boundOnLoad = _this._onLoad.bind(_this);
            _this._boundOnError = _this._onError.bind(_this);
            _this._boundOnTimeout = _this._onTimeout.bind(_this);
            _this._element = _this._createElement();
            _this._elementTimer = 0;
            return _this;
        }
        MediaElementLoadStrategy.prototype.load = function () {
            var config = this.config;
            if (config.crossOrigin)
                this._element.crossOrigin = config.crossOrigin;
            var urls = config.sourceSet || [config.url];
            if (navigator.isCocoonJS) {
                this._element.src = urls[0];
            }
            else {
                for (var i = 0; i < urls.length; ++i) {
                    var url = urls[i];
                    var mimeType = config.mimeTypes ? config.mimeTypes[i] : undefined;
                    if (!mimeType)
                        mimeType = this.elementType + "/" + getExtension(url);
                    var source = document.createElement('source');
                    source.src = url;
                    source.type = mimeType;
                    this._element.appendChild(source);
                }
            }
            this._element.addEventListener('load', this._boundOnLoad, false);
            this._element.addEventListener('canplaythrough', this._boundOnLoad, false);
            this._element.addEventListener('error', this._boundOnError, false);
            this._element.load();
            if (config.timeout)
                this._elementTimer = window.setTimeout(this._boundOnTimeout, config.timeout);
        };
        MediaElementLoadStrategy.prototype.abort = function () {
            this._clearEvents();
            while (this._element.firstChild) {
                this._element.removeChild(this._element.firstChild);
            }
            this._error(this.elementType + " load aborted by the user.");
        };
        MediaElementLoadStrategy.prototype._createElement = function () {
            if (this.config.loadElement)
                return this.config.loadElement;
            else
                return document.createElement(this.elementType);
        };
        MediaElementLoadStrategy.prototype._clearEvents = function () {
            clearTimeout(this._elementTimer);
            this._element.removeEventListener('load', this._boundOnLoad, false);
            this._element.removeEventListener('canplaythrough', this._boundOnLoad, false);
            this._element.removeEventListener('error', this._boundOnError, false);
        };
        MediaElementLoadStrategy.prototype._error = function (errMessage) {
            this._clearEvents();
            this.onError.dispatch(errMessage);
        };
        MediaElementLoadStrategy.prototype._complete = function () {
            this._clearEvents();
            var resourceType = ResourceType.Unknown;
            switch (this.elementType) {
                case 'audio':
                    resourceType = ResourceType.Audio;
                    break;
                case 'video':
                    resourceType = ResourceType.Video;
                    break;
                default: assertNever(this.elementType);
            }
            this.onComplete.dispatch(resourceType, this._element);
        };
        MediaElementLoadStrategy.prototype._onLoad = function () {
            this._complete();
        };
        MediaElementLoadStrategy.prototype._onError = function () {
            this._error(this.elementType + " failed to load.");
        };
        MediaElementLoadStrategy.prototype._onTimeout = function () {
            this._error(this.elementType + " load timed out.");
        };
        return MediaElementLoadStrategy;
    }(AbstractLoadStrategy));

    var AudioLoadStrategy = (function (_super) {
        __extends(AudioLoadStrategy, _super);
        function AudioLoadStrategy(config) {
            return _super.call(this, config, 'audio') || this;
        }
        return AudioLoadStrategy;
    }(MediaElementLoadStrategy));

    var EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    var ImageLoadStrategy = (function (_super) {
        __extends(ImageLoadStrategy, _super);
        function ImageLoadStrategy() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._boundOnLoad = _this._onLoad.bind(_this);
            _this._boundOnError = _this._onError.bind(_this);
            _this._boundOnTimeout = _this._onTimeout.bind(_this);
            _this._element = _this._createElement();
            _this._elementTimer = 0;
            return _this;
        }
        ImageLoadStrategy.prototype.load = function () {
            var config = this.config;
            if (config.crossOrigin)
                this._element.crossOrigin = config.crossOrigin;
            this._element.src = config.url;
            this._element.addEventListener('load', this._boundOnLoad, false);
            this._element.addEventListener('error', this._boundOnError, false);
            if (config.timeout)
                this._elementTimer = window.setTimeout(this._boundOnTimeout, config.timeout);
        };
        ImageLoadStrategy.prototype.abort = function () {
            this._clearEvents();
            this._element.src = EMPTY_GIF;
            this._error('Image load aborted by the user.');
        };
        ImageLoadStrategy.prototype._createElement = function () {
            if (this.config.loadElement)
                return this.config.loadElement;
            else
                return document.createElement('img');
        };
        ImageLoadStrategy.prototype._clearEvents = function () {
            clearTimeout(this._elementTimer);
            this._element.removeEventListener('load', this._boundOnLoad, false);
            this._element.removeEventListener('error', this._boundOnError, false);
        };
        ImageLoadStrategy.prototype._error = function (errMessage) {
            this._clearEvents();
            this.onError.dispatch(errMessage);
        };
        ImageLoadStrategy.prototype._complete = function () {
            this._clearEvents();
            this.onComplete.dispatch(ResourceType.Image, this._element);
        };
        ImageLoadStrategy.prototype._onLoad = function () {
            this._complete();
        };
        ImageLoadStrategy.prototype._onError = function () {
            this._error('Image failed to load.');
        };
        ImageLoadStrategy.prototype._onTimeout = function () {
            this._error('Image load timed out.');
        };
        return ImageLoadStrategy;
    }(AbstractLoadStrategy));

    var VideoLoadStrategy = (function (_super) {
        __extends(VideoLoadStrategy, _super);
        function VideoLoadStrategy(config) {
            return _super.call(this, config, 'video') || this;
        }
        return VideoLoadStrategy;
    }(MediaElementLoadStrategy));

    var useXdr = !!(window.XDomainRequest && !('withCredentials' in (new XMLHttpRequest())));
    var XhrResponseType;
    (function (XhrResponseType) {
        XhrResponseType["Default"] = "text";
        XhrResponseType["Buffer"] = "arraybuffer";
        XhrResponseType["Blob"] = "blob";
        XhrResponseType["Document"] = "document";
        XhrResponseType["Json"] = "json";
        XhrResponseType["Text"] = "text";
    })(XhrResponseType || (XhrResponseType = {}));
    function reqType(xhr) {
        return xhr.toString().replace('object ', '');
    }
    var XhrLoadStrategy = (function (_super) {
        __extends(XhrLoadStrategy, _super);
        function XhrLoadStrategy() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._boundOnLoad = _this._onLoad.bind(_this);
            _this._boundOnAbort = _this._onAbort.bind(_this);
            _this._boundOnError = _this._onError.bind(_this);
            _this._boundOnTimeout = _this._onTimeout.bind(_this);
            _this._boundOnProgress = _this._onProgress.bind(_this);
            _this._xhr = _this._createRequest();
            _this._xhrType = XhrResponseType.Default;
            return _this;
        }
        XhrLoadStrategy.prototype.load = function () {
            var config = this.config;
            var ext = getExtension(config.url);
            if (typeof config.xhrType !== 'string') {
                config.xhrType = this._determineXhrType(ext);
            }
            var xhr = this._xhr;
            this._xhrType = config.xhrType || XhrResponseType.Default;
            if (useXdr) {
                xhr.timeout = config.timeout || 5000;
                xhr.onload = this._boundOnLoad;
                xhr.onerror = this._boundOnError;
                xhr.ontimeout = this._boundOnTimeout;
                xhr.onprogress = this._boundOnProgress;
                xhr.open('GET', config.url, true);
                setTimeout(function () { xhr.send(); }, 0);
            }
            else {
                xhr.open('GET', config.url, true);
                if (config.timeout)
                    xhr.timeout = config.timeout;
                if (config.xhrType === XhrResponseType.Json || config.xhrType === XhrResponseType.Document)
                    xhr.responseType = XhrResponseType.Text;
                else
                    xhr.responseType = config.xhrType;
                xhr.addEventListener('load', this._boundOnLoad, false);
                xhr.addEventListener('abort', this._boundOnAbort, false);
                xhr.addEventListener('error', this._boundOnError, false);
                xhr.addEventListener('timeout', this._boundOnTimeout, false);
                xhr.addEventListener('progress', this._boundOnProgress, false);
                xhr.send();
            }
        };
        XhrLoadStrategy.prototype.abort = function () {
            if (useXdr) {
                this._clearEvents();
                this._xhr.abort();
                this._onAbort();
            }
            else {
                this._xhr.abort();
            }
        };
        XhrLoadStrategy.prototype._createRequest = function () {
            if (useXdr)
                return new window.XDomainRequest();
            else
                return new XMLHttpRequest();
        };
        XhrLoadStrategy.prototype._determineXhrType = function (ext) {
            return XhrLoadStrategy._xhrTypeMap[ext] || XhrResponseType.Default;
        };
        XhrLoadStrategy.prototype._clearEvents = function () {
            if (useXdr) {
                this._xhr.onload = null;
                this._xhr.onerror = null;
                this._xhr.ontimeout = null;
                this._xhr.onprogress = null;
            }
            else {
                this._xhr.removeEventListener('load', this._boundOnLoad, false);
                this._xhr.removeEventListener('abort', this._boundOnAbort, false);
                this._xhr.removeEventListener('error', this._boundOnError, false);
                this._xhr.removeEventListener('timeout', this._boundOnTimeout, false);
                this._xhr.removeEventListener('progress', this._boundOnProgress, false);
            }
        };
        XhrLoadStrategy.prototype._error = function (errMessage) {
            this._clearEvents();
            this.onError.dispatch(errMessage);
        };
        XhrLoadStrategy.prototype._complete = function (type, data) {
            this._clearEvents();
            this.onComplete.dispatch(type, data);
        };
        XhrLoadStrategy.prototype._onLoad = function () {
            var xhr = this._xhr;
            var text = '';
            var status = typeof xhr.status === 'undefined' ? 200 : xhr.status;
            if (typeof xhr.responseType === 'undefined' || xhr.responseType === '' || xhr.responseType === 'text') {
                text = xhr.responseText;
            }
            if (status === 0 && (text.length > 0 || xhr.responseType === XhrResponseType.Buffer)) {
                status = 200;
            }
            else if (status === 1223) {
                status = 204;
            }
            var flattenedStatus = Math.floor(status / 100) * 100;
            if (flattenedStatus !== 200) {
                this._error("[" + xhr.status + "] " + xhr.statusText + ": " + xhr.responseURL);
                return;
            }
            switch (this._xhrType) {
                case XhrResponseType.Buffer:
                    this._complete(ResourceType.Buffer, xhr.response);
                    break;
                case XhrResponseType.Blob:
                    this._complete(ResourceType.Blob, xhr.response);
                    break;
                case XhrResponseType.Document:
                    this._parseDocument(text);
                    break;
                case XhrResponseType.Json:
                    this._parseJson(text);
                    break;
                case XhrResponseType.Default:
                case XhrResponseType.Text:
                    this._complete(ResourceType.Text, text);
                    break;
                default:
                    assertNever(this._xhrType);
            }
        };
        XhrLoadStrategy.prototype._parseDocument = function (text) {
            try {
                if (window.DOMParser) {
                    var parser = new DOMParser();
                    var data = parser.parseFromString(text, 'text/xml');
                    this._complete(ResourceType.Xml, data);
                }
                else {
                    var div = document.createElement('div');
                    div.innerHTML = text;
                    this._complete(ResourceType.Xml, div);
                }
            }
            catch (e) {
                this._error("Error trying to parse loaded xml: " + e);
            }
        };
        XhrLoadStrategy.prototype._parseJson = function (text) {
            try {
                var data = JSON.parse(text);
                this._complete(ResourceType.Json, data);
            }
            catch (e) {
                this._error("Error trying to parse loaded json: " + e);
            }
        };
        XhrLoadStrategy.prototype._onAbort = function () {
            var xhr = this._xhr;
            this._error(reqType(xhr) + " Request was aborted by the user.");
        };
        XhrLoadStrategy.prototype._onError = function () {
            var xhr = this._xhr;
            this._error(reqType(xhr) + " Request failed. Status: " + xhr.status + ", text: \"" + xhr.statusText + "\"");
        };
        XhrLoadStrategy.prototype._onTimeout = function () {
            var xhr = this._xhr;
            this._error(reqType(xhr) + " Request timed out.");
        };
        XhrLoadStrategy.prototype._onProgress = function (event) {
            if (event && event.lengthComputable) {
                this.onProgress.dispatch(event.loaded / event.total);
            }
        };
        XhrLoadStrategy.setExtensionXhrType = function (extname, xhrType) {
            if (extname && extname.indexOf('.') === 0)
                extname = extname.substring(1);
            if (!extname)
                return;
            XhrLoadStrategy._xhrTypeMap[extname] = xhrType;
        };
        XhrLoadStrategy.ResponseType = XhrResponseType;
        XhrLoadStrategy._xhrTypeMap = {
            xhtml: XhrResponseType.Document,
            html: XhrResponseType.Document,
            htm: XhrResponseType.Document,
            xml: XhrResponseType.Document,
            tmx: XhrResponseType.Document,
            svg: XhrResponseType.Document,
            tsx: XhrResponseType.Document,
            gif: XhrResponseType.Blob,
            png: XhrResponseType.Blob,
            bmp: XhrResponseType.Blob,
            jpg: XhrResponseType.Blob,
            jpeg: XhrResponseType.Blob,
            tif: XhrResponseType.Blob,
            tiff: XhrResponseType.Blob,
            webp: XhrResponseType.Blob,
            tga: XhrResponseType.Blob,
            json: XhrResponseType.Json,
            text: XhrResponseType.Text,
            txt: XhrResponseType.Text,
            ttf: XhrResponseType.Buffer,
            otf: XhrResponseType.Buffer,
        };
        return XhrLoadStrategy;
    }(AbstractLoadStrategy));

    function onlyOnce(func) {
        var fn = func;
        return function onceWrapper() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (fn === null)
                throw new Error('Callback was already called.');
            var callFn = fn;
            fn = null;
            return callFn.apply(this, args);
        };
    }
    var AsyncQueue = (function () {
        function AsyncQueue(worker, concurrency) {
            if (concurrency === void 0) { concurrency = 1; }
            this.worker = worker;
            this.concurrency = concurrency;
            this.workers = 0;
            this.buffer = 0;
            this.paused = false;
            this._started = false;
            this._tasks = [];
            this.onSaturated = new Signal();
            this.onUnsaturated = new Signal();
            this.onEmpty = new Signal();
            this.onDrain = new Signal();
            this.onError = new Signal();
            if (concurrency === 0)
                throw new Error('Concurrency must not be zero');
            this.buffer = concurrency / 4;
        }
        Object.defineProperty(AsyncQueue.prototype, "started", {
            get: function () { return this._started; },
            enumerable: true,
            configurable: true
        });
        AsyncQueue.prototype.reset = function () {
            this.onDrain.detachAll();
            this.workers = 0;
            this._started = false;
            this._tasks = [];
        };
        AsyncQueue.prototype.push = function (data, callback) {
            this._insert(data, false, callback);
        };
        AsyncQueue.prototype.unshift = function (data, callback) {
            this._insert(data, true, callback);
        };
        AsyncQueue.prototype.process = function () {
            while (!this.paused && this.workers < this.concurrency && this._tasks.length) {
                var task = this._tasks.shift();
                if (this._tasks.length === 0)
                    this.onEmpty.dispatch();
                this.workers += 1;
                if (this.workers === this.concurrency)
                    this.onSaturated.dispatch();
                this.worker(task.data, onlyOnce(this._next(task)));
            }
        };
        AsyncQueue.prototype.length = function () {
            return this._tasks.length;
        };
        AsyncQueue.prototype.running = function () {
            return this.workers;
        };
        AsyncQueue.prototype.idle = function () {
            return this._tasks.length + this.workers === 0;
        };
        AsyncQueue.prototype.pause = function () {
            if (this.paused === true)
                return;
            this.paused = true;
        };
        AsyncQueue.prototype.resume = function () {
            if (this.paused === false)
                return;
            this.paused = false;
            for (var w = 1; w <= this.concurrency; w++) {
                this.process();
            }
        };
        AsyncQueue.prototype.getTask = function (index) {
            return this._tasks[index];
        };
        AsyncQueue.prototype._insert = function (data, insertAtFront, callback) {
            var _this = this;
            if (callback != null && typeof callback !== 'function') {
                throw new Error('task callback must be a function');
            }
            this._started = true;
            if (data == null && this.idle()) {
                setTimeout(function () { return _this.onDrain.dispatch(); }, 1);
                return;
            }
            var task = { data: data, callback: callback };
            if (insertAtFront)
                this._tasks.unshift(task);
            else
                this._tasks.push(task);
            setTimeout(function () { return _this.process(); }, 1);
        };
        AsyncQueue.prototype._next = function (task) {
            var _this = this;
            return function (err) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                _this.workers -= 1;
                if (task.callback)
                    task.callback.apply(task, __spreadArrays([err], args));
                if (err)
                    _this.onError.dispatch(err, task.data);
                if (_this.workers <= (_this.concurrency - _this.buffer))
                    _this.onUnsaturated.dispatch();
                if (_this.idle())
                    _this.onDrain.dispatch();
                _this.process();
            };
        };
        return AsyncQueue;
    }());

    var Resource = (function () {
        function Resource(name, options) {
            this.children = [];
            this.onStart = new Signal();
            this.onProgress = new Signal();
            this.onComplete = new Signal();
            this.onAfterMiddleware = new Signal();
            this.data = null;
            this.type = ResourceType.Unknown;
            this.error = '';
            this.progressChunk = 0;
            this._dequeue = function () { };
            this._onCompleteBinding = null;
            this._state = ResourceState.NotStarted;
            this.name = name;
            this.metadata = options.metadata;
            if (typeof options.crossOrigin !== 'string')
                options.crossOrigin = this._determineCrossOrigin(options.url);
            if (options.strategy && typeof options.strategy !== 'function') {
                this._strategy = options.strategy;
                this._strategy.config = options;
            }
            else {
                var StrategyCtor = options.strategy;
                if (!StrategyCtor)
                    StrategyCtor = Resource._loadStrategyMap[getExtension(options.url)];
                if (!StrategyCtor)
                    StrategyCtor = Resource._defaultLoadStrategy;
                this._strategy = new StrategyCtor(options);
            }
            this._strategy.onError.add(this._error, this);
            this._strategy.onComplete.add(this._complete, this);
            this._strategy.onProgress.add(this._progress, this);
        }
        Resource.setDefaultLoadStrategy = function (strategy) {
            Resource._defaultLoadStrategy = strategy;
        };
        Resource.setLoadStrategy = function (extname, strategy) {
            if (extname && extname.indexOf('.') === 0)
                extname = extname.substring(1);
            if (!extname)
                return;
            Resource._loadStrategyMap[extname] = strategy;
        };
        Object.defineProperty(Resource.prototype, "strategy", {
            get: function () { return this._strategy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "url", {
            get: function () { return this._strategy.config.url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "isLoading", {
            get: function () { return this._state === ResourceState.Loading; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "isComplete", {
            get: function () { return this._state === ResourceState.Complete; },
            enumerable: true,
            configurable: true
        });
        Resource.prototype.abort = function () {
            this._strategy.abort();
        };
        Resource.prototype.load = function () {
            this._state = ResourceState.Loading;
            this.onStart.dispatch(this);
            this._strategy.load();
        };
        Resource.prototype._error = function (errMessage) {
            this._state = ResourceState.Complete;
            this.error = errMessage;
            this.onComplete.dispatch(this);
        };
        Resource.prototype._complete = function (type, data) {
            this._state = ResourceState.Complete;
            this.type = type;
            this.data = data;
            this.onComplete.dispatch(this);
        };
        Resource.prototype._progress = function (percent) {
            this.onProgress.dispatch(this, percent);
        };
        Resource.prototype._determineCrossOrigin = function (url, loc) {
            if (loc === void 0) { loc = window.location; }
            if (url.indexOf('data:') === 0 || url.indexOf('javascript:') === 0)
                return '';
            if (window.origin !== window.location.origin)
                return 'anonymous';
            if (!Resource._tempAnchor)
                Resource._tempAnchor = document.createElement('a');
            Resource._tempAnchor.href = url;
            var parsed = parseUri(Resource._tempAnchor.href, { strictMode: true });
            var samePort = (!parsed.port && loc.port === '') || (parsed.port === loc.port);
            var protocol = parsed.protocol ? parsed.protocol + ":" : '';
            if (parsed.host !== loc.hostname || !samePort || protocol !== loc.protocol)
                return 'anonymous';
            return '';
        };
        Resource._tempAnchor = null;
        Resource._defaultLoadStrategy = XhrLoadStrategy;
        Resource._loadStrategyMap = {
            gif: ImageLoadStrategy,
            png: ImageLoadStrategy,
            bmp: ImageLoadStrategy,
            jpg: ImageLoadStrategy,
            jpeg: ImageLoadStrategy,
            tif: ImageLoadStrategy,
            tiff: ImageLoadStrategy,
            webp: ImageLoadStrategy,
            tga: ImageLoadStrategy,
            svg: ImageLoadStrategy,
            'svg+xml': ImageLoadStrategy,
            mp3: AudioLoadStrategy,
            ogg: AudioLoadStrategy,
            wav: AudioLoadStrategy,
            mp4: VideoLoadStrategy,
            webm: VideoLoadStrategy,
            mov: VideoLoadStrategy,
        };
        return Resource;
    }());

    function eachSeries(array, iterator, callback, deferNext) {
        if (deferNext === void 0) { deferNext = false; }
        var i = 0;
        var len = array.length;
        (function next(err) {
            if (err || i === len) {
                if (callback)
                    callback(err);
                return;
            }
            if (deferNext)
                setTimeout(function () { return iterator(array[i++], next); }, 1);
            else
                iterator(array[i++], next);
        })();
    }

    var MAX_PROGRESS = 100;
    var rgxExtractUrlHash = /(#[\w-]+)?$/;
    ((function () {
        function Loader(baseUrl, concurrency) {
            if (baseUrl === void 0) { baseUrl = ''; }
            if (concurrency === void 0) { concurrency = 10; }
            this.progress = 0;
            this.loading = false;
            this.defaultQueryString = '';
            this.resources = {};
            this.onError = new Signal();
            this.onLoad = new Signal();
            this.onStart = new Signal();
            this.onComplete = new Signal();
            this.onProgress = new Signal();
            this._baseUrl = '';
            this._urlResolvers = [];
            this._middleware = [];
            this._resourcesParsing = [];
            this._boundLoadResource = this._loadResource.bind(this);
            this.baseUrl = baseUrl;
            this._queue = new AsyncQueue(this._boundLoadResource, concurrency);
            this._queue.pause();
            this._middleware = Loader._defaultMiddleware.slice();
        }
        Object.defineProperty(Loader.prototype, "baseUrl", {
            get: function () { return this._baseUrl; },
            set: function (url) {
                while (url.length && url.charAt(url.length - 1) === '/') {
                    url = url.slice(0, -1);
                }
                this._baseUrl = url;
            },
            enumerable: true,
            configurable: true
        });
        Loader.prototype.add = function (options, url_) {
            if (Array.isArray(options)) {
                for (var i = 0; i < options.length; ++i) {
                    this.add(options[i]);
                }
                return this;
            }
            var url = '';
            var name = '';
            var baseUrl = this._baseUrl;
            var resOptions = { url: '' };
            if (typeof options === 'object') {
                url = options.url;
                name = options.name || options.url;
                baseUrl = options.baseUrl || baseUrl;
                resOptions = options;
            }
            else {
                name = options;
                if (typeof url_ === 'string')
                    url = url_;
                else
                    url = name;
            }
            if (!url)
                throw new Error('You must specify the `url` property.');
            if (this.loading && !resOptions.parentResource) {
                throw new Error('Cannot add root resources while the loader is running.');
            }
            if (this.resources[name]) {
                throw new Error("Resource named \"" + name + "\" already exists.");
            }
            url = this._prepareUrl(url, baseUrl);
            resOptions.url = url;
            var resource = new Resource(name, resOptions);
            this.resources[name] = resource;
            if (typeof resOptions.onComplete === 'function') {
                resource.onAfterMiddleware.once(resOptions.onComplete);
            }
            if (this.loading) {
                var parent_1 = resOptions.parentResource;
                var incompleteChildren = [];
                for (var i = 0; i < parent_1.children.length; ++i) {
                    if (!parent_1.children[i].isComplete) {
                        incompleteChildren.push(parent_1.children[i]);
                    }
                }
                var fullChunk = parent_1.progressChunk * (incompleteChildren.length + 1);
                var eachChunk = fullChunk / (incompleteChildren.length + 2);
                parent_1.children.push(resource);
                parent_1.progressChunk = eachChunk;
                for (var i = 0; i < incompleteChildren.length; ++i) {
                    incompleteChildren[i].progressChunk = eachChunk;
                }
                resource.progressChunk = eachChunk;
            }
            this._queue.push(resource);
            return this;
        };
        Loader.prototype.use = function (fn, priority) {
            if (priority === void 0) { priority = Loader.DefaultMiddlewarePriority; }
            this._middleware.push({ fn: fn, priority: priority });
            this._middleware.sort(function (a, b) { return a.priority - b.priority; });
            return this;
        };
        Loader.prototype.reset = function () {
            this.progress = 0;
            this.loading = false;
            this._queue.reset();
            this._queue.pause();
            for (var k in this.resources) {
                var res = this.resources[k];
                if (!res)
                    continue;
                if (res._onCompleteBinding)
                    res._onCompleteBinding.detach();
                if (res.isLoading)
                    res.abort();
            }
            this.resources = {};
            return this;
        };
        Loader.prototype.load = function (cb) {
            if (typeof cb === 'function')
                this.onComplete.once(cb);
            if (this.loading)
                return this;
            if (this._queue.idle()) {
                this._onStart();
                this._onComplete();
            }
            else {
                var numTasks = this._queue.length();
                var chunk = MAX_PROGRESS / numTasks;
                for (var i = 0; i < this._queue.length(); ++i) {
                    this._queue.getTask(i).data.progressChunk = chunk;
                }
                this._onStart();
                this._queue.resume();
            }
            return this;
        };
        Object.defineProperty(Loader.prototype, "concurrency", {
            get: function () {
                return this._queue.concurrency;
            },
            set: function (concurrency) {
                this._queue.concurrency = concurrency;
            },
            enumerable: true,
            configurable: true
        });
        Loader.prototype.addUrlResolver = function (func) {
            this._urlResolvers.push(func);
            return this;
        };
        Loader.prototype._prepareUrl = function (url, baseUrl) {
            var parsed = parseUri(url, { strictMode: true });
            this._urlResolvers.forEach(function (resolver) {
                url = resolver(url, parsed);
                parsed = parseUri(url, { strictMode: true });
            });
            if (!parsed.protocol && url.indexOf('//') !== 0) {
                if (baseUrl.length && url.charAt(0) !== '/')
                    url = baseUrl + "/" + url;
                else
                    url = baseUrl + url;
            }
            if (this.defaultQueryString) {
                var match = rgxExtractUrlHash.exec(url);
                if (match) {
                    var hash = match[0];
                    url = url.substr(0, url.length - hash.length);
                    if (url.indexOf('?') !== -1)
                        url += "&" + this.defaultQueryString;
                    else
                        url += "?" + this.defaultQueryString;
                    url += hash;
                }
            }
            return url;
        };
        Loader.prototype._loadResource = function (resource, dequeue) {
            resource._dequeue = dequeue;
            resource._onCompleteBinding = resource.onComplete.once(this._onLoad, this);
            resource.load();
        };
        Loader.prototype._onStart = function () {
            this.progress = 0;
            this.loading = true;
            this.onStart.dispatch(this);
        };
        Loader.prototype._onComplete = function () {
            this.progress = MAX_PROGRESS;
            this.loading = false;
            this.onComplete.dispatch(this, this.resources);
        };
        Loader.prototype._onLoad = function (resource) {
            var _this = this;
            resource._onCompleteBinding = null;
            this._resourcesParsing.push(resource);
            resource._dequeue();
            eachSeries(this._middleware, function (middleware, next) {
                middleware.fn.call(_this, resource, next);
            }, function () {
                resource.onAfterMiddleware.dispatch(resource);
                _this.progress = Math.min(MAX_PROGRESS, _this.progress + resource.progressChunk);
                _this.onProgress.dispatch(_this, resource);
                if (resource.error)
                    _this.onError.dispatch(resource.error, _this, resource);
                else
                    _this.onLoad.dispatch(_this, resource);
                _this._resourcesParsing.splice(_this._resourcesParsing.indexOf(resource), 1);
                if (_this._queue.idle() && _this._resourcesParsing.length === 0)
                    _this._onComplete();
            }, true);
        };
        Loader.use = function (fn, priority) {
            if (priority === void 0) { priority = Loader.DefaultMiddlewarePriority; }
            Loader._defaultMiddleware.push({ fn: fn, priority: priority });
            Loader._defaultMiddleware.sort(function (a, b) { return a.priority - b.priority; });
            return Loader;
        };
        Loader.DefaultMiddlewarePriority = 50;
        Loader._defaultMiddleware = [];
        return Loader;
    })());

    /*!
     * @pixi/constants - v6.0.4
     * Compiled Tue, 11 May 2021 18:00:23 UTC
     *
     * @pixi/constants is licensed under the MIT License.
     * http://www.opensource.org/licenses/mit-license
     */
    /**
     * Different types of environments for WebGL.
     *
     * @static
     * @memberof PIXI
     * @name ENV
     * @enum {number}
     * @property {number} WEBGL_LEGACY - Used for older v1 WebGL devices. PixiJS will aim to ensure compatibility
     *  with older / less advanced devices. If you experience unexplained flickering prefer this environment.
     * @property {number} WEBGL - Version 1 of WebGL
     * @property {number} WEBGL2 - Version 2 of WebGL
     */
    var ENV;
    (function (ENV) {
        ENV[ENV["WEBGL_LEGACY"] = 0] = "WEBGL_LEGACY";
        ENV[ENV["WEBGL"] = 1] = "WEBGL";
        ENV[ENV["WEBGL2"] = 2] = "WEBGL2";
    })(ENV || (ENV = {}));
    /**
     * Constant to identify the Renderer Type.
     *
     * @static
     * @memberof PIXI
     * @name RENDERER_TYPE
     * @enum {number}
     * @property {number} UNKNOWN - Unknown render type.
     * @property {number} WEBGL - WebGL render type.
     * @property {number} CANVAS - Canvas render type.
     */
    var RENDERER_TYPE$1;
    (function (RENDERER_TYPE) {
        RENDERER_TYPE[RENDERER_TYPE["UNKNOWN"] = 0] = "UNKNOWN";
        RENDERER_TYPE[RENDERER_TYPE["WEBGL"] = 1] = "WEBGL";
        RENDERER_TYPE[RENDERER_TYPE["CANVAS"] = 2] = "CANVAS";
    })(RENDERER_TYPE$1 || (RENDERER_TYPE$1 = {}));
    /**
     * Bitwise OR of masks that indicate the buffers to be cleared.
     *
     * @static
     * @memberof PIXI
     * @name BUFFER_BITS
     * @enum {number}
     * @property {number} COLOR - Indicates the buffers currently enabled for color writing.
     * @property {number} DEPTH - Indicates the depth buffer.
     * @property {number} STENCIL - Indicates the stencil buffer.
     */
    var BUFFER_BITS;
    (function (BUFFER_BITS) {
        BUFFER_BITS[BUFFER_BITS["COLOR"] = 16384] = "COLOR";
        BUFFER_BITS[BUFFER_BITS["DEPTH"] = 256] = "DEPTH";
        BUFFER_BITS[BUFFER_BITS["STENCIL"] = 1024] = "STENCIL";
    })(BUFFER_BITS || (BUFFER_BITS = {}));
    /**
     * Various blend modes supported by PIXI.
     *
     * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
     * Anything else will silently act like NORMAL.
     *
     * @memberof PIXI
     * @name BLEND_MODES
     * @enum {number}
     * @property {number} NORMAL
     * @property {number} ADD
     * @property {number} MULTIPLY
     * @property {number} SCREEN
     * @property {number} OVERLAY
     * @property {number} DARKEN
     * @property {number} LIGHTEN
     * @property {number} COLOR_DODGE
     * @property {number} COLOR_BURN
     * @property {number} HARD_LIGHT
     * @property {number} SOFT_LIGHT
     * @property {number} DIFFERENCE
     * @property {number} EXCLUSION
     * @property {number} HUE
     * @property {number} SATURATION
     * @property {number} COLOR
     * @property {number} LUMINOSITY
     * @property {number} NORMAL_NPM
     * @property {number} ADD_NPM
     * @property {number} SCREEN_NPM
     * @property {number} NONE
     * @property {number} SRC_IN
     * @property {number} SRC_OUT
     * @property {number} SRC_ATOP
     * @property {number} DST_OVER
     * @property {number} DST_IN
     * @property {number} DST_OUT
     * @property {number} DST_ATOP
     * @property {number} SUBTRACT
     * @property {number} SRC_OVER
     * @property {number} ERASE
     * @property {number} XOR
     */
    var BLEND_MODES;
    (function (BLEND_MODES) {
        BLEND_MODES[BLEND_MODES["NORMAL"] = 0] = "NORMAL";
        BLEND_MODES[BLEND_MODES["ADD"] = 1] = "ADD";
        BLEND_MODES[BLEND_MODES["MULTIPLY"] = 2] = "MULTIPLY";
        BLEND_MODES[BLEND_MODES["SCREEN"] = 3] = "SCREEN";
        BLEND_MODES[BLEND_MODES["OVERLAY"] = 4] = "OVERLAY";
        BLEND_MODES[BLEND_MODES["DARKEN"] = 5] = "DARKEN";
        BLEND_MODES[BLEND_MODES["LIGHTEN"] = 6] = "LIGHTEN";
        BLEND_MODES[BLEND_MODES["COLOR_DODGE"] = 7] = "COLOR_DODGE";
        BLEND_MODES[BLEND_MODES["COLOR_BURN"] = 8] = "COLOR_BURN";
        BLEND_MODES[BLEND_MODES["HARD_LIGHT"] = 9] = "HARD_LIGHT";
        BLEND_MODES[BLEND_MODES["SOFT_LIGHT"] = 10] = "SOFT_LIGHT";
        BLEND_MODES[BLEND_MODES["DIFFERENCE"] = 11] = "DIFFERENCE";
        BLEND_MODES[BLEND_MODES["EXCLUSION"] = 12] = "EXCLUSION";
        BLEND_MODES[BLEND_MODES["HUE"] = 13] = "HUE";
        BLEND_MODES[BLEND_MODES["SATURATION"] = 14] = "SATURATION";
        BLEND_MODES[BLEND_MODES["COLOR"] = 15] = "COLOR";
        BLEND_MODES[BLEND_MODES["LUMINOSITY"] = 16] = "LUMINOSITY";
        BLEND_MODES[BLEND_MODES["NORMAL_NPM"] = 17] = "NORMAL_NPM";
        BLEND_MODES[BLEND_MODES["ADD_NPM"] = 18] = "ADD_NPM";
        BLEND_MODES[BLEND_MODES["SCREEN_NPM"] = 19] = "SCREEN_NPM";
        BLEND_MODES[BLEND_MODES["NONE"] = 20] = "NONE";
        BLEND_MODES[BLEND_MODES["SRC_OVER"] = 0] = "SRC_OVER";
        BLEND_MODES[BLEND_MODES["SRC_IN"] = 21] = "SRC_IN";
        BLEND_MODES[BLEND_MODES["SRC_OUT"] = 22] = "SRC_OUT";
        BLEND_MODES[BLEND_MODES["SRC_ATOP"] = 23] = "SRC_ATOP";
        BLEND_MODES[BLEND_MODES["DST_OVER"] = 24] = "DST_OVER";
        BLEND_MODES[BLEND_MODES["DST_IN"] = 25] = "DST_IN";
        BLEND_MODES[BLEND_MODES["DST_OUT"] = 26] = "DST_OUT";
        BLEND_MODES[BLEND_MODES["DST_ATOP"] = 27] = "DST_ATOP";
        BLEND_MODES[BLEND_MODES["ERASE"] = 26] = "ERASE";
        BLEND_MODES[BLEND_MODES["SUBTRACT"] = 28] = "SUBTRACT";
        BLEND_MODES[BLEND_MODES["XOR"] = 29] = "XOR";
    })(BLEND_MODES || (BLEND_MODES = {}));
    /**
     * Various webgl draw modes. These can be used to specify which GL drawMode to use
     * under certain situations and renderers.
     *
     * @memberof PIXI
     * @static
     * @name DRAW_MODES
     * @enum {number}
     * @property {number} POINTS
     * @property {number} LINES
     * @property {number} LINE_LOOP
     * @property {number} LINE_STRIP
     * @property {number} TRIANGLES
     * @property {number} TRIANGLE_STRIP
     * @property {number} TRIANGLE_FAN
     */
    var DRAW_MODES;
    (function (DRAW_MODES) {
        DRAW_MODES[DRAW_MODES["POINTS"] = 0] = "POINTS";
        DRAW_MODES[DRAW_MODES["LINES"] = 1] = "LINES";
        DRAW_MODES[DRAW_MODES["LINE_LOOP"] = 2] = "LINE_LOOP";
        DRAW_MODES[DRAW_MODES["LINE_STRIP"] = 3] = "LINE_STRIP";
        DRAW_MODES[DRAW_MODES["TRIANGLES"] = 4] = "TRIANGLES";
        DRAW_MODES[DRAW_MODES["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
        DRAW_MODES[DRAW_MODES["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
    })(DRAW_MODES || (DRAW_MODES = {}));
    /**
     * Various GL texture/resources formats.
     *
     * @memberof PIXI
     * @static
     * @name FORMATS
     * @enum {number}
     * @property {number} RGBA=6408
     * @property {number} RGB=6407
     * @property {number} RED=6403
     * @property {number} ALPHA=6406
     * @property {number} LUMINANCE=6409
     * @property {number} LUMINANCE_ALPHA=6410
     * @property {number} DEPTH_COMPONENT=6402
     * @property {number} DEPTH_STENCIL=34041
     */
    var FORMATS;
    (function (FORMATS) {
        FORMATS[FORMATS["RGBA"] = 6408] = "RGBA";
        FORMATS[FORMATS["RGB"] = 6407] = "RGB";
        FORMATS[FORMATS["ALPHA"] = 6406] = "ALPHA";
        FORMATS[FORMATS["LUMINANCE"] = 6409] = "LUMINANCE";
        FORMATS[FORMATS["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
        FORMATS[FORMATS["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
        FORMATS[FORMATS["DEPTH_STENCIL"] = 34041] = "DEPTH_STENCIL";
    })(FORMATS || (FORMATS = {}));
    /**
     * Various GL target types.
     *
     * @memberof PIXI
     * @static
     * @name TARGETS
     * @enum {number}
     * @property {number} TEXTURE_2D=3553
     * @property {number} TEXTURE_CUBE_MAP=34067
     * @property {number} TEXTURE_2D_ARRAY=35866
     * @property {number} TEXTURE_CUBE_MAP_POSITIVE_X=34069
     * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_X=34070
     * @property {number} TEXTURE_CUBE_MAP_POSITIVE_Y=34071
     * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_Y=34072
     * @property {number} TEXTURE_CUBE_MAP_POSITIVE_Z=34073
     * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_Z=34074
     */
    var TARGETS;
    (function (TARGETS) {
        TARGETS[TARGETS["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP"] = 34067] = "TEXTURE_CUBE_MAP";
        TARGETS[TARGETS["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_X"] = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_X"] = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Y"] = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Y"] = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Z"] = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Z"] = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z";
    })(TARGETS || (TARGETS = {}));
    /**
     * Various GL data format types.
     *
     * @memberof PIXI
     * @static
     * @name TYPES
     * @enum {number}
     * @property {number} UNSIGNED_BYTE=5121
     * @property {number} UNSIGNED_SHORT=5123
     * @property {number} UNSIGNED_SHORT_5_6_5=33635
     * @property {number} UNSIGNED_SHORT_4_4_4_4=32819
     * @property {number} UNSIGNED_SHORT_5_5_5_1=32820
     * @property {number} FLOAT=5126
     * @property {number} HALF_FLOAT=36193
     */
    var TYPES;
    (function (TYPES) {
        TYPES[TYPES["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
        TYPES[TYPES["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
        TYPES[TYPES["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
        TYPES[TYPES["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
        TYPES[TYPES["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
        TYPES[TYPES["FLOAT"] = 5126] = "FLOAT";
        TYPES[TYPES["HALF_FLOAT"] = 36193] = "HALF_FLOAT";
    })(TYPES || (TYPES = {}));
    /**
     * Various sampler types. Correspond to `sampler`, `isampler`, `usampler` GLSL types respectively.
     * WebGL1 works only with FLOAT.
     *
     * @memberof PIXI
     * @static
     * @name SAMPLER_TYPES
     * @enum {number}
     * @property {number} FLOAT=0
     * @property {number} INT=1
     * @property {number} UINT=2
     */
    var SAMPLER_TYPES;
    (function (SAMPLER_TYPES) {
        SAMPLER_TYPES[SAMPLER_TYPES["FLOAT"] = 0] = "FLOAT";
        SAMPLER_TYPES[SAMPLER_TYPES["INT"] = 1] = "INT";
        SAMPLER_TYPES[SAMPLER_TYPES["UINT"] = 2] = "UINT";
    })(SAMPLER_TYPES || (SAMPLER_TYPES = {}));
    /**
     * The scale modes that are supported by pixi.
     *
     * The {@link PIXI.settings.SCALE_MODE} scale mode affects the default scaling mode of future operations.
     * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
     *
     * @memberof PIXI
     * @static
     * @name SCALE_MODES
     * @enum {number}
     * @property {number} LINEAR Smooth scaling
     * @property {number} NEAREST Pixelating scaling
     */
    var SCALE_MODES;
    (function (SCALE_MODES) {
        SCALE_MODES[SCALE_MODES["NEAREST"] = 0] = "NEAREST";
        SCALE_MODES[SCALE_MODES["LINEAR"] = 1] = "LINEAR";
    })(SCALE_MODES || (SCALE_MODES = {}));
    /**
     * The wrap modes that are supported by pixi.
     *
     * The {@link PIXI.settings.WRAP_MODE} wrap mode affects the default wrapping mode of future operations.
     * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
     * If the texture is non power of two then clamp will be used regardless as WebGL can
     * only use REPEAT if the texture is po2.
     *
     * This property only affects WebGL.
     *
     * @name WRAP_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} CLAMP - The textures uvs are clamped
     * @property {number} REPEAT - The texture uvs tile and repeat
     * @property {number} MIRRORED_REPEAT - The texture uvs tile and repeat with mirroring
     */
    var WRAP_MODES;
    (function (WRAP_MODES) {
        WRAP_MODES[WRAP_MODES["CLAMP"] = 33071] = "CLAMP";
        WRAP_MODES[WRAP_MODES["REPEAT"] = 10497] = "REPEAT";
        WRAP_MODES[WRAP_MODES["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
    })(WRAP_MODES || (WRAP_MODES = {}));
    /**
     * Mipmap filtering modes that are supported by pixi.
     *
     * The {@link PIXI.settings.MIPMAP_TEXTURES} affects default texture filtering.
     * Mipmaps are generated for a baseTexture if its `mipmap` field is `ON`,
     * or its `POW2` and texture dimensions are powers of 2.
     * Due to platform restriction, `ON` option will work like `POW2` for webgl-1.
     *
     * This property only affects WebGL.
     *
     * @name MIPMAP_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} OFF - No mipmaps
     * @property {number} POW2 - Generate mipmaps if texture dimensions are pow2
     * @property {number} ON - Always generate mipmaps
     * @property {number} ON_MANUAL - Use mipmaps, but do not auto-generate them; this is used with a resource
     *   that supports buffering each level-of-detail.
     */
    var MIPMAP_MODES;
    (function (MIPMAP_MODES) {
        MIPMAP_MODES[MIPMAP_MODES["OFF"] = 0] = "OFF";
        MIPMAP_MODES[MIPMAP_MODES["POW2"] = 1] = "POW2";
        MIPMAP_MODES[MIPMAP_MODES["ON"] = 2] = "ON";
        MIPMAP_MODES[MIPMAP_MODES["ON_MANUAL"] = 3] = "ON_MANUAL";
    })(MIPMAP_MODES || (MIPMAP_MODES = {}));
    /**
     * How to treat textures with premultiplied alpha
     *
     * @name ALPHA_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} NO_PREMULTIPLIED_ALPHA - Source is not premultiplied, leave it like that.
     *  Option for compressed and data textures that are created from typed arrays.
     * @property {number} PREMULTIPLY_ON_UPLOAD - Source is not premultiplied, premultiply on upload.
     *  Default option, used for all loaded images.
     * @property {number} PREMULTIPLIED_ALPHA - Source is already premultiplied
     *  Example: spine atlases with `_pma` suffix.
     * @property {number} NPM - Alias for NO_PREMULTIPLIED_ALPHA.
     * @property {number} UNPACK - Default option, alias for PREMULTIPLY_ON_UPLOAD.
     * @property {number} PMA - Alias for PREMULTIPLIED_ALPHA.
     */
    var ALPHA_MODES;
    (function (ALPHA_MODES) {
        ALPHA_MODES[ALPHA_MODES["NPM"] = 0] = "NPM";
        ALPHA_MODES[ALPHA_MODES["UNPACK"] = 1] = "UNPACK";
        ALPHA_MODES[ALPHA_MODES["PMA"] = 2] = "PMA";
        ALPHA_MODES[ALPHA_MODES["NO_PREMULTIPLIED_ALPHA"] = 0] = "NO_PREMULTIPLIED_ALPHA";
        ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ON_UPLOAD"] = 1] = "PREMULTIPLY_ON_UPLOAD";
        ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ALPHA"] = 2] = "PREMULTIPLY_ALPHA";
    })(ALPHA_MODES || (ALPHA_MODES = {}));
    /**
     * Configure whether filter textures are cleared after binding.
     *
     * Filter textures need not be cleared if the filter does not use pixel blending. {@link CLEAR_MODES.BLIT} will detect
     * this and skip clearing as an optimization.
     *
     * @name CLEAR_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} BLEND - Do not clear the filter texture. The filter's output will blend on top of the output texture.
     * @property {number} CLEAR - Always clear the filter texture.
     * @property {number} BLIT - Clear only if {@link FilterSystem.forceClear} is set or if the filter uses pixel blending.
     * @property {number} NO - Alias for BLEND, same as `false` in earlier versions
     * @property {number} YES - Alias for CLEAR, same as `true` in earlier versions
     * @property {number} AUTO - Alias for BLIT
     */
    var CLEAR_MODES;
    (function (CLEAR_MODES) {
        CLEAR_MODES[CLEAR_MODES["NO"] = 0] = "NO";
        CLEAR_MODES[CLEAR_MODES["YES"] = 1] = "YES";
        CLEAR_MODES[CLEAR_MODES["AUTO"] = 2] = "AUTO";
        CLEAR_MODES[CLEAR_MODES["BLEND"] = 0] = "BLEND";
        CLEAR_MODES[CLEAR_MODES["CLEAR"] = 1] = "CLEAR";
        CLEAR_MODES[CLEAR_MODES["BLIT"] = 2] = "BLIT";
    })(CLEAR_MODES || (CLEAR_MODES = {}));
    /**
     * The gc modes that are supported by pixi.
     *
     * The {@link PIXI.settings.GC_MODE} Garbage Collection mode for PixiJS textures is AUTO
     * If set to GC_MODE, the renderer will occasionally check textures usage. If they are not
     * used for a specified period of time they will be removed from the GPU. They will of course
     * be uploaded again when they are required. This is a silent behind the scenes process that
     * should ensure that the GPU does not  get filled up.
     *
     * Handy for mobile devices!
     * This property only affects WebGL.
     *
     * @name GC_MODES
     * @enum {number}
     * @static
     * @memberof PIXI
     * @property {number} AUTO - Garbage collection will happen periodically automatically
     * @property {number} MANUAL - Garbage collection will need to be called manually
     */
    var GC_MODES;
    (function (GC_MODES) {
        GC_MODES[GC_MODES["AUTO"] = 0] = "AUTO";
        GC_MODES[GC_MODES["MANUAL"] = 1] = "MANUAL";
    })(GC_MODES || (GC_MODES = {}));
    /**
     * Constants that specify float precision in shaders.
     *
     * @name PRECISION
     * @memberof PIXI
     * @constant
     * @static
     * @enum {string}
     * @property {string} LOW='lowp'
     * @property {string} MEDIUM='mediump'
     * @property {string} HIGH='highp'
     */
    var PRECISION;
    (function (PRECISION) {
        PRECISION["LOW"] = "lowp";
        PRECISION["MEDIUM"] = "mediump";
        PRECISION["HIGH"] = "highp";
    })(PRECISION || (PRECISION = {}));
    /**
     * Constants for mask implementations.
     * We use `type` suffix because it leads to very different behaviours
     *
     * @name MASK_TYPES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} NONE - Mask is ignored
     * @property {number} SCISSOR - Scissor mask, rectangle on screen, cheap
     * @property {number} STENCIL - Stencil mask, 1-bit, medium, works only if renderer supports stencil
     * @property {number} SPRITE - Mask that uses SpriteMaskFilter, uses temporary RenderTexture
     */
    var MASK_TYPES;
    (function (MASK_TYPES) {
        MASK_TYPES[MASK_TYPES["NONE"] = 0] = "NONE";
        MASK_TYPES[MASK_TYPES["SCISSOR"] = 1] = "SCISSOR";
        MASK_TYPES[MASK_TYPES["STENCIL"] = 2] = "STENCIL";
        MASK_TYPES[MASK_TYPES["SPRITE"] = 3] = "SPRITE";
    })(MASK_TYPES || (MASK_TYPES = {}));
    /**
     * Constants for multi-sampling antialiasing.
     *
     * @see PIXI.Framebuffer#multisample
     *
     * @name MSAA_QUALITY
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} NONE - No multisampling for this renderTexture
     * @property {number} LOW - Try 2 samples
     * @property {number} MEDIUM - Try 4 samples
     * @property {number} HIGH - Try 8 samples
     */
    var MSAA_QUALITY;
    (function (MSAA_QUALITY) {
        MSAA_QUALITY[MSAA_QUALITY["NONE"] = 0] = "NONE";
        MSAA_QUALITY[MSAA_QUALITY["LOW"] = 2] = "LOW";
        MSAA_QUALITY[MSAA_QUALITY["MEDIUM"] = 4] = "MEDIUM";
        MSAA_QUALITY[MSAA_QUALITY["HIGH"] = 8] = "HIGH";
    })(MSAA_QUALITY || (MSAA_QUALITY = {}));

    var INTERNAL_FORMATS;
    (function (INTERNAL_FORMATS) {
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGB_S3TC_DXT1_EXT"] = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_S3TC_DXT1_EXT"] = 33777] = "COMPRESSED_RGBA_S3TC_DXT1_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_S3TC_DXT3_EXT"] = 33778] = "COMPRESSED_RGBA_S3TC_DXT3_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_S3TC_DXT5_EXT"] = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT"] = 35917] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT"] = 35918] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT"] = 35919] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB_S3TC_DXT1_EXT"] = 35916] = "COMPRESSED_SRGB_S3TC_DXT1_EXT";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_R11_EAC"] = 37488] = "COMPRESSED_R11_EAC";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SIGNED_R11_EAC"] = 37489] = "COMPRESSED_SIGNED_R11_EAC";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RG11_EAC"] = 37490] = "COMPRESSED_RG11_EAC";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SIGNED_RG11_EAC"] = 37491] = "COMPRESSED_SIGNED_RG11_EAC";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGB8_ETC2"] = 37492] = "COMPRESSED_RGB8_ETC2";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA8_ETC2_EAC"] = 37496] = "COMPRESSED_RGBA8_ETC2_EAC";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ETC2"] = 37493] = "COMPRESSED_SRGB8_ETC2";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ETC2_EAC"] = 37497] = "COMPRESSED_SRGB8_ALPHA8_ETC2_EAC";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37494] = "COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37495] = "COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGB_PVRTC_4BPPV1_IMG"] = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_PVRTC_4BPPV1_IMG"] = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGB_PVRTC_2BPPV1_IMG"] = 35841] = "COMPRESSED_RGB_PVRTC_2BPPV1_IMG";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_PVRTC_2BPPV1_IMG"] = 35843] = "COMPRESSED_RGBA_PVRTC_2BPPV1_IMG";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGB_ETC1_WEBGL"] = 36196] = "COMPRESSED_RGB_ETC1_WEBGL";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGB_ATC_WEBGL"] = 35986] = "COMPRESSED_RGB_ATC_WEBGL";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL"] = 35986] = "COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL"] = 34798] = "COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_10x10_KHR"] = 37819] = "COMPRESSED_RGBA_ASTC_10x10_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_10x5_KHR"] = 37816] = "COMPRESSED_RGBA_ASTC_10x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_10x6_KHR"] = 37817] = "COMPRESSED_RGBA_ASTC_10x6_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_10x8_KHR"] = 37818] = "COMPRESSED_RGBA_ASTC_10x8_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_12x10_KHR"] = 37820] = "COMPRESSED_RGBA_ASTC_12x10_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_12x12_KHR"] = 37821] = "COMPRESSED_RGBA_ASTC_12x12_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_4x4_KHR"] = 37808] = "COMPRESSED_RGBA_ASTC_4x4_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_5x4_KHR"] = 37809] = "COMPRESSED_RGBA_ASTC_5x4_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_5x5_KHR"] = 37810] = "COMPRESSED_RGBA_ASTC_5x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_6x5_KHR"] = 37811] = "COMPRESSED_RGBA_ASTC_6x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_6x6_KHR"] = 37812] = "COMPRESSED_RGBA_ASTC_6x6_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_8x5_KHR"] = 37813] = "COMPRESSED_RGBA_ASTC_8x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_8x6_KHR"] = 37814] = "COMPRESSED_RGBA_ASTC_8x6_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_RGBA_ASTC_8x8_KHR"] = 37815] = "COMPRESSED_RGBA_ASTC_8x8_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR"] = 3781] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR"] = 37847] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR"] = 37849] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR"] = 37850] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR"] = 37852] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR"] = 37853] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR"] = 37840] = "COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR"] = 37841] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR"] = 37842] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR"] = 37843] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR"] = 37844] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR"] = 37845] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR"] = 37846] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR";
        INTERNAL_FORMATS[INTERNAL_FORMATS["COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR"] = 37847] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR";
    })(INTERNAL_FORMATS || (INTERNAL_FORMATS = {}));
    const INTERNAL_FORMAT_TO_BYTES_PER_PIXEL = {
        [INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT]: 1,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT]: 1,
        [INTERNAL_FORMATS.COMPRESSED_SRGB_S3TC_DXT1_EXT]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT]: 1,
        [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT]: 1,
        [INTERNAL_FORMATS.COMPRESSED_R11_EAC]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_SIGNED_R11_EAC]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RG11_EAC]: 1,
        [INTERNAL_FORMATS.COMPRESSED_SIGNED_RG11_EAC]: 1,
        [INTERNAL_FORMATS.COMPRESSED_RGB8_ETC2]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGBA8_ETC2_EAC]: 1,
        [INTERNAL_FORMATS.COMPRESSED_SRGB8_ETC2]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC]: 1,
        [INTERNAL_FORMATS.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG]: 0.25,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG]: 0.25,
        [INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGB_ATC_WEBGL]: 0.5,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL]: 1,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL]: 1,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR]: 1,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_5x5_KHR]: 5.12 * 0.125,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_6x6_KHR]: 3.56 * 0.125,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_8x8_KHR]: 2 * 0.125,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x10_KHR]: 1.28 * 0.125,
        [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_12x12_KHR]: 0.89 * 0.125,
    };

    class CompressedTextureResource {
        upload(gl) {
            const { levels } = this;
            for (var i = 0; i < this.levels; ++i) {
                let { levelWidth, levelHeight, levelBuffer } = this.levelBuffers[i];
                gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, levelWidth, levelHeight, 0, levelBuffer);
            }
            if (levels > 1) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        }
    }

    const FILE_HEADER_SIZE = 64;
    const TYPES_TO_BYTES_PER_COMPONENT = {
        [TYPES.UNSIGNED_BYTE]: 1,
        [TYPES.UNSIGNED_SHORT]: 2,
        [TYPES.FLOAT]: 4,
        [TYPES.HALF_FLOAT]: 8
    };
    const FORMATS_TO_COMPONENTS = {
        [FORMATS.RGBA]: 4,
        [FORMATS.RGB]: 3,
        [FORMATS.LUMINANCE]: 1,
        [FORMATS.LUMINANCE_ALPHA]: 2,
        [FORMATS.ALPHA]: 1
    };
    const TYPES_TO_BYTES_PER_PIXEL = {
        [TYPES.UNSIGNED_SHORT_4_4_4_4]: 2,
        [TYPES.UNSIGNED_SHORT_5_5_5_1]: 2,
        [TYPES.UNSIGNED_SHORT_5_6_5]: 2
    };
    const KTX_FIELDS = {
        FILE_IDENTIFIER: 0,
        ENDIANNESS: 12,
        GL_TYPE: 16,
        GL_TYPE_SIZE: 20,
        GL_FORMAT: 24,
        GL_INTERNAL_FORMAT: 28,
        GL_BASE_INTERNAL_FORMAT: 32,
        PIXEL_WIDTH: 36,
        PIXEL_HEIGHT: 40,
        PIXEL_DEPTH: 44,
        NUMBER_OF_ARRAY_ELEMENTS: 48,
        NUMBER_OF_FACES: 52,
        NUMBER_OF_MIPMAP_LEVELS: 56,
        BYTES_OF_KEY_VALUE_DATA: 60
    };
    const FILE_IDENTIFIER = [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A];
    const ENDIANNESS = 0x04030201;
    class KTXTextureResource extends CompressedTextureResource {
        constructor(source, src) {
            super();
            this.src = src;
            this.complete = true;
            const dataView = new DataView(source);
            if (!validateKTX(dataView)) {
                throw new Error('Not a valid KTX Texture');
            }
            const littleEndian = dataView.getUint32(KTX_FIELDS.ENDIANNESS, true) === ENDIANNESS;
            const glType = dataView.getUint32(KTX_FIELDS.GL_TYPE, littleEndian);
            const glFormat = dataView.getUint32(KTX_FIELDS.GL_FORMAT, littleEndian);
            const glInternalFormat = this.internalFormat = dataView.getUint32(KTX_FIELDS.GL_INTERNAL_FORMAT, littleEndian);
            const pixelWidth = this.width = dataView.getUint32(KTX_FIELDS.PIXEL_WIDTH, littleEndian);
            const pixelHeight = this.height = dataView.getUint32(KTX_FIELDS.PIXEL_HEIGHT, littleEndian) || 1;
            const pixelDepth = dataView.getUint32(KTX_FIELDS.PIXEL_DEPTH, littleEndian) || 1;
            const numberOfArrayElements = dataView.getUint32(KTX_FIELDS.NUMBER_OF_ARRAY_ELEMENTS, littleEndian) || 1;
            const numberOfFaces = dataView.getUint32(KTX_FIELDS.NUMBER_OF_FACES, littleEndian);
            const numberOfMipmapLevels = this.levels = dataView.getUint32(KTX_FIELDS.NUMBER_OF_MIPMAP_LEVELS, littleEndian);
            const bytesOfKeyValueData = dataView.getUint32(KTX_FIELDS.BYTES_OF_KEY_VALUE_DATA, littleEndian);
            if (pixelHeight === 0 || pixelDepth !== 1) {
                throw new Error('Only 2D textures are supported');
            }
            if (numberOfFaces !== 1) {
                throw new Error('CubeTextures are not supported by KTXLoader yet!');
            }
            if (numberOfArrayElements !== 1) {
                throw new Error('WebGL does not support array textures');
            }
            const blockWidth = 4;
            const blockHeight = 4;
            const alignedWidth = (pixelWidth + 3) & ~3;
            const alignedHeight = (pixelHeight + 3) & ~3;
            const imageBuffers = new Array(numberOfArrayElements);
            let imagePixels = pixelWidth * pixelHeight;
            if (glType === 0) {
                imagePixels = alignedWidth * alignedHeight;
            }
            let imagePixelByteSize;
            if (glType !== 0) {
                if (TYPES_TO_BYTES_PER_COMPONENT[glType]) {
                    imagePixelByteSize = TYPES_TO_BYTES_PER_COMPONENT[glType] * FORMATS_TO_COMPONENTS[glFormat];
                }
                else {
                    imagePixelByteSize = TYPES_TO_BYTES_PER_PIXEL[glType];
                }
            }
            else {
                imagePixelByteSize = INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[glInternalFormat];
            }
            if (imagePixelByteSize === undefined) {
                throw new Error('Unable to resolve the pixel format stored in the *.ktx file!');
            }
            const imageByteSize = imagePixels * imagePixelByteSize;
            let mipByteSize = imageByteSize;
            let mipWidth = pixelWidth;
            let mipHeight = pixelHeight;
            let alignedMipWidth = alignedWidth;
            let alignedMipHeight = alignedHeight;
            let imageOffset = FILE_HEADER_SIZE + bytesOfKeyValueData;
            for (let mipmapLevel = 0; mipmapLevel < numberOfMipmapLevels; mipmapLevel++) {
                const imageSize = dataView.getUint32(imageOffset, littleEndian);
                let elementOffset = imageOffset + 4;
                for (let arrayElement = 0; arrayElement < numberOfArrayElements; arrayElement++) {
                    let mips = imageBuffers[arrayElement];
                    if (!mips) {
                        mips = imageBuffers[arrayElement] = new Array(numberOfMipmapLevels);
                    }
                    mips[mipmapLevel] = {
                        levelID: mipmapLevel,
                        levelWidth: numberOfMipmapLevels > 1 ? mipWidth : alignedMipWidth,
                        levelHeight: numberOfMipmapLevels > 1 ? mipHeight : alignedMipHeight,
                        levelBuffer: new Uint8Array(source, elementOffset, mipByteSize)
                    };
                    elementOffset += mipByteSize;
                }
                imageOffset += imageSize + 4;
                imageOffset = imageOffset % 4 !== 0 ? imageOffset + 4 - (imageOffset % 4) : imageOffset;
                mipWidth = (mipWidth >> 1) || 1;
                mipHeight = (mipHeight >> 1) || 1;
                alignedMipWidth = (mipWidth + blockWidth - 1) & ~(blockWidth - 1);
                alignedMipHeight = (mipHeight + blockHeight - 1) & ~(blockHeight - 1);
                mipByteSize = alignedMipWidth * alignedMipHeight * imagePixelByteSize;
            }
            if (glType !== 0) {
                throw new Error('TODO: Uncompressed');
            }
            this.levelBuffers = imageBuffers[0];
        }
    }
    function validateKTX(dataView) {
        for (let i = 0; i < FILE_IDENTIFIER.length; i++) {
            if (dataView.getUint8(i) !== FILE_IDENTIFIER[i]) {
                return false;
            }
        }
        return true;
    }

    class KTXLoadStrategy extends XhrLoadStrategy {
        _complete(type, data) {
            super._complete(type, new KTXTextureResource(data, this.config.url));
        }
    }

    function addPreProcessResourceHandler(resource) {
        resource.addPreProcessResourceHandler(function normalizeResource(resource) {
            var _a, _b;
            const textures = (_b = (_a = resource.src) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b.texture;
            if (!textures)
                return;
            const { extensions, textureFormats, formats } = getAbilities();
            let target = textures.find(texture => extensions[texture.type] &&
                (formats.includes(texture.internalFormat) || textureFormats[texture.internalFormat]));
            if (target) {
                resource.src.image.url = target.url;
                resource.src.image.type = target.type;
            }
        });
    }
    function addKTXStragetyAndRegister() {
        Object.assign(eva_js.STRATEGY, {
            astc: KTXLoadStrategy,
            etc: KTXLoadStrategy,
            pvrtc: KTXLoadStrategy,
            s3tc: KTXLoadStrategy,
            atc: KTXLoadStrategy,
        });
        KTXLoadStrategy.setExtensionXhrType('ktx', XhrResponseType.Buffer);
    }

    const GLTexture = pixi_js.glCore.GLTexture;
    const GLTextureMixin = {
        uploadNotCompressed: GLTexture.prototype.upload,
        isCompressed: false,
        upload: function (source) {
            if (!(source instanceof CompressedTextureResource)) {
                return this.uploadNotCompressed(source);
            }
            this.bind();
            var gl = this.gl;
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
            this.isCompressed = true;
            source.upload(gl);
        },
        enableMipmap: function () {
            if (this.isCompressed) {
                return;
            }
            var gl = this.gl;
            this.bind();
            this.mipmap = true;
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    };

    const oldFrom$1 = Symbol();
    const TextureMixin = {
        [oldFrom$1]: pixi_js.Texture.from,
        from(source) {
            if (!(source instanceof CompressedTextureResource)) {
                return this[oldFrom$1](source);
            }
            return new pixi_js.Texture(pixi_js.BaseTexture.from(source));
        }
    };

    const oldFrom = Symbol();
    const BaseTextureMixin = {
        [oldFrom]: pixi_js.BaseTexture.from,
        from(source, scaleMode, sourceScale) {
            if (!(source instanceof CompressedTextureResource)) {
                return this[oldFrom](source, scaleMode, sourceScale);
            }
            const imageUrl = source.src;
            let baseTexture = pixi_js.utils.BaseTextureCache[imageUrl];
            if (!baseTexture) {
                baseTexture = new pixi_js.BaseTexture(source, scaleMode);
                baseTexture.imageUrl = imageUrl;
                if (sourceScale) {
                    baseTexture.sourceScale = sourceScale;
                }
                pixi_js.BaseTexture.addToCache(baseTexture, imageUrl);
            }
            return baseTexture;
        }
    };

    addPreProcessResourceHandler(eva_js.resource);
    addKTXStragetyAndRegister();
    Object.assign(pixi_js.glCore.GLTexture.prototype, GLTextureMixin);
    Object.assign(pixi_js.Texture, TextureMixin);
    Object.assign(pixi_js.BaseTexture, BaseTextureMixin);
    function activeCompressedTextureAbilityOnRenderer(application) {
        try {
            const gl = application.renderer.gl;
            gl.getExtension('WEBGL_compressed_texture_s3tc');
            gl.getExtension('WEBGL_compressed_texture_s3tc_srgb');
            gl.getExtension('WEBGL_compressed_texture_etc');
            gl.getExtension('WEBGL_compressed_texture_etc1');
            gl.getExtension('WEBGL_compressed_texture_pvrtc');
            gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
            gl.getExtension('WEBGL_compressed_texture_atc');
            gl.getExtension('WEBGL_compressed_texture_astc');
        }
        catch (e) {
            console.error('Compressed texture ability failure ! The message is :', e.message);
        }
    }

    var RENDERER_TYPE;
    (function (RENDERER_TYPE) {
        RENDERER_TYPE[RENDERER_TYPE["UNKNOWN"] = 0] = "UNKNOWN";
        RENDERER_TYPE[RENDERER_TYPE["WEBGL"] = 1] = "WEBGL";
        RENDERER_TYPE[RENDERER_TYPE["CANVAS"] = 2] = "CANVAS";
    })(RENDERER_TYPE || (RENDERER_TYPE = {}));
    const disableScroll = renderer => {
        renderer.plugins.interaction.autoPreventDefault = true;
        renderer.view.style.touchAction = 'none';
    };
    const enableScroll = renderer => {
        renderer.plugins.interaction.autoPreventDefault = false;
        renderer.view.style.touchAction = 'auto';
    };
    let Renderer = class Renderer extends eva_js.System {
        constructor() {
            super(...arguments);
            this.multiApps = [];
        }
        init(params) {
            this.params = params;
            this.application = this.createApplication(params);
            this.containerManager = new ContainerManager();
            this.rendererManager = new RendererManager({
                game: this.game,
                rendererSystem: this,
            });
            this.game.canvas = this.application.view;
            this.transform = new Transform$1({
                system: this,
                containerManager: this.containerManager,
            });
            this.game.on('sceneChanged', ({ scene, mode, params }) => {
                let application;
                switch (mode) {
                    case eva_js.LOAD_SCENE_MODE.SINGLE:
                        application = this.application;
                        break;
                    case eva_js.LOAD_SCENE_MODE.MULTI_CANVAS:
                        application = this.createMultiApplication({ params });
                        break;
                }
                scene.canvas = application.view;
                this.transform.emit('changeScene', {
                    scene,
                    mode,
                    application,
                });
            });
            if (params.useCompressedTexture !== false) {
                activeCompressedTextureAbilityOnRenderer(this.application);
            }
        }
        registerObserver(observerInfo) {
            const thisObserverInfo = this.constructor.observerInfo;
            for (const key in observerInfo) {
                if (!thisObserverInfo[key]) {
                    thisObserverInfo[key] = [];
                }
                thisObserverInfo[key].push(...observerInfo[key]);
            }
        }
        createMultiApplication({ params }) {
            const app = this.createApplication(params);
            this.multiApps.push(app);
            return app;
        }
        createApplication(params) {
            params.view = params.canvas;
            if (params.renderType === RENDERER_TYPE.CANVAS) {
                params.forceCanvas = true;
            }
            pixi_js.ticker.shared.autoStart = false;
            pixi_js.ticker.shared.stop();
            const app = new Application(Object.assign({ sharedTicker: true }, params));
            if (params.preventScroll !== undefined) {
                console.warn('PreventScroll property will deprecate at next major version, please use enableEnable instead. https://eva.js.org/#/tutorials/game');
                params.preventScroll ? enableScroll(app.renderer) : disableScroll(app.renderer);
            }
            if (params.enableScroll !== undefined) {
                params.enableScroll ? enableScroll(app.renderer) : disableScroll(app.renderer);
            }
            if (params.preventScroll === undefined && params.enableScroll === undefined) {
                enableScroll(app.renderer);
            }
            return app;
        }
        update() {
            const changes = this.componentObserver.clear();
            for (const changed of changes) {
                this.transform.componentChanged(changed);
            }
            for (const gameObject of this.game.gameObjects) {
                this.containerManager.updateTransform({
                    name: gameObject.id,
                    transform: gameObject.transform,
                });
                this.rendererManager.update(gameObject);
            }
        }
        lateUpdate(e) {
            this.transform.update();
            this.application.ticker.update(e.time);
        }
        onDestroy() {
            this.application.destroy();
            for (const app of this.multiApps) {
                app && app.destroy();
            }
            this.transform.destroy();
            this.transform = null;
            this.params = null;
            this.rendererManager = null;
            this.containerManager = null;
            this.application = null;
            this.game = null;
            this.multiApps = null;
        }
        resize(width, height) {
            this.params.width = width;
            this.params.height = height;
            this.application.renderer.resize(width, height);
        }
    };
    Renderer.systemName = 'Renderer';
    Renderer = __decorate([
        eva_js.decorators.componentObserver({
            Transform: ['_parent'],
        })
    ], Renderer);
    var RendererSystem = Renderer;

    const notAttr = [
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
    const getEventFunc = function (event, gameObject, e) {
        ['touchstart', 'touchend', 'tap'].forEach(name => {
            event.emit(name, {
                stopPropagation: () => e.stopPropagation(),
                data: {
                    position: this.eventPosition,
                },
                gameObject,
            });
        });
    };
    let A11ySystem = class A11ySystem extends eva_js.System {
        constructor(opt) {
            super(opt);
            this.cache = new Map();
            this.eventCache = new Map();
        }
        get ratioX() {
            if (this._ratioX) {
                return this._ratioX;
            }
            else {
                const success = this.setRatio();
                if (success) {
                    return this._ratioX;
                }
                else {
                    return 0;
                }
            }
        }
        get ratioY() {
            if (this._ratioY) {
                return this._ratioY;
            }
            else {
                const success = this.setRatio();
                if (success) {
                    return this._ratioY;
                }
                else {
                    return 0;
                }
            }
        }
        init(opt = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                const { activate = exports.A11yActivate.CHECK, delay = 100, checkA11yOpen = () => Promise.resolve(false), } = opt;
                this.delay = delay;
                switch (activate) {
                    case exports.A11yActivate.CHECK:
                        try {
                            this.activate = yield checkA11yOpen();
                        }
                        catch (error) {
                            this.activate = false;
                        }
                        break;
                    case exports.A11yActivate.DISABLE:
                        this.activate = false;
                        break;
                    case exports.A11yActivate.ENABLE:
                        this.activate = true;
                        break;
                }
                this.debug = opt.debug || false;
                if (this.debug) {
                    this.activate = true;
                }
                if (!this.activate)
                    return;
                const div = document.createElement('div');
                this.div = div;
                if (this.game.canvas.parentNode) {
                    this.game.canvas.parentNode.appendChild(this.div);
                }
            });
        }
        setRatio() {
            const { width, height } = this.getCanvasBoundingClientRect();
            const { renderWidth, renderHeight } = this.getRenderRect();
            this._ratioX = width / renderWidth;
            this._ratioY = height / renderHeight;
            if (width || height) {
                this.initDiv();
                return true;
            }
            else {
                return false;
            }
        }
        getRenderRect() {
            const { params } = this.game.getSystem(RendererSystem) || { width: 300, height: 300 };
            const { height: renderHeight, width: renderWidth } = params;
            return { renderWidth, renderHeight };
        }
        getCanvasBoundingClientRect() {
            const { width, height, left, top } = this.game.canvas.getBoundingClientRect();
            return { width, height, left, top };
        }
        initDiv() {
            const { pageXOffset, pageYOffset } = window;
            const { width, height, left, top } = this.getCanvasBoundingClientRect();
            const style = {
                width,
                height,
                left: `${left + pageXOffset}px`,
                top: `${top + pageYOffset}px`,
                position: POSITION,
                zIndex: ZINDEX,
                pointerEvents: PointerEvents.NONE,
                background: MaskBackground.NONE,
            };
            setStyle(this.div, style);
            this.div.addEventListener('click', e => {
                const currentTarget = e.currentTarget;
                const { left, top } = currentTarget.getBoundingClientRect();
                const x = (e.pageX - left) / this.ratioX;
                const y = (e.pageY - top) / this.ratioY;
                this.eventPosition = { x, y };
            }, true);
        }
        update() {
            return __awaiter(this, void 0, void 0, function* () {
                const changes = this.componentObserver.clear();
                if (!this.activate) {
                    return;
                }
                for (const changed of changes) {
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
            });
        }
        remove(changed) {
            const component = changed.component;
            if (!component)
                return;
            const { a11yId } = component;
            const element = this.div.querySelector(`#${a11yId}`);
            element && this.div.removeChild(element);
            this.cache.delete(a11yId);
        }
        add(changed) {
            if (!this.activate)
                return;
            const component = changed.component;
            const { gameObject } = changed;
            const { delay, a11yId: id } = component;
            let { event } = component;
            if (!gameObject)
                return;
            const { transform } = gameObject;
            if (!transform)
                return;
            const element = document.createElement('div');
            this.cache.set(id, element);
            if (!event) {
                event = gameObject.getComponent('Event');
            }
            setTimeout(() => {
                this.setPosition(element, transform);
                this.setA11yAttr(element, component);
                if (event) {
                    this.addEvent(gameObject);
                }
                if (gameObject.scene) {
                    this.div.appendChild(element);
                }
            }, delay || this.delay);
        }
        transformChange(changed) {
            const component = changed.component;
            const { gameObject } = changed;
            const a11yComponent = gameObject.getComponent(A11y);
            if (!a11yComponent)
                return;
            const { a11yId } = a11yComponent;
            if (!component.inScene) {
                const dom = this.div.querySelector(`#${a11yId}`);
                dom && this.div.removeChild(dom);
            }
            else {
                if (this.cache.has(a11yId)) {
                    const addDom = this.cache.get(a11yId);
                    addDom && this.div.appendChild(addDom);
                }
            }
        }
        setEvent(element, event, gameObject, id) {
            if (!event) {
                return;
            }
            const func = getEventFunc.bind(this, event, gameObject);
            this.eventCache.set(id, func);
            element.addEventListener('click', func);
        }
        addEvent(gameObject) {
            const a11y = gameObject.getComponent(A11y);
            if (!a11y)
                return;
            const event = gameObject.getComponent('Event');
            if (!event)
                return;
            const element = this.cache.get(a11y.a11yId);
            element && this.setEvent(element, event, gameObject, a11y.a11yId);
        }
        removeEvent(changed) {
            const { gameObject } = changed;
            const a11y = gameObject.getComponent(A11y);
            if (!a11y)
                return;
            const event = changed.component;
            if (!event)
                return;
            const { a11yId } = a11y;
            const func = this.eventCache.get(a11yId);
            const element = this.cache.get(a11yId);
            element && element.removeEventListener('click', func);
        }
        setA11yAttr(element, component) {
            const { hint, props = {}, state = {}, role, a11yId: id } = component;
            const realRole = role || 'text';
            element.setAttribute('role', realRole);
            element.setAttribute('aria-label', hint);
            element.id = id;
            const ariaProps = Object.keys(props);
            for (const key of ariaProps) {
                element.setAttribute(key, props[key]);
            }
            const ariaState = Object.keys(state);
            for (const key of ariaState) {
                element.setAttribute(key, state[key]);
            }
            for (let key of Object.keys(component)) {
                if (typeof component[key] === 'string' &&
                    notAttr.indexOf(key) === -1 &&
                    key.indexOf('_') !== 1) {
                    element.setAttribute(key, component[key]);
                }
            }
        }
        setPosition(element, transform) {
            const { width, height } = transform.size;
            const style = {
                width: width === 0 ? 1 : width * this.ratioX,
                height: height === 0 ? 1 : height * this.ratioY,
                position: POSITION,
                zIndex: ZINDEX,
                pointerEvents: PointerEvents.AUTO,
                background: this.debug ? MaskBackground.DEBUG : MaskBackground.NONE,
            };
            const transformProps = Object.assign({}, transform);
            setStyle(element, style);
            setTransform(element, transformProps, this.ratioX, this.ratioY);
        }
        onDestroy() {
            this.div.parentElement.removeChild(this.div);
            this.cache = null;
            this.eventCache = null;
        }
    };
    A11ySystem.systemName = 'A11ySystem';
    A11ySystem = __decorate([
        eva_js.decorators.componentObserver({
            A11y: [],
            Transform: ['inScene'],
            Event: [],
        })
    ], A11ySystem);
    var A11ySystem$1 = A11ySystem;

    exports.A11y = A11y;
    exports.A11ySystem = A11ySystem$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
