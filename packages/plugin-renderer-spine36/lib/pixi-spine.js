var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value })
    : (obj[key] = value);
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== 'symbol' ? key + '' : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = value => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = value => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = x => (x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected));
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import {
  Texture as Texture$1,
  ExtensionType,
  checkExtension,
  Resolver,
  LoaderParserPriority,
  DOMAdapter,
  path,
  TextureSource,
  copySearchParams,
  extensions,
  Geometry,
  Buffer as Buffer2,
  BufferUsage,
  Shader,
  compileHighShaderGlProgram,
  colorBitGl,
  generateTextureBatchBitGl,
  roundPixelsBitGl,
  compileHighShaderGpuProgram,
  colorBit,
  generateTextureBatchBit,
  roundPixelsBit,
  getBatchSamplersUniformGroup,
  Batcher,
  Color as Color$1,
  collectAllRenderables,
  ViewContainer,
  Ticker,
  fastCopy,
  DEG_TO_RAD,
  Container,
  Cache,
  Assets as Assets$1,
  Graphics,
  Text,
} from 'pixi.js';
if (typeof window !== 'undefined' && window.PIXI) {
  const prevRequire = window.require;
  window.require = x => {
    if (prevRequire) return prevRequire(x);
    else if (x.startsWith('@pixi/') || x.startsWith('pixi.js')) return window.PIXI;
  };
}
class Attachment {
  constructor(name) {
    __publicField(this, 'name');
    if (name == null) throw new Error('name cannot be null.');
    this.name = name;
  }
}
const _VertexAttachment = class _VertexAttachment extends Attachment {
  constructor(name) {
    super(name);
    __publicField(this, 'id', (_VertexAttachment.nextID++ & 65535) << 11);
    __publicField(this, 'bones');
    __publicField(this, 'vertices');
    __publicField(this, 'worldVerticesLength', 0);
  }
  /** Transforms local vertices to world coordinates.
   * @param start The index of the first local vertex value to transform. Each vertex has 2 values, x and y.
   * @param count The number of world vertex values to output. Must be <= {@link #getWorldVerticesLength()} - start.
   * @param worldVertices The output world vertices. Must have a length >= offset + count.
   * @param offset The worldVertices index to begin writing values. */
  computeWorldVertices(slot, start, count, worldVertices, offset, stride) {
    count = offset + (count >> 1) * stride;
    let skeleton = slot.bone.skeleton;
    let deformArray = slot.attachmentVertices;
    let vertices = this.vertices;
    let bones = this.bones;
    if (bones == null) {
      if (deformArray.length > 0) vertices = deformArray;
      let bone = slot.bone;
      let x = bone.worldX;
      let y = bone.worldY;
      let a = bone.a,
        b = bone.b,
        c = bone.c,
        d = bone.d;
      for (let v2 = start, w = offset; w < count; v2 += 2, w += stride) {
        let vx = vertices[v2],
          vy = vertices[v2 + 1];
        worldVertices[w] = vx * a + vy * b + x;
        worldVertices[w + 1] = vx * c + vy * d + y;
      }
      return;
    }
    let v = 0,
      skip = 0;
    for (let i = 0; i < start; i += 2) {
      let n = bones[v];
      v += n + 1;
      skip += n;
    }
    let skeletonBones = skeleton.bones;
    if (deformArray.length == 0) {
      for (let w = offset, b = skip * 3; w < count; w += stride) {
        let wx = 0,
          wy = 0;
        let n = bones[v++];
        n += v;
        for (; v < n; v++, b += 3) {
          let bone = skeletonBones[bones[v]];
          let vx = vertices[b],
            vy = vertices[b + 1],
            weight = vertices[b + 2];
          wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
          wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
        }
        worldVertices[w] = wx;
        worldVertices[w + 1] = wy;
      }
    } else {
      let deform = deformArray;
      for (let w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
        let wx = 0,
          wy = 0;
        let n = bones[v++];
        n += v;
        for (; v < n; v++, b += 3, f += 2) {
          let bone = skeletonBones[bones[v]];
          let vx = vertices[b] + deform[f],
            vy = vertices[b + 1] + deform[f + 1],
            weight = vertices[b + 2];
          wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
          wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
        }
        worldVertices[w] = wx;
        worldVertices[w + 1] = wy;
      }
    }
  }
  /** Returns true if a deform originally applied to the specified attachment should be applied to this attachment. */
  applyDeform(sourceAttachment) {
    return this == sourceAttachment;
  }
};
__publicField(_VertexAttachment, 'nextID', 0);
let VertexAttachment = _VertexAttachment;
class IntSet {
  constructor() {
    __publicField(this, 'array', new Array());
  }
  add(value) {
    let contains = this.contains(value);
    this.array[value | 0] = value | 0;
    return !contains;
  }
  contains(value) {
    return this.array[value | 0] != void 0;
  }
  remove(value) {
    this.array[value | 0] = void 0;
  }
  clear() {
    this.array.length = 0;
  }
}
const _Color = class _Color {
  constructor(r = 0, g = 0, b = 0, a = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  set(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.clamp();
    return this;
  }
  setFromColor(c) {
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
    this.a = c.a;
    return this;
  }
  setFromString(hex) {
    hex = hex.charAt(0) == '#' ? hex.substr(1) : hex;
    this.r = parseInt(hex.substr(0, 2), 16) / 255;
    this.g = parseInt(hex.substr(2, 2), 16) / 255;
    this.b = parseInt(hex.substr(4, 2), 16) / 255;
    this.a = (hex.length != 8 ? 255 : parseInt(hex.substr(6, 2), 16)) / 255;
    return this;
  }
  add(r, g, b, a) {
    this.r += r;
    this.g += g;
    this.b += b;
    this.a += a;
    this.clamp();
    return this;
  }
  clamp() {
    if (this.r < 0) this.r = 0;
    else if (this.r > 1) this.r = 1;
    if (this.g < 0) this.g = 0;
    else if (this.g > 1) this.g = 1;
    if (this.b < 0) this.b = 0;
    else if (this.b > 1) this.b = 1;
    if (this.a < 0) this.a = 0;
    else if (this.a > 1) this.a = 1;
    return this;
  }
};
__publicField(_Color, 'WHITE', new _Color(1, 1, 1, 1));
__publicField(_Color, 'RED', new _Color(1, 0, 0, 1));
__publicField(_Color, 'GREEN', new _Color(0, 1, 0, 1));
__publicField(_Color, 'BLUE', new _Color(0, 0, 1, 1));
__publicField(_Color, 'MAGENTA', new _Color(1, 0, 1, 1));
let Color = _Color;
const _MathUtils = class _MathUtils {
  static clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }
  static cosDeg(degrees) {
    return Math.cos(degrees * _MathUtils.degRad);
  }
  static sinDeg(degrees) {
    return Math.sin(degrees * _MathUtils.degRad);
  }
  static signum(value) {
    return value > 0 ? 1 : value < 0 ? -1 : 0;
  }
  static toInt(x) {
    return x > 0 ? Math.floor(x) : Math.ceil(x);
  }
  static cbrt(x) {
    var y = Math.pow(Math.abs(x), 1 / 3);
    return x < 0 ? -y : y;
  }
  static randomTriangular(min, max) {
    return _MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
  }
  static randomTriangularWith(min, max, mode) {
    let u = Math.random();
    let d = max - min;
    if (u <= (mode - min) / d) return min + Math.sqrt(u * d * (mode - min));
    return max - Math.sqrt((1 - u) * d * (max - mode));
  }
};
__publicField(_MathUtils, 'PI', 3.1415927);
__publicField(_MathUtils, 'PI2', _MathUtils.PI * 2);
__publicField(_MathUtils, 'radiansToDegrees', 180 / _MathUtils.PI);
__publicField(_MathUtils, 'radDeg', _MathUtils.radiansToDegrees);
__publicField(_MathUtils, 'degreesToRadians', _MathUtils.PI / 180);
__publicField(_MathUtils, 'degRad', _MathUtils.degreesToRadians);
let MathUtils = _MathUtils;
class Interpolation {
  apply(start, end, a) {
    return start + (end - start) * this.applyInternal(a);
  }
}
class Pow extends Interpolation {
  constructor(power) {
    super();
    __publicField(this, 'power', 2);
    this.power = power;
  }
  applyInternal(a) {
    if (a <= 0.5) return Math.pow(a * 2, this.power) / 2;
    return Math.pow((a - 1) * 2, this.power) / (this.power % 2 == 0 ? -2 : 2) + 1;
  }
}
class PowOut extends Pow {
  constructor(power) {
    super(power);
  }
  applyInternal(a) {
    return Math.pow(a - 1, this.power) * (this.power % 2 == 0 ? -1 : 1) + 1;
  }
}
const _Utils = class _Utils {
  static arrayCopy(source, sourceStart, dest, destStart, numElements) {
    for (let i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
      dest[j] = source[i];
    }
  }
  static setArraySize(array, size, value = 0) {
    let oldSize = array.length;
    if (oldSize == size) return array;
    array.length = size;
    if (oldSize < size) {
      for (let i = oldSize; i < size; i++) array[i] = value;
    }
    return array;
  }
  static ensureArrayCapacity(array, size, value = 0) {
    if (array.length >= size) return array;
    return _Utils.setArraySize(array, size, value);
  }
  static newArray(size, defaultValue) {
    let array = new Array(size);
    for (let i = 0; i < size; i++) array[i] = defaultValue;
    return array;
  }
  static newFloatArray(size) {
    if (_Utils.SUPPORTS_TYPED_ARRAYS) {
      return new Float32Array(size);
    } else {
      let array = new Array(size);
      for (let i = 0; i < array.length; i++) array[i] = 0;
      return array;
    }
  }
  static newShortArray(size) {
    if (_Utils.SUPPORTS_TYPED_ARRAYS) {
      return new Int16Array(size);
    } else {
      let array = new Array(size);
      for (let i = 0; i < array.length; i++) array[i] = 0;
      return array;
    }
  }
  static toFloatArray(array) {
    return _Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
  }
  static toSinglePrecision(value) {
    return _Utils.SUPPORTS_TYPED_ARRAYS ? Math.fround(value) : value;
  }
  // This function is used to fix WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
  static webkit602BugfixHelper(alpha, pose) {}
};
__publicField(_Utils, 'SUPPORTS_TYPED_ARRAYS', typeof Float32Array !== 'undefined');
let Utils = _Utils;
class DebugUtils {
  static logBones(skeleton) {
    for (let i = 0; i < skeleton.bones.length; i++) {
      let bone = skeleton.bones[i];
      console.log(
        bone.data.name +
          ', ' +
          bone.a +
          ', ' +
          bone.b +
          ', ' +
          bone.c +
          ', ' +
          bone.d +
          ', ' +
          bone.worldX +
          ', ' +
          bone.worldY,
      );
    }
  }
}
class Pool {
  constructor(instantiator) {
    __publicField(this, 'items', new Array());
    __publicField(this, 'instantiator');
    this.instantiator = instantiator;
  }
  obtain() {
    return this.items.length > 0 ? this.items.pop() : this.instantiator();
  }
  free(item) {
    if (item.reset) item.reset();
    this.items.push(item);
  }
  freeAll(items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].reset) items[i].reset();
      this.items[i] = items[i];
    }
  }
  clear() {
    this.items.length = 0;
  }
}
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  length() {
    let x = this.x;
    let y = this.y;
    return Math.sqrt(x * x + y * y);
  }
  normalize() {
    let len = this.length();
    if (len != 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }
}
class TimeKeeper {
  constructor() {
    __publicField(this, 'maxDelta', 0.064);
    __publicField(this, 'framesPerSecond', 0);
    __publicField(this, 'delta', 0);
    __publicField(this, 'totalTime', 0);
    __publicField(this, 'lastTime', Date.now() / 1e3);
    __publicField(this, 'frameCount', 0);
    __publicField(this, 'frameTime', 0);
  }
  update() {
    var now = Date.now() / 1e3;
    this.delta = now - this.lastTime;
    this.frameTime += this.delta;
    this.totalTime += this.delta;
    if (this.delta > this.maxDelta) this.delta = this.maxDelta;
    this.lastTime = now;
    this.frameCount++;
    if (this.frameTime > 1) {
      this.framesPerSecond = this.frameCount / this.frameTime;
      this.frameTime = 0;
      this.frameCount = 0;
    }
  }
}
class WindowedMean {
  constructor(windowSize = 32) {
    __publicField(this, 'values');
    __publicField(this, 'addedValues', 0);
    __publicField(this, 'lastValue', 0);
    __publicField(this, 'mean', 0);
    __publicField(this, 'dirty', true);
    this.values = new Array(windowSize);
  }
  hasEnoughData() {
    return this.addedValues >= this.values.length;
  }
  addValue(value) {
    if (this.addedValues < this.values.length) this.addedValues++;
    this.values[this.lastValue++] = value;
    if (this.lastValue > this.values.length - 1) this.lastValue = 0;
    this.dirty = true;
  }
  getMean() {
    if (this.hasEnoughData()) {
      if (this.dirty) {
        let mean = 0;
        for (let i = 0; i < this.values.length; i++) {
          mean += this.values[i];
        }
        this.mean = mean / this.values.length;
        this.dirty = false;
      }
      return this.mean;
    } else {
      return 0;
    }
  }
}
class Animation {
  constructor(name, timelines, duration) {
    __publicField(this, 'name');
    __publicField(this, 'timelines');
    __publicField(this, 'duration');
    if (name == null) throw new Error('name cannot be null.');
    if (timelines == null) throw new Error('timelines cannot be null.');
    this.name = name;
    this.timelines = timelines;
    this.duration = duration;
  }
  apply(skeleton, lastTime, time, loop, events, alpha, pose, direction) {
    if (skeleton == null) throw new Error('skeleton cannot be null.');
    if (loop && this.duration != 0) {
      time %= this.duration;
      if (lastTime > 0) lastTime %= this.duration;
    }
    let timelines = this.timelines;
    for (let i = 0, n = timelines.length; i < n; i++)
      timelines[i].apply(skeleton, lastTime, time, events, alpha, pose, direction);
  }
  static binarySearch(values, target, step = 1) {
    let low = 0;
    let high = values.length / step - 2;
    if (high == 0) return step;
    let current = high >>> 1;
    while (true) {
      if (values[(current + 1) * step] <= target) low = current + 1;
      else high = current;
      if (low == high) return (low + 1) * step;
      current = (low + high) >>> 1;
    }
  }
  static linearSearch(values, target, step) {
    for (let i = 0, last = values.length - step; i <= last; i += step) if (values[i] > target) return i;
    return -1;
  }
}
var MixPose = /* @__PURE__ */ (MixPose2 => {
  MixPose2[(MixPose2['setup'] = 0)] = 'setup';
  MixPose2[(MixPose2['current'] = 1)] = 'current';
  MixPose2[(MixPose2['currentLayered'] = 2)] = 'currentLayered';
  return MixPose2;
})(MixPose || {});
var MixDirection = /* @__PURE__ */ (MixDirection2 => {
  MixDirection2[(MixDirection2['in'] = 0)] = 'in';
  MixDirection2[(MixDirection2['out'] = 1)] = 'out';
  return MixDirection2;
})(MixDirection || {});
var TimelineType = /* @__PURE__ */ (TimelineType2 => {
  TimelineType2[(TimelineType2['rotate'] = 0)] = 'rotate';
  TimelineType2[(TimelineType2['translate'] = 1)] = 'translate';
  TimelineType2[(TimelineType2['scale'] = 2)] = 'scale';
  TimelineType2[(TimelineType2['shear'] = 3)] = 'shear';
  TimelineType2[(TimelineType2['attachment'] = 4)] = 'attachment';
  TimelineType2[(TimelineType2['color'] = 5)] = 'color';
  TimelineType2[(TimelineType2['deform'] = 6)] = 'deform';
  TimelineType2[(TimelineType2['event'] = 7)] = 'event';
  TimelineType2[(TimelineType2['drawOrder'] = 8)] = 'drawOrder';
  TimelineType2[(TimelineType2['ikConstraint'] = 9)] = 'ikConstraint';
  TimelineType2[(TimelineType2['transformConstraint'] = 10)] = 'transformConstraint';
  TimelineType2[(TimelineType2['pathConstraintPosition'] = 11)] = 'pathConstraintPosition';
  TimelineType2[(TimelineType2['pathConstraintSpacing'] = 12)] = 'pathConstraintSpacing';
  TimelineType2[(TimelineType2['pathConstraintMix'] = 13)] = 'pathConstraintMix';
  TimelineType2[(TimelineType2['twoColor'] = 14)] = 'twoColor';
  return TimelineType2;
})(TimelineType || {});
const _CurveTimeline = class _CurveTimeline {
  constructor(frameCount) {
    __publicField(this, 'curves');
    if (frameCount <= 0) throw new Error('frameCount must be > 0: ' + frameCount);
    this.curves = Utils.newFloatArray((frameCount - 1) * _CurveTimeline.BEZIER_SIZE);
  }
  getFrameCount() {
    return this.curves.length / _CurveTimeline.BEZIER_SIZE + 1;
  }
  setLinear(frameIndex) {
    this.curves[frameIndex * _CurveTimeline.BEZIER_SIZE] = _CurveTimeline.LINEAR;
  }
  setStepped(frameIndex) {
    this.curves[frameIndex * _CurveTimeline.BEZIER_SIZE] = _CurveTimeline.STEPPED;
  }
  getCurveType(frameIndex) {
    let index = frameIndex * _CurveTimeline.BEZIER_SIZE;
    if (index == this.curves.length) return _CurveTimeline.LINEAR;
    let type = this.curves[index];
    if (type == _CurveTimeline.LINEAR) return _CurveTimeline.LINEAR;
    if (type == _CurveTimeline.STEPPED) return _CurveTimeline.STEPPED;
    return _CurveTimeline.BEZIER;
  }
  /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
   * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
   * the difference between the keyframe's values. */
  setCurve(frameIndex, cx1, cy1, cx2, cy2) {
    let tmpx = (-cx1 * 2 + cx2) * 0.03,
      tmpy = (-cy1 * 2 + cy2) * 0.03;
    let dddfx = ((cx1 - cx2) * 3 + 1) * 6e-3,
      dddfy = ((cy1 - cy2) * 3 + 1) * 6e-3;
    let ddfx = tmpx * 2 + dddfx,
      ddfy = tmpy * 2 + dddfy;
    let dfx = cx1 * 0.3 + tmpx + dddfx * 0.16666667,
      dfy = cy1 * 0.3 + tmpy + dddfy * 0.16666667;
    let i = frameIndex * _CurveTimeline.BEZIER_SIZE;
    let curves = this.curves;
    curves[i++] = _CurveTimeline.BEZIER;
    let x = dfx,
      y = dfy;
    for (let n = i + _CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
      curves[i] = x;
      curves[i + 1] = y;
      dfx += ddfx;
      dfy += ddfy;
      ddfx += dddfx;
      ddfy += dddfy;
      x += dfx;
      y += dfy;
    }
  }
  getCurvePercent(frameIndex, percent) {
    percent = MathUtils.clamp(percent, 0, 1);
    let curves = this.curves;
    let i = frameIndex * _CurveTimeline.BEZIER_SIZE;
    let type = curves[i];
    if (type == _CurveTimeline.LINEAR) return percent;
    if (type == _CurveTimeline.STEPPED) return 0;
    i++;
    let x = 0;
    for (let start = i, n = i + _CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
      x = curves[i];
      if (x >= percent) {
        let prevX, prevY;
        if (i == start) {
          prevX = 0;
          prevY = 0;
        } else {
          prevX = curves[i - 2];
          prevY = curves[i - 1];
        }
        return prevY + ((curves[i + 1] - prevY) * (percent - prevX)) / (x - prevX);
      }
    }
    let y = curves[i - 1];
    return y + ((1 - y) * (percent - x)) / (1 - x);
  }
};
__publicField(_CurveTimeline, 'LINEAR', 0);
__publicField(_CurveTimeline, 'STEPPED', 1);
__publicField(_CurveTimeline, 'BEZIER', 2);
__publicField(_CurveTimeline, 'BEZIER_SIZE', 10 * 2 - 1);
let CurveTimeline = _CurveTimeline;
const _RotateTimeline = class _RotateTimeline extends CurveTimeline {
  // time, degrees, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'boneIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount << 1);
  }
  getPropertyId() {
    return (0 << 24) + this.boneIndex;
  }
  /** Sets the time and angle of the specified keyframe. */
  setFrame(frameIndex, time, degrees) {
    frameIndex <<= 1;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _RotateTimeline.ROTATION] = degrees;
  }
  apply(skeleton, lastTime, time, events, alpha, pose, direction) {
    let frames = this.frames;
    let bone = skeleton.bones[this.boneIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          bone.rotation = bone.data.rotation;
          return;
        case 1:
          let r2 = bone.data.rotation - bone.rotation;
          r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
          bone.rotation += r2 * alpha;
      }
      return;
    }
    if (time >= frames[frames.length - _RotateTimeline.ENTRIES]) {
      if (pose == 0) bone.rotation = bone.data.rotation + frames[frames.length + _RotateTimeline.PREV_ROTATION] * alpha;
      else {
        let r2 = bone.data.rotation + frames[frames.length + _RotateTimeline.PREV_ROTATION] - bone.rotation;
        r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
        bone.rotation += r2 * alpha;
      }
      return;
    }
    let frame = Animation.binarySearch(frames, time, _RotateTimeline.ENTRIES);
    let prevRotation = frames[frame + _RotateTimeline.PREV_ROTATION];
    let frameTime = frames[frame];
    let percent = this.getCurvePercent(
      (frame >> 1) - 1,
      1 - (time - frameTime) / (frames[frame + _RotateTimeline.PREV_TIME] - frameTime),
    );
    let r = frames[frame + _RotateTimeline.ROTATION] - prevRotation;
    r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
    r = prevRotation + r * percent;
    if (pose == 0) {
      r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
      bone.rotation = bone.data.rotation + r * alpha;
    } else {
      r = bone.data.rotation + r - bone.rotation;
      r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
      bone.rotation += r * alpha;
    }
  }
};
__publicField(_RotateTimeline, 'ENTRIES', 2);
__publicField(_RotateTimeline, 'PREV_TIME', -2);
__publicField(_RotateTimeline, 'PREV_ROTATION', -1);
__publicField(_RotateTimeline, 'ROTATION', 1);
let RotateTimeline = _RotateTimeline;
const _TranslateTimeline = class _TranslateTimeline extends CurveTimeline {
  // time, x, y, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'boneIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount * _TranslateTimeline.ENTRIES);
  }
  getPropertyId() {
    return (1 << 24) + this.boneIndex;
  }
  /** Sets the time and value of the specified keyframe. */
  setFrame(frameIndex, time, x, y) {
    frameIndex *= _TranslateTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _TranslateTimeline.X] = x;
    this.frames[frameIndex + _TranslateTimeline.Y] = y;
  }
  apply(skeleton, lastTime, time, events, alpha, pose, direction) {
    let frames = this.frames;
    let bone = skeleton.bones[this.boneIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          bone.x = bone.data.x;
          bone.y = bone.data.y;
          return;
        case 1:
          bone.x += (bone.data.x - bone.x) * alpha;
          bone.y += (bone.data.y - bone.y) * alpha;
      }
      return;
    }
    let x = 0,
      y = 0;
    if (time >= frames[frames.length - _TranslateTimeline.ENTRIES]) {
      x = frames[frames.length + _TranslateTimeline.PREV_X];
      y = frames[frames.length + _TranslateTimeline.PREV_Y];
    } else {
      let frame = Animation.binarySearch(frames, time, _TranslateTimeline.ENTRIES);
      x = frames[frame + _TranslateTimeline.PREV_X];
      y = frames[frame + _TranslateTimeline.PREV_Y];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / _TranslateTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + _TranslateTimeline.PREV_TIME] - frameTime),
      );
      x += (frames[frame + _TranslateTimeline.X] - x) * percent;
      y += (frames[frame + _TranslateTimeline.Y] - y) * percent;
    }
    if (pose == 0) {
      bone.x = bone.data.x + x * alpha;
      bone.y = bone.data.y + y * alpha;
    } else {
      bone.x += (bone.data.x + x - bone.x) * alpha;
      bone.y += (bone.data.y + y - bone.y) * alpha;
    }
  }
};
__publicField(_TranslateTimeline, 'ENTRIES', 3);
__publicField(_TranslateTimeline, 'PREV_TIME', -3);
__publicField(_TranslateTimeline, 'PREV_X', -2);
__publicField(_TranslateTimeline, 'PREV_Y', -1);
__publicField(_TranslateTimeline, 'X', 1);
__publicField(_TranslateTimeline, 'Y', 2);
let TranslateTimeline = _TranslateTimeline;
class ScaleTimeline extends TranslateTimeline {
  constructor(frameCount) {
    super(frameCount);
  }
  getPropertyId() {
    return (2 << 24) + this.boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, pose, direction) {
    let frames = this.frames;
    let bone = skeleton.bones[this.boneIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          bone.scaleX = bone.data.scaleX;
          bone.scaleY = bone.data.scaleY;
          return;
        case 1:
          bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
          bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
      }
      return;
    }
    let x = 0,
      y = 0;
    if (time >= frames[frames.length - ScaleTimeline.ENTRIES]) {
      x = frames[frames.length + ScaleTimeline.PREV_X] * bone.data.scaleX;
      y = frames[frames.length + ScaleTimeline.PREV_Y] * bone.data.scaleY;
    } else {
      let frame = Animation.binarySearch(frames, time, ScaleTimeline.ENTRIES);
      x = frames[frame + ScaleTimeline.PREV_X];
      y = frames[frame + ScaleTimeline.PREV_Y];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / ScaleTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + ScaleTimeline.PREV_TIME] - frameTime),
      );
      x = (x + (frames[frame + ScaleTimeline.X] - x) * percent) * bone.data.scaleX;
      y = (y + (frames[frame + ScaleTimeline.Y] - y) * percent) * bone.data.scaleY;
    }
    if (alpha == 1) {
      bone.scaleX = x;
      bone.scaleY = y;
    } else {
      let bx = 0,
        by = 0;
      if (pose == 0) {
        bx = bone.data.scaleX;
        by = bone.data.scaleY;
      } else {
        bx = bone.scaleX;
        by = bone.scaleY;
      }
      if (direction == 1) {
        x = Math.abs(x) * MathUtils.signum(bx);
        y = Math.abs(y) * MathUtils.signum(by);
      } else {
        bx = Math.abs(bx) * MathUtils.signum(x);
        by = Math.abs(by) * MathUtils.signum(y);
      }
      bone.scaleX = bx + (x - bx) * alpha;
      bone.scaleY = by + (y - by) * alpha;
    }
  }
}
class ShearTimeline extends TranslateTimeline {
  constructor(frameCount) {
    super(frameCount);
  }
  getPropertyId() {
    return (3 << 24) + this.boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, pose, direction) {
    let frames = this.frames;
    let bone = skeleton.bones[this.boneIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          bone.shearX = bone.data.shearX;
          bone.shearY = bone.data.shearY;
          return;
        case 1:
          bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
          bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
      }
      return;
    }
    let x = 0,
      y = 0;
    if (time >= frames[frames.length - ShearTimeline.ENTRIES]) {
      x = frames[frames.length + ShearTimeline.PREV_X];
      y = frames[frames.length + ShearTimeline.PREV_Y];
    } else {
      let frame = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);
      x = frames[frame + ShearTimeline.PREV_X];
      y = frames[frame + ShearTimeline.PREV_Y];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / ShearTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + ShearTimeline.PREV_TIME] - frameTime),
      );
      x = x + (frames[frame + ShearTimeline.X] - x) * percent;
      y = y + (frames[frame + ShearTimeline.Y] - y) * percent;
    }
    if (pose == 0) {
      bone.shearX = bone.data.shearX + x * alpha;
      bone.shearY = bone.data.shearY + y * alpha;
    } else {
      bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
      bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
    }
  }
}
const _ColorTimeline = class _ColorTimeline extends CurveTimeline {
  // time, r, g, b, a, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'slotIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount * _ColorTimeline.ENTRIES);
  }
  getPropertyId() {
    return (5 << 24) + this.slotIndex;
  }
  /** Sets the time and value of the specified keyframe. */
  setFrame(frameIndex, time, r, g, b, a) {
    frameIndex *= _ColorTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _ColorTimeline.R] = r;
    this.frames[frameIndex + _ColorTimeline.G] = g;
    this.frames[frameIndex + _ColorTimeline.B] = b;
    this.frames[frameIndex + _ColorTimeline.A] = a;
  }
  apply(skeleton, lastTime, time, events, alpha, pose, direction) {
    let slot = skeleton.slots[this.slotIndex];
    let frames = this.frames;
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          slot.color.setFromColor(slot.data.color);
          return;
        case 1:
          let color = slot.color,
            setup = slot.data.color;
          color.add(
            (setup.r - color.r) * alpha,
            (setup.g - color.g) * alpha,
            (setup.b - color.b) * alpha,
            (setup.a - color.a) * alpha,
          );
      }
      return;
    }
    let r = 0,
      g = 0,
      b = 0,
      a = 0;
    if (time >= frames[frames.length - _ColorTimeline.ENTRIES]) {
      let i = frames.length;
      r = frames[i + _ColorTimeline.PREV_R];
      g = frames[i + _ColorTimeline.PREV_G];
      b = frames[i + _ColorTimeline.PREV_B];
      a = frames[i + _ColorTimeline.PREV_A];
    } else {
      let frame = Animation.binarySearch(frames, time, _ColorTimeline.ENTRIES);
      r = frames[frame + _ColorTimeline.PREV_R];
      g = frames[frame + _ColorTimeline.PREV_G];
      b = frames[frame + _ColorTimeline.PREV_B];
      a = frames[frame + _ColorTimeline.PREV_A];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / _ColorTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + _ColorTimeline.PREV_TIME] - frameTime),
      );
      r += (frames[frame + _ColorTimeline.R] - r) * percent;
      g += (frames[frame + _ColorTimeline.G] - g) * percent;
      b += (frames[frame + _ColorTimeline.B] - b) * percent;
      a += (frames[frame + _ColorTimeline.A] - a) * percent;
    }
    if (alpha == 1) slot.color.set(r, g, b, a);
    else {
      let color = slot.color;
      if (pose == 0) color.setFromColor(slot.data.color);
      color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
    }
  }
};
__publicField(_ColorTimeline, 'ENTRIES', 5);
__publicField(_ColorTimeline, 'PREV_TIME', -5);
__publicField(_ColorTimeline, 'PREV_R', -4);
__publicField(_ColorTimeline, 'PREV_G', -3);
__publicField(_ColorTimeline, 'PREV_B', -2);
__publicField(_ColorTimeline, 'PREV_A', -1);
__publicField(_ColorTimeline, 'R', 1);
__publicField(_ColorTimeline, 'G', 2);
__publicField(_ColorTimeline, 'B', 3);
__publicField(_ColorTimeline, 'A', 4);
let ColorTimeline = _ColorTimeline;
const _TwoColorTimeline = class _TwoColorTimeline extends CurveTimeline {
  // time, r, g, b, a, r2, g2, b2, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'slotIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount * _TwoColorTimeline.ENTRIES);
  }
  getPropertyId() {
    return (14 << 24) + this.slotIndex;
  }
  /** Sets the time and value of the specified keyframe. */
  setFrame(frameIndex, time, r, g, b, a, r2, g2, b2) {
    frameIndex *= _TwoColorTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _TwoColorTimeline.R] = r;
    this.frames[frameIndex + _TwoColorTimeline.G] = g;
    this.frames[frameIndex + _TwoColorTimeline.B] = b;
    this.frames[frameIndex + _TwoColorTimeline.A] = a;
    this.frames[frameIndex + _TwoColorTimeline.R2] = r2;
    this.frames[frameIndex + _TwoColorTimeline.G2] = g2;
    this.frames[frameIndex + _TwoColorTimeline.B2] = b2;
  }
  apply(skeleton, lastTime, time, events, alpha, pose, direction) {
    let slot = skeleton.slots[this.slotIndex];
    let frames = this.frames;
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          slot.color.setFromColor(slot.data.color);
          slot.darkColor.setFromColor(slot.data.darkColor);
          return;
        case 1:
          let light = slot.color,
            dark = slot.darkColor,
            setupLight = slot.data.color,
            setupDark = slot.data.darkColor;
          light.add(
            (setupLight.r - light.r) * alpha,
            (setupLight.g - light.g) * alpha,
            (setupLight.b - light.b) * alpha,
            (setupLight.a - light.a) * alpha,
          );
          dark.add((setupDark.r - dark.r) * alpha, (setupDark.g - dark.g) * alpha, (setupDark.b - dark.b) * alpha, 0);
      }
      return;
    }
    let r = 0,
      g = 0,
      b = 0,
      a = 0,
      r2 = 0,
      g2 = 0,
      b2 = 0;
    if (time >= frames[frames.length - _TwoColorTimeline.ENTRIES]) {
      let i = frames.length;
      r = frames[i + _TwoColorTimeline.PREV_R];
      g = frames[i + _TwoColorTimeline.PREV_G];
      b = frames[i + _TwoColorTimeline.PREV_B];
      a = frames[i + _TwoColorTimeline.PREV_A];
      r2 = frames[i + _TwoColorTimeline.PREV_R2];
      g2 = frames[i + _TwoColorTimeline.PREV_G2];
      b2 = frames[i + _TwoColorTimeline.PREV_B2];
    } else {
      let frame = Animation.binarySearch(frames, time, _TwoColorTimeline.ENTRIES);
      r = frames[frame + _TwoColorTimeline.PREV_R];
      g = frames[frame + _TwoColorTimeline.PREV_G];
      b = frames[frame + _TwoColorTimeline.PREV_B];
      a = frames[frame + _TwoColorTimeline.PREV_A];
      r2 = frames[frame + _TwoColorTimeline.PREV_R2];
      g2 = frames[frame + _TwoColorTimeline.PREV_G2];
      b2 = frames[frame + _TwoColorTimeline.PREV_B2];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / _TwoColorTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + _TwoColorTimeline.PREV_TIME] - frameTime),
      );
      r += (frames[frame + _TwoColorTimeline.R] - r) * percent;
      g += (frames[frame + _TwoColorTimeline.G] - g) * percent;
      b += (frames[frame + _TwoColorTimeline.B] - b) * percent;
      a += (frames[frame + _TwoColorTimeline.A] - a) * percent;
      r2 += (frames[frame + _TwoColorTimeline.R2] - r2) * percent;
      g2 += (frames[frame + _TwoColorTimeline.G2] - g2) * percent;
      b2 += (frames[frame + _TwoColorTimeline.B2] - b2) * percent;
    }
    if (alpha == 1) {
      slot.color.set(r, g, b, a);
      slot.darkColor.set(r2, g2, b2, 1);
    } else {
      let light = slot.color,
        dark = slot.darkColor;
      if (pose == 0) {
        light.setFromColor(slot.data.color);
        dark.setFromColor(slot.data.darkColor);
      }
      light.add((r - light.r) * alpha, (g - light.g) * alpha, (b - light.b) * alpha, (a - light.a) * alpha);
      dark.add((r2 - dark.r) * alpha, (g2 - dark.g) * alpha, (b2 - dark.b) * alpha, 0);
    }
  }
};
__publicField(_TwoColorTimeline, 'ENTRIES', 8);
__publicField(_TwoColorTimeline, 'PREV_TIME', -8);
__publicField(_TwoColorTimeline, 'PREV_R', -7);
__publicField(_TwoColorTimeline, 'PREV_G', -6);
__publicField(_TwoColorTimeline, 'PREV_B', -5);
__publicField(_TwoColorTimeline, 'PREV_A', -4);
__publicField(_TwoColorTimeline, 'PREV_R2', -3);
__publicField(_TwoColorTimeline, 'PREV_G2', -2);
__publicField(_TwoColorTimeline, 'PREV_B2', -1);
__publicField(_TwoColorTimeline, 'R', 1);
__publicField(_TwoColorTimeline, 'G', 2);
__publicField(_TwoColorTimeline, 'B', 3);
__publicField(_TwoColorTimeline, 'A', 4);
__publicField(_TwoColorTimeline, 'R2', 5);
__publicField(_TwoColorTimeline, 'G2', 6);
__publicField(_TwoColorTimeline, 'B2', 7);
let TwoColorTimeline = _TwoColorTimeline;
class AttachmentTimeline {
  constructor(frameCount) {
    __publicField(this, 'slotIndex');
    __publicField(this, 'frames');
    // time, ...
    __publicField(this, 'attachmentNames');
    this.frames = Utils.newFloatArray(frameCount);
    this.attachmentNames = new Array(frameCount);
  }
  getPropertyId() {
    return (4 << 24) + this.slotIndex;
  }
  getFrameCount() {
    return this.frames.length;
  }
  /** Sets the time and value of the specified keyframe. */
  setFrame(frameIndex, time, attachmentName) {
    this.frames[frameIndex] = time;
    this.attachmentNames[frameIndex] = attachmentName;
  }
  apply(skeleton, lastTime, time, events, alpha, pose, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (direction == 1 && pose == 0) {
      let attachmentName2 = slot.data.attachmentName;
      slot.setAttachment(attachmentName2 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName2));
      return;
    }
    let frames = this.frames;
    if (time < frames[0]) {
      if (pose == 0) {
        let attachmentName2 = slot.data.attachmentName;
        slot.setAttachment(attachmentName2 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName2));
      }
      return;
    }
    let frameIndex = 0;
    if (time >= frames[frames.length - 1]) frameIndex = frames.length - 1;
    else frameIndex = Animation.binarySearch(frames, time, 1) - 1;
    let attachmentName = this.attachmentNames[frameIndex];
    skeleton.slots[this.slotIndex].setAttachment(
      attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName),
    );
  }
}
var zeros = null;
class DeformTimeline extends CurveTimeline {
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'slotIndex');
    __publicField(this, 'attachment');
    __publicField(this, 'frames');
    // time, ...
    __publicField(this, 'frameVertices');
    this.frames = Utils.newFloatArray(frameCount);
    this.frameVertices = new Array(frameCount);
    if (zeros == null) zeros = Utils.newFloatArray(64);
  }
  getPropertyId() {
    return (6 << 27) + +this.attachment.id + this.slotIndex;
  }
  /** Sets the time of the specified keyframe. */
  setFrame(frameIndex, time, vertices) {
    this.frames[frameIndex] = time;
    this.frameVertices[frameIndex] = vertices;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    let slot = skeleton.slots[this.slotIndex];
    let slotAttachment = slot.getAttachment();
    if (!(slotAttachment instanceof VertexAttachment) || !slotAttachment.applyDeform(this.attachment)) return;
    let verticesArray = slot.attachmentVertices;
    if (verticesArray.length == 0) alpha = 1;
    let frameVertices = this.frameVertices;
    let vertexCount = frameVertices[0].length;
    let frames = this.frames;
    if (time < frames[0]) {
      let vertexAttachment = slotAttachment;
      switch (pose) {
        case 0:
          verticesArray.length = 0;
          return;
        case 1:
          if (alpha == 1) {
            verticesArray.length = 0;
            break;
          }
          let vertices2 = Utils.setArraySize(verticesArray, vertexCount);
          if (vertexAttachment.bones == null) {
            var setupVertices = vertexAttachment.vertices;
            for (var i = 0; i < vertexCount; i++) vertices2[i] += (setupVertices[i] - vertices2[i]) * alpha;
          } else {
            alpha = 1 - alpha;
            for (var i = 0; i < vertexCount; i++) vertices2[i] *= alpha;
          }
      }
      return;
    }
    let vertices = Utils.setArraySize(verticesArray, vertexCount);
    if (time >= frames[frames.length - 1]) {
      let lastVertices = frameVertices[frames.length - 1];
      if (alpha == 1) {
        Utils.arrayCopy(lastVertices, 0, vertices, 0, vertexCount);
      } else if (pose == 0) {
        let vertexAttachment = slotAttachment;
        if (vertexAttachment.bones == null) {
          let setupVertices2 = vertexAttachment.vertices;
          for (let i2 = 0; i2 < vertexCount; i2++) {
            let setup = setupVertices2[i2];
            vertices[i2] = setup + (lastVertices[i2] - setup) * alpha;
          }
        } else {
          for (let i2 = 0; i2 < vertexCount; i2++) vertices[i2] = lastVertices[i2] * alpha;
        }
      } else {
        for (let i2 = 0; i2 < vertexCount; i2++) vertices[i2] += (lastVertices[i2] - vertices[i2]) * alpha;
      }
      return;
    }
    let frame = Animation.binarySearch(frames, time);
    let prevVertices = frameVertices[frame - 1];
    let nextVertices = frameVertices[frame];
    let frameTime = frames[frame];
    let percent = this.getCurvePercent(frame - 1, 1 - (time - frameTime) / (frames[frame - 1] - frameTime));
    if (alpha == 1) {
      for (let i2 = 0; i2 < vertexCount; i2++) {
        let prev = prevVertices[i2];
        vertices[i2] = prev + (nextVertices[i2] - prev) * percent;
      }
    } else if (pose == 0) {
      let vertexAttachment = slotAttachment;
      if (vertexAttachment.bones == null) {
        let setupVertices2 = vertexAttachment.vertices;
        for (let i2 = 0; i2 < vertexCount; i2++) {
          let prev = prevVertices[i2],
            setup = setupVertices2[i2];
          vertices[i2] = setup + (prev + (nextVertices[i2] - prev) * percent - setup) * alpha;
        }
      } else {
        for (let i2 = 0; i2 < vertexCount; i2++) {
          let prev = prevVertices[i2];
          vertices[i2] = (prev + (nextVertices[i2] - prev) * percent) * alpha;
        }
      }
    } else {
      for (let i2 = 0; i2 < vertexCount; i2++) {
        let prev = prevVertices[i2];
        vertices[i2] += (prev + (nextVertices[i2] - prev) * percent - vertices[i2]) * alpha;
      }
    }
  }
}
class EventTimeline {
  constructor(frameCount) {
    __publicField(this, 'frames');
    // time, ...
    __publicField(this, 'events');
    this.frames = Utils.newFloatArray(frameCount);
    this.events = new Array(frameCount);
  }
  getPropertyId() {
    return 7 << 24;
  }
  getFrameCount() {
    return this.frames.length;
  }
  /** Sets the time of the specified keyframe. */
  setFrame(frameIndex, event) {
    this.frames[frameIndex] = event.time;
    this.events[frameIndex] = event;
  }
  /** Fires events for frames > lastTime and <= time. */
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    if (firedEvents == null) return;
    let frames = this.frames;
    let frameCount = this.frames.length;
    if (lastTime > time) {
      this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, pose, direction);
      lastTime = -1;
    } else if (lastTime >= frames[frameCount - 1]) return;
    if (time < frames[0]) return;
    let frame = 0;
    if (lastTime < frames[0]) frame = 0;
    else {
      frame = Animation.binarySearch(frames, lastTime);
      let frameTime = frames[frame];
      while (frame > 0) {
        if (frames[frame - 1] != frameTime) break;
        frame--;
      }
    }
    for (; frame < frameCount && time >= frames[frame]; frame++) firedEvents.push(this.events[frame]);
  }
}
class DrawOrderTimeline {
  constructor(frameCount) {
    __publicField(this, 'frames');
    // time, ...
    __publicField(this, 'drawOrders');
    this.frames = Utils.newFloatArray(frameCount);
    this.drawOrders = new Array(frameCount);
  }
  getPropertyId() {
    return 8 << 24;
  }
  getFrameCount() {
    return this.frames.length;
  }
  /** Sets the time of the specified keyframe.
   * @param drawOrder May be null to use bind pose draw order. */
  setFrame(frameIndex, time, drawOrder) {
    this.frames[frameIndex] = time;
    this.drawOrders[frameIndex] = drawOrder;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    let drawOrder = skeleton.drawOrder;
    let slots = skeleton.slots;
    if (direction == 1 && pose == 0) {
      Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
      return;
    }
    let frames = this.frames;
    if (time < frames[0]) {
      if (pose == 0) Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
      return;
    }
    let frame = 0;
    if (time >= frames[frames.length - 1]) frame = frames.length - 1;
    else frame = Animation.binarySearch(frames, time) - 1;
    let drawOrderToSetupIndex = this.drawOrders[frame];
    if (drawOrderToSetupIndex == null) Utils.arrayCopy(slots, 0, drawOrder, 0, slots.length);
    else {
      for (let i = 0, n = drawOrderToSetupIndex.length; i < n; i++) drawOrder[i] = slots[drawOrderToSetupIndex[i]];
    }
  }
}
const _IkConstraintTimeline = class _IkConstraintTimeline extends CurveTimeline {
  // time, mix, bendDirection, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'ikConstraintIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount * _IkConstraintTimeline.ENTRIES);
  }
  getPropertyId() {
    return (9 << 24) + this.ikConstraintIndex;
  }
  /** Sets the time, mix and bend direction of the specified keyframe. */
  setFrame(frameIndex, time, mix, bendDirection) {
    frameIndex *= _IkConstraintTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _IkConstraintTimeline.MIX] = mix;
    this.frames[frameIndex + _IkConstraintTimeline.BEND_DIRECTION] = bendDirection;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    let frames = this.frames;
    let constraint = skeleton.ikConstraints[this.ikConstraintIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          constraint.mix = constraint.data.mix;
          constraint.bendDirection = constraint.data.bendDirection;
          return;
        case 1:
          constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
          constraint.bendDirection = constraint.data.bendDirection;
      }
      return;
    }
    if (time >= frames[frames.length - _IkConstraintTimeline.ENTRIES]) {
      if (pose == 0) {
        constraint.mix =
          constraint.data.mix + (frames[frames.length + _IkConstraintTimeline.PREV_MIX] - constraint.data.mix) * alpha;
        constraint.bendDirection =
          direction == 1
            ? constraint.data.bendDirection
            : frames[frames.length + _IkConstraintTimeline.PREV_BEND_DIRECTION];
      } else {
        constraint.mix += (frames[frames.length + _IkConstraintTimeline.PREV_MIX] - constraint.mix) * alpha;
        if (direction == 0)
          constraint.bendDirection = frames[frames.length + _IkConstraintTimeline.PREV_BEND_DIRECTION];
      }
      return;
    }
    let frame = Animation.binarySearch(frames, time, _IkConstraintTimeline.ENTRIES);
    let mix = frames[frame + _IkConstraintTimeline.PREV_MIX];
    let frameTime = frames[frame];
    let percent = this.getCurvePercent(
      frame / _IkConstraintTimeline.ENTRIES - 1,
      1 - (time - frameTime) / (frames[frame + _IkConstraintTimeline.PREV_TIME] - frameTime),
    );
    if (pose == 0) {
      constraint.mix =
        constraint.data.mix +
        (mix + (frames[frame + _IkConstraintTimeline.MIX] - mix) * percent - constraint.data.mix) * alpha;
      constraint.bendDirection =
        direction == 1 ? constraint.data.bendDirection : frames[frame + _IkConstraintTimeline.PREV_BEND_DIRECTION];
    } else {
      constraint.mix += (mix + (frames[frame + _IkConstraintTimeline.MIX] - mix) * percent - constraint.mix) * alpha;
      if (direction == 0) constraint.bendDirection = frames[frame + _IkConstraintTimeline.PREV_BEND_DIRECTION];
    }
  }
};
__publicField(_IkConstraintTimeline, 'ENTRIES', 3);
__publicField(_IkConstraintTimeline, 'PREV_TIME', -3);
__publicField(_IkConstraintTimeline, 'PREV_MIX', -2);
__publicField(_IkConstraintTimeline, 'PREV_BEND_DIRECTION', -1);
__publicField(_IkConstraintTimeline, 'MIX', 1);
__publicField(_IkConstraintTimeline, 'BEND_DIRECTION', 2);
let IkConstraintTimeline = _IkConstraintTimeline;
const _TransformConstraintTimeline = class _TransformConstraintTimeline extends CurveTimeline {
  // time, rotate mix, translate mix, scale mix, shear mix, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'transformConstraintIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount * _TransformConstraintTimeline.ENTRIES);
  }
  getPropertyId() {
    return (10 << 24) + this.transformConstraintIndex;
  }
  /** Sets the time and mixes of the specified keyframe. */
  setFrame(frameIndex, time, rotateMix, translateMix, scaleMix, shearMix) {
    frameIndex *= _TransformConstraintTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _TransformConstraintTimeline.ROTATE] = rotateMix;
    this.frames[frameIndex + _TransformConstraintTimeline.TRANSLATE] = translateMix;
    this.frames[frameIndex + _TransformConstraintTimeline.SCALE] = scaleMix;
    this.frames[frameIndex + _TransformConstraintTimeline.SHEAR] = shearMix;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    let frames = this.frames;
    let constraint = skeleton.transformConstraints[this.transformConstraintIndex];
    if (time < frames[0]) {
      let data = constraint.data;
      switch (pose) {
        case 0:
          constraint.rotateMix = data.rotateMix;
          constraint.translateMix = data.translateMix;
          constraint.scaleMix = data.scaleMix;
          constraint.shearMix = data.shearMix;
          return;
        case 1:
          constraint.rotateMix += (data.rotateMix - constraint.rotateMix) * alpha;
          constraint.translateMix += (data.translateMix - constraint.translateMix) * alpha;
          constraint.scaleMix += (data.scaleMix - constraint.scaleMix) * alpha;
          constraint.shearMix += (data.shearMix - constraint.shearMix) * alpha;
      }
      return;
    }
    let rotate = 0,
      translate = 0,
      scale = 0,
      shear = 0;
    if (time >= frames[frames.length - _TransformConstraintTimeline.ENTRIES]) {
      let i = frames.length;
      rotate = frames[i + _TransformConstraintTimeline.PREV_ROTATE];
      translate = frames[i + _TransformConstraintTimeline.PREV_TRANSLATE];
      scale = frames[i + _TransformConstraintTimeline.PREV_SCALE];
      shear = frames[i + _TransformConstraintTimeline.PREV_SHEAR];
    } else {
      let frame = Animation.binarySearch(frames, time, _TransformConstraintTimeline.ENTRIES);
      rotate = frames[frame + _TransformConstraintTimeline.PREV_ROTATE];
      translate = frames[frame + _TransformConstraintTimeline.PREV_TRANSLATE];
      scale = frames[frame + _TransformConstraintTimeline.PREV_SCALE];
      shear = frames[frame + _TransformConstraintTimeline.PREV_SHEAR];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / _TransformConstraintTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + _TransformConstraintTimeline.PREV_TIME] - frameTime),
      );
      rotate += (frames[frame + _TransformConstraintTimeline.ROTATE] - rotate) * percent;
      translate += (frames[frame + _TransformConstraintTimeline.TRANSLATE] - translate) * percent;
      scale += (frames[frame + _TransformConstraintTimeline.SCALE] - scale) * percent;
      shear += (frames[frame + _TransformConstraintTimeline.SHEAR] - shear) * percent;
    }
    if (pose == 0) {
      let data = constraint.data;
      constraint.rotateMix = data.rotateMix + (rotate - data.rotateMix) * alpha;
      constraint.translateMix = data.translateMix + (translate - data.translateMix) * alpha;
      constraint.scaleMix = data.scaleMix + (scale - data.scaleMix) * alpha;
      constraint.shearMix = data.shearMix + (shear - data.shearMix) * alpha;
    } else {
      constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
      constraint.translateMix += (translate - constraint.translateMix) * alpha;
      constraint.scaleMix += (scale - constraint.scaleMix) * alpha;
      constraint.shearMix += (shear - constraint.shearMix) * alpha;
    }
  }
};
__publicField(_TransformConstraintTimeline, 'ENTRIES', 5);
__publicField(_TransformConstraintTimeline, 'PREV_TIME', -5);
__publicField(_TransformConstraintTimeline, 'PREV_ROTATE', -4);
__publicField(_TransformConstraintTimeline, 'PREV_TRANSLATE', -3);
__publicField(_TransformConstraintTimeline, 'PREV_SCALE', -2);
__publicField(_TransformConstraintTimeline, 'PREV_SHEAR', -1);
__publicField(_TransformConstraintTimeline, 'ROTATE', 1);
__publicField(_TransformConstraintTimeline, 'TRANSLATE', 2);
__publicField(_TransformConstraintTimeline, 'SCALE', 3);
__publicField(_TransformConstraintTimeline, 'SHEAR', 4);
let TransformConstraintTimeline = _TransformConstraintTimeline;
const _PathConstraintPositionTimeline = class _PathConstraintPositionTimeline extends CurveTimeline {
  // time, position, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'pathConstraintIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount * _PathConstraintPositionTimeline.ENTRIES);
  }
  getPropertyId() {
    return (11 << 24) + this.pathConstraintIndex;
  }
  /** Sets the time and value of the specified keyframe. */
  setFrame(frameIndex, time, value) {
    frameIndex *= _PathConstraintPositionTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _PathConstraintPositionTimeline.VALUE] = value;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    let frames = this.frames;
    let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          constraint.position = constraint.data.position;
          return;
        case 1:
          constraint.position += (constraint.data.position - constraint.position) * alpha;
      }
      return;
    }
    let position = 0;
    if (time >= frames[frames.length - _PathConstraintPositionTimeline.ENTRIES])
      position = frames[frames.length + _PathConstraintPositionTimeline.PREV_VALUE];
    else {
      let frame = Animation.binarySearch(frames, time, _PathConstraintPositionTimeline.ENTRIES);
      position = frames[frame + _PathConstraintPositionTimeline.PREV_VALUE];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / _PathConstraintPositionTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + _PathConstraintPositionTimeline.PREV_TIME] - frameTime),
      );
      position += (frames[frame + _PathConstraintPositionTimeline.VALUE] - position) * percent;
    }
    if (pose == 0) constraint.position = constraint.data.position + (position - constraint.data.position) * alpha;
    else constraint.position += (position - constraint.position) * alpha;
  }
};
__publicField(_PathConstraintPositionTimeline, 'ENTRIES', 2);
__publicField(_PathConstraintPositionTimeline, 'PREV_TIME', -2);
__publicField(_PathConstraintPositionTimeline, 'PREV_VALUE', -1);
__publicField(_PathConstraintPositionTimeline, 'VALUE', 1);
let PathConstraintPositionTimeline = _PathConstraintPositionTimeline;
class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
  constructor(frameCount) {
    super(frameCount);
  }
  getPropertyId() {
    return (12 << 24) + this.pathConstraintIndex;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    let frames = this.frames;
    let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          constraint.spacing = constraint.data.spacing;
          return;
        case 1:
          constraint.spacing += (constraint.data.spacing - constraint.spacing) * alpha;
      }
      return;
    }
    let spacing = 0;
    if (time >= frames[frames.length - PathConstraintSpacingTimeline.ENTRIES])
      spacing = frames[frames.length + PathConstraintSpacingTimeline.PREV_VALUE];
    else {
      let frame = Animation.binarySearch(frames, time, PathConstraintSpacingTimeline.ENTRIES);
      spacing = frames[frame + PathConstraintSpacingTimeline.PREV_VALUE];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / PathConstraintSpacingTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + PathConstraintSpacingTimeline.PREV_TIME] - frameTime),
      );
      spacing += (frames[frame + PathConstraintSpacingTimeline.VALUE] - spacing) * percent;
    }
    if (pose == 0) constraint.spacing = constraint.data.spacing + (spacing - constraint.data.spacing) * alpha;
    else constraint.spacing += (spacing - constraint.spacing) * alpha;
  }
}
const _PathConstraintMixTimeline = class _PathConstraintMixTimeline extends CurveTimeline {
  // time, rotate mix, translate mix, ...
  constructor(frameCount) {
    super(frameCount);
    __publicField(this, 'pathConstraintIndex');
    __publicField(this, 'frames');
    this.frames = Utils.newFloatArray(frameCount * _PathConstraintMixTimeline.ENTRIES);
  }
  getPropertyId() {
    return (13 << 24) + this.pathConstraintIndex;
  }
  /** Sets the time and mixes of the specified keyframe. */
  setFrame(frameIndex, time, rotateMix, translateMix) {
    frameIndex *= _PathConstraintMixTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + _PathConstraintMixTimeline.ROTATE] = rotateMix;
    this.frames[frameIndex + _PathConstraintMixTimeline.TRANSLATE] = translateMix;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
    let frames = this.frames;
    let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
    if (time < frames[0]) {
      switch (pose) {
        case 0:
          constraint.rotateMix = constraint.data.rotateMix;
          constraint.translateMix = constraint.data.translateMix;
          return;
        case 1:
          constraint.rotateMix += (constraint.data.rotateMix - constraint.rotateMix) * alpha;
          constraint.translateMix += (constraint.data.translateMix - constraint.translateMix) * alpha;
      }
      return;
    }
    let rotate = 0,
      translate = 0;
    if (time >= frames[frames.length - _PathConstraintMixTimeline.ENTRIES]) {
      rotate = frames[frames.length + _PathConstraintMixTimeline.PREV_ROTATE];
      translate = frames[frames.length + _PathConstraintMixTimeline.PREV_TRANSLATE];
    } else {
      let frame = Animation.binarySearch(frames, time, _PathConstraintMixTimeline.ENTRIES);
      rotate = frames[frame + _PathConstraintMixTimeline.PREV_ROTATE];
      translate = frames[frame + _PathConstraintMixTimeline.PREV_TRANSLATE];
      let frameTime = frames[frame];
      let percent = this.getCurvePercent(
        frame / _PathConstraintMixTimeline.ENTRIES - 1,
        1 - (time - frameTime) / (frames[frame + _PathConstraintMixTimeline.PREV_TIME] - frameTime),
      );
      rotate += (frames[frame + _PathConstraintMixTimeline.ROTATE] - rotate) * percent;
      translate += (frames[frame + _PathConstraintMixTimeline.TRANSLATE] - translate) * percent;
    }
    if (pose == 0) {
      constraint.rotateMix = constraint.data.rotateMix + (rotate - constraint.data.rotateMix) * alpha;
      constraint.translateMix = constraint.data.translateMix + (translate - constraint.data.translateMix) * alpha;
    } else {
      constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
      constraint.translateMix += (translate - constraint.translateMix) * alpha;
    }
  }
};
__publicField(_PathConstraintMixTimeline, 'ENTRIES', 3);
__publicField(_PathConstraintMixTimeline, 'PREV_TIME', -3);
__publicField(_PathConstraintMixTimeline, 'PREV_ROTATE', -2);
__publicField(_PathConstraintMixTimeline, 'PREV_TRANSLATE', -1);
__publicField(_PathConstraintMixTimeline, 'ROTATE', 1);
__publicField(_PathConstraintMixTimeline, 'TRANSLATE', 2);
let PathConstraintMixTimeline = _PathConstraintMixTimeline;
const _AnimationState = class _AnimationState {
  constructor(data) {
    __publicField(this, 'data');
    __publicField(this, 'tracks', new Array());
    __publicField(this, 'events', new Array());
    __publicField(this, 'listeners', new Array());
    __publicField(this, 'queue', new EventQueue(this));
    __publicField(this, 'propertyIDs', new IntSet());
    __publicField(this, 'mixingTo', new Array());
    __publicField(this, 'animationsChanged', false);
    __publicField(this, 'timeScale', 1);
    __publicField(this, 'trackEntryPool', new Pool(() => new TrackEntry()));
    this.data = data;
  }
  update(delta) {
    delta *= this.timeScale;
    let tracks = this.tracks;
    for (let i = 0, n = tracks.length; i < n; i++) {
      let current = tracks[i];
      if (current == null) continue;
      current.animationLast = current.nextAnimationLast;
      current.trackLast = current.nextTrackLast;
      let currentDelta = delta * current.timeScale;
      if (current.delay > 0) {
        current.delay -= currentDelta;
        if (current.delay > 0) continue;
        currentDelta = -current.delay;
        current.delay = 0;
      }
      let next = current.next;
      if (next != null) {
        let nextTime = current.trackLast - next.delay;
        if (nextTime >= 0) {
          next.delay = 0;
          next.trackTime = nextTime + delta * next.timeScale;
          current.trackTime += currentDelta;
          this.setCurrent(i, next, true);
          while (next.mixingFrom != null) {
            next.mixTime += currentDelta;
            next = next.mixingFrom;
          }
          continue;
        }
      } else if (current.trackLast >= current.trackEnd && current.mixingFrom == null) {
        tracks[i] = null;
        this.queue.end(current);
        this.disposeNext(current);
        continue;
      }
      if (current.mixingFrom != null && this.updateMixingFrom(current, delta)) {
        let from = current.mixingFrom;
        current.mixingFrom = null;
        while (from != null) {
          this.queue.end(from);
          from = from.mixingFrom;
        }
      }
      current.trackTime += currentDelta;
    }
    this.queue.drain();
  }
  updateMixingFrom(to, delta) {
    let from = to.mixingFrom;
    if (from == null) return true;
    let finished = this.updateMixingFrom(from, delta);
    from.animationLast = from.nextAnimationLast;
    from.trackLast = from.nextTrackLast;
    if (to.mixTime > 0 && (to.mixTime >= to.mixDuration || to.timeScale == 0)) {
      if (from.totalAlpha == 0 || to.mixDuration == 0) {
        to.mixingFrom = from.mixingFrom;
        to.interruptAlpha = from.interruptAlpha;
        this.queue.end(from);
      }
      return finished;
    }
    from.trackTime += delta * from.timeScale;
    to.mixTime += delta * to.timeScale;
    return false;
  }
  apply(skeleton) {
    if (skeleton == null) throw new Error('skeleton cannot be null.');
    if (this.animationsChanged) this._animationsChanged();
    let events = this.events;
    let tracks = this.tracks;
    let applied = false;
    for (let i = 0, n = tracks.length; i < n; i++) {
      let current = tracks[i];
      if (current == null || current.delay > 0) continue;
      applied = true;
      let currentPose = i == 0 ? MixPose.current : MixPose.currentLayered;
      let mix = current.alpha;
      if (current.mixingFrom != null) mix *= this.applyMixingFrom(current, skeleton, currentPose);
      else if (current.trackTime >= current.trackEnd && current.next == null) mix = 0;
      let animationLast = current.animationLast,
        animationTime = current.getAnimationTime();
      let timelineCount = current.animation.timelines.length;
      let timelines = current.animation.timelines;
      if (mix == 1) {
        for (let ii = 0; ii < timelineCount; ii++)
          timelines[ii].apply(skeleton, animationLast, animationTime, events, 1, MixPose.setup, MixDirection.in);
      } else {
        let timelineData = current.timelineData;
        let firstFrame = current.timelinesRotation.length == 0;
        if (firstFrame) Utils.setArraySize(current.timelinesRotation, timelineCount << 1, null);
        let timelinesRotation = current.timelinesRotation;
        for (let ii = 0; ii < timelineCount; ii++) {
          let timeline = timelines[ii];
          let pose = timelineData[ii] >= _AnimationState.FIRST ? MixPose.setup : currentPose;
          if (timeline instanceof RotateTimeline) {
            this.applyRotateTimeline(
              timeline,
              skeleton,
              animationTime,
              mix,
              pose,
              timelinesRotation,
              ii << 1,
              firstFrame,
            );
          } else {
            Utils.webkit602BugfixHelper(mix, pose);
            timeline.apply(skeleton, animationLast, animationTime, events, mix, pose, MixDirection.in);
          }
        }
      }
      this.queueEvents(current, animationTime);
      events.length = 0;
      current.nextAnimationLast = animationTime;
      current.nextTrackLast = current.trackTime;
    }
    this.queue.drain();
    return applied;
  }
  applyMixingFrom(to, skeleton, currentPose) {
    let from = to.mixingFrom;
    if (from.mixingFrom != null) this.applyMixingFrom(from, skeleton, currentPose);
    let mix = 0;
    if (to.mixDuration == 0) {
      mix = 1;
      currentPose = MixPose.setup;
    } else {
      mix = to.mixTime / to.mixDuration;
      if (mix > 1) mix = 1;
    }
    let events = mix < from.eventThreshold ? this.events : null;
    let attachments = mix < from.attachmentThreshold,
      drawOrder = mix < from.drawOrderThreshold;
    let animationLast = from.animationLast,
      animationTime = from.getAnimationTime();
    let timelineCount = from.animation.timelines.length;
    let timelines = from.animation.timelines;
    let timelineData = from.timelineData;
    let timelineDipMix = from.timelineDipMix;
    let firstFrame = from.timelinesRotation.length == 0;
    if (firstFrame) Utils.setArraySize(from.timelinesRotation, timelineCount << 1, null);
    let timelinesRotation = from.timelinesRotation;
    let pose;
    let alphaDip = from.alpha * to.interruptAlpha,
      alphaMix = alphaDip * (1 - mix),
      alpha = 0;
    from.totalAlpha = 0;
    for (var i = 0; i < timelineCount; i++) {
      let timeline = timelines[i];
      switch (timelineData[i]) {
        case _AnimationState.SUBSEQUENT:
          if (!attachments && timeline instanceof AttachmentTimeline) continue;
          if (!drawOrder && timeline instanceof DrawOrderTimeline) continue;
          pose = currentPose;
          alpha = alphaMix;
          break;
        case _AnimationState.FIRST:
          pose = MixPose.setup;
          alpha = alphaMix;
          break;
        case _AnimationState.DIP:
          pose = MixPose.setup;
          alpha = alphaDip;
          break;
        default:
          pose = MixPose.setup;
          alpha = alphaDip;
          let dipMix = timelineDipMix[i];
          alpha *= Math.max(0, 1 - dipMix.mixTime / dipMix.mixDuration);
          break;
      }
      from.totalAlpha += alpha;
      if (timeline instanceof RotateTimeline)
        this.applyRotateTimeline(timeline, skeleton, animationTime, alpha, pose, timelinesRotation, i << 1, firstFrame);
      else {
        Utils.webkit602BugfixHelper(alpha, pose);
        timeline.apply(skeleton, animationLast, animationTime, events, alpha, pose, MixDirection.out);
      }
    }
    if (to.mixDuration > 0) this.queueEvents(from, animationTime);
    this.events.length = 0;
    from.nextAnimationLast = animationTime;
    from.nextTrackLast = from.trackTime;
    return mix;
  }
  applyRotateTimeline(timeline, skeleton, time, alpha, pose, timelinesRotation, i, firstFrame) {
    if (firstFrame) timelinesRotation[i] = 0;
    if (alpha == 1) {
      timeline.apply(skeleton, 0, time, null, 1, pose, MixDirection.in);
      return;
    }
    let rotateTimeline = timeline;
    let frames = rotateTimeline.frames;
    let bone = skeleton.bones[rotateTimeline.boneIndex];
    if (time < frames[0]) {
      if (pose == MixPose.setup) bone.rotation = bone.data.rotation;
      return;
    }
    let r2 = 0;
    if (time >= frames[frames.length - RotateTimeline.ENTRIES])
      r2 = bone.data.rotation + frames[frames.length + RotateTimeline.PREV_ROTATION];
    else {
      let frame = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
      let prevRotation = frames[frame + RotateTimeline.PREV_ROTATION];
      let frameTime = frames[frame];
      let percent = rotateTimeline.getCurvePercent(
        (frame >> 1) - 1,
        1 - (time - frameTime) / (frames[frame + RotateTimeline.PREV_TIME] - frameTime),
      );
      r2 = frames[frame + RotateTimeline.ROTATION] - prevRotation;
      r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
      r2 = prevRotation + r2 * percent + bone.data.rotation;
      r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
    }
    let r1 = pose == MixPose.setup ? bone.data.rotation : bone.rotation;
    let total = 0,
      diff = r2 - r1;
    if (diff == 0) {
      total = timelinesRotation[i];
    } else {
      diff -= (16384 - ((16384.499999999996 - diff / 360) | 0)) * 360;
      let lastTotal = 0,
        lastDiff = 0;
      if (firstFrame) {
        lastTotal = 0;
        lastDiff = diff;
      } else {
        lastTotal = timelinesRotation[i];
        lastDiff = timelinesRotation[i + 1];
      }
      let current = diff > 0,
        dir = lastTotal >= 0;
      if (MathUtils.signum(lastDiff) != MathUtils.signum(diff) && Math.abs(lastDiff) <= 90) {
        if (Math.abs(lastTotal) > 180) lastTotal += 360 * MathUtils.signum(lastTotal);
        dir = current;
      }
      total = diff + lastTotal - (lastTotal % 360);
      if (dir != current) total += 360 * MathUtils.signum(lastTotal);
      timelinesRotation[i] = total;
    }
    timelinesRotation[i + 1] = diff;
    r1 += total * alpha;
    bone.rotation = r1 - (16384 - ((16384.499999999996 - r1 / 360) | 0)) * 360;
  }
  queueEvents(entry, animationTime) {
    let animationStart = entry.animationStart,
      animationEnd = entry.animationEnd;
    let duration = animationEnd - animationStart;
    let trackLastWrapped = entry.trackLast % duration;
    let events = this.events;
    let i = 0,
      n = events.length;
    for (; i < n; i++) {
      let event = events[i];
      if (event.time < trackLastWrapped) break;
      if (event.time > animationEnd) continue;
      this.queue.event(entry, event);
    }
    var complete = false;
    if (entry.loop) complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
    else complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
    if (complete) this.queue.complete(entry);
    for (; i < n; i++) {
      let event = events[i];
      if (event.time < animationStart) continue;
      this.queue.event(entry, events[i]);
    }
  }
  clearTracks() {
    let oldDrainDisabled = this.queue.drainDisabled;
    this.queue.drainDisabled = true;
    for (let i = 0, n = this.tracks.length; i < n; i++) this.clearTrack(i);
    this.tracks.length = 0;
    this.queue.drainDisabled = oldDrainDisabled;
    this.queue.drain();
  }
  clearTrack(trackIndex) {
    if (trackIndex >= this.tracks.length) return;
    let current = this.tracks[trackIndex];
    if (current == null) return;
    this.queue.end(current);
    this.disposeNext(current);
    let entry = current;
    while (true) {
      let from = entry.mixingFrom;
      if (from == null) break;
      this.queue.end(from);
      entry.mixingFrom = null;
      entry = from;
    }
    this.tracks[current.trackIndex] = null;
    this.queue.drain();
  }
  setCurrent(index, current, interrupt) {
    let from = this.expandToIndex(index);
    this.tracks[index] = current;
    if (from != null) {
      if (interrupt) this.queue.interrupt(from);
      current.mixingFrom = from;
      current.mixTime = 0;
      if (from.mixingFrom != null && from.mixDuration > 0)
        current.interruptAlpha *= Math.min(1, from.mixTime / from.mixDuration);
      from.timelinesRotation.length = 0;
    }
    this.queue.start(current);
  }
  setAnimation(trackIndex, animationName, loop) {
    let animation = this.data.skeletonData.findAnimation(animationName);
    if (animation == null) throw new Error('Animation not found: ' + animationName);
    return this.setAnimationWith(trackIndex, animation, loop);
  }
  setAnimationWith(trackIndex, animation, loop) {
    if (animation == null) throw new Error('animation cannot be null.');
    let interrupt = true;
    let current = this.expandToIndex(trackIndex);
    if (current != null) {
      if (current.nextTrackLast == -1) {
        this.tracks[trackIndex] = current.mixingFrom;
        this.queue.interrupt(current);
        this.queue.end(current);
        this.disposeNext(current);
        current = current.mixingFrom;
        interrupt = false;
      } else this.disposeNext(current);
    }
    let entry = this.trackEntry(trackIndex, animation, loop, current);
    this.setCurrent(trackIndex, entry, interrupt);
    this.queue.drain();
    return entry;
  }
  addAnimation(trackIndex, animationName, loop, delay) {
    let animation = this.data.skeletonData.findAnimation(animationName);
    if (animation == null) throw new Error('Animation not found: ' + animationName);
    return this.addAnimationWith(trackIndex, animation, loop, delay);
  }
  addAnimationWith(trackIndex, animation, loop, delay) {
    if (animation == null) throw new Error('animation cannot be null.');
    let last = this.expandToIndex(trackIndex);
    if (last != null) {
      while (last.next != null) last = last.next;
    }
    let entry = this.trackEntry(trackIndex, animation, loop, last);
    if (last == null) {
      this.setCurrent(trackIndex, entry, true);
      this.queue.drain();
    } else {
      last.next = entry;
      if (delay <= 0) {
        let duration = last.animationEnd - last.animationStart;
        if (duration != 0) {
          if (last.loop) delay += duration * (1 + ((last.trackTime / duration) | 0));
          else delay += duration;
          delay -= this.data.getMix(last.animation, animation);
        } else delay = 0;
      }
    }
    entry.delay = delay;
    return entry;
  }
  setEmptyAnimation(trackIndex, mixDuration) {
    let entry = this.setAnimationWith(trackIndex, _AnimationState.emptyAnimation, false);
    entry.mixDuration = mixDuration;
    entry.trackEnd = mixDuration;
    return entry;
  }
  addEmptyAnimation(trackIndex, mixDuration, delay) {
    if (delay <= 0) delay -= mixDuration;
    let entry = this.addAnimationWith(trackIndex, _AnimationState.emptyAnimation, false, delay);
    entry.mixDuration = mixDuration;
    entry.trackEnd = mixDuration;
    return entry;
  }
  setEmptyAnimations(mixDuration) {
    let oldDrainDisabled = this.queue.drainDisabled;
    this.queue.drainDisabled = true;
    for (let i = 0, n = this.tracks.length; i < n; i++) {
      let current = this.tracks[i];
      if (current != null) this.setEmptyAnimation(current.trackIndex, mixDuration);
    }
    this.queue.drainDisabled = oldDrainDisabled;
    this.queue.drain();
  }
  expandToIndex(index) {
    if (index < this.tracks.length) return this.tracks[index];
    Utils.ensureArrayCapacity(this.tracks, index - this.tracks.length + 1, null);
    this.tracks.length = index + 1;
    return null;
  }
  trackEntry(trackIndex, animation, loop, last) {
    let entry = this.trackEntryPool.obtain();
    entry.trackIndex = trackIndex;
    entry.animation = animation;
    entry.loop = loop;
    entry.eventThreshold = 0;
    entry.attachmentThreshold = 0;
    entry.drawOrderThreshold = 0;
    entry.animationStart = 0;
    entry.animationEnd = animation.duration;
    entry.animationLast = -1;
    entry.nextAnimationLast = -1;
    entry.delay = 0;
    entry.trackTime = 0;
    entry.trackLast = -1;
    entry.nextTrackLast = -1;
    entry.trackEnd = Number.MAX_VALUE;
    entry.timeScale = 1;
    entry.alpha = 1;
    entry.interruptAlpha = 1;
    entry.mixTime = 0;
    entry.mixDuration = last == null ? 0 : this.data.getMix(last.animation, animation);
    return entry;
  }
  disposeNext(entry) {
    let next = entry.next;
    while (next != null) {
      this.queue.dispose(next);
      next = next.next;
    }
    entry.next = null;
  }
  _animationsChanged() {
    this.animationsChanged = false;
    let propertyIDs = this.propertyIDs;
    propertyIDs.clear();
    let mixingTo = this.mixingTo;
    for (var i = 0, n = this.tracks.length; i < n; i++) {
      let entry = this.tracks[i];
      if (entry != null) entry.setTimelineData(null, mixingTo, propertyIDs);
    }
  }
  getCurrent(trackIndex) {
    if (trackIndex >= this.tracks.length) return null;
    return this.tracks[trackIndex];
  }
  addListener(listener) {
    if (listener == null) throw new Error('listener cannot be null.');
    this.listeners.push(listener);
  }
  /** Removes the listener added with {@link #addListener(AnimationStateListener)}. */
  removeListener(listener) {
    let index = this.listeners.indexOf(listener);
    if (index >= 0) this.listeners.splice(index, 1);
  }
  clearListeners() {
    this.listeners.length = 0;
  }
  clearListenerNotifications() {
    this.queue.clear();
  }
};
__publicField(_AnimationState, 'emptyAnimation', new Animation('<empty>', [], 0));
__publicField(_AnimationState, 'SUBSEQUENT', 0);
__publicField(_AnimationState, 'FIRST', 1);
__publicField(_AnimationState, 'DIP', 2);
__publicField(_AnimationState, 'DIP_MIX', 3);
let AnimationState = _AnimationState;
class TrackEntry {
  constructor() {
    __publicField(this, 'animation');
    __publicField(this, 'next');
    __publicField(this, 'mixingFrom');
    __publicField(this, 'listener');
    __publicField(this, 'trackIndex');
    __publicField(this, 'loop');
    __publicField(this, 'eventThreshold');
    __publicField(this, 'attachmentThreshold');
    __publicField(this, 'drawOrderThreshold');
    __publicField(this, 'animationStart');
    __publicField(this, 'animationEnd');
    __publicField(this, 'animationLast');
    __publicField(this, 'nextAnimationLast');
    __publicField(this, 'delay');
    __publicField(this, 'trackTime');
    __publicField(this, 'trackLast');
    __publicField(this, 'nextTrackLast');
    __publicField(this, 'trackEnd');
    __publicField(this, 'timeScale');
    __publicField(this, 'alpha');
    __publicField(this, 'mixTime');
    __publicField(this, 'mixDuration');
    __publicField(this, 'interruptAlpha');
    __publicField(this, 'totalAlpha');
    __publicField(this, 'timelineData', new Array());
    __publicField(this, 'timelineDipMix', new Array());
    __publicField(this, 'timelinesRotation', new Array());
  }
  reset() {
    this.next = null;
    this.mixingFrom = null;
    this.animation = null;
    this.listener = null;
    this.timelineData.length = 0;
    this.timelineDipMix.length = 0;
    this.timelinesRotation.length = 0;
  }
  setTimelineData(to, mixingToArray, propertyIDs) {
    if (to != null) mixingToArray.push(to);
    let lastEntry = this.mixingFrom != null ? this.mixingFrom.setTimelineData(this, mixingToArray, propertyIDs) : this;
    if (to != null) mixingToArray.pop();
    let mixingTo = mixingToArray;
    let mixingToLast = mixingToArray.length - 1;
    let timelines = this.animation.timelines;
    let timelinesCount = this.animation.timelines.length;
    let timelineData = Utils.setArraySize(this.timelineData, timelinesCount);
    this.timelineDipMix.length = 0;
    let timelineDipMix = Utils.setArraySize(this.timelineDipMix, timelinesCount);
    outer: for (var i = 0; i < timelinesCount; i++) {
      let id = timelines[i].getPropertyId();
      if (!propertyIDs.add(id)) timelineData[i] = AnimationState.SUBSEQUENT;
      else if (to == null || !to.hasTimeline(id)) timelineData[i] = AnimationState.FIRST;
      else {
        for (var ii = mixingToLast; ii >= 0; ii--) {
          let entry = mixingTo[ii];
          if (!entry.hasTimeline(id)) {
            if (entry.mixDuration > 0) {
              timelineData[i] = AnimationState.DIP_MIX;
              timelineDipMix[i] = entry;
              continue outer;
            }
          }
        }
        timelineData[i] = AnimationState.DIP;
      }
    }
    return lastEntry;
  }
  hasTimeline(id) {
    let timelines = this.animation.timelines;
    for (var i = 0, n = timelines.length; i < n; i++) if (timelines[i].getPropertyId() == id) return true;
    return false;
  }
  getAnimationTime() {
    if (this.loop) {
      let duration = this.animationEnd - this.animationStart;
      if (duration == 0) return this.animationStart;
      return (this.trackTime % duration) + this.animationStart;
    }
    return Math.min(this.trackTime + this.animationStart, this.animationEnd);
  }
  setAnimationLast(animationLast) {
    this.animationLast = animationLast;
    this.nextAnimationLast = animationLast;
  }
  isComplete() {
    return this.trackTime >= this.animationEnd - this.animationStart;
  }
  resetRotationDirections() {
    this.timelinesRotation.length = 0;
  }
}
class EventQueue {
  constructor(animState) {
    __publicField(this, 'objects', []);
    __publicField(this, 'drainDisabled', false);
    __publicField(this, 'animState');
    this.animState = animState;
  }
  start(entry) {
    this.objects.push(
      0,
      /* start */
    );
    this.objects.push(entry);
    this.animState.animationsChanged = true;
  }
  interrupt(entry) {
    this.objects.push(
      1,
      /* interrupt */
    );
    this.objects.push(entry);
  }
  end(entry) {
    this.objects.push(
      2,
      /* end */
    );
    this.objects.push(entry);
    this.animState.animationsChanged = true;
  }
  dispose(entry) {
    this.objects.push(
      3,
      /* dispose */
    );
    this.objects.push(entry);
  }
  complete(entry) {
    this.objects.push(
      4,
      /* complete */
    );
    this.objects.push(entry);
  }
  event(entry, event) {
    this.objects.push(
      5,
      /* event */
    );
    this.objects.push(entry);
    this.objects.push(event);
  }
  drain() {
    if (this.drainDisabled) return;
    this.drainDisabled = true;
    let objects = this.objects;
    let listeners = this.animState.listeners;
    for (let i = 0; i < objects.length; i += 2) {
      let type = objects[i];
      let entry = objects[i + 1];
      switch (type) {
        case 0:
          if (entry.listener != null && entry.listener.start) entry.listener.start(entry);
          for (let ii = 0; ii < listeners.length; ii++) if (listeners[ii].start) listeners[ii].start(entry);
          break;
        case 1:
          if (entry.listener != null && entry.listener.interrupt) entry.listener.interrupt(entry);
          for (let ii = 0; ii < listeners.length; ii++) if (listeners[ii].interrupt) listeners[ii].interrupt(entry);
          break;
        case 2:
          if (entry.listener != null && entry.listener.end) entry.listener.end(entry);
          for (let ii = 0; ii < listeners.length; ii++) if (listeners[ii].end) listeners[ii].end(entry);
        case 3:
          if (entry.listener != null && entry.listener.dispose) entry.listener.dispose(entry);
          for (let ii = 0; ii < listeners.length; ii++) if (listeners[ii].dispose) listeners[ii].dispose(entry);
          this.animState.trackEntryPool.free(entry);
          break;
        case 4:
          if (entry.listener != null && entry.listener.complete) entry.listener.complete(entry);
          for (let ii = 0; ii < listeners.length; ii++) if (listeners[ii].complete) listeners[ii].complete(entry);
          break;
        case 5:
          let event = objects[i++ + 2];
          if (entry.listener != null && entry.listener.event) entry.listener.event(entry, event);
          for (let ii = 0; ii < listeners.length; ii++) if (listeners[ii].event) listeners[ii].event(entry, event);
          break;
      }
    }
    this.clear();
    this.drainDisabled = false;
  }
  clear() {
    this.objects.length = 0;
  }
}
var EventType = /* @__PURE__ */ (EventType2 => {
  EventType2[(EventType2['start'] = 0)] = 'start';
  EventType2[(EventType2['interrupt'] = 1)] = 'interrupt';
  EventType2[(EventType2['end'] = 2)] = 'end';
  EventType2[(EventType2['dispose'] = 3)] = 'dispose';
  EventType2[(EventType2['complete'] = 4)] = 'complete';
  EventType2[(EventType2['event'] = 5)] = 'event';
  return EventType2;
})(EventType || {});
class AnimationStateAdapter2 {
  start(entry) {}
  interrupt(entry) {}
  end(entry) {}
  dispose(entry) {}
  complete(entry) {}
  event(entry, event) {}
}
class AnimationStateData {
  constructor(skeletonData) {
    __publicField(this, 'skeletonData');
    __publicField(this, 'animationToMixTime', {});
    __publicField(this, 'defaultMix', 0);
    if (skeletonData == null) throw new Error('skeletonData cannot be null.');
    this.skeletonData = skeletonData;
  }
  setMix(fromName, toName, duration) {
    let from = this.skeletonData.findAnimation(fromName);
    if (from == null) throw new Error('Animation not found: ' + fromName);
    let to = this.skeletonData.findAnimation(toName);
    if (to == null) throw new Error('Animation not found: ' + toName);
    this.setMixWith(from, to, duration);
  }
  setMixWith(from, to, duration) {
    if (from == null) throw new Error('from cannot be null.');
    if (to == null) throw new Error('to cannot be null.');
    let key = from.name + '.' + to.name;
    this.animationToMixTime[key] = duration;
  }
  getMix(from, to) {
    let key = from.name + '.' + to.name;
    let value = this.animationToMixTime[key];
    return value === void 0 ? this.defaultMix : value;
  }
}
class BoundingBoxAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    __publicField(this, 'color', new Color(1, 1, 1, 1));
  }
}
class ClippingAttachment extends VertexAttachment {
  // ce3a3aff
  constructor(name) {
    super(name);
    __publicField(this, 'endSlot');
    // Nonessential.
    __publicField(this, 'color', new Color(0.2275, 0.2275, 0.8078, 1));
  }
}
class MeshAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    __publicField(this, 'region');
    __publicField(this, 'path');
    __publicField(this, 'regionUVs');
    __publicField(this, 'uvs');
    __publicField(this, 'triangles');
    __publicField(this, 'color', new Color(1, 1, 1, 1));
    __publicField(this, 'hullLength');
    __publicField(this, 'parentMesh');
    __publicField(this, 'inheritDeform', false);
    __publicField(this, 'tempColor', new Color(0, 0, 0, 0));
  }
  updateUVs() {
    let u = 0,
      v = 0,
      width = 0,
      height = 0;
    if (this.region == null) {
      u = v = 0;
      width = height = 1;
    } else {
      u = this.region.u;
      v = this.region.v;
      width = this.region.u2 - u;
      height = this.region.v2 - v;
    }
    let regionUVs = this.regionUVs;
    if (this.uvs == null || this.uvs.length != regionUVs.length) this.uvs = Utils.newFloatArray(regionUVs.length);
    let uvs = this.uvs;
    if (this.region.rotate) {
      for (let i = 0, n = uvs.length; i < n; i += 2) {
        uvs[i] = u + regionUVs[i + 1] * width;
        uvs[i + 1] = v + height - regionUVs[i] * height;
      }
    } else {
      for (let i = 0, n = uvs.length; i < n; i += 2) {
        uvs[i] = u + regionUVs[i] * width;
        uvs[i + 1] = v + regionUVs[i + 1] * height;
      }
    }
  }
  applyDeform(sourceAttachment) {
    return this == sourceAttachment || (this.inheritDeform && this.parentMesh == sourceAttachment);
  }
  getParentMesh() {
    return this.parentMesh;
  }
  /** @param parentMesh May be null. */
  setParentMesh(parentMesh) {
    this.parentMesh = parentMesh;
    if (parentMesh != null) {
      this.bones = parentMesh.bones;
      this.vertices = parentMesh.vertices;
      this.worldVerticesLength = parentMesh.worldVerticesLength;
      this.regionUVs = parentMesh.regionUVs;
      this.triangles = parentMesh.triangles;
      this.hullLength = parentMesh.hullLength;
      this.worldVerticesLength = parentMesh.worldVerticesLength;
    }
  }
}
class PathAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    __publicField(this, 'lengths');
    __publicField(this, 'closed', false);
    __publicField(this, 'constantSpeed', false);
    __publicField(this, 'color', new Color(1, 1, 1, 1));
  }
}
class PointAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    __publicField(this, 'x');
    __publicField(this, 'y');
    __publicField(this, 'rotation');
    __publicField(this, 'color', new Color(0.38, 0.94, 0, 1));
  }
  computeWorldPosition(bone, point) {
    point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
    point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
    return point;
  }
  computeWorldRotation(bone) {
    let cos = MathUtils.cosDeg(this.rotation),
      sin = MathUtils.sinDeg(this.rotation);
    let x = cos * bone.a + sin * bone.b;
    let y = cos * bone.c + sin * bone.d;
    return Math.atan2(y, x) * MathUtils.radDeg;
  }
}
const _RegionAttachment = class _RegionAttachment extends Attachment {
  constructor(name) {
    super(name);
    __publicField(this, 'x', 0);
    __publicField(this, 'y', 0);
    __publicField(this, 'scaleX', 1);
    __publicField(this, 'scaleY', 1);
    __publicField(this, 'rotation', 0);
    __publicField(this, 'width', 0);
    __publicField(this, 'height', 0);
    __publicField(this, 'color', new Color(1, 1, 1, 1));
    __publicField(this, 'path');
    __publicField(this, 'rendererObject');
    __publicField(this, 'region');
    __publicField(this, 'offset', Utils.newFloatArray(8));
    __publicField(this, 'uvs', Utils.newFloatArray(8));
    __publicField(this, 'tempColor', new Color(1, 1, 1, 1));
  }
  updateOffset() {
    let regionScaleX = (this.width / this.region.originalWidth) * this.scaleX;
    let regionScaleY = (this.height / this.region.originalHeight) * this.scaleY;
    let localX = (-this.width / 2) * this.scaleX + this.region.offsetX * regionScaleX;
    let localY = (-this.height / 2) * this.scaleY + this.region.offsetY * regionScaleY;
    let localX2 = localX + this.region.width * regionScaleX;
    let localY2 = localY + this.region.height * regionScaleY;
    let radians = (this.rotation * Math.PI) / 180;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let localXCos = localX * cos + this.x;
    let localXSin = localX * sin;
    let localYCos = localY * cos + this.y;
    let localYSin = localY * sin;
    let localX2Cos = localX2 * cos + this.x;
    let localX2Sin = localX2 * sin;
    let localY2Cos = localY2 * cos + this.y;
    let localY2Sin = localY2 * sin;
    let offset = this.offset;
    offset[_RegionAttachment.OX1] = localXCos - localYSin;
    offset[_RegionAttachment.OY1] = localYCos + localXSin;
    offset[_RegionAttachment.OX2] = localXCos - localY2Sin;
    offset[_RegionAttachment.OY2] = localY2Cos + localXSin;
    offset[_RegionAttachment.OX3] = localX2Cos - localY2Sin;
    offset[_RegionAttachment.OY3] = localY2Cos + localX2Sin;
    offset[_RegionAttachment.OX4] = localX2Cos - localYSin;
    offset[_RegionAttachment.OY4] = localYCos + localX2Sin;
  }
  setRegion(region) {
    this.region = region;
    let uvs = this.uvs;
    if (region.rotate) {
      uvs[0] = region.u2;
      uvs[1] = region.v2;
      uvs[2] = region.u;
      uvs[3] = region.v2;
      uvs[4] = region.u;
      uvs[5] = region.v;
      uvs[6] = region.u2;
      uvs[7] = region.v;
    } else {
      uvs[0] = region.u;
      uvs[1] = region.v2;
      uvs[2] = region.u;
      uvs[3] = region.v;
      uvs[4] = region.u2;
      uvs[5] = region.v;
      uvs[6] = region.u2;
      uvs[7] = region.v2;
    }
  }
  computeWorldVertices(bone, worldVertices, offset, stride) {
    let vertexOffset = this.offset;
    let x = bone.worldX,
      y = bone.worldY;
    let a = bone.a,
      b = bone.b,
      c = bone.c,
      d = bone.d;
    let offsetX = 0,
      offsetY = 0;
    offsetX = vertexOffset[_RegionAttachment.OX1];
    offsetY = vertexOffset[_RegionAttachment.OY1];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    offset += stride;
    offsetX = vertexOffset[_RegionAttachment.OX2];
    offsetY = vertexOffset[_RegionAttachment.OY2];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    offset += stride;
    offsetX = vertexOffset[_RegionAttachment.OX3];
    offsetY = vertexOffset[_RegionAttachment.OY3];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    offset += stride;
    offsetX = vertexOffset[_RegionAttachment.OX4];
    offsetY = vertexOffset[_RegionAttachment.OY4];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
  }
};
__publicField(_RegionAttachment, 'OX1', 0);
__publicField(_RegionAttachment, 'OY1', 1);
__publicField(_RegionAttachment, 'OX2', 2);
__publicField(_RegionAttachment, 'OY2', 3);
__publicField(_RegionAttachment, 'OX3', 4);
__publicField(_RegionAttachment, 'OY3', 5);
__publicField(_RegionAttachment, 'OX4', 6);
__publicField(_RegionAttachment, 'OY4', 7);
__publicField(_RegionAttachment, 'X1', 0);
__publicField(_RegionAttachment, 'Y1', 1);
__publicField(_RegionAttachment, 'C1R', 2);
__publicField(_RegionAttachment, 'C1G', 3);
__publicField(_RegionAttachment, 'C1B', 4);
__publicField(_RegionAttachment, 'C1A', 5);
__publicField(_RegionAttachment, 'U1', 6);
__publicField(_RegionAttachment, 'V1', 7);
__publicField(_RegionAttachment, 'X2', 8);
__publicField(_RegionAttachment, 'Y2', 9);
__publicField(_RegionAttachment, 'C2R', 10);
__publicField(_RegionAttachment, 'C2G', 11);
__publicField(_RegionAttachment, 'C2B', 12);
__publicField(_RegionAttachment, 'C2A', 13);
__publicField(_RegionAttachment, 'U2', 14);
__publicField(_RegionAttachment, 'V2', 15);
__publicField(_RegionAttachment, 'X3', 16);
__publicField(_RegionAttachment, 'Y3', 17);
__publicField(_RegionAttachment, 'C3R', 18);
__publicField(_RegionAttachment, 'C3G', 19);
__publicField(_RegionAttachment, 'C3B', 20);
__publicField(_RegionAttachment, 'C3A', 21);
__publicField(_RegionAttachment, 'U3', 22);
__publicField(_RegionAttachment, 'V3', 23);
__publicField(_RegionAttachment, 'X4', 24);
__publicField(_RegionAttachment, 'Y4', 25);
__publicField(_RegionAttachment, 'C4R', 26);
__publicField(_RegionAttachment, 'C4G', 27);
__publicField(_RegionAttachment, 'C4B', 28);
__publicField(_RegionAttachment, 'C4A', 29);
__publicField(_RegionAttachment, 'U4', 30);
__publicField(_RegionAttachment, 'V4', 31);
let RegionAttachment = _RegionAttachment;
class AtlasAttachmentLoader {
  constructor(atlas) {
    __publicField(this, 'atlas');
    this.atlas = atlas;
  }
  /** @return May be null to not load an attachment. */
  newRegionAttachment(skin, name, path2) {
    let region = this.atlas.findRegion(path2);
    if (region == null) throw new Error('Region not found in atlas: ' + path2 + ' (region attachment: ' + name + ')');
    region.renderObject = region;
    let attachment = new RegionAttachment(name);
    attachment.setRegion(region);
    return attachment;
  }
  /** @return May be null to not load an attachment. */
  newMeshAttachment(skin, name, path2) {
    let region = this.atlas.findRegion(path2);
    if (region == null) throw new Error('Region not found in atlas: ' + path2 + ' (mesh attachment: ' + name + ')');
    region.renderObject = region;
    let attachment = new MeshAttachment(name);
    attachment.region = region;
    return attachment;
  }
  /** @return May be null to not load an attachment. */
  newBoundingBoxAttachment(skin, name) {
    return new BoundingBoxAttachment(name);
  }
  /** @return May be null to not load an attachment */
  newPathAttachment(skin, name) {
    return new PathAttachment(name);
  }
  newPointAttachment(skin, name) {
    return new PointAttachment(name);
  }
  newClippingAttachment(skin, name) {
    return new ClippingAttachment(name);
  }
}
class BoneData {
  constructor(index, name, parent) {
    __publicField(this, 'index');
    __publicField(this, 'name');
    __publicField(this, 'parent');
    __publicField(this, 'length');
    __publicField(this, 'x', 0);
    __publicField(this, 'y', 0);
    __publicField(this, 'rotation', 0);
    __publicField(this, 'scaleX', 1);
    __publicField(this, 'scaleY', 1);
    __publicField(this, 'shearX', 0);
    __publicField(this, 'shearY', 0);
    __publicField(this, 'transformMode', 0);
    if (index < 0) throw new Error('index must be >= 0.');
    if (name == null) throw new Error('name cannot be null.');
    this.index = index;
    this.name = name;
    this.parent = parent;
  }
}
var TransformMode = /* @__PURE__ */ (TransformMode2 => {
  TransformMode2[(TransformMode2['Normal'] = 0)] = 'Normal';
  TransformMode2[(TransformMode2['OnlyTranslation'] = 1)] = 'OnlyTranslation';
  TransformMode2[(TransformMode2['NoRotationOrReflection'] = 2)] = 'NoRotationOrReflection';
  TransformMode2[(TransformMode2['NoScale'] = 3)] = 'NoScale';
  TransformMode2[(TransformMode2['NoScaleOrReflection'] = 4)] = 'NoScaleOrReflection';
  return TransformMode2;
})(TransformMode || {});
class Bone {
  /** @param parent May be null. */
  constructor(data, skeleton, parent) {
    __publicField(this, 'data');
    __publicField(this, 'skeleton');
    __publicField(this, 'parent');
    __publicField(this, 'children', new Array());
    __publicField(this, 'x', 0);
    __publicField(this, 'y', 0);
    __publicField(this, 'rotation', 0);
    __publicField(this, 'scaleX', 0);
    __publicField(this, 'scaleY', 0);
    __publicField(this, 'shearX', 0);
    __publicField(this, 'shearY', 0);
    __publicField(this, 'ax', 0);
    __publicField(this, 'ay', 0);
    __publicField(this, 'arotation', 0);
    __publicField(this, 'ascaleX', 0);
    __publicField(this, 'ascaleY', 0);
    __publicField(this, 'ashearX', 0);
    __publicField(this, 'ashearY', 0);
    __publicField(this, 'appliedValid', false);
    __publicField(this, 'a', 0);
    __publicField(this, 'b', 0);
    __publicField(this, 'worldX', 0);
    __publicField(this, 'c', 0);
    __publicField(this, 'd', 0);
    __publicField(this, 'worldY', 0);
    __publicField(this, 'sorted', false);
    if (data == null) throw new Error('data cannot be null.');
    if (skeleton == null) throw new Error('skeleton cannot be null.');
    this.data = data;
    this.skeleton = skeleton;
    this.parent = parent;
    this.setToSetupPose();
  }
  /** Same as {@link #updateWorldTransform()}. This method exists for Bone to implement {@link Updatable}. */
  update() {
    this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
  }
  /** Computes the world transform using the parent bone and this bone's local transform. */
  updateWorldTransform() {
    this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
  }
  /** Computes the world transform using the parent bone and the specified local transform. */
  updateWorldTransformWith(x, y, rotation, scaleX, scaleY, shearX, shearY) {
    this.ax = x;
    this.ay = y;
    this.arotation = rotation;
    this.ascaleX = scaleX;
    this.ascaleY = scaleY;
    this.ashearX = shearX;
    this.ashearY = shearY;
    this.appliedValid = true;
    let parent = this.parent;
    if (parent == null) {
      let rotationY = rotation + 90 + shearY;
      let la = MathUtils.cosDeg(rotation + shearX) * scaleX;
      let lb = MathUtils.cosDeg(rotationY) * scaleY;
      let lc = MathUtils.sinDeg(rotation + shearX) * scaleX;
      let ld = MathUtils.sinDeg(rotationY) * scaleY;
      let skeleton = this.skeleton;
      if (skeleton.flipX) {
        x = -x;
        la = -la;
        lb = -lb;
      }
      if (skeleton.flipY) {
        y = -y;
        lc = -lc;
        ld = -ld;
      }
      this.a = la;
      this.b = lb;
      this.c = lc;
      this.d = ld;
      this.worldX = x + skeleton.x;
      this.worldY = y + skeleton.y;
      return;
    }
    let pa = parent.a,
      pb = parent.b,
      pc = parent.c,
      pd = parent.d;
    this.worldX = pa * x + pb * y + parent.worldX;
    this.worldY = pc * x + pd * y + parent.worldY;
    switch (this.data.transformMode) {
      case TransformMode.Normal: {
        let rotationY = rotation + 90 + shearY;
        let la = MathUtils.cosDeg(rotation + shearX) * scaleX;
        let lb = MathUtils.cosDeg(rotationY) * scaleY;
        let lc = MathUtils.sinDeg(rotation + shearX) * scaleX;
        let ld = MathUtils.sinDeg(rotationY) * scaleY;
        this.a = pa * la + pb * lc;
        this.b = pa * lb + pb * ld;
        this.c = pc * la + pd * lc;
        this.d = pc * lb + pd * ld;
        return;
      }
      case TransformMode.OnlyTranslation: {
        let rotationY = rotation + 90 + shearY;
        this.a = MathUtils.cosDeg(rotation + shearX) * scaleX;
        this.b = MathUtils.cosDeg(rotationY) * scaleY;
        this.c = MathUtils.sinDeg(rotation + shearX) * scaleX;
        this.d = MathUtils.sinDeg(rotationY) * scaleY;
        break;
      }
      case TransformMode.NoRotationOrReflection: {
        let s = pa * pa + pc * pc;
        let prx = 0;
        if (s > 1e-4) {
          s = Math.abs(pa * pd - pb * pc) / s;
          pb = pc * s;
          pd = pa * s;
          prx = Math.atan2(pc, pa) * MathUtils.radDeg;
        } else {
          pa = 0;
          pc = 0;
          prx = 90 - Math.atan2(pd, pb) * MathUtils.radDeg;
        }
        let rx = rotation + shearX - prx;
        let ry = rotation + shearY - prx + 90;
        let la = MathUtils.cosDeg(rx) * scaleX;
        let lb = MathUtils.cosDeg(ry) * scaleY;
        let lc = MathUtils.sinDeg(rx) * scaleX;
        let ld = MathUtils.sinDeg(ry) * scaleY;
        this.a = pa * la - pb * lc;
        this.b = pa * lb - pb * ld;
        this.c = pc * la + pd * lc;
        this.d = pc * lb + pd * ld;
        break;
      }
      case TransformMode.NoScale:
      case TransformMode.NoScaleOrReflection: {
        let cos = MathUtils.cosDeg(rotation);
        let sin = MathUtils.sinDeg(rotation);
        let za = pa * cos + pb * sin;
        let zc = pc * cos + pd * sin;
        let s = Math.sqrt(za * za + zc * zc);
        if (s > 1e-5) s = 1 / s;
        za *= s;
        zc *= s;
        s = Math.sqrt(za * za + zc * zc);
        let r = Math.PI / 2 + Math.atan2(zc, za);
        let zb = Math.cos(r) * s;
        let zd = Math.sin(r) * s;
        let la = MathUtils.cosDeg(shearX) * scaleX;
        let lb = MathUtils.cosDeg(90 + shearY) * scaleY;
        let lc = MathUtils.sinDeg(shearX) * scaleX;
        let ld = MathUtils.sinDeg(90 + shearY) * scaleY;
        if (
          this.data.transformMode != TransformMode.NoScaleOrReflection
            ? pa * pd - pb * pc < 0
            : this.skeleton.flipX != this.skeleton.flipY
        ) {
          zb = -zb;
          zd = -zd;
        }
        this.a = za * la + zb * lc;
        this.b = za * lb + zb * ld;
        this.c = zc * la + zd * lc;
        this.d = zc * lb + zd * ld;
        return;
      }
    }
    if (this.skeleton.flipX) {
      this.a = -this.a;
      this.b = -this.b;
    }
    if (this.skeleton.flipY) {
      this.c = -this.c;
      this.d = -this.d;
    }
  }
  setToSetupPose() {
    let data = this.data;
    this.x = data.x;
    this.y = data.y;
    this.rotation = data.rotation;
    this.scaleX = data.scaleX;
    this.scaleY = data.scaleY;
    this.shearX = data.shearX;
    this.shearY = data.shearY;
  }
  getWorldRotationX() {
    return Math.atan2(this.c, this.a) * MathUtils.radDeg;
  }
  getWorldRotationY() {
    return Math.atan2(this.d, this.b) * MathUtils.radDeg;
  }
  getWorldScaleX() {
    return Math.sqrt(this.a * this.a + this.c * this.c);
  }
  getWorldScaleY() {
    return Math.sqrt(this.b * this.b + this.d * this.d);
  }
  /** Computes the individual applied transform values from the world transform. This can be useful to perform processing using
   * the applied transform after the world transform has been modified directly (eg, by a constraint).
   * <p>
   * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation. */
  updateAppliedTransform() {
    this.appliedValid = true;
    let parent = this.parent;
    if (parent == null) {
      this.ax = this.worldX;
      this.ay = this.worldY;
      this.arotation = Math.atan2(this.c, this.a) * MathUtils.radDeg;
      this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
      this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
      this.ashearX = 0;
      this.ashearY =
        Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * MathUtils.radDeg;
      return;
    }
    let pa = parent.a,
      pb = parent.b,
      pc = parent.c,
      pd = parent.d;
    let pid = 1 / (pa * pd - pb * pc);
    let dx = this.worldX - parent.worldX,
      dy = this.worldY - parent.worldY;
    this.ax = dx * pd * pid - dy * pb * pid;
    this.ay = dy * pa * pid - dx * pc * pid;
    let ia = pid * pd;
    let id = pid * pa;
    let ib = pid * pb;
    let ic = pid * pc;
    let ra = ia * this.a - ib * this.c;
    let rb = ia * this.b - ib * this.d;
    let rc = id * this.c - ic * this.a;
    let rd = id * this.d - ic * this.b;
    this.ashearX = 0;
    this.ascaleX = Math.sqrt(ra * ra + rc * rc);
    if (this.ascaleX > 1e-4) {
      let det = ra * rd - rb * rc;
      this.ascaleY = det / this.ascaleX;
      this.ashearY = Math.atan2(ra * rb + rc * rd, det) * MathUtils.radDeg;
      this.arotation = Math.atan2(rc, ra) * MathUtils.radDeg;
    } else {
      this.ascaleX = 0;
      this.ascaleY = Math.sqrt(rb * rb + rd * rd);
      this.ashearY = 0;
      this.arotation = 90 - Math.atan2(rd, rb) * MathUtils.radDeg;
    }
  }
  worldToLocal(world) {
    let a = this.a,
      b = this.b,
      c = this.c,
      d = this.d;
    let invDet = 1 / (a * d - b * c);
    let x = world.x - this.worldX,
      y = world.y - this.worldY;
    world.x = x * d * invDet - y * b * invDet;
    world.y = y * a * invDet - x * c * invDet;
    return world;
  }
  localToWorld(local) {
    let x = local.x,
      y = local.y;
    local.x = x * this.a + y * this.b + this.worldX;
    local.y = x * this.c + y * this.d + this.worldY;
    return local;
  }
  worldToLocalRotation(worldRotation) {
    let sin = MathUtils.sinDeg(worldRotation),
      cos = MathUtils.cosDeg(worldRotation);
    return Math.atan2(this.a * sin - this.c * cos, this.d * cos - this.b * sin) * MathUtils.radDeg;
  }
  localToWorldRotation(localRotation) {
    let sin = MathUtils.sinDeg(localRotation),
      cos = MathUtils.cosDeg(localRotation);
    return Math.atan2(cos * this.c + sin * this.d, cos * this.a + sin * this.b) * MathUtils.radDeg;
  }
  rotateWorld(degrees) {
    let a = this.a,
      b = this.b,
      c = this.c,
      d = this.d;
    let cos = MathUtils.cosDeg(degrees),
      sin = MathUtils.sinDeg(degrees);
    this.a = cos * a - sin * c;
    this.b = cos * b - sin * d;
    this.c = sin * a + cos * c;
    this.d = sin * b + cos * d;
    this.appliedValid = false;
  }
}
class Texture {
  constructor(image) {
    __publicField(this, '_image');
    this._image = image;
  }
  getImage() {
    return this._image;
  }
  static filterFromString(text) {
    switch (text.toLowerCase()) {
      case 'nearest':
        return 9728;
      case 'linear':
        return 9729;
      case 'mipmap':
        return 9987;
      case 'mipmapnearestnearest':
        return 9984;
      case 'mipmaplinearnearest':
        return 9985;
      case 'mipmapnearestlinear':
        return 9986;
      case 'mipmaplinearlinear':
        return 9987;
      default:
        throw new Error(`Unknown texture filter ${text}`);
    }
  }
  static wrapFromString(text) {
    switch (text.toLowerCase()) {
      case 'mirroredtepeat':
        return 33648;
      case 'clamptoedge':
        return 33071;
      case 'repeat':
        return 10497;
      default:
        throw new Error(`Unknown texture wrap ${text}`);
    }
  }
}
var TextureFilter = /* @__PURE__ */ (TextureFilter2 => {
  TextureFilter2[(TextureFilter2['Nearest'] = 9728)] = 'Nearest';
  TextureFilter2[(TextureFilter2['Linear'] = 9729)] = 'Linear';
  TextureFilter2[(TextureFilter2['MipMap'] = 9987)] = 'MipMap';
  TextureFilter2[(TextureFilter2['MipMapNearestNearest'] = 9984)] = 'MipMapNearestNearest';
  TextureFilter2[(TextureFilter2['MipMapLinearNearest'] = 9985)] = 'MipMapLinearNearest';
  TextureFilter2[(TextureFilter2['MipMapNearestLinear'] = 9986)] = 'MipMapNearestLinear';
  TextureFilter2[(TextureFilter2['MipMapLinearLinear'] = 9987)] = 'MipMapLinearLinear';
  return TextureFilter2;
})(TextureFilter || {});
var TextureWrap = /* @__PURE__ */ (TextureWrap2 => {
  TextureWrap2[(TextureWrap2['MirroredRepeat'] = 33648)] = 'MirroredRepeat';
  TextureWrap2[(TextureWrap2['ClampToEdge'] = 33071)] = 'ClampToEdge';
  TextureWrap2[(TextureWrap2['Repeat'] = 10497)] = 'Repeat';
  return TextureWrap2;
})(TextureWrap || {});
class TextureRegion {
  constructor() {
    __publicField(this, 'renderObject');
    __publicField(this, 'u', 0);
    __publicField(this, 'v', 0);
    __publicField(this, 'u2', 0);
    __publicField(this, 'v2', 0);
    __publicField(this, 'width', 0);
    __publicField(this, 'height', 0);
    __publicField(this, 'rotate', false);
    __publicField(this, 'offsetX', 0);
    __publicField(this, 'offsetY', 0);
    __publicField(this, 'originalWidth', 0);
    __publicField(this, 'originalHeight', 0);
    __publicField(this, 'texture');
  }
}
class FakeTexture extends Texture {
  setFilters(minFilter, magFilter) {}
  setWraps(uWrap, vWrap) {}
  dispose() {}
}
class TextureAtlas {
  constructor(atlasText, textureLoader) {
    __publicField(this, 'pages', new Array());
    __publicField(this, 'regions', new Array());
    this.load(atlasText, textureLoader);
  }
  load(atlasText, textureLoader) {
    if (textureLoader == null) throw new Error('textureLoader cannot be null.');
    let reader = new TextureAtlasReader(atlasText);
    let tuple = new Array(4);
    let page = null;
    while (true) {
      let line = reader.readLine();
      if (line == null) break;
      line = line.trim();
      if (line.length == 0) page = null;
      else if (!page) {
        page = new TextureAtlasPage();
        page.name = line;
        if (reader.readTuple(tuple) == 2) {
          page.width = parseInt(tuple[0]);
          page.height = parseInt(tuple[1]);
          reader.readTuple(tuple);
        }
        reader.readTuple(tuple);
        page.minFilter = Texture.filterFromString(tuple[0]);
        page.magFilter = Texture.filterFromString(tuple[1]);
        let direction = reader.readValue();
        page.uWrap = TextureWrap.ClampToEdge;
        page.vWrap = TextureWrap.ClampToEdge;
        if (direction == 'x') page.uWrap = TextureWrap.Repeat;
        else if (direction == 'y') page.vWrap = TextureWrap.Repeat;
        else if (direction == 'xy') page.uWrap = page.vWrap = TextureWrap.Repeat;
        page.texture = textureLoader(line);
        page.texture.setFilters(page.minFilter, page.magFilter);
        page.texture.setWraps(page.uWrap, page.vWrap);
        page.width = page.texture.getImage().width;
        page.height = page.texture.getImage().height;
        this.pages.push(page);
      } else {
        let region = new TextureAtlasRegion();
        region.name = line;
        region.page = page;
        region.rotate = reader.readValue() == 'true';
        reader.readTuple(tuple);
        let x = parseInt(tuple[0]);
        let y = parseInt(tuple[1]);
        reader.readTuple(tuple);
        let width = parseInt(tuple[0]);
        let height = parseInt(tuple[1]);
        region.u = x / page.width;
        region.v = y / page.height;
        if (region.rotate) {
          region.u2 = (x + height) / page.width;
          region.v2 = (y + width) / page.height;
        } else {
          region.u2 = (x + width) / page.width;
          region.v2 = (y + height) / page.height;
        }
        region.x = x;
        region.y = y;
        region.width = Math.abs(width);
        region.height = Math.abs(height);
        if (reader.readTuple(tuple) == 4) {
          if (reader.readTuple(tuple) == 4) {
            reader.readTuple(tuple);
          }
        }
        region.originalWidth = parseInt(tuple[0]);
        region.originalHeight = parseInt(tuple[1]);
        reader.readTuple(tuple);
        region.offsetX = parseInt(tuple[0]);
        region.offsetY = parseInt(tuple[1]);
        region.index = parseInt(reader.readValue());
        region.texture = page.texture;
        this.regions.push(region);
      }
    }
  }
  findRegion(name) {
    for (let i = 0; i < this.regions.length; i++) {
      if (this.regions[i].name == name) {
        return this.regions[i];
      }
    }
    return null;
  }
  dispose() {
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].texture.dispose();
    }
  }
}
class TextureAtlasReader {
  constructor(text) {
    __publicField(this, 'lines');
    __publicField(this, 'index', 0);
    this.lines = text.split(/\r\n|\r|\n/);
  }
  readLine() {
    if (this.index >= this.lines.length) return null;
    return this.lines[this.index++];
  }
  readValue() {
    let line = this.readLine();
    let colon = line.indexOf(':');
    if (colon == -1) throw new Error('Invalid line: ' + line);
    return line.substring(colon + 1).trim();
  }
  readTuple(tuple) {
    let line = this.readLine();
    let colon = line.indexOf(':');
    if (colon == -1) throw new Error('Invalid line: ' + line);
    let i = 0,
      lastMatch = colon + 1;
    for (; i < 3; i++) {
      let comma = line.indexOf(',', lastMatch);
      if (comma == -1) break;
      tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
      lastMatch = comma + 1;
    }
    tuple[i] = line.substring(lastMatch).trim();
    return i + 1;
  }
}
class TextureAtlasPage {
  constructor() {
    __publicField(this, 'name');
    __publicField(this, 'minFilter');
    __publicField(this, 'magFilter');
    __publicField(this, 'uWrap');
    __publicField(this, 'vWrap');
    __publicField(this, 'texture');
    __publicField(this, 'width');
    __publicField(this, 'height');
  }
  setTexture(texture) {
    this.texture = texture;
    texture.setFilters(this.minFilter, this.magFilter);
    texture.setWraps(this.uWrap, this.vWrap);
    this.width = this.texture.getImage().width;
    this.height = this.texture.getImage().height;
  }
}
class TextureAtlasRegion extends TextureRegion {
  constructor() {
    super(...arguments);
    __publicField(this, 'page');
    __publicField(this, 'name');
    __publicField(this, 'x');
    __publicField(this, 'y');
    __publicField(this, 'index');
    __publicField(this, 'rotate');
    __publicField(this, 'texture');
  }
}
class AssetManager {
  constructor(textureLoader, pathPrefix = '') {
    __publicField(this, 'pathPrefix');
    __publicField(this, 'textureLoader');
    __publicField(this, 'assets', {});
    __publicField(this, 'errors', {});
    __publicField(this, 'toLoad', 0);
    __publicField(this, 'loaded', 0);
    this.textureLoader = textureLoader;
    this.pathPrefix = pathPrefix;
  }
  static downloadText(url, success, error) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = () => {
      if (request.status == 200) {
        success(request.responseText);
      } else {
        error(request.status, request.responseText);
      }
    };
    request.onerror = () => {
      error(request.status, request.responseText);
    };
    request.send();
  }
  static downloadBinary(url, success, error) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      if (request.status == 200) {
        success(new Uint8Array(request.response));
      } else {
        error(request.status, request.responseText);
      }
    };
    request.onerror = () => {
      error(request.status, request.responseText);
    };
    request.send();
  }
  loadText(path2, success = null, error = null) {
    path2 = this.pathPrefix + path2;
    this.toLoad++;
    AssetManager.downloadText(
      path2,
      data => {
        this.assets[path2] = data;
        if (success) success(path2, data);
        this.toLoad--;
        this.loaded++;
      },
      (state, responseText) => {
        this.errors[path2] = `Couldn't load text ${path2}: status ${status}, ${responseText}`;
        if (error) error(path2, `Couldn't load text ${path2}: status ${status}, ${responseText}`);
        this.toLoad--;
        this.loaded++;
      },
    );
  }
  loadTexture(path2, success = null, error = null) {
    path2 = this.pathPrefix + path2;
    this.toLoad++;
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = ev => {
      let texture = this.textureLoader(img);
      this.assets[path2] = texture;
      this.toLoad--;
      this.loaded++;
      if (success) success(path2, img);
    };
    img.onerror = ev => {
      this.errors[path2] = `Couldn't load image ${path2}`;
      this.toLoad--;
      this.loaded++;
      if (error) error(path2, `Couldn't load image ${path2}`);
    };
    img.src = path2;
  }
  loadTextureData(path2, data, success = null, error = null) {
    path2 = this.pathPrefix + path2;
    this.toLoad++;
    let img = new Image();
    img.onload = ev => {
      let texture = this.textureLoader(img);
      this.assets[path2] = texture;
      this.toLoad--;
      this.loaded++;
      if (success) success(path2, img);
    };
    img.onerror = ev => {
      this.errors[path2] = `Couldn't load image ${path2}`;
      this.toLoad--;
      this.loaded++;
      if (error) error(path2, `Couldn't load image ${path2}`);
    };
    img.src = data;
  }
  loadTextureAtlas(path2, success = null, error = null) {
    let parent = path2.lastIndexOf('/') >= 0 ? path2.substring(0, path2.lastIndexOf('/')) : '';
    path2 = this.pathPrefix + path2;
    this.toLoad++;
    AssetManager.downloadText(
      path2,
      atlasData => {
        var pagesLoaded = { count: 0 };
        var atlasPages = new Array();
        try {
          let atlas = new TextureAtlas(atlasData, path22 => {
            atlasPages.push(parent + '/' + path22);
            let image = document.createElement('img');
            image.width = 16;
            image.height = 16;
            return new FakeTexture(image);
          });
        } catch (e) {
          let ex = e;
          this.errors[path2] = `Couldn't load texture atlas ${path2}: ${ex.message}`;
          if (error) error(path2, `Couldn't load texture atlas ${path2}: ${ex.message}`);
          this.toLoad--;
          this.loaded++;
          return;
        }
        for (let atlasPage of atlasPages) {
          let pageLoadError = false;
          this.loadTexture(
            atlasPage,
            (imagePath, image) => {
              pagesLoaded.count++;
              if (pagesLoaded.count == atlasPages.length) {
                if (!pageLoadError) {
                  try {
                    let atlas = new TextureAtlas(atlasData, path22 => {
                      return this.get(parent + '/' + path22);
                    });
                    this.assets[path2] = atlas;
                    if (success) success(path2, atlas);
                    this.toLoad--;
                    this.loaded++;
                  } catch (e) {
                    let ex = e;
                    this.errors[path2] = `Couldn't load texture atlas ${path2}: ${ex.message}`;
                    if (error) error(path2, `Couldn't load texture atlas ${path2}: ${ex.message}`);
                    this.toLoad--;
                    this.loaded++;
                  }
                } else {
                  this.errors[path2] = `Couldn't load texture atlas page ${imagePath}} of atlas ${path2}`;
                  if (error) error(path2, `Couldn't load texture atlas page ${imagePath} of atlas ${path2}`);
                  this.toLoad--;
                  this.loaded++;
                }
              }
            },
            (imagePath, errorMessage) => {
              pageLoadError = true;
              pagesLoaded.count++;
              if (pagesLoaded.count == atlasPages.length) {
                this.errors[path2] = `Couldn't load texture atlas page ${imagePath}} of atlas ${path2}`;
                if (error) error(path2, `Couldn't load texture atlas page ${imagePath} of atlas ${path2}`);
                this.toLoad--;
                this.loaded++;
              }
            },
          );
        }
      },
      (state, responseText) => {
        this.errors[path2] = `Couldn't load texture atlas ${path2}: status ${status}, ${responseText}`;
        if (error) error(path2, `Couldn't load texture atlas ${path2}: status ${status}, ${responseText}`);
        this.toLoad--;
        this.loaded++;
      },
    );
  }
  get(path2) {
    path2 = this.pathPrefix + path2;
    return this.assets[path2];
  }
  remove(path2) {
    path2 = this.pathPrefix + path2;
    let asset = this.assets[path2];
    if (asset.dispose) asset.dispose();
    this.assets[path2] = null;
  }
  removeAll() {
    for (let key in this.assets) {
      let asset = this.assets[key];
      if (asset.dispose) asset.dispose();
    }
    this.assets = {};
  }
  isLoadingComplete() {
    return this.toLoad == 0;
  }
  getToLoad() {
    return this.toLoad;
  }
  getLoaded() {
    return this.loaded;
  }
  dispose() {
    this.removeAll();
  }
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
  getErrors() {
    return this.errors;
  }
}
class Event {
  constructor(time, data) {
    __publicField(this, 'data');
    __publicField(this, 'intValue');
    __publicField(this, 'floatValue');
    __publicField(this, 'stringValue');
    __publicField(this, 'time');
    if (data == null) throw new Error('data cannot be null.');
    this.time = time;
    this.data = data;
  }
}
class EventData {
  constructor(name) {
    __publicField(this, 'name');
    __publicField(this, 'intValue');
    __publicField(this, 'floatValue');
    __publicField(this, 'stringValue');
    this.name = name;
  }
}
class IkConstraint {
  constructor(data, skeleton) {
    __publicField(this, 'data');
    __publicField(this, 'bones');
    __publicField(this, 'target');
    __publicField(this, 'mix', 1);
    __publicField(this, 'bendDirection', 0);
    if (data == null) throw new Error('data cannot be null.');
    if (skeleton == null) throw new Error('skeleton cannot be null.');
    this.data = data;
    this.mix = data.mix;
    this.bendDirection = data.bendDirection;
    this.bones = new Array();
    for (let i = 0; i < data.bones.length; i++) this.bones.push(skeleton.findBone(data.bones[i].name));
    this.target = skeleton.findBone(data.target.name);
  }
  getOrder() {
    return this.data.order;
  }
  apply() {
    this.update();
  }
  update() {
    let target = this.target;
    let bones = this.bones;
    switch (bones.length) {
      case 1:
        this.apply1(bones[0], target.worldX, target.worldY, this.mix);
        break;
      case 2:
        this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.mix);
        break;
    }
  }
  /** Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world
   * coordinate system. */
  apply1(bone, targetX, targetY, alpha) {
    if (!bone.appliedValid) bone.updateAppliedTransform();
    let p = bone.parent;
    let id = 1 / (p.a * p.d - p.b * p.c);
    let x = targetX - p.worldX,
      y = targetY - p.worldY;
    let tx = (x * p.d - y * p.b) * id - bone.ax,
      ty = (y * p.a - x * p.c) * id - bone.ay;
    let rotationIK = Math.atan2(ty, tx) * MathUtils.radDeg - bone.ashearX - bone.arotation;
    if (bone.ascaleX < 0) rotationIK += 180;
    if (rotationIK > 180) rotationIK -= 360;
    else if (rotationIK < -180) rotationIK += 360;
    bone.updateWorldTransformWith(
      bone.ax,
      bone.ay,
      bone.arotation + rotationIK * alpha,
      bone.ascaleX,
      bone.ascaleY,
      bone.ashearX,
      bone.ashearY,
    );
  }
  /** Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The
   * target is specified in the world coordinate system.
   * @param child A direct descendant of the parent bone. */
  apply2(parent, child, targetX, targetY, bendDir, alpha) {
    if (alpha == 0) {
      child.updateWorldTransform();
      return;
    }
    if (!parent.appliedValid) parent.updateAppliedTransform();
    if (!child.appliedValid) child.updateAppliedTransform();
    let px = parent.ax,
      py = parent.ay,
      psx = parent.ascaleX,
      psy = parent.ascaleY,
      csx = child.ascaleX;
    let os1 = 0,
      os2 = 0,
      s2 = 0;
    if (psx < 0) {
      psx = -psx;
      os1 = 180;
      s2 = -1;
    } else {
      os1 = 0;
      s2 = 1;
    }
    if (psy < 0) {
      psy = -psy;
      s2 = -s2;
    }
    if (csx < 0) {
      csx = -csx;
      os2 = 180;
    } else os2 = 0;
    let cx = child.ax,
      cy = 0,
      cwx = 0,
      cwy = 0,
      a = parent.a,
      b = parent.b,
      c = parent.c,
      d = parent.d;
    let u = Math.abs(psx - psy) <= 1e-4;
    if (!u) {
      cy = 0;
      cwx = a * cx + parent.worldX;
      cwy = c * cx + parent.worldY;
    } else {
      cy = child.ay;
      cwx = a * cx + b * cy + parent.worldX;
      cwy = c * cx + d * cy + parent.worldY;
    }
    let pp = parent.parent;
    a = pp.a;
    b = pp.b;
    c = pp.c;
    d = pp.d;
    let id = 1 / (a * d - b * c),
      x = targetX - pp.worldX,
      y = targetY - pp.worldY;
    let tx = (x * d - y * b) * id - px,
      ty = (y * a - x * c) * id - py;
    x = cwx - pp.worldX;
    y = cwy - pp.worldY;
    let dx = (x * d - y * b) * id - px,
      dy = (y * a - x * c) * id - py;
    let l1 = Math.sqrt(dx * dx + dy * dy),
      l2 = child.data.length * csx,
      a1 = 0,
      a2 = 0;
    outer: if (u) {
      l2 *= psx;
      let cos = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
      if (cos < -1) cos = -1;
      else if (cos > 1) cos = 1;
      a2 = Math.acos(cos) * bendDir;
      a = l1 + l2 * cos;
      b = l2 * Math.sin(a2);
      a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
    } else {
      a = psx * l2;
      b = psy * l2;
      let aa = a * a,
        bb = b * b,
        dd = tx * tx + ty * ty,
        ta = Math.atan2(ty, tx);
      c = bb * l1 * l1 + aa * dd - aa * bb;
      let c1 = -2 * bb * l1,
        c2 = bb - aa;
      d = c1 * c1 - 4 * c2 * c;
      if (d >= 0) {
        let q = Math.sqrt(d);
        if (c1 < 0) q = -q;
        q = -(c1 + q) / 2;
        let r0 = q / c2,
          r1 = c / q;
        let r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
        if (r * r <= dd) {
          y = Math.sqrt(dd - r * r) * bendDir;
          a1 = ta - Math.atan2(y, r);
          a2 = Math.atan2(y / psy, (r - l1) / psx);
          break outer;
        }
      }
      let minAngle = MathUtils.PI,
        minX = l1 - a,
        minDist = minX * minX,
        minY = 0;
      let maxAngle = 0,
        maxX = l1 + a,
        maxDist = maxX * maxX,
        maxY = 0;
      c = (-a * l1) / (aa - bb);
      if (c >= -1 && c <= 1) {
        c = Math.acos(c);
        x = a * Math.cos(c) + l1;
        y = b * Math.sin(c);
        d = x * x + y * y;
        if (d < minDist) {
          minAngle = c;
          minDist = d;
          minX = x;
          minY = y;
        }
        if (d > maxDist) {
          maxAngle = c;
          maxDist = d;
          maxX = x;
          maxY = y;
        }
      }
      if (dd <= (minDist + maxDist) / 2) {
        a1 = ta - Math.atan2(minY * bendDir, minX);
        a2 = minAngle * bendDir;
      } else {
        a1 = ta - Math.atan2(maxY * bendDir, maxX);
        a2 = maxAngle * bendDir;
      }
    }
    let os = Math.atan2(cy, cx) * s2;
    let rotation = parent.arotation;
    a1 = (a1 - os) * MathUtils.radDeg + os1 - rotation;
    if (a1 > 180) a1 -= 360;
    else if (a1 < -180) a1 += 360;
    parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, parent.ascaleX, parent.ascaleY, 0, 0);
    rotation = child.arotation;
    a2 = ((a2 + os) * MathUtils.radDeg - child.ashearX) * s2 + os2 - rotation;
    if (a2 > 180) a2 -= 360;
    else if (a2 < -180) a2 += 360;
    child.updateWorldTransformWith(
      cx,
      cy,
      rotation + a2 * alpha,
      child.ascaleX,
      child.ascaleY,
      child.ashearX,
      child.ashearY,
    );
  }
}
class IkConstraintData {
  constructor(name) {
    __publicField(this, 'name');
    __publicField(this, 'order', 0);
    __publicField(this, 'bones', new Array());
    __publicField(this, 'target');
    __publicField(this, 'bendDirection', 1);
    __publicField(this, 'mix', 1);
    this.name = name;
  }
}
class PathConstraintData {
  constructor(name) {
    __publicField(this, 'name');
    __publicField(this, 'order', 0);
    __publicField(this, 'bones', new Array());
    __publicField(this, 'target');
    __publicField(this, 'positionMode');
    __publicField(this, 'spacingMode');
    __publicField(this, 'rotateMode');
    __publicField(this, 'offsetRotation');
    __publicField(this, 'position');
    __publicField(this, 'spacing');
    __publicField(this, 'rotateMix');
    __publicField(this, 'translateMix');
    this.name = name;
  }
}
var PositionMode = /* @__PURE__ */ (PositionMode2 => {
  PositionMode2[(PositionMode2['Fixed'] = 0)] = 'Fixed';
  PositionMode2[(PositionMode2['Percent'] = 1)] = 'Percent';
  return PositionMode2;
})(PositionMode || {});
var SpacingMode = /* @__PURE__ */ (SpacingMode2 => {
  SpacingMode2[(SpacingMode2['Length'] = 0)] = 'Length';
  SpacingMode2[(SpacingMode2['Fixed'] = 1)] = 'Fixed';
  SpacingMode2[(SpacingMode2['Percent'] = 2)] = 'Percent';
  return SpacingMode2;
})(SpacingMode || {});
var RotateMode = /* @__PURE__ */ (RotateMode2 => {
  RotateMode2[(RotateMode2['Tangent'] = 0)] = 'Tangent';
  RotateMode2[(RotateMode2['Chain'] = 1)] = 'Chain';
  RotateMode2[(RotateMode2['ChainScale'] = 2)] = 'ChainScale';
  return RotateMode2;
})(RotateMode || {});
const _PathConstraint = class _PathConstraint {
  constructor(data, skeleton) {
    __publicField(this, 'data');
    __publicField(this, 'bones');
    __publicField(this, 'target');
    __publicField(this, 'position', 0);
    __publicField(this, 'spacing', 0);
    __publicField(this, 'rotateMix', 0);
    __publicField(this, 'translateMix', 0);
    __publicField(this, 'spaces', new Array());
    __publicField(this, 'positions', new Array());
    __publicField(this, 'world', new Array());
    __publicField(this, 'curves', new Array());
    __publicField(this, 'lengths', new Array());
    __publicField(this, 'segments', new Array());
    if (data == null) throw new Error('data cannot be null.');
    if (skeleton == null) throw new Error('skeleton cannot be null.');
    this.data = data;
    this.bones = new Array();
    for (let i = 0, n = data.bones.length; i < n; i++) this.bones.push(skeleton.findBone(data.bones[i].name));
    this.target = skeleton.findSlot(data.target.name);
    this.position = data.position;
    this.spacing = data.spacing;
    this.rotateMix = data.rotateMix;
    this.translateMix = data.translateMix;
  }
  apply() {
    this.update();
  }
  update() {
    let attachment = this.target.getAttachment();
    if (!(attachment instanceof PathAttachment)) return;
    let rotateMix = this.rotateMix,
      translateMix = this.translateMix;
    let translate = translateMix > 0,
      rotate = rotateMix > 0;
    if (!translate && !rotate) return;
    let data = this.data;
    let spacingMode = data.spacingMode;
    let lengthSpacing = spacingMode == SpacingMode.Length;
    let rotateMode = data.rotateMode;
    let tangents = rotateMode == RotateMode.Tangent,
      scale = rotateMode == RotateMode.ChainScale;
    let boneCount = this.bones.length,
      spacesCount = tangents ? boneCount : boneCount + 1;
    let bones = this.bones;
    let spaces = Utils.setArraySize(this.spaces, spacesCount),
      lengths = null;
    let spacing = this.spacing;
    if (scale || lengthSpacing) {
      if (scale) lengths = Utils.setArraySize(this.lengths, boneCount);
      for (let i = 0, n = spacesCount - 1; i < n; ) {
        let bone = bones[i];
        let setupLength = bone.data.length;
        if (setupLength < _PathConstraint.epsilon) {
          if (scale) lengths[i] = 0;
          spaces[++i] = 0;
        } else {
          let x = setupLength * bone.a,
            y = setupLength * bone.c;
          let length = Math.sqrt(x * x + y * y);
          if (scale) lengths[i] = length;
          spaces[++i] = ((lengthSpacing ? setupLength + spacing : spacing) * length) / setupLength;
        }
      }
    } else {
      for (let i = 1; i < spacesCount; i++) spaces[i] = spacing;
    }
    let positions = this.computeWorldPositions(
      attachment,
      spacesCount,
      tangents,
      data.positionMode == PositionMode.Percent,
      spacingMode == SpacingMode.Percent,
    );
    let boneX = positions[0],
      boneY = positions[1],
      offsetRotation = data.offsetRotation;
    let tip = false;
    if (offsetRotation == 0) tip = rotateMode == RotateMode.Chain;
    else {
      tip = false;
      let p = this.target.bone;
      offsetRotation *= p.a * p.d - p.b * p.c > 0 ? MathUtils.degRad : -MathUtils.degRad;
    }
    for (let i = 0, p = 3; i < boneCount; i++, p += 3) {
      let bone = bones[i];
      bone.worldX += (boneX - bone.worldX) * translateMix;
      bone.worldY += (boneY - bone.worldY) * translateMix;
      let x = positions[p],
        y = positions[p + 1],
        dx = x - boneX,
        dy = y - boneY;
      if (scale) {
        let length = lengths[i];
        if (length != 0) {
          let s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * rotateMix + 1;
          bone.a *= s;
          bone.c *= s;
        }
      }
      boneX = x;
      boneY = y;
      if (rotate) {
        let a = bone.a,
          b = bone.b,
          c = bone.c,
          d = bone.d,
          r = 0,
          cos = 0,
          sin = 0;
        if (tangents) r = positions[p - 1];
        else if (spaces[i + 1] == 0) r = positions[p + 2];
        else r = Math.atan2(dy, dx);
        r -= Math.atan2(c, a);
        if (tip) {
          cos = Math.cos(r);
          sin = Math.sin(r);
          let length = bone.data.length;
          boneX += (length * (cos * a - sin * c) - dx) * rotateMix;
          boneY += (length * (sin * a + cos * c) - dy) * rotateMix;
        } else {
          r += offsetRotation;
        }
        if (r > MathUtils.PI) r -= MathUtils.PI2;
        else if (r < -MathUtils.PI) r += MathUtils.PI2;
        r *= rotateMix;
        cos = Math.cos(r);
        sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * d;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * d;
      }
      bone.appliedValid = false;
    }
  }
  computeWorldPositions(path2, spacesCount, tangents, percentPosition, percentSpacing) {
    let target = this.target;
    let position = this.position;
    let spaces = this.spaces,
      out = Utils.setArraySize(this.positions, spacesCount * 3 + 2),
      world = null;
    let closed = path2.closed;
    let verticesLength = path2.worldVerticesLength,
      curveCount = verticesLength / 6,
      prevCurve = _PathConstraint.NONE;
    if (!path2.constantSpeed) {
      let lengths = path2.lengths;
      curveCount -= closed ? 1 : 2;
      let pathLength2 = lengths[curveCount];
      if (percentPosition) position *= pathLength2;
      if (percentSpacing) {
        for (let i = 0; i < spacesCount; i++) spaces[i] *= pathLength2;
      }
      world = Utils.setArraySize(this.world, 8);
      for (let i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
        let space = spaces[i];
        position += space;
        let p = position;
        if (closed) {
          p %= pathLength2;
          if (p < 0) p += pathLength2;
          curve = 0;
        } else if (p < 0) {
          if (prevCurve != _PathConstraint.BEFORE) {
            prevCurve = _PathConstraint.BEFORE;
            path2.computeWorldVertices(target, 2, 4, world, 0, 2);
          }
          this.addBeforePosition(p, world, 0, out, o);
          continue;
        } else if (p > pathLength2) {
          if (prevCurve != _PathConstraint.AFTER) {
            prevCurve = _PathConstraint.AFTER;
            path2.computeWorldVertices(target, verticesLength - 6, 4, world, 0, 2);
          }
          this.addAfterPosition(p - pathLength2, world, 0, out, o);
          continue;
        }
        for (; ; curve++) {
          let length = lengths[curve];
          if (p > length) continue;
          if (curve == 0) p /= length;
          else {
            let prev = lengths[curve - 1];
            p = (p - prev) / (length - prev);
          }
          break;
        }
        if (curve != prevCurve) {
          prevCurve = curve;
          if (closed && curve == curveCount) {
            path2.computeWorldVertices(target, verticesLength - 4, 4, world, 0, 2);
            path2.computeWorldVertices(target, 0, 4, world, 4, 2);
          } else path2.computeWorldVertices(target, curve * 6 + 2, 8, world, 0, 2);
        }
        this.addCurvePosition(
          p,
          world[0],
          world[1],
          world[2],
          world[3],
          world[4],
          world[5],
          world[6],
          world[7],
          out,
          o,
          tangents || (i > 0 && space == 0),
        );
      }
      return out;
    }
    if (closed) {
      verticesLength += 2;
      world = Utils.setArraySize(this.world, verticesLength);
      path2.computeWorldVertices(target, 2, verticesLength - 4, world, 0, 2);
      path2.computeWorldVertices(target, 0, 2, world, verticesLength - 4, 2);
      world[verticesLength - 2] = world[0];
      world[verticesLength - 1] = world[1];
    } else {
      curveCount--;
      verticesLength -= 4;
      world = Utils.setArraySize(this.world, verticesLength);
      path2.computeWorldVertices(target, 2, verticesLength, world, 0, 2);
    }
    let curves = Utils.setArraySize(this.curves, curveCount);
    let pathLength = 0;
    let x1 = world[0],
      y1 = world[1],
      cx1 = 0,
      cy1 = 0,
      cx2 = 0,
      cy2 = 0,
      x2 = 0,
      y2 = 0;
    let tmpx = 0,
      tmpy = 0,
      dddfx = 0,
      dddfy = 0,
      ddfx = 0,
      ddfy = 0,
      dfx = 0,
      dfy = 0;
    for (let i = 0, w = 2; i < curveCount; i++, w += 6) {
      cx1 = world[w];
      cy1 = world[w + 1];
      cx2 = world[w + 2];
      cy2 = world[w + 3];
      x2 = world[w + 4];
      y2 = world[w + 5];
      tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
      tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
      dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
      dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
      ddfx = tmpx * 2 + dddfx;
      ddfy = tmpy * 2 + dddfy;
      dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
      dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      dfx += ddfx;
      dfy += ddfy;
      ddfx += dddfx;
      ddfy += dddfy;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      dfx += ddfx;
      dfy += ddfy;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      dfx += ddfx + dddfx;
      dfy += ddfy + dddfy;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      curves[i] = pathLength;
      x1 = x2;
      y1 = y2;
    }
    if (percentPosition) position *= pathLength;
    if (percentSpacing) {
      for (let i = 0; i < spacesCount; i++) spaces[i] *= pathLength;
    }
    let segments = this.segments;
    let curveLength = 0;
    for (let i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
      let space = spaces[i];
      position += space;
      let p = position;
      if (closed) {
        p %= pathLength;
        if (p < 0) p += pathLength;
        curve = 0;
      } else if (p < 0) {
        this.addBeforePosition(p, world, 0, out, o);
        continue;
      } else if (p > pathLength) {
        this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
        continue;
      }
      for (; ; curve++) {
        let length = curves[curve];
        if (p > length) continue;
        if (curve == 0) p /= length;
        else {
          let prev = curves[curve - 1];
          p = (p - prev) / (length - prev);
        }
        break;
      }
      if (curve != prevCurve) {
        prevCurve = curve;
        let ii = curve * 6;
        x1 = world[ii];
        y1 = world[ii + 1];
        cx1 = world[ii + 2];
        cy1 = world[ii + 3];
        cx2 = world[ii + 4];
        cy2 = world[ii + 5];
        x2 = world[ii + 6];
        y2 = world[ii + 7];
        tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
        tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
        dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 6e-3;
        dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 6e-3;
        ddfx = tmpx * 2 + dddfx;
        ddfy = tmpy * 2 + dddfy;
        dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
        dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
        curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
        segments[0] = curveLength;
        for (ii = 1; ii < 8; ii++) {
          dfx += ddfx;
          dfy += ddfy;
          ddfx += dddfx;
          ddfy += dddfy;
          curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
          segments[ii] = curveLength;
        }
        dfx += ddfx;
        dfy += ddfy;
        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
        segments[8] = curveLength;
        dfx += ddfx + dddfx;
        dfy += ddfy + dddfy;
        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
        segments[9] = curveLength;
        segment = 0;
      }
      p *= curveLength;
      for (; ; segment++) {
        let length = segments[segment];
        if (p > length) continue;
        if (segment == 0) p /= length;
        else {
          let prev = segments[segment - 1];
          p = segment + (p - prev) / (length - prev);
        }
        break;
      }
      this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
    }
    return out;
  }
  addBeforePosition(p, temp, i, out, o) {
    let x1 = temp[i],
      y1 = temp[i + 1],
      dx = temp[i + 2] - x1,
      dy = temp[i + 3] - y1,
      r = Math.atan2(dy, dx);
    out[o] = x1 + p * Math.cos(r);
    out[o + 1] = y1 + p * Math.sin(r);
    out[o + 2] = r;
  }
  addAfterPosition(p, temp, i, out, o) {
    let x1 = temp[i + 2],
      y1 = temp[i + 3],
      dx = x1 - temp[i],
      dy = y1 - temp[i + 1],
      r = Math.atan2(dy, dx);
    out[o] = x1 + p * Math.cos(r);
    out[o + 1] = y1 + p * Math.sin(r);
    out[o + 2] = r;
  }
  addCurvePosition(p, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents) {
    if (p == 0 || isNaN(p)) p = 1e-4;
    let tt = p * p,
      ttt = tt * p,
      u = 1 - p,
      uu = u * u,
      uuu = uu * u;
    let ut = u * p,
      ut3 = ut * 3,
      uut3 = u * ut3,
      utt3 = ut3 * p;
    let x = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt,
      y = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
    out[o] = x;
    out[o + 1] = y;
    if (tangents)
      out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
  }
  getOrder() {
    return this.data.order;
  }
};
__publicField(_PathConstraint, 'NONE', -1);
__publicField(_PathConstraint, 'BEFORE', -2);
__publicField(_PathConstraint, 'AFTER', -3);
__publicField(_PathConstraint, 'epsilon', 1e-5);
let PathConstraint = _PathConstraint;
class Slot {
  constructor(data, bone) {
    __publicField(this, 'data');
    __publicField(this, 'bone');
    __publicField(this, 'color');
    __publicField(this, 'darkColor');
    __publicField(this, 'attachment');
    __publicField(this, 'attachmentTime');
    __publicField(this, 'attachmentVertices', new Array());
    if (data == null) throw new Error('data cannot be null.');
    if (bone == null) throw new Error('bone cannot be null.');
    this.data = data;
    this.bone = bone;
    this.color = new Color();
    this.darkColor = data.darkColor == null ? null : new Color();
    this.setToSetupPose();
  }
  /** @return May be null. */
  getAttachment() {
    return this.attachment;
  }
  /** Sets the attachment and if it changed, resets {@link #getAttachmentTime()} and clears {@link #getAttachmentVertices()}.
   * @param attachment May be null. */
  setAttachment(attachment) {
    if (this.attachment == attachment) return;
    this.attachment = attachment;
    this.attachmentTime = this.bone.skeleton.time;
    this.attachmentVertices.length = 0;
  }
  setAttachmentTime(time) {
    this.attachmentTime = this.bone.skeleton.time - time;
  }
  /** Returns the time since the attachment was set. */
  getAttachmentTime() {
    return this.bone.skeleton.time - this.attachmentTime;
  }
  setToSetupPose() {
    this.color.setFromColor(this.data.color);
    if (this.darkColor != null) this.darkColor.setFromColor(this.data.darkColor);
    if (this.data.attachmentName == null) this.attachment = null;
    else {
      this.attachment = null;
      this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
    }
  }
}
class TransformConstraint {
  constructor(data, skeleton) {
    __publicField(this, 'data');
    __publicField(this, 'bones');
    __publicField(this, 'target');
    __publicField(this, 'rotateMix', 0);
    __publicField(this, 'translateMix', 0);
    __publicField(this, 'scaleMix', 0);
    __publicField(this, 'shearMix', 0);
    __publicField(this, 'temp', new Vector2());
    if (data == null) throw new Error('data cannot be null.');
    if (skeleton == null) throw new Error('skeleton cannot be null.');
    this.data = data;
    this.rotateMix = data.rotateMix;
    this.translateMix = data.translateMix;
    this.scaleMix = data.scaleMix;
    this.shearMix = data.shearMix;
    this.bones = new Array();
    for (let i = 0; i < data.bones.length; i++) this.bones.push(skeleton.findBone(data.bones[i].name));
    this.target = skeleton.findBone(data.target.name);
  }
  apply() {
    this.update();
  }
  update() {
    if (this.data.local) {
      if (this.data.relative) this.applyRelativeLocal();
      else this.applyAbsoluteLocal();
    } else {
      if (this.data.relative) this.applyRelativeWorld();
      else this.applyAbsoluteWorld();
    }
  }
  applyAbsoluteWorld() {
    let rotateMix = this.rotateMix,
      translateMix = this.translateMix,
      scaleMix = this.scaleMix,
      shearMix = this.shearMix;
    let target = this.target;
    let ta = target.a,
      tb = target.b,
      tc = target.c,
      td = target.d;
    let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
    let offsetRotation = this.data.offsetRotation * degRadReflect;
    let offsetShearY = this.data.offsetShearY * degRadReflect;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      let modified = false;
      if (rotateMix != 0) {
        let a = bone.a,
          b = bone.b,
          c = bone.c,
          d = bone.d;
        let r = Math.atan2(tc, ta) - Math.atan2(c, a) + offsetRotation;
        if (r > MathUtils.PI) r -= MathUtils.PI2;
        else if (r < -MathUtils.PI) r += MathUtils.PI2;
        r *= rotateMix;
        let cos = Math.cos(r),
          sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * d;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * d;
        modified = true;
      }
      if (translateMix != 0) {
        let temp = this.temp;
        target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
        bone.worldX += (temp.x - bone.worldX) * translateMix;
        bone.worldY += (temp.y - bone.worldY) * translateMix;
        modified = true;
      }
      if (scaleMix > 0) {
        let s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
        let ts = Math.sqrt(ta * ta + tc * tc);
        if (s > 1e-5) s = (s + (ts - s + this.data.offsetScaleX) * scaleMix) / s;
        bone.a *= s;
        bone.c *= s;
        s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
        ts = Math.sqrt(tb * tb + td * td);
        if (s > 1e-5) s = (s + (ts - s + this.data.offsetScaleY) * scaleMix) / s;
        bone.b *= s;
        bone.d *= s;
        modified = true;
      }
      if (shearMix > 0) {
        let b = bone.b,
          d = bone.d;
        let by = Math.atan2(d, b);
        let r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
        if (r > MathUtils.PI) r -= MathUtils.PI2;
        else if (r < -MathUtils.PI) r += MathUtils.PI2;
        r = by + (r + offsetShearY) * shearMix;
        let s = Math.sqrt(b * b + d * d);
        bone.b = Math.cos(r) * s;
        bone.d = Math.sin(r) * s;
        modified = true;
      }
      if (modified) bone.appliedValid = false;
    }
  }
  applyRelativeWorld() {
    let rotateMix = this.rotateMix,
      translateMix = this.translateMix,
      scaleMix = this.scaleMix,
      shearMix = this.shearMix;
    let target = this.target;
    let ta = target.a,
      tb = target.b,
      tc = target.c,
      td = target.d;
    let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
    let offsetRotation = this.data.offsetRotation * degRadReflect,
      offsetShearY = this.data.offsetShearY * degRadReflect;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      let modified = false;
      if (rotateMix != 0) {
        let a = bone.a,
          b = bone.b,
          c = bone.c,
          d = bone.d;
        let r = Math.atan2(tc, ta) + offsetRotation;
        if (r > MathUtils.PI) r -= MathUtils.PI2;
        else if (r < -MathUtils.PI) r += MathUtils.PI2;
        r *= rotateMix;
        let cos = Math.cos(r),
          sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * d;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * d;
        modified = true;
      }
      if (translateMix != 0) {
        let temp = this.temp;
        target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
        bone.worldX += temp.x * translateMix;
        bone.worldY += temp.y * translateMix;
        modified = true;
      }
      if (scaleMix > 0) {
        let s = (Math.sqrt(ta * ta + tc * tc) - 1 + this.data.offsetScaleX) * scaleMix + 1;
        bone.a *= s;
        bone.c *= s;
        s = (Math.sqrt(tb * tb + td * td) - 1 + this.data.offsetScaleY) * scaleMix + 1;
        bone.b *= s;
        bone.d *= s;
        modified = true;
      }
      if (shearMix > 0) {
        let r = Math.atan2(td, tb) - Math.atan2(tc, ta);
        if (r > MathUtils.PI) r -= MathUtils.PI2;
        else if (r < -MathUtils.PI) r += MathUtils.PI2;
        let b = bone.b,
          d = bone.d;
        r = Math.atan2(d, b) + (r - MathUtils.PI / 2 + offsetShearY) * shearMix;
        let s = Math.sqrt(b * b + d * d);
        bone.b = Math.cos(r) * s;
        bone.d = Math.sin(r) * s;
        modified = true;
      }
      if (modified) bone.appliedValid = false;
    }
  }
  applyAbsoluteLocal() {
    let rotateMix = this.rotateMix,
      translateMix = this.translateMix,
      scaleMix = this.scaleMix,
      shearMix = this.shearMix;
    let target = this.target;
    if (!target.appliedValid) target.updateAppliedTransform();
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (!bone.appliedValid) bone.updateAppliedTransform();
      let rotation = bone.arotation;
      if (rotateMix != 0) {
        let r = target.arotation - rotation + this.data.offsetRotation;
        r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
        rotation += r * rotateMix;
      }
      let x = bone.ax,
        y = bone.ay;
      if (translateMix != 0) {
        x += (target.ax - x + this.data.offsetX) * translateMix;
        y += (target.ay - y + this.data.offsetY) * translateMix;
      }
      let scaleX = bone.ascaleX,
        scaleY = bone.ascaleY;
      if (scaleMix > 0) {
        if (scaleX > 1e-5) scaleX = (scaleX + (target.ascaleX - scaleX + this.data.offsetScaleX) * scaleMix) / scaleX;
        if (scaleY > 1e-5) scaleY = (scaleY + (target.ascaleY - scaleY + this.data.offsetScaleY) * scaleMix) / scaleY;
      }
      let shearY = bone.ashearY;
      if (shearMix > 0) {
        let r = target.ashearY - shearY + this.data.offsetShearY;
        r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
        bone.shearY += r * shearMix;
      }
      bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
    }
  }
  applyRelativeLocal() {
    let rotateMix = this.rotateMix,
      translateMix = this.translateMix,
      scaleMix = this.scaleMix,
      shearMix = this.shearMix;
    let target = this.target;
    if (!target.appliedValid) target.updateAppliedTransform();
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (!bone.appliedValid) bone.updateAppliedTransform();
      let rotation = bone.arotation;
      if (rotateMix != 0) rotation += (target.arotation + this.data.offsetRotation) * rotateMix;
      let x = bone.ax,
        y = bone.ay;
      if (translateMix != 0) {
        x += (target.ax + this.data.offsetX) * translateMix;
        y += (target.ay + this.data.offsetY) * translateMix;
      }
      let scaleX = bone.ascaleX,
        scaleY = bone.ascaleY;
      if (scaleMix > 0) {
        if (scaleX > 1e-5) scaleX *= (target.ascaleX - 1 + this.data.offsetScaleX) * scaleMix + 1;
        if (scaleY > 1e-5) scaleY *= (target.ascaleY - 1 + this.data.offsetScaleY) * scaleMix + 1;
      }
      let shearY = bone.ashearY;
      if (shearMix > 0) shearY += (target.ashearY + this.data.offsetShearY) * shearMix;
      bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
    }
  }
  getOrder() {
    return this.data.order;
  }
}
class Skeleton {
  constructor(data) {
    __publicField(this, 'data');
    __publicField(this, 'bones');
    __publicField(this, 'slots');
    __publicField(this, 'drawOrder');
    __publicField(this, 'ikConstraints');
    __publicField(this, 'transformConstraints');
    __publicField(this, 'pathConstraints');
    __publicField(this, '_updateCache', new Array());
    __publicField(this, 'updateCacheReset', new Array());
    __publicField(this, 'skin');
    __publicField(this, 'color');
    __publicField(this, 'time', 0);
    __publicField(this, 'flipX', false);
    __publicField(this, 'flipY', false);
    __publicField(this, 'x', 0);
    __publicField(this, 'y', 0);
    if (data == null) throw new Error('data cannot be null.');
    this.data = data;
    this.bones = new Array();
    for (let i = 0; i < data.bones.length; i++) {
      let boneData = data.bones[i];
      let bone;
      if (boneData.parent == null) bone = new Bone(boneData, this, null);
      else {
        let parent = this.bones[boneData.parent.index];
        bone = new Bone(boneData, this, parent);
        parent.children.push(bone);
      }
      this.bones.push(bone);
    }
    this.slots = new Array();
    this.drawOrder = new Array();
    for (let i = 0; i < data.slots.length; i++) {
      let slotData = data.slots[i];
      let bone = this.bones[slotData.boneData.index];
      let slot = new Slot(slotData, bone);
      this.slots.push(slot);
      this.drawOrder.push(slot);
    }
    this.ikConstraints = new Array();
    for (let i = 0; i < data.ikConstraints.length; i++) {
      let ikConstraintData = data.ikConstraints[i];
      this.ikConstraints.push(new IkConstraint(ikConstraintData, this));
    }
    this.transformConstraints = new Array();
    for (let i = 0; i < data.transformConstraints.length; i++) {
      let transformConstraintData = data.transformConstraints[i];
      this.transformConstraints.push(new TransformConstraint(transformConstraintData, this));
    }
    this.pathConstraints = new Array();
    for (let i = 0; i < data.pathConstraints.length; i++) {
      let pathConstraintData = data.pathConstraints[i];
      this.pathConstraints.push(new PathConstraint(pathConstraintData, this));
    }
    this.color = new Color(1, 1, 1, 1);
    this.updateCache();
  }
  updateCache() {
    let updateCache = this._updateCache;
    updateCache.length = 0;
    this.updateCacheReset.length = 0;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) bones[i].sorted = false;
    let ikConstraints = this.ikConstraints;
    let transformConstraints = this.transformConstraints;
    let pathConstraints = this.pathConstraints;
    let ikCount = ikConstraints.length,
      transformCount = transformConstraints.length,
      pathCount = pathConstraints.length;
    let constraintCount = ikCount + transformCount + pathCount;
    outer: for (let i = 0; i < constraintCount; i++) {
      for (let ii = 0; ii < ikCount; ii++) {
        let constraint = ikConstraints[ii];
        if (constraint.data.order == i) {
          this.sortIkConstraint(constraint);
          continue outer;
        }
      }
      for (let ii = 0; ii < transformCount; ii++) {
        let constraint = transformConstraints[ii];
        if (constraint.data.order == i) {
          this.sortTransformConstraint(constraint);
          continue outer;
        }
      }
      for (let ii = 0; ii < pathCount; ii++) {
        let constraint = pathConstraints[ii];
        if (constraint.data.order == i) {
          this.sortPathConstraint(constraint);
          continue outer;
        }
      }
    }
    for (let i = 0, n = bones.length; i < n; i++) this.sortBone(bones[i]);
  }
  sortIkConstraint(constraint) {
    let target = constraint.target;
    this.sortBone(target);
    let constrained = constraint.bones;
    let parent = constrained[0];
    this.sortBone(parent);
    if (constrained.length > 1) {
      let child = constrained[constrained.length - 1];
      if (!(this._updateCache.indexOf(child) > -1)) this.updateCacheReset.push(child);
    }
    this._updateCache.push(constraint);
    this.sortReset(parent.children);
    constrained[constrained.length - 1].sorted = true;
  }
  sortPathConstraint(constraint) {
    let slot = constraint.target;
    let slotIndex = slot.data.index;
    let slotBone = slot.bone;
    if (this.skin != null) this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
    if (this.data.defaultSkin != null && this.data.defaultSkin != this.skin)
      this.sortPathConstraintAttachment(this.data.defaultSkin, slotIndex, slotBone);
    for (let i = 0, n = this.data.skins.length; i < n; i++)
      this.sortPathConstraintAttachment(this.data.skins[i], slotIndex, slotBone);
    let attachment = slot.getAttachment();
    if (attachment instanceof PathAttachment) this.sortPathConstraintAttachmentWith(attachment, slotBone);
    let constrained = constraint.bones;
    let boneCount = constrained.length;
    for (let i = 0; i < boneCount; i++) this.sortBone(constrained[i]);
    this._updateCache.push(constraint);
    for (let i = 0; i < boneCount; i++) this.sortReset(constrained[i].children);
    for (let i = 0; i < boneCount; i++) constrained[i].sorted = true;
  }
  sortTransformConstraint(constraint) {
    this.sortBone(constraint.target);
    let constrained = constraint.bones;
    let boneCount = constrained.length;
    if (constraint.data.local) {
      for (let i = 0; i < boneCount; i++) {
        let child = constrained[i];
        this.sortBone(child.parent);
        if (!(this._updateCache.indexOf(child) > -1)) this.updateCacheReset.push(child);
      }
    } else {
      for (let i = 0; i < boneCount; i++) {
        this.sortBone(constrained[i]);
      }
    }
    this._updateCache.push(constraint);
    for (let ii = 0; ii < boneCount; ii++) this.sortReset(constrained[ii].children);
    for (let ii = 0; ii < boneCount; ii++) constrained[ii].sorted = true;
  }
  sortPathConstraintAttachment(skin, slotIndex, slotBone) {
    let attachments = skin.attachments[slotIndex];
    if (!attachments) return;
    for (let key in attachments) {
      this.sortPathConstraintAttachmentWith(attachments[key], slotBone);
    }
  }
  sortPathConstraintAttachmentWith(attachment, slotBone) {
    if (!(attachment instanceof PathAttachment)) return;
    let pathBones = attachment.bones;
    if (pathBones == null) this.sortBone(slotBone);
    else {
      let bones = this.bones;
      let i = 0;
      while (i < pathBones.length) {
        let boneCount = pathBones[i++];
        for (let n = i + boneCount; i < n; i++) {
          let boneIndex = pathBones[i];
          this.sortBone(bones[boneIndex]);
        }
      }
    }
  }
  sortBone(bone) {
    if (bone.sorted) return;
    let parent = bone.parent;
    if (parent != null) this.sortBone(parent);
    bone.sorted = true;
    this._updateCache.push(bone);
  }
  sortReset(bones) {
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (bone.sorted) this.sortReset(bone.children);
      bone.sorted = false;
    }
  }
  /** Updates the world transform for each bone and applies constraints. */
  updateWorldTransform() {
    let updateCacheReset = this.updateCacheReset;
    for (let i = 0, n = updateCacheReset.length; i < n; i++) {
      let bone = updateCacheReset[i];
      bone.ax = bone.x;
      bone.ay = bone.y;
      bone.arotation = bone.rotation;
      bone.ascaleX = bone.scaleX;
      bone.ascaleY = bone.scaleY;
      bone.ashearX = bone.shearX;
      bone.ashearY = bone.shearY;
      bone.appliedValid = true;
    }
    let updateCache = this._updateCache;
    for (let i = 0, n = updateCache.length; i < n; i++) updateCache[i].update();
  }
  /** Sets the bones, constraints, and slots to their setup pose values. */
  setToSetupPose() {
    this.setBonesToSetupPose();
    this.setSlotsToSetupPose();
  }
  /** Sets the bones and constraints to their setup pose values. */
  setBonesToSetupPose() {
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) bones[i].setToSetupPose();
    let ikConstraints = this.ikConstraints;
    for (let i = 0, n = ikConstraints.length; i < n; i++) {
      let constraint = ikConstraints[i];
      constraint.bendDirection = constraint.data.bendDirection;
      constraint.mix = constraint.data.mix;
    }
    let transformConstraints = this.transformConstraints;
    for (let i = 0, n = transformConstraints.length; i < n; i++) {
      let constraint = transformConstraints[i];
      let data = constraint.data;
      constraint.rotateMix = data.rotateMix;
      constraint.translateMix = data.translateMix;
      constraint.scaleMix = data.scaleMix;
      constraint.shearMix = data.shearMix;
    }
    let pathConstraints = this.pathConstraints;
    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      let constraint = pathConstraints[i];
      let data = constraint.data;
      constraint.position = data.position;
      constraint.spacing = data.spacing;
      constraint.rotateMix = data.rotateMix;
      constraint.translateMix = data.translateMix;
    }
  }
  setSlotsToSetupPose() {
    let slots = this.slots;
    Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
    for (let i = 0, n = slots.length; i < n; i++) slots[i].setToSetupPose();
  }
  /** @return May return null. */
  getRootBone() {
    if (this.bones.length == 0) return null;
    return this.bones[0];
  }
  /** @return May be null. */
  findBone(boneName) {
    if (boneName == null) throw new Error('boneName cannot be null.');
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (bone.data.name == boneName) return bone;
    }
    return null;
  }
  /** @return -1 if the bone was not found. */
  findBoneIndex(boneName) {
    if (boneName == null) throw new Error('boneName cannot be null.');
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) if (bones[i].data.name == boneName) return i;
    return -1;
  }
  /** @return May be null. */
  findSlot(slotName) {
    if (slotName == null) throw new Error('slotName cannot be null.');
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) {
      let slot = slots[i];
      if (slot.data.name == slotName) return slot;
    }
    return null;
  }
  /** @return -1 if the bone was not found. */
  findSlotIndex(slotName) {
    if (slotName == null) throw new Error('slotName cannot be null.');
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) if (slots[i].data.name == slotName) return i;
    return -1;
  }
  /** Sets a skin by name.
   * @see #setSkin(Skin) */
  setSkinByName(skinName) {
    let skin = this.data.findSkin(skinName);
    if (skin == null) throw new Error('Skin not found: ' + skinName);
    this.setSkin(skin);
  }
  /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}.
   * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
   * old skin, each slot's setup mode attachment is attached from the new skin.
   * @param newSkin May be null. */
  setSkin(newSkin) {
    if (newSkin != null) {
      if (this.skin != null) newSkin.attachAll(this, this.skin);
      else {
        let slots = this.slots;
        for (let i = 0, n = slots.length; i < n; i++) {
          let slot = slots[i];
          let name = slot.data.attachmentName;
          if (name != null) {
            let attachment = newSkin.getAttachment(i, name);
            if (attachment != null) slot.setAttachment(attachment);
          }
        }
      }
    }
    this.skin = newSkin;
  }
  /** @return May be null. */
  getAttachmentByName(slotName, attachmentName) {
    return this.getAttachment(this.data.findSlotIndex(slotName), attachmentName);
  }
  /** @return May be null. */
  getAttachment(slotIndex, attachmentName) {
    if (attachmentName == null) throw new Error('attachmentName cannot be null.');
    if (this.skin != null) {
      let attachment = this.skin.getAttachment(slotIndex, attachmentName);
      if (attachment != null) return attachment;
    }
    if (this.data.defaultSkin != null) return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
    return null;
  }
  /** @param attachmentName May be null. */
  setAttachment(slotName, attachmentName) {
    if (slotName == null) throw new Error('slotName cannot be null.');
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) {
      let slot = slots[i];
      if (slot.data.name == slotName) {
        let attachment = null;
        if (attachmentName != null) {
          attachment = this.getAttachment(i, attachmentName);
          if (attachment == null)
            throw new Error('Attachment not found: ' + attachmentName + ', for slot: ' + slotName);
        }
        slot.setAttachment(attachment);
        return;
      }
    }
    throw new Error('Slot not found: ' + slotName);
  }
  /** @return May be null. */
  findIkConstraint(constraintName) {
    if (constraintName == null) throw new Error('constraintName cannot be null.');
    let ikConstraints = this.ikConstraints;
    for (let i = 0, n = ikConstraints.length; i < n; i++) {
      let ikConstraint = ikConstraints[i];
      if (ikConstraint.data.name == constraintName) return ikConstraint;
    }
    return null;
  }
  /** @return May be null. */
  findTransformConstraint(constraintName) {
    if (constraintName == null) throw new Error('constraintName cannot be null.');
    let transformConstraints = this.transformConstraints;
    for (let i = 0, n = transformConstraints.length; i < n; i++) {
      let constraint = transformConstraints[i];
      if (constraint.data.name == constraintName) return constraint;
    }
    return null;
  }
  /** @return May be null. */
  findPathConstraint(constraintName) {
    if (constraintName == null) throw new Error('constraintName cannot be null.');
    let pathConstraints = this.pathConstraints;
    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      let constraint = pathConstraints[i];
      if (constraint.data.name == constraintName) return constraint;
    }
    return null;
  }
  /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
   * @param offset The distance from the skeleton origin to the bottom left corner of the AABB.
   * @param size The width and height of the AABB.
   * @param temp Working memory */
  getBounds(offset, size, temp) {
    if (offset == null) throw new Error('offset cannot be null.');
    if (size == null) throw new Error('size cannot be null.');
    let drawOrder = this.drawOrder;
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY;
    for (let i = 0, n = drawOrder.length; i < n; i++) {
      let slot = drawOrder[i];
      let verticesLength = 0;
      let vertices = null;
      let attachment = slot.getAttachment();
      if (attachment instanceof RegionAttachment) {
        verticesLength = 8;
        vertices = Utils.setArraySize(temp, verticesLength, 0);
        attachment.computeWorldVertices(slot.bone, vertices, 0, 2);
      } else if (attachment instanceof MeshAttachment) {
        let mesh = attachment;
        verticesLength = mesh.worldVerticesLength;
        vertices = Utils.setArraySize(temp, verticesLength, 0);
        mesh.computeWorldVertices(slot, 0, verticesLength, vertices, 0, 2);
      }
      if (vertices != null) {
        for (let ii = 0, nn = vertices.length; ii < nn; ii += 2) {
          let x = vertices[ii],
            y = vertices[ii + 1];
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    offset.set(minX, minY);
    size.set(maxX - minX, maxY - minY);
  }
  update(delta) {
    this.time += delta;
  }
}
class SkeletonBounds {
  constructor() {
    __publicField(this, 'minX', 0);
    __publicField(this, 'minY', 0);
    __publicField(this, 'maxX', 0);
    __publicField(this, 'maxY', 0);
    __publicField(this, 'boundingBoxes', new Array());
    __publicField(this, 'polygons', new Array());
    __publicField(
      this,
      'polygonPool',
      new Pool(() => {
        return Utils.newFloatArray(16);
      }),
    );
  }
  update(skeleton, updateAabb) {
    if (skeleton == null) throw new Error('skeleton cannot be null.');
    let boundingBoxes = this.boundingBoxes;
    let polygons = this.polygons;
    let polygonPool = this.polygonPool;
    let slots = skeleton.slots;
    let slotCount = slots.length;
    boundingBoxes.length = 0;
    polygonPool.freeAll(polygons);
    polygons.length = 0;
    for (let i = 0; i < slotCount; i++) {
      let slot = slots[i];
      let attachment = slot.getAttachment();
      if (attachment instanceof BoundingBoxAttachment) {
        let boundingBox = attachment;
        boundingBoxes.push(boundingBox);
        let polygon = polygonPool.obtain();
        if (polygon.length != boundingBox.worldVerticesLength) {
          polygon = Utils.newFloatArray(boundingBox.worldVerticesLength);
        }
        polygons.push(polygon);
        boundingBox.computeWorldVertices(slot, 0, boundingBox.worldVerticesLength, polygon, 0, 2);
      }
    }
    if (updateAabb) {
      this.aabbCompute();
    } else {
      this.minX = Number.POSITIVE_INFINITY;
      this.minY = Number.POSITIVE_INFINITY;
      this.maxX = Number.NEGATIVE_INFINITY;
      this.maxY = Number.NEGATIVE_INFINITY;
    }
  }
  aabbCompute() {
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY;
    let polygons = this.polygons;
    for (let i = 0, n = polygons.length; i < n; i++) {
      let polygon = polygons[i];
      let vertices = polygon;
      for (let ii = 0, nn = polygon.length; ii < nn; ii += 2) {
        let x = vertices[ii];
        let y = vertices[ii + 1];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }
  /** Returns true if the axis aligned bounding box contains the point. */
  aabbContainsPoint(x, y) {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
  }
  /** Returns true if the axis aligned bounding box intersects the line segment. */
  aabbIntersectsSegment(x1, y1, x2, y2) {
    let minX = this.minX;
    let minY = this.minY;
    let maxX = this.maxX;
    let maxY = this.maxY;
    if (
      (x1 <= minX && x2 <= minX) ||
      (y1 <= minY && y2 <= minY) ||
      (x1 >= maxX && x2 >= maxX) ||
      (y1 >= maxY && y2 >= maxY)
    )
      return false;
    let m = (y2 - y1) / (x2 - x1);
    let y = m * (minX - x1) + y1;
    if (y > minY && y < maxY) return true;
    y = m * (maxX - x1) + y1;
    if (y > minY && y < maxY) return true;
    let x = (minY - y1) / m + x1;
    if (x > minX && x < maxX) return true;
    x = (maxY - y1) / m + x1;
    if (x > minX && x < maxX) return true;
    return false;
  }
  /** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */
  aabbIntersectsSkeleton(bounds) {
    return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
  }
  /** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more
   * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */
  containsPoint(x, y) {
    let polygons = this.polygons;
    for (let i = 0, n = polygons.length; i < n; i++)
      if (this.containsPointPolygon(polygons[i], x, y)) return this.boundingBoxes[i];
    return null;
  }
  /** Returns true if the polygon contains the point. */
  containsPointPolygon(polygon, x, y) {
    let vertices = polygon;
    let nn = polygon.length;
    let prevIndex = nn - 2;
    let inside = false;
    for (let ii = 0; ii < nn; ii += 2) {
      let vertexY = vertices[ii + 1];
      let prevY = vertices[prevIndex + 1];
      if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
        let vertexX = vertices[ii];
        if (vertexX + ((y - vertexY) / (prevY - vertexY)) * (vertices[prevIndex] - vertexX) < x) inside = !inside;
      }
      prevIndex = ii;
    }
    return inside;
  }
  /** Returns the first bounding box attachment that contains any part of the line segment, or null. When doing many checks, it
   * is usually more efficient to only call this method if {@link #aabbIntersectsSegment(float, float, float, float)} returns
   * true. */
  intersectsSegment(x1, y1, x2, y2) {
    let polygons = this.polygons;
    for (let i = 0, n = polygons.length; i < n; i++)
      if (this.intersectsSegmentPolygon(polygons[i], x1, y1, x2, y2)) return this.boundingBoxes[i];
    return null;
  }
  /** Returns true if the polygon contains any part of the line segment. */
  intersectsSegmentPolygon(polygon, x1, y1, x2, y2) {
    let vertices = polygon;
    let nn = polygon.length;
    let width12 = x1 - x2,
      height12 = y1 - y2;
    let det1 = x1 * y2 - y1 * x2;
    let x3 = vertices[nn - 2],
      y3 = vertices[nn - 1];
    for (let ii = 0; ii < nn; ii += 2) {
      let x4 = vertices[ii],
        y4 = vertices[ii + 1];
      let det2 = x3 * y4 - y3 * x4;
      let width34 = x3 - x4,
        height34 = y3 - y4;
      let det3 = width12 * height34 - height12 * width34;
      let x = (det1 * width34 - width12 * det2) / det3;
      if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
        let y = (det1 * height34 - height12 * det2) / det3;
        if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1)))
          return true;
      }
      x3 = x4;
      y3 = y4;
    }
    return false;
  }
  /** Returns the polygon for the specified bounding box, or null. */
  getPolygon(boundingBox) {
    if (boundingBox == null) throw new Error('boundingBox cannot be null.');
    let index = this.boundingBoxes.indexOf(boundingBox);
    return index == -1 ? null : this.polygons[index];
  }
  getWidth() {
    return this.maxX - this.minX;
  }
  getHeight() {
    return this.maxY - this.minY;
  }
}
class Triangulator {
  constructor() {
    __publicField(this, 'convexPolygons', new Array());
    __publicField(this, 'convexPolygonsIndices', new Array());
    __publicField(this, 'indicesArray', new Array());
    __publicField(this, 'isConcaveArray', new Array());
    __publicField(this, 'triangles', new Array());
    __publicField(
      this,
      'polygonPool',
      new Pool(() => {
        return new Array();
      }),
    );
    __publicField(
      this,
      'polygonIndicesPool',
      new Pool(() => {
        return new Array();
      }),
    );
  }
  triangulate(verticesArray) {
    let vertices = verticesArray;
    let vertexCount = verticesArray.length >> 1;
    let indices = this.indicesArray;
    indices.length = 0;
    for (let i = 0; i < vertexCount; i++) indices[i] = i;
    let isConcave = this.isConcaveArray;
    isConcave.length = 0;
    for (let i = 0, n = vertexCount; i < n; ++i)
      isConcave[i] = Triangulator.isConcave(i, vertexCount, vertices, indices);
    let triangles = this.triangles;
    triangles.length = 0;
    while (vertexCount > 3) {
      let previous = vertexCount - 1,
        i = 0,
        next = 1;
      while (true) {
        outer: if (!isConcave[i]) {
          let p1 = indices[previous] << 1,
            p2 = indices[i] << 1,
            p3 = indices[next] << 1;
          let p1x = vertices[p1],
            p1y = vertices[p1 + 1];
          let p2x = vertices[p2],
            p2y = vertices[p2 + 1];
          let p3x = vertices[p3],
            p3y = vertices[p3 + 1];
          for (let ii = (next + 1) % vertexCount; ii != previous; ii = (ii + 1) % vertexCount) {
            if (!isConcave[ii]) continue;
            let v = indices[ii] << 1;
            let vx = vertices[v],
              vy = vertices[v + 1];
            if (Triangulator.positiveArea(p3x, p3y, p1x, p1y, vx, vy)) {
              if (Triangulator.positiveArea(p1x, p1y, p2x, p2y, vx, vy)) {
                if (Triangulator.positiveArea(p2x, p2y, p3x, p3y, vx, vy)) break outer;
              }
            }
          }
          break;
        }
        if (next == 0) {
          do {
            if (!isConcave[i]) break;
            i--;
          } while (i > 0);
          break;
        }
        previous = i;
        i = next;
        next = (next + 1) % vertexCount;
      }
      triangles.push(indices[(vertexCount + i - 1) % vertexCount]);
      triangles.push(indices[i]);
      triangles.push(indices[(i + 1) % vertexCount]);
      indices.splice(i, 1);
      isConcave.splice(i, 1);
      vertexCount--;
      let previousIndex = (vertexCount + i - 1) % vertexCount;
      let nextIndex = i == vertexCount ? 0 : i;
      isConcave[previousIndex] = Triangulator.isConcave(previousIndex, vertexCount, vertices, indices);
      isConcave[nextIndex] = Triangulator.isConcave(nextIndex, vertexCount, vertices, indices);
    }
    if (vertexCount == 3) {
      triangles.push(indices[2]);
      triangles.push(indices[0]);
      triangles.push(indices[1]);
    }
    return triangles;
  }
  decompose(verticesArray, triangles) {
    let vertices = verticesArray;
    let convexPolygons = this.convexPolygons;
    this.polygonPool.freeAll(convexPolygons);
    convexPolygons.length = 0;
    let convexPolygonsIndices = this.convexPolygonsIndices;
    this.polygonIndicesPool.freeAll(convexPolygonsIndices);
    convexPolygonsIndices.length = 0;
    let polygonIndices = this.polygonIndicesPool.obtain();
    polygonIndices.length = 0;
    let polygon = this.polygonPool.obtain();
    polygon.length = 0;
    let fanBaseIndex = -1,
      lastWinding = 0;
    for (let i = 0, n = triangles.length; i < n; i += 3) {
      let t1 = triangles[i] << 1,
        t2 = triangles[i + 1] << 1,
        t3 = triangles[i + 2] << 1;
      let x1 = vertices[t1],
        y1 = vertices[t1 + 1];
      let x2 = vertices[t2],
        y2 = vertices[t2 + 1];
      let x3 = vertices[t3],
        y3 = vertices[t3 + 1];
      let merged = false;
      if (fanBaseIndex == t1) {
        let o = polygon.length - 4;
        let winding1 = Triangulator.winding(polygon[o], polygon[o + 1], polygon[o + 2], polygon[o + 3], x3, y3);
        let winding2 = Triangulator.winding(x3, y3, polygon[0], polygon[1], polygon[2], polygon[3]);
        if (winding1 == lastWinding && winding2 == lastWinding) {
          polygon.push(x3);
          polygon.push(y3);
          polygonIndices.push(t3);
          merged = true;
        }
      }
      if (!merged) {
        if (polygon.length > 0) {
          convexPolygons.push(polygon);
          convexPolygonsIndices.push(polygonIndices);
        } else {
          this.polygonPool.free(polygon);
          this.polygonIndicesPool.free(polygonIndices);
        }
        polygon = this.polygonPool.obtain();
        polygon.length = 0;
        polygon.push(x1);
        polygon.push(y1);
        polygon.push(x2);
        polygon.push(y2);
        polygon.push(x3);
        polygon.push(y3);
        polygonIndices = this.polygonIndicesPool.obtain();
        polygonIndices.length = 0;
        polygonIndices.push(t1);
        polygonIndices.push(t2);
        polygonIndices.push(t3);
        lastWinding = Triangulator.winding(x1, y1, x2, y2, x3, y3);
        fanBaseIndex = t1;
      }
    }
    if (polygon.length > 0) {
      convexPolygons.push(polygon);
      convexPolygonsIndices.push(polygonIndices);
    }
    for (let i = 0, n = convexPolygons.length; i < n; i++) {
      polygonIndices = convexPolygonsIndices[i];
      if (polygonIndices.length == 0) continue;
      let firstIndex = polygonIndices[0];
      let lastIndex = polygonIndices[polygonIndices.length - 1];
      polygon = convexPolygons[i];
      let o = polygon.length - 4;
      let prevPrevX = polygon[o],
        prevPrevY = polygon[o + 1];
      let prevX = polygon[o + 2],
        prevY = polygon[o + 3];
      let firstX = polygon[0],
        firstY = polygon[1];
      let secondX = polygon[2],
        secondY = polygon[3];
      let winding = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, firstX, firstY);
      for (let ii = 0; ii < n; ii++) {
        if (ii == i) continue;
        let otherIndices = convexPolygonsIndices[ii];
        if (otherIndices.length != 3) continue;
        let otherFirstIndex = otherIndices[0];
        let otherSecondIndex = otherIndices[1];
        let otherLastIndex = otherIndices[2];
        let otherPoly = convexPolygons[ii];
        let x3 = otherPoly[otherPoly.length - 2],
          y3 = otherPoly[otherPoly.length - 1];
        if (otherFirstIndex != firstIndex || otherSecondIndex != lastIndex) continue;
        let winding1 = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, x3, y3);
        let winding2 = Triangulator.winding(x3, y3, firstX, firstY, secondX, secondY);
        if (winding1 == winding && winding2 == winding) {
          otherPoly.length = 0;
          otherIndices.length = 0;
          polygon.push(x3);
          polygon.push(y3);
          polygonIndices.push(otherLastIndex);
          prevPrevX = prevX;
          prevPrevY = prevY;
          prevX = x3;
          prevY = y3;
          ii = 0;
        }
      }
    }
    for (let i = convexPolygons.length - 1; i >= 0; i--) {
      polygon = convexPolygons[i];
      if (polygon.length == 0) {
        convexPolygons.splice(i, 1);
        this.polygonPool.free(polygon);
        polygonIndices = convexPolygonsIndices[i];
        convexPolygonsIndices.splice(i, 1);
        this.polygonIndicesPool.free(polygonIndices);
      }
    }
    return convexPolygons;
  }
  static isConcave(index, vertexCount, vertices, indices) {
    let previous = indices[(vertexCount + index - 1) % vertexCount] << 1;
    let current = indices[index] << 1;
    let next = indices[(index + 1) % vertexCount] << 1;
    return !this.positiveArea(
      vertices[previous],
      vertices[previous + 1],
      vertices[current],
      vertices[current + 1],
      vertices[next],
      vertices[next + 1],
    );
  }
  static positiveArea(p1x, p1y, p2x, p2y, p3x, p3y) {
    return p1x * (p3y - p2y) + p2x * (p1y - p3y) + p3x * (p2y - p1y) >= 0;
  }
  static winding(p1x, p1y, p2x, p2y, p3x, p3y) {
    let px = p2x - p1x,
      py = p2y - p1y;
    return p3x * py - p3y * px + px * p1y - p1x * py >= 0 ? 1 : -1;
  }
}
class SkeletonClipping {
  constructor() {
    __publicField(this, 'triangulator', new Triangulator());
    __publicField(this, 'clippingPolygon', new Array());
    __publicField(this, 'clipOutput', new Array());
    __publicField(this, 'clippedVertices', new Array());
    __publicField(this, 'clippedUVs', new Array());
    __publicField(this, 'clippedTriangles', new Array());
    __publicField(this, 'scratch', new Array());
    __publicField(this, 'clipAttachment');
    __publicField(this, 'clippingPolygons');
  }
  clipStart(slot, clip) {
    if (this.clipAttachment != null) return 0;
    this.clipAttachment = clip;
    let n = clip.worldVerticesLength;
    let vertices = Utils.setArraySize(this.clippingPolygon, n);
    clip.computeWorldVertices(slot, 0, n, vertices, 0, 2);
    let clippingPolygon = this.clippingPolygon;
    SkeletonClipping.makeClockwise(clippingPolygon);
    let clippingPolygons = (this.clippingPolygons = this.triangulator.decompose(
      clippingPolygon,
      this.triangulator.triangulate(clippingPolygon),
    ));
    for (let i = 0, n2 = clippingPolygons.length; i < n2; i++) {
      let polygon = clippingPolygons[i];
      SkeletonClipping.makeClockwise(polygon);
      polygon.push(polygon[0]);
      polygon.push(polygon[1]);
    }
    return clippingPolygons.length;
  }
  clipEndWithSlot(slot) {
    if (this.clipAttachment != null && this.clipAttachment.endSlot == slot.data) this.clipEnd();
  }
  clipEnd() {
    if (this.clipAttachment == null) return;
    this.clipAttachment = null;
    this.clippingPolygons = null;
    this.clippedVertices.length = 0;
    this.clippedTriangles.length = 0;
    this.clippingPolygon.length = 0;
  }
  isClipping() {
    return this.clipAttachment != null;
  }
  // 4.2 叫clipTrianglesRender
  clipTriangles(vertices, verticesLength, triangles, trianglesLength, uvs, light, dark, twoColor) {
    let clipOutput = this.clipOutput,
      clippedVertices = this.clippedVertices;
    let clippedTriangles = this.clippedTriangles;
    let polygons = this.clippingPolygons;
    let polygonsCount = this.clippingPolygons.length;
    let vertexSize = twoColor ? 12 : 8;
    let index = 0;
    clippedVertices.length = 0;
    clippedTriangles.length = 0;
    outer: for (let i = 0; i < trianglesLength; i += 3) {
      let vertexOffset = triangles[i] << 1;
      let x1 = vertices[vertexOffset],
        y1 = vertices[vertexOffset + 1];
      let u1 = uvs[vertexOffset],
        v1 = uvs[vertexOffset + 1];
      vertexOffset = triangles[i + 1] << 1;
      let x2 = vertices[vertexOffset],
        y2 = vertices[vertexOffset + 1];
      let u2 = uvs[vertexOffset],
        v2 = uvs[vertexOffset + 1];
      vertexOffset = triangles[i + 2] << 1;
      let x3 = vertices[vertexOffset],
        y3 = vertices[vertexOffset + 1];
      let u3 = uvs[vertexOffset],
        v3 = uvs[vertexOffset + 1];
      for (let p = 0; p < polygonsCount; p++) {
        let s = clippedVertices.length;
        if (this.clip(x1, y1, x2, y2, x3, y3, polygons[p], clipOutput)) {
          let clipOutputLength = clipOutput.length;
          if (clipOutputLength == 0) continue;
          let d0 = y2 - y3,
            d1 = x3 - x2,
            d2 = x1 - x3,
            d4 = y3 - y1;
          let d = 1 / (d0 * d2 + d1 * (y1 - y3));
          let clipOutputCount = clipOutputLength >> 1;
          let clipOutputItems = this.clipOutput;
          let clippedVerticesItems = Utils.setArraySize(clippedVertices, s + clipOutputCount * vertexSize);
          for (let ii = 0; ii < clipOutputLength; ii += 2) {
            let x = clipOutputItems[ii],
              y = clipOutputItems[ii + 1];
            clippedVerticesItems[s] = x;
            clippedVerticesItems[s + 1] = y;
            clippedVerticesItems[s + 2] = light.r;
            clippedVerticesItems[s + 3] = light.g;
            clippedVerticesItems[s + 4] = light.b;
            clippedVerticesItems[s + 5] = light.a;
            let c0 = x - x3,
              c1 = y - y3;
            let a = (d0 * c0 + d1 * c1) * d;
            let b = (d4 * c0 + d2 * c1) * d;
            let c = 1 - a - b;
            clippedVerticesItems[s + 6] = u1 * a + u2 * b + u3 * c;
            clippedVerticesItems[s + 7] = v1 * a + v2 * b + v3 * c;
            if (twoColor) {
              clippedVerticesItems[s + 8] = dark.r;
              clippedVerticesItems[s + 9] = dark.g;
              clippedVerticesItems[s + 10] = dark.b;
              clippedVerticesItems[s + 11] = dark.a;
            }
            s += vertexSize;
          }
          s = clippedTriangles.length;
          let clippedTrianglesItems = Utils.setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));
          clipOutputCount--;
          for (let ii = 1; ii < clipOutputCount; ii++) {
            clippedTrianglesItems[s] = index;
            clippedTrianglesItems[s + 1] = index + ii;
            clippedTrianglesItems[s + 2] = index + ii + 1;
            s += 3;
          }
          index += clipOutputCount + 1;
        } else {
          let clippedVerticesItems = Utils.setArraySize(clippedVertices, s + 3 * vertexSize);
          clippedVerticesItems[s] = x1;
          clippedVerticesItems[s + 1] = y1;
          clippedVerticesItems[s + 2] = light.r;
          clippedVerticesItems[s + 3] = light.g;
          clippedVerticesItems[s + 4] = light.b;
          clippedVerticesItems[s + 5] = light.a;
          if (!twoColor) {
            clippedVerticesItems[s + 6] = u1;
            clippedVerticesItems[s + 7] = v1;
            clippedVerticesItems[s + 8] = x2;
            clippedVerticesItems[s + 9] = y2;
            clippedVerticesItems[s + 10] = light.r;
            clippedVerticesItems[s + 11] = light.g;
            clippedVerticesItems[s + 12] = light.b;
            clippedVerticesItems[s + 13] = light.a;
            clippedVerticesItems[s + 14] = u2;
            clippedVerticesItems[s + 15] = v2;
            clippedVerticesItems[s + 16] = x3;
            clippedVerticesItems[s + 17] = y3;
            clippedVerticesItems[s + 18] = light.r;
            clippedVerticesItems[s + 19] = light.g;
            clippedVerticesItems[s + 20] = light.b;
            clippedVerticesItems[s + 21] = light.a;
            clippedVerticesItems[s + 22] = u3;
            clippedVerticesItems[s + 23] = v3;
          } else {
            clippedVerticesItems[s + 6] = u1;
            clippedVerticesItems[s + 7] = v1;
            clippedVerticesItems[s + 8] = dark.r;
            clippedVerticesItems[s + 9] = dark.g;
            clippedVerticesItems[s + 10] = dark.b;
            clippedVerticesItems[s + 11] = dark.a;
            clippedVerticesItems[s + 12] = x2;
            clippedVerticesItems[s + 13] = y2;
            clippedVerticesItems[s + 14] = light.r;
            clippedVerticesItems[s + 15] = light.g;
            clippedVerticesItems[s + 16] = light.b;
            clippedVerticesItems[s + 17] = light.a;
            clippedVerticesItems[s + 18] = u2;
            clippedVerticesItems[s + 19] = v2;
            clippedVerticesItems[s + 20] = dark.r;
            clippedVerticesItems[s + 21] = dark.g;
            clippedVerticesItems[s + 22] = dark.b;
            clippedVerticesItems[s + 23] = dark.a;
            clippedVerticesItems[s + 24] = x3;
            clippedVerticesItems[s + 25] = y3;
            clippedVerticesItems[s + 26] = light.r;
            clippedVerticesItems[s + 27] = light.g;
            clippedVerticesItems[s + 28] = light.b;
            clippedVerticesItems[s + 29] = light.a;
            clippedVerticesItems[s + 30] = u3;
            clippedVerticesItems[s + 31] = v3;
            clippedVerticesItems[s + 32] = dark.r;
            clippedVerticesItems[s + 33] = dark.g;
            clippedVerticesItems[s + 34] = dark.b;
            clippedVerticesItems[s + 35] = dark.a;
          }
          s = clippedTriangles.length;
          let clippedTrianglesItems = Utils.setArraySize(clippedTriangles, s + 3);
          clippedTrianglesItems[s] = index;
          clippedTrianglesItems[s + 1] = index + 1;
          clippedTrianglesItems[s + 2] = index + 2;
          index += 3;
          continue outer;
        }
      }
    }
  }
  // 唔知有咩用 但照copy左先
  clipTrianglesUnpacked(vertices, triangles, trianglesLength, uvs) {
    let clipOutput = this.clipOutput,
      clippedVertices = this.clippedVertices,
      clippedUVs = this.clippedUVs;
    let clippedTriangles = this.clippedTriangles;
    let polygons = this.clippingPolygons;
    let polygonsCount = polygons.length;
    let index = 0;
    clippedVertices.length = 0;
    clippedUVs.length = 0;
    clippedTriangles.length = 0;
    for (let i = 0; i < trianglesLength; i += 3) {
      let vertexOffset = triangles[i] << 1;
      let x1 = vertices[vertexOffset],
        y1 = vertices[vertexOffset + 1];
      let u1 = uvs[vertexOffset],
        v1 = uvs[vertexOffset + 1];
      vertexOffset = triangles[i + 1] << 1;
      let x2 = vertices[vertexOffset],
        y2 = vertices[vertexOffset + 1];
      let u2 = uvs[vertexOffset],
        v2 = uvs[vertexOffset + 1];
      vertexOffset = triangles[i + 2] << 1;
      let x3 = vertices[vertexOffset],
        y3 = vertices[vertexOffset + 1];
      let u3 = uvs[vertexOffset],
        v3 = uvs[vertexOffset + 1];
      for (let p = 0; p < polygonsCount; p++) {
        let s = clippedVertices.length;
        if (this.clip(x1, y1, x2, y2, x3, y3, polygons[p], clipOutput)) {
          let clipOutputLength = clipOutput.length;
          if (clipOutputLength == 0) continue;
          let d0 = y2 - y3,
            d1 = x3 - x2,
            d2 = x1 - x3,
            d4 = y3 - y1;
          let d = 1 / (d0 * d2 + d1 * (y1 - y3));
          let clipOutputCount = clipOutputLength >> 1;
          let clipOutputItems = this.clipOutput;
          let clippedVerticesItems = Utils.setArraySize(clippedVertices, s + clipOutputCount * 2);
          let clippedUVsItems = Utils.setArraySize(clippedUVs, s + clipOutputCount * 2);
          for (let ii = 0; ii < clipOutputLength; ii += 2, s += 2) {
            let x = clipOutputItems[ii],
              y = clipOutputItems[ii + 1];
            clippedVerticesItems[s] = x;
            clippedVerticesItems[s + 1] = y;
            let c0 = x - x3,
              c1 = y - y3;
            let a = (d0 * c0 + d1 * c1) * d;
            let b = (d4 * c0 + d2 * c1) * d;
            let c = 1 - a - b;
            clippedUVsItems[s] = u1 * a + u2 * b + u3 * c;
            clippedUVsItems[s + 1] = v1 * a + v2 * b + v3 * c;
          }
          s = clippedTriangles.length;
          let clippedTrianglesItems = Utils.setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));
          clipOutputCount--;
          for (let ii = 1; ii < clipOutputCount; ii++, s += 3) {
            clippedTrianglesItems[s] = index;
            clippedTrianglesItems[s + 1] = index + ii;
            clippedTrianglesItems[s + 2] = index + ii + 1;
          }
          index += clipOutputCount + 1;
        } else {
          let clippedVerticesItems = Utils.setArraySize(clippedVertices, s + 3 * 2);
          clippedVerticesItems[s] = x1;
          clippedVerticesItems[s + 1] = y1;
          clippedVerticesItems[s + 2] = x2;
          clippedVerticesItems[s + 3] = y2;
          clippedVerticesItems[s + 4] = x3;
          clippedVerticesItems[s + 5] = y3;
          let clippedUVSItems = Utils.setArraySize(clippedUVs, s + 3 * 2);
          clippedUVSItems[s] = u1;
          clippedUVSItems[s + 1] = v1;
          clippedUVSItems[s + 2] = u2;
          clippedUVSItems[s + 3] = v2;
          clippedUVSItems[s + 4] = u3;
          clippedUVSItems[s + 5] = v3;
          s = clippedTriangles.length;
          let clippedTrianglesItems = Utils.setArraySize(clippedTriangles, s + 3);
          clippedTrianglesItems[s] = index;
          clippedTrianglesItems[s + 1] = index + 1;
          clippedTrianglesItems[s + 2] = index + 2;
          index += 3;
          break;
        }
      }
    }
  }
  /** Clips the input triangle against the convex, clockwise clipping area. If the triangle lies entirely within the clipping
   * area, false is returned. The clipping area must duplicate the first vertex at the end of the vertices list. */
  clip(x1, y1, x2, y2, x3, y3, clippingArea, output) {
    let originalOutput = output;
    let clipped = false;
    let input = null;
    if (clippingArea.length % 4 >= 2) {
      input = output;
      output = this.scratch;
    } else input = this.scratch;
    input.length = 0;
    input.push(x1);
    input.push(y1);
    input.push(x2);
    input.push(y2);
    input.push(x3);
    input.push(y3);
    input.push(x1);
    input.push(y1);
    output.length = 0;
    let clippingVertices = clippingArea;
    let clippingVerticesLast = clippingArea.length - 4;
    for (let i = 0; ; i += 2) {
      let edgeX = clippingVertices[i],
        edgeY = clippingVertices[i + 1];
      let edgeX2 = clippingVertices[i + 2],
        edgeY2 = clippingVertices[i + 3];
      let deltaX = edgeX - edgeX2,
        deltaY = edgeY - edgeY2;
      let inputVertices = input;
      let inputVerticesLength = input.length - 2,
        outputStart = output.length;
      for (let ii = 0; ii < inputVerticesLength; ii += 2) {
        let inputX = inputVertices[ii],
          inputY = inputVertices[ii + 1];
        let inputX2 = inputVertices[ii + 2],
          inputY2 = inputVertices[ii + 3];
        let side2 = deltaX * (inputY2 - edgeY2) - deltaY * (inputX2 - edgeX2) > 0;
        if (deltaX * (inputY - edgeY2) - deltaY * (inputX - edgeX2) > 0) {
          if (side2) {
            output.push(inputX2);
            output.push(inputY2);
            continue;
          }
          let c0 = inputY2 - inputY,
            c2 = inputX2 - inputX;
          let s = c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY);
          if (Math.abs(s) > 1e-6) {
            let ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / s;
            output.push(edgeX + (edgeX2 - edgeX) * ua);
            output.push(edgeY + (edgeY2 - edgeY) * ua);
          } else {
            output.push(edgeX);
            output.push(edgeY);
          }
        } else if (side2) {
          let c0 = inputY2 - inputY,
            c2 = inputX2 - inputX;
          let s = c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY);
          if (Math.abs(s) > 1e-6) {
            let ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / s;
            output.push(edgeX + (edgeX2 - edgeX) * ua);
            output.push(edgeY + (edgeY2 - edgeY) * ua);
          } else {
            output.push(edgeX);
            output.push(edgeY);
          }
          output.push(inputX2);
          output.push(inputY2);
        }
        clipped = true;
      }
      if (outputStart == output.length) {
        originalOutput.length = 0;
        return true;
      }
      output.push(output[0]);
      output.push(output[1]);
      if (i == clippingVerticesLast) break;
      let temp = output;
      output = input;
      output.length = 0;
      input = temp;
    }
    if (originalOutput != output) {
      originalOutput.length = 0;
      for (let i = 0, n = output.length - 2; i < n; i++) originalOutput[i] = output[i];
    } else originalOutput.length = originalOutput.length - 2;
    return clipped;
  }
  static makeClockwise(polygon) {
    let vertices = polygon;
    let verticeslength = polygon.length;
    let area = vertices[verticeslength - 2] * vertices[1] - vertices[0] * vertices[verticeslength - 1],
      p1x = 0,
      p1y = 0,
      p2x = 0,
      p2y = 0;
    for (let i = 0, n = verticeslength - 3; i < n; i += 2) {
      p1x = vertices[i];
      p1y = vertices[i + 1];
      p2x = vertices[i + 2];
      p2y = vertices[i + 3];
      area += p1x * p2y - p2x * p1y;
    }
    if (area < 0) return;
    for (let i = 0, lastX = verticeslength - 2, n = verticeslength >> 1; i < n; i += 2) {
      let x = vertices[i],
        y = vertices[i + 1];
      let other = lastX - i;
      vertices[i] = vertices[other];
      vertices[i + 1] = vertices[other + 1];
      vertices[other] = x;
      vertices[other + 1] = y;
    }
  }
}
class SkeletonData {
  constructor() {
    __publicField(this, 'name');
    __publicField(this, 'bones', new Array());
    // Ordered parents first.
    __publicField(this, 'slots', new Array());
    // Setup pose draw order.
    __publicField(this, 'skins', new Array());
    __publicField(this, 'defaultSkin');
    __publicField(this, 'events', new Array());
    __publicField(this, 'animations', new Array());
    __publicField(this, 'ikConstraints', new Array());
    __publicField(this, 'transformConstraints', new Array());
    __publicField(this, 'pathConstraints', new Array());
    __publicField(this, 'width');
    __publicField(this, 'height');
    __publicField(this, 'version');
    __publicField(this, 'hash');
    // Nonessential
    __publicField(this, 'fps', 0);
    __publicField(this, 'imagesPath');
  }
  findBone(boneName) {
    if (boneName == null) throw new Error('boneName cannot be null.');
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (bone.name == boneName) return bone;
    }
    return null;
  }
  findBoneIndex(boneName) {
    if (boneName == null) throw new Error('boneName cannot be null.');
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) if (bones[i].name == boneName) return i;
    return -1;
  }
  findSlot(slotName) {
    if (slotName == null) throw new Error('slotName cannot be null.');
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) {
      let slot = slots[i];
      if (slot.name == slotName) return slot;
    }
    return null;
  }
  findSlotIndex(slotName) {
    if (slotName == null) throw new Error('slotName cannot be null.');
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) if (slots[i].name == slotName) return i;
    return -1;
  }
  findSkin(skinName) {
    if (skinName == null) throw new Error('skinName cannot be null.');
    let skins = this.skins;
    for (let i = 0, n = skins.length; i < n; i++) {
      let skin = skins[i];
      if (skin.name == skinName) return skin;
    }
    return null;
  }
  findEvent(eventDataName) {
    if (eventDataName == null) throw new Error('eventDataName cannot be null.');
    let events = this.events;
    for (let i = 0, n = events.length; i < n; i++) {
      let event = events[i];
      if (event.name == eventDataName) return event;
    }
    return null;
  }
  findAnimation(animationName) {
    if (animationName == null) throw new Error('animationName cannot be null.');
    let animations = this.animations;
    for (let i = 0, n = animations.length; i < n; i++) {
      let animation = animations[i];
      if (animation.name == animationName) return animation;
    }
    return null;
  }
  findIkConstraint(constraintName) {
    if (constraintName == null) throw new Error('constraintName cannot be null.');
    let ikConstraints = this.ikConstraints;
    for (let i = 0, n = ikConstraints.length; i < n; i++) {
      let constraint = ikConstraints[i];
      if (constraint.name == constraintName) return constraint;
    }
    return null;
  }
  findTransformConstraint(constraintName) {
    if (constraintName == null) throw new Error('constraintName cannot be null.');
    let transformConstraints = this.transformConstraints;
    for (let i = 0, n = transformConstraints.length; i < n; i++) {
      let constraint = transformConstraints[i];
      if (constraint.name == constraintName) return constraint;
    }
    return null;
  }
  findPathConstraint(constraintName) {
    if (constraintName == null) throw new Error('constraintName cannot be null.');
    let pathConstraints = this.pathConstraints;
    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      let constraint = pathConstraints[i];
      if (constraint.name == constraintName) return constraint;
    }
    return null;
  }
  findPathConstraintIndex(pathConstraintName) {
    if (pathConstraintName == null) throw new Error('pathConstraintName cannot be null.');
    let pathConstraints = this.pathConstraints;
    for (let i = 0, n = pathConstraints.length; i < n; i++) if (pathConstraints[i].name == pathConstraintName) return i;
    return -1;
  }
}
var BlendMode = /* @__PURE__ */ (BlendMode2 => {
  BlendMode2[(BlendMode2['Normal'] = 0)] = 'Normal';
  BlendMode2[(BlendMode2['Additive'] = 1)] = 'Additive';
  BlendMode2[(BlendMode2['Multiply'] = 2)] = 'Multiply';
  BlendMode2[(BlendMode2['Screen'] = 3)] = 'Screen';
  return BlendMode2;
})(BlendMode || {});
class Skin {
  constructor(name) {
    __publicField(this, 'name');
    __publicField(this, 'attachments', new Array());
    if (name == null) throw new Error('name cannot be null.');
    this.name = name;
  }
  addAttachment(slotIndex, name, attachment) {
    if (attachment == null) throw new Error('attachment cannot be null.');
    let attachments = this.attachments;
    if (slotIndex >= attachments.length) attachments.length = slotIndex + 1;
    if (!attachments[slotIndex]) attachments[slotIndex] = {};
    attachments[slotIndex][name] = attachment;
  }
  /** @return May be null. */
  getAttachment(slotIndex, name) {
    let dictionary = this.attachments[slotIndex];
    return dictionary ? dictionary[name] : null;
  }
  /** Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached. */
  attachAll(skeleton, oldSkin) {
    let slotIndex = 0;
    for (let i = 0; i < skeleton.slots.length; i++) {
      let slot = skeleton.slots[i];
      let slotAttachment = slot.getAttachment();
      if (slotAttachment && slotIndex < oldSkin.attachments.length) {
        let dictionary = oldSkin.attachments[slotIndex];
        for (let key in dictionary) {
          let skinAttachment = dictionary[key];
          if (slotAttachment == skinAttachment) {
            let attachment = this.getAttachment(slotIndex, key);
            if (attachment != null) slot.setAttachment(attachment);
            break;
          }
        }
      }
      slotIndex++;
    }
  }
}
class SlotData {
  constructor(index, name, boneData) {
    __publicField(this, 'index');
    __publicField(this, 'name');
    __publicField(this, 'boneData');
    __publicField(this, 'color', new Color(1, 1, 1, 1));
    __publicField(this, 'darkColor');
    __publicField(this, 'attachmentName');
    __publicField(this, 'blendMode');
    if (index < 0) throw new Error('index must be >= 0.');
    if (name == null) throw new Error('name cannot be null.');
    if (boneData == null) throw new Error('boneData cannot be null.');
    this.index = index;
    this.name = name;
    this.boneData = boneData;
  }
}
class TransformConstraintData {
  constructor(name) {
    __publicField(this, 'name');
    __publicField(this, 'order', 0);
    __publicField(this, 'bones', new Array());
    __publicField(this, 'target');
    __publicField(this, 'rotateMix', 0);
    __publicField(this, 'translateMix', 0);
    __publicField(this, 'scaleMix', 0);
    __publicField(this, 'shearMix', 0);
    __publicField(this, 'offsetRotation', 0);
    __publicField(this, 'offsetX', 0);
    __publicField(this, 'offsetY', 0);
    __publicField(this, 'offsetScaleX', 0);
    __publicField(this, 'offsetScaleY', 0);
    __publicField(this, 'offsetShearY', 0);
    __publicField(this, 'relative', false);
    __publicField(this, 'local', false);
    if (name == null) throw new Error('name cannot be null.');
    this.name = name;
  }
}
class SkeletonJson {
  constructor(attachmentLoader) {
    __publicField(this, 'attachmentLoader');
    __publicField(this, 'scale', 1);
    __publicField(this, 'linkedMeshes', new Array());
    this.attachmentLoader = attachmentLoader;
  }
  readSkeletonData(json) {
    let scale = this.scale;
    let skeletonData = new SkeletonData();
    let root = typeof json === 'string' ? JSON.parse(json) : json;
    let skeletonMap = root.skeleton;
    if (skeletonMap != null) {
      skeletonData.hash = skeletonMap.hash;
      skeletonData.version = skeletonMap.spine;
      skeletonData.width = skeletonMap.width;
      skeletonData.height = skeletonMap.height;
      skeletonData.fps = skeletonMap.fps;
      skeletonData.imagesPath = skeletonMap.images;
    }
    if (root.bones) {
      for (let i = 0; i < root.bones.length; i++) {
        let boneMap = root.bones[i];
        let parent = null;
        let parentName = this.getValue(boneMap, 'parent', null);
        if (parentName != null) {
          parent = skeletonData.findBone(parentName);
          if (parent == null) throw new Error('Parent bone not found: ' + parentName);
        }
        let data = new BoneData(skeletonData.bones.length, boneMap.name, parent);
        data.length = this.getValue(boneMap, 'length', 0) * scale;
        data.x = this.getValue(boneMap, 'x', 0) * scale;
        data.y = this.getValue(boneMap, 'y', 0) * scale;
        data.rotation = this.getValue(boneMap, 'rotation', 0);
        data.scaleX = this.getValue(boneMap, 'scaleX', 1);
        data.scaleY = this.getValue(boneMap, 'scaleY', 1);
        data.shearX = this.getValue(boneMap, 'shearX', 0);
        data.shearY = this.getValue(boneMap, 'shearY', 0);
        data.transformMode = SkeletonJson.transformModeFromString(this.getValue(boneMap, 'transform', 'normal'));
        skeletonData.bones.push(data);
      }
    }
    if (root.slots) {
      for (let i = 0; i < root.slots.length; i++) {
        let slotMap = root.slots[i];
        let slotName = slotMap.name;
        let boneName = slotMap.bone;
        let boneData = skeletonData.findBone(boneName);
        if (boneData == null) throw new Error('Slot bone not found: ' + boneName);
        let data = new SlotData(skeletonData.slots.length, slotName, boneData);
        let color = this.getValue(slotMap, 'color', null);
        if (color != null) data.color.setFromString(color);
        let dark = this.getValue(slotMap, 'dark', null);
        if (dark != null) {
          data.darkColor = new Color(1, 1, 1, 1);
          data.darkColor.setFromString(dark);
        }
        data.attachmentName = this.getValue(slotMap, 'attachment', null);
        data.blendMode = SkeletonJson.blendModeFromString(this.getValue(slotMap, 'blend', 'normal'));
        skeletonData.slots.push(data);
      }
    }
    if (root.ik) {
      for (let i = 0; i < root.ik.length; i++) {
        let constraintMap = root.ik[i];
        let data = new IkConstraintData(constraintMap.name);
        data.order = this.getValue(constraintMap, 'order', 0);
        for (let j = 0; j < constraintMap.bones.length; j++) {
          let boneName = constraintMap.bones[j];
          let bone = skeletonData.findBone(boneName);
          if (bone == null) throw new Error('IK bone not found: ' + boneName);
          data.bones.push(bone);
        }
        let targetName = constraintMap.target;
        data.target = skeletonData.findBone(targetName);
        if (data.target == null) throw new Error('IK target bone not found: ' + targetName);
        data.bendDirection = this.getValue(constraintMap, 'bendPositive', true) ? 1 : -1;
        data.mix = this.getValue(constraintMap, 'mix', 1);
        skeletonData.ikConstraints.push(data);
      }
    }
    if (root.transform) {
      for (let i = 0; i < root.transform.length; i++) {
        let constraintMap = root.transform[i];
        let data = new TransformConstraintData(constraintMap.name);
        data.order = this.getValue(constraintMap, 'order', 0);
        for (let j = 0; j < constraintMap.bones.length; j++) {
          let boneName = constraintMap.bones[j];
          let bone = skeletonData.findBone(boneName);
          if (bone == null) throw new Error('Transform constraint bone not found: ' + boneName);
          data.bones.push(bone);
        }
        let targetName = constraintMap.target;
        data.target = skeletonData.findBone(targetName);
        if (data.target == null) throw new Error('Transform constraint target bone not found: ' + targetName);
        data.local = this.getValue(constraintMap, 'local', false);
        data.relative = this.getValue(constraintMap, 'relative', false);
        data.offsetRotation = this.getValue(constraintMap, 'rotation', 0);
        data.offsetX = this.getValue(constraintMap, 'x', 0) * scale;
        data.offsetY = this.getValue(constraintMap, 'y', 0) * scale;
        data.offsetScaleX = this.getValue(constraintMap, 'scaleX', 0);
        data.offsetScaleY = this.getValue(constraintMap, 'scaleY', 0);
        data.offsetShearY = this.getValue(constraintMap, 'shearY', 0);
        data.rotateMix = this.getValue(constraintMap, 'rotateMix', 1);
        data.translateMix = this.getValue(constraintMap, 'translateMix', 1);
        data.scaleMix = this.getValue(constraintMap, 'scaleMix', 1);
        data.shearMix = this.getValue(constraintMap, 'shearMix', 1);
        skeletonData.transformConstraints.push(data);
      }
    }
    if (root.path) {
      for (let i = 0; i < root.path.length; i++) {
        let constraintMap = root.path[i];
        let data = new PathConstraintData(constraintMap.name);
        data.order = this.getValue(constraintMap, 'order', 0);
        for (let j = 0; j < constraintMap.bones.length; j++) {
          let boneName = constraintMap.bones[j];
          let bone = skeletonData.findBone(boneName);
          if (bone == null) throw new Error('Transform constraint bone not found: ' + boneName);
          data.bones.push(bone);
        }
        let targetName = constraintMap.target;
        data.target = skeletonData.findSlot(targetName);
        if (data.target == null) throw new Error('Path target slot not found: ' + targetName);
        data.positionMode = SkeletonJson.positionModeFromString(
          this.getValue(constraintMap, 'positionMode', 'percent'),
        );
        data.spacingMode = SkeletonJson.spacingModeFromString(this.getValue(constraintMap, 'spacingMode', 'length'));
        data.rotateMode = SkeletonJson.rotateModeFromString(this.getValue(constraintMap, 'rotateMode', 'tangent'));
        data.offsetRotation = this.getValue(constraintMap, 'rotation', 0);
        data.position = this.getValue(constraintMap, 'position', 0);
        if (data.positionMode == PositionMode.Fixed) data.position *= scale;
        data.spacing = this.getValue(constraintMap, 'spacing', 0);
        if (data.spacingMode == SpacingMode.Length || data.spacingMode == SpacingMode.Fixed) data.spacing *= scale;
        data.rotateMix = this.getValue(constraintMap, 'rotateMix', 1);
        data.translateMix = this.getValue(constraintMap, 'translateMix', 1);
        skeletonData.pathConstraints.push(data);
      }
    }
    if (root.skins) {
      for (let skinName in root.skins) {
        let skinMap = root.skins[skinName];
        let skin = new Skin(skinName);
        for (let slotName in skinMap) {
          let slotIndex = skeletonData.findSlotIndex(slotName);
          if (slotIndex == -1) throw new Error('Slot not found: ' + slotName);
          let slotMap = skinMap[slotName];
          for (let entryName in slotMap) {
            let attachment = this.readAttachment(slotMap[entryName], skin, slotIndex, entryName, skeletonData);
            if (attachment != null) skin.addAttachment(slotIndex, entryName, attachment);
          }
        }
        skeletonData.skins.push(skin);
        if (skin.name == 'default') skeletonData.defaultSkin = skin;
      }
    }
    for (let i = 0, n = this.linkedMeshes.length; i < n; i++) {
      let linkedMesh = this.linkedMeshes[i];
      let skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
      if (skin == null) throw new Error('Skin not found: ' + linkedMesh.skin);
      let parent = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
      if (parent == null) throw new Error('Parent mesh not found: ' + linkedMesh.parent);
      linkedMesh.mesh.setParentMesh(parent);
      linkedMesh.mesh.updateUVs();
    }
    this.linkedMeshes.length = 0;
    if (root.events) {
      for (let eventName in root.events) {
        let eventMap = root.events[eventName];
        let data = new EventData(eventName);
        data.intValue = this.getValue(eventMap, 'int', 0);
        data.floatValue = this.getValue(eventMap, 'float', 0);
        data.stringValue = this.getValue(eventMap, 'string', '');
        skeletonData.events.push(data);
      }
    }
    if (root.animations) {
      for (let animationName in root.animations) {
        let animationMap = root.animations[animationName];
        this.readAnimation(animationMap, animationName, skeletonData);
      }
    }
    return skeletonData;
  }
  readAttachment(map, skin, slotIndex, name, skeletonData) {
    let scale = this.scale;
    name = this.getValue(map, 'name', name);
    let type = this.getValue(map, 'type', 'region');
    switch (type) {
      case 'region': {
        let path2 = this.getValue(map, 'path', name);
        let region = this.attachmentLoader.newRegionAttachment(skin, name, path2);
        if (region == null) return null;
        region.path = path2;
        region.x = this.getValue(map, 'x', 0) * scale;
        region.y = this.getValue(map, 'y', 0) * scale;
        region.scaleX = this.getValue(map, 'scaleX', 1);
        region.scaleY = this.getValue(map, 'scaleY', 1);
        region.rotation = this.getValue(map, 'rotation', 0);
        region.width = map.width * scale;
        region.height = map.height * scale;
        let color = this.getValue(map, 'color', null);
        if (color != null) region.color.setFromString(color);
        region.updateOffset();
        return region;
      }
      case 'boundingbox': {
        let box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
        if (box == null) return null;
        this.readVertices(map, box, map.vertexCount << 1);
        let color = this.getValue(map, 'color', null);
        if (color != null) box.color.setFromString(color);
        return box;
      }
      case 'mesh':
      case 'linkedmesh': {
        let path2 = this.getValue(map, 'path', name);
        let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path2);
        if (mesh == null) return null;
        mesh.path = path2;
        let color = this.getValue(map, 'color', null);
        if (color != null) mesh.color.setFromString(color);
        let parent = this.getValue(map, 'parent', null);
        if (parent != null) {
          mesh.inheritDeform = this.getValue(map, 'deform', true);
          this.linkedMeshes.push(new LinkedMesh(mesh, this.getValue(map, 'skin', null), slotIndex, parent));
          return mesh;
        }
        let uvs = map.uvs;
        this.readVertices(map, mesh, uvs.length);
        mesh.triangles = map.triangles;
        mesh.regionUVs = uvs;
        mesh.updateUVs();
        mesh.hullLength = this.getValue(map, 'hull', 0) * 2;
        return mesh;
      }
      case 'path': {
        let path2 = this.attachmentLoader.newPathAttachment(skin, name);
        if (path2 == null) return null;
        path2.closed = this.getValue(map, 'closed', false);
        path2.constantSpeed = this.getValue(map, 'constantSpeed', true);
        let vertexCount = map.vertexCount;
        this.readVertices(map, path2, vertexCount << 1);
        let lengths = Utils.newArray(vertexCount / 3, 0);
        for (let i = 0; i < map.lengths.length; i++) lengths[i] = map.lengths[i] * scale;
        path2.lengths = lengths;
        let color = this.getValue(map, 'color', null);
        if (color != null) path2.color.setFromString(color);
        return path2;
      }
      case 'point': {
        let point = this.attachmentLoader.newPointAttachment(skin, name);
        if (point == null) return null;
        point.x = this.getValue(map, 'x', 0) * scale;
        point.y = this.getValue(map, 'y', 0) * scale;
        point.rotation = this.getValue(map, 'rotation', 0);
        let color = this.getValue(map, 'color', null);
        if (color != null) point.color.setFromString(color);
        return point;
      }
      case 'clipping': {
        let clip = this.attachmentLoader.newClippingAttachment(skin, name);
        if (clip == null) return null;
        let end = this.getValue(map, 'end', null);
        if (end != null) {
          let slot = skeletonData.findSlot(end);
          if (slot == null) throw new Error('Clipping end slot not found: ' + end);
          clip.endSlot = slot;
        }
        let vertexCount = map.vertexCount;
        this.readVertices(map, clip, vertexCount << 1);
        let color = this.getValue(map, 'color', null);
        if (color != null) clip.color.setFromString(color);
        return clip;
      }
    }
    return null;
  }
  readVertices(map, attachment, verticesLength) {
    let scale = this.scale;
    attachment.worldVerticesLength = verticesLength;
    let vertices = map.vertices;
    if (verticesLength == vertices.length) {
      let scaledVertices = Utils.toFloatArray(vertices);
      if (scale != 1) {
        for (let i = 0, n = vertices.length; i < n; i++) scaledVertices[i] *= scale;
      }
      attachment.vertices = scaledVertices;
      return;
    }
    let weights = new Array();
    let bones = new Array();
    for (let i = 0, n = vertices.length; i < n; ) {
      let boneCount = vertices[i++];
      bones.push(boneCount);
      for (let nn = i + boneCount * 4; i < nn; i += 4) {
        bones.push(vertices[i]);
        weights.push(vertices[i + 1] * scale);
        weights.push(vertices[i + 2] * scale);
        weights.push(vertices[i + 3]);
      }
    }
    attachment.bones = bones;
    attachment.vertices = Utils.toFloatArray(weights);
  }
  readAnimation(map, name, skeletonData) {
    let scale = this.scale;
    let timelines = new Array();
    let duration = 0;
    if (map.slots) {
      for (let slotName in map.slots) {
        let slotMap = map.slots[slotName];
        let slotIndex = skeletonData.findSlotIndex(slotName);
        if (slotIndex == -1) throw new Error('Slot not found: ' + slotName);
        for (let timelineName in slotMap) {
          let timelineMap = slotMap[timelineName];
          if (timelineName == 'attachment') {
            let timeline = new AttachmentTimeline(timelineMap.length);
            timeline.slotIndex = slotIndex;
            let frameIndex = 0;
            for (let i = 0; i < timelineMap.length; i++) {
              let valueMap = timelineMap[i];
              timeline.setFrame(frameIndex++, valueMap.time, valueMap.name);
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
          } else if (timelineName == 'color') {
            let timeline = new ColorTimeline(timelineMap.length);
            timeline.slotIndex = slotIndex;
            let frameIndex = 0;
            for (let i = 0; i < timelineMap.length; i++) {
              let valueMap = timelineMap[i];
              let color = new Color();
              color.setFromString(valueMap.color);
              timeline.setFrame(frameIndex, valueMap.time, color.r, color.g, color.b, color.a);
              this.readCurve(valueMap, timeline, frameIndex);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * ColorTimeline.ENTRIES]);
          } else if (timelineName == 'twoColor') {
            let timeline = new TwoColorTimeline(timelineMap.length);
            timeline.slotIndex = slotIndex;
            let frameIndex = 0;
            for (let i = 0; i < timelineMap.length; i++) {
              let valueMap = timelineMap[i];
              let light = new Color();
              let dark = new Color();
              light.setFromString(valueMap.light);
              dark.setFromString(valueMap.dark);
              timeline.setFrame(frameIndex, valueMap.time, light.r, light.g, light.b, light.a, dark.r, dark.g, dark.b);
              this.readCurve(valueMap, timeline, frameIndex);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * TwoColorTimeline.ENTRIES]);
          } else throw new Error('Invalid timeline type for a slot: ' + timelineName + ' (' + slotName + ')');
        }
      }
    }
    if (map.bones) {
      for (let boneName in map.bones) {
        let boneMap = map.bones[boneName];
        let boneIndex = skeletonData.findBoneIndex(boneName);
        if (boneIndex == -1) throw new Error('Bone not found: ' + boneName);
        for (let timelineName in boneMap) {
          let timelineMap = boneMap[timelineName];
          if (timelineName === 'rotate') {
            let timeline = new RotateTimeline(timelineMap.length);
            timeline.boneIndex = boneIndex;
            let frameIndex = 0;
            for (let i = 0; i < timelineMap.length; i++) {
              let valueMap = timelineMap[i];
              timeline.setFrame(frameIndex, valueMap.time, valueMap.angle);
              this.readCurve(valueMap, timeline, frameIndex);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * RotateTimeline.ENTRIES]);
          } else if (timelineName === 'translate' || timelineName === 'scale' || timelineName === 'shear') {
            let timeline = null;
            let timelineScale = 1;
            if (timelineName === 'scale') timeline = new ScaleTimeline(timelineMap.length);
            else if (timelineName === 'shear') timeline = new ShearTimeline(timelineMap.length);
            else {
              timeline = new TranslateTimeline(timelineMap.length);
              timelineScale = scale;
            }
            timeline.boneIndex = boneIndex;
            let frameIndex = 0;
            for (let i = 0; i < timelineMap.length; i++) {
              let valueMap = timelineMap[i];
              let x = this.getValue(valueMap, 'x', 0),
                y = this.getValue(valueMap, 'y', 0);
              timeline.setFrame(frameIndex, valueMap.time, x * timelineScale, y * timelineScale);
              this.readCurve(valueMap, timeline, frameIndex);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * TranslateTimeline.ENTRIES]);
          } else throw new Error('Invalid timeline type for a bone: ' + timelineName + ' (' + boneName + ')');
        }
      }
    }
    if (map.ik) {
      for (let constraintName in map.ik) {
        let constraintMap = map.ik[constraintName];
        let constraint = skeletonData.findIkConstraint(constraintName);
        let timeline = new IkConstraintTimeline(constraintMap.length);
        timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(constraint);
        let frameIndex = 0;
        for (let i = 0; i < constraintMap.length; i++) {
          let valueMap = constraintMap[i];
          timeline.setFrame(
            frameIndex,
            valueMap.time,
            this.getValue(valueMap, 'mix', 1),
            this.getValue(valueMap, 'bendPositive', true) ? 1 : -1,
          );
          this.readCurve(valueMap, timeline, frameIndex);
          frameIndex++;
        }
        timelines.push(timeline);
        duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * IkConstraintTimeline.ENTRIES]);
      }
    }
    if (map.transform) {
      for (let constraintName in map.transform) {
        let constraintMap = map.transform[constraintName];
        let constraint = skeletonData.findTransformConstraint(constraintName);
        let timeline = new TransformConstraintTimeline(constraintMap.length);
        timeline.transformConstraintIndex = skeletonData.transformConstraints.indexOf(constraint);
        let frameIndex = 0;
        for (let i = 0; i < constraintMap.length; i++) {
          let valueMap = constraintMap[i];
          timeline.setFrame(
            frameIndex,
            valueMap.time,
            this.getValue(valueMap, 'rotateMix', 1),
            this.getValue(valueMap, 'translateMix', 1),
            this.getValue(valueMap, 'scaleMix', 1),
            this.getValue(valueMap, 'shearMix', 1),
          );
          this.readCurve(valueMap, timeline, frameIndex);
          frameIndex++;
        }
        timelines.push(timeline);
        duration = Math.max(
          duration,
          timeline.frames[(timeline.getFrameCount() - 1) * TransformConstraintTimeline.ENTRIES],
        );
      }
    }
    if (map.paths) {
      for (let constraintName in map.paths) {
        let constraintMap = map.paths[constraintName];
        let index = skeletonData.findPathConstraintIndex(constraintName);
        if (index == -1) throw new Error('Path constraint not found: ' + constraintName);
        let data = skeletonData.pathConstraints[index];
        for (let timelineName in constraintMap) {
          let timelineMap = constraintMap[timelineName];
          if (timelineName === 'position' || timelineName === 'spacing') {
            let timeline = null;
            let timelineScale = 1;
            if (timelineName === 'spacing') {
              timeline = new PathConstraintSpacingTimeline(timelineMap.length);
              if (data.spacingMode == SpacingMode.Length || data.spacingMode == SpacingMode.Fixed)
                timelineScale = scale;
            } else {
              timeline = new PathConstraintPositionTimeline(timelineMap.length);
              if (data.positionMode == PositionMode.Fixed) timelineScale = scale;
            }
            timeline.pathConstraintIndex = index;
            let frameIndex = 0;
            for (let i = 0; i < timelineMap.length; i++) {
              let valueMap = timelineMap[i];
              timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, timelineName, 0) * timelineScale);
              this.readCurve(valueMap, timeline, frameIndex);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(
              duration,
              timeline.frames[(timeline.getFrameCount() - 1) * PathConstraintPositionTimeline.ENTRIES],
            );
          } else if (timelineName === 'mix') {
            let timeline = new PathConstraintMixTimeline(timelineMap.length);
            timeline.pathConstraintIndex = index;
            let frameIndex = 0;
            for (let i = 0; i < timelineMap.length; i++) {
              let valueMap = timelineMap[i];
              timeline.setFrame(
                frameIndex,
                valueMap.time,
                this.getValue(valueMap, 'rotateMix', 1),
                this.getValue(valueMap, 'translateMix', 1),
              );
              this.readCurve(valueMap, timeline, frameIndex);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(
              duration,
              timeline.frames[(timeline.getFrameCount() - 1) * PathConstraintMixTimeline.ENTRIES],
            );
          }
        }
      }
    }
    if (map.deform) {
      for (let deformName in map.deform) {
        let deformMap = map.deform[deformName];
        let skin = skeletonData.findSkin(deformName);
        if (skin == null) throw new Error('Skin not found: ' + deformName);
        for (let slotName in deformMap) {
          let slotMap = deformMap[slotName];
          let slotIndex = skeletonData.findSlotIndex(slotName);
          if (slotIndex == -1) throw new Error('Slot not found: ' + slotMap.name);
          for (let timelineName in slotMap) {
            let timelineMap = slotMap[timelineName];
            let attachment = skin.getAttachment(slotIndex, timelineName);
            if (attachment == null) throw new Error('Deform attachment not found: ' + timelineMap.name);
            let weighted = attachment.bones != null;
            let vertices = attachment.vertices;
            let deformLength = weighted ? (vertices.length / 3) * 2 : vertices.length;
            let timeline = new DeformTimeline(timelineMap.length);
            timeline.slotIndex = slotIndex;
            timeline.attachment = attachment;
            let frameIndex = 0;
            for (let j = 0; j < timelineMap.length; j++) {
              let valueMap = timelineMap[j];
              let deform;
              let verticesValue = this.getValue(valueMap, 'vertices', null);
              if (verticesValue == null) deform = weighted ? Utils.newFloatArray(deformLength) : vertices;
              else {
                deform = Utils.newFloatArray(deformLength);
                let start = this.getValue(valueMap, 'offset', 0);
                Utils.arrayCopy(verticesValue, 0, deform, start, verticesValue.length);
                if (scale != 1) {
                  for (let i = start, n = i + verticesValue.length; i < n; i++) deform[i] *= scale;
                }
                if (!weighted) {
                  for (let i = 0; i < deformLength; i++) deform[i] += vertices[i];
                }
              }
              timeline.setFrame(frameIndex, valueMap.time, deform);
              this.readCurve(valueMap, timeline, frameIndex);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
          }
        }
      }
    }
    let drawOrderNode = map.drawOrder;
    if (drawOrderNode == null) drawOrderNode = map.draworder;
    if (drawOrderNode != null) {
      let timeline = new DrawOrderTimeline(drawOrderNode.length);
      let slotCount = skeletonData.slots.length;
      let frameIndex = 0;
      for (let j = 0; j < drawOrderNode.length; j++) {
        let drawOrderMap = drawOrderNode[j];
        let drawOrder = null;
        let offsets = this.getValue(drawOrderMap, 'offsets', null);
        if (offsets != null) {
          drawOrder = Utils.newArray(slotCount, -1);
          let unchanged = Utils.newArray(slotCount - offsets.length, 0);
          let originalIndex = 0,
            unchangedIndex = 0;
          for (let i = 0; i < offsets.length; i++) {
            let offsetMap = offsets[i];
            let slotIndex = skeletonData.findSlotIndex(offsetMap.slot);
            if (slotIndex == -1) throw new Error('Slot not found: ' + offsetMap.slot);
            while (originalIndex != slotIndex) unchanged[unchangedIndex++] = originalIndex++;
            drawOrder[originalIndex + offsetMap.offset] = originalIndex++;
          }
          while (originalIndex < slotCount) unchanged[unchangedIndex++] = originalIndex++;
          for (let i = slotCount - 1; i >= 0; i--) if (drawOrder[i] == -1) drawOrder[i] = unchanged[--unchangedIndex];
        }
        timeline.setFrame(frameIndex++, drawOrderMap.time, drawOrder);
      }
      timelines.push(timeline);
      duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
    }
    if (map.events) {
      let timeline = new EventTimeline(map.events.length);
      let frameIndex = 0;
      for (let i = 0; i < map.events.length; i++) {
        let eventMap = map.events[i];
        let eventData = skeletonData.findEvent(eventMap.name);
        if (eventData == null) throw new Error('Event not found: ' + eventMap.name);
        let event = new Event(Utils.toSinglePrecision(eventMap.time), eventData);
        event.intValue = this.getValue(eventMap, 'int', eventData.intValue);
        event.floatValue = this.getValue(eventMap, 'float', eventData.floatValue);
        event.stringValue = this.getValue(eventMap, 'string', eventData.stringValue);
        timeline.setFrame(frameIndex++, event);
      }
      timelines.push(timeline);
      duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
    }
    if (isNaN(duration)) {
      throw new Error('Error while parsing animation, duration is NaN');
    }
    skeletonData.animations.push(new Animation(name, timelines, duration));
  }
  readCurve(map, timeline, frameIndex) {
    if (!map.curve) return;
    if (map.curve === 'stepped') timeline.setStepped(frameIndex);
    else if (Object.prototype.toString.call(map.curve) === '[object Array]') {
      let curve = map.curve;
      timeline.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
    }
  }
  getValue(map, prop, defaultValue) {
    return map[prop] !== void 0 ? map[prop] : defaultValue;
  }
  static blendModeFromString(str) {
    str = str.toLowerCase();
    if (str == 'normal') return BlendMode.Normal;
    if (str == 'additive') return BlendMode.Additive;
    if (str == 'multiply') return BlendMode.Multiply;
    if (str == 'screen') return BlendMode.Screen;
    throw new Error(`Unknown blend mode: ${str}`);
  }
  static positionModeFromString(str) {
    str = str.toLowerCase();
    if (str == 'fixed') return PositionMode.Fixed;
    if (str == 'percent') return PositionMode.Percent;
    throw new Error(`Unknown position mode: ${str}`);
  }
  static spacingModeFromString(str) {
    str = str.toLowerCase();
    if (str == 'length') return SpacingMode.Length;
    if (str == 'fixed') return SpacingMode.Fixed;
    if (str == 'percent') return SpacingMode.Percent;
    throw new Error(`Unknown position mode: ${str}`);
  }
  static rotateModeFromString(str) {
    str = str.toLowerCase();
    if (str == 'tangent') return RotateMode.Tangent;
    if (str == 'chain') return RotateMode.Chain;
    if (str == 'chainscale') return RotateMode.ChainScale;
    throw new Error(`Unknown rotate mode: ${str}`);
  }
  static transformModeFromString(str) {
    str = str.toLowerCase();
    if (str == 'normal') return TransformMode.Normal;
    if (str == 'onlytranslation') return TransformMode.OnlyTranslation;
    if (str == 'norotationorreflection') return TransformMode.NoRotationOrReflection;
    if (str == 'noscale') return TransformMode.NoScale;
    if (str == 'noscaleorreflection') return TransformMode.NoScaleOrReflection;
    throw new Error(`Unknown transform mode: ${str}`);
  }
}
class LinkedMesh {
  constructor(mesh, skin, slotIndex, parent) {
    __publicField(this, 'parent');
    __publicField(this, 'skin');
    __publicField(this, 'slotIndex');
    __publicField(this, 'mesh');
    this.mesh = mesh;
    this.skin = skin;
    this.slotIndex = slotIndex;
    this.parent = parent;
  }
}
(() => {
  if (!Math.fround) {
    Math.fround = /* @__PURE__ */ (function (array) {
      return function (x) {
        return (array[0] = x), array[0];
      };
    })(new Float32Array(1));
  }
})();
class Assets {
  constructor(clientId) {
    __publicField(this, 'clientId');
    __publicField(this, 'toLoad', new Array());
    __publicField(this, 'assets', {});
    __publicField(this, 'textureLoader');
    this.clientId = clientId;
  }
  loaded() {
    var i = 0;
    for (var v in this.assets) i++;
    return i;
  }
}
class SharedAssetManager {
  constructor(pathPrefix = '') {
    __publicField(this, 'pathPrefix');
    __publicField(this, 'clientAssets', {});
    __publicField(this, 'queuedAssets', {});
    __publicField(this, 'rawAssets', {});
    __publicField(this, 'errors', {});
    this.pathPrefix = pathPrefix;
  }
  queueAsset(clientId, textureLoader, path2) {
    var clientAssets = this.clientAssets[clientId];
    if (clientAssets === null || clientAssets === void 0) {
      clientAssets = new Assets(clientId);
      this.clientAssets[clientId] = clientAssets;
    }
    if (textureLoader !== null) clientAssets.textureLoader = textureLoader;
    clientAssets.toLoad.push(path2);
    if (this.queuedAssets[path2] === path2) {
      return false;
    } else {
      this.queuedAssets[path2] = path2;
      return true;
    }
  }
  loadText(clientId, path2) {
    path2 = this.pathPrefix + path2;
    if (!this.queueAsset(clientId, null, path2)) return;
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState == XMLHttpRequest.DONE) {
        if (request.status >= 200 && request.status < 300) {
          this.rawAssets[path2] = request.responseText;
        } else {
          this.errors[path2] = `Couldn't load text ${path2}: status ${request.status}, ${request.responseText}`;
        }
      }
    };
    request.open('GET', path2, true);
    request.send();
  }
  loadJson(clientId, path2) {
    path2 = this.pathPrefix + path2;
    if (!this.queueAsset(clientId, null, path2)) return;
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState == XMLHttpRequest.DONE) {
        if (request.status >= 200 && request.status < 300) {
          this.rawAssets[path2] = JSON.parse(request.responseText);
        } else {
          this.errors[path2] = `Couldn't load text ${path2}: status ${request.status}, ${request.responseText}`;
        }
      }
    };
    request.open('GET', path2, true);
    request.send();
  }
  loadTexture(clientId, textureLoader, path2) {
    path2 = this.pathPrefix + path2;
    if (!this.queueAsset(clientId, textureLoader, path2)) return;
    let img = new Image();
    img.src = path2;
    img.crossOrigin = 'anonymous';
    img.onload = ev => {
      this.rawAssets[path2] = img;
    };
    img.onerror = ev => {
      this.errors[path2] = `Couldn't load image ${path2}`;
    };
  }
  get(clientId, path2) {
    path2 = this.pathPrefix + path2;
    var clientAssets = this.clientAssets[clientId];
    if (clientAssets === null || clientAssets === void 0) return true;
    return clientAssets.assets[path2];
  }
  updateClientAssets(clientAssets) {
    for (var i = 0; i < clientAssets.toLoad.length; i++) {
      var path2 = clientAssets.toLoad[i];
      var asset = clientAssets.assets[path2];
      if (asset === null || asset === void 0) {
        var rawAsset = this.rawAssets[path2];
        if (rawAsset === null || rawAsset === void 0) continue;
        if (rawAsset instanceof HTMLImageElement) {
          clientAssets.assets[path2] = clientAssets.textureLoader(rawAsset);
        } else {
          clientAssets.assets[path2] = rawAsset;
        }
      }
    }
  }
  isLoadingComplete(clientId) {
    var clientAssets = this.clientAssets[clientId];
    if (clientAssets === null || clientAssets === void 0) return true;
    this.updateClientAssets(clientAssets);
    return clientAssets.toLoad.length == clientAssets.loaded();
  }
  /*remove (clientId: string, path: string) {
  			path = this.pathPrefix + path;
  			let asset = this.assets[path];
  			if ((<any>asset).dispose) (<any>asset).dispose();
  			this.assets[path] = null;
  		}
  
  		removeAll () {
  			for (let key in this.assets) {
  				let asset = this.assets[key];
  				if ((<any>asset).dispose) (<any>asset).dispose();
  			}
  			this.assets = {};
  		}*/
  dispose() {}
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
  getErrors() {
    return this.errors;
  }
}
class JitterEffect {
  constructor(jitterX, jitterY) {
    __publicField(this, 'jitterX', 0);
    __publicField(this, 'jitterY', 0);
    this.jitterX = jitterX;
    this.jitterY = jitterY;
  }
  begin(skeleton) {}
  transform(position, uv, light, dark) {
    position.x += MathUtils.randomTriangular(-this.jitterX, this.jitterY);
    position.y += MathUtils.randomTriangular(-this.jitterX, this.jitterY);
  }
  end() {}
}
const _SwirlEffect = class _SwirlEffect {
  constructor(radius) {
    __publicField(this, 'centerX', 0);
    __publicField(this, 'centerY', 0);
    __publicField(this, 'radius', 0);
    __publicField(this, 'angle', 0);
    __publicField(this, 'worldX', 0);
    __publicField(this, 'worldY', 0);
    this.radius = radius;
  }
  begin(skeleton) {
    this.worldX = skeleton.x + this.centerX;
    this.worldY = skeleton.y + this.centerY;
  }
  transform(position, uv, light, dark) {
    let radAngle = this.angle * MathUtils.degreesToRadians;
    let x = position.x - this.worldX;
    let y = position.y - this.worldY;
    let dist = Math.sqrt(x * x + y * y);
    if (dist < this.radius) {
      let theta = _SwirlEffect.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
      let cos = Math.cos(theta);
      let sin = Math.sin(theta);
      position.x = cos * x - sin * y + this.worldX;
      position.y = sin * x + cos * y + this.worldY;
    }
  }
  end() {}
};
__publicField(_SwirlEffect, 'interpolation', new PowOut(2));
let SwirlEffect = _SwirlEffect;
const _SpineTexture = class _SpineTexture extends Texture {
  constructor(image) {
    super(image.resource);
    __publicField(this, 'texture');
    this.texture = Texture$1.from(image);
  }
  static from(texture) {
    if (_SpineTexture.textureMap.has(texture)) {
      return _SpineTexture.textureMap.get(texture);
    }
    return new _SpineTexture(texture);
  }
  setFilters(minFilter, magFilter) {
    const style = this.texture.source.style;
    style.minFilter = _SpineTexture.toPixiTextureFilter(minFilter);
    style.magFilter = _SpineTexture.toPixiTextureFilter(magFilter);
    this.texture.source.autoGenerateMipmaps = _SpineTexture.toPixiMipMap(minFilter);
    this.texture.source.updateMipmaps();
  }
  setWraps(uWrap, vWrap) {
    const style = this.texture.source.style;
    style.addressModeU = _SpineTexture.toPixiTextureWrap(uWrap);
    style.addressModeV = _SpineTexture.toPixiTextureWrap(vWrap);
  }
  dispose() {
    this.texture.destroy();
  }
  static toPixiMipMap(filter) {
    switch (filter) {
      case TextureFilter.Nearest:
      case TextureFilter.Linear:
        return false;
      case TextureFilter.MipMapNearestLinear:
      case TextureFilter.MipMapNearestNearest:
      case TextureFilter.MipMapLinearLinear:
      case TextureFilter.MipMapLinearNearest:
        return true;
      default:
        throw new Error(`Unknown texture filter: ${String(filter)}`);
    }
  }
  static toPixiTextureFilter(filter) {
    switch (filter) {
      case TextureFilter.Nearest:
      case TextureFilter.MipMapNearestLinear:
      case TextureFilter.MipMapNearestNearest:
        return 'nearest';
      case TextureFilter.Linear:
      case TextureFilter.MipMapLinearLinear:
      case TextureFilter.MipMapLinearNearest:
        return 'linear';
      default:
        throw new Error(`Unknown texture filter: ${String(filter)}`);
    }
  }
  static toPixiTextureWrap(wrap) {
    switch (wrap) {
      case TextureWrap.ClampToEdge:
        return 'clamp-to-edge';
      case TextureWrap.MirroredRepeat:
        return 'mirror-repeat';
      case TextureWrap.Repeat:
        return 'repeat';
      default:
        throw new Error(`Unknown texture wrap: ${String(wrap)}`);
    }
  }
  static toPixiBlending(blend) {
    switch (blend) {
      case BlendMode.Normal:
        return 'normal';
      case BlendMode.Additive:
        return 'add';
      case BlendMode.Multiply:
        return 'multiply';
      case BlendMode.Screen:
        return 'screen';
      default:
        throw new Error(`Unknown blendMode: ${String(blend)}`);
    }
  }
};
__publicField(_SpineTexture, 'textureMap', /* @__PURE__ */ new Map());
let SpineTexture = _SpineTexture;
const spineTextureAtlasLoader = {
  extension: ExtensionType.Asset,
  resolver: {
    test: value => checkExtension(value, '.atlas'),
    parse: value => {
      var _a, _b, _c;
      const split = value.split('.');
      return {
        resolution: parseFloat(
          (_c = (_b = (_a = Resolver.RETINA_PREFIX) == null ? void 0 : _a.exec(value)) == null ? void 0 : _b[1]) != null
            ? _c
            : '1',
        ),
        format: split[split.length - 2],
        src: value,
      };
    },
  },
  loader: {
    extension: {
      type: ExtensionType.LoadParser,
      priority: LoaderParserPriority.Normal,
      name: 'spineTextureAtlasLoader',
    },
    test(url) {
      return checkExtension(url, '.atlas');
    },
    load(url) {
      return __async(this, null, function* () {
        const response = yield DOMAdapter.get().fetch(url);
        const txt = yield response.text();
        return txt;
      });
    },
    testParse(asset, options) {
      const isExtensionRight = checkExtension(options.src, '.atlas');
      const isString = typeof asset === 'string';
      return Promise.resolve(isExtensionRight && isString);
    },
    unload(atlas) {
      atlas.dispose();
    },
    parse(asset, options, loader) {
      return __async(this, null, function* () {
        var _a;
        const metadata = options.data || {};
        let basePath = path.dirname(options.src);
        if (basePath && basePath.lastIndexOf('/') !== basePath.length - 1) {
          basePath += '/';
        }
        const retval = new TextureAtlas(asset, path2 => {
          const data = SpineTexture.from(options.data.imageTexture.source);
          return data;
        });
        if (metadata.images instanceof TextureSource || typeof metadata.images === 'string') {
          const pixiTexture = metadata.images;
          metadata.images = {};
          metadata.images[retval.pages[0].name] = pixiTexture;
        }
        const textureLoadingPromises = [];
        for (const page of retval.pages) {
          if (metadata.resolve) {
            const resolvePromise =
              (_a = metadata.resolve()) == null
                ? void 0
                : _a.then(texture => {
                    if (texture) {
                      page.setTexture(SpineTexture.from(texture.source));
                    }
                  });
            textureLoadingPromises.push(resolvePromise);
            continue;
          }
          const pageName = page.name;
          const providedPage = (metadata == null ? void 0 : metadata.images) ? metadata.images[pageName] : void 0;
          if (providedPage instanceof TextureSource) {
            page.setTexture(SpineTexture.from(providedPage));
          } else {
            const url =
              providedPage != null
                ? providedPage
                : path.normalize([...basePath.split(path.sep), pageName].join(path.sep));
            const assetsToLoadIn = {
              src: copySearchParams(url, options.src),
              data: __spreadProps(__spreadValues({}, metadata.imageMetadata), {
                alphaMode: page.pma ? 'premultiplied-alpha' : 'premultiply-alpha-on-upload',
              }),
            };
            const pixiPromise = loader.load(assetsToLoadIn).then(texture => {
              page.setTexture(SpineTexture.from(texture.source));
            });
            textureLoadingPromises.push(pixiPromise);
          }
        }
        yield Promise.all(textureLoadingPromises);
        return retval;
      });
    },
  },
};
extensions.add(spineTextureAtlasLoader);
function isJson(resource) {
  return Object.prototype.hasOwnProperty.call(resource, 'bones');
}
function isBuffer(resource) {
  return resource instanceof Uint8Array;
}
const spineLoaderExtension = {
  extension: ExtensionType.Asset,
  loader: {
    extension: {
      type: ExtensionType.LoadParser,
      priority: LoaderParserPriority.Normal,
      name: 'spineSkeletonLoader',
    },
    test(url) {
      return checkExtension(url, '.skel');
    },
    load(url) {
      return __async(this, null, function* () {
        const response = yield DOMAdapter.get().fetch(url);
        const buffer = new Uint8Array(yield response.arrayBuffer());
        return buffer;
      });
    },
    testParse(asset, options) {
      const isJsonSpineModel = checkExtension(options.src, '.json') && isJson(asset);
      const isBinarySpineModel = checkExtension(options.src, '.skel') && isBuffer(asset);
      return Promise.resolve(isJsonSpineModel || isBinarySpineModel);
    },
  },
};
extensions.add(spineLoaderExtension);
const placeHolderBufferData = new Float32Array(1);
const placeHolderIndexData = new Uint32Array(1);
class DarkTintBatchGeometry extends Geometry {
  constructor() {
    const vertexSize = 7;
    const attributeBuffer = new Buffer2({
      data: placeHolderBufferData,
      label: 'attribute-batch-buffer',
      usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
      shrinkToFit: false,
    });
    const indexBuffer = new Buffer2({
      data: placeHolderIndexData,
      label: 'index-batch-buffer',
      usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
      // | BufferUsage.STATIC,
      shrinkToFit: false,
    });
    const stride = vertexSize * 4;
    super({
      attributes: {
        aPosition: {
          buffer: attributeBuffer,
          format: 'float32x2',
          stride,
          offset: 0,
        },
        aUV: {
          buffer: attributeBuffer,
          format: 'float32x2',
          stride,
          offset: 2 * 4,
        },
        aColor: {
          buffer: attributeBuffer,
          format: 'unorm8x4',
          stride,
          offset: 4 * 4,
        },
        aDarkColor: {
          buffer: attributeBuffer,
          format: 'unorm8x4',
          stride,
          offset: 5 * 4,
        },
        aTextureIdAndRound: {
          buffer: attributeBuffer,
          format: 'uint16x2',
          stride,
          offset: 6 * 4,
        },
      },
      indexBuffer,
    });
  }
}
const darkTintBit = {
  name: 'color-bit',
  vertex: {
    header:
      /* wgsl */
      `
            @in aDarkColor: vec4<f32>;
            @out vDarkColor: vec4<f32>;
        `,
    main:
      /* wgsl */
      `
        vDarkColor = aDarkColor;
        `,
  },
  fragment: {
    header:
      /* wgsl */
      `
            @in vDarkColor: vec4<f32>;
        `,
    end:
      /* wgsl */
      `

        let alpha = outColor.a * vColor.a;
        let rgb = ((outColor.a - 1.0) * vDarkColor.a + 1.0 - outColor.rgb) * vDarkColor.rgb + outColor.rgb * vColor.rgb;

        finalColor = vec4<f32>(rgb, alpha);

        `,
  },
};
const darkTintBitGl = {
  name: 'color-bit',
  vertex: {
    header:
      /* glsl */
      `
            in vec4 aDarkColor;
            out vec4 vDarkColor;
        `,
    main:
      /* glsl */
      `
            vDarkColor = aDarkColor;
        `,
  },
  fragment: {
    header:
      /* glsl */
      `
            in vec4 vDarkColor;
        `,
    end:
      /* glsl */
      `

        finalColor.a = outColor.a * vColor.a;
        finalColor.rgb = ((outColor.a - 1.0) * vDarkColor.a + 1.0 - outColor.rgb) * vDarkColor.rgb + outColor.rgb * vColor.rgb;
        `,
  },
};
class DarkTintShader extends Shader {
  constructor(maxTextures) {
    const glProgram = compileHighShaderGlProgram({
      name: 'dark-tint-batch',
      bits: [colorBitGl, darkTintBitGl, generateTextureBatchBitGl(maxTextures), roundPixelsBitGl],
    });
    const gpuProgram = compileHighShaderGpuProgram({
      name: 'dark-tint-batch',
      bits: [colorBit, darkTintBit, generateTextureBatchBit(maxTextures), roundPixelsBit],
    });
    super({
      glProgram,
      gpuProgram,
      resources: {
        batchSamplers: getBatchSamplersUniformGroup(maxTextures),
      },
    });
  }
}
let defaultShader = null;
const _DarkTintBatcher = class _DarkTintBatcher extends Batcher {
  constructor() {
    super(...arguments);
    __publicField(this, 'geometry', new DarkTintBatchGeometry());
    __publicField(this, 'shader', defaultShader || (defaultShader = new DarkTintShader(this.maxTextures)));
    __publicField(this, 'name', _DarkTintBatcher.extension.name);
    /** The size of one attribute. 1 = 32 bit. x, y, u, v, color, darkColor, textureIdAndRound -> total = 7 */
    __publicField(this, 'vertexSize', 7);
  }
  packAttributes(element, float32View, uint32View, index, textureId) {
    const textureIdAndRound = (textureId << 16) | (element.roundPixels & 65535);
    const wt = element.transform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const { positions, uvs } = element;
    const argb = element.color;
    const worldAlpha = ((argb >> 24) & 255) / 255;
    const darkColor = Color$1.shared
      .setValue(element.darkColor)
      .premultiply(worldAlpha, true)
      .toPremultiplied(1, false);
    const offset = element.attributeOffset;
    const end = offset + element.attributeSize;
    for (let i = offset; i < end; i++) {
      const i2 = i * 2;
      const x = positions[i2];
      const y = positions[i2 + 1];
      float32View[index++] = a * x + c * y + tx;
      float32View[index++] = d * y + b * x + ty;
      float32View[index++] = uvs[i2];
      float32View[index++] = uvs[i2 + 1];
      uint32View[index++] = argb;
      uint32View[index++] = darkColor;
      uint32View[index++] = textureIdAndRound;
    }
  }
  packQuadAttributes(element, float32View, uint32View, index, textureId) {
    const texture = element.texture;
    const wt = element.transform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const bounds = element.bounds;
    const w0 = bounds.maxX;
    const w1 = bounds.minX;
    const h0 = bounds.maxY;
    const h1 = bounds.minY;
    const uvs = texture.uvs;
    const argb = element.color;
    const darkColor = element.darkColor;
    const textureIdAndRound = (textureId << 16) | (element.roundPixels & 65535);
    float32View[index + 0] = a * w1 + c * h1 + tx;
    float32View[index + 1] = d * h1 + b * w1 + ty;
    float32View[index + 2] = uvs.x0;
    float32View[index + 3] = uvs.y0;
    uint32View[index + 4] = argb;
    uint32View[index + 5] = darkColor;
    uint32View[index + 6] = textureIdAndRound;
    float32View[index + 7] = a * w0 + c * h1 + tx;
    float32View[index + 8] = d * h1 + b * w0 + ty;
    float32View[index + 9] = uvs.x1;
    float32View[index + 10] = uvs.y1;
    uint32View[index + 11] = argb;
    uint32View[index + 12] = darkColor;
    uint32View[index + 13] = textureIdAndRound;
    float32View[index + 14] = a * w0 + c * h0 + tx;
    float32View[index + 15] = d * h0 + b * w0 + ty;
    float32View[index + 16] = uvs.x2;
    float32View[index + 17] = uvs.y2;
    uint32View[index + 18] = argb;
    uint32View[index + 19] = darkColor;
    uint32View[index + 20] = textureIdAndRound;
    float32View[index + 21] = a * w1 + c * h0 + tx;
    float32View[index + 22] = d * h0 + b * w1 + ty;
    float32View[index + 23] = uvs.x3;
    float32View[index + 24] = uvs.y3;
    uint32View[index + 25] = argb;
    uint32View[index + 26] = darkColor;
    uint32View[index + 27] = textureIdAndRound;
  }
};
/** @ignore */
__publicField(_DarkTintBatcher, 'extension', {
  type: [ExtensionType.Batcher],
  name: 'darkTint',
});
let DarkTintBatcher = _DarkTintBatcher;
extensions.add(DarkTintBatcher);
class BatchableSpineSlot {
  constructor() {
    __publicField(this, 'indexOffset', 0);
    __publicField(this, 'attributeOffset', 0);
    __publicField(this, 'indexSize');
    __publicField(this, 'attributeSize');
    __publicField(this, 'batcherName', 'darkTint');
    __publicField(this, 'topology', 'triangle-list');
    __publicField(this, 'packAsQuad', false);
    __publicField(this, 'renderable');
    __publicField(this, 'positions');
    __publicField(this, 'indices');
    __publicField(this, 'uvs');
    __publicField(this, 'roundPixels');
    __publicField(this, 'data');
    __publicField(this, 'blendMode');
    __publicField(this, 'darkTint');
    __publicField(this, 'texture');
    __publicField(this, 'transform');
    // used internally by batcher specific. Stored for efficient updating.
    __publicField(this, '_textureId');
    __publicField(this, '_attributeStart');
    __publicField(this, '_indexStart');
    __publicField(this, '_batcher');
    __publicField(this, '_batch');
  }
  get color() {
    const slotColor = this.data.color;
    const parentColor = this.renderable.groupColor;
    const parentAlpha = this.renderable.groupAlpha;
    let abgr;
    const mixedA = slotColor.a * parentAlpha * 255;
    if (parentColor !== 16777215) {
      const parentB = (parentColor >> 16) & 255;
      const parentG = (parentColor >> 8) & 255;
      const parentR = parentColor & 255;
      const mixedR = slotColor.r * parentR;
      const mixedG = slotColor.g * parentG;
      const mixedB = slotColor.b * parentB;
      abgr = (mixedA << 24) | (mixedB << 16) | (mixedG << 8) | mixedR;
    } else {
      abgr = (mixedA << 24) | ((slotColor.b * 255) << 16) | ((slotColor.g * 255) << 8) | (slotColor.r * 255);
    }
    return abgr;
  }
  get darkColor() {
    const darkColor = this.data.darkColor;
    return ((darkColor.b * 255) << 16) | ((darkColor.g * 255) << 8) | (darkColor.r * 255);
  }
  get groupTransform() {
    return this.renderable.groupTransform;
  }
  setData(renderable, data, blendMode, roundPixels) {
    this.renderable = renderable;
    this.transform = renderable.groupTransform;
    this.data = data;
    if (data.clipped) {
      const clippedData = data.clippedData;
      this.indexSize = clippedData.indicesCount;
      this.attributeSize = clippedData.vertexCount;
      this.positions = clippedData.vertices;
      this.indices = clippedData.indices;
      this.uvs = clippedData.uvs;
    } else {
      this.indexSize = data.indices.length;
      this.attributeSize = data.vertices.length / 2;
      this.positions = data.vertices;
      this.indices = data.indices;
      this.uvs = data.uvs;
    }
    this.texture = data.texture;
    this.roundPixels = roundPixels;
    this.blendMode = blendMode;
    this.batcherName = data.darkTint ? 'darkTint' : 'default';
  }
}
const spineBlendModeMap = {
  0: 'normal',
  1: 'add',
  2: 'multiply',
  3: 'screen',
};
class SpinePipe {
  constructor(renderer) {
    __publicField(this, 'renderer');
    __publicField(this, 'gpuSpineData', {});
    __publicField(this, '_destroyRenderableBound', this.destroyRenderable.bind(this));
    this.renderer = renderer;
  }
  validateRenderable(spine) {
    spine._validateAndTransformAttachments();
    if (spine.spineAttachmentsDirty) {
      return true;
    } else if (spine.spineTexturesDirty) {
      const drawOrder = spine.skeleton.drawOrder;
      const gpuSpine = this.gpuSpineData[spine.uid];
      for (let i = 0, n = drawOrder.length; i < n; i++) {
        const slot = drawOrder[i];
        const attachment = slot.getAttachment();
        if (attachment instanceof RegionAttachment || attachment instanceof MeshAttachment) {
          const cacheData = spine._getCachedData(slot, attachment);
          const batchableSpineSlot = gpuSpine.slotBatches[cacheData.id];
          const texture = cacheData.texture;
          if (texture !== batchableSpineSlot.texture) {
            if (!batchableSpineSlot._batcher.checkAndUpdateTexture(batchableSpineSlot, texture)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  addRenderable(spine, instructionSet) {
    var _a, _b;
    const gpuSpine = this._getSpineData(spine);
    const batcher = this.renderer.renderPipes.batch;
    const drawOrder = spine.skeleton.drawOrder;
    const roundPixels = this.renderer._roundPixels | spine._roundPixels;
    spine._validateAndTransformAttachments();
    for (let i = 0, n = drawOrder.length; i < n; i++) {
      const slot = drawOrder[i];
      const attachment = slot.getAttachment();
      const blendMode = spineBlendModeMap[slot.data.blendMode];
      if (attachment instanceof RegionAttachment || attachment instanceof MeshAttachment) {
        const cacheData = spine._getCachedData(slot, attachment);
        const batchableSpineSlot =
          (_a = gpuSpine.slotBatches)[(_b = cacheData.id)] || (_a[_b] = new BatchableSpineSlot());
        batchableSpineSlot.setData(spine, cacheData, blendMode, roundPixels);
        if (!cacheData.skipRender) {
          batcher.addToBatch(batchableSpineSlot, instructionSet);
        }
      }
      const containerAttachment = spine._slotsObject[slot.data.name];
      if (containerAttachment) {
        const container = containerAttachment.container;
        container.includeInBuild = true;
        collectAllRenderables(container, instructionSet, this.renderer);
        container.includeInBuild = false;
      }
    }
  }
  updateRenderable(spine) {
    var _a;
    const gpuSpine = this.gpuSpineData[spine.uid];
    spine._validateAndTransformAttachments();
    const drawOrder = spine.skeleton.drawOrder;
    for (let i = 0, n = drawOrder.length; i < n; i++) {
      const slot = drawOrder[i];
      const attachment = slot.getAttachment();
      if (attachment instanceof RegionAttachment || attachment instanceof MeshAttachment) {
        const cacheData = spine._getCachedData(slot, attachment);
        if (!cacheData.skipRender) {
          const batchableSpineSlot = gpuSpine.slotBatches[spine._getCachedData(slot, attachment).id];
          (_a = batchableSpineSlot._batcher) == null ? void 0 : _a.updateElement(batchableSpineSlot);
        }
      }
    }
  }
  destroyRenderable(spine) {
    this.gpuSpineData[spine.uid] = null;
    spine.off('destroyed', this._destroyRenderableBound);
  }
  destroy() {
    this.gpuSpineData = null;
    this.renderer = null;
  }
  _getSpineData(spine) {
    return this.gpuSpineData[spine.uid] || this._initMeshData(spine);
  }
  _initMeshData(spine) {
    this.gpuSpineData[spine.uid] = { slotBatches: {} };
    spine.on('destroyed', this._destroyRenderableBound);
    return this.gpuSpineData[spine.uid];
  }
}
/** @ignore */
__publicField(SpinePipe, 'extension', {
  type: [ExtensionType.WebGLPipes, ExtensionType.WebGPUPipes, ExtensionType.CanvasPipes],
  name: 'spine',
});
extensions.add(SpinePipe);
const vectorAux = new Vector2();
const clipper = new SkeletonClipping();
const maskPool = new Pool(() => new Graphics());
class Spine extends ViewContainer {
  constructor(options) {
    var _a;
    if (options instanceof SkeletonData) {
      options = {
        skeletonData: options,
      };
    }
    super();
    // Pixi properties
    __publicField(this, 'batched', true);
    __publicField(this, 'buildId', 0);
    __publicField(this, 'renderPipeId', 'spine');
    __publicField(this, '_didSpineUpdate', false);
    __publicField(this, 'beforeUpdateWorldTransforms', () => {});
    __publicField(this, 'afterUpdateWorldTransforms', () => {});
    // Spine properties
    /** The skeleton for this Spine game object. */
    __publicField(this, 'skeleton');
    /** The animation state for this Spine game object. */
    __publicField(this, 'state');
    __publicField(this, 'skeletonBounds');
    __publicField(this, 'darkTint', false);
    __publicField(this, '_debug');
    __publicField(this, '_slotsObject', /* @__PURE__ */ Object.create(null));
    __publicField(this, 'clippingSlotToPixiMasks', /* @__PURE__ */ Object.create(null));
    __publicField(this, 'spineAttachmentsDirty', true);
    __publicField(this, 'spineTexturesDirty', true);
    __publicField(this, '_lastAttachments', []);
    __publicField(this, '_stateChanged', true);
    __publicField(this, 'attachmentCacheData', []);
    __publicField(this, '_autoUpdate', false);
    __publicField(this, 'hasNeverUpdated', true);
    __publicField(this, 'currentClippingSlot');
    const skeletonData = options instanceof SkeletonData ? options : options.skeletonData;
    this.skeleton = new Skeleton(skeletonData);
    this.skeleton.flipY = true;
    this.state = new AnimationState(new AnimationStateData(skeletonData));
    this.autoUpdate = (_a = options == null ? void 0 : options.autoUpdate) != null ? _a : true;
    this.darkTint =
      (options == null ? void 0 : options.darkTint) === void 0
        ? this.skeleton.slots.some(slot => !!slot.data.darkColor)
        : options == null
        ? void 0
        : options.darkTint;
    const slots = this.skeleton.slots;
    for (let i = 0; i < slots.length; i++) {
      this.attachmentCacheData[i] = /* @__PURE__ */ Object.create(null);
    }
  }
  getSlotFromRef(slotRef) {
    let slot;
    if (typeof slotRef === 'number') slot = this.skeleton.slots[slotRef];
    else if (typeof slotRef === 'string') slot = this.skeleton.findSlot(slotRef);
    else slot = slotRef;
    if (!slot) throw new Error(`No slot found with the given slot reference: ${slotRef}`);
    return slot;
  }
  get debug() {
    return this._debug;
  }
  /** Pass a {@link SpineDebugRenderer} or create your own {@link ISpineDebugRenderer} to render bones, meshes, ...
   * @example spineGO.debug = new SpineDebugRenderer();
   */
  set debug(value) {
    if (this._debug) {
      this._debug.unregisterSpine(this);
    }
    if (value) {
      value.registerSpine(this);
    }
    this._debug = value;
  }
  get autoUpdate() {
    return this._autoUpdate;
  }
  /** When `true`, the Spine AnimationState and the Skeleton will be automatically updated using the {@link Ticker.shared} instance. */
  set autoUpdate(value) {
    if (value && !this._autoUpdate) {
      Ticker.shared.add(this.internalUpdate, this);
    } else {
      Ticker.shared.remove(this.internalUpdate, this);
    }
    this._autoUpdate = value;
  }
  /** If {@link Spine.autoUpdate} is `false`, this method allows to update the AnimationState and the Skeleton with the given delta. */
  update(dt) {
    this.internalUpdate(0, dt);
  }
  internalUpdate(_deltaFrame, deltaSeconds) {
    this._updateAndApplyState(deltaSeconds != null ? deltaSeconds : Ticker.shared.deltaMS / 1e3);
  }
  get bounds() {
    if (this._boundsDirty) {
      this.updateBounds();
    }
    return this._bounds;
  }
  /**
   * Set the position of the bone given in input through a {@link IPointData}.
   * @param bone: the bone name or the bone instance to set the position
   * @param outPos: the new position of the bone.
   * @throws {Error}: if the given bone is not found in the skeleton, an error is thrown
   */
  setBonePosition(bone, position) {
    const boneAux = bone;
    if (typeof bone === 'string') {
      bone = this.skeleton.findBone(bone);
    }
    if (!bone) throw Error(`Cant set bone position, bone ${String(boneAux)} not found`);
    vectorAux.set(position.x, position.y);
    if (bone.parent) {
      const aux = bone.parent.worldToLocal(vectorAux);
      bone.x = aux.x;
      bone.y = -aux.y;
    } else {
      bone.x = vectorAux.x;
      bone.y = vectorAux.y;
    }
  }
  /**
   * Return the position of the bone given in input into an {@link IPointData}.
   * @param bone: the bone name or the bone instance to get the position from
   * @param outPos: an optional {@link IPointData} to use to return the bone position, rathern than instantiating a new object.
   * @returns {IPointData | undefined}: the position of the bone, or undefined if no matching bone is found in the skeleton
   */
  getBonePosition(bone, outPos) {
    const boneAux = bone;
    if (typeof bone === 'string') {
      bone = this.skeleton.findBone(bone);
    }
    if (!bone) {
      console.error(`Cant set bone position! Bone ${String(boneAux)} not found`);
      return outPos;
    }
    if (!outPos) {
      outPos = { x: 0, y: 0 };
    }
    outPos.x = bone.worldX;
    outPos.y = bone.worldY;
    return outPos;
  }
  /**
   * Advance the state and skeleton by the given time, then update slot objects too.
   * The container transform is not updated.
   *
   * @param time the time at which to set the state
   */
  _updateAndApplyState(time) {
    this.hasNeverUpdated = false;
    this.state.update(time);
    this.skeleton.update(time);
    const { skeleton } = this;
    this.state.apply(skeleton);
    this.beforeUpdateWorldTransforms(this);
    skeleton.updateWorldTransform();
    this.afterUpdateWorldTransforms(this);
    this.updateSlotObjects();
    this._stateChanged = true;
    this._boundsDirty = true;
    this.onViewUpdate();
  }
  /**
   * - validates the attachments - to flag if the attachments have changed this state
   * - transforms the attachments - to update the vertices of the attachments based on the new positions
   * @internal
   */
  _validateAndTransformAttachments() {
    if (!this._stateChanged) return;
    this._stateChanged = false;
    this.validateAttachments();
    this.transformAttachments();
  }
  validateAttachments() {
    const currentDrawOrder = this.skeleton.drawOrder;
    const lastAttachments = this._lastAttachments;
    let index = 0;
    let spineAttachmentsDirty = false;
    for (let i = 0; i < currentDrawOrder.length; i++) {
      const slot = currentDrawOrder[i];
      const attachment = slot.getAttachment();
      if (attachment) {
        if (attachment !== lastAttachments[index]) {
          spineAttachmentsDirty = true;
          lastAttachments[index] = attachment;
        }
        index++;
      }
    }
    if (index !== lastAttachments.length) {
      spineAttachmentsDirty = true;
      lastAttachments.length = index;
    }
    this.spineAttachmentsDirty = spineAttachmentsDirty;
  }
  updateAndSetPixiMask(slot, last) {
    var _a, _b;
    const attachment = slot.attachment;
    if (attachment && attachment instanceof ClippingAttachment) {
      const clip =
        (_a = this.clippingSlotToPixiMasks)[(_b = slot.data.name)] ||
        (_a[_b] = {
          slot,
          vertices: new Array(),
        });
      clip.maskComputed = false;
      this.currentClippingSlot = this.clippingSlotToPixiMasks[slot.data.name];
      return;
    }
    let currentClippingSlot = this.currentClippingSlot;
    let slotObject = this._slotsObject[slot.data.name];
    if (currentClippingSlot && slotObject) {
      let slotClipping = currentClippingSlot.slot;
      let clippingAttachment = slotClipping.attachment;
      let mask = currentClippingSlot.mask;
      if (!mask) {
        mask = maskPool.obtain();
        currentClippingSlot.mask = mask;
        this.addChild(mask);
      }
      if (!currentClippingSlot.maskComputed) {
        currentClippingSlot.maskComputed = true;
        const worldVerticesLength = clippingAttachment.worldVerticesLength;
        const vertices = currentClippingSlot.vertices;
        clippingAttachment.computeWorldVertices(slotClipping, 0, worldVerticesLength, vertices, 0, 2);
        mask.clear().poly(vertices).stroke({ width: 0 }).fill({ alpha: 0.25 });
      }
      slotObject.container.mask = mask;
    } else if (slotObject == null ? void 0 : slotObject.container.mask) {
      slotObject.container.mask = null;
    }
    if (currentClippingSlot && currentClippingSlot.slot.attachment.endSlot == slot.data) {
      this.currentClippingSlot = void 0;
    }
    if (last) {
      for (const key in this.clippingSlotToPixiMasks) {
        const clippingSlotToPixiMask = this.clippingSlotToPixiMasks[key];
        if (
          (!(clippingSlotToPixiMask.slot.attachment instanceof ClippingAttachment) ||
            !clippingSlotToPixiMask.maskComputed) &&
          clippingSlotToPixiMask.mask
        ) {
          this.removeChild(clippingSlotToPixiMask.mask);
          maskPool.free(clippingSlotToPixiMask.mask);
          clippingSlotToPixiMask.mask = void 0;
        }
      }
    }
  }
  transformAttachments() {
    var _a;
    const currentDrawOrder = this.skeleton.drawOrder;
    for (let i = 0; i < currentDrawOrder.length; i++) {
      const slot = currentDrawOrder[i];
      this.updateAndSetPixiMask(slot, i === currentDrawOrder.length - 1);
      const attachment = slot.getAttachment();
      if (attachment) {
        if (attachment instanceof MeshAttachment || attachment instanceof RegionAttachment) {
          const cacheData = this._getCachedData(slot, attachment);
          if (attachment instanceof RegionAttachment) {
            attachment.computeWorldVertices(slot.bone, cacheData.vertices, 0, 2);
          } else {
            attachment.computeWorldVertices(slot, 0, attachment.worldVerticesLength, cacheData.vertices, 0, 2);
          }
          if (cacheData.uvs.length < attachment.uvs.length) {
            cacheData.uvs = new Float32Array(attachment.uvs.length);
          }
          fastCopy(attachment.uvs.buffer, cacheData.uvs.buffer);
          const skeleton = slot.bone.skeleton;
          const skeletonColor = skeleton.color;
          const slotColor = slot.color;
          const attachmentColor = attachment.color;
          cacheData.color.set(
            skeletonColor.r * slotColor.r * attachmentColor.r,
            skeletonColor.g * slotColor.g * attachmentColor.g,
            skeletonColor.b * slotColor.b * attachmentColor.b,
            skeletonColor.a * slotColor.a * attachmentColor.a,
          );
          if (slot.darkColor) {
            cacheData.darkColor.setFromColor(slot.darkColor);
          }
          cacheData.skipRender = cacheData.clipped = false;
          const texture = ((_a = attachment.region) == null ? void 0 : _a.texture.texture) || Texture$1.EMPTY;
          if (cacheData.texture !== texture) {
            cacheData.texture = texture;
            this.spineTexturesDirty = true;
          }
          if (clipper.isClipping()) {
            this.updateClippingData(cacheData);
          }
        } else if (attachment instanceof ClippingAttachment) {
          clipper.clipStart(slot, attachment);
          continue;
        }
      }
      clipper.clipEndWithSlot(slot);
    }
    clipper.clipEnd();
  }
  updateClippingData(cacheData) {
    cacheData.clipped = true;
    clipper.clipTrianglesUnpacked(cacheData.vertices, cacheData.indices, cacheData.indices.length, cacheData.uvs);
    const { clippedVertices, clippedUVs, clippedTriangles } = clipper;
    const verticesCount = clippedVertices.length / 2;
    const indicesCount = clippedTriangles.length;
    if (!cacheData.clippedData) {
      cacheData.clippedData = {
        vertices: new Float32Array(verticesCount * 2),
        uvs: new Float32Array(verticesCount * 2),
        vertexCount: verticesCount,
        indices: new Uint16Array(indicesCount),
        indicesCount,
      };
      this.spineAttachmentsDirty = true;
    }
    const clippedData = cacheData.clippedData;
    const sizeChange = clippedData.vertexCount !== verticesCount || indicesCount !== clippedData.indicesCount;
    cacheData.skipRender = verticesCount === 0;
    if (sizeChange) {
      this.spineAttachmentsDirty = true;
      if (clippedData.vertexCount < verticesCount) {
        clippedData.vertices = new Float32Array(verticesCount * 2);
        clippedData.uvs = new Float32Array(verticesCount * 2);
      }
      if (clippedData.indices.length < indicesCount) {
        clippedData.indices = new Uint16Array(indicesCount);
      }
    }
    const { vertices, uvs, indices } = clippedData;
    for (let i = 0; i < verticesCount; i++) {
      vertices[i * 2] = clippedVertices[i * 2];
      vertices[i * 2 + 1] = clippedVertices[i * 2 + 1];
      uvs[i * 2] = clippedUVs[i * 2];
      uvs[i * 2 + 1] = clippedUVs[i * 2 + 1];
    }
    clippedData.vertexCount = verticesCount;
    for (let i = 0; i < indicesCount; i++) {
      if (indices[i] !== clippedTriangles[i]) {
        this.spineAttachmentsDirty = true;
        indices[i] = clippedTriangles[i];
      }
    }
    clippedData.indicesCount = indicesCount;
  }
  /**
   * ensure that attached containers map correctly to their slots
   * along with their position, rotation, scale, and visibility.
   */
  updateSlotObjects() {
    for (const i in this._slotsObject) {
      const slotAttachment = this._slotsObject[i];
      if (!slotAttachment) continue;
      this.updateSlotObject(slotAttachment);
    }
  }
  updateSlotObject(slotAttachment) {
    const { slot, container } = slotAttachment;
    container.visible = this.skeleton.drawOrder.includes(slot);
    if (container.visible) {
      const bone = slot.bone;
      container.position.set(bone.worldX, bone.worldY);
      container.scale.x = bone.getWorldScaleX();
      container.scale.y = bone.getWorldScaleY();
      container.rotation = bone.getWorldRotationX() * DEG_TO_RAD;
      container.alpha = this.skeleton.color.a * slot.color.a;
    }
  }
  /** @internal */
  _getCachedData(slot, attachment) {
    return this.attachmentCacheData[slot.data.index][attachment.name] || this.initCachedData(slot, attachment);
  }
  initCachedData(slot, attachment) {
    var _a, _b;
    let vertices;
    if (attachment instanceof RegionAttachment) {
      vertices = new Float32Array(8);
      this.attachmentCacheData[slot.data.index][attachment.name] = {
        id: `${slot.data.index}-${attachment.name}`,
        vertices,
        clipped: false,
        indices: [0, 1, 2, 0, 2, 3],
        uvs: new Float32Array(attachment.uvs.length),
        color: new Color(1, 1, 1, 1),
        darkColor: new Color(0, 0, 0, 0),
        darkTint: this.darkTint,
        skipRender: false,
        texture: (_a = attachment.region) == null ? void 0 : _a.texture.texture,
      };
    } else {
      vertices = new Float32Array(attachment.worldVerticesLength);
      this.attachmentCacheData[slot.data.index][attachment.name] = {
        id: `${slot.data.index}-${attachment.name}`,
        vertices,
        clipped: false,
        indices: attachment.triangles,
        uvs: new Float32Array(attachment.uvs.length),
        color: new Color(1, 1, 1, 1),
        darkColor: new Color(0, 0, 0, 0),
        darkTint: this.darkTint,
        skipRender: false,
        texture: (_b = attachment.region) == null ? void 0 : _b.texture.texture,
      };
    }
    return this.attachmentCacheData[slot.data.index][attachment.name];
  }
  onViewUpdate() {
    var _a;
    this._didViewChangeTick++;
    this._boundsDirty = true;
    if (this.didViewUpdate) return;
    this.didViewUpdate = true;
    const renderGroup = this.renderGroup || this.parentRenderGroup;
    if (renderGroup) {
      renderGroup.onChildViewUpdate(this);
    }
    (_a = this.debug) == null ? void 0 : _a.renderDebug(this);
  }
  /**
   * Attaches a PixiJS container to a specified slot. This will map the world transform of the slots bone
   * to the attached container. A container can only be attached to one slot at a time.
   *
   * @param container - The container to attach to the slot
   * @param slotRef - The slot id or  slot to attach to
   */
  addSlotObject(slot, container) {
    var _a;
    slot = this.getSlotFromRef(slot);
    for (const i in this._slotsObject) {
      if (((_a = this._slotsObject[i]) == null ? void 0 : _a.container) === container) {
        this.removeSlotObject(this._slotsObject[i].slot);
      }
    }
    this.removeSlotObject(slot);
    container.includeInBuild = false;
    this.addChild(container);
    const slotObject = { container, slot };
    this._slotsObject[slot.data.name] = slotObject;
    this.updateSlotObject(slotObject);
  }
  /**
   * Removes a PixiJS container from the slot it is attached to.
   *
   * @param container - The container to detach from the slot
   * @param slotOrContainer - The container, slot id or slot to detach from
   */
  removeSlotObject(slotOrContainer) {
    var _a, _b;
    let containerToRemove;
    if (slotOrContainer instanceof Container) {
      for (const i in this._slotsObject) {
        if (((_a = this._slotsObject[i]) == null ? void 0 : _a.container) === slotOrContainer) {
          this._slotsObject[i] = null;
          containerToRemove = slotOrContainer;
          break;
        }
      }
    } else {
      const slot = this.getSlotFromRef(slotOrContainer);
      containerToRemove = (_b = this._slotsObject[slot.data.name]) == null ? void 0 : _b.container;
      this._slotsObject[slot.data.name] = null;
    }
    if (containerToRemove) {
      this.removeChild(containerToRemove);
      containerToRemove.includeInBuild = true;
    }
  }
  /**
   * Returns a container attached to a slot, or undefined if no container is attached.
   *
   * @param slotRef - The slot id or slot to get the attachment from
   * @returns - The container attached to the slot
   */
  getSlotObject(slot) {
    var _a;
    slot = this.getSlotFromRef(slot);
    return (_a = this._slotsObject[slot.data.name]) == null ? void 0 : _a.container;
  }
  updateBounds() {
    this._boundsDirty = false;
    this.skeletonBounds || (this.skeletonBounds = new SkeletonBounds());
    const skeletonBounds = this.skeletonBounds;
    skeletonBounds.update(this.skeleton, true);
    if (skeletonBounds.minX === Infinity) {
      if (this.hasNeverUpdated) {
        this._updateAndApplyState(0);
        this._boundsDirty = false;
      }
      this._validateAndTransformAttachments();
      const drawOrder = this.skeleton.drawOrder;
      const bounds = this._bounds;
      bounds.clear();
      for (let i = 0; i < drawOrder.length; i++) {
        const slot = drawOrder[i];
        const attachment = slot.getAttachment();
        if (attachment && (attachment instanceof RegionAttachment || attachment instanceof MeshAttachment)) {
          const cacheData = this._getCachedData(slot, attachment);
          bounds.addVertexData(cacheData.vertices, 0, cacheData.vertices.length);
        }
      }
    } else {
      this._bounds.minX = skeletonBounds.minX;
      this._bounds.minY = skeletonBounds.minY;
      this._bounds.maxX = skeletonBounds.maxX;
      this._bounds.maxY = skeletonBounds.maxY;
    }
  }
  /** @internal */
  addBounds(bounds) {
    bounds.addBounds(this.bounds);
  }
  /**
   * Destroys this sprite renderable and optionally its texture.
   * @param options - Options parameter. A boolean will act as if all options
   *  have been set to that value
   * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
   * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
   */
  destroy(options = false) {
    super.destroy(options);
    Ticker.shared.remove(this.internalUpdate, this);
    this.state.clearListeners();
    this.debug = void 0;
    this.skeleton = null;
    this.state = null;
    this._slotsObject = null;
    this._lastAttachments.length = 0;
    this.attachmentCacheData = null;
  }
  /** Converts a point from the skeleton coordinate system to the Pixi world coordinate system. */
  skeletonToPixiWorldCoordinates(point) {
    this.worldTransform.apply(point, point);
  }
  /** Converts a point from the Pixi world coordinate system to the skeleton coordinate system. */
  pixiWorldCoordinatesToSkeleton(point) {
    this.worldTransform.applyInverse(point, point);
  }
  /** Converts a point from the Pixi world coordinate system to the bone's local coordinate system. */
  pixiWorldCoordinatesToBone(point, bone) {
    this.pixiWorldCoordinatesToSkeleton(point);
    if (bone.parent) {
      bone.parent.worldToLocal(point);
    } else {
      bone.worldToLocal(point);
    }
  }
  /**
   * Use this method to instantiate a Spine game object.
   * Before instantiating a Spine game object, the skeleton (`.skel` or `.json`) and the atlas text files must be loaded into the Assets. For example:
   * ```
   * PIXI.Assets.add("sackData", "./assets/sack-pro.skel");
   * PIXI.Assets.add("sackAtlas", "./assets/sack-pma.atlas");
   * await PIXI.Assets.load(["sackData", "sackAtlas"]);
   * ```
   * Once a Spine game object is created, its skeleton data is cached into {@link Cache} using the key:
   * `${skeletonAssetName}-${atlasAssetName}-${options?.scale ?? 1}`
   *
   * @param options - Options to configure the Spine game object. See {@link SpineFromOptions}
   * @returns {Spine} The Spine game object instantiated
   */
  static from({ skeleton, atlas, scale = 1, darkTint, autoUpdate = true }) {
    const cacheKey = `${skeleton}-${atlas}-${scale}`;
    if (Cache.has(cacheKey)) {
      return new Spine(Cache.get(cacheKey));
    }
    const skeletonAsset = Assets$1.get(skeleton);
    const atlasAsset = Assets$1.get(atlas);
    const attachmentLoader = new AtlasAttachmentLoader(atlasAsset);
    const parser = new SkeletonJson(attachmentLoader);
    const skeletonData = parser.readSkeletonData(skeletonAsset);
    Cache.set(cacheKey, skeletonData);
    return new Spine({
      skeletonData,
      darkTint,
      autoUpdate,
    });
  }
}
class SpineDebugRenderer {
  constructor() {
    __publicField(this, 'registeredSpines', /* @__PURE__ */ new Map());
    __publicField(this, 'drawMeshHull', true);
    __publicField(this, 'drawMeshTriangles', true);
    __publicField(this, 'drawBones', true);
    __publicField(this, 'drawPaths', true);
    __publicField(this, 'drawBoundingBoxes', true);
    __publicField(this, 'drawClipping', true);
    __publicField(this, 'drawRegionAttachments', true);
    __publicField(this, 'drawEvents', true);
    __publicField(this, 'lineWidth', 1);
    __publicField(this, 'regionAttachmentsColor', 30975);
    __publicField(this, 'meshHullColor', 30975);
    __publicField(this, 'meshTrianglesColor', 16763904);
    __publicField(this, 'clippingPolygonColor', 16711935);
    __publicField(this, 'boundingBoxesRectColor', 65280);
    __publicField(this, 'boundingBoxesPolygonColor', 65280);
    __publicField(this, 'boundingBoxesCircleColor', 65280);
    __publicField(this, 'pathsCurveColor', 16711680);
    __publicField(this, 'pathsLineColor', 16711935);
    __publicField(this, 'skeletonXYColor', 16711680);
    __publicField(this, 'bonesColor', 61132);
    __publicField(this, 'eventFontSize', 24);
    __publicField(this, 'eventFontColor', 0);
  }
  /**
   * The debug is attached by force to each spine object.
   * So we need to create it inside the spine when we get the first update
   */
  registerSpine(spine) {
    if (this.registeredSpines.has(spine)) {
      console.warn('SpineDebugRenderer.registerSpine() - this spine is already registered!', spine);
      return;
    }
    const debugDisplayObjects = {
      parentDebugContainer: new Container(),
      bones: new Container(),
      skeletonXY: new Graphics(),
      regionAttachmentsShape: new Graphics(),
      meshTrianglesLine: new Graphics(),
      meshHullLine: new Graphics(),
      clippingPolygon: new Graphics(),
      boundingBoxesRect: new Graphics(),
      boundingBoxesCircle: new Graphics(),
      boundingBoxesPolygon: new Graphics(),
      pathsCurve: new Graphics(),
      pathsLine: new Graphics(),
      eventText: new Container(),
      eventCallback: {
        event: (_, event) => {
          if (this.drawEvents) {
            const scale = Math.abs(spine.scale.x || spine.scale.y || 1);
            const text = new Text({
              text: event.data.name,
              style: {
                fontSize: this.eventFontSize / scale,
                fill: this.eventFontColor,
                fontFamily: 'monospace',
              },
            });
            text.scale.x = Math.sign(spine.scale.x);
            text.anchor.set(0.5);
            debugDisplayObjects.eventText.addChild(text);
            setTimeout(() => {
              if (!text.destroyed) {
                text.destroy();
              }
            }, 250);
          }
        },
      },
    };
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.bones);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.skeletonXY);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.regionAttachmentsShape);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.meshTrianglesLine);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.meshHullLine);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.clippingPolygon);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.boundingBoxesRect);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.boundingBoxesCircle);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.boundingBoxesPolygon);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.pathsCurve);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.pathsLine);
    debugDisplayObjects.parentDebugContainer.addChild(debugDisplayObjects.eventText);
    debugDisplayObjects.parentDebugContainer.zIndex = 9999999;
    debugDisplayObjects.parentDebugContainer.accessibleChildren = false;
    debugDisplayObjects.parentDebugContainer.eventMode = 'none';
    debugDisplayObjects.parentDebugContainer.interactiveChildren = false;
    spine.addChild(debugDisplayObjects.parentDebugContainer);
    spine.state.addListener(debugDisplayObjects.eventCallback);
    this.registeredSpines.set(spine, debugDisplayObjects);
  }
  renderDebug(spine) {
    if (!this.registeredSpines.has(spine)) {
      this.registerSpine(spine);
    }
    const debugDisplayObjects = this.registeredSpines.get(spine);
    if (!debugDisplayObjects) {
      return;
    }
    spine.addChild(debugDisplayObjects.parentDebugContainer);
    debugDisplayObjects.skeletonXY.clear();
    debugDisplayObjects.regionAttachmentsShape.clear();
    debugDisplayObjects.meshTrianglesLine.clear();
    debugDisplayObjects.meshHullLine.clear();
    debugDisplayObjects.clippingPolygon.clear();
    debugDisplayObjects.boundingBoxesRect.clear();
    debugDisplayObjects.boundingBoxesCircle.clear();
    debugDisplayObjects.boundingBoxesPolygon.clear();
    debugDisplayObjects.pathsCurve.clear();
    debugDisplayObjects.pathsLine.clear();
    for (let len = debugDisplayObjects.bones.children.length; len > 0; len--) {
      debugDisplayObjects.bones.children[len - 1].destroy({
        children: true,
        texture: true,
        textureSource: true,
      });
    }
    const scale = Math.abs(spine.scale.x || spine.scale.y || 1);
    const lineWidth = this.lineWidth / scale;
    if (this.drawBones) {
      this.drawBonesFunc(spine, debugDisplayObjects, lineWidth, scale);
    }
    if (this.drawPaths) {
      this.drawPathsFunc(spine, debugDisplayObjects, lineWidth);
    }
    if (this.drawBoundingBoxes) {
      this.drawBoundingBoxesFunc(spine, debugDisplayObjects, lineWidth);
    }
    if (this.drawClipping) {
      this.drawClippingFunc(spine, debugDisplayObjects, lineWidth);
    }
    if (this.drawMeshHull || this.drawMeshTriangles) {
      this.drawMeshHullAndMeshTriangles(spine, debugDisplayObjects, lineWidth);
    }
    if (this.drawRegionAttachments) {
      this.drawRegionAttachmentsFunc(spine, debugDisplayObjects, lineWidth);
    }
    if (this.drawEvents) {
      for (const child of debugDisplayObjects.eventText.children) {
        child.alpha -= 0.05;
        child.y -= 2;
      }
    }
  }
  drawBonesFunc(spine, debugDisplayObjects, lineWidth, scale) {
    const skeleton = spine.skeleton;
    const skeletonX = skeleton.x;
    const skeletonY = skeleton.y;
    const bones = skeleton.bones;
    debugDisplayObjects.skeletonXY.strokeStyle = {
      width: lineWidth,
      color: this.skeletonXYColor,
    };
    for (let i = 0, len = bones.length; i < len; i++) {
      const bone = bones[i];
      const boneLen = bone.data.length;
      const starX = skeletonX + bone.worldX;
      const starY = skeletonY + bone.worldY;
      const endX = skeletonX + boneLen * bone.a + bone.worldX;
      const endY = skeletonY + boneLen * bone.b + bone.worldY;
      if (bone.data.name === 'root' || bone.data.parent === null) {
        continue;
      }
      const w = Math.abs(starX - endX);
      const h = Math.abs(starY - endY);
      const a2 = Math.pow(w, 2);
      const b = h;
      const b2 = Math.pow(h, 2);
      const c = Math.sqrt(a2 + b2);
      const c2 = Math.pow(c, 2);
      const rad = Math.PI / 180;
      const B = Math.acos((c2 + b2 - a2) / (2 * b * c)) || 0;
      if (c === 0) {
        continue;
      }
      const gp = new Graphics();
      debugDisplayObjects.bones.addChild(gp);
      const refRation = c / 50 / scale;
      gp.context
        .poly([0, 0, 0 - refRation, c - refRation * 3, 0, c - refRation, 0 + refRation, c - refRation * 3])
        .fill(this.bonesColor);
      gp.x = starX;
      gp.y = starY;
      gp.pivot.y = c;
      let rotation = 0;
      if (starX < endX && starY < endY) {
        rotation = -B + 180 * rad;
      } else if (starX > endX && starY < endY) {
        rotation = 180 * rad + B;
      } else if (starX > endX && starY > endY) {
        rotation = -B;
      } else if (starX < endX && starY > endY) {
        rotation = B;
      } else if (starY === endY && starX < endX) {
        rotation = 90 * rad;
      } else if (starY === endY && starX > endX) {
        rotation = -90 * rad;
      } else if (starX === endX && starY < endY) {
        rotation = 180 * rad;
      } else if (starX === endX && starY > endY) {
        rotation = 0;
      }
      gp.rotation = rotation;
      gp.circle(0, c, refRation * 1.2)
        .fill({ color: 0, alpha: 0.6 })
        .stroke({ width: lineWidth + refRation / 2.4, color: this.bonesColor });
    }
    const startDotSize = lineWidth * 3;
    debugDisplayObjects.skeletonXY.context
      .moveTo(skeletonX - startDotSize, skeletonY - startDotSize)
      .lineTo(skeletonX + startDotSize, skeletonY + startDotSize)
      .moveTo(skeletonX + startDotSize, skeletonY - startDotSize)
      .lineTo(skeletonX - startDotSize, skeletonY + startDotSize)
      .stroke();
  }
  drawRegionAttachmentsFunc(spine, debugDisplayObjects, lineWidth) {
    const skeleton = spine.skeleton;
    const slots = skeleton.slots;
    for (let i = 0, len = slots.length; i < len; i++) {
      const slot = slots[i];
      const attachment = slot.getAttachment();
      if (attachment === null || !(attachment instanceof RegionAttachment)) {
        continue;
      }
      const regionAttachment = attachment;
      const vertices = new Float32Array(8);
      regionAttachment.computeWorldVertices(slot.bone, vertices, 0, 2);
      debugDisplayObjects.regionAttachmentsShape.poly(Array.from(vertices.slice(0, 8)));
    }
    debugDisplayObjects.regionAttachmentsShape.stroke({
      color: this.regionAttachmentsColor,
      width: lineWidth,
    });
  }
  drawMeshHullAndMeshTriangles(spine, debugDisplayObjects, lineWidth) {
    const skeleton = spine.skeleton;
    const slots = skeleton.slots;
    for (let i = 0, len = slots.length; i < len; i++) {
      const slot = slots[i];
      if (!slot.bone.isActive) {
        continue;
      }
      const attachment = slot.getAttachment();
      if (attachment === null || !(attachment instanceof MeshAttachment)) {
        continue;
      }
      const meshAttachment = attachment;
      const vertices = new Float32Array(meshAttachment.worldVerticesLength);
      const triangles = meshAttachment.triangles;
      let hullLength = meshAttachment.hullLength;
      meshAttachment.computeWorldVertices(slot, 0, meshAttachment.worldVerticesLength, vertices, 0, 2);
      if (this.drawMeshTriangles) {
        for (let i2 = 0, len2 = triangles.length; i2 < len2; i2 += 3) {
          const v1 = triangles[i2] * 2;
          const v2 = triangles[i2 + 1] * 2;
          const v3 = triangles[i2 + 2] * 2;
          debugDisplayObjects.meshTrianglesLine.context
            .moveTo(vertices[v1], vertices[v1 + 1])
            .lineTo(vertices[v2], vertices[v2 + 1])
            .lineTo(vertices[v3], vertices[v3 + 1]);
        }
      }
      if (this.drawMeshHull && hullLength > 0) {
        hullLength = (hullLength >> 1) * 2;
        let lastX = vertices[hullLength - 2];
        let lastY = vertices[hullLength - 1];
        for (let i2 = 0, len2 = hullLength; i2 < len2; i2 += 2) {
          const x = vertices[i2];
          const y = vertices[i2 + 1];
          debugDisplayObjects.meshHullLine.context.moveTo(x, y).lineTo(lastX, lastY);
          lastX = x;
          lastY = y;
        }
      }
    }
    debugDisplayObjects.meshHullLine.stroke({
      width: lineWidth,
      color: this.meshHullColor,
    });
    debugDisplayObjects.meshTrianglesLine.stroke({
      width: lineWidth,
      color: this.meshTrianglesColor,
    });
  }
  drawClippingFunc(spine, debugDisplayObjects, lineWidth) {
    const skeleton = spine.skeleton;
    const slots = skeleton.slots;
    for (let i = 0, len = slots.length; i < len; i++) {
      const slot = slots[i];
      if (!slot.bone.isActive) {
        continue;
      }
      const attachment = slot.getAttachment();
      if (attachment === null || !(attachment instanceof ClippingAttachment)) {
        continue;
      }
      const clippingAttachment = attachment;
      const nn = clippingAttachment.worldVerticesLength;
      const world = new Float32Array(nn);
      clippingAttachment.computeWorldVertices(slot, 0, nn, world, 0, 2);
      debugDisplayObjects.clippingPolygon.poly(Array.from(world));
    }
    debugDisplayObjects.clippingPolygon.stroke({
      width: lineWidth,
      color: this.clippingPolygonColor,
      alpha: 1,
    });
  }
  drawBoundingBoxesFunc(spine, debugDisplayObjects, lineWidth) {
    const bounds = new SkeletonBounds();
    bounds.update(spine.skeleton, true);
    if (bounds.minX !== Infinity) {
      debugDisplayObjects.boundingBoxesRect
        .rect(bounds.minX, bounds.minY, bounds.getWidth(), bounds.getHeight())
        .stroke({ width: lineWidth, color: this.boundingBoxesRectColor });
    }
    const polygons = bounds.polygons;
    const drawPolygon = (polygonVertices, _offset, count) => {
      if (count < 3) {
        throw new Error('Polygon must contain at least 3 vertices');
      }
      const paths = [];
      const dotSize = lineWidth * 2;
      for (let i = 0, len = polygonVertices.length; i < len; i += 2) {
        const x1 = polygonVertices[i];
        const y1 = polygonVertices[i + 1];
        debugDisplayObjects.boundingBoxesCircle.beginFill(this.boundingBoxesCircleColor);
        debugDisplayObjects.boundingBoxesCircle.drawCircle(x1, y1, dotSize);
        debugDisplayObjects.boundingBoxesCircle.fill(0);
        debugDisplayObjects.boundingBoxesCircle.circle(x1, y1, dotSize).fill({ color: this.boundingBoxesCircleColor });
        paths.push(x1, y1);
      }
      debugDisplayObjects.boundingBoxesPolygon
        .poly(paths)
        .fill({
          color: this.boundingBoxesPolygonColor,
          alpha: 0.1,
        })
        .stroke({
          width: lineWidth,
          color: this.boundingBoxesPolygonColor,
        });
    };
    for (let i = 0, len = polygons.length; i < len; i++) {
      const polygon = polygons[i];
      drawPolygon(polygon, 0, polygon.length);
    }
  }
  drawPathsFunc(spine, debugDisplayObjects, lineWidth) {
    const skeleton = spine.skeleton;
    const slots = skeleton.slots;
    for (let i = 0, len = slots.length; i < len; i++) {
      const slot = slots[i];
      if (!slot.bone.isActive) {
        continue;
      }
      const attachment = slot.getAttachment();
      if (attachment === null || !(attachment instanceof PathAttachment)) {
        continue;
      }
      const pathAttachment = attachment;
      let nn = pathAttachment.worldVerticesLength;
      const world = new Float32Array(nn);
      pathAttachment.computeWorldVertices(slot, 0, nn, world, 0, 2);
      let x1 = world[2];
      let y1 = world[3];
      let x2 = 0;
      let y2 = 0;
      if (pathAttachment.closed) {
        const cx1 = world[0];
        const cy1 = world[1];
        const cx2 = world[nn - 2];
        const cy2 = world[nn - 1];
        x2 = world[nn - 4];
        y2 = world[nn - 3];
        debugDisplayObjects.pathsCurve.moveTo(x1, y1);
        debugDisplayObjects.pathsCurve.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        debugDisplayObjects.pathsLine.moveTo(x1, y1);
        debugDisplayObjects.pathsLine.lineTo(cx1, cy1);
        debugDisplayObjects.pathsLine.moveTo(x2, y2);
        debugDisplayObjects.pathsLine.lineTo(cx2, cy2);
      }
      nn -= 4;
      for (let ii = 4; ii < nn; ii += 6) {
        const cx1 = world[ii];
        const cy1 = world[ii + 1];
        const cx2 = world[ii + 2];
        const cy2 = world[ii + 3];
        x2 = world[ii + 4];
        y2 = world[ii + 5];
        debugDisplayObjects.pathsCurve.moveTo(x1, y1);
        debugDisplayObjects.pathsCurve.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        debugDisplayObjects.pathsLine.moveTo(x1, y1);
        debugDisplayObjects.pathsLine.lineTo(cx1, cy1);
        debugDisplayObjects.pathsLine.moveTo(x2, y2);
        debugDisplayObjects.pathsLine.lineTo(cx2, cy2);
        x1 = x2;
        y1 = y2;
      }
    }
    debugDisplayObjects.pathsCurve.stroke({
      width: lineWidth,
      color: this.pathsCurveColor,
    });
    debugDisplayObjects.pathsLine.stroke({
      width: lineWidth,
      color: this.pathsLineColor,
    });
  }
  unregisterSpine(spine) {
    if (!this.registeredSpines.has(spine)) {
      console.warn("SpineDebugRenderer.unregisterSpine() - spine is not registered, can't unregister!", spine);
    }
    const debugDisplayObjects = this.registeredSpines.get(spine);
    if (!debugDisplayObjects) {
      return;
    }
    spine.state.removeListener(debugDisplayObjects.eventCallback);
    debugDisplayObjects.parentDebugContainer.destroy({
      textureSource: true,
      children: true,
      texture: true,
    });
    this.registeredSpines.delete(spine);
  }
}
export default {
  Animation,
  AnimationState,
  AnimationStateAdapter2,
  AnimationStateData,
  AssetManager,
  AtlasAttachmentLoader,
  Attachment,
  AttachmentTimeline,
  BlendMode,
  Bone,
  BoneData,
  BoundingBoxAttachment,
  ClippingAttachment,
  Color,
  ColorTimeline,
  CurveTimeline,
  DebugUtils,
  DeformTimeline,
  DrawOrderTimeline,
  Event,
  EventData,
  EventQueue,
  EventTimeline,
  EventType,
  FakeTexture,
  IkConstraint,
  IkConstraintData,
  IkConstraintTimeline,
  IntSet,
  Interpolation,
  JitterEffect,
  MathUtils,
  MeshAttachment,
  MixDirection,
  MixPose,
  PathAttachment,
  PathConstraint,
  PathConstraintData,
  PathConstraintMixTimeline,
  PathConstraintPositionTimeline,
  PathConstraintSpacingTimeline,
  PointAttachment,
  Pool,
  PositionMode,
  Pow,
  PowOut,
  RegionAttachment,
  RotateMode,
  RotateTimeline,
  ScaleTimeline,
  SharedAssetManager,
  ShearTimeline,
  Skeleton,
  SkeletonBounds,
  SkeletonClipping,
  SkeletonData,
  SkeletonJson,
  Skin,
  Slot,
  SlotData,
  SpacingMode,
  Spine,
  SpineDebugRenderer,
  SpinePipe,
  SpineTexture,
  SwirlEffect,
  Texture,
  TextureAtlas,
  TextureAtlasPage,
  TextureAtlasRegion,
  TextureFilter,
  TextureRegion,
  TextureWrap,
  TimeKeeper,
  TimelineType,
  TrackEntry,
  TransformConstraint,
  TransformConstraintData,
  TransformConstraintTimeline,
  TransformMode,
  TranslateTimeline,
  Triangulator,
  TwoColorTimeline,
  Utils,
  Vector2,
  VertexAttachment,
  WindowedMean,
};
