function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
function _callSuper(t, o, e) {
  return (
    (o = _getPrototypeOf(o)),
    _possibleConstructorReturn(
      t,
      _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e),
    )
  );
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError('Cannot call a class as a function');
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    (o.enumerable = o.enumerable || !1),
      (o.configurable = !0),
      'value' in o && (o.writable = !0),
      Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return (
    r && _defineProperties(e.prototype, r),
    t && _defineProperties(e, t),
    Object.defineProperty(e, 'prototype', {
      writable: !1,
    }),
    e
  );
}
function _getPrototypeOf(t) {
  return (
    (_getPrototypeOf = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (t) {
          return t.__proto__ || Object.getPrototypeOf(t);
        }),
    _getPrototypeOf(t)
  );
}
function _inherits(t, e) {
  if ('function' != typeof e && null !== e) throw new TypeError('Super expression must either be null or a function');
  (t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0,
    },
  })),
    Object.defineProperty(t, 'prototype', {
      writable: !1,
    }),
    e && _setPrototypeOf(t, e);
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
}
function _possibleConstructorReturn(t, e) {
  if (e && ('object' == typeof e || 'function' == typeof e)) return e;
  if (void 0 !== e) throw new TypeError('Derived constructors may only return object or undefined');
  return _assertThisInitialized(t);
}
function _setPrototypeOf(t, e) {
  return (
    (_setPrototypeOf = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (t, e) {
          return (t.__proto__ = e), t;
        }),
    _setPrototypeOf(t, e)
  );
}
function _toPrimitive(t, r) {
  if ('object' != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || 'default');
    if ('object' != typeof i) return i;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return ('string' === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, 'string');
  return 'symbol' == typeof i ? i : i + '';
}

/**
 * a
 * @private
 */
var DynamicPropertyContainer = /*#__PURE__*/ (function () {
  function DynamicPropertyContainer() {
    _classCallCheck(this, DynamicPropertyContainer);
  }
  return _createClass(DynamicPropertyContainer, [
    {
      key: 'outTypeExpressionMode',
      value:
        /**
         * a
         */
        function outTypeExpressionMode() {
          this._hasOutTypeExpression = true;
          if (this.container) this.container.outTypeExpressionMode();
        },

      /**
       * a
       * @param {*} prop a
       */
    },
    {
      key: 'addDynamicProperty',
      value: function addDynamicProperty(prop) {
        if (this.dynamicProperties.indexOf(prop) === -1) {
          this.dynamicProperties.push(prop);
          this.container.addDynamicProperty(this);
          this._isAnimated = true;
          if (prop._hasOutTypeExpression) this.outTypeExpressionMode();
        }
      },

      /**
       * a
       * @param {*} frameNum a
       */
    },
    {
      key: 'iterateDynamicProperties',
      value: function iterateDynamicProperties(frameNum) {
        this._mdf = false;
        var len = this.dynamicProperties.length;
        for (var i = 0; i < len; i += 1) {
          this.dynamicProperties[i].getValue(frameNum);
          if (this.dynamicProperties[i]._mdf) {
            this._mdf = true;
          }
        }
      },

      /**
       * a
       * @param {*} container a
       */
    },
    {
      key: 'initDynamicPropertyContainer',
      value: function initDynamicPropertyContainer(container) {
        this.container = container;
        this.dynamicProperties = [];
        this._mdf = false;
        this._isAnimated = false;
        this._hasOutTypeExpression = false;
      },
    },
  ]);
})();

/**
 * a
 * @private
 * @param {*} type a
 * @param {*} len a
 * @return {*}
 */
function createRegularArray(type, len) {
  var i = 0;
  var arr = [];
  var value;
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
var createTypedArray;
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
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 * @private
 */

var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
var float32ArraySupported = typeof Float32Array === 'function';

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
  var currentX;
  var currentT;
  var i = 0;
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
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
    var currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) {
      return aGuessT;
    }
    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
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
  // 不需要检查是否在某一区间内
  // if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
  //   throw new Error('bezier x values must be in [0, 1] range');
  // }
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
    for (var i = 0; i < kSplineTableSize; ++i) {
      this.sampleValues[i] = calcBezier(i * kSampleStepSize, this.mX1, this.mX2);
    }
  }
};
BezierEasing.prototype._getTForX = function (aX) {
  var intervalStart = 0.0;
  var currentSample = 1;
  var lastSample = kSplineTableSize - 1;
  for (; currentSample !== lastSample && this.sampleValues[currentSample] <= aX; ++currentSample) {
    intervalStart += kSampleStepSize;
  }
  --currentSample;

  // Interpolate to provide an initial guess for t
  var dist =
    (aX - this.sampleValues[currentSample]) / (this.sampleValues[currentSample + 1] - this.sampleValues[currentSample]);
  var guessForT = intervalStart + dist * kSampleStepSize;
  var initialSlope = getSlope(guessForT, this.mX1, this.mX2);
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

var beziers = {};

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
  var str = nm || ('bez_' + a + '_' + b + '_' + c + '_' + d).replace(/\./g, 'p');
  if (beziers[str]) {
    return beziers[str];
  }
  var bezEasing = new BezierEasing(a, b, c, d);
  beziers[str] = bezEasing;
  return bezEasing;
}
var BezierFactory = {
  getBezierEasing: getBezierEasing,
};

/**
 * a
 * @private
 * @param {*} arr a
 * @return {*}
 */
function _double(arr) {
  return arr.concat(createSizedArray(arr.length));
}
var pooling = {
  double: _double,
};

