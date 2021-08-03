
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.EVA = {}));
}(this, (function (exports) { 'use strict';

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

	function getComponentName(component) {
	    if (component instanceof Component) {
	        return component.name;
	    }
	    else if (component instanceof Function) {
	        return component.componentName;
	    }
	}
	class Component extends eventemitter3 {
	    constructor(params) {
	        super();
	        this.started = false;
	        this.name = this.constructor.componentName;
	        this.__componentDefaultParams = params;
	    }
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
	var WeakMap = getNative(root, 'WeakMap');

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

	/** Used for built-in method references. */
	var objectProto$8 = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

	  return value === proto;
	}

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
	var objectProto$7 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable$1 = objectProto$7.propertyIsEnumerable;

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
	  return isObjectLike(value) && hasOwnProperty$6.call(value, 'callee') &&
	    !propertyIsEnumerable$1.call(value, 'callee');
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

	/** `Object#toString` result references. */
	var argsTag$1 = '[object Arguments]',
	    arrayTag$1 = '[object Array]',
	    boolTag$1 = '[object Boolean]',
	    dateTag$1 = '[object Date]',
	    errorTag$1 = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag$2 = '[object Map]',
	    numberTag$1 = '[object Number]',
	    objectTag$2 = '[object Object]',
	    regexpTag$1 = '[object RegExp]',
	    setTag$2 = '[object Set]',
	    stringTag$1 = '[object String]',
	    weakMapTag$1 = '[object WeakMap]';

	var arrayBufferTag$1 = '[object ArrayBuffer]',
	    dataViewTag$2 = '[object DataView]',
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
	typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
	typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] =
	typedArrayTags[errorTag$1] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] =
	typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] =
	typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] =
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
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

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
	    if ((inherited || hasOwnProperty$5.call(value, key)) &&
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
	var objectProto$5 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

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
	    if (hasOwnProperty$4.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
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
	var objectProto$4 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

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
	  return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
	}

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

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
	  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$2.call(data, key);
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

	/* Built-in method references that are verified to be native. */
	var Map$1 = getNative(root, 'Map');

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
	var objectProto$2 = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;

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
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};

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
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');

	/* Built-in method references that are verified to be native. */
	var Promise$1 = getNative(root, 'Promise');

	/* Built-in method references that are verified to be native. */
	var Set$1 = getNative(root, 'Set');

	/** `Object#toString` result references. */
	var mapTag$1 = '[object Map]',
	    objectTag$1 = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag$1 = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag$1 = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map$1),
	    promiseCtorString = toSource(Promise$1),
	    setCtorString = toSource(Set$1),
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
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
	    (Map$1 && getTag(new Map$1) != mapTag$1) ||
	    (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
	    (Set$1 && getTag(new Set$1) != setTag$1) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag$1 ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag$1;
	        case mapCtorString: return mapTag$1;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag$1;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	var getTag$1 = getTag;

	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;

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
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';

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
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
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

	exports.OBSERVER_TYPE = void 0;
	(function (ObserverType) {
	    ObserverType["ADD"] = "ADD";
	    ObserverType["REMOVE"] = "REMOVE";
	    ObserverType["CHANGE"] = "CHANGE";
	})(exports.OBSERVER_TYPE || (exports.OBSERVER_TYPE = {}));
	const objectCache = {};
	const systemInstance = {};
	const observerInfos = {};
	const componentProps = {};
	function getObjectCache(component, keys) {
	    if (!objectCache[component.gameObject.id]) {
	        objectCache[component.gameObject.id] = {};
	    }
	    const cache = objectCache[component.gameObject.id];
	    const key = component.name + '_' + keys.join(',');
	    if (cache[key]) {
	        return cache[key];
	    }
	    const keyIndex = keys.length - 1;
	    let property = component;
	    for (let i = 0; i < keyIndex; i++) {
	        property = property[keys[i]];
	    }
	    cache[key] = { property, key: keys[keyIndex] };
	    return cache[key];
	}
	function removeObjectCache(component) {
	    if (component.gameObject) {
	        delete objectCache[component.gameObject.id];
	    }
	}
	function addObserver({ systemName, componentName, component, prop, type, }) {
	    systemInstance[systemName].componentObserver.add({
	        component,
	        prop,
	        type,
	        componentName,
	    });
	}
	function pushToQueue({ prop, component, componentName, }) {
	    for (const systemName in observerInfos) {
	        const observerInfo = observerInfos[systemName] || {};
	        const info = observerInfo[componentName];
	        if (!info)
	            continue;
	        const index = info.findIndex(p => {
	            return isEqual(p, prop);
	        });
	        if (index > -1) {
	            addObserver({
	                systemName,
	                componentName,
	                component,
	                prop,
	                type: exports.OBSERVER_TYPE.CHANGE,
	            });
	        }
	    }
	}
	function defineProperty({ obj, key, prop, component, componentName, }) {
	    if (obj === undefined) {
	        return;
	    }
	    if (!(key in obj)) {
	        console.error(`prop ${key} not in component: ${componentName}, Can not observer`);
	        return;
	    }
	    Object.defineProperty(obj, `_${key}`, {
	        enumerable: false,
	        writable: true,
	        value: obj[key],
	    });
	    if (prop.deep && isObject(obj[key])) {
	        for (const childKey of Object.keys(obj[key])) {
	            defineProperty({
	                obj: obj[key],
	                key: childKey,
	                prop,
	                component,
	                componentName,
	            });
	        }
	    }
	    Object.defineProperty(obj, key, {
	        enumerable: true,
	        set(val) {
	            if (obj[`_${key}`] === val)
	                return;
	            obj[`_${key}`] = val;
	            pushToQueue({ prop, component, componentName });
	        },
	        get() {
	            return obj[`_${key}`];
	        },
	    });
	}
	function isComponent(comp) {
	    return comp && comp.constructor && 'componentName' in comp.constructor;
	}
	function initObserver(Systems) {
	    const Ss = [];
	    if (Systems instanceof Array) {
	        Ss.push(...Systems);
	    }
	    else {
	        Ss.push(Systems);
	    }
	    for (const S of Ss) {
	        for (const componentName in S.observerInfo) {
	            componentProps[componentName] = componentProps[componentName] || [];
	            const props = componentProps[componentName];
	            for (const prop of S.observerInfo[componentName]) {
	                const index = props.findIndex(p => {
	                    return isEqual(p, prop);
	                });
	                if (index === -1) {
	                    componentProps[componentName].push(prop);
	                }
	            }
	        }
	    }
	}
	function observer(component, componentName = component.name) {
	    if (!componentName || !componentProps[componentName]) {
	        return;
	    }
	    if (!component || !isComponent(component)) {
	        throw new Error('component param must be an instance of Component');
	    }
	    if (!component.gameObject || !component.gameObject.id) {
	        throw new Error('component should be add to a gameObject');
	    }
	    for (const item of componentProps[componentName]) {
	        const { property, key } = getObjectCache(component, item.prop);
	        defineProperty({
	            obj: property,
	            key,
	            prop: item,
	            component,
	            componentName,
	        });
	    }
	}
	function observerAdded(component, componentName = component.name) {
	    for (const systemName in observerInfos) {
	        const observerInfo = observerInfos[systemName] || {};
	        const info = observerInfo[componentName];
	        if (info) {
	            systemInstance[systemName].componentObserver.add({
	                component,
	                type: exports.OBSERVER_TYPE.ADD,
	                componentName,
	            });
	        }
	    }
	}
	function observerRemoved(component, componentName = component.name) {
	    for (const systemName in observerInfos) {
	        const observerInfo = observerInfos[systemName] || {};
	        const info = observerInfo[componentName];
	        if (info) {
	            systemInstance[systemName].componentObserver.add({
	                component,
	                type: exports.OBSERVER_TYPE.REMOVE,
	                componentName,
	            });
	        }
	    }
	    removeObjectCache(component);
	}
	function setSystemObserver(system, S) {
	    observerInfos[S.systemName] = S.observerInfo;
	    systemInstance[S.systemName] = system;
	}

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

	function IDEProp(target, propertyKey) {
	    if (!target.constructor.IDEProps) {
	        target.constructor.IDEProps = [];
	    }
	    target.constructor.IDEProps.push(propertyKey);
	}

	class Transform extends Component {
	    constructor() {
	        super(...arguments);
	        this.name = 'Transform';
	        this._parent = null;
	        this.inScene = false;
	        this.children = [];
	        this.position = { x: 0, y: 0 };
	        this.size = { width: 0, height: 0 };
	        this.origin = { x: 0, y: 0 };
	        this.anchor = { x: 0, y: 0 };
	        this.scale = { x: 1, y: 1 };
	        this.skew = { x: 0, y: 0 };
	        this.rotation = 0;
	    }
	    init(params = {}) {
	        const props = ['position', 'size', 'origin', 'anchor', 'scale', 'skew'];
	        for (const key of props) {
	            Object.assign(this[key], params[key]);
	        }
	        this.rotation = params.rotation || this.rotation;
	    }
	    set parent(val) {
	        if (val) {
	            val.addChild(this);
	        }
	        else if (this.parent) {
	            this.parent.removeChild(this);
	        }
	    }
	    get parent() {
	        return this._parent;
	    }
	    addChild(child) {
	        if (child.parent === this) {
	            const index = this.children.findIndex(item => item === child);
	            this.children.splice(index, 1);
	        }
	        else if (child.parent) {
	            child.parent.removeChild(child);
	        }
	        child._parent = this;
	        this.children.push(child);
	    }
	    removeChild(child) {
	        const index = this.children.findIndex(item => item === child);
	        if (index > -1) {
	            this.children.splice(index, 1);
	            child._parent = null;
	        }
	    }
	    clearChildren() {
	        this.children.length = 0;
	    }
	}
	Transform.componentName = 'Transform';
	__decorate([
	    IDEProp
	], Transform.prototype, "position", void 0);
	__decorate([
	    IDEProp
	], Transform.prototype, "size", void 0);
	__decorate([
	    IDEProp
	], Transform.prototype, "origin", void 0);
	__decorate([
	    IDEProp
	], Transform.prototype, "anchor", void 0);
	__decorate([
	    IDEProp
	], Transform.prototype, "scale", void 0);
	__decorate([
	    IDEProp
	], Transform.prototype, "skew", void 0);
	__decorate([
	    IDEProp
	], Transform.prototype, "rotation", void 0);

	let _id = 0;
	function getId() {
	    return ++_id;
	}
	class GameObject {
	    constructor(name, obj) {
	        this._componentCache = {};
	        this.components = [];
	        this._name = name;
	        this.id = getId();
	        this.addComponent(Transform, obj);
	    }
	    get transform() {
	        return this.getComponent(Transform);
	    }
	    get parent() {
	        return (this.transform &&
	            this.transform.parent &&
	            this.transform.parent.gameObject);
	    }
	    get name() {
	        return this._name;
	    }
	    set scene(val) {
	        if (this._scene === val)
	            return;
	        const scene = this._scene;
	        this._scene = val;
	        if (this.transform && this.transform.children) {
	            for (const child of this.transform.children) {
	                child.gameObject.scene = val;
	            }
	        }
	        if (val) {
	            val.addGameObject(this);
	        }
	        else {
	            scene && scene.removeGameObject(this);
	        }
	    }
	    get scene() {
	        return this._scene;
	    }
	    addChild(gameObject) {
	        if (!gameObject || !gameObject.transform || gameObject === this)
	            return;
	        if (!(gameObject instanceof GameObject)) {
	            throw new Error('addChild only receive GameObject');
	        }
	        if (!this.transform) {
	            throw new Error(`gameObject '${this.name}' has been destroy`);
	        }
	        gameObject.transform.parent = this.transform;
	        gameObject.scene = this.scene;
	    }
	    removeChild(gameObject) {
	        if (!(gameObject instanceof GameObject) ||
	            !gameObject.parent ||
	            gameObject.parent !== this) {
	            return gameObject;
	        }
	        gameObject.transform.parent = null;
	        gameObject.scene = null;
	        return gameObject;
	    }
	    addComponent(C, obj) {
	        const componentName = getComponentName(C);
	        if (this._componentCache[componentName])
	            return;
	        let component;
	        if (C instanceof Function) {
	            component = new C(obj);
	        }
	        else if (C instanceof Component) {
	            component = C;
	        }
	        else {
	            throw new Error('addComponent recieve Component and Component Constructor');
	        }
	        if (component.gameObject) {
	            throw new Error(`component has been added on gameObject ${component.gameObject.name}`);
	        }
	        component.gameObject = this;
	        component.init && component.init(component.__componentDefaultParams);
	        observerAdded(component, component.name);
	        observer(component, component.name);
	        this.components.push(component);
	        this._componentCache[componentName] = component;
	        component.awake && component.awake();
	        return component;
	    }
	    removeComponent(c) {
	        let componentName;
	        if (typeof c === 'string') {
	            componentName = c;
	        }
	        else if (c instanceof Component) {
	            componentName = c.name;
	        }
	        else if (c.componentName) {
	            componentName = c.componentName;
	        }
	        if (componentName === 'Transform') {
	            throw new Error('Transform can\'t be removed');
	        }
	        return this._removeComponent(componentName);
	    }
	    _removeComponent(componentName) {
	        const index = this.components.findIndex(({ name }) => name === componentName);
	        if (index === -1)
	            return;
	        const component = this.components.splice(index, 1)[0];
	        delete this._componentCache[componentName];
	        component.onDestroy && component.onDestroy();
	        observerRemoved(component, componentName);
	        component.gameObject = undefined;
	        return component;
	    }
	    getComponent(c) {
	        let componentName;
	        if (typeof c === 'string') {
	            componentName = c;
	        }
	        else if (c instanceof Component) {
	            componentName = c.name;
	        }
	        else if (c.componentName) {
	            componentName = c.componentName;
	        }
	        if (typeof this._componentCache[componentName] !== 'undefined') {
	            return this._componentCache[componentName];
	        }
	        else {
	            return;
	        }
	    }
	    remove() {
	        if (this.parent)
	            return this.parent.removeChild(this);
	    }
	    destroy() {
	        Array.from(this.transform.children).forEach(({ gameObject }) => {
	            gameObject.destroy();
	        });
	        this.remove();
	        this.transform.clearChildren();
	        for (const key in this._componentCache) {
	            this._removeComponent(key);
	        }
	        this.components.length = 0;
	    }
	}

	class ComponentObserver {
	    constructor() {
	        this.events = [];
	    }
	    add({ component, prop, type, componentName }) {
	        if (type === exports.OBSERVER_TYPE.REMOVE) {
	            this.events = this.events.filter(changed => changed.component !== component);
	        }
	        const index = this.events.findIndex(changed => changed.component === component &&
	            isEqual(changed.prop, prop) &&
	            changed.type === type);
	        if (index > -1) {
	            this.events.splice(index, 1);
	        }
	        this.events.push({
	            gameObject: component.gameObject,
	            component,
	            prop: prop,
	            type,
	            componentName,
	        });
	    }
	    getChanged() {
	        return this.events;
	    }
	    get changed() {
	        return this.events;
	    }
	    clear() {
	        const events = this.events;
	        this.events = [];
	        return events;
	    }
	}

	class System {
	    constructor(params) {
	        this.started = false;
	        this.componentObserver = new ComponentObserver();
	        this.__systemDefaultParams = params;
	        this.name = this.constructor.systemName;
	    }
	    destroy() {
	        var _a;
	        this.componentObserver = null;
	        this.__systemDefaultParams = null;
	        (_a = this.onDestroy) === null || _a === void 0 ? void 0 : _a.call(this);
	    }
	}

	function createNowTime(syncLocker = true) {
	  let nowtime = null;
	  if (Date.now) {
	    nowtime = Date.now;
	  } else {
	    nowtime = () => new Date().getTime();
	  }

	  return nowtime;
	}

	/*
	    delay = 100 -> delay = {delay: 100}
	    delay = {entropy: 100} -> delay = {delay: 100, isEntropy: true}
	   */
	function formatDelay(delay) {
	  if (typeof delay === 'number') {
	    delay = {delay};
	  } else if ('entropy' in delay) {
	    delay = {delay: delay.entropy, isEntropy: true};
	  }
	  return delay;
	}

	const _nowtime = createNowTime();

	const defaultOptions$1 = {
	  originTime: 0,
	  playbackRate: 1.0,
	};

	const _timeMark = Symbol('timeMark'),
	  _playbackRate = Symbol('playbackRate'),
	  _timers = Symbol('timers'),
	  _originTime = Symbol('originTime'),
	  _setTimer = Symbol('setTimer'),
	  _parent = Symbol('parent');

	class Timeline {
	  constructor(options, parent) {
	    if (options instanceof Timeline) {
	      parent = options;
	      options = {};
	    }

	    options = Object.assign({}, defaultOptions$1, options);

	    if (parent) {
	      this[_parent] = parent;
	    }

	    const nowtime = options.nowtime || _nowtime;
	    if (!parent) {
	      const createTime = nowtime();
	      Object.defineProperty(this, 'globalTime', {
	        get() {
	          return nowtime() - createTime;
	        },
	      });
	    } else {
	      Object.defineProperty(this, 'globalTime', {
	        get() {
	          return parent.currentTime;
	        },
	      });
	    }

	    // timeMark records the reference points on timeline
	    // Each time we change the playbackRate or currentTime or entropy
	    // A new timeMark will be generated
	    // timeMark sorted by entropy
	    // If you reset entropy, all the timeMarks behind the new entropy
	    // should be dropped
	    this[_timeMark] = [
	      {
	        globalTime: this.globalTime,
	        localTime: -options.originTime,
	        entropy: -options.originTime,
	        playbackRate: options.playbackRate,
	        globalEntropy: 0,
	      },
	    ];

	    if (this[_parent]) {
	      this[_timeMark][0].globalEntropy = this[_parent].entropy;
	    }

	    this[_originTime] = options.originTime;
	    this[_playbackRate] = options.playbackRate;
	    this[_timers] = new Map();
	  }

	  get parent() {
	    return this[_parent];
	  }

	  get lastTimeMark() {
	    return this[_timeMark][this[_timeMark].length - 1];
	  }

	  markTime({time = this.currentTime, entropy = this.entropy, playbackRate = this.playbackRate} = {}) {
	    const timeMark = {
	      globalTime: this.globalTime,
	      localTime: time,
	      entropy,
	      playbackRate,
	      globalEntropy: this.globalEntropy,
	    };
	    this[_timeMark].push(timeMark);
	  }

	  get currentTime() {
	    const {localTime, globalTime} = this.lastTimeMark;
	    return localTime + (this.globalTime - globalTime) * this.playbackRate;
	  }

	  set currentTime(time) {
	    const from = this.currentTime,
	      to = time,
	      timers = this[_timers];

	    this.markTime({time});
	    Array.from(Object.entries(timers)).forEach(([id, timer]) => {
	      if (!timers.has(id)) return; // Need check because it maybe clearTimeout by former handler().
	      const {isEntropy, delay, heading} = timer.time,
	        {handler, startTime} = timer;

	      if (!isEntropy) {
	        const endTime = startTime + delay;
	        if (
	          delay === 0 ||
	          (heading !== false && (to - from) * delay <= 0) ||
	          (from <= endTime && endTime <= to) ||
	          (from >= endTime && endTime >= to)
	        ) {
	          handler();
	          this.clearTimeout(id);
	        }
	      } else if (delay === 0) {
	        handler();
	        this.clearTimeout(id);
	      }
	    });
	    this.updateTimers();
	  }

	  // Both currentTime and entropy should be influenced by playbackRate.
	  // If current playbackRate is negative, the currentTime should go backwards
	  // while the entropy remain to go forwards.
	  // Both of the initial values is set to -originTime
	  get entropy() {
	    const {entropy, globalEntropy} = this.lastTimeMark;
	    return entropy + Math.abs((this.globalEntropy - globalEntropy) * this.playbackRate);
	  }

	  get globalEntropy() {
	    return this[_parent] ? this[_parent].entropy : this.globalTime;
	  }

	  // get globalTime() {
	  //   if(this[_parent]) {
	  //     return this[_parent].currentTime;
	  //   }

	  //   return nowtime();
	  // }

	  // change entropy will NOT cause currentTime changing but may influence the pass
	  // and the future of the timeline. (It may change the result of seek***Time)
	  // While entropy is set, all the marks behind will be droped
	  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
	  set entropy(entropy) {
	    if (this.entropy > entropy) {
	      const idx = this.seekTimeMark(entropy);
	      this[_timeMark].length = idx + 1;
	    }
	    this.markTime({entropy});
	    this.updateTimers();
	  }

	  fork(options) {
	    return new Timeline(options, this);
	  }

	  seekGlobalTime(seekEntropy) {
	    const idx = this.seekTimeMark(seekEntropy),
	      timeMark = this[_timeMark][idx];

	    const {entropy, playbackRate, globalTime} = timeMark;

	    return globalTime + (seekEntropy - entropy) / Math.abs(playbackRate);
	  }

	  seekLocalTime(seekEntropy) {
	    const idx = this.seekTimeMark(seekEntropy),
	      timeMark = this[_timeMark][idx];

	    const {localTime, entropy, playbackRate} = timeMark;

	    if (playbackRate > 0) {
	      return localTime + (seekEntropy - entropy);
	    }
	    return localTime - (seekEntropy - entropy);
	  }

	  seekTimeMark(entropy) {
	    const timeMark = this[_timeMark];

	    let l = 0,
	      r = timeMark.length - 1;

	    if (entropy <= timeMark[l].entropy) {
	      return l;
	    }
	    if (entropy >= timeMark[r].entropy) {
	      return r;
	    }

	    let m = Math.floor((l + r) / 2); // binary search

	    while (m > l && m < r) {
	      if (entropy === timeMark[m].entropy) {
	        return m;
	      }
	      if (entropy < timeMark[m].entropy) {
	        r = m;
	      } else if (entropy > timeMark[m].entropy) {
	        l = m;
	      }
	      m = Math.floor((l + r) / 2);
	    }

	    return l;
	  }

	  get playbackRate() {
	    return this[_playbackRate];
	  }

	  set playbackRate(rate) {
	    if (rate !== this.playbackRate) {
	      this.markTime({playbackRate: rate});
	      this[_playbackRate] = rate;
	      this.updateTimers();
	    }
	  }

	  get paused() {
	    if (this.playbackRate === 0) return true;
	    let parent = this.parent;
	    while (parent) {
	      if (parent.playbackRate === 0) return true;
	      parent = parent.parent;
	    }
	    return false;
	  }

	  updateTimers() {
	    const timers = Array.from(this[_timers].entries());
	    timers.forEach(([id, timer]) => {
	      this[_setTimer](timer.handler, timer.time, id);
	    });
	  }

	  clearTimeout(id) {
	    const timer = this[_timers].get(id);

	    if (timer && timer.timerID != null) {
	      if (this[_parent]) {
	        this[_parent].clearTimeout(timer.timerID);
	      } else {
	        clearTimeout(timer.timerID);
	      }
	    }
	    this[_timers].delete(id);
	  }

	  clearInterval(id) {
	    return this.clearTimeout(id);
	  }

	  clear() {
	    // clear all running timers
	    const timers = this[_timers];
	    Array.from(Object.keys(timers)).forEach(id => {
	      this.clearTimeout(id);
	    });
	  }

	  /*
	    setTimeout(func, {delay: 100, isEntropy: true})
	    setTimeout(func, {entropy: 100})
	    setTimeout(func, 100})
	   */
	  setTimeout(handler, time = {delay: 0}) {
	    return this[_setTimer](handler, time);
	  }

	  setInterval(handler, time = {delay: 0}) {
	    const that = this;
	    const id = this[_setTimer](function step() {
	      // reset timer before handler cause we may clearTimeout in handler()
	      that[_setTimer](step, time, id);
	      handler();
	    }, time);

	    return id;
	  }

	  [_setTimer](handler, time, id = Symbol('timerID')) {
	    time = formatDelay(time);

	    const timer = this[_timers].get(id);
	    let delay,
	      timerID = null,
	      startTime,
	      startEntropy;

	    if (timer) {
	      this.clearTimeout(id);
	      if (time.isEntropy) {
	        delay = (time.delay - (this.entropy - timer.startEntropy)) / Math.abs(this.playbackRate);
	      } else {
	        delay = (time.delay - (this.currentTime - timer.startTime)) / this.playbackRate;
	      }
	      startTime = timer.startTime;
	      startEntropy = timer.startEntropy;
	    } else {
	      delay = time.delay / (time.isEntropy ? Math.abs(this.playbackRate) : this.playbackRate);
	      startTime = this.currentTime;
	      startEntropy = this.entropy;
	    }

	    const parent = this[_parent],
	      globalTimeout = parent ? parent.setTimeout.bind(parent) : setTimeout;

	    const heading = time.heading;
	    // console.log(heading, parent, delay)
	    if (!parent && heading === false && delay < 0) {
	      delay = Infinity;
	    }

	    // if playbackRate is zero, delay will be infinity.
	    // For wxapp bugs, cannot use Number.isFinite yet.
	    if (isFinite(delay) || parent) {
	      // eslint-disable-line no-restricted-globals
	      delay = Math.ceil(delay);
	      if (globalTimeout !== setTimeout) {
	        delay = {delay, heading};
	      }
	      timerID = globalTimeout(() => {
	        this[_timers].delete(id);
	        handler();
	      }, delay);
	    }

	    this[_timers].set(id, {
	      timerID,
	      handler,
	      time,
	      startTime,
	      startEntropy,
	    });

	    return id;
	  }
	}

	const defaultOptions = {
	    autoStart: true,
	    frameRate: 60
	};
	class Ticker {
	    constructor(options) {
	        options = Object.assign({}, defaultOptions, options);
	        this._frameCount = 0;
	        this._frameDuration = 1000 / options.frameRate;
	        this.autoStart = options.autoStart;
	        this.frameRate = options.frameRate;
	        this.timeline = new Timeline({ originTime: 0, playbackRate: 1.0 });
	        this._lastFrameTime = this.timeline.currentTime;
	        this._tickers = new Set();
	        this._requestId = null;
	        this._ticker = () => {
	            if (this._started) {
	                this._requestId = requestAnimationFrame(this._ticker);
	                this.update();
	            }
	        };
	        if (this.autoStart) {
	            this.start();
	        }
	    }
	    update() {
	        const currentTime = this.timeline.currentTime;
	        const durationTime = currentTime - this._lastFrameTime;
	        if (durationTime >= this._frameDuration) {
	            const frameTime = currentTime - (durationTime % this._frameDuration);
	            const deltaTime = frameTime - this._lastFrameTime;
	            this._lastFrameTime = frameTime;
	            const options = {
	                deltaTime,
	                time: currentTime,
	                currentTime: currentTime,
	                frameCount: ++this._frameCount,
	                fps: Math.round(1000 / deltaTime)
	            };
	            for (const func of this._tickers) {
	                if (typeof func === 'function') {
	                    func(options);
	                }
	            }
	        }
	    }
	    add(fn) {
	        this._tickers.add(fn);
	    }
	    remove(fn) {
	        this._tickers.delete(fn);
	    }
	    start() {
	        if (this._started)
	            return;
	        this._started = true;
	        this.timeline.playbackRate = 1.0;
	        this._requestId = requestAnimationFrame(this._ticker);
	    }
	    pause() {
	        this._started = false;
	        this.timeline.playbackRate = 0;
	    }
	}

	class Scene extends GameObject {
	    constructor(name, obj) {
	        super(name, obj);
	        this.gameObjects = [];
	        this.scene = this;
	    }
	    addGameObject(gameObject) {
	        this.gameObjects.push(gameObject);
	        if (gameObject.transform) {
	            gameObject.transform.inScene = true;
	        }
	    }
	    removeGameObject(gameObject) {
	        const index = this.gameObjects.indexOf(gameObject);
	        if (index === -1)
	            return;
	        if (gameObject.transform) {
	            gameObject.transform.inScene = false;
	        }
	        this.gameObjects.splice(index, 1);
	    }
	    destroy() {
	        this.scene = null;
	        super.destroy();
	        this.gameObjects = null;
	        this.canvas = null;
	    }
	}

	exports.LOAD_SCENE_MODE = void 0;
	(function (LOAD_SCENE_MODE) {
	    LOAD_SCENE_MODE["SINGLE"] = "SINGLE";
	    LOAD_SCENE_MODE["MULTI_CANVAS"] = "MULTI_CANVAS";
	})(exports.LOAD_SCENE_MODE || (exports.LOAD_SCENE_MODE = {}));
	const triggerStart = (obj) => {
	    if (!(obj instanceof System) && !(obj instanceof Component))
	        return;
	    if (obj.started)
	        return;
	    obj.started = true;
	    try {
	        obj.start && obj.start();
	    }
	    catch (e) {
	        if (obj instanceof Component) {
	            console.error(`${obj.constructor.componentName} start error`, e);
	        }
	        else {
	            console.error(`${obj.constructor.systemName} start error`, e);
	        }
	    }
	};
	const getAllGameObjects = game => {
	    var _a;
	    const mainSceneGameObjects = ((_a = game === null || game === void 0 ? void 0 : game.scene) === null || _a === void 0 ? void 0 : _a.gameObjects) || [];
	    const gameObjectsArray = game === null || game === void 0 ? void 0 : game.multiScenes.map(({ gameObjects }) => gameObjects);
	    let otherSceneGameObjects = [];
	    for (const gameObjects of gameObjectsArray) {
	        otherSceneGameObjects = [...otherSceneGameObjects, ...gameObjects];
	    }
	    return [...mainSceneGameObjects, ...otherSceneGameObjects];
	};
	const gameObjectLoop = (e, gameObjects = []) => {
	    for (const gameObject of gameObjects) {
	        for (const component of gameObject.components) {
	            try {
	                triggerStart(component);
	                component.update && component.update(e);
	            }
	            catch (e) {
	                console.error(`gameObject: ${gameObject.name} ${component.name} update error`, e);
	            }
	        }
	    }
	    for (const gameObject of gameObjects) {
	        for (const component of gameObject.components) {
	            try {
	                component.lateUpdate && component.lateUpdate(e);
	            }
	            catch (e) {
	                console.error(`gameObject: ${gameObject.name} ${component.name} lateUpdate error`, e);
	            }
	        }
	    }
	};
	const gameObjectResume = gameObjects => {
	    for (const gameObject of gameObjects) {
	        for (const component of gameObject.components) {
	            try {
	                component.onResume && component.onResume();
	            }
	            catch (e) {
	                console.error(`gameObject: ${gameObject.name}, ${component.name}, onResume error`, e);
	            }
	        }
	    }
	};
	const gameObjectPause = gameObjects => {
	    for (const gameObject of gameObjects) {
	        for (const component of gameObject.components) {
	            try {
	                component.onPause && component.onPause();
	            }
	            catch (e) {
	                console.error(`gameObject: ${gameObject.name}, ${component.name}, onResume error`, e);
	            }
	        }
	    }
	};
	class Game extends eventemitter3 {
	    constructor({ systems, frameRate = 60, autoStart = true, needScene = true, } = {}) {
	        super();
	        this.playing = false;
	        this.started = false;
	        this.multiScenes = [];
	        this.systems = [];
	        this.ticker = new Ticker({ autoStart: false, frameRate });
	        this.initTicker();
	        if (systems && systems.length) {
	            for (const system of systems) {
	                this.addSystem(system);
	            }
	        }
	        if (needScene) {
	            this.loadScene(new Scene('scene'));
	        }
	        if (autoStart) {
	            this.start();
	        }
	    }
	    get scene() {
	        return this._scene;
	    }
	    set scene(scene) {
	        this._scene = scene;
	    }
	    get gameObjects() {
	        return getAllGameObjects(this);
	    }
	    addSystem(S, obj) {
	        let system;
	        if (S instanceof Function) {
	            system = new S(obj);
	        }
	        else if (S instanceof System) {
	            system = S;
	        }
	        else {
	            console.warn('can only add System');
	            return;
	        }
	        const hasTheSystem = this.systems.find(item => {
	            return item.constructor === system.constructor;
	        });
	        if (hasTheSystem) {
	            console.warn(`${system.constructor.systemName} System has been added`);
	            return;
	        }
	        system.game = this;
	        system.init && system.init(system.__systemDefaultParams);
	        setSystemObserver(system, system.constructor);
	        initObserver(system.constructor);
	        try {
	            system.awake && system.awake();
	        }
	        catch (e) {
	            console.error(`${system.constructor.systemName} awake error`, e);
	        }
	        this.systems.push(system);
	        return system;
	    }
	    removeSystem(system) {
	        if (!system)
	            return;
	        let index = -1;
	        if (typeof system === 'string') {
	            index = this.systems.findIndex(s => s.name === system);
	        }
	        else if (system instanceof Function) {
	            index = this.systems.findIndex(s => s.constructor === system);
	        }
	        else if (system instanceof System) {
	            index = this.systems.findIndex(s => s === system);
	        }
	        if (index > -1) {
	            this.systems[index].destroy && this.systems[index].destroy();
	            this.systems.splice(index, 1);
	        }
	    }
	    getSystem(S) {
	        return this.systems.find(system => {
	            if (typeof S === 'string') {
	                return system.name === S;
	            }
	            else {
	                return system instanceof S;
	            }
	        });
	    }
	    pause() {
	        if (!this.playing)
	            return;
	        this.playing = false;
	        this.ticker.pause();
	        this.triggerPause();
	    }
	    start() {
	        if (this.playing)
	            return;
	        this.playing = true;
	        this.started = true;
	        this.ticker.start();
	    }
	    resume() {
	        if (this.playing)
	            return;
	        this.playing = true;
	        this.ticker.start();
	        this.triggerResume();
	    }
	    initTicker() {
	        this.ticker.add(e => {
	            this.scene && gameObjectLoop(e, this.gameObjects);
	            for (const system of this.systems) {
	                try {
	                    triggerStart(system);
	                    system.update && system.update(e);
	                }
	                catch (e) {
	                    console.error(`${system.constructor.systemName} update error`, e);
	                }
	            }
	            for (const system of this.systems) {
	                try {
	                    system.lateUpdate && system.lateUpdate(e);
	                }
	                catch (e) {
	                    console.error(`${system.constructor.systemName} lateUpdate error`, e);
	                }
	            }
	        });
	    }
	    triggerResume() {
	        gameObjectResume(this.gameObjects);
	        for (const system of this.systems) {
	            try {
	                system.onResume && system.onResume();
	            }
	            catch (e) {
	                console.error(`${system.constructor.systemName}, onResume error`, e);
	            }
	        }
	    }
	    triggerPause() {
	        gameObjectPause(this.gameObjects);
	        for (const system of this.systems) {
	            try {
	                system.onPause && system.onPause();
	            }
	            catch (e) {
	                console.error(`${system.constructor.systemName}, onPause error`, e);
	            }
	        }
	    }
	    destroySystems() {
	        for (const system of [...this.systems]) {
	            this.removeSystem(system);
	        }
	        this.systems.length = 0;
	    }
	    destroy() {
	        this.removeAllListeners();
	        this.pause();
	        this.scene.destroy();
	        this.destroySystems();
	        this.ticker = null;
	        this.scene = null;
	        this.canvas = null;
	        this.multiScenes = null;
	    }
	    loadScene({ scene, mode = exports.LOAD_SCENE_MODE.SINGLE, params = {}, }) {
	        if (!scene) {
	            return;
	        }
	        switch (mode) {
	            case exports.LOAD_SCENE_MODE.SINGLE:
	                this.scene = scene;
	                break;
	            case exports.LOAD_SCENE_MODE.MULTI_CANVAS:
	                this.multiScenes.push(scene);
	                break;
	        }
	        this.emit('sceneChanged', { scene, mode, params });
	    }
	}

	function componentObserver(observerInfo = {}) {
	    return function (constructor) {
	        if (!constructor.observerInfo) {
	            for (const key in observerInfo) {
	                for (const index in observerInfo[key]) {
	                    if (typeof observerInfo[key][index] === 'string') {
	                        observerInfo[key][index] = [observerInfo[key][index]];
	                    }
	                    let observerProp;
	                    if (Array.isArray(observerInfo[key][index])) {
	                        observerProp = {
	                            prop: observerInfo[key][index],
	                            deep: false,
	                        };
	                        observerInfo[key][index] = observerProp;
	                    }
	                    observerProp = observerInfo[key][index];
	                    if (typeof observerProp.prop === 'string') {
	                        observerProp.prop = [observerProp.prop];
	                    }
	                }
	            }
	            constructor.observerInfo = observerInfo;
	        }
	    };
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
	                console.warn(ResourceType.Buffer, xhr.response);
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

	var Resource$1 = (function () {
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
	var Loader = (function () {
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
	        var resource = new Resource$1(name, resOptions);
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
	}());

	class Progress extends eventemitter3 {
	    constructor({ resource, resourceTotal }) {
	        super();
	        this.progress = 0;
	        this.resourceTotal = 0;
	        this.resourceLoadedCount = 0;
	        this.resource = resource;
	        this.resourceTotal = resourceTotal;
	        if (resourceTotal === 0) {
	            this.resource.emit(exports.LOAD_EVENT.COMPLETE, this);
	        }
	    }
	    onStart() {
	        this.resource.emit(exports.LOAD_EVENT.START, this);
	    }
	    onProgress(param) {
	        this.resourceLoadedCount++;
	        this.progress =
	            Math.floor((this.resourceLoadedCount / this.resourceTotal) * 100) / 100;
	        if (param.success) {
	            this.resource.emit(exports.LOAD_EVENT.LOADED, this, param);
	        }
	        else {
	            this.resource.emit(exports.LOAD_EVENT.ERROR, this, param);
	        }
	        this.resource.emit(exports.LOAD_EVENT.PROGRESS, this, param);
	        if (this.resourceLoadedCount === this.resourceTotal) {
	            this.resource.emit(exports.LOAD_EVENT.COMPLETE, this);
	        }
	    }
	}

	exports.LOAD_EVENT = void 0;
	(function (LOAD_EVENT) {
	    LOAD_EVENT["START"] = "start";
	    LOAD_EVENT["PROGRESS"] = "progress";
	    LOAD_EVENT["LOADED"] = "loaded";
	    LOAD_EVENT["COMPLETE"] = "complete";
	    LOAD_EVENT["ERROR"] = "error";
	})(exports.LOAD_EVENT || (exports.LOAD_EVENT = {}));
	exports.RESOURCE_TYPE = void 0;
	(function (RESOURCE_TYPE) {
	    RESOURCE_TYPE["IMAGE"] = "IMAGE";
	    RESOURCE_TYPE["SPRITE"] = "SPRITE";
	    RESOURCE_TYPE["SPRITE_ANIMATION"] = "SPRITE_ANIMATION";
	    RESOURCE_TYPE["DRAGONBONE"] = "DRAGONBONE";
	    RESOURCE_TYPE["SPINE"] = "SPINE";
	    RESOURCE_TYPE["AUDIO"] = "AUDIO";
	    RESOURCE_TYPE["VIDEO"] = "VIDEO";
	})(exports.RESOURCE_TYPE || (exports.RESOURCE_TYPE = {}));
	XhrLoadStrategy.setExtensionXhrType('json', XhrResponseType.Json);
	XhrLoadStrategy.setExtensionXhrType('tex', XhrResponseType.Json);
	XhrLoadStrategy.setExtensionXhrType('ske', XhrResponseType.Json);
	XhrLoadStrategy.setExtensionXhrType('mp3', XhrResponseType.Buffer);
	XhrLoadStrategy.setExtensionXhrType('wav', XhrResponseType.Buffer);
	XhrLoadStrategy.setExtensionXhrType('aac', XhrResponseType.Buffer);
	XhrLoadStrategy.setExtensionXhrType('ogg', XhrResponseType.Buffer);
	const STRATEGY = {
	    png: ImageLoadStrategy,
	    jpg: ImageLoadStrategy,
	    jpeg: ImageLoadStrategy,
	    webp: ImageLoadStrategy,
	    json: XhrLoadStrategy,
	    tex: XhrLoadStrategy,
	    ske: XhrLoadStrategy,
	    audio: XhrLoadStrategy,
	    video: VideoLoadStrategy
	};
	class Resource extends eventemitter3 {
	    constructor(options) {
	        super();
	        this.timeout = 6000;
	        this.resourcesMap = {};
	        this.makeInstanceFunctions = {};
	        this.destroyInstanceFunctions = {};
	        this.promiseMap = {};
	        this.loaders = [];
	        if (options && typeof options.timeout === 'number') {
	            this.timeout = options.timeout;
	        }
	    }
	    loadConfig(resources) {
	        this.addResource(resources);
	        this.preload();
	    }
	    loadSingle(resource) {
	        this.addResource([resource]);
	        return this.getResource(resource.name);
	    }
	    addResource(resources) {
	        if (!resources || resources.length < 1) {
	            console.warn('no resources');
	            return;
	        }
	        for (const res of resources) {
	            if (this.resourcesMap[res.name]) {
	                console.warn(res.name + ' was already added');
	                continue;
	            }
	            this.resourcesMap[res.name] = res;
	            this.resourcesMap[res.name].data = {};
	        }
	    }
	    preload() {
	        const names = Object.values(this.resourcesMap)
	            .filter(({ preload }) => preload)
	            .map(({ name }) => name);
	        this.progress = new Progress({
	            resource: this,
	            resourceTotal: names.length,
	        });
	        this.loadResource({ names, preload: true });
	    }
	    getResource(name) {
	        return __awaiter(this, void 0, void 0, function* () {
	            this.loadResource({ names: [name] });
	            return this.promiseMap[name] || Promise.resolve({});
	        });
	    }
	    instance(name) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const res = this.resourcesMap[name];
	            return this.makeInstanceFunctions[res.type] && (yield this.makeInstanceFunctions[res.type](res));
	        });
	    }
	    destroy(name) {
	        return __awaiter(this, void 0, void 0, function* () {
	            yield this._destroy(name);
	        });
	    }
	    _destroy(name, loadError = false) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const resource = this.resourcesMap[name];
	            if (!resource)
	                return;
	            if (!loadError) {
	                try {
	                    if (this.destroyInstanceFunctions[resource.type]) {
	                        yield this.destroyInstanceFunctions[resource.type](resource);
	                    }
	                }
	                catch (e) {
	                    console.warn(`destroy resource ${resource.name} error with '${e.message}'`);
	                }
	            }
	            delete this.promiseMap[name];
	            resource.complete = false;
	            resource.instance = undefined;
	        });
	    }
	    registerInstance(type, callback) {
	        this.makeInstanceFunctions[type] = callback;
	    }
	    registerDestroy(type, callback) {
	        this.destroyInstanceFunctions[type] = callback;
	    }
	    loadResource({ names = [], preload = false }) {
	        const unLoadNames = names.filter(name => !this.promiseMap[name] && this.resourcesMap[name]);
	        if (!unLoadNames.length)
	            return;
	        const resolves = {};
	        const loader = this.getLoader(preload);
	        unLoadNames.forEach(name => {
	            this.promiseMap[name] = new Promise(r => (resolves[name] = r));
	            const res = this.resourcesMap[name];
	            for (const key in res.src) {
	                const resourceType = res.src[key].type;
	                if (resourceType === 'data') {
	                    res.data[key] = res.src[key].data;
	                    this.doComplete(name, resolves[name], preload);
	                }
	                else {
	                    loader.add({
	                        url: res.src[key].url,
	                        name: `${res.name}_${key}`,
	                        strategy: STRATEGY[resourceType],
	                        metadata: {
	                            key,
	                            name: res.name,
	                            resolves,
	                        },
	                    });
	                }
	            }
	        });
	        loader.load();
	    }
	    doComplete(name, resolve, preload = false) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const res = this.resourcesMap[name];
	            const param = {
	                name,
	                resource: this.resourcesMap[name],
	                success: true,
	            };
	            if (this.checkAllLoaded(name)) {
	                try {
	                    res.instance = yield this.instance(name);
	                    res.complete = true;
	                    if (preload) {
	                        this.progress.onProgress(param);
	                    }
	                    resolve(res);
	                }
	                catch (err) {
	                    res.complete = false;
	                    if (preload) {
	                        param.errMsg = err.message;
	                        param.success = false;
	                        this.progress.onProgress(param);
	                    }
	                    resolve({});
	                }
	            }
	        });
	    }
	    checkAllLoaded(name) {
	        const res = this.resourcesMap[name];
	        return Array.from(Object.keys(res.src)).every(resourceKey => res.data[resourceKey]);
	    }
	    getLoader(preload = false) {
	        let loader = this.loaders.find(({ loading }) => !loading);
	        if (!loader) {
	            loader = new Loader();
	            this.loaders.push(loader);
	        }
	        if (preload) {
	            loader.onStart.once(() => {
	                this.progress.onStart();
	            });
	        }
	        loader.onLoad.add((_, resource) => {
	            this.onLoad({ preload, resource });
	        });
	        loader.onError.add((errMsg, _, resource) => {
	            this.onError({ errMsg, resource, preload });
	        });
	        loader.onComplete.once(() => {
	            loader.onLoad.detachAll();
	            loader.onError.detachAll();
	            loader.reset();
	        });
	        return loader;
	    }
	    onLoad({ preload = false, resource }) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const { metadata: { key, name, resolves }, data, } = resource;
	            const res = this.resourcesMap[name];
	            res.data[key] = data;
	            this.doComplete(name, resolves[name], preload);
	        });
	    }
	    onError({ errMsg, preload = false, resource }) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const { metadata: { name, resolves }, } = resource;
	            this._destroy(name, true);
	            resolves[name]({});
	            if (preload) {
	                const param = {
	                    name,
	                    resource: this.resourcesMap[name],
	                    success: false,
	                    errMsg,
	                };
	                this.progress.onProgress(param);
	            }
	        });
	    }
	}
	const resource = new Resource();

	const decorators = {
	    IDEProp,
	    componentObserver,
	};

	exports.Component = Component;
	exports.Game = Game;
	exports.GameObject = GameObject;
	exports.IDEProp = IDEProp;
	exports.Scene = Scene;
	exports.System = System;
	exports.Transform = Transform;
	exports.componentObserver = componentObserver;
	exports.decorators = decorators;
	exports.resource = resource;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
