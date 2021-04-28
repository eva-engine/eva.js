import {Tools, Eventer, BezierEasing, TransformFrames, AnimationManager} from './lottie-core';

import {
  Graphics,
  Container,
  Shader,
  glCore,
  WebGLRenderer,
  ObjectRenderer,
  utils,
  CanvasRenderer,
  BLEND_MODES,
  Matrix,
  Sprite,
  Rectangle,
  Texture,
  settings,
  UPDATE_PRIORITY,
  ticker,
  DisplayObject,
  Application,
} from 'pixi.js';

// import { Graphics } from '@pixi/graphics';

/**
 * Lottie Graphics Mask
 * @private
 */
class LottieGraphicsMask extends Graphics {
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
class PreCompMask extends Graphics {
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
class CompElement extends Container {
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
        const innerDisplay = new Container();
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
class PrimitiveShader extends Shader {
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
    this.buffer = glCore.GLBuffer.createVertexBuffer(gl);

    /**
     * The index buffer
     * @member {WebGLBuffer}
     */
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl);

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

    this.vao = new glCore.VertexArrayObject(gl, attribsState)
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
class LottieGraphicsRenderer extends ObjectRenderer {
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
    ObjectRenderer.prototype.destroy.call(this);

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
    shader.uniforms.color = utils.hex2rgb(graphics.color);
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
      const triangles = utils.earcut(fillVertices, holeIndices, 2);

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

WebGLRenderer.registerPlugin('lottiegraphics', LottieGraphicsRenderer);

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

CanvasRenderer.registerPlugin('lottiegraphics', CanvasLottieGraphicsRenderer);

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
class LottieGraphics extends Container {
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
    this.blendMode = BLEND_MODES.NORMAL;

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
    this.passMatrix = new Matrix();
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
class SolidElement extends Graphics {
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
class SpriteElement extends Sprite {
  /**
   * SpriteElement constructor
   * @param {object} lottieElement lottie element object
   * @param {object} config layer data information
   */
  constructor(lottieElement, config) {
    const {texture, asset} = config;
    super(texture);

    if (texture.baseTexture.hasLoaded) {
      texture.orig = new Rectangle(0, 0, asset.w, asset.h);
      texture._updateUvs();
    } else {
      texture.baseTexture.on('loaded', () => {
        texture.orig = new Rectangle(0, 0, asset.w, asset.h);
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
      const texture = Texture.fromImage(url, '*');
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
  settings,
  UPDATE_PRIORITY,
  animationTicker: ticker.shared,
};

/**
 * replace ticker
 * @private
 * @param {Ticker} _ticker ticker
 */
function useTicker(_ticker) {
  Ticker.animationTicker = _ticker;
}

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
DisplayObject.prototype.setupAnimations = function () {
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
DisplayObject.prototype.animate = function (options, clear) {
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
DisplayObject.prototype.queues = function (runner, options = {}, clear) {
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
DisplayObject.prototype.bodymovin = function (options, clear) {
  if (!this.animations) this.setupAnimations();
  return this.animations.bodymovin(options, clear);
};

/**
 * add some prototype short access symbol
 * @ignore
 */
Object.defineProperties(DisplayObject.prototype, {
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
Container.prototype.updateTransform = function () {
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
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;

/**
 * `lottie-pixi` 中使用 `lottie动画` 功能有两种方式:
 * - 你可以通过 `loadAnimation` 一键创建渲染引擎、动画管理器、lottie动画实例。
 * - 你也可以在你想要的时机单独创建它们。
 *
 * 一键创建
 * ```javascript
 * import { loadAnimation } from '@ali/lottie-pixi';
 *
 * const animation = loadAnimation({
 *   view: '#load-animation',
 *   path: 'http://image.uc.cn/s/uae/g/01/lottieperformance/webglcanvas/game-preview/data.json',
 * });
 * ```
 *
 * 自由创建
 * ```javascript
 * import { Application } from '@pixi/app'; // pixi v5 import
 * // import { Application } from 'pixi.js'; // pixi v4 import
 * import { AnimationManager } from '@ali/lottie-pixi';
 * import data from './animations/data.js';
 *
 * // create pixi Application in some where
 * const app = new Application({
 *   view: document.getElementById('demo-canvas'), // canvas dom
 *   width: window.innerWidth,
 *   height: window.innerHeight,
 *   transparent: true,
 *   antialias: true,
 * });
 *
 * // just need single instance, one app one animationManager.
 * const animationManager = new AnimationManager(app);
 *
 * // parse one or more anims
 * const anim = animationManager.parseAnimation({
 *   keyframes: data,
 *   // infinite: true,
 *   // ...
 * });
 *
 * // addChild anim.group
 * app.stage.addChild(anim.group);
 * ```
 * 如果你的项目本身已经有 `PIXI` 的内容，自由创建的方式会更适合你。
 * @namespace LottieAnimation
 */

/**
 * animate application
 * @alias AnimateApplication
 * @memberof LottieAnimation
 * @extends Eventer
 */
class AnimateApplication extends Eventer {
  /**
   * require lottie animation setting, post from loadAnimation
   * @param {object} options lottie animation setting
   */
  constructor(options) {
    super();

    /**
     * lottie 动画对象
     * @member {AnimationGroup}
     */
    this.animate = null;

    if (
      options.keyframes &&
      options.useAESize &&
      (options.width !== options.keyframes.w || options.height !== options.keyframes.h)
    ) {
      options.width = options.keyframes.w;
      options.height = options.keyframes.h;
    }
    const {
      view,
      width,
      height,
      transparent,
      antialias,
      preserveDrawingBuffer,
      resolution,
      forceCanvas,
      backgroundColor,
      clearBeforeRender,
      roundPixels,
      forceFXAA,
      legacy,
      powerPreference,
      sharedTicker,
      sharedLoader,
    } = options;

    /**
     * pixi application 对象，管理渲染事项
     * @member {PIXI.Application}
     */
    this.app = new Application({
      view,
      width,
      height,
      transparent,
      antialias,
      preserveDrawingBuffer,
      resolution,
      forceCanvas,
      backgroundColor,
      clearBeforeRender,
      roundPixels,
      forceFXAA,
      legacy,
      powerPreference,
      sharedTicker,
      sharedLoader,
    });

    /**
     * 管理 lottie 动画的对象，负责管理所有 lottie 动画的更新、生命周期
     * @member {PIXI.Application}
     */
    this.manager = new AnimationManager(this.app);

    /**
     * 动画是否完全加载完毕
     * @member {boolean}
     */
    this.loaded = false;

    this.parseData(options);
  }

  /**
   * resize with ae size
   * @private
   */
  resizeWithAESize() {
    const {width, height} = this.app.renderer;
    if (width !== this.animate.keyframes.w || height !== this.animate.keyframes.h) {
      this.app.renderer.resize(this.animate.keyframes.w, this.animate.keyframes.h);
    }
  }

  /**
   * 解析动画数据
   * @private
   * @param {*} options a
   */
  parseData(options) {
    this.animate = this.manager.parseAnimation(options);

    if (this.animate.isDisplayLoaded) {
      if (options.useAESize) this.resizeWithAESize();
      this.app.stage.addChild(this.animate.group);
    } else {
      this.animate.once('DisplayReady', () => {
        if (options.useAESize) this.resizeWithAESize();
        this.app.stage.addChild(this.animate.group);
        this.emit('DisplayReady', this);
      });
    }

    if (this.animate.isImagesLoaded) {
      this.loaded = true;
    } else {
      this.animate.once('success', () => {
        this.loaded = true;
        this.emit('success', this);
      });

      this.animate.once('error', error => {
        this.emit('error', error);
      });
    }
  }
}

/**
 * parser a bodymovin data, and post some config for this animation group
 * @alias loadAnimation
 * @memberof LottieAnimation
 * @param {object} options lottie animation setting
 * @param {HTMLCanvasElement} options.view pixi Application canvas
 * @param {number} options.width pixi Application canvas width, usually use data.w
 * @param {number} options.height pixi Application canvas width, usually use data.h
 * @param {boolean} [options.useAESize=true] - If the render view is transparent, default false
 * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
 * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
 * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
 *  need to call toDataUrl on the webgl context
 * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
 * @param {boolean} [options.forceCanvas=false] - prevents selection of WebGL renderer, even if such is present
 * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
 *  (shown if not transparent).
 * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
 *   not before the new render pass.
 * @param {boolean} [options.roundPixels=false] - If true PixiJS will Math.floor() x/y values when rendering,
 *  stopping pixel interpolation.
 * @param {boolean} [options.forceFXAA=false] - forces FXAA antialiasing to be used over native.
 *  FXAA is faster, but may not always look as great **webgl only**
 * @param {boolean} [options.legacy=false] - `true` to ensure compatibility with older / less advanced devices.
 *  If you experience unexplained flickering try setting this to true. **webgl only**
 * @param {string} [options.powerPreference] - Parameter passed to webgl context, set to "high-performance"
 *  for devices with dual graphics card **webgl only**
 * @param {boolean} [options.sharedTicker=false] - `true` to use PIXI.ticker.shared, `false` to create new ticker.
 * @param {boolean} [options.sharedLoader=false] - `true` to use PIXI.loaders.shared, `false` to create new Loader.
 *
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
 * @return {AnimateApplication} return {@link AnimateApplication} instance
 */
function loadAnimation(options) {
  // compatible with lottie-web api
  if (options.container && !options.view) {
    options.view = options.container;
  }
  if (options.animationData && !options.keyframes) {
    options.keyframes = options.animationData;
  }
  if (options.assetsPath && !options.prefix) {
    options.prefix = options.assetsPath.replace(/images\/?$/, '');
  }
  if (options.initialSegment && !options.initSegment) {
    options.initSegment = options.initialSegment;
  }
  if (Tools.isBoolean(options.autoplay) && !Tools.isBoolean(options.autoStart)) {
    options.autoStart = options.autoplay;
  }
  if (Tools.isBoolean(options.loop) && !Tools.isBoolean(options.infinite)) {
    options.infinite = options.loop;
  }

  options.view = Tools.isString(options.view) ? document.querySelector(options.view) : options.view;
  options.useAESize = Tools.isBoolean(options.useAESize) ? options.useAESize : true;

  const animateApplication = new AnimateApplication(options);

  return animateApplication;
}

export {Tween, loadAnimation, useTicker, CompElement, PathLottie, SolidElement, SpriteElement, Container, LoadJson, LoadTexture};
export {
  AnimationGroup,
  AnimationManager,
  BezierEasing,
  DisplayRegister,
  Eventer,
  LoaderRegister,
  PropertyFactory,
  Tools,
  TransformFrames,
  TransformProperty,
} from './lottie-core';
//# sourceMappingURL=index.module.js.map