var PoolFactory = function PoolFactory(initialLength, _create, _release) {
  var _length = 0;
  var _maxLength = initialLength;
  var pool = createSizedArray(_maxLength);
  var ob = {
    newElement: newElement,
    release: release,
  };

  /**
   * a
   * @return {*}
   */
  function newElement() {
    var element;
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
      pool = pooling['double'](pool);
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

var defaultCurveSegments = 200;
/**
 * a
 * @private
 * @return {*}
 */
function create() {
  return {
    addedLength: 0,
    percents: createTypedArray('float32', defaultCurveSegments),
    lengths: createTypedArray('float32', defaultCurveSegments),
  };
}
var BezierLengthPool = PoolFactory(8, create);

/**
 * @private
 * @return {*}
 */
function create$1() {
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
function release(element) {
  var len = element.lengths.length;
  for (var i = 0; i < len; i += 1) {
    BezierLengthPool.release(element.lengths[i]);
  }
  element.lengths.length = 0;
}
var SegmentsLengthPool = PoolFactory(8, create$1, release);

// var easingFunctions = [];
var defaultCurveSegments$1 = 200;

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
  var det1 = x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1;
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
  var dist1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
  var dist2 = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2) + Math.pow(z3 - z1, 2));
  var dist3 = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2) + Math.pow(z3 - z2, 2));
  var diffDist;
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
  var curveSegments = defaultCurveSegments$1;
  // var i, len;
  var addedLength = 0;
  var ptDistance;
  var point = [];
  var lastPoint = [];
  var lengthData = BezierLengthPool.newElement();
  var len = pt3.length;
  for (var k = 0; k < curveSegments; k += 1) {
    var perc = k / (curveSegments - 1);
    ptDistance = 0;
    for (var i = 0; i < len; i += 1) {
      point[i] =
        Math.pow(1 - perc, 3) * pt1[i] +
        3 * Math.pow(1 - perc, 2) * perc * pt3[i] +
        3 * (1 - perc) * Math.pow(perc, 2) * pt4[i] +
        Math.pow(perc, 3) * pt2[i];
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
  var segmentsLength = SegmentsLengthPool.newElement();
  var closed = shapeData.c;
  var pathV = shapeData.v;
  var pathO = shapeData.o;
  var pathI = shapeData.i;
  var len = shapeData._length;
  var lengths = segmentsLength.lengths;
  var totalLength = 0;
  var i = 0;
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
var storedData = {};
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
  var bezierName = (
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
    var curveSegments = defaultCurveSegments$1;
    // var k, i, len;
    var addedLength = 0;
    var ptDistance;
    var point;
    var lastPoint = null;
    if (
      pt1.length === 2 &&
      (pt1[0] != pt2[0] || pt1[1] != pt2[1]) &&
      pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt1[0] + pt3[0], pt1[1] + pt3[1]) &&
      pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt2[0] + pt4[0], pt2[1] + pt4[1])
    ) {
      curveSegments = 2;
    }
    var bezierData = new BezierData(curveSegments);
    var len = pt3.length;
    for (var k = 0; k < curveSegments; k += 1) {
      point = createSizedArray(len);
      var perc = k / (curveSegments - 1);
      ptDistance = 0;
      for (var i = 0; i < len; i += 1) {
        point[i] =
          Math.pow(1 - perc, 3) * pt1[i] +
          3 * Math.pow(1 - perc, 2) * perc * (pt1[i] + pt3[i]) +
          3 * (1 - perc) * Math.pow(perc, 2) * (pt2[i] + pt4[i]) +
          Math.pow(perc, 3) * pt2[i];
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
  var percents = bezierData.percents;
  var lengths = bezierData.lengths;
  var len = percents.length;
  var initPos = Math.floor((len - 1) * perc);
  var lengthPos = perc * bezierData.addedLength;
  var lPerc = 0;
  if (initPos === len - 1 || initPos === 0 || lengthPos === lengths[initPos]) {
    return percents[initPos];
  } else {
    var dir = lengths[initPos] > lengthPos ? -1 : 1;
    var flag = true;
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
  var t1 = getDistancePerc(percent, bezierData);
  // var u0 = 1;
  var u1 = 1 - t1;
  var ptX =
    Math.round(
      (u1 * u1 * u1 * pt1[0] +
        (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[0] +
        (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[0] +
        t1 * t1 * t1 * pt2[0]) *
        1000,
    ) / 1000;
  var ptY =
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

var bezierSegmentPoints = createTypedArray('float32', 8);

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
  var t0 = getDistancePerc(startPerc, bezierData);
  endPerc = endPerc > 1 ? 1 : endPerc;
  var t1 = getDistancePerc(endPerc, bezierData);
  var len = pt1.length;
  var u0 = 1 - t0;
  var u1 = 1 - t1;
  var u0u0u0 = u0 * u0 * u0;
  var t0u0u0_3 = t0 * u0 * u0 * 3;
  var t0t0u0_3 = t0 * t0 * u0 * 3;
  var t0t0t0 = t0 * t0 * t0;
  //
  var u0u0u1 = u0 * u0 * u1;
  var t0u0u1_3 = t0 * u0 * u1 + u0 * t0 * u1 + u0 * u0 * t1;
  var t0t0u1_3 = t0 * t0 * u1 + u0 * t0 * t1 + t0 * u0 * t1;
  var t0t0t1 = t0 * t0 * t1;
  //
  var u0u1u1 = u0 * u1 * u1;
  var t0u1u1_3 = t0 * u1 * u1 + u0 * t1 * u1 + u0 * u1 * t1;
  var t0t1u1_3 = t0 * t1 * u1 + u0 * t1 * t1 + t0 * u1 * t1;
  var t0t1t1 = t0 * t1 * t1;
  //
  var u1u1u1 = u1 * u1 * u1;
  var t1u1u1_3 = t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1;
  var t1t1u1_3 = t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1;
  var t1t1t1 = t1 * t1 * t1;
  for (var i = 0; i < len; i += 1) {
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
  getSegmentsLength: getSegmentsLength,
  getNewSegment: getNewSegment,
  getPointInSegment: getPointInSegment,
  buildBezierData: buildBezierData,
  pointOnLine2D: pointOnLine2D,
  pointOnLine3D: pointOnLine3D,
};

var initialDefaultFrame = -999999;
var degToRads = Math.PI / 180;
var defaultVector = [0, 0];

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
var Tools = {
  /**
   * simple copy a json data
   * @method
   * @param {JSON} json source data
   * @return {JSON} object
   */
  copyJSON: function copyJSON(json) {
    return JSON.parse(JSON.stringify(json));
  },
  /**
   * detect the variable is array type
   * @method
   * @param {Array} variable input variable
   * @return {Boolean} result
   */
  isArray: (function () {
    var ks = _rt([]);
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
    var ks = _rt('s');
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
    var ks = _rt(1);
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
    var ks = _rt(function () {});
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
  isUndefined: function isUndefined(variable) {
    return typeof variable === 'undefined';
  },
  /**
   * detect the variable is boolean type
   * @method
   * @param {Boolean} variable input variable
   * @return {Boolean} result
   */
  isBoolean: (function () {
    var ks = _rt(true);
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
    var ks = _rt({});
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
  random: function random(min, max) {
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
  euclideanModulo: function euclideanModulo(n, m) {
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
  codomainBounce: function codomainBounce(n, min, max) {
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
  clamp: function clamp(x, a, b) {
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
  inRange: function inRange(v, min, max) {
    return v >= min && v <= max;
  },
  /**
   * get assets from keyframes assets
   * @method
   * @param {string} id assets refid
   * @param {object} assets assets object
   * @return {object} asset object
   */
  getAssets: function getAssets(id, assets) {
    for (var i = 0; i < assets.length; i++) {
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
  rgb2hex: function rgb2hex(rgb) {
    return (rgb[0] << 16) + (rgb[1] << 8) + (rgb[2] | 0);
  },
};

var EX_REG = /(loopIn|loopOut)\(([^)]+)/;
var STR_REG = /["']\w+["']/;

/**
 * Cycle
 * @class
 * @private
 */
var Cycle = /*#__PURE__*/ (function () {
  /**
   * Pingpong
   * @param {*} type Pingpong
   * @param {*} begin Pingpong
   * @param {*} end Pingpong
   */
  function Cycle(type, begin, end) {
    _classCallCheck(this, Cycle);
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
  return _createClass(Cycle, [
    {
      key: 'update',
      value: function update(progress) {
        if (this.type === 'in') {
          if (progress >= this.begin) return progress;
          return this.end - Tools.euclideanModulo(this.begin - progress, this.total);
        } else if (this.type === 'out') {
          if (progress <= this.end) return progress;
          return this.begin + Tools.euclideanModulo(progress - this.end, this.total);
        }
      },
    },
  ]);
})();
/**
 * Pingpong
 * @class
 * @private
 */
var Pingpong = /*#__PURE__*/ (function () {
  /**
   * Pingpong
   * @param {*} type Pingpong
   * @param {*} begin Pingpong
   * @param {*} end Pingpong
   */
  function Pingpong(type, begin, end) {
    _classCallCheck(this, Pingpong);
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
  return _createClass(Pingpong, [
    {
      key: 'update',
      value: function update(progress) {
        if ((this.type === 'in' && progress < this.begin) || (this.type === 'out' && progress > this.end)) {
          var space = progress - this.end;
          return this.pingpong(space);
        }
        return progress;
      },

      /**
       * pingpong
       * @param {number} space
       * @return {number}
       */
    },
    {
      key: 'pingpong',
      value: function pingpong(space) {
        var dir = Math.floor(space / this.total) % 2;
        if (dir) {
          return this.begin + Tools.euclideanModulo(space, this.total);
        } else {
          return this.end - Tools.euclideanModulo(space, this.total);
        }
      },
    },
  ]);
})();
var FN_MAPS = {
  loopIn: function loopIn(datak, mode, offset) {
    var begin = datak[0].t;
    var last = datak.length - 1;
    var endIdx = Math.min(last, offset);
    var end = datak[endIdx].t;
    switch (mode) {
      case 'cycle':
        return new Cycle('in', begin, end);
      case 'pingpong':
        return new Pingpong('in', begin, end);
    }
    return null;
  },
  loopOut: function loopOut(datak, mode, offset) {
    var last = datak.length - 1;
    var beginIdx = Math.max(0, last - offset);
    var begin = datak[beginIdx].t;
    var end = datak[last].t;
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
  var params = pStr.split(/\s*,\s*/);
  return params.map(function (it) {
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
  var rs = ex.match(EX_REG);
  var ps = parseParams(rs[2]);
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
  var _parseEx = parseEx(ksp.x),
    name = _parseEx.name,
    mode = _parseEx.mode,
    _parseEx$offset = _parseEx.offset,
    offset = _parseEx$offset === void 0 ? 0 : _parseEx$offset;
  var _offset = offset === 0 ? ksp.k.length - 1 : offset;
  return FN_MAPS[name] && FN_MAPS[name](ksp.k, mode, _offset);
}
var Expression = {
  hasSupportExpression: hasSupportExpression,
  getExpression: getExpression,
};

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
  var out = [];
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  var bx = b[0];
  var by = b[1];
  var bz = b[2];
  var bw = b[3];
  var omega;
  var cosom;
  var sinom;
  var scale0;
  var scale1;
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
  var qx = quat[0];
  var qy = quat[1];
  var qz = quat[2];
  var qw = quat[3];
  var heading = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy * qy - 2 * qz * qz);
  var attitude = Math.asin(2 * qx * qy + 2 * qz * qw);
  var bank = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx * qx - 2 * qz * qz);
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
  var heading = values[0] * degToRads;
  var attitude = values[1] * degToRads;
  var bank = values[2] * degToRads;
  var c1 = Math.cos(heading / 2);
  var c2 = Math.cos(attitude / 2);
  var c3 = Math.cos(bank / 2);
  var s1 = Math.sin(heading / 2);
  var s2 = Math.sin(attitude / 2);
  var s3 = Math.sin(bank / 2);
  var w = c1 * c2 * c3 - s1 * s2 * s3;
  var x = s1 * s2 * c3 + c1 * c2 * s3;
  var y = s1 * c2 * c3 + c1 * s2 * s3;
  var z = c1 * s2 * c3 - s1 * c2 * s3;
  return [x, y, z, w];
}

/**
 * basic property for animate property unit
 * @private
 */
var BaseProperty = /*#__PURE__*/ (function () {
  function BaseProperty() {
    _classCallCheck(this, BaseProperty);
  }
  return _createClass(BaseProperty, [
    {
      key: 'interpolateValue',
      value:
        /**
         * interpolate value
         * @param {Number} frameNum now frame
         * @param {Object} caching caching object
         * @return {Array} newValue
         */
        function interpolateValue(frameNum, caching) {
          // const offsetTime = this.offsetTime;
          var newValue;
          if (this.propType === 'multidimensional') {
            newValue = createTypedArray('float32', this.pv.length);
          }
          var iterationIndex = caching.lastIndex;
          var i = iterationIndex;
          var len = this.keyframes.length - 1;
          var flag = true;
          var keyData;
          var nextKeyData;
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
          var k;
          var kLen;
          var perc;
          var jLen;
          var j;
          var fnc;
          var nextKeyTime = nextKeyData.t;
          var keyTime = keyData.t;
          var endValue;
          if (keyData.to) {
            if (!keyData.bezierData) {
              keyData.bezierData = bez.buildBezierData(keyData.s, nextKeyData.s || keyData.e, keyData.to, keyData.ti);
            }
            var bezierData = keyData.bezierData;
            if (frameNum >= nextKeyTime || frameNum < keyTime) {
              var ind = frameNum >= nextKeyTime ? bezierData.points.length - 1 : 0;
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
              var distanceInLine = bezierData.segmentLength * perc;
              var segmentPerc;
              var addedLength =
                caching.lastFrame < frameNum && caching._lastKeyframeIndex === i ? caching._lastAddedLength : 0;
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
                } else if (
                  distanceInLine >= addedLength &&
                  distanceInLine < addedLength + bezierData.points[j + 1].partialLength
                ) {
                  segmentPerc = (distanceInLine - addedLength) / bezierData.points[j + 1].partialLength;
                  kLen = bezierData.points[j].point.length;
                  for (k = 0; k < kLen; k += 1) {
                    newValue[k] =
                      bezierData.points[j].point[k] +
                      (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc;
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
            var outX;
            var outY;
            var inX;
            var inY;
            var keyValue;
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
                var quatStart = createQuaternion(keyData.s);
                var quatEnd = createQuaternion(endValue);
                var time = (frameNum - keyTime) / (nextKeyTime - keyTime);
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
        },

      /**
       * get value at comp frame
       * @param {*} frameNum a
       * @return {Array|Number}
       */
    },
    {
      key: 'getValueAtCurrentTime',
      value: function getValueAtCurrentTime(frameNum) {
        // let frameNum = this.comp.renderedFrame;
        // let initTime = this.keyframes[0].t;
        // let endTime = this.keyframes[this.keyframes.length- 1].t;
        // if (!(frameNum === this._caching.lastFrame || (this._caching.lastFrame !== initFrame && ((this._caching.lastFrame >= endTime && frameNum >= endTime) || (this._caching.lastFrame < initTime && frameNum < initTime))))) {
        //   if (this._caching.lastFrame >= frameNum) {
        //     this._caching._lastKeyframeIndex = -1;
        //     this._caching.lastIndex = 0;
        //   }

        // }
        this._caching._lastKeyframeIndex = -1;
        this._caching.lastIndex = 0;
        var renderResult = this.interpolateValue(frameNum, this._caching);
        this.pv = renderResult;
        this._caching.lastFrame = frameNum;
        return this.pv;
      },

      /**
       * set value to this.v prop
       * @param {Array|Number} val value
       */
    },
    {
      key: 'setVValue',
      value: function setVValue(val) {
        var multipliedValue;
        if (this.propType === 'unidimensional') {
          multipliedValue = val * this.mult;
          if (Math.abs(this.v - multipliedValue) > 0.00001) {
            this.v = multipliedValue;
            this._mdf = true;
          }
        } else {
          var i = 0;
          var len = this.v.length;
          while (i < len) {
            multipliedValue = val[i] * this.mult;
            if (Math.abs(this.v[i] - multipliedValue) > 0.00001) {
              this.v[i] = multipliedValue;
              this._mdf = true;
            }
            i += 1;
          }
        }
      },

      /**
       * process effects sequence
       * @param {*} frameNum a
       */
    },
    {
      key: 'processEffectsSequence',
      value: function processEffectsSequence(frameNum) {
        this._mdf = false;
        if (this.expression) {
          frameNum = this.expression.update(frameNum);
        }
        if (frameNum === this.frameId || !this.effectsSequence.length) {
          return;
        }
        var i;
        var len = this.effectsSequence.length;
        var finalValue = this.kf ? this.pv : this.data.k;
        for (i = 0; i < len; i += 1) {
          finalValue = this.effectsSequence[i](frameNum);
        }
        this.setVValue(finalValue);
        this.frameId = frameNum;
      },

      /**
       * a
       * @param {*} effectFunction a
       */
    },
    {
      key: 'addEffect',
      value: function addEffect(effectFunction) {
        this.effectsSequence.push(effectFunction);
        this.container.addDynamicProperty(this);
      },
    },
  ]);
})();
/**
 * unidimensional value property
 * @private
 */
var ValueProperty = /*#__PURE__*/ (function (_BaseProperty) {
  /**
   * constructor unidimensional value property
   * @param {*} elem element node
   * @param {*} data unidimensional value property data
   * @param {*} mult data mult scale
   * @param {*} container value property container
   */
  function ValueProperty(elem, data, mult, container) {
    var _this;
    _classCallCheck(this, ValueProperty);
    _this = _callSuper(this, ValueProperty);
    _this.propType = 'unidimensional';
    _this.mult = mult || 1;
    _this.data = data;
    _this.v = mult ? data.k * mult : data.k;
    _this.pv = data.k;
    _this._mdf = false;
    _this.elem = elem;
    _this.container = container;
    _this.k = false;
    _this.kf = false;
    _this.effectsSequence = [];
    _this.getValue = _this.processEffectsSequence;
    return _this;
  }

  /**
   * a
   * @param {*} pv a
   */
  _inherits(ValueProperty, _BaseProperty);
  return _createClass(ValueProperty, [
    {
      key: 'updateValue',
      value: function updateValue(pv) {
        this.pv = pv;
        this.v = pv * this.mult;
      },
    },
  ]);
})(BaseProperty);
/**
 * multidimensional value property
 * @private
 */
var MultiDimensionalProperty = /*#__PURE__*/ (function (_BaseProperty2) {
  /**
   * constructor multidimensional value property
   * @param {*} elem element node
   * @param {*} data multidimensional value property data
   * @param {*} mult data mult scale
   * @param {*} container value property container
   */
  function MultiDimensionalProperty(elem, data, mult, container) {
    var _this2;
    _classCallCheck(this, MultiDimensionalProperty);
    _this2 = _callSuper(this, MultiDimensionalProperty);
    _this2.propType = 'multidimensional';
    _this2.mult = mult || 1;
    _this2.data = data;
    _this2._mdf = false;
    _this2.elem = elem;
    _this2.container = container;
    _this2.comp = elem.comp;
    _this2.k = false;
    _this2.kf = false;
    _this2.frameId = -1;
    var len = data.k.length;
    _this2.v = createTypedArray('float32', len);
    _this2.pv = createTypedArray('float32', len);
    for (var i = 0; i < len; i += 1) {
      _this2.v[i] = data.k[i] * _this2.mult;
      _this2.pv[i] = data.k[i];
    }
    _this2.effectsSequence = [];
    _this2.getValue = _this2.processEffectsSequence;
    return _this2;
  }

  /**
   * a
   * @param {*} pv a
   */
  _inherits(MultiDimensionalProperty, _BaseProperty2);
  return _createClass(MultiDimensionalProperty, [
    {
      key: 'updateValue',
      value: function updateValue(pv) {
        var len = pv.length;
        for (var i = 0; i < len; i += 1) {
          this.v[i] = pv[i] * this.mult;
          this.pv[i] = pv[i];
        }
      },
    },
  ]);
})(BaseProperty);
/**
 * keyframed unidimensional value property
 * @private
 */
var KeyframedValueProperty = /*#__PURE__*/ (function (_BaseProperty3) {
  /**
   * constructor keyframed unidimensional value property
   * @param {*} elem element node
   * @param {*} data keyframed unidimensional value property data
   * @param {*} mult data mult scale
   * @param {*} container value property container
   */
  function KeyframedValueProperty(elem, data, mult, container) {
    var _this3;
    _classCallCheck(this, KeyframedValueProperty);
    _this3 = _callSuper(this, KeyframedValueProperty);
    _this3.propType = 'unidimensional';
    _this3.keyframes = data.k;
    // this.offsetTime = elem.data.st;
    _this3.frameId = -1;
    _this3._caching = {
      lastFrame: initialDefaultFrame,
      lastIndex: 0,
      value: 0,
      _lastKeyframeIndex: -1,
    };
    _this3.k = true;
    _this3.kf = true;
    _this3.data = data;
    _this3.mult = mult || 1;
    _this3.elem = elem;
    _this3.container = container;
    _this3.comp = elem.comp;
    _this3.v = initialDefaultFrame * _this3.mult;
    _this3.pv = initialDefaultFrame;
    _this3.getValue = _this3.processEffectsSequence;
    _this3.effectsSequence = [_this3.getValueAtCurrentTime.bind(_this3)];
    _this3._hasOutTypeExpression = false;
    if (Expression.hasSupportExpression(data)) {
      _this3.expression = Expression.getExpression(data);
      _this3._hasOutTypeExpression = _this3.expression.type === 'out';
    }
    return _this3;
  }
  _inherits(KeyframedValueProperty, _BaseProperty3);
  return _createClass(KeyframedValueProperty);
})(BaseProperty);
/**
 * keyframed multidimensional value property
 * @private
 */
var KeyframedMultidimensionalProperty = /*#__PURE__*/ (function (_BaseProperty4) {
  /**
   * constructor keyframed multidimensional value property
   * @param {*} elem element node
   * @param {*} data keyframed multidimensional value property data
   * @param {*} mult data mult scale
   * @param {*} container value property container
   */
  function KeyframedMultidimensionalProperty(elem, data, mult, container) {
    var _this4;
    _classCallCheck(this, KeyframedMultidimensionalProperty);
    _this4 = _callSuper(this, KeyframedMultidimensionalProperty);
    _this4.propType = 'multidimensional';
    var i;
    var len = data.k.length;
    var s;
    var e;
    var to;
    var ti;
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
    _this4.effectsSequence = [_this4.getValueAtCurrentTime.bind(_this4)];
    _this4.keyframes = data.k;
    _this4.k = true;
    _this4.kf = true;
    _this4.mult = mult || 1;
    _this4.elem = elem;
    _this4.container = container;
    _this4.comp = elem.comp;
    _this4.getValue = _this4.processEffectsSequence;
    _this4.frameId = -1;
    var arrLen = data.k[0].s.length;
    _this4.v = createTypedArray('float32', arrLen);
    _this4.pv = createTypedArray('float32', arrLen);
    for (i = 0; i < arrLen; i += 1) {
      _this4.v[i] = initialDefaultFrame * _this4.mult;
      _this4.pv[i] = initialDefaultFrame;
    }
    _this4._caching = {
      lastFrame: initialDefaultFrame,
      lastIndex: 0,
      value: createTypedArray('float32', arrLen),
    };
    // this.addEffect = addEffect;

    _this4._hasOutTypeExpression = false;
    if (Expression.hasSupportExpression(data)) {
      _this4.expression = Expression.getExpression(data);
      _this4._hasOutTypeExpression = _this4.expression.type === 'out';
    }
    return _this4;
  }
  _inherits(KeyframedMultidimensionalProperty, _BaseProperty4);
  return _createClass(KeyframedMultidimensionalProperty);
})(BaseProperty);
/**
 * getProp by data
 * @private
 * @param {*} elem element node
 * @param {*} data property data
 * @param {*} type is multidimensional value or not
 * @param {*} mult data mult scale
 * @param {*} container value property container
 * @return {ValueProperty|MultiDimensionalProperty|KeyframedValueProperty|KeyframedMultidimensionalProperty}
 */
function getProp(elem, data, type, mult, container) {
  if (data.sid) {
    data = elem.globalData.slotManager.getProp(data);
  }
  var p;
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
var PropertyFactory = {
  getProp: getProp,
};

/**
 * transform property origin from tr or ks
 * @private
 */
var TransformFrames = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * constructor about transform property
   * @param {*} elem element node
   * @param {*} data multidimensional value property data
   */
  function TransformFrames(elem, data) {
    var _this;
    _classCallCheck(this, TransformFrames);
    _this = _callSuper(this, TransformFrames);
    _this.elem = elem;
    _this.frameId = -1;
    _this.propType = 'transform';
    _this.data = data;
    _this.autoOriented = false;
    _this.orientation = 0;
    // this.v = new Matrix();
    // // Precalculated matrix with non animated properties
    // this.pre = new Matrix();
    // this.appliedTransformations = 0;
    _this.initDynamicPropertyContainer(elem);
    if (data.p && data.p.s) {
      _this.px = PropertyFactory.getProp(elem, data.p.x, 0, 0, _this);
      _this.py = PropertyFactory.getProp(elem, data.p.y, 0, 0, _this);
      if (data.p.z) {
        _this.pz = PropertyFactory.getProp(elem, data.p.z, 0, 0, _this);
      }
    } else {
      _this.p = PropertyFactory.getProp(
        elem,
        data.p || {
          k: [0, 0, 0],
        },
        1,
        0,
        _this,
      );
    }
    if (data.rx) {
      _this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, _this);
      _this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, _this);
      _this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, _this);
      if (data.or.k[0].ti) {
        var i;
        var len = data.or.k.length;
        for (i = 0; i < len; i += 1) {
          data.or.k[i].to = data.or.k[i].ti = null;
        }
      }
      _this.or = PropertyFactory.getProp(elem, data.or, 1, degToRads, _this);
      // sh Indicates it needs to be capped between -180 and 180
      _this.or.sh = true;
    } else {
      _this.r = PropertyFactory.getProp(
        elem,
        data.r || {
          k: 0,
        },
        0,
        degToRads,
        _this,
      );
    }
    if (data.sk) {
      _this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, _this);
      _this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, _this);
    }
    _this.a = PropertyFactory.getProp(
      elem,
      data.a || {
        k: [0, 0, 0],
      },
      1,
      0,
      _this,
    );
    _this.s = PropertyFactory.getProp(
      elem,
      data.s || {
        k: [100, 100, 100],
      },
      1,
      0.01,
      _this,
    );
    if (data.o) {
      _this.o = PropertyFactory.getProp(elem, data.o, 0, 0.01, _this);
    } else {
      _this.o = {
        _mdf: false,
        v: 1,
      };
    }
    if (!_this.dynamicProperties.length) {
      _this.getValue(initialDefaultFrame, true);
    }
    return _this;
  }

  /**
   * get transform
   * @param {number} frameNum frameNum
   */
  _inherits(TransformFrames, _DynamicPropertyConta);
  return _createClass(TransformFrames, [
    {
      key: 'getValue',
      value: function getValue(frameNum) {
        this._mdf = false;
        if (frameNum === this.frameId) {
          return;
        }
        this.iterateDynamicProperties(frameNum);
        if (this.autoOriented && this._mdf) {
          this.updateOrientation();
        }
        this.frameId = frameNum;
      },

      /**
       *
       */
    },
    {
      key: 'updateOrientation',
      value: function updateOrientation() {
        var v1 = defaultVector;
        var v2 = defaultVector;
        var frameRate = this.elem.session.global.frameRate;
        if (this.p && this.p.keyframes && this.p.getValueAtTime) {
          if (this.p._caching.lastFrame <= this.p.keyframes[0].t) {
            v1 = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / frameRate, 0);
            v2 = this.p.getValueAtTime(this.p.keyframes[0].t / frameRate, 0);
          } else if (this.p._caching.lastFrame >= this.p.keyframes[this.p.keyframes.length - 1].t) {
            v1 = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t / frameRate, 0);
            v2 = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.05) / frameRate, 0);
          } else {
            v1 = this.p.pv;
            v2 = this.p.getValueAtTime((this.p._caching.lastFrame - 0.01) / frameRate, this.p.offsetTime);
          }
        } else if (
          this.px &&
          this.px.keyframes &&
          this.py.keyframes &&
          this.px.getValueAtTime &&
          this.py.getValueAtTime
        ) {
          v1 = [];
          v2 = [];
          var px = this.px;
          var py = this.py;
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
        }
        this.orientation = -Math.atan2(v1[1] - v2[1], v1[0] - v2[0]);
      },
    },
  ]);
})(DynamicPropertyContainer);

/**
 * a
 * @private
 * @return {*}
 */
function create$2() {
  return createTypedArray('float32', 2);
}
var PointPool = PoolFactory(8, create$2);

/**
 * a shape path
 * @private
 */
var ShapePath = /*#__PURE__*/ (function () {
  /**
   * shape path constructor
   */
  function ShapePath() {
    _classCallCheck(this, ShapePath);
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
  return _createClass(ShapePath, [
    {
      key: 'setPathData',
      value: function setPathData(closed, len) {
        this.c = closed;
        this.setLength(len);
        var i = 0;
        while (i < len) {
          this.v[i] = PointPool.newElement();
          this.o[i] = PointPool.newElement();
          this.i[i] = PointPool.newElement();
          i += 1;
        }
      },

      /**
       * set array pool size
       * @param {*} len array length
       */
    },
    {
      key: 'setLength',
      value: function setLength(len) {
        while (this._maxLength < len) {
          this.doubleArrayLength();
        }
        this._length = len;
      },

      /**
       * double array pool size
       */
    },
    {
      key: 'doubleArrayLength',
      value: function doubleArrayLength() {
        this.v = this.v.concat(createSizedArray(this._maxLength));
        this.i = this.i.concat(createSizedArray(this._maxLength));
        this.o = this.o.concat(createSizedArray(this._maxLength));
        this._maxLength *= 2;
      },

      /**
       * set x y to this.v | this.i | this.o
       * @param {*} x x component
       * @param {*} y y component
       * @param {*} type data type v | i | o
       * @param {*} pos data index
       * @param {*} replace need replace a new point
       */
    },
    {
      key: 'setXYAt',
      value: function setXYAt(x, y, type, pos, replace) {
        var arr;
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
      },

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
    },
    {
      key: 'setTripleAt',
      value: function setTripleAt(vX, vY, oX, oY, iX, iY, pos, replace) {
        this.setXYAt(vX, vY, 'v', pos, replace);
        this.setXYAt(oX, oY, 'o', pos, replace);
        this.setXYAt(iX, iY, 'i', pos, replace);
      },

      /**
       * reverse point
       * @return {*} renturn new shape path
       */
    },
    {
      key: 'reverse',
      value: function reverse() {
        var newPath = new ShapePath();
        newPath.setPathData(this.c, this._length);
        var vertices = this.v;
        var outPoints = this.o;
        var inPoints = this.i;
        var init = 0;
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
        var cnt = this._length - 1;
        var len = this._length;
        for (var i = init; i < len; i += 1) {
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
      },
    },
  ]);
})();

/**
 * a
 * @private
 * @return {*}
 */
function create$3() {
  return new ShapePath();
}

/**
 * a
 * FIXME: 这里可能不需要这么深度的做 release
 * @private
 * @param {*} shapePath a
 */
function release$1(shapePath) {
  var len = shapePath._length;
  for (var i = 0; i < len; i += 1) {
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
  var cloned = ShapePool.newElement();
  var len = shape._length === undefined ? shape.v.length : shape._length;
  cloned.setLength(len);
  cloned.c = shape.c;
  // var pt;

  for (var i = 0; i < len; i += 1) {
    cloned.setTripleAt(shape.v[i][0], shape.v[i][1], shape.o[i][0], shape.o[i][1], shape.i[i][0], shape.i[i][1], i);
  }
  return cloned;
}
var ShapePool = PoolFactory(4, create$3, release$1);
ShapePool.clone = clone;

/**
 * shape collection
 * @private
 */
var ShapeCollection = /*#__PURE__*/ (function () {
  /**
   * constructor shape collection
   */
  function ShapeCollection() {
    _classCallCheck(this, ShapeCollection);
    this._length = 0;
    this._maxLength = 4;
    this.shapes = createSizedArray(this._maxLength);
  }

  /**
   * add shape to collection
   * @param {*} shapeData shape data
   */
  return _createClass(ShapeCollection, [
    {
      key: 'addShape',
      value: function addShape(shapeData) {
        if (this._length === this._maxLength) {
          this.shapes = this.shapes.concat(createSizedArray(this._maxLength));
          this._maxLength *= 2;
        }
        this.shapes[this._length] = shapeData;
        this._length += 1;
      },

      /**
       * release shapes form shape pool
       */
    },
    {
      key: 'releaseShapes',
      value: function releaseShapes() {
        for (var i = 0; i < this._length; i += 1) {
          ShapePool.release(this.shapes[i]);
        }
        this._length = 0;
      },
    },
  ]);
})();

var _length = 0;
var _maxLength = 4;
var pool = createSizedArray(_maxLength);

/**
 * a
 * @private
 * @return {*}
 */
function newShapeCollection() {
  var shapeCollection;
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
function release$2(shapeCollection) {
  var len = shapeCollection._length;
  for (var i = 0; i < len; i += 1) {
    ShapePool.release(shapeCollection.shapes[i]);
  }
  shapeCollection._length = 0;
  if (_length === _maxLength) {
    pool = pooling['double'](pool);
    _maxLength = _maxLength * 2;
  }
  pool[_length] = shapeCollection;
  _length += 1;
}
var ShapeCollectionPool = {
  newShapeCollection: newShapeCollection,
  release: release$2,
};

// import { hasExpression, getExpression } from './Expression';
// const initFrame = -999999;
// const degToRads = Math.PI/180;

/**
 * basic shape property
 * @private
 */
var BaseShapeProperty = /*#__PURE__*/ (function () {
  function BaseShapeProperty() {
    _classCallCheck(this, BaseShapeProperty);
  }
  return _createClass(BaseShapeProperty, [
    {
      key: 'interpolateShape',
      value:
        /**
         * interpolate shape
         * @param {*} frameNum frame number
         * @param {*} previousValue previous value
         * @param {*} caching caching object
         */
        function interpolateShape(frameNum, previousValue, caching) {
          var iterationIndex = caching.lastIndex;
          var keyPropS;
          var keyPropE;
          var isHold;
          var j;
          var k;
          var jLen;
          var kLen;
          var perc;
          var vertexValue;
          var kf = this.keyframes;
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
            var i = iterationIndex;
            var len = kf.length - 1;
            var flag = true;
            var keyData;
            var nextKeyData;
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
                var fnc;
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
        },

      /**
       * interpolate shape with currentTime
       * @param {*} frameNum frame number
       * @return {*}
       */
    },
    {
      key: 'interpolateShapeCurrentTime',
      value: function interpolateShapeCurrentTime(frameNum) {
        var initTime = this.keyframes[0].t;
        var endTime = this.keyframes[this.keyframes.length - 1].t;
        var lastFrame = this._caching.lastFrame;
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
      },

      /**
       * reset shape
       */
    },
    {
      key: 'resetShape',
      value: function resetShape() {
        this.paths = this.localShapeCollection;
      },

      /**
       * is shapes is equal
       * @param {*} shape1 shape1
       * @param {*} shape2 shape2
       * @return {*}
       */
    },
    {
      key: 'shapesEqual',
      value: function shapesEqual(shape1, shape2) {
        if (shape1._length !== shape2._length || shape1.c !== shape2.c) {
          return false;
        }
        var i;
        var len = shape1._length;
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
      },

      /**
       * set new path to this.v
       * @param {*} newPath new path
       */
    },
    {
      key: 'setVValue',
      value: function setVValue(newPath) {
        if (!this.shapesEqual(this.v, newPath)) {
          this.v = ShapePool.clone(newPath);
          this.localShapeCollection.releaseShapes();
          this.localShapeCollection.addShape(this.v);
          this._mdf = true;
          this.paths = this.localShapeCollection;
        }
      },

      /**
       * process effects sequence
       * @param {*} frameNum frame number
       */
    },
    {
      key: 'processEffectsSequence',
      value: function processEffectsSequence(frameNum) {
        this._mdf = false;
        if (frameNum === this.frameId || !this.effectsSequence.length) {
          return;
        }
        var finalValue = this.kf ? this.pv : this.data.ks ? this.data.ks.k : this.data.pt.k;
        var i;
        var len = this.effectsSequence.length;
        for (i = 0; i < len; i += 1) {
          finalValue = this.effectsSequence[i](frameNum);
        }
        this.setVValue(finalValue);
        this.frameId = frameNum;
      },

      /**
       * add effect
       * @param {*} effectFunction effect funstion
       */
    },
    {
      key: 'addEffect',
      value: function addEffect(effectFunction) {
        this.effectsSequence.push(effectFunction);
        this.container.addDynamicProperty(this);
      },
    },
  ]);
})();
/**
 * shape property
 * @private
 */
var ShapeProperty = /*#__PURE__*/ (function (_BaseShapeProperty) {
  /**
   * constructor shape property
   * @param {*} elem element node
   * @param {*} data shape value property data
   * @param {*} type shape propType
   */
  function ShapeProperty(elem, data, type) {
    var _this;
    _classCallCheck(this, ShapeProperty);
    _this = _callSuper(this, ShapeProperty);
    _this.propType = 'shape';
    _this.comp = elem.comp;
    _this.container = elem;
    _this.elem = elem;
    _this.data = data;
    _this.k = false;
    _this.kf = false;
    _this._mdf = false;
    var pathData = type === 3 ? data.pt.k : data.ks.k;
    _this.v = ShapePool.clone(pathData);
    _this.pv = ShapePool.clone(_this.v);
    _this.localShapeCollection = ShapeCollectionPool.newShapeCollection();
    _this.paths = _this.localShapeCollection;
    _this.paths.addShape(_this.v);
    _this.reset = _this.resetShape;
    _this.effectsSequence = [];
    _this.getValue = _this.processEffectsSequence;
    return _this;
  }
  _inherits(ShapeProperty, _BaseShapeProperty);
  return _createClass(ShapeProperty);
})(BaseShapeProperty);
/**
 * keyframed shape property
 * @private
 */
var KeyframedShapeProperty = /*#__PURE__*/ (function (_BaseShapeProperty2) {
  /**
   * constructor keyframed shape property
   * @param {*} elem element node
   * @param {*} data shape value property data
   * @param {*} type shape propType
   */
  function KeyframedShapeProperty(elem, data, type) {
    var _this2;
    _classCallCheck(this, KeyframedShapeProperty);
    _this2 = _callSuper(this, KeyframedShapeProperty);
    _this2.propType = 'shape';
    _this2.comp = elem.comp;
    _this2.elem = elem;
    _this2.container = elem;
    // this.offsetTime = elem.data.st;
    _this2.keyframes = type === 3 ? data.pt.k : data.ks.k;
    _this2.k = true;
    _this2.kf = true;
    var len = _this2.keyframes[0].s[0].i.length;
    // let jLen = this.keyframes[0].s[0].i[0].length;
    _this2.v = ShapePool.newElement();
    _this2.v.setPathData(_this2.keyframes[0].s[0].c, len);
    _this2.pv = ShapePool.clone(_this2.v);
    _this2.localShapeCollection = ShapeCollectionPool.newShapeCollection();
    _this2.paths = _this2.localShapeCollection;
    _this2.paths.addShape(_this2.v);
    _this2.lastFrame = initialDefaultFrame;
    _this2.reset = _this2.resetShape;
    _this2._caching = {
      lastFrame: initialDefaultFrame,
      lastIndex: 0,
    };
    _this2.effectsSequence = [_this2.interpolateShapeCurrentTime.bind(_this2)];
    _this2.getValue = _this2.processEffectsSequence;
    _this2._hasOutTypeExpression = false;
    if (Expression.hasSupportExpression(data)) {
      _this2.expression = Expression.getExpression(data);
      _this2._hasOutTypeExpression = _this2.expression.type === 'out';
    }
    return _this2;
  }
  _inherits(KeyframedShapeProperty, _BaseShapeProperty2);
  return _createClass(KeyframedShapeProperty);
})(BaseShapeProperty);
/**
 * ellipse shape property
 * @private
 */
var EllShapeProperty = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * constructor ellipse shape property
   * @param {*} elem element node
   * @param {*} data shape value property data
   */
  function EllShapeProperty(elem, data) {
    var _this3;
    _classCallCheck(this, EllShapeProperty);
    _this3 = _callSuper(this, EllShapeProperty);
    // this.v = {
    //   v: createSizedArray(4),
    //   i: createSizedArray(4),
    //   o: createSizedArray(4),
    //   c: true
    // };
    _this3.v = ShapePool.newElement();
    _this3.v.setPathData(true, 4);
    _this3.localShapeCollection = ShapeCollectionPool.newShapeCollection();
    _this3.paths = _this3.localShapeCollection;
    _this3.localShapeCollection.addShape(_this3.v);
    _this3.d = data.d;
    _this3.elem = elem;
    _this3.comp = elem.comp;
    _this3.frameId = -1;
    _this3.initDynamicPropertyContainer(elem);
    _this3.p = PropertyFactory.getProp(elem, data.p, 1, 0, _this3);
    _this3.s = PropertyFactory.getProp(elem, data.s, 1, 0, _this3);
    if (_this3.dynamicProperties.length) {
      _this3.k = true;
    } else {
      _this3.k = false;
      _this3.convertEllToPath();
    }
    return _this3;
  }

  /**
   * reset shape
   */
  _inherits(EllShapeProperty, _DynamicPropertyConta);
  return _createClass(EllShapeProperty, [
    {
      key: 'reset',
      value: function reset() {
        this.paths = this.localShapeCollection;
      },

      /**
       * get point with frameId
       * @param {*} frameNum frame number
       */
    },
    {
      key: 'getValue',
      value: function getValue(frameNum) {
        this._mdf = false;
        if (frameNum === this.frameId) {
          return;
        }
        this.iterateDynamicProperties(frameNum);
        this.frameId = frameNum;
        if (this._mdf) {
          this.convertEllToPath();
        }
      },

      /**
       * convert ellipse to path
       */
    },
    {
      key: 'convertEllToPath',
      value: function convertEllToPath() {
        var p0 = this.p.v[0];
        var p1 = this.p.v[1];
        var s0 = this.s.v[0] / 2;
        var s1 = this.s.v[1] / 2;
        var _cw = this.d !== 3;
        var _v = this.v;
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
      },
    },
  ]);
})(DynamicPropertyContainer);
/**
 * star shape property
 * @private
 */
var StarShapeProperty = /*#__PURE__*/ (function (_DynamicPropertyConta2) {
  /**
   * constructor star shape property
   * @param {*} elem element node
   * @param {*} data shape value property data
   */
  function StarShapeProperty(elem, data) {
    var _this4;
    _classCallCheck(this, StarShapeProperty);
    _this4 = _callSuper(this, StarShapeProperty);
    _this4.v = ShapePool.newElement();
    _this4.v.setPathData(true, 0);
    _this4.elem = elem;
    _this4.comp = elem.comp;
    _this4.data = data;
    _this4.frameId = -1;
    _this4.d = data.d;
    _this4.initDynamicPropertyContainer(elem);
    if (data.sy === 1) {
      _this4.ir = PropertyFactory.getProp(elem, data.ir, 0, 0, _this4);
      _this4.is = PropertyFactory.getProp(elem, data.is, 0, 0.01, _this4);
      _this4.convertToPath = _this4.convertStarToPath;
    } else {
      _this4.convertToPath = _this4.convertPolygonToPath;
    }
    _this4.pt = PropertyFactory.getProp(elem, data.pt, 0, 0, _this4);
    _this4.p = PropertyFactory.getProp(elem, data.p, 1, 0, _this4);
    _this4.r = PropertyFactory.getProp(elem, data.r, 0, degToRads, _this4);
    _this4.or = PropertyFactory.getProp(elem, data.or, 0, 0, _this4);
    _this4.os = PropertyFactory.getProp(elem, data.os, 0, 0.01, _this4);
    _this4.localShapeCollection = ShapeCollectionPool.newShapeCollection();
    _this4.localShapeCollection.addShape(_this4.v);
    _this4.paths = _this4.localShapeCollection;
    if (_this4.dynamicProperties.length) {
      _this4.k = true;
    } else {
      _this4.k = false;
      _this4.convertToPath();
    }
    return _this4;
  }

  /**
   * reset shape
   */
  _inherits(StarShapeProperty, _DynamicPropertyConta2);
  return _createClass(StarShapeProperty, [
    {
      key: 'reset',
      value: function reset() {
        this.paths = this.localShapeCollection;
      },

      /**
       * get point with frameId
       * @param {*} frameNum frame number
       */
    },
    {
      key: 'getValue',
      value: function getValue(frameNum) {
        this._mdf = false;
        if (frameNum === this.frameId) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties(frameNum);
        if (this._mdf) {
          this.convertToPath();
        }
      },

      /**
       * convert star to path
       */
    },
    {
      key: 'convertStarToPath',
      value: function convertStarToPath() {
        var numPts = Math.floor(this.pt.v) * 2;
        var angle = (Math.PI * 2) / numPts;
        /* this.v.v.length = numPts;
              this.v.i.length = numPts;
              this.v.o.length = numPts;*/
        var longFlag = true;
        var longRad = this.or.v;
        var shortRad = this.ir.v;
        var longRound = this.os.v;
        var shortRound = this.is.v;
        var longPerimSegment = (2 * Math.PI * longRad) / (numPts * 2);
        var shortPerimSegment = (2 * Math.PI * shortRad) / (numPts * 2);
        var i;
        var rad;
        var roundness;
        var perimSegment;
        var currentAng = -Math.PI / 2;
        currentAng += this.r.v;
        var dir = this.data.d === 3 ? -1 : 1;
        this.v._length = 0;
        for (i = 0; i < numPts; i += 1) {
          rad = longFlag ? longRad : shortRad;
          roundness = longFlag ? longRound : shortRound;
          perimSegment = longFlag ? longPerimSegment : shortPerimSegment;
          var x = rad * Math.cos(currentAng);
          var y = rad * Math.sin(currentAng);
          var ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
          var oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
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
      },

      /**
       * convert polygon to path
       */
    },
    {
      key: 'convertPolygonToPath',
      value: function convertPolygonToPath() {
        var numPts = Math.floor(this.pt.v);
        var angle = (Math.PI * 2) / numPts;
        var rad = this.or.v;
        var roundness = this.os.v;
        var perimSegment = (2 * Math.PI * rad) / (numPts * 4);
        var i;
        var currentAng = -Math.PI / 2;
        var dir = this.data.d === 3 ? -1 : 1;
        currentAng += this.r.v;
        this.v._length = 0;
        for (i = 0; i < numPts; i += 1) {
          var x = rad * Math.cos(currentAng);
          var y = rad * Math.sin(currentAng);
          var ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
          var oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
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
      },
    },
  ]);
})(DynamicPropertyContainer);
var roundCorner = 0.5519;
var cPoint = roundCorner;

/**
 * rect shape property
 * @private
 */
var RectShapeProperty = /*#__PURE__*/ (function (_DynamicPropertyConta3) {
  /**
   * constructor rect shape property
   * @param {*} elem element node
   * @param {*} data shape value property data
   */
  function RectShapeProperty(elem, data) {
    var _this5;
    _classCallCheck(this, RectShapeProperty);
    _this5 = _callSuper(this, RectShapeProperty);
    _this5.v = ShapePool.newElement();
    _this5.v.c = true;
    _this5.localShapeCollection = ShapeCollectionPool.newShapeCollection();
    _this5.localShapeCollection.addShape(_this5.v);
    _this5.paths = _this5.localShapeCollection;
    _this5.elem = elem;
    _this5.comp = elem.comp;
    _this5.frameId = -1;
    _this5.d = data.d;
    _this5.initDynamicPropertyContainer(elem);
    _this5.p = PropertyFactory.getProp(elem, data.p, 1, 0, _this5);
    _this5.s = PropertyFactory.getProp(elem, data.s, 1, 0, _this5);
    _this5.r = PropertyFactory.getProp(elem, data.r, 0, 0, _this5);
    if (_this5.dynamicProperties.length) {
      _this5.k = true;
    } else {
      _this5.k = false;
      _this5.convertRectToPath();
    }
    return _this5;
  }

  /**
   * reset shape
   */
  _inherits(RectShapeProperty, _DynamicPropertyConta3);
  return _createClass(RectShapeProperty, [
    {
      key: 'reset',
      value: function reset() {
        this.paths = this.localShapeCollection;
      },

      /**
       * get point with frameId
       * @param {*} frameNum frame number
       */
    },
    {
      key: 'getValue',
      value: function getValue(frameNum) {
        this._mdf = false;
        if (frameNum === this.frameId) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties(frameNum);
        if (this._mdf) {
          this.convertRectToPath();
        }
      },

      /**
       * convert rect to path
       */
    },
    {
      key: 'convertRectToPath',
      value: function convertRectToPath() {
        var p0 = this.p.v[0];
        var p1 = this.p.v[1];
        var v0 = this.s.v[0] / 2;
        var v1 = this.s.v[1] / 2;
        var round = Math.min(v0, v1, this.r.v);
        var cPoint = round * (1 - roundCorner);
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
      },
    },
  ]);
})(DynamicPropertyContainer);
/**
 * get shape prop with data
 * @private
 * @param {*} elem element node
 * @param {*} data shape value property data
 * @param {*} type lottie shape type
 * @return {*}
 */
function getShapeProp(elem, data, type) {
  var prop;
  if (type === 3 || type === 4) {
    var dataProp = type === 3 ? data.pt : data.ks;
    var keys = dataProp.k;
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
var ShapePropertyFactory = {
  getShapeProp: getShapeProp,
  getConstructorFunction: getConstructorFunction,
  getKeyframedConstructorFunction: getKeyframedConstructorFunction,
};

/**
 * mask property origin from masksProperties
 * @private
 */
var MaskFrames = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * a
   * @param {*} elem a
   * @param {*} masksProperties a
   */
  function MaskFrames(elem, masksProperties) {
    var _this;
    _classCallCheck(this, MaskFrames);
    _this = _callSuper(this, MaskFrames);
    _this.elem = elem;
    _this.frameId = -1;
    _this.propType = 'mask';
    _this.masksProperties = masksProperties || [];
    _this.initDynamicPropertyContainer(elem);
    _this.viewData = createSizedArray(_this.masksProperties.length);
    var len = _this.masksProperties.length;
    var hasMasks = false;
    for (var i = 0; i < len; i++) {
      if (_this.masksProperties[i].mode !== 'n') {
        hasMasks = true;
      }
      _this.viewData[i] = ShapePropertyFactory.getShapeProp(_this, _this.masksProperties[i], 3);
      _this.viewData[i].inv = _this.masksProperties[i].inv;
    }
    _this.hasMasks = hasMasks;
    return _this;
  }

  /**
   * a
   * @param {number} frameNum frameNum
   */
  _inherits(MaskFrames, _DynamicPropertyConta);
  return _createClass(MaskFrames, [
    {
      key: 'getValue',
      value: function getValue(frameNum) {
        this._mdf = false;
        if (frameNum === this.frameId) {
          return;
        }
        this.iterateDynamicProperties(frameNum);
        this.frameId = frameNum;
      },
    },
  ]);
})(DynamicPropertyContainer);

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
 * @type {*} todo fix typescrit generating type.d.ts
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
      Math.round((x * _p[0] + y * _p[4] + _p[12]) * 100) / 100 +
      ',' +
      Math.round((x * _p[1] + y * _p[5] + _p[13]) * 100) / 100
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
var ShapeTransformManager = /*#__PURE__*/ (function () {
  /**
   * a
   */
  function ShapeTransformManager() {
    _classCallCheck(this, ShapeTransformManager);
    this.sequences = {};
    this.sequenceList = [];
    this.transform_key_count = 0;
  }

  /**
   * a
   * @param {*} transforms a
   * @return {*}
   */
  return _createClass(ShapeTransformManager, [
    {
      key: 'addTransformSequence',
      value: function addTransformSequence(transforms) {
        var len = transforms.length;
        var key = '_';
        for (var i = 0; i < len; i += 1) {
          key += transforms[i].transform.key + '_';
        }
        var sequence = this.sequences[key];
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
      },

      /**
       * a
       * @param {*} sequence a
       * @param {*} isFirstFrame a
       */
    },
    {
      key: 'processSequence',
      value: function processSequence(sequence, isFirstFrame) {
        var i = 0;
        var _mdf = isFirstFrame;
        var len = sequence.transforms.length;
        while (i < len && !isFirstFrame) {
          if (sequence.transforms[i].transform.mProps._mdf) {
            _mdf = true;
            break;
          }
          i += 1;
        }
        if (_mdf) {
          var props;
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
      },

      /**
       * a
       * @param {*} isFirstFrame a
       */
    },
    {
      key: 'processSequences',
      value: function processSequences(isFirstFrame) {
        var len = this.sequenceList.length;
        for (var i = 0; i < len; i += 1) {
          this.processSequence(this.sequenceList[i], isFirstFrame);
        }
      },

      /**
       * a
       * @return {*}
       */
    },
    {
      key: 'getNewKey',
      value: function getNewKey() {
        return '_' + this.transform_key_count++;
      },
    },
  ]);
})();

/**
 * ProcessedElement class
 * @private
 */
var ProcessedElement = /*#__PURE__*/ _createClass(
  /**
   * constructor processed elem
   * @param {*} elem
   * @param {*} position
   */
  function ProcessedElement(elem, position) {
    _classCallCheck(this, ProcessedElement);
    this.elem = elem;
    this.pos = position;
  },
);

/**
 * ShapeData class
 * @private
 */
var ShapeData = /*#__PURE__*/ (function () {
  /**
   * constructor ShapeData
   * @param {*} element a
   * @param {*} data a
   * @param {*} styles a
   * @param {*} transformsManager a
   */
  function ShapeData(element, data, styles, transformsManager) {
    _classCallCheck(this, ShapeData);
    this.styledShapes = [];
    this.tr = [0, 0, 0, 0, 0, 0];
    var ty = 4;
    if (data.ty == 'rc') {
      ty = 5;
    } else if (data.ty == 'el') {
      ty = 6;
    } else if (data.ty == 'sr') {
      ty = 7;
    }
    this.sh = ShapePropertyFactory.getShapeProp(element, data, ty);
    var len = styles.length;
    for (var i = 0; i < len; i += 1) {
      if (!styles[i].closed) {
        var styledShape = {
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
  return _createClass(ShapeData, [
    {
      key: 'setAsAnimated',
      value: function setAsAnimated() {
        this._isAnimated = true;
      },
    },
  ]);
})();

/**
 * a
 * @private
 */
var StyleElem = /*#__PURE__*/ _createClass(
  /**
   * constructor style element
   * @param {*} data item data
   * @param {*} transforms transforms array
   */
  function StyleElem(data, transforms) {
    _classCallCheck(this, StyleElem);
    this.data = data;
    this.type = data.ty;
    this.preTransforms = transforms;
    this.transforms = [];
    this.elements = [];
    this.closed = data.hd === true;
    this.co = null;
    this.lc = 'round';
    this.lj = 'round';
    this.ml = 0;
    this.wi = 0;
    this.da = null;
    this['do'] = 0;
    this.r = '';
  },
);

/**
 * transform property origin from tr
 * @private
 */
var TransformProperty = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * constructor about transform property
   * @param {*} elem element node
   * @param {*} data multidimensional value property data
   * @param {*} container value property container
   */
  function TransformProperty(elem, data, container) {
    var _this;
    _classCallCheck(this, TransformProperty);
    _this = _callSuper(this, TransformProperty);
    _this.elem = elem;
    _this.frameId = -1;
    _this.propType = 'transform';
    _this.data = data;
    _this.v = new Matrix();
    // Precalculated matrix with non animated properties
    _this.pre = new Matrix();
    _this.appliedTransformations = 0;
    _this.initDynamicPropertyContainer(container || elem);
    if (data.p && data.p.s) {
      _this.px = PropertyFactory.getProp(elem, data.p.x, 0, 0, _this);
      _this.py = PropertyFactory.getProp(elem, data.p.y, 0, 0, _this);
      if (data.p.z) {
        _this.pz = PropertyFactory.getProp(elem, data.p.z, 0, 0, _this);
      }
    } else {
      _this.p = PropertyFactory.getProp(
        elem,
        data.p || {
          k: [0, 0, 0],
        },
        1,
        0,
        _this,
      );
    }
    if (data.rx) {
      _this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, _this);
      _this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, _this);
      _this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, _this);
      if (data.or.k[0].ti) {
        var i;
        var len = data.or.k.length;
        for (i = 0; i < len; i += 1) {
          data.or.k[i].to = data.or.k[i].ti = null;
        }
      }
      _this.or = PropertyFactory.getProp(elem, data.or, 1, degToRads, _this);
      // sh Indicates it needs to be capped between -180 and 180
      _this.or.sh = true;
    } else {
      _this.r = PropertyFactory.getProp(
        elem,
        data.r || {
          k: 0,
        },
        0,
        degToRads,
        _this,
      );
    }
    if (data.sk) {
      _this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, _this);
      _this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, _this);
    }
    _this.a = PropertyFactory.getProp(
      elem,
      data.a || {
        k: [0, 0, 0],
      },
      1,
      0,
      _this,
    );
    _this.s = PropertyFactory.getProp(
      elem,
      data.s || {
        k: [100, 100, 100],
      },
      1,
      0.01,
      _this,
    );
    // Opacity is not part of the transform properties, that's why it won't use this.dynamicProperties. That way transforms won't get updated if opacity changes.
    if (data.o) {
      _this.o = PropertyFactory.getProp(elem, data.o, 0, 0.01, elem);
    } else {
      _this.o = {
        _mdf: false,
        v: 1,
      };
    }
    _this._isDirty = true;
    if (!_this.dynamicProperties.length) {
      _this.getValue(initialDefaultFrame, true);
    }
    return _this;
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
  _inherits(TransformProperty, _DynamicPropertyConta);
  return _createClass(TransformProperty, [
    {
      key: 'getValue',
      value: function getValue(frameNum, forceRender) {
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
      },

      /**
       * pre calculate matrix for performance
       */
    },
    {
      key: 'precalculateMatrix',
      value: function precalculateMatrix() {
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
      },

      /**
       * apply a matrix
       * @param {*} mat matrix
       */
    },
    {
      key: 'applyToMatrix',
      value: function applyToMatrix(mat) {
        var _mdf = this._mdf;
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
      },
    },
  ]);
})(DynamicPropertyContainer);

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
var ShapeModifier = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  function ShapeModifier() {
    _classCallCheck(this, ShapeModifier);
    return _callSuper(this, ShapeModifier, arguments);
  }
  _inherits(ShapeModifier, _DynamicPropertyConta);
  return _createClass(ShapeModifier, [
    {
      key: 'initModifierProperties',
      value:
        /**
         * a
         */
        function initModifierProperties() {},

      /**
       * a
       */
    },
    {
      key: 'addShapeToModifier',
      value: function addShapeToModifier() {},

      /**
       * a
       * @param {*} data a
       */
    },
    {
      key: 'addShape',
      value: function addShape(data) {
        if (!this.closed) {
          // Adding shape to dynamic properties. It covers the case where a shape has no effects applied, to reset it's _mdf state on every tick.
          data.sh.container.addDynamicProperty(data.sh);
          var shapeData = {
            shape: data.sh,
            data: data,
            localShapeCollection: ShapeCollectionPool.newShapeCollection(),
          };
          this.shapes.push(shapeData);
          this.addShapeToModifier(shapeData);
          if (this._isAnimated) {
            data.setAsAnimated();
          }
        }
      },

      /**
       * a
       * @param {*} elem a
       * @param {*} data a
       */
    },
    {
      key: 'init',
      value: function init(elem, data) {
        this.shapes = [];
        this.elem = elem;
        this.initDynamicPropertyContainer(elem);
        this.initModifierProperties(elem, data);
        this.frameId = -1;
        this.closed = false;
        this.k = false;
        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.getValue(true);
        }
      },

      /**
       * process keys
       * @param {number} frameNum frameNum
       */
    },
    {
      key: 'processKeys',
      value: function processKeys(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties(frameNum);
      },
    },
  ]);
})(DynamicPropertyContainer);

/**
 * TrimModifier class
 * @private
 */
var TrimModifier = /*#__PURE__*/ (function (_ShapeModifier) {
  function TrimModifier() {
    _classCallCheck(this, TrimModifier);
    return _callSuper(this, TrimModifier, arguments);
  }
  _inherits(TrimModifier, _ShapeModifier);
  return _createClass(TrimModifier, [
    {
      key: 'initModifierProperties',
      value:
        /**
         * init modifier properties
         * @param {*} elem element node
         * @param {*} data trim value property data
         */
        function initModifierProperties(elem, data) {
          this.s = PropertyFactory.getProp(elem, data.s, 0, 0.01, this);
          this.e = PropertyFactory.getProp(elem, data.e, 0, 0.01, this);
          this.o = PropertyFactory.getProp(elem, data.o, 0, 0, this);
          this.sValue = 0;
          this.eValue = 0;
          this.getValue = this.processKeys;
          this.m = data.m;
          this._isAnimated =
            !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
        },

      /**
       * add shape to modifier
       * @param {*} shapeData shape data
       */
    },
    {
      key: 'addShapeToModifier',
      value: function addShapeToModifier(shapeData) {
        shapeData.pathsData = [];
      },

      /**
       * calculate shape edges
       * @param {*} s trim start
       * @param {*} e trim end
       * @param {*} shapeLength shape length
       * @param {*} addedLength added length
       * @param {*} totalModifierLength total modifier length
       * @return {*}
       */
    },
    {
      key: 'calculateShapeEdges',
      value: function calculateShapeEdges(s, e, shapeLength, addedLength, totalModifierLength) {
        var segments = [];
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
        var shapeSegments = [];
        var i;
        var len = segments.length;
        var segmentOb;
        for (i = 0; i < len; i += 1) {
          segmentOb = segments[i];
          if (
            segmentOb.e * totalModifierLength < addedLength ||
            segmentOb.s * totalModifierLength > addedLength + shapeLength
          );
          else {
            var shapeS = void 0;
            var shapeE = void 0;
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
      },

      /**
       * release paths data
       * @param {*} pathsData paths data
       * @return {*}
       */
    },
    {
      key: 'releasePathsData',
      value: function releasePathsData(pathsData) {
        var len = pathsData.length;
        for (var i = 0; i < len; i += 1) {
          SegmentsLengthPool.release(pathsData[i]);
        }
        pathsData.length = 0;
        return pathsData;
      },

      /**
       * a
       * @param {*} _isFirstFrame a
       */
    },
    {
      key: 'processShapes',
      value: function processShapes(_isFirstFrame) {
        var s;
        var e;
        if (this._mdf || _isFirstFrame) {
          var o = (this.o.v % 360) / 360;
          if (o < 0) {
            o += 1;
          }
          s = (this.s.v > 1 ? 1 : this.s.v < 0 ? 0 : this.s.v) + o;
          e = (this.e.v > 1 ? 1 : this.e.v < 0 ? 0 : this.e.v) + o;
          if (s > e) {
            var _s = s;
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
        var shapePaths;
        var i;
        var len = this.shapes.length;
        var j;
        var jLen;
        var pathsData;
        var pathData;
        var totalShapeLength;
        var totalModifierLength = 0;
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
          var segments = [];
          var shapeData;
          var localShapeCollection;
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
          var shapeS = s;
          var shapeE = e;
          var addedLength = 0;
          var edges;
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
                var newShapesData = this.addShapes(shapeData, segments[0]);
                if (segments[0].s !== segments[0].e) {
                  if (segments.length > 1) {
                    var lastShapeInCollection = shapeData.shape.paths.shapes[shapeData.shape.paths._length - 1];
                    if (lastShapeInCollection.c) {
                      var lastShape = newShapesData.pop();
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
      },

      /**
       * add paths
       * @param {*} newPaths new paths
       * @param {*} localShapeCollection local shape collection
       */
    },
    {
      key: 'addPaths',
      value: function addPaths(newPaths, localShapeCollection) {
        var len = newPaths.length;
        for (var i = 0; i < len; i += 1) {
          localShapeCollection.addShape(newPaths[i]);
        }
      },

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
    },
    {
      key: 'addSegment',
      value: function addSegment(pt1, pt2, pt3, pt4, shapePath, pos, newShape) {
        shapePath.setXYAt(pt2[0], pt2[1], 'o', pos);
        shapePath.setXYAt(pt3[0], pt3[1], 'i', pos + 1);
        if (newShape) {
          shapePath.setXYAt(pt1[0], pt1[1], 'v', pos);
        }
        shapePath.setXYAt(pt4[0], pt4[1], 'v', pos + 1);
      },

      /**
       * add segment from points array
       * @param {*} points points
       * @param {*} shapePath target shape path
       * @param {*} pos data index
       * @param {*} newShape is new shape ?
       */
    },
    {
      key: 'addSegmentFromArray',
      value: function addSegmentFromArray(points, shapePath, pos, newShape) {
        shapePath.setXYAt(points[1], points[5], 'o', pos);
        shapePath.setXYAt(points[2], points[6], 'i', pos + 1);
        if (newShape) {
          shapePath.setXYAt(points[0], points[4], 'v', pos);
        }
        shapePath.setXYAt(points[3], points[7], 'v', pos + 1);
      },

      /**
       * add shapes to this modifier
       * @param {*} shapeData shape data
       * @param {*} shapeSegment shape segment
       * @param {*} shapePath shape path
       * @return {*}
       */
    },
    {
      key: 'addShapes',
      value: function addShapes(shapeData, shapeSegment, shapePath) {
        var pathsData = shapeData.pathsData;
        var shapePaths = shapeData.shape.paths.shapes;
        var i;
        var len = shapeData.shape.paths._length;
        var j;
        var jLen;
        var addedLength = 0;
        var currentLengthData;
        var segmentCount;
        var lengths;
        var segment;
        var shapes = [];
        var initPos;
        var newShape = true;
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
              var segmentLength = lengths[j - 1].addedLength;
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
      },
    },
  ]);
})(ShapeModifier);

var roundCorner$1 = 0.5519;

/**
 * a
 * @private
 */
var RoundCornersModifier = /*#__PURE__*/ (function (_ShapeModifier) {
  function RoundCornersModifier() {
    _classCallCheck(this, RoundCornersModifier);
    return _callSuper(this, RoundCornersModifier, arguments);
  }
  _inherits(RoundCornersModifier, _ShapeModifier);
  return _createClass(RoundCornersModifier, [
    {
      key: 'initModifierProperties',
      value:
        /**
         * init modifier properties
         * @param {*} elem element node
         * @param {*} data round corners value property data
         */
        function initModifierProperties(elem, data) {
          this.getValue = this.processKeys;
          this.rd = PropertyFactory.getProp(elem, data.r, 0, null, this);
          this._isAnimated = !!this.rd.effectsSequence.length;
        },

      /**
       * process path
       * @param {*} path path
       * @param {*} round round
       * @return {*}
       */
    },
    {
      key: 'processPath',
      value: function processPath(path, round) {
        var clonedPath = ShapePool.newElement();
        clonedPath.c = path.c;
        var i;
        var len = path._length;
        var currentV;
        var currentI;
        var currentO;
        var closerV;
        // let newV;
        // let newO;
        // let newI;
        var distance;
        var newPosPerc;
        var index = 0;
        var vX;
        var vY;
        var oX;
        var oY;
        var iX;
        var iY;
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
              clonedPath.setTripleAt(
                currentV[0],
                currentV[1],
                currentO[0],
                currentO[1],
                currentI[0],
                currentI[1],
                index,
              );
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
            clonedPath.setTripleAt(
              path.v[i][0],
              path.v[i][1],
              path.o[i][0],
              path.o[i][1],
              path.i[i][0],
              path.i[i][1],
              index,
            );
            index += 1;
          }
        }
        return clonedPath;
      },

      /**
       * process shapes
       * @param {*} _isFirstFrame is first frame
       */
    },
    {
      key: 'processShapes',
      value: function processShapes(_isFirstFrame) {
        var shapePaths;
        var i;
        var len = this.shapes.length;
        var j;
        var jLen;
        var rd = this.rd.v;
        if (rd !== 0) {
          var shapeData;
          // let newPaths;
          var localShapeCollection;
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
      },
    },
  ]);
})(ShapeModifier);

/**
 * a
 * @private
 */
var RepeaterModifier = /*#__PURE__*/ (function (_ShapeModifier) {
  function RepeaterModifier() {
    _classCallCheck(this, RepeaterModifier);
    return _callSuper(this, RepeaterModifier, arguments);
  }
  _inherits(RepeaterModifier, _ShapeModifier);
  return _createClass(RepeaterModifier, [
    {
      key: 'initModifierProperties',
      value:
        /**
         * a
         * @param {*} elem a
         * @param {*} data a
         */
        function initModifierProperties(elem, data) {
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
        },

      /**
       * a
       * @param {*} pMatrix a
       * @param {*} rMatrix a
       * @param {*} sMatrix a
       * @param {*} transform a
       * @param {*} perc a
       * @param {*} inv a
       */
    },
    {
      key: 'applyTransforms',
      value: function applyTransforms(pMatrix, rMatrix, sMatrix, transform, perc, inv) {
        var dir = inv ? -1 : 1;
        var scaleX = transform.s.v[0] + (1 - transform.s.v[0]) * (1 - perc);
        var scaleY = transform.s.v[1] + (1 - transform.s.v[1]) * (1 - perc);
        pMatrix.translate(transform.p.v[0] * dir * perc, transform.p.v[1] * dir * perc, transform.p.v[2]);
        rMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
        rMatrix.rotate(-transform.r.v * dir * perc);
        rMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
        sMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
        sMatrix.scale(inv ? 1 / scaleX : scaleX, inv ? 1 / scaleY : scaleY);
        sMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
      },

      /**
       * a
       * @param {*} elem a
       * @param {*} arr a
       * @param {*} pos a
       * @param {*} elemsData a
       */
    },
    {
      key: 'init',
      value: function init(elem, arr, pos, elemsData) {
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
      },

      /**
       * a
       * @param {*} elements a
       */
    },
    {
      key: 'resetElements',
      value: function resetElements(elements) {
        var len = elements.length;
        for (var i = 0; i < len; i += 1) {
          elements[i]._processed = false;
          if (elements[i].ty === 'gr') {
            this.resetElements(elements[i].it);
          }
        }
      },

      /**
       * a
       * @param {*} elements a
       * @return {*}
       */
    },
    {
      key: 'cloneElements',
      value: function cloneElements(elements) {
        var newElements = JSON.parse(JSON.stringify(elements));
        this.resetElements(newElements);
        return newElements;
      },

      /**
       * a
       * @param {*} elements a
       * @param {*} renderFlag a
       */
    },
    {
      key: 'changeGroupRender',
      value: function changeGroupRender(elements, renderFlag) {
        var len = elements.length;
        for (var i = 0; i < len; i += 1) {
          elements[i]._render = renderFlag;
          if (elements[i].ty === 'gr') {
            this.changeGroupRender(elements[i].it, renderFlag);
          }
        }
      },

      /**
       * a
       * @param {*} _isFirstFrame a
       */
    },
    {
      key: 'processShapes',
      value: function processShapes(_isFirstFrame) {
        // let items, itemsTransform, i, dir, cont;
        if (this._mdf || _isFirstFrame) {
          var copies = Math.ceil(this.c.v);
          if (this._groups.length < copies) {
            while (this._groups.length < copies) {
              var group = {
                it: this.cloneElements(this._elements),
                ty: 'gr',
              };
              group.it.push({
                a: {
                  a: 0,
                  ix: 1,
                  k: [0, 0],
                },
                nm: 'Transform',
                o: {
                  a: 0,
                  ix: 7,
                  k: 100,
                },
                p: {
                  a: 0,
                  ix: 2,
                  k: [0, 0],
                },
                r: {
                  a: 1,
                  ix: 6,
                  k: [
                    {
                      s: 0,
                      e: 0,
                      t: 0,
                    },
                    {
                      s: 0,
                      e: 0,
                      t: 1,
                    },
                  ],
                },
                s: {
                  a: 0,
                  ix: 3,
                  k: [100, 100],
                },
                sa: {
                  a: 0,
                  ix: 5,
                  k: 0,
                },
                sk: {
                  a: 0,
                  ix: 4,
                  k: 0,
                },
                ty: 'tr',
              });
              this.arr.splice(0, 0, group);
              this._groups.splice(0, 0, group);
              this._currentCopies += 1;
            }
            this.elem.reloadShapes();
          }
          var cont = 0;
          var i;
          var renderFlag;
          for (i = 0; i <= this._groups.length - 1; i += 1) {
            renderFlag = cont < copies;
            this._groups[i]._render = renderFlag;
            this.changeGroupRender(this._groups[i].it, renderFlag);
            cont += 1;
          }
          this._currentCopies = copies;
          // //

          var offset = this.o.v;
          var offsetModulo = offset % 1;
          var roundOffset = offset > 0 ? Math.floor(offset) : Math.ceil(offset);
          // let k;
          // let tMat = this.tr.v.props;
          var pProps = this.pMatrix.props;
          var rProps = this.rMatrix.props;
          var sProps = this.sMatrix.props;
          this.pMatrix.reset();
          this.rMatrix.reset();
          this.sMatrix.reset();
          this.tMatrix.reset();
          this.matrix.reset();
          var iteration = 0;
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
          var dir = this.data.m === 1 ? 1 : -1;
          cont = this._currentCopies;
          while (cont) {
            var items = this.elemsData[i].it;
            var itemsTransform = items[items.length - 1].transform.mProps.v.props;
            var jLen = itemsTransform.length;
            items[items.length - 1].transform.mProps._mdf = true;
            items[items.length - 1].transform.op._mdf = true;
            items[items.length - 1].transform.op.v =
              this.so.v + (this.eo.v - this.so.v) * (i / (this._currentCopies - 1));
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
              for (var j = 0; j < jLen; j += 1) {
                itemsTransform[j] = this.matrix.props[j];
              }
              this.matrix.reset();
            } else {
              this.matrix.reset();
              for (var _j = 0; _j < jLen; _j += 1) {
                itemsTransform[_j] = this.matrix.props[_j];
              }
            }
            iteration += 1;
            cont -= 1;
            i += dir;
          }
        } else {
          var _cont = this._currentCopies;
          var _i = 0;
          var _dir = 1;
          while (_cont) {
            var _items = this.elemsData[_i].it;
            // const itemsTransform = items[items.length - 1].transform.mProps.v.props;
            _items[_items.length - 1].transform.mProps._mdf = false;
            _items[_items.length - 1].transform.op._mdf = false;
            _cont -= 1;
            _i += _dir;
          }
        }
      },

      /**
       * a
       */
    },
    {
      key: 'addShape',
      value: function addShape() {},
    },
  ]);
})(ShapeModifier);

/**
 * MouseModifier class
 * @private
 */
var MouseModifier = /*#__PURE__*/ (function (_ShapeModifier) {
  function MouseModifier() {
    _classCallCheck(this, MouseModifier);
    return _callSuper(this, MouseModifier, arguments);
  }
  _inherits(MouseModifier, _ShapeModifier);
  return _createClass(MouseModifier, [
    {
      key: 'initModifierProperties',
      value:
        /**
         * init modifier properties
         * @param {*} elem element node
         * @param {*} data mouse value property data
         */
        function initModifierProperties(elem, data) {
          this.getValue = this.processKeys;
          this.data = data;
          this.positions = [];
        },

      /**
       * process keys
       * @param {number} frameNum frameNum
       * @param {*} forceRender force render
       */
    },
    {
      key: 'processKeys',
      value: function processKeys(frameNum, forceRender) {
        if (frameNum === this.frameId && !forceRender) {
          return;
        }
        this._mdf = true;
      },

      /**
       * add shape to modifier
       */
    },
    {
      key: 'addShapeToModifier',
      value: function addShapeToModifier() {
        this.positions.push([]);
      },

      /**
       * a
       * @param {*} path a
       * @param {*} mouseCoords a
       * @param {*} positions a
       * @return {*}
       */
    },
    {
      key: 'processPath',
      value: function processPath(path, mouseCoords, positions) {
        var i;
        var len = path.v.length;
        var vValues = [];
        var oValues = [];
        var iValues = [];
        // let dist;
        var theta;
        var x;
        var y;
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
          var distance = Math.sqrt(x * x + y * y);
          positions.distV[i] += (distance - positions.distV[i]) * this.data.dc;
          positions.v[i][0] =
            (Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distV[i])) / 2 + path.v[i][0];
          positions.v[i][1] =
            (Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distV[i])) / 2 + path.v[i][1];
          theta = Math.atan2(path.o[i][1] - mouseCoords[1], path.o[i][0] - mouseCoords[0]);
          x = mouseCoords[0] - positions.o[i][0];
          y = mouseCoords[1] - positions.o[i][1];
          distance = Math.sqrt(x * x + y * y);
          positions.distO[i] += (distance - positions.distO[i]) * this.data.dc;
          positions.o[i][0] =
            (Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distO[i])) / 2 + path.o[i][0];
          positions.o[i][1] =
            (Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distO[i])) / 2 + path.o[i][1];
          theta = Math.atan2(path.i[i][1] - mouseCoords[1], path.i[i][0] - mouseCoords[0]);
          x = mouseCoords[0] - positions.i[i][0];
          y = mouseCoords[1] - positions.i[i][1];
          distance = Math.sqrt(x * x + y * y);
          positions.distI[i] += (distance - positions.distI[i]) * this.data.dc;
          positions.i[i][0] =
            (Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distI[i])) / 2 + path.i[i][0];
          positions.i[i][1] =
            (Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distI[i])) / 2 + path.i[i][1];

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
      },

      /**
       * process shapes
       */
    },
    {
      key: 'processShapes',
      value: function processShapes() {
        // FIXME: mouse modifier data
        var mouseX = this.elem.globalData.mouseX;
        var mouseY = this.elem.globalData.mouseY;
        var shapePaths;
        var i;
        var len = this.shapes.length;
        var j;
        var jLen;
        if (mouseX) {
          var localMouseCoords = this.elem.globalToLocal([mouseX, mouseY, 0]);
          var shapeData;
          var newPaths = [];
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
      },
    },
  ]);
})(ShapeModifier);

/**
 * a
 * @private
 */
var PuckerAndBloatModifier = /*#__PURE__*/ (function (_ShapeModifier) {
  function PuckerAndBloatModifier() {
    _classCallCheck(this, PuckerAndBloatModifier);
    return _callSuper(this, PuckerAndBloatModifier, arguments);
  }
  _inherits(PuckerAndBloatModifier, _ShapeModifier);
  return _createClass(PuckerAndBloatModifier, [
    {
      key: 'initModifierProperties',
      value:
        /**
         * init
         * @param {*} elem elem
         * @param {*} data data
         */
        function initModifierProperties(elem, data) {
          this.getValue = this.processKeys;
          this.amount = PropertyFactory.getProp(elem, data.a, 0, null, this);
          this._isAnimated = !!this.amount.effectsSequence.length;
        },

      /**
       * process path
       * @param {*} path path
       * @param {*} amount amount
       * @return {shape}
       */
    },
    {
      key: 'processPath',
      value: function processPath(path, amount) {
        var percent = amount / 100;
        var centerPoint = [0, 0];
        var pathLength = path._length;
        var i = 0;
        for (i = 0; i < pathLength; i += 1) {
          centerPoint[0] += path.v[i][0];
          centerPoint[1] += path.v[i][1];
        }
        centerPoint[0] /= pathLength;
        centerPoint[1] /= pathLength;
        var clonedPath = ShapePool.newElement();
        clonedPath.c = path.c;
        var vX;
        var vY;
        var oX;
        var oY;
        var iX;
        var iY;
        for (i = 0; i < pathLength; i += 1) {
          vX = path.v[i][0] + (centerPoint[0] - path.v[i][0]) * percent;
          vY = path.v[i][1] + (centerPoint[1] - path.v[i][1]) * percent;
          oX = path.o[i][0] + (centerPoint[0] - path.o[i][0]) * -percent;
          oY = path.o[i][1] + (centerPoint[1] - path.o[i][1]) * -percent;
          iX = path.i[i][0] + (centerPoint[0] - path.i[i][0]) * -percent;
          iY = path.i[i][1] + (centerPoint[1] - path.i[i][1]) * -percent;
          clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, i);
        }
        return clonedPath;
      },

      /**
       * processShapes
       * @param {*} _isFirstFrame is init frame
       */
    },
    {
      key: 'processShapes',
      value: function processShapes(_isFirstFrame) {
        var shapePaths;
        var i;
        var len = this.shapes.length;
        var j;
        var jLen;
        var amount = this.amount.v;
        if (amount !== 0) {
          var shapeData;
          // let newPaths;
          var localShapeCollection;
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
                localShapeCollection.addShape(this.processPath(shapePaths[j], amount));
              }
            }
            shapeData.shape.paths = shapeData.localShapeCollection;
          }
        }
        if (!this.dynamicProperties.length) {
          this._mdf = false;
        }
      },
    },
  ]);
})(ShapeModifier);

var modifiers = {};

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
registerModifier('pb', PuckerAndBloatModifier);
var ShapeModifiers = {
  getModifier: getModifier,
};

/**
 * a
 * @private
 */
var DashProperty = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * a
   * @param {*} elem a
   * @param {*} data a
   * @param {*} container a
   */
  function DashProperty(elem, data, container) {
    var _this;
    _classCallCheck(this, DashProperty);
    _this = _callSuper(this, DashProperty);
    _this.elem = elem;
    _this.frameId = -1;
    _this.dataProps = createSizedArray(data.length);
    // this.renderer = renderer;
    _this.k = false;
    // this.dashStr = '';
    _this.dashArray = createTypedArray('float32', data.length ? data.length - 1 : 0);
    _this.dashoffset = createTypedArray('float32', 1);
    _this.initDynamicPropertyContainer(container);
    var i;
    var len = data.length || 0;
    var prop;
    for (i = 0; i < len; i += 1) {
      prop = PropertyFactory.getProp(elem, data[i].v, 0, 0, _this);
      _this.k = prop.k || _this.k;
      _this.dataProps[i] = {
        n: data[i].n,
        p: prop,
      };
    }
    if (!_this.k) {
      _this.getValue(true);
    }
    _this._isAnimated = _this.k;
    return _this;
  }

  /**
   * a
   * @param {number} frameNum frameNum
   * @param {*} forceRender a
   */
  _inherits(DashProperty, _DynamicPropertyConta);
  return _createClass(DashProperty, [
    {
      key: 'getValue',
      value: function getValue(frameNum, forceRender) {
        if (frameNum === this.frameId && !forceRender) {
          return;
        }
        this.frameId = frameNum;
        this.iterateDynamicProperties(frameNum);
        this._mdf = this._mdf || forceRender;
        if (this._mdf) {
          var i = 0;
          var len = this.dataProps.length;
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
      },
    },
  ]);
})(DynamicPropertyContainer);

/**
 * GradientProperty class
 * @private
 */
var GradientProperty = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * constructor GradientProperty
   * @param {*} elem element node
   * @param {*} data gradient property data
   * @param {*} container container
   */
  function GradientProperty(elem, data, container) {
    var _this;
    _classCallCheck(this, GradientProperty);
    _this = _callSuper(this, GradientProperty);
    _this.data = data;
    _this.c = createTypedArray('uint8c', data.p * 4);
    var cLength = data.k.k[0].s ? data.k.k[0].s.length - data.p * 4 : data.k.k.length - data.p * 4;
    _this.o = createTypedArray('float32', cLength);
    _this._cmdf = false;
    _this._omdf = false;
    _this._collapsable = _this.checkCollapsable();
    _this._hasOpacity = cLength;
    _this.initDynamicPropertyContainer(container);
    _this.prop = PropertyFactory.getProp(elem, data.k, 1, null, _this);
    _this.k = _this.prop.k;
    _this.getValue(true);
    return _this;
  }

  /**
   * compare points
   * @param {*} values values
   * @param {*} points points
   * @return {*}
   */
  _inherits(GradientProperty, _DynamicPropertyConta);
  return _createClass(GradientProperty, [
    {
      key: 'comparePoints',
      value: function comparePoints(values, points) {
        var i = 0;
        var len = this.o.length / 2;
        var diff;
        while (i < len) {
          diff = Math.abs(values[i * 4] - values[points * 4 + i * 2]);
          if (diff > 0.01) {
            return false;
          }
          i += 1;
        }
        return true;
      },

      /**
       * check collapsable
       * @return {*}
       */
    },
    {
      key: 'checkCollapsable',
      value: function checkCollapsable() {
        if (this.o.length / 2 !== this.c.length / 4) {
          return false;
        }
        if (this.data.k.k[0].s) {
          var i = 0;
          var len = this.data.k.k.length;
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
      },

      /**
       * get value
       * @param {*} forceRender a
       */
    },
    {
      key: 'getValue',
      value: function getValue(forceRender) {
        this.prop.getValue();
        this._mdf = false;
        this._cmdf = false;
        this._omdf = false;
        if (this.prop._mdf || forceRender) {
          var i;
          var len = this.data.p * 4;
          var mult;
          var val;
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
      },
    },
  ]);
})(DynamicPropertyContainer);

/**
 * ShapesFrames class
 * @private
 */
var ShapesFrames = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * a
   * @param {*} elem a
   * @param {*} shapes a
   */
  function ShapesFrames(elem, shapes) {
    var _this;
    _classCallCheck(this, ShapesFrames);
    _this = _callSuper(this, ShapesFrames);
    _this.elem = elem;
    _this.frameId = -1;
    _this.propType = 'shapes';
    _this.session = elem.session; // cache session for TransformProperty
    _this.shapes = [];
    _this.shapesData = shapes;
    _this.stylesList = [];
    _this.itemsData = [];
    _this.prevViewData = [];
    _this.shapeModifiers = [];
    _this.processedElements = [];
    _this.transformsManager = new ShapeTransformManager();
    _this.initDynamicPropertyContainer(elem);
    _this.lcEnum = {
      1: 'butt',
      2: 'round',
      3: 'square',
    };
    _this.ljEnum = {
      1: 'miter',
      2: 'round',
      3: 'bevel',
    };

    // set to true when inpoint is rendered
    _this._isFirstFrame = true;
    _this.transformHelper = {
      opacity: 1,
      _opMdf: false,
    };
    _this.searchShapes(_this.shapesData, _this.itemsData, _this.prevViewData, true, []);

    // NOTICE: 这个处理估计不需要了
    if (!_this._isAnimated) {
      _this.transformHelper.opacity = 1;
      _this.transformHelper._opMdf = false;
      _this.updateModifiers();
      _this.transformsManager.processSequences(_this._isFirstFrame);
      _this.updateShape(_this.transformHelper, _this.shapesData, _this.itemsData);

      // this.updateGrahpics();
    }
    return _this;
  }

  /**
   * create style element
   * @param {*} data style item data
   * @param {*} transforms transforms array
   * @return {*}
   */
  _inherits(ShapesFrames, _DynamicPropertyConta);
  return _createClass(ShapesFrames, [
    {
      key: 'createStyleElement',
      value: function createStyleElement(data, transforms) {
        // let styleElem = {
        //   data: data,
        //   type: data.ty,
        //   preTransforms: this.transformsManager.addTransformSequence(transforms),
        //   transforms: [],
        //   elements: [],
        //   closed: data.hd === true,
        // };
        var styleElem = new StyleElem(data, this.transformsManager.addTransformSequence(transforms));
        var elementData = {};
        if (data.ty == 'fl' || data.ty == 'st') {
          elementData.c = PropertyFactory.getProp(this, data.c, 1, 255, this);
          if (!elementData.c.k) {
            styleElem.co = elementData.c.v; // 'rgb('+bm_floor(elementData.c.v[0])+','+bm_floor(elementData.c.v[1])+','+bm_floor(elementData.c.v[2])+')';
          }
        } else if (data.ty === 'gf' || data.ty === 'gs') {
          elementData.s = PropertyFactory.getProp(this, data.s, 1, null, this);
          elementData.e = PropertyFactory.getProp(this, data.e, 1, null, this);
          elementData.h = PropertyFactory.getProp(
            this,
            data.h || {
              k: 0,
            },
            0,
            0.01,
            this,
          );
          elementData.a = PropertyFactory.getProp(
            this,
            data.a || {
              k: 0,
            },
            0,
            degToRads,
            this,
          );
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
            // if not keyframed
            styleElem.wi = elementData.w.v;
          }
          if (data.d) {
            var d = new DashProperty(this, data.d, 'canvas', this);
            elementData.d = d;
            if (!elementData.d.k) {
              // if not keyframed
              styleElem.da = elementData.d.dashArray;
              styleElem['do'] = elementData.d.dashoffset[0];
            }
          }
        } else {
          styleElem.r = data.r === 2 ? 'evenodd' : 'nonzero';
        }
        this.stylesList.push(styleElem);
        elementData.style = styleElem;
        return elementData;
      },

      /**
       * a
       * @param {*} data a
       */
    },
    {
      key: 'addShapeToModifiers',
      value: function addShapeToModifiers(data) {
        var i;
        var len = this.shapeModifiers.length;
        for (i = 0; i < len; i += 1) {
          this.shapeModifiers[i].addShape(data);
        }
      },

      /**
       * a
       * @param {*} data a
       * @return {Boolean}
       */
    },
    {
      key: 'isShapeInAnimatedModifiers',
      value: function isShapeInAnimatedModifiers(data) {
        var i = 0;
        var len = this.shapeModifiers.length;
        while (i < len) {
          if (this.shapeModifiers[i].isAnimatedWithShape(data)) {
            return true;
          }
        }
        return false;
      },

      /**
       * a
       */
    },
    {
      key: 'updateModifiers',
      value: function updateModifiers() {
        if (!this.shapeModifiers.length) {
          return;
        }
        var i;
        var len = this.shapes.length;
        for (i = 0; i < len; i += 1) {
          this.shapes[i].sh.reset();
        }
        len = this.shapeModifiers.length;
        for (i = len - 1; i >= 0; i -= 1) {
          this.shapeModifiers[i].processShapes(this._isFirstFrame);
        }
      },

      /**
       * a
       * @param {*} elem a
       * @return {number}
       */
    },
    {
      key: 'searchProcessedElement',
      value: function searchProcessedElement(elem) {
        var elements = this.processedElements;
        var i = 0;
        var len = elements.length;
        while (i < len) {
          if (elements[i].elem === elem) {
            return elements[i].pos;
          }
          i += 1;
        }
        return 0;
      },

      /**
       * a
       * @param {*} elem a
       * @param {*} pos a
       */
    },
    {
      key: 'addProcessedElement',
      value: function addProcessedElement(elem, pos) {
        var elements = this.processedElements;
        var i = elements.length;
        while (i) {
          i -= 1;
          if (elements[i].elem === elem) {
            elements[i].pos = pos;
            return;
          }
        }
        elements.push(new ProcessedElement(elem, pos));
      },

      /**
       * create group element
       * @return {*}
       */
    },
    {
      key: 'createGroupElement',
      value: function createGroupElement() {
        return {
          it: [],
          prevViewData: [],
        };
      },

      /**
       * create transform element
       * @param {*} data a
       * @return {*}
       */
    },
    {
      key: 'createTransformElement',
      value: function createTransformElement(data) {
        return {
          transform: {
            opacity: 1,
            _opMdf: false,
            key: this.transformsManager.getNewKey(),
            op: PropertyFactory.getProp(this, data.o, 0, 0.01, this),
            mProps: getTransformProperty(this, data, this),
          },
        };
      },

      /**
       * a
       * @param {*} data a
       * @return {*}
       */
    },
    {
      key: 'createShapeElement',
      value: function createShapeElement(data) {
        var elementData = new ShapeData(this, data, this.stylesList, this.transformsManager);
        this.shapes.push(elementData);
        this.addShapeToModifiers(elementData);
        return elementData;
      },

      /**
       * a
       */
    },
    {
      key: 'reloadShapes',
      value: function reloadShapes() {
        this._isFirstFrame = true;
        var i;
        var len = this.itemsData.length;
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
      },

      /**
       * a
       * @param {*} transform a
       */
    },
    {
      key: 'addTransformToStyleList',
      value: function addTransformToStyleList(transform) {
        var len = this.stylesList.length;
        for (var i = 0; i < len; i += 1) {
          if (!this.stylesList[i].closed) {
            this.stylesList[i].transforms.push(transform);
          }
        }
      },

      /**
       * a
       */
    },
    {
      key: 'removeTransformFromStyleList',
      value: function removeTransformFromStyleList() {
        var len = this.stylesList.length;
        for (var i = 0; i < len; i += 1) {
          if (!this.stylesList[i].closed) {
            this.stylesList[i].transforms.pop();
          }
        }
      },

      /**
       * a
       * @param {*} styles a
       */
    },
    {
      key: 'closeStyles',
      value: function closeStyles(styles) {
        var len = styles.length;
        for (var i = 0; i < len; i += 1) {
          styles[i].closed = true;
        }
      },

      /**
       * a
       * @param {*} arr a
       * @param {*} itemsData a
       * @param {*} prevViewData a
       * @param {*} shouldRender a
       * @param {*} transforms a
       */
    },
    {
      key: 'searchShapes',
      value: function searchShapes(arr, itemsData, prevViewData, shouldRender, transforms) {
        var i;
        var len = arr.length - 1;
        var j;
        var jLen;
        var ownStyles = [];
        var ownModifiers = [];
        var processedPos;
        var modifier;
        var currentTransform;
        var ownTransforms = [].concat(transforms);
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
          } else if (arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'pb') {
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
      },

      /**
       * a
       * @param {*} parentTransform a
       * @param {*} groupTransform a
       */
    },
    {
      key: 'updateShapeTransform',
      value: function updateShapeTransform(parentTransform, groupTransform) {
        if (parentTransform._opMdf || groupTransform.op._mdf || this._isFirstFrame) {
          groupTransform.opacity = parentTransform.opacity;
          groupTransform.opacity *= groupTransform.op.v;
          groupTransform._opMdf = true;
        }
      },

      /**
       * a
       * @param {*} styledShape a
       * @param {*} shape a
       */
    },
    {
      key: 'updateStyledShape',
      value: function updateStyledShape(styledShape, shape) {
        if (this._isFirstFrame || shape._mdf || styledShape.transforms._mdf) {
          var shapeNodes = styledShape.trNodes;
          var paths = shape.paths;
          var i;
          var len;
          var j;
          var jLen = paths._length;
          shapeNodes.length = 0;
          var groupTransformMat = styledShape.transforms.finalTransform;
          for (j = 0; j < jLen; j += 1) {
            var pathNodes = paths.shapes[j];
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
      },

      /**
       * a
       * @param {*} pathData a
       * @param {*} itemData a
       */
    },
    {
      key: 'updatePath',
      value: function updatePath(pathData, itemData) {
        if (pathData.hd !== true && pathData._shouldRender) {
          var i;
          var len = itemData.styledShapes.length;
          for (i = 0; i < len; i += 1) {
            this.updateStyledShape(itemData.styledShapes[i], itemData.sh);
          }
        }
      },

      /**
       * a
       * @param {*} styleData a
       * @param {*} itemData a
       * @param {*} groupTransform a
       */
    },
    {
      key: 'updateFill',
      value: function updateFill(styleData, itemData, groupTransform) {
        var styleElem = itemData.style;
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
      },

      /**
       * a
       * @param {*} styleData a
       * @param {*} itemData aa
       * @param {*} groupTransform a
       */
    },
    {
      key: 'updateStroke',
      value: function updateStroke(styleData, itemData, groupTransform) {
        var styleElem = itemData.style;
        var d = itemData.d;
        if (d && (d._mdf || this._isFirstFrame)) {
          styleElem.da = d.dashArray;
          styleElem['do'] = d.dashoffset[0];
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
      },

      /**
       * a
       * @param {*} styleData a
       * @param {*} itemData a
       * @param {*} groupTransform a
       */
    },
    {
      key: 'updateGradientFill',
      value: function updateGradientFill(styleData, itemData, groupTransform) {
        var styleElem = itemData.style;
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
      },

      /**
       * a
       * @param {*} parentTransform a
       * @param {*} items a
       * @param {*} data a
       */
    },
    {
      key: 'updateShape',
      value: function updateShape(parentTransform, items, data) {
        var len = items.length - 1;
        var groupTransform = parentTransform;
        for (var i = len; i >= 0; i -= 1) {
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
      },

      /**
       * a
       */
      // updateGrahpics() {
      //   const len = this.stylesList.length;
      //   for (let i = 0; i < len; i+=1) {
      //     const currentStyle = this.stylesList[i];
      //     currentStyle.updateGrahpics();
      //   }
      // }

      /**
       * a
       * @param {number} frameNum frameNum
       */
    },
    {
      key: 'getValue',
      value: function getValue(frameNum) {
        if (frameNum === this.frameId) {
          return;
        }
        this.iterateDynamicProperties(frameNum);
        this.transformHelper.opacity = 1;
        this.transformHelper._opMdf = false;
        this.updateModifiers();
        this.transformsManager.processSequences(this._isFirstFrame);
        this.updateShape(this.transformHelper, this.shapesData, this.itemsData);

        // this.updateGrahpics();

        this.frameId = frameNum;
      },

      /**
       * Add child element to a group
       * @param {Object} groupData - Group data object
       * @param {Object} childData - Child element data to add
       * @param {number} index - Optional index to insert at (default: end)
       */
    },
    {
      key: 'addChildToGroup',
      value: function addChildToGroup(groupData, childData) {
        var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
        if (!groupData || groupData.ty !== 'gr') {
          console.warn('Invalid group data provided to addChildToGroup');
          return false;
        }
        if (!groupData.it) {
          groupData.it = [];
        }

        // Add to shapesData
        if (index >= 0 && index < groupData.it.length) {
          groupData.it.splice(index, 0, childData);
        } else {
          groupData.it.push(childData);
        }

        // Mark for re-processing
        childData._shouldRender = true;

        // Trigger reload to update itemsData
        this.reloadShapes();
        return true;
      },

      /**
       * Remove child element from a group
       * @param {Object} groupData - Group data object
       * @param {number} index - Index of child to remove
       */
    },
    {
      key: 'removeChildFromGroup',
      value: function removeChildFromGroup(groupData, index) {
        if (!groupData || groupData.ty !== 'gr' || !groupData.it) {
          console.warn('Invalid group data provided to removeChildFromGroup');
          return false;
        }
        if (index < 0 || index >= groupData.it.length) {
          console.warn('Invalid index provided to removeChildFromGroup');
          return false;
        }

        // Remove from shapesData
        var removedChild = groupData.it.splice(index, 1)[0];

        // Trigger reload to update itemsData
        this.reloadShapes();
        return removedChild;
      },

      /**
       * Insert child element at specific index in a group
       * @param {Object} groupData - Group data object
       * @param {Object} childData - Child element data to insert
       * @param {number} index - Index to insert at
       */
    },
    {
      key: 'insertChildAtIndex',
      value: function insertChildAtIndex(groupData, childData, index) {
        return this.addChildToGroup(groupData, childData, index);
      },

      /**
       * Get child count in a group
       * @param {Object} groupData - Group data object
       * @return {number} Number of children in the group
       */
    },
    {
      key: 'getChildCount',
      value: function getChildCount(groupData) {
        if (!groupData || groupData.ty !== 'gr' || !groupData.it) {
          return 0;
        }
        return groupData.it.length;
      },

      /**
       * Get child at specific index from a group
       * @param {Object} groupData - Group data object
       * @param {number} index - Index of child to get
       * @return {Object|null} Child data or null if not found
       */
    },
    {
      key: 'getChildAt',
      value: function getChildAt(groupData, index) {
        if (!groupData || groupData.ty !== 'gr' || !groupData.it) {
          return null;
        }
        if (index < 0 || index >= groupData.it.length) {
          return null;
        }
        return groupData.it[index];
      },

      /**
       * Find group data by name or other criteria
       * @param {string} name - Name of the group to find
       * @param {Array} searchArray - Optional array to search in (default: this.shapesData)
       * @return {Object|null} Group data or null if not found
       */
    },
    {
      key: 'findGroupByName',
      value: function findGroupByName(name) {
        var searchArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.shapesData;
        for (var i = 0; i < searchArray.length; i++) {
          var item = searchArray[i];
          if (item.ty === 'gr' && item.nm === name) {
            return item;
          }
          if (item.ty === 'gr' && item.it) {
            // Recursively search in nested groups
            var found = this.findGroupByName(name, item.it);
            if (found) {
              return found;
            }
          }
        }
        return null;
      },
    },
  ]);
})(DynamicPropertyContainer);

/**
 * Eventer, you can new it and bind custom event and emit it
 */
var Eventer = /*#__PURE__*/ (function () {
  /**
   * Eventer constructor
   */
  function Eventer() {
    _classCallCheck(this, Eventer);
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

    /**
     * 异步触发队列
     *
     * @member {array}
     * @private
     */
    this._emitAsyncQueue = [];
    this._emitTimer = null;
  }

  /**
   * 事件对象的事件绑定函数
   *
   * @param {String} type 事件类型
   * @param {Function} fn 回调函数
   * @return {this}
   */
  return _createClass(Eventer, [
    {
      key: 'on',
      value: function on(type, fn) {
        if (!Tools.isFunction(fn)) return this;
        if (Tools.isUndefined(this.listeners[type])) this.listeners[type] = [];
        if (this.listeners[type].indexOf(fn) !== -1) return this;
        this.listeners[type].push(fn);
        return this;
      },

      /**
       * 事件对象的事件解绑函数
       *
       * @param {String} type 事件类型
       * @param {Function} [fn] 注册时回调函数的引用
       * @return {this}
       */
    },
    {
      key: 'off',
      value: function off(type, fn) {
        if (Tools.isUndefined(this.listeners[type])) return this;
        var cbs = this.listeners[type];
        var i = cbs.length;
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
      },

      /**
       * 事件对象的一次性事件绑定函数
       *
       * @param {String} type 事件类型
       * @param {Function} fn 回调函数
       * @return {this}
       */
    },
    {
      key: 'once',
      value: function once(type, fn) {
        var _this = this;
        if (!Tools.isFunction(fn)) return this;
        var _cb = function cb(ev) {
          fn(ev);
          _this.off(type, _cb);
        };
        this.on(type, _cb);
        return this;
      },

      /**
       * 触发事件
       *
       * @param {String} type 事件类型
       * @param {any} [params] 事件数据
       * @return {this}
       */
    },
    {
      key: 'emit',
      value: function emit(type, ...params) {
        if (Tools.isUndefined(this.listeners[type])) return this;
        var cbs = this.listeners[type] || [];
        var cache = cbs.slice(0);
        for (var i = 0; i < cache.length; i++) {
          cache[i].apply(this, params);
        }
        return this;
      },

      /**
       * 异步触发事件
       *
       * @param {String} type 事件类型
       * @param {any} [params] 事件数据
       * @return {this}
       */
    },
    {
      key: 'emitAsync',
      value: function emitAsync(type, params) {
        var _this2 = this;
        if (this._emitTimer === null) {
          this._emitTimer = setTimeout(function () {
            _this2._shipAsyncQueue();
          });
        }
        this._emitAsyncQueue.push([type, params]);
        return this;
      },

      /**
       * 执行异步消息队列
       * @private
       */
    },
    {
      key: '_shipAsyncQueue',
      value: function _shipAsyncQueue() {
        var _this3 = this;
        var queue = this._emitAsyncQueue.slice(0);

        // 清空消息队列，迎接新的异步调用
        this._emitAsyncQueue.length = 0;
        this._emitTimer = null;
        queue.forEach(function (info) {
          _this3.emit(info[0], info[1]);
        });
      },
    },
  ]);
})();

/**
 * a
 */
var Matrix4 = /*#__PURE__*/ (function () {
  function Matrix4() {
    _classCallCheck(this, Matrix4);
    this.props = createTypedArray('float32', 16);
    this.reset();
  }
  return _createClass(Matrix4, [
    {
      key: 'reset',
      value: function reset() {
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
      },
    },
    {
      key: 'multiplyMatrices',
      value: function multiplyMatrices(t1, t2) {
        var _p = this.props;
        var a1 = t1.props[0];
        var b1 = t1.props[1];
        var c1 = t1.props[2];
        var d1 = t1.props[3];
        var e1 = t1.props[4];
        var f1 = t1.props[5];
        var g1 = t1.props[6];
        var h1 = t1.props[7];
        var i1 = t1.props[8];
        var j1 = t1.props[9];
        var k1 = t1.props[10];
        var l1 = t1.props[11];
        var m1 = t1.props[12];
        var n1 = t1.props[13];
        var o1 = t1.props[14];
        var p1 = t1.props[15];
        var a2 = t2.props[0];
        var b2 = t2.props[1];
        var c2 = t2.props[2];
        var d2 = t2.props[3];
        var e2 = t2.props[4];
        var f2 = t2.props[5];
        var g2 = t2.props[6];
        var h2 = t2.props[7];
        var i2 = t2.props[8];
        var j2 = t2.props[9];
        var k2 = t2.props[10];
        var l2 = t2.props[11];
        var m2 = t2.props[12];
        var n2 = t2.props[13];
        var o2 = t2.props[14];
        var p2 = t2.props[15];

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
        return this;
      },
    },
    {
      key: 'setTransform',
      value: function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
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
      },
    },
    {
      key: 'transform',
      value: function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {
        var _p = this.props;

        // if (a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0) {
        //   // NOTE: commenting this condition because TurboFan deoptimizes code when present
        //   _p[12] = _p[12] * a2 + _p[15] * m2;
        //   _p[13] = _p[13] * f2 + _p[15] * n2;
        //   _p[14] = _p[14] * k2 + _p[15] * o2;
        //   _p[15] = _p[15] * p2;
        //   return this;
        // }

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
        return this;
      },
    },
    {
      key: 'rotateXYZ',
      value: function rotateXYZ(x, y, z) {
        var a = Math.cos(x);
        var b = Math.sin(x);
        var c = Math.cos(y);
        var d = Math.sin(y);
        var e = Math.cos(z);
        var f = Math.sin(z);
        var ae = a * e;
        var af = a * f;
        var be = b * e;
        var bf = b * f;
        return this.transform(
          c * e,
          -c * f,
          d,
          0,
          af + be * d,
          ae - bf * d,
          -b * c,
          0,
          bf - ae * d,
          be + af * d,
          a * c,
          0,
          0,
          0,
          0,
          1,
        );
      },
    },
    {
      key: 'rotateZYX',
      value: function rotateZYX(x, y, z) {
        var a = Math.cos(x);
        var b = Math.sin(x);
        var c = Math.cos(y);
        var d = Math.sin(y);
        var e = Math.cos(z);
        var f = Math.sin(z);
        var ae = a * e;
        var af = a * f;
        var be = b * e;
        var bf = b * f;
        return this.transform(
          c * e,
          be * d - af,
          ae * d + bf,
          0,
          c * f,
          bf * d + ae,
          af * d - be,
          0,
          -d,
          b * c,
          a * c,
          0,
          0,
          0,
          0,
          1,
        );
      },
    },
    {
      key: 'skewFromAxis',
      value: function skewFromAxis(ax, angle) {
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        var mTan = Math.tan(ax);
        return this.transform(mCos, mSin, 0, 0, -mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
          .transform(1, 0, 0, 0, mTan, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
          .transform(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
    },
    {
      key: 'scale',
      value: function scale(sx, sy, sz) {
        if (!sz && sz !== 0) {
          sz = 1;
        }
        if (sx === 1 && sy === 1 && sz === 1) {
          return this;
        }
        return this.transform(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
      },
    },
    {
      key: 'translate',
      value: function translate(tx, ty, tz) {
        tz = tz || 0;
        if (tx !== 0 || ty !== 0 || tz !== 0) {
          return this.transform(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1);
        }
        return this;
      },
    },
    {
      key: 'clone',
      value: function clone(matr) {
        var i = 0;
        for (i = 0; i < 16; i++) {
          matr.props[i] = this.props[i];
        }
      },
    },
    {
      key: 'cloneFromProps',
      value: function cloneFromProps(props) {
        var i = 0;
        for (i = 0; i < 16; i++) {
          this.props[i] = props[i];
        }
      },
    },
    {
      key: 'applyToPoint',
      value: function applyToPoint(x, y, z) {
        return {
          x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
          y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
          z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14],
        };
      },
    },
    {
      key: 'inversePoint',
      value: function inversePoint(pt) {
        var determinant = this.props[0] * this.props[5] - this.props[1] * this.props[4];
        var a = this.props[5] / determinant;
        var b = -this.props[1] / determinant;
        var c = -this.props[4] / determinant;
        var d = this.props[0] / determinant;
        var e = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / determinant;
        var f = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / determinant;
        return [pt[0] * a + pt[1] * c + e, pt[0] * b + pt[1] * d + f, 0];
      },
    },
    {
      key: 'inversePoints',
      value: function inversePoints(pts) {
        var retPts = [];
        var len = pts.length;
        var i = 0;
        for (i = 0; i < len; i++) {
          retPts[i] = this.inversePoint(pts[i]);
        }
        return retPts;
      },
    },
    {
      key: 'applyToTriplePoints',
      value: function applyToTriplePoints(pt1, pt2, pt3) {
        var arr = createTypedArray('float32', 6);
        var p0 = this.props[0];
        var p1 = this.props[1];
        var p4 = this.props[4];
        var p5 = this.props[5];
        var p12 = this.props[12];
        var p13 = this.props[13];
        arr[0] = pt1[0] * p0 + pt1[1] * p4 + p12;
        arr[1] = pt1[0] * p1 + pt1[1] * p5 + p13;
        arr[2] = pt2[0] * p0 + pt2[1] * p4 + p12;
        arr[3] = pt2[0] * p1 + pt2[1] * p5 + p13;
        arr[4] = pt3[0] * p0 + pt3[1] * p4 + p12;
        arr[5] = pt3[0] * p1 + pt3[1] * p5 + p13;
        return arr;
      },
    },
    {
      key: 'applyToPointArray',
      value: function applyToPointArray(x, y, z) {
        return [
          x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
          x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
          x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14],
        ];
      },
    },
    {
      key: 'applyInverse',
      value: function applyInverse() {},
    },
  ]);
})();

/**
 * TextSelectorProp
 */
var TextSelectorProp = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * a
   * @param {*} elem a
   * @param {*} data a
   */
  function TextSelectorProp(elem, data) {
    var _this;
    _classCallCheck(this, TextSelectorProp);
    _this = _callSuper(this, TextSelectorProp);
    _this._currentTextLength = -1;
    _this.k = false;
    _this.data = data;
    _this.elem = elem;
    _this.comp = elem.comp;
    _this.finalS = 0;
    _this.finalE = 0;
    _this.initDynamicPropertyContainer(elem);
    _this.s = PropertyFactory.getProp(
      elem,
      data.s || {
        k: 0,
      },
      0,
      0,
      _this,
    );
    if ('e' in data) {
      _this.e = PropertyFactory.getProp(elem, data.e, 0, 0, _this);
    } else {
      _this.e = {
        v: 100,
      };
    }
    _this.o = PropertyFactory.getProp(
      elem,
      data.o || {
        k: 0,
      },
      0,
      0,
      _this,
    );
    _this.xe = PropertyFactory.getProp(
      elem,
      data.xe || {
        k: 0,
      },
      0,
      0,
      _this,
    );
    _this.ne = PropertyFactory.getProp(
      elem,
      data.ne || {
        k: 0,
      },
      0,
      0,
      _this,
    );
    _this.a = PropertyFactory.getProp(elem, data.a, 0, 0.01, _this);
    if (!_this.dynamicProperties.length) {
      _this.getValue();
    }
    return _this;
  }

  /**
   * a
   * @param {*} ind a
   * @return {*}
   */
  _inherits(TextSelectorProp, _DynamicPropertyConta);
  return _createClass(TextSelectorProp, [
    {
      key: 'getMult',
      value: function getMult(ind) {
        if (this._currentTextLength !== this.elem.textProperty.currentData.l.length) {
          this.getValue();
        }
        // var easer = bez.getEasingCurve(this.ne.v/100,0,1-this.xe.v/100,1);
        var x1 = 0;
        var y1 = 0;
        var x2 = 1;
        var y2 = 1;
        if (this.ne.v > 0) {
          x1 = this.ne.v / 100.0;
        } else {
          y1 = -this.ne.v / 100.0;
        }
        if (this.xe.v > 0) {
          x2 = 1.0 - this.xe.v / 100.0;
        } else {
          y2 = 1.0 + this.xe.v / 100.0;
        }
        var easer = BezierFactory.getBezierEasing(x1, y1, x2, y2).get;
        var mult = 0;
        var s = this.finalS;
        var e = this.finalE;
        var type = this.data.sh;
        if (type === 2) {
          if (e === s) {
            mult = ind >= e ? 1 : 0;
          } else {
            mult = Math.max(0, Math.min(0.5 / (e - s) + (ind - s) / (e - s), 1));
          }
          mult = easer(mult);
        } else if (type === 3) {
          if (e === s) {
            mult = ind >= e ? 0 : 1;
          } else {
            mult = 1 - Math.max(0, Math.min(0.5 / (e - s) + (ind - s) / (e - s), 1));
          }
          mult = easer(mult);
        } else if (type === 4) {
          if (e === s) {
            mult = 0;
          } else {
            mult = Math.max(0, Math.min(0.5 / (e - s) + (ind - s) / (e - s), 1));
            if (mult < 0.5) {
              mult *= 2;
            } else {
              mult = 1 - 2 * (mult - 0.5);
            }
          }
          mult = easer(mult);
        } else if (type === 5) {
          if (e === s) {
            mult = 0;
          } else {
            var tot = e - s;
            /* ind += 0.5;
                    mult = -4/(tot*tot)*(ind*ind)+(4/tot)*ind;*/
            ind = Math.min(Math.max(0, ind + 0.5 - s), e - s);
            var x = -tot / 2 + ind;
            var a = tot / 2;
            mult = Math.sqrt(1 - (x * x) / (a * a));
          }
          mult = easer(mult);
        } else if (type === 6) {
          if (e === s) {
            mult = 0;
          } else {
            ind = Math.min(Math.max(0, ind + 0.5 - s), e - s);
            mult = (1 + Math.cos(Math.PI + (Math.PI * 2 * ind) / (e - s))) / 2;
          }
          mult = easer(mult);
        } else {
          if (ind >= Math.floor(s)) {
            if (ind - s < 0) {
              mult = Math.max(0, Math.min(Math.min(e, 1) - (s - ind), 1));
            } else {
              mult = Math.max(0, Math.min(e - ind, 1));
            }
          }
          mult = easer(mult);
        }
        return mult * this.a.v;
      },

      /**
       * a
       * @param {*} frameNum a
       */
    },
    {
      key: 'getValue',
      value: function getValue(frameNum) {
        this.iterateDynamicProperties(frameNum);
        this._mdf = frameNum || this._mdf;
        this._currentTextLength = this.elem.textProperty.currentData.l.length || 0;
        if (frameNum && this.data.r === 2) {
          this.e.v = this._currentTextLength;
        }
        var divisor = this.data.r === 2 ? 1 : 100 / this.data.totalChars;
        var o = this.o.v / divisor;
        var s = this.s.v / divisor + o;
        var e = this.e.v / divisor + o;
        if (s > e) {
          var _s = s;
          s = e;
          e = _s;
        }
        this.finalS = s;
        this.finalE = e;
      },
    },
  ]);
})(DynamicPropertyContainer);
function getTextSelectorProp(elem, data, arr) {
  return new TextSelectorProp(elem, data, arr);
}

/**
 * TextAnimatorDataProperty
 */
var TextAnimatorDataProperty = /*#__PURE__*/ _createClass(
  /**
   * a
   * @param {*} elem a
   * @param {*} animatorProps a
   * @param {*} container a
   */
  function TextAnimatorDataProperty(elem, animatorProps, container) {
    _classCallCheck(this, TextAnimatorDataProperty);
    var defaultData = {
      propType: false,
    };
    var getProp = PropertyFactory.getProp;
    var textAnimatorAnimatables = animatorProps.a;
    this.a = {
      r: textAnimatorAnimatables.r ? getProp(elem, textAnimatorAnimatables.r, 0, degToRads, container) : defaultData,
      rx: textAnimatorAnimatables.rx ? getProp(elem, textAnimatorAnimatables.rx, 0, degToRads, container) : defaultData,
      ry: textAnimatorAnimatables.ry ? getProp(elem, textAnimatorAnimatables.ry, 0, degToRads, container) : defaultData,
      sk: textAnimatorAnimatables.sk ? getProp(elem, textAnimatorAnimatables.sk, 0, degToRads, container) : defaultData,
      sa: textAnimatorAnimatables.sa ? getProp(elem, textAnimatorAnimatables.sa, 0, degToRads, container) : defaultData,
      s: textAnimatorAnimatables.s ? getProp(elem, textAnimatorAnimatables.s, 1, 0.01, container) : defaultData,
      a: textAnimatorAnimatables.a ? getProp(elem, textAnimatorAnimatables.a, 1, 0, container) : defaultData,
      o: textAnimatorAnimatables.o ? getProp(elem, textAnimatorAnimatables.o, 0, 0.01, container) : defaultData,
      p: textAnimatorAnimatables.p ? getProp(elem, textAnimatorAnimatables.p, 1, 0, container) : defaultData,
      sw: textAnimatorAnimatables.sw ? getProp(elem, textAnimatorAnimatables.sw, 0, 0, container) : defaultData,
      sc: textAnimatorAnimatables.sc ? getProp(elem, textAnimatorAnimatables.sc, 1, 0, container) : defaultData,
      fc: textAnimatorAnimatables.fc ? getProp(elem, textAnimatorAnimatables.fc, 1, 0, container) : defaultData,
      fh: textAnimatorAnimatables.fh ? getProp(elem, textAnimatorAnimatables.fh, 0, 0, container) : defaultData,
      fs: textAnimatorAnimatables.fs ? getProp(elem, textAnimatorAnimatables.fs, 0, 0.01, container) : defaultData,
      fb: textAnimatorAnimatables.fb ? getProp(elem, textAnimatorAnimatables.fb, 0, 0.01, container) : defaultData,
      t: textAnimatorAnimatables.t ? getProp(elem, textAnimatorAnimatables.t, 0, 0, container) : defaultData,
    };
    this.s = getTextSelectorProp(elem, animatorProps.s, container);
    this.s.t = animatorProps.s.t;
  },
);

/**
 * LetterProps
 */
var LetterProps = /*#__PURE__*/ (function () {
  /**
   * a
   * @param {*} o a
   * @param {*} sw a
   * @param {*} sc a
   * @param {*} fc a
   * @param {*} m a
   * @param {*} p a
   */
  function LetterProps(o, sw, sc, fc, m, p) {
    _classCallCheck(this, LetterProps);
    this.o = o;
    this.sw = sw;
    this.sc = sc;
    this.fc = fc;
    this.m = m;
    this.p = p;
    this._mdf = {
      o: true,
      sw: !!sw,
      sc: !!sc,
      fc: !!fc,
      m: true,
      p: true,
    };
  }

  /**
   * a
   * @param {*} o a
   * @param {*} sw a
   * @param {*} sc a
   * @param {*} fc a
   * @param {*} m a
   * @param {*} p a
   * @return {*}
   */
  return _createClass(LetterProps, [
    {
      key: 'update',
      value: function update(o, sw, sc, fc, m, p) {
        this._mdf.o = false;
        this._mdf.sw = false;
        this._mdf.sc = false;
        this._mdf.fc = false;
        this._mdf.m = false;
        this._mdf.p = false;
        var updated = false;
        if (this.o !== o) {
          this.o = o;
          this._mdf.o = true;
          updated = true;
        }
        if (this.sw !== sw) {
          this.sw = sw;
          this._mdf.sw = true;
          updated = true;
        }
        if (this.sc !== sc) {
          this.sc = sc;
          this._mdf.sc = true;
          updated = true;
        }
        if (this.fc !== fc) {
          this.fc = fc;
          this._mdf.fc = true;
          updated = true;
        }
        if (this.m !== m) {
          this.m = m;
          this._mdf.m = true;
          updated = true;
        }
        if (
          p.length &&
          (this.p[0] !== p[0] ||
            this.p[1] !== p[1] ||
            this.p[4] !== p[4] ||
            this.p[5] !== p[5] ||
            this.p[12] !== p[12] ||
            this.p[13] !== p[13])
        ) {
          this.p = p;
          this._mdf.p = true;
          updated = true;
        }
        return updated;
      },
    },
  ]);
})();

/**
 * a
 * @param {*} fontData a
 * @return {*}
 */
function getFontProperties(fontData) {
  var styles = fontData.fStyle ? fontData.fStyle.split(' ') : [];
  var fWeight = 'normal';
  var fStyle = 'normal';
  var len = styles.length;
  var styleName;
  for (var _i = 0; _i < len; _i += 1) {
    styleName = styles[_i].toLowerCase();
    switch (styleName) {
      case 'italic':
        fStyle = 'italic';
        break;
      case 'bold':
        fWeight = '700';
        break;
      case 'black':
        fWeight = '900';
        break;
      case 'medium':
        fWeight = '500';
        break;
      case 'regular':
      case 'normal':
        fWeight = '400';
        break;
      case 'light':
      case 'thin':
        fWeight = '200';
        break;
    }
  }
  return {
    style: fStyle,
    weight: fontData.fWeight || fWeight,
  };
}

/**
 * a
 * @param {*} h a
 * @param {*} s a
 * @param {*} v a
 * @return {*}
 */
function HSVtoRGB(h, s, v) {
  var r;
  var g;
  var b;
  var i;
  var f;
  var p;
  var q;
  var t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return [r, g, b];
}

/**
 * a
 * @param {*} r a
 * @param {*} g a
 * @param {*} b a
 * @return {*}
 */
function RGBtoHSV(r, g, b) {
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var d = max - min;
  var h;
  var s = max === 0 ? 0 : d / max;
  var v = max / 255;
  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = g - b + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = b - r + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = r - g + d * 4;
      h /= 6 * d;
      break;
  }
  return [h, s, v];
}

/**
 * a
 * @param {*} color a
 * @param {*} offset a
 * @return {*}
 */
function addSaturationToRGB(color, offset) {
  var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
  hsv[1] += offset;
  if (hsv[1] > 1) {
    hsv[1] = 1;
  } else if (hsv[1] <= 0) {
    hsv[1] = 0;
  }
  return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
}

/**
 * a
 * @param {*} color a
 * @param {*} offset a
 * @return {*}
 */
function addBrightnessToRGB(color, offset) {
  var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
  hsv[2] += offset;
  if (hsv[2] > 1) {
    hsv[2] = 1;
  } else if (hsv[2] < 0) {
    hsv[2] = 0;
  }
  return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
}

/**
 * a
 * @param {*} color a
 * @param {*} offset a
 * @return {*}
 */
function addHueToRGB(color, offset) {
  var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
  hsv[0] += offset / 360;
  if (hsv[0] > 1) {
    hsv[0] -= 1;
  } else if (hsv[0] < 0) {
    hsv[0] += 1;
  }
  return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
}
var colorMap = [];
var i;
var hex;
for (i = 0; i < 256; i += 1) {
  hex = i.toString(16);
  colorMap[i] = hex.length == 1 ? '0' + hex : hex;
}

/**
 * TextAnimatorProperty
 */
var TextAnimatorProperty = /*#__PURE__*/ (function (_DynamicPropertyConta) {
  /**
   * a
   * @param {*} textData a
   * @param {*} renderType a
   * @param {*} elem a
   */
  function TextAnimatorProperty(textData, renderType, elem) {
    var _this;
    _classCallCheck(this, TextAnimatorProperty);
    _this = _callSuper(this, TextAnimatorProperty);
    _this._isFirstFrame = true;
    _this._hasMaskedPath = false;
    _this._frameId = -1;
    _this._textData = textData;
    _this._renderType = renderType;
    _this.elem = elem;
    _this._animatorsData = createSizedArray(_this._textData.a.length);
    _this._pathData = {};
    _this._moreOptions = {
      alignment: {},
    };
    _this.renderedLetters = [];
    _this.lettersChangedFlag = false;
    _this.mHelper = new Matrix();
    _this.defaultPropsArray = [];
    _this.initDynamicPropertyContainer(elem);
    return _this;
  }

  /**
   * a
   */
  _inherits(TextAnimatorProperty, _DynamicPropertyConta);
  return _createClass(TextAnimatorProperty, [
    {
      key: 'searchProperties',
      value: function searchProperties() {
        var i;
        var len = this._textData.a.length;
        var animatorProps;
        var getProp = PropertyFactory.getProp;
        for (i = 0; i < len; i += 1) {
          animatorProps = this._textData.a[i];
          this._animatorsData[i] = new TextAnimatorDataProperty(this.elem, animatorProps, this);
        }
        if (this._textData.p && 'm' in this._textData.p) {
          this._pathData = {
            a: getProp(this, this._textData.p.a, 0, 0, this),
            f: getProp(this, this._textData.p.f, 0, 0, this),
            l: getProp(this, this._textData.p.l, 0, 0, this),
            r: getProp(this, this._textData.p.r, 0, 0, this),
            p: getProp(this, this._textData.p.p, 0, 0, this),
            m: this.elem.maskManager.getMaskProperty(this._textData.p.m),
          };
          this._hasMaskedPath = true;
        } else {
          this._hasMaskedPath = false;
        }
        this._moreOptions.alignment = getProp(this.elem, this._textData.m.a, 1, 0, this);
      },

      /**
       * a
       * @param {*} documentData a
       * @param {*} lettersChangedFlag a
       */
    },
    {
      key: 'getMeasures',
      value: function getMeasures(documentData, lettersChangedFlag) {
        this.lettersChangedFlag = lettersChangedFlag;
        if (
          !this._mdf &&
          !this._isFirstFrame &&
          !lettersChangedFlag &&
          (!this._hasMaskedPath || !this._pathData.m._mdf)
        ) {
          return;
        }
        this._isFirstFrame = false;
        var alignment = this._moreOptions.alignment.v;
        var animators = this._animatorsData;
        var textData = this._textData;
        var matrixHelper = this.mHelper;
        var renderType = this._renderType;
        var renderedLettersCount = this.renderedLetters.length;
        var xPos;
        var yPos;
        var i;
        var len;
        var letters = documentData.l;
        var pathInfo;
        var currentLength;
        var currentPoint;
        var segmentLength;
        var flag;
        var pointInd;
        var segmentInd;
        var prevPoint;
        var points;
        var segments;
        var partialLength;
        var totalLength;
        var perc;
        var tanAngle;
        var mask;
        if (this._hasMaskedPath) {
          mask = this._pathData.m;
          if (!this._pathData.n || this._pathData._mdf) {
            var paths = mask.v;
            if (this._pathData.r.v) {
              paths = paths.reverse();
            }
            // TODO: release bezier data cached from previous pathInfo: this._pathData.pi
            pathInfo = {
              tLength: 0,
              segments: [],
            };
            len = paths._length - 1;
            var bezierData;
            totalLength = 0;
            for (i = 0; i < len; i += 1) {
              bezierData = bez.buildBezierData(
                paths.v[i],
                paths.v[i + 1],
                [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                [paths.i[i + 1][0] - paths.v[i + 1][0], paths.i[i + 1][1] - paths.v[i + 1][1]],
              );
              pathInfo.tLength += bezierData.segmentLength;
              pathInfo.segments.push(bezierData);
              totalLength += bezierData.segmentLength;
            }
            i = len;
            if (mask.v.c) {
              bezierData = bez.buildBezierData(
                paths.v[i],
                paths.v[0],
                [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                [paths.i[0][0] - paths.v[0][0], paths.i[0][1] - paths.v[0][1]],
              );
              pathInfo.tLength += bezierData.segmentLength;
              pathInfo.segments.push(bezierData);
              totalLength += bezierData.segmentLength;
            }
            this._pathData.pi = pathInfo;
          }
          pathInfo = this._pathData.pi;
          currentLength = this._pathData.f.v;
          segmentInd = 0;
          pointInd = 1;
          segmentLength = 0;
          flag = true;
          segments = pathInfo.segments;
          if (currentLength < 0 && mask.v.c) {
            if (pathInfo.tLength < Math.abs(currentLength)) {
              currentLength = -Math.abs(currentLength) % pathInfo.tLength;
            }
            segmentInd = segments.length - 1;
            points = segments[segmentInd].points;
            pointInd = points.length - 1;
            while (currentLength < 0) {
              currentLength += points[pointInd].partialLength;
              pointInd -= 1;
              if (pointInd < 0) {
                segmentInd -= 1;
                points = segments[segmentInd].points;
                pointInd = points.length - 1;
              }
            }
          }
          points = segments[segmentInd].points;
          prevPoint = points[pointInd - 1];
          currentPoint = points[pointInd];
          partialLength = currentPoint.partialLength;
        }
        len = letters.length;
        xPos = 0;
        yPos = 0;
        var yOff = documentData.finalSize * 1.2 * 0.714;
        var firstLine = true;
        var animatorProps;
        var animatorSelector;
        var j;
        var jLen;
        var letterValue;
        jLen = animators.length;
        var mult;
        var ind = -1;
        var offf;
        var xPathPos;
        var yPathPos;
        var initPathPos = currentLength;
        var initSegmentInd = segmentInd;
        var initPointInd = pointInd;
        var currentLine = -1;
        var elemOpacity;
        var sc;
        var sw;
        var fc;
        var k;
        var letterSw;
        var letterSc;
        var letterFc;
        var letterM = '';
        var letterP = this.defaultPropsArray;
        var letterO;

        //
        if (documentData.j === 2 || documentData.j === 1) {
          var animatorJustifyOffset = 0;
          var animatorFirstCharOffset = 0;
          var justifyOffsetMult = documentData.j === 2 ? -0.5 : -1;
          var lastIndex = 0;
          var isNewLine = true;
          for (i = 0; i < len; i += 1) {
            if (letters[i].n) {
              if (animatorJustifyOffset) {
                animatorJustifyOffset += animatorFirstCharOffset;
              }
              while (lastIndex < i) {
                letters[lastIndex].animatorJustifyOffset = animatorJustifyOffset;
                lastIndex += 1;
              }
              animatorJustifyOffset = 0;
              isNewLine = true;
            } else {
              for (j = 0; j < jLen; j += 1) {
                animatorProps = animators[j].a;
                if (animatorProps.t.propType) {
                  if (isNewLine && documentData.j === 2) {
                    animatorFirstCharOffset += animatorProps.t.v * justifyOffsetMult;
                  }
                  animatorSelector = animators[j].s;
                  mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
                  if (mult.length) {
                    animatorJustifyOffset += animatorProps.t.v * mult[0] * justifyOffsetMult;
                  } else {
                    animatorJustifyOffset += animatorProps.t.v * mult * justifyOffsetMult;
                  }
                }
              }
              isNewLine = false;
            }
          }
          if (animatorJustifyOffset) {
            animatorJustifyOffset += animatorFirstCharOffset;
          }
          while (lastIndex < i) {
            letters[lastIndex].animatorJustifyOffset = animatorJustifyOffset;
            lastIndex += 1;
          }
        }
        //

        for (i = 0; i < len; i += 1) {
          matrixHelper.reset();
          elemOpacity = 1;
          if (letters[i].n) {
            xPos = 0;
            yPos += documentData.yOffset;
            yPos += firstLine ? 1 : 0;
            currentLength = initPathPos;
            firstLine = false;
            if (this._hasMaskedPath) {
              segmentInd = initSegmentInd;
              pointInd = initPointInd;
              points = segments[segmentInd].points;
              prevPoint = points[pointInd - 1];
              currentPoint = points[pointInd];
              partialLength = currentPoint.partialLength;
              segmentLength = 0;
            }
            letterM = '';
            letterFc = '';
            letterSw = '';
            letterO = '';
            letterP = this.defaultPropsArray;
          } else {
            if (this._hasMaskedPath) {
              if (currentLine !== letters[i].line) {
                switch (documentData.j) {
                  case 1:
                    currentLength += totalLength - documentData.lineWidths[letters[i].line];
                    break;
                  case 2:
                    currentLength += (totalLength - documentData.lineWidths[letters[i].line]) / 2;
                    break;
                }
                currentLine = letters[i].line;
              }
              if (ind !== letters[i].ind) {
                if (letters[ind]) {
                  currentLength += letters[ind].extra;
                }
                currentLength += letters[i].an / 2;
                ind = letters[i].ind;
              }
              currentLength += alignment[0] * letters[i].an * 0.005;
              var animatorOffset = 0;
              for (j = 0; j < jLen; j += 1) {
                animatorProps = animators[j].a;
                if (animatorProps.p.propType) {
                  animatorSelector = animators[j].s;
                  mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
                  if (mult.length) {
                    animatorOffset += animatorProps.p.v[0] * mult[0];
                  } else {
                    animatorOffset += animatorProps.p.v[0] * mult;
                  }
                }
                if (animatorProps.a.propType) {
                  animatorSelector = animators[j].s;
                  mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
                  if (mult.length) {
                    animatorOffset += animatorProps.a.v[0] * mult[0];
                  } else {
                    animatorOffset += animatorProps.a.v[0] * mult;
                  }
                }
              }
              flag = true;
              // Force alignment only works with a single line for now
              if (this._pathData.a.v) {
                currentLength =
                  letters[0].an * 0.5 +
                  ((totalLength - this._pathData.f.v - letters[0].an * 0.5 - letters[letters.length - 1].an * 0.5) *
                    ind) /
                    (len - 1);
                currentLength += this._pathData.f.v;
              }
              while (flag) {
                if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
                  perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
                  xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                  yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                  matrixHelper.translate(-alignment[0] * letters[i].an * 0.005, -(alignment[1] * yOff) * 0.01);
                  flag = false;
                } else if (points) {
                  segmentLength += currentPoint.partialLength;
                  pointInd += 1;
                  if (pointInd >= points.length) {
                    pointInd = 0;
                    segmentInd += 1;
                    if (!segments[segmentInd]) {
                      if (mask.v.c) {
                        pointInd = 0;
                        segmentInd = 0;
                        points = segments[segmentInd].points;
                      } else {
                        segmentLength -= currentPoint.partialLength;
                        points = null;
                      }
                    } else {
                      points = segments[segmentInd].points;
                    }
                  }
                  if (points) {
                    prevPoint = currentPoint;
                    currentPoint = points[pointInd];
                    partialLength = currentPoint.partialLength;
                  }
                }
              }
              offf = letters[i].an / 2 - letters[i].add;
              matrixHelper.translate(-offf, 0, 0);
            } else {
              offf = letters[i].an / 2 - letters[i].add;
              matrixHelper.translate(-offf, 0, 0);

              // Grouping alignment
              matrixHelper.translate(-alignment[0] * letters[i].an * 0.005, -alignment[1] * yOff * 0.01, 0);
            }
            for (j = 0; j < jLen; j += 1) {
              animatorProps = animators[j].a;
              if (animatorProps.t.propType) {
                animatorSelector = animators[j].s;
                mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
                // This condition is to prevent applying tracking to first character in each line. Might be better to use a boolean "isNewLine"
                if (xPos !== 0 || documentData.j !== 0) {
                  if (this._hasMaskedPath) {
                    if (mult.length) {
                      currentLength += animatorProps.t.v * mult[0];
                    } else {
                      currentLength += animatorProps.t.v * mult;
                    }
                  } else if (mult.length) {
                    xPos += animatorProps.t.v * mult[0];
                  } else {
                    xPos += animatorProps.t.v * mult;
                  }
                }
              }
            }
            if (documentData.strokeWidthAnim) {
              sw = documentData.sw || 0;
            }
            if (documentData.strokeColorAnim) {
              if (documentData.sc) {
                sc = [documentData.sc[0], documentData.sc[1], documentData.sc[2]];
              } else {
                sc = [0, 0, 0];
              }
            }
            if (documentData.fillColorAnim && documentData.fc) {
              fc = [documentData.fc[0], documentData.fc[1], documentData.fc[2]];
            }
            for (j = 0; j < jLen; j += 1) {
              animatorProps = animators[j].a;
              if (animatorProps.a.propType) {
                animatorSelector = animators[j].s;
                mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
                if (mult.length) {
                  matrixHelper.translate(
                    -animatorProps.a.v[0] * mult[0],
                    -animatorProps.a.v[1] * mult[1],
                    animatorProps.a.v[2] * mult[2],
                  );
                } else {
                  matrixHelper.translate(
                    -animatorProps.a.v[0] * mult,
                    -animatorProps.a.v[1] * mult,
                    animatorProps.a.v[2] * mult,
                  );
                }
              }
            }
            for (j = 0; j < jLen; j += 1) {
              animatorProps = animators[j].a;
              if (animatorProps.s.propType) {
                animatorSelector = animators[j].s;
                mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
                if (mult.length) {
                  matrixHelper.scale(
                    1 + (animatorProps.s.v[0] - 1) * mult[0],
                    1 + (animatorProps.s.v[1] - 1) * mult[1],
                    1,
                  );
                } else {
                  matrixHelper.scale(1 + (animatorProps.s.v[0] - 1) * mult, 1 + (animatorProps.s.v[1] - 1) * mult, 1);
                }
              }
            }
            for (j = 0; j < jLen; j += 1) {
              animatorProps = animators[j].a;
              animatorSelector = animators[j].s;
              mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
              if (animatorProps.sk.propType) {
                if (mult.length) {
                  matrixHelper.skewFromAxis(-animatorProps.sk.v * mult[0], animatorProps.sa.v * mult[1]);
                } else {
                  matrixHelper.skewFromAxis(-animatorProps.sk.v * mult, animatorProps.sa.v * mult);
                }
              }
              if (animatorProps.r.propType) {
                if (mult.length) {
                  matrixHelper.rotateZ(-animatorProps.r.v * mult[2]);
                } else {
                  matrixHelper.rotateZ(-animatorProps.r.v * mult);
                }
              }
              if (animatorProps.ry.propType) {
                if (mult.length) {
                  matrixHelper.rotateY(animatorProps.ry.v * mult[1]);
                } else {
                  matrixHelper.rotateY(animatorProps.ry.v * mult);
                }
              }
              if (animatorProps.rx.propType) {
                if (mult.length) {
                  matrixHelper.rotateX(animatorProps.rx.v * mult[0]);
                } else {
                  matrixHelper.rotateX(animatorProps.rx.v * mult);
                }
              }
              if (animatorProps.o.propType) {
                if (mult.length) {
                  elemOpacity += (animatorProps.o.v * mult[0] - elemOpacity) * mult[0];
                } else {
                  elemOpacity += (animatorProps.o.v * mult - elemOpacity) * mult;
                }
              }
              if (documentData.strokeWidthAnim && animatorProps.sw.propType) {
                if (mult.length) {
                  sw += animatorProps.sw.v * mult[0];
                } else {
                  sw += animatorProps.sw.v * mult;
                }
              }
              if (documentData.strokeColorAnim && animatorProps.sc.propType) {
                for (k = 0; k < 3; k += 1) {
                  if (mult.length) {
                    sc[k] += (animatorProps.sc.v[k] - sc[k]) * mult[0];
                  } else {
                    sc[k] += (animatorProps.sc.v[k] - sc[k]) * mult;
                  }
                }
              }
              if (documentData.fillColorAnim && documentData.fc) {
                if (animatorProps.fc.propType) {
                  for (k = 0; k < 3; k += 1) {
                    if (mult.length) {
                      fc[k] += (animatorProps.fc.v[k] - fc[k]) * mult[0];
                    } else {
                      fc[k] += (animatorProps.fc.v[k] - fc[k]) * mult;
                    }
                  }
                }
                if (animatorProps.fh.propType) {
                  if (mult.length) {
                    fc = addHueToRGB(fc, animatorProps.fh.v * mult[0]);
                  } else {
                    fc = addHueToRGB(fc, animatorProps.fh.v * mult);
                  }
                }
                if (animatorProps.fs.propType) {
                  if (mult.length) {
                    fc = addSaturationToRGB(fc, animatorProps.fs.v * mult[0]);
                  } else {
                    fc = addSaturationToRGB(fc, animatorProps.fs.v * mult);
                  }
                }
                if (animatorProps.fb.propType) {
                  if (mult.length) {
                    fc = addBrightnessToRGB(fc, animatorProps.fb.v * mult[0]);
                  } else {
                    fc = addBrightnessToRGB(fc, animatorProps.fb.v * mult);
                  }
                }
              }
            }
            for (j = 0; j < jLen; j += 1) {
              animatorProps = animators[j].a;
              if (animatorProps.p.propType) {
                animatorSelector = animators[j].s;
                mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
                if (this._hasMaskedPath) {
                  if (mult.length) {
                    matrixHelper.translate(0, animatorProps.p.v[1] * mult[0], -animatorProps.p.v[2] * mult[1]);
                  } else {
                    matrixHelper.translate(0, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
                  }
                } else if (mult.length) {
                  matrixHelper.translate(
                    animatorProps.p.v[0] * mult[0],
                    animatorProps.p.v[1] * mult[1],
                    -animatorProps.p.v[2] * mult[2],
                  );
                } else {
                  matrixHelper.translate(
                    animatorProps.p.v[0] * mult,
                    animatorProps.p.v[1] * mult,
                    -animatorProps.p.v[2] * mult,
                  );
                }
              }
            }
            if (documentData.strokeWidthAnim) {
              letterSw = sw < 0 ? 0 : sw;
            }
            if (documentData.strokeColorAnim) {
              letterSc = sc;
            }
            if (documentData.fillColorAnim && documentData.fc) {
              letterFc = fc;
            }
            if (this._hasMaskedPath) {
              matrixHelper.translate(0, -documentData.ls);
              matrixHelper.translate(0, alignment[1] * yOff * 0.01 + yPos, 0);
              if (this._pathData.p.v) {
                tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                var rot = (Math.atan(tanAngle) * 180) / Math.PI;
                if (currentPoint.point[0] < prevPoint.point[0]) {
                  rot += 180;
                }
                matrixHelper.rotate((-rot * Math.PI) / 180);
              }
              matrixHelper.translate(xPathPos, yPathPos, 0);
              currentLength -= alignment[0] * letters[i].an * 0.005;
              if (letters[i + 1] && ind !== letters[i + 1].ind) {
                currentLength += letters[i].an / 2;
                currentLength += documentData.tr * 0.001 * documentData.finalSize;
              }
            } else {
              matrixHelper.translate(xPos, yPos, 0);
              if (documentData.ps) {
                // matrixHelper.translate(documentData.ps[0],documentData.ps[1],0);
                matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
              }
              switch (documentData.j) {
                case 1:
                  matrixHelper.translate(
                    letters[i].animatorJustifyOffset +
                      documentData.justifyOffset +
                      (documentData.boxWidth - documentData.lineWidths[letters[i].line]),
                    0,
                    0,
                  );
                  break;
                case 2:
                  matrixHelper.translate(
                    letters[i].animatorJustifyOffset +
                      documentData.justifyOffset +
                      (documentData.boxWidth - documentData.lineWidths[letters[i].line]) / 2,
                    0,
                    0,
                  );
                  break;
              }
              matrixHelper.translate(0, -documentData.ls);
              matrixHelper.translate(offf, 0, 0);
              matrixHelper.translate(alignment[0] * letters[i].an * 0.005, alignment[1] * yOff * 0.01, 0);
              xPos += letters[i].l + documentData.tr * 0.001 * documentData.finalSize;
            }
            if (renderType === 'html') {
              letterM = matrixHelper.toCSS();
            } else if (renderType === 'svg') {
              letterM = matrixHelper.to2dCSS();
            } else {
              letterP = [
                matrixHelper.props[0],
                matrixHelper.props[1],
                matrixHelper.props[2],
                matrixHelper.props[3],
                matrixHelper.props[4],
                matrixHelper.props[5],
                matrixHelper.props[6],
                matrixHelper.props[7],
                matrixHelper.props[8],
                matrixHelper.props[9],
                matrixHelper.props[10],
                matrixHelper.props[11],
                matrixHelper.props[12],
                matrixHelper.props[13],
                matrixHelper.props[14],
                matrixHelper.props[15],
              ];
            }
            letterO = elemOpacity;
          }
          if (renderedLettersCount <= i) {
            letterValue = new LetterProps(letterO, letterSw, letterSc, letterFc, letterM, letterP);
            this.renderedLetters.push(letterValue);
            renderedLettersCount += 1;
            this.lettersChangedFlag = true;
          } else {
            letterValue = this.renderedLetters[i];
            this.lettersChangedFlag =
              letterValue.update(letterO, letterSw, letterSc, letterFc, letterM, letterP) || this.lettersChangedFlag;
          }
        }
      },

      /**
       * a
       */
    },
    {
      key: 'getValue',
      value: function getValue(frameId) {
        if (frameId === this._frameId) {
          return;
        }
        this._frameId = frameId;
        this.iterateDynamicProperties(frameId);
      },
    },
  ]);
})(DynamicPropertyContainer);

/**
 * complete layers
 * @private
 * @param {*} layers
 * @param {*} comps
 * @param {*} fontManager
 */
function completeLayers(layers, comps, fontManager) {
  var layerData;
  // let animArray; let lastFrame;
  var i;
  var len = layers.length;
  var j;
  var jLen;
  var k;
  var kLen;
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
      var maskProps = layerData.masksProperties;
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
  var i = 0;
  var len = comps.length;
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
  var i;
  var len = arr.length;
  var j;
  var jLen;
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
  var i;
  var len = path.i.length;
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
  var animVersion = animVersionString ? animVersionString.split('.') : [100, 100, 100];
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
var checkText = (function () {
  var minimumVersion = [4, 4, 14];

  /**
   * updateTextLayer
   * @param {*} textLayer textLayer
   */
  function updateTextLayer(textLayer) {
    var documentData = textLayer.t.d;
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
    var i;
    var len = layers.length;
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
        var i;
        var len = animationData.assets.length;
        for (i = 0; i < len; i += 1) {
          if (animationData.assets[i].layers) {
            iterateLayers(animationData.assets[i].layers);
          }
        }
      }
    }
  };
})();
var checkChars = (function () {
  var minimumVersion = [4, 7, 99];
  return function (animationData) {
    if (animationData.chars && !checkVersion(minimumVersion, animationData.v)) {
      var i;
      var len = animationData.chars.length;
      var j;
      var jLen; // let k; let kLen;
      var pathData;
      var paths;
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
var checkColors = (function () {
  var minimumVersion = [4, 1, 9];

  /**
   * iterateShapes
   * @param {*} shapes shapes
   */
  function iterateShapes(shapes) {
    var i;
    var len = shapes.length;
    var j;
    var jLen;
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
    var i;
    var len = layers.length;
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
        var i;
        var len = animationData.assets.length;
        for (i = 0; i < len; i += 1) {
          if (animationData.assets[i].layers) {
            iterateLayers(animationData.assets[i].layers);
          }
        }
      }
    }
  };
})();
var checkShapes = (function () {
  var minimumVersion = [4, 4, 18];

  /**
   * completeShapes
   * @param {*} arr arr
   */
  function completeShapes(arr) {
    var i;
    var len = arr.length;
    var j;
    var jLen;
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
    var layerData;
    var i;
    var len = layers.length;
    var j;
    var jLen;
    var k;
    var kLen;
    for (i = 0; i < len; i += 1) {
      layerData = layers[i];
      if (layerData.hasMask) {
        var maskProps = layerData.masksProperties;
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
        var i;
        var len = animationData.assets.length;
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
 */
function completeText(data) {
  if (data.t.a.length === 0 && !('m' in data.t.p)) {
    data.singleShape = true;
  }
}
var DataManager = {
  completeData: completeData,
  checkColors: checkColors,
  checkChars: checkChars,
  checkShapes: checkShapes,
  completeLayers: completeLayers,
};

/**
 * BaseLottieLayer, most lottie layer are extend from this
 * @private
 */
var BaseLottieLayer = /*#__PURE__*/ (function (_Eventer) {
  /**
   * require lottie data about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session data
   */
  function BaseLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, BaseLottieLayer);
    _this = _callSuper(this, BaseLottieLayer);
    _this.data = layer;
    _this.is3D = !!_this.data.ddd;
    if (_this.data.sr === undefined) {
      _this.data.sr = 1;
    }
    _this.session = session;
    _this.blendMode = layer.bm || 0;
    _this.offsetTime = layer.st || 0;
    _this.fullname = layer.nm || '';
    _this.idname = layer.ln || '';
    _this.classnames = layer.cl ? layer.cl.split(' ') : [];
    var _this$session = _this.session,
      local = _this$session.local,
      global = _this$session.global;
    _this.isOverlapLayer = _this.data.op >= local.op - local.st;
    _this.isOverlapMode = global.overlapMode;
    _this.display = null;
    _this.transformHierarchy = null;
    _this.isHierarchyBySomeLayer = false;
    _this.parent = null;
    _this._isInRange = false;

    // list of animated properties
    _this.dynamicProperties = [];
    _this.transform = null;
    if (_this.data.ks) {
      _this.transform = new TransformFrames(_this, _this.data.ks);
      if (_this.data.ao) {
        _this.transform.autoOriented = true;
      }
    }
    _this.masks = null;
    if (_this.checkMasks()) {
      _this.masks = new MaskFrames(_this, _this.data.masksProperties);
    }
    return _this;
  }

  /**
   * a
   */
  _inherits(BaseLottieLayer, _Eventer);
  return _createClass(BaseLottieLayer, [
    {
      key: 'isInRange',
      get: function get() {
        return this._isInRange;
      },

      /**
       * @param {boolean} value
       */ set: function set(value) {
        if (value !== this._isInRange) {
          this._isInRange = value;
          this._mdf = true;
        }
      },

      /**
       * check this layer have available mask
       * @return {boolean}
       */
    },
    {
      key: 'checkMasks',
      value: function checkMasks() {
        if (!this.data.hasMask) {
          return false;
        }
        var i = 0;
        var len = this.data.masksProperties.length;
        while (i < len) {
          if (this.data.masksProperties[i].mode !== 'n' && this.data.masksProperties[i].cl !== false) {
            return true;
          }
          i += 1;
        }
        return false;
      },

      /**
       * a
       */
    },
    {
      key: 'outTypeExpressionMode',
      value: function outTypeExpressionMode() {
        this._hasOutTypeExpression = true;
        if (this.isOverlapLayer) {
          this.needUpdateOverlap = true;
        }
      },

      /**
       * Calculates all dynamic values
       * @param {number} frameNum current frame number in Layer's time
       * @param {boolean} isVisible if layers is currently in range
       */
    },
    {
      key: 'prepareProperties',
      value: function prepareProperties(frameNum, isVisible) {
        var i;
        var len = this.dynamicProperties.length;
        for (i = 0; i < len; i += 1) {
          if (isVisible || (this.isHierarchyBySomeLayer && this.dynamicProperties[i].propType === 'transform')) {
            this.dynamicProperties[i].getValue(frameNum);
            if (this.dynamicProperties[i]._mdf) {
              this._mdf = true;
            }
          }
        }
      },

      /**
       *
       * @param {*} prop a
       */
    },
    {
      key: 'addDynamicProperty',
      value: function addDynamicProperty(prop) {
        if (this.dynamicProperties.indexOf(prop) === -1) {
          this.dynamicProperties.push(prop);
        }
      },

      /**
       * set transform hierarchy
       * @param {*} layer lottie layer
       */
    },
    {
      key: 'setTransformHierarchy',
      value: function setTransformHierarchy(layer) {
        this.transformHierarchy = layer;
        layer.isHierarchyBySomeLayer = true;
        // this.display.setHierarchy(elem.display);
      },

      /**
       * display object
       * @param {*} display
       */
    },
    {
      key: 'setDisplay',
      value: function setDisplay(display) {
        this.display = display;
        this.updateLottieToDisplay(true);
      },

      /**
       * a
       * @param {boolean} force a
       */
    },
    {
      key: 'updateLottieToDisplay',
      value: function updateLottieToDisplay(force) {
        if (this.display) this.display.updateLottie(this, force);
      },
      /**
       *
       * @param {number} frameNum current frame number in Layer's time
       * @return {boolean}
       */
    },
    {
      key: 'checkLayerLimits',
      value: function checkLayerLimits(frameNum) {
        return this.data.ip <= frameNum && this.data.op >= frameNum;
      },

      /**
       * update this layer frame
       * @param {number} frameNum frameNum
       * @param {boolean} forceUpdate forceUpdate
       */
    },
    {
      key: 'updateLayerFrame',
      value: function updateLayerFrame(frameNum, forceUpdate) {
        this._mdf = false;
        if (this.isOverlapMode && this.isOverlapLayer) {
          this.isInRange = frameNum >= this.data.ip;
        } else {
          this.isInRange = this.checkLayerLimits(frameNum);
        }
        this.prepareProperties(frameNum, forceUpdate || this.isInRange);
      },

      /**
       * update frame
       * @param {number} frameNum frameNum
       */
    },
    {
      key: 'updateFrame',
      value: function updateFrame(frameNum) {
        this.updateLayerFrame(frameNum);
        if (this._mdf) {
          // this.emit('updatelayer', this);
          // this.emit('update', this);
          this.updateLottieToDisplay();
        }
      },
    },
  ]);
})(Eventer);

/**
 * CameraLottieLayer, camera lottie layer
 * @extends BaseLottieLayer
 */
var CameraLottieLayer = /*#__PURE__*/ (function (_BaseLottieLayer) {
  /**
   * require lottie data about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session data
   */
  function CameraLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, CameraLottieLayer);
    _this = _callSuper(this, CameraLottieLayer, [layer, session]);
    _this.localSize = session.local.size;
    _this.collapseSize = session.local.collapseSize;
    _this.isOneNodeCamera = !_this.data.ks.a;
    _this.isNullCamera = false;
    _this.pe = PropertyFactory.getProp(_this, _this.data.pe, 0, 0, _this);
    _this.updateLayerFrame(initialDefaultFrame, true);
    return _this;
  }
  _inherits(CameraLottieLayer, _BaseLottieLayer);
  return _createClass(CameraLottieLayer);
})(BaseLottieLayer);

/**
 * CameraNullLottieLayer, camera lottie layer
 * @extends Eventer
 */
var CameraNullLottieLayer = /*#__PURE__*/ (function (_Eventer) {
  /**
   * require lottie data about this layer
   * @param {object} _ lottie data about this layer
   * @param {object} session parse session data
   */
  function CameraNullLottieLayer(_, session) {
    var _this;
    _classCallCheck(this, CameraNullLottieLayer);
    _this = _callSuper(this, CameraNullLottieLayer);
    _this.session = session;
    _this.fullname = 'nullcamera';
    _this.localSize = session.local.size;
    _this.collapseSize = session.local.collapseSize;
    _this.isOneNodeCamera = false;
    _this.isNullCamera = true;

    // is use collapseTransformation or not
    // const cp = session.local.cp;
    var _this$collapseSize = _this.collapseSize,
      width = _this$collapseSize.width,
      height = _this$collapseSize.height;
    _this.pe = {
      _mdf: false,
      v: Math.min(width, height) * 1.3888671875,
    };
    return _this;
  }

  /**
   * update frame
   */
  _inherits(CameraNullLottieLayer, _Eventer);
  return _createClass(CameraNullLottieLayer, [
    {
      key: 'updateFrame',
      value: function updateFrame() {},
    },
  ]);
})(Eventer);

/**
 * CompLottieLayer, pre-comp lottie layer
 * @extends BaseLottieLayer
 */
var CompLottieLayer = /*#__PURE__*/ (function (_BaseLottieLayer) {
  /**
   * require lottie data and parse session about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session date
   */
  function CompLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, CompLottieLayer);
    _this = _callSuper(this, CompLottieLayer, [layer, session]);
    _this.childLayers = [];
    _this._cmdf = false;
    _this.tm = null;
    if (_this.data.tm) {
      var frameRate = _this.session.global.frameRate;
      _this.tm = PropertyFactory.getProp(_this, _this.data.tm, 0, frameRate, _this);
    }
    _this.updateLayerFrame(initialDefaultFrame, true);
    return _this;
  }

  /**
   * update frame
   * @param {*} frameNum current frame number
   */
  _inherits(CompLottieLayer, _BaseLottieLayer);
  return _createClass(CompLottieLayer, [
    {
      key: 'updateFrame',
      value: function updateFrame(frameNum) {
        this.updateLayerFrame(frameNum);

        // NOTICE: 需要确定减去 offsetTime 应该在sr计算之前还是之后
        frameNum -= this.offsetTime;
        if (this.tm) {
          var timeRemapped = this.tm.v;
          if (timeRemapped === this.data.op) {
            timeRemapped = this.data.op - 1;
          }
          frameNum = timeRemapped;
        } else {
          frameNum = frameNum / this.data.sr;
        }
        this.updateChildsFrame(frameNum);
        if (this._mdf || this._cmdf) {
          if (this._mdf) {
            this.updateLottieToDisplay();
          }
          this.emit('update', this);
        }
      },

      /**
       * update childs frame
       * @param {number} frameNum current frame number
       */
    },
    {
      key: 'updateChildsFrame',
      value: function updateChildsFrame(frameNum) {
        this._cmdf = false;
        for (var i = 0; i < this.childLayers.length; i++) {
          this.childLayers[i].updateFrame(frameNum);
          if (this.childLayers[i]._mdf || this.childLayers[i]._cmdf) {
            this._cmdf = true;
          }
        }
      },

      /**
       * add child layer
       * @param {BaseLottieLayer} node child layer
       */
    },
    {
      key: 'addChild',
      value: function addChild(node) {
        node.parent = this;
        this.childLayers.push(node);
      },
    },
  ]);
})(BaseLottieLayer);

/**
 * NullLottieLayer, null lottie layer
 * @extends BaseLottieLayer
 */
var NullLottieLayer = /*#__PURE__*/ (function (_BaseLottieLayer) {
  /**
   * require lottie data and parse session about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session date
   */
  function NullLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, NullLottieLayer);
    _this = _callSuper(this, NullLottieLayer, [layer, session]);
    _this.updateLayerFrame(initialDefaultFrame, true);
    return _this;
  }
  _inherits(NullLottieLayer, _BaseLottieLayer);
  return _createClass(NullLottieLayer);
})(BaseLottieLayer);

var maxWaitingTime = 5000;
var combinedCharacters = [
  2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376,
  2377, 2378, 2379, 2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403,
];
var emptyChar = {
  w: 0,
  size: 0,
  shapes: [],
};

/**
 * a
 * @param {*} def a
 * @param {*} fontData a
 * @return {*}
 */
function createHelper(def, fontData) {
  var tHelper = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  tHelper.style.fontSize = '100px';
  // tHelper.style.fontFamily = fontData.fFamily;

  var fontProps = getFontProperties(fontData);
  tHelper.setAttribute('font-family', fontData.fFamily);
  tHelper.setAttribute('font-style', fontProps.style);
  tHelper.setAttribute('font-weight', fontProps.weight);
  tHelper.textContent = '1';
  if (fontData.fClass) {
    tHelper.style.fontFamily = 'inherit';
    tHelper.setAttribute('class', fontData.fClass);
  } else {
    tHelper.style.fontFamily = fontData.fFamily;
  }
  def.appendChild(tHelper);
  // const tCanvasHelper = document.createElement('canvas').getContext('2d');
  // tCanvasHelper.font = fontData.fWeight + ' ' + fontData.fStyle + ' 100px '+ fontData.fFamily;
  // tCanvasHelper.font = ' 100px '+ fontData.fFamily;
  return tHelper;
}

/**
 * a
 * @param {*} font a
 * @return {*}
 */
function trimFontOptions(font) {
  var familyArray = font.split(',');
  var len = familyArray.length;
  var enabledFamilies = [];
  for (var i = 0; i < len; i += 1) {
    if (familyArray[i] !== 'sans-serif' && familyArray[i] !== 'monospace') {
      enabledFamilies.push(familyArray[i]);
    }
  }
  return enabledFamilies.join(',');
}

/**
 * a
 * @param {*} font a
 * @param {*} family a
 * @return {*}
 */
function setUpNode(font, family) {
  var parentNode = document.createElement('span');
  parentNode.style.fontFamily = family;
  var node = document.createElement('span');
  // Characters that vary significantly among different fonts
  node.innerText = 'giItT1WQy@!-/#';
  // Visible - so we can measure it - but not on the screen
  parentNode.style.position = 'absolute';
  parentNode.style.left = '-10000px';
  parentNode.style.top = '-10000px';
  // Large font size makes even subtle changes obvious
  parentNode.style.fontSize = '300px';
  // Reset any font properties
  parentNode.style.fontVariant = 'normal';
  parentNode.style.fontStyle = 'normal';
  parentNode.style.fontWeight = 'normal';
  parentNode.style.letterSpacing = '0';
  parentNode.appendChild(node);
  document.body.appendChild(parentNode);

  // Remember width with no applied web font
  var width = node.offsetWidth;
  node.style.fontFamily = trimFontOptions(font) + ', ' + family;
  return {
    node: node,
    w: width,
    parent: parentNode,
  };
}

/**
 * a
 */
var FontManager = /*#__PURE__*/ (function () {
  /**
   * a
   */
  function FontManager() {
    _classCallCheck(this, FontManager);
    this.fonts = [];
    this.chars = null;
    this.typekitLoaded = 0;
    this.isLoaded = false;
    this._warned = false;
    this.initTime = Date.now();
    this.setIsLoadedBinded = this.setIsLoaded.bind(this);
    this.checkLoadedFontsBinded = this.checkLoadedFonts.bind(this);
  }

  /**
   * a
   */
  return _createClass(FontManager, [
    {
      key: 'checkLoadedFonts',
      value: function checkLoadedFonts() {
        var len = this.fonts.length;
        var node;
        var w;
        var loadedCount = len;
        for (var i = 0; i < len; i++) {
          if (this.fonts[i].loaded) {
            loadedCount -= 1;
            continue;
          }
          if (this.fonts[i].fOrigin === 'n' || this.fonts[i].origin === 0) {
            this.fonts[i].loaded = true;
          } else {
            node = this.fonts[i].monoCase.node;
            w = this.fonts[i].monoCase.w;
            if (node.offsetWidth !== w) {
              loadedCount -= 1;
              this.fonts[i].loaded = true;
            } else {
              node = this.fonts[i].sansCase.node;
              w = this.fonts[i].sansCase.w;
              if (node.offsetWidth !== w) {
                loadedCount -= 1;
                this.fonts[i].loaded = true;
              }
            }
            if (this.fonts[i].loaded) {
              this.fonts[i].sansCase.parent.parentNode.removeChild(this.fonts[i].sansCase.parent);
              this.fonts[i].monoCase.parent.parentNode.removeChild(this.fonts[i].monoCase.parent);
            }
          }
        }
        if (loadedCount !== 0 && Date.now() - this.initTime < maxWaitingTime) {
          setTimeout(this.checkLoadedFontsBinded, 20);
        } else {
          setTimeout(this.setIsLoadedBinded, 10);
        }
      },

      /**
       * a
       * @param {*} fontData a
       * @param {*} defs a
       */
    },
    {
      key: 'addFonts',
      value: function addFonts(fontData, defs) {
        if (!fontData) {
          this.isLoaded = true;
          return;
        }
        if (this.chars) {
          this.isLoaded = true;
          this.fonts = fontData.list;
          return;
        }
        var fontArr = fontData.list;
        var len = fontArr.length;
        var _pendingFonts = len;
        for (var i = 0; i < len; i += 1) {
          var shouldLoadFont = true;
          var loadedSelector = void 0;
          var j = void 0;
          fontArr[i].loaded = false;
          fontArr[i].monoCase = setUpNode(fontArr[i].fFamily, 'monospace');
          fontArr[i].sansCase = setUpNode(fontArr[i].fFamily, 'sans-serif');
          if (!fontArr[i].fPath) {
            fontArr[i].loaded = true;
            _pendingFonts -= 1;
          } else if (fontArr[i].fOrigin === 'p' || fontArr[i].origin === 3) {
            loadedSelector = document.querySelectorAll(
              'style[f-forigin="p"][f-family="' +
                fontArr[i].fFamily +
                '"], style[f-origin="3"][f-family="' +
                fontArr[i].fFamily +
                '"]',
            );
            if (loadedSelector.length > 0) {
              shouldLoadFont = false;
            }
            if (shouldLoadFont) {
              var s = document.createElement('style');
              s.setAttribute('f-forigin', fontArr[i].fOrigin);
              s.setAttribute('f-origin', fontArr[i].origin);
              s.setAttribute('f-family', fontArr[i].fFamily);
              s.type = 'text/css';
              s.innerText =
                '@font-face {' +
                'font-family: ' +
                fontArr[i].fFamily +
                "; font-style: normal; src: url('" +
                fontArr[i].fPath +
                "');}";
              defs.appendChild(s);
            }
          } else if (fontArr[i].fOrigin === 'g' || fontArr[i].origin === 1) {
            loadedSelector = document.querySelectorAll('link[f-forigin="g"], link[f-origin="1"]');
            for (j = 0; j < loadedSelector.length; j++) {
              if (loadedSelector[j].href.indexOf(fontArr[i].fPath) !== -1) {
                // Font is already loaded
                shouldLoadFont = false;
              }
            }
            if (shouldLoadFont) {
              var l = document.createElement('link');
              l.setAttribute('f-forigin', fontArr[i].fOrigin);
              l.setAttribute('f-origin', fontArr[i].origin);
              l.type = 'text/css';
              l.rel = 'stylesheet';
              l.href = fontArr[i].fPath;
              document.body.appendChild(l);
            }
          } else if (fontArr[i].fOrigin === 't' || fontArr[i].origin === 2) {
            loadedSelector = document.querySelectorAll('script[f-forigin="t"], script[f-origin="2"]');
            for (j = 0; j < loadedSelector.length; j++) {
              if (fontArr[i].fPath === loadedSelector[j].src) {
                // Font is already loaded
                shouldLoadFont = false;
              }
            }
            if (shouldLoadFont) {
              var sc = document.createElement('link');
              sc.setAttribute('f-forigin', fontArr[i].fOrigin);
              sc.setAttribute('f-origin', fontArr[i].origin);
              sc.setAttribute('rel', 'stylesheet');
              sc.setAttribute('href', fontArr[i].fPath);
              defs.appendChild(sc);
            }
          }
          fontArr[i].helper = createHelper(defs, fontArr[i]);
          fontArr[i].cache = {};
          this.fonts.push(fontArr[i]);
        }
        if (_pendingFonts === 0) {
          this.isLoaded = true;
        } else {
          // On some cases even if the font is loaded, it won't load correctly when measuring text on canvas.
          // Adding this timeout seems to fix it
          setTimeout(this.checkLoadedFonts.bind(this), 100);
        }
      },

      /**
       * a
       * @param {*} chars a
       */
    },
    {
      key: 'addChars',
      value: function addChars(chars) {
        if (!chars) {
          return;
        }
        if (!this.chars) {
          this.chars = [];
        }
        var len = chars.length;
        var jLen = this.chars.length;
        for (var i = 0; i < len; i += 1) {
          var j = 0;
          var found = false;
          while (j < jLen) {
            if (
              this.chars[j].style === chars[i].style &&
              this.chars[j].fFamily === chars[i].fFamily &&
              this.chars[j].ch === chars[i].ch
            ) {
              found = true;
            }
            j += 1;
          }
          if (!found) {
            this.chars.push(chars[i]);
            jLen += 1;
          }
        }
      },

      /**
       * a
       * @param {*} char a
       * @param {*} style a
       * @param {*} font a
       * @return {*}
       */
    },
    {
      key: 'getCharData',
      value: function getCharData(_char, style, font) {
        var i = 0;
        var len = this.chars.length;
        while (i < len) {
          if (this.chars[i].ch === _char && this.chars[i].style === style && this.chars[i].fFamily === font) {
            return this.chars[i];
          }
          i += 1;
        }
        if (((typeof _char === 'string' && _char.charCodeAt(0) !== 13) || !_char) && !this._warned) {
          this._warned = true;
          console.warn('Missing character from exported characters list: ', _char, style, font);
        }
        return emptyChar;
      },

      /**
       * a
       * @param {*} char a
       * @param {*} fontName a
       * @param {*} size a
       * @return {*}
       */
    },
    {
      key: 'measureText',
      value: function measureText(_char2, fontName, size) {
        var fontData = this.getFontByName(fontName);
        var index = _char2.charCodeAt(0);
        if (!fontData.cache[index + 1]) {
          var tHelper = fontData.helper;
          // Canvas version
          // fontData.cache[index] = tHelper.measureText(char).width / 100;
          // SVG version
          // console.log(tHelper.getBBox().width)
          if (_char2 === ' ') {
            tHelper.textContent = '|' + _char2 + '|';
            var doubleSize = tHelper.getComputedTextLength();
            tHelper.textContent = '||';
            var singleSize = tHelper.getComputedTextLength();
            fontData.cache[index + 1] = (doubleSize - singleSize) / 100;
          } else {
            tHelper.textContent = _char2;
            fontData.cache[index + 1] = tHelper.getComputedTextLength() / 100;
          }
        }
        return fontData.cache[index + 1] * size;
      },

      /**
       * a
       * @param {*} name a
       * @return {*}
       */
    },
    {
      key: 'getFontByName',
      value: function getFontByName(name) {
        var i = 0;
        var len = this.fonts.length;
        while (i < len) {
          if (this.fonts[i].fName === name) {
            return this.fonts[i];
          }
          i += 1;
        }
        return this.fonts[0];
      },

      /**
       * a
       */
    },
    {
      key: 'setIsLoaded',
      value: function setIsLoaded() {
        this.isLoaded = true;
      },
    },
  ]);
})();
FontManager.getCombinedCharacterCodes = function getCombinedCharacterCodes() {
  return combinedCharacters;
};

/**
 * TextProperty
 */
var TextProperty = /*#__PURE__*/ (function () {
  /**
   * a
   * @param {*} elem a
   * @param {*} data a
   */
  function TextProperty(elem, data) {
    _classCallCheck(this, TextProperty);
    this._frameId = -1;
    this.pv = '';
    this.v = '';
    this.kf = false;
    this._isFirstFrame = true;
    this._mdf = false;
    this.data = data;
    this.elem = elem;
    this.comp = this.elem.comp;
    this.keysIndex = 0;
    this.canResize = false;
    this.minimumFontSize = 1;
    this.effectsSequence = [];
    this.defaultBoxWidth = [0, 0];
    this.currentData = {
      ascent: 0,
      boxWidth: this.defaultBoxWidth,
      f: '',
      fStyle: '',
      fWeight: '',
      fc: '',
      j: '',
      justifyOffset: '',
      l: [],
      lh: 0,
      lineWidths: [],
      ls: '',
      of: '',
      s: '',
      sc: '',
      sw: 0,
      t: 0,
      tr: 0,
      sz: 0,
      ps: null,
      fillColorAnim: false,
      strokeColorAnim: false,
      strokeWidthAnim: false,
      yOffset: 0,
      finalSize: 0,
      finalText: [],
      finalLineHeight: 0,
      __complete: false,
    };
    this.copyData(this.currentData, this.data.d.k[0].s);
    if (!this.searchProperty()) {
      this.completeTextData(this.currentData);
    }
  }

  /**
   * a
   * @param {*} obj a
   * @param {*} data a
   * @return {*}
   */
  return _createClass(TextProperty, [
    {
      key: 'copyData',
      value: function copyData(obj, data) {
        for (var s in data) {
          // eslint-disable-next-line no-prototype-builtins
          if (data.hasOwnProperty(s)) {
            obj[s] = data[s];
          }
        }
        return obj;
      },

      /**
       * a
       * @param {*} data a
       */
    },
    {
      key: 'setCurrentData',
      value: function setCurrentData(data) {
        if (!data.__complete) {
          this.completeTextData(data);
        }
        this.currentData = data;
        this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth;
        this._mdf = true;
      },

      /**
       * a
       * @return {*}
       */
    },
    {
      key: 'searchProperty',
      value: function searchProperty() {
        return this.searchKeyframes();
      },

      /**
       * a
       * @return {*}
       */
    },
    {
      key: 'searchKeyframes',
      value: function searchKeyframes() {
        this.kf = this.data.d.k.length > 1;
        if (this.kf) {
          this.addEffect(this.getKeyframeValue.bind(this));
        }
        return this.kf;
      },

      /**
       * a
       * @param {*} effectFunction a
       */
    },
    {
      key: 'addEffect',
      value: function addEffect(effectFunction) {
        this.effectsSequence.push(effectFunction);
        this.elem.addDynamicProperty(this);
      },

      /**
       * a
       * @param {*} _finalValue a
       */
    },
    {
      key: 'getValue',
      value: function getValue(_finalValue) {
        if ((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !_finalValue) {
          return;
        }
        this.currentData.t = this.data.d.k[this.keysIndex].s.t;
        var currentValue = this.currentData;
        var currentIndex = this.keysIndex;
        if (this.lock) {
          this.setCurrentData(this.currentData);
          return;
        }
        this.lock = true;
        this._mdf = false;
        // let multipliedValue;
        var i;
        var len = this.effectsSequence.length;
        var finalValue = _finalValue || this.data.d.k[this.keysIndex].s;
        for (i = 0; i < len; i += 1) {
          // Checking if index changed to prevent creating a new object every time the expression updates.
          if (currentIndex !== this.keysIndex) {
            finalValue = this.effectsSequence[i](finalValue, finalValue.t);
          } else {
            finalValue = this.effectsSequence[i](this.currentData, finalValue.t);
          }
        }
        if (currentValue !== finalValue) {
          this.setCurrentData(finalValue);
        }
        this.pv = this.v = this.currentData;
        this.lock = false;
        this.frameId = this.elem.globalData.frameId;
      },

      /**
       * a
       * @return {*}
       */
    },
    {
      key: 'getKeyframeValue',
      value: function getKeyframeValue() {
        var textKeys = this.data.d.k;
        // let textDocumentData;
        var frameNum = this.elem.comp.renderedFrame;
        var i = 0;
        var len = textKeys.length;
        while (i <= len - 1) {
          // textDocumentData = textKeys[i].s;
          if (i === len - 1 || textKeys[i + 1].t > frameNum) {
            break;
          }
          i += 1;
        }
        if (this.keysIndex !== i) {
          this.keysIndex = i;
        }
        return this.data.d.k[this.keysIndex].s;
      },

      /**
       * a
       * @param {*} text a
       * @return {*}
       */
    },
    {
      key: 'buildFinalText',
      value: function buildFinalText(text) {
        var combinedCharacters = FontManager.getCombinedCharacterCodes();
        var charactersArray = [];
        var i = 0;
        var len = text.length;
        var charCode;
        while (i < len) {
          charCode = text.charCodeAt(i);
          if (combinedCharacters.indexOf(charCode) !== -1) {
            charactersArray[charactersArray.length - 1] += text.charAt(i);
          } else {
            if (charCode >= 0xd800 && charCode <= 0xdbff) {
              charCode = text.charCodeAt(i + 1);
              if (charCode >= 0xdc00 && charCode <= 0xdfff) {
                charactersArray.push(text.substr(i, 2));
                ++i;
              } else {
                charactersArray.push(text.charAt(i));
              }
            } else {
              charactersArray.push(text.charAt(i));
            }
          }
          i += 1;
        }
        return charactersArray;
      },

      /**
       * a
       * @param {*} documentData a
       */
    },
    {
      key: 'completeTextData',
      value: function completeTextData(documentData) {
        documentData.__complete = true;
        var fontManager = this.elem.globalData.fontManager;
        var data = this.data;
        var letters = [];
        var i;
        var len;
        var newLineFlag;
        var index = 0;
        var val;
        var anchorGrouping = data.m.g;
        var currentSize = 0;
        var currentPos = 0;
        var currentLine = 0;
        var lineWidths = [];
        var lineWidth = 0;
        var maxLineWidth = 0;
        var j;
        var jLen;
        var fontData = fontManager.getFontByName(documentData.f);
        var charData;
        var cLength = 0;
        var fontProps = getFontProperties(fontData);
        documentData.fWeight = fontProps.weight;
        documentData.fStyle = fontProps.style;
        documentData.finalSize = documentData.s;
        documentData.finalText = this.buildFinalText(documentData.t);
        len = documentData.finalText.length;
        documentData.finalLineHeight = documentData.lh;
        var trackingOffset = (documentData.tr / 1000) * documentData.finalSize;
        var charCode;
        if (documentData.sz) {
          var flag = true;
          var boxWidth = documentData.sz[0];
          var boxHeight = documentData.sz[1];
          var currentHeight;
          var finalText;
          while (flag) {
            finalText = this.buildFinalText(documentData.t);
            currentHeight = 0;
            lineWidth = 0;
            len = finalText.length;
            trackingOffset = (documentData.tr / 1000) * documentData.finalSize;
            var lastSpaceIndex = -1;
            for (i = 0; i < len; i += 1) {
              charCode = finalText[i].charCodeAt(0);
              newLineFlag = false;
              if (finalText[i] === ' ') {
                lastSpaceIndex = i;
              } else if (charCode === 13 || charCode === 3) {
                lineWidth = 0;
                newLineFlag = true;
                currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
              }
              if (fontManager.chars) {
                charData = fontManager.getCharData(finalText[i], fontData.fStyle, fontData.fFamily);
                cLength = newLineFlag ? 0 : (charData.w * documentData.finalSize) / 100;
              } else {
                // tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
                cLength = fontManager.measureText(finalText[i], documentData.f, documentData.finalSize);
              }
              if (lineWidth + cLength > boxWidth && finalText[i] !== ' ') {
                if (lastSpaceIndex === -1) {
                  len += 1;
                } else {
                  i = lastSpaceIndex;
                }
                currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
                finalText.splice(i, lastSpaceIndex === i ? 1 : 0, '\r');
                // finalText = finalText.substr(0,i) + "\r" + finalText.substr(i === lastSpaceIndex ? i + 1 : i);
                lastSpaceIndex = -1;
                lineWidth = 0;
              } else {
                lineWidth += cLength;
                lineWidth += trackingOffset;
              }
            }
            currentHeight += (fontData.ascent * documentData.finalSize) / 100;
            if (this.canResize && documentData.finalSize > this.minimumFontSize && boxHeight < currentHeight) {
              documentData.finalSize -= 1;
              documentData.finalLineHeight = (documentData.finalSize * documentData.lh) / documentData.s;
            } else {
              documentData.finalText = finalText;
              len = documentData.finalText.length;
              flag = false;
            }
          }
        }
        lineWidth = -trackingOffset;
        cLength = 0;
        var uncollapsedSpaces = 0;
        var currentChar;
        for (i = 0; i < len; i += 1) {
          newLineFlag = false;
          currentChar = documentData.finalText[i];
          charCode = currentChar.charCodeAt(0);
          if (charCode === 13 || charCode === 3) {
            uncollapsedSpaces = 0;
            lineWidths.push(lineWidth);
            maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
            lineWidth = -2 * trackingOffset;
            val = '';
            newLineFlag = true;
            currentLine += 1;
          } else {
            val = currentChar;
          }
          if (fontManager.chars) {
            charData = fontManager.getCharData(
              currentChar,
              fontData.fStyle,
              fontManager.getFontByName(documentData.f).fFamily,
            );
            cLength = newLineFlag ? 0 : (charData.w * documentData.finalSize) / 100;
          } else {
            // var charWidth = fontManager.measureText(val, documentData.f, documentData.finalSize);
            // tCanvasHelper.font = documentData.finalSize + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
            cLength = fontManager.measureText(val, documentData.f, documentData.finalSize);
          }

          //
          if (currentChar === ' ') {
            uncollapsedSpaces += cLength + trackingOffset;
          } else {
            lineWidth += cLength + trackingOffset + uncollapsedSpaces;
            uncollapsedSpaces = 0;
          }
          letters.push({
            l: cLength,
            an: cLength,
            add: currentSize,
            n: newLineFlag,
            anIndexes: [],
            val: val,
            line: currentLine,
            animatorJustifyOffset: 0,
          });
          if (anchorGrouping == 2) {
            currentSize += cLength;
            if (val === '' || val === ' ' || i === len - 1) {
              if (val === '' || val === ' ') {
                currentSize -= cLength;
              }
              while (currentPos <= i) {
                letters[currentPos].an = currentSize;
                letters[currentPos].ind = index;
                letters[currentPos].extra = cLength;
                currentPos += 1;
              }
              index += 1;
              currentSize = 0;
            }
          } else if (anchorGrouping == 3) {
            currentSize += cLength;
            if (val === '' || i === len - 1) {
              if (val === '') {
                currentSize -= cLength;
              }
              while (currentPos <= i) {
                letters[currentPos].an = currentSize;
                letters[currentPos].ind = index;
                letters[currentPos].extra = cLength;
                currentPos += 1;
              }
              currentSize = 0;
              index += 1;
            }
          } else {
            letters[index].ind = index;
            letters[index].extra = 0;
            index += 1;
          }
        }
        documentData.l = letters;
        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
        lineWidths.push(lineWidth);
        if (documentData.sz) {
          documentData.boxWidth = documentData.sz[0];
          documentData.justifyOffset = 0;
        } else {
          documentData.boxWidth = maxLineWidth;
          switch (documentData.j) {
            case 1:
              documentData.justifyOffset = -documentData.boxWidth;
              break;
            case 2:
              documentData.justifyOffset = -documentData.boxWidth / 2;
              break;
            default:
              documentData.justifyOffset = 0;
          }
        }
        documentData.lineWidths = lineWidths;
        var animators = data.a;
        var animatorData;
        var letterData;
        jLen = animators.length;
        var based;
        var ind;
        var indexes = [];
        for (j = 0; j < jLen; j += 1) {
          animatorData = animators[j];
          if (animatorData.a.sc) {
            documentData.strokeColorAnim = true;
          }
          if (animatorData.a.sw) {
            documentData.strokeWidthAnim = true;
          }
          if (animatorData.a.fc || animatorData.a.fh || animatorData.a.fs || animatorData.a.fb) {
            documentData.fillColorAnim = true;
          }
          ind = 0;
          based = animatorData.s.b;
          for (i = 0; i < len; i += 1) {
            letterData = letters[i];
            letterData.anIndexes[j] = ind;
            if (
              (based == 1 && letterData.val !== '') ||
              (based == 2 && letterData.val !== '' && letterData.val !== ' ') ||
              (based == 3 && (letterData.n || letterData.val == ' ' || i == len - 1)) ||
              (based == 4 && (letterData.n || i == len - 1))
            ) {
              if (animatorData.s.rn === 1) {
                indexes.push(ind);
              }
              ind += 1;
            }
          }
          data.a[j].s.totalChars = ind;
          var currentInd = -1;
          var newInd = void 0;
          if (animatorData.s.rn === 1) {
            for (i = 0; i < len; i += 1) {
              letterData = letters[i];
              if (currentInd != letterData.anIndexes[j]) {
                currentInd = letterData.anIndexes[j];
                newInd = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
              }
              letterData.anIndexes[j] = newInd;
            }
          }
        }
        documentData.yOffset = documentData.finalLineHeight || documentData.finalSize * 1.2;
        documentData.ls = documentData.ls || 0;
        documentData.ascent = (fontData.ascent * documentData.finalSize) / 100;
      },

      /**
       * a
       * @param {*} newData a
       * @param {*} index a
       */
    },
    {
      key: 'updateDocumentData',
      value: function updateDocumentData(newData, index) {
        index = index === undefined ? this.keysIndex : index;
        var dData = this.copyData({}, this.data.d.k[index].s);
        dData = this.copyData(dData, newData);
        this.data.d.k[index].s = dData;
        this.recalculate(index);
        this.elem.addDynamicProperty(this);
      },

      /**
       * a
       * @param {*} index a
       */
    },
    {
      key: 'recalculate',
      value: function recalculate(index) {
        var dData = this.data.d.k[index].s;
        dData.__complete = false;
        this.keysIndex = 0;
        this._isFirstFrame = true;
        this.getValue(dData);
      },

      /**
       * a
       * @param {*} _canResize a
       */
    },
    {
      key: 'canResizeFont',
      value: function canResizeFont(_canResize) {
        this.canResize = _canResize;
        this.recalculate(this.keysIndex);
        this.elem.addDynamicProperty(this);
      },

      /**
       * a
       * @param {*} _fontValue a
       */
    },
    {
      key: 'setMinimumFontSize',
      value: function setMinimumFontSize(_fontValue) {
        this.minimumFontSize = Math.floor(_fontValue) || 1;
        this.recalculate(this.keysIndex);
        this.elem.addDynamicProperty(this);
      },
    },
  ]);
})();

/**
 * CompLottieLayer, pre-comp lottie layer
 * @extends BaseLottieLayer
 */
var TextLottieLayer = /*#__PURE__*/ (function (_BaseLottieLayer) {
  /**
   * require lottie data and parse session about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session date
   */
  function TextLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, TextLottieLayer);
    _this = _callSuper(this, TextLottieLayer, [layer, session]);
    _this.global = _this.globalData = session;
    _this.textProperty = new TextProperty(_this, layer.t, _this.dynamicProperties);
    _this.textAnimator = new TextAnimatorProperty(layer.t, _this.renderType, _this);
    _this.textAnimator.searchProperties(_this.dynamicProperties);
    _this.updateLayerFrame(initialDefaultFrame, true);
    return _this;
  }
  _inherits(TextLottieLayer, _BaseLottieLayer);
  return _createClass(TextLottieLayer);
})(BaseLottieLayer);

/**
 * ShapeLottieLayer, lottie shape layer
 * @extends BaseLottieLayer
 */
var ShapeLottieLayer = /*#__PURE__*/ (function (_BaseLottieLayer) {
  /**
   * require lottie data and parse session about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session date
   */
  function ShapeLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, ShapeLottieLayer);
    _this = _callSuper(this, ShapeLottieLayer, [layer, session]);
    _this.shapes = new ShapesFrames(_this, _this.data.shapes);
    _this.updateLayerFrame(initialDefaultFrame, true);
    return _this;
  }

  /**
   * get primitives in this shape layer
   * @return {StyleElem[]}
   */
  _inherits(ShapeLottieLayer, _BaseLottieLayer);
  return _createClass(ShapeLottieLayer, [
    {
      key: 'getPrimitives',
      value: function getPrimitives() {
        return this.shapes.stylesList;
      },
    },
  ]);
})(BaseLottieLayer);

/**
 * SolidLottieLayer, lottie solid layer
 * @extends BaseLottieLayer
 */
var SolidLottieLayer = /*#__PURE__*/ (function (_BaseLottieLayer) {
  /**
   * require lottie data and parse session about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session date
   */
  function SolidLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, SolidLottieLayer);
    _this = _callSuper(this, SolidLottieLayer, [layer, session]);
    _this.width = layer.sw;
    _this.height = layer.sh;
    _this.color = layer.sc;
    _this.updateLayerFrame(initialDefaultFrame, true);
    return _this;
  }
  _inherits(SolidLottieLayer, _BaseLottieLayer);
  return _createClass(SolidLottieLayer);
})(BaseLottieLayer);

/**
 * SpriteLottieLayer, lottie solid layer
 * @extends BaseLottieLayer
 */
var SpriteLottieLayer = /*#__PURE__*/ (function (_BaseLottieLayer) {
  /**
   * require lottie data and parse session about this layer
   * @param {object} layer lottie data about this layer
   * @param {object} session parse session date
   */
  function SpriteLottieLayer(layer, session) {
    var _this;
    _classCallCheck(this, SpriteLottieLayer);
    _this = _callSuper(this, SpriteLottieLayer, [layer, session]);
    _this.updateLayerFrame(initialDefaultFrame, true);
    return _this;
  }
  _inherits(SpriteLottieLayer, _BaseLottieLayer);
  return _createClass(SpriteLottieLayer);
})(BaseLottieLayer);

export {
  BezierEasing,
  CameraLottieLayer,
  CameraNullLottieLayer,
  CompLottieLayer,
  DataManager,
  DynamicPropertyContainer,
  Eventer,
  FontManager,
  MaskFrames,
  Matrix4,
  NullLottieLayer,
  PropertyFactory,
  ShapeLottieLayer,
  ShapesFrames,
  SolidLottieLayer,
  SpriteLottieLayer,
  TextAnimatorProperty,
  TextLottieLayer,
  Tools,
  TransformFrames,
};
//# sourceMappingURL=index.module.js.map
