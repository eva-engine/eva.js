import {
  BezierEasing,
  Tools,
  Eventer,
  DataManager,
  FontManager,
  CompLottieLayer,
  SolidLottieLayer,
  SpriteLottieLayer,
  NullLottieLayer,
  ShapeLottieLayer,
  TextLottieLayer,
  CameraLottieLayer,
  CameraNullLottieLayer,
} from './lottie-core';
export {
  BezierEasing,
  CompLottieLayer,
  DataManager,
  DynamicPropertyContainer,
  Eventer,
  MaskFrames,
  Matrix4,
  NullLottieLayer,
  PropertyFactory,
  ShapeLottieLayer,
  ShapesFrames,
  SolidLottieLayer,
  SpriteLottieLayer,
  Tools,
  TransformFrames,
} from './lottie-core';
import { Ticker, Graphics, Container, Matrix, Text, Assets, Sprite, Texture, Application } from 'pixi.js';

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

const _Ticker = {
  animationTicker: Ticker.shared,
};

/**
 * replace ticker
 * @private
 * @param {Ticker} _ticker ticker
 */
function addHandleToTicker(_ticker) {
  Ticker.animationTicker = _ticker;
}

/**
 * replace ticker
 * @private
 * @param {Ticker} _ticker ticker
 */
function useTicker(_ticker) {
  Ticker.animationTicker = _ticker;
}

const p = n => (n > 0 ? n : 0);

/**
 * Lottie Graphics Mask
 * @private
 */
class LottieGraphicsMask extends Graphics {
  /**
   * a
   * @param {*} parentCompBox a
   */
  constructor(parentCompBox, config) {
    super();
    this.parentCompBox = parentCompBox;
    this.config = config;
    this.setStrokeStyle({
      width: 0,
    });
  }

  /**
   * a
   * @param {*} masks a
   */
  updateMasks(masks) {
    this.clear();
    for (let i = 0; i < masks.viewData.length; i++) {
      if (masks.viewData[i]?.data?.mode === 's') {
        const size = this.config.session.local;
        this.rect(0, 0, size.w, size.h);
        this.fill({ color: 0x000000 });
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
        this.bezierCurveTo(p(oj[0]), p(oj[1]), p(ij[0]), p(ij[1]), p(vj[0]), p(vj[1]));
      }
      const oj = data.o[j - 1];
      const ij = data.i[0];
      const vj = data.v[0];
      this.bezierCurveTo(p(oj[0]), p(oj[1]), p(ij[0]), p(ij[1]), p(vj[0]), p(vj[1]));

      if (masks.viewData[i]?.data?.mode === 's') {
        this.cut();
      }
    }
    this.fill({ color: 0x000000 });
  }
}

const updateTransformByHierarchy = (container, transform, parent) => {
  // const localMatrixA = new Matrix();

  if (transform.p) {
    container.x = transform.p.v[0];
    container.y = transform.p.v[1];
  } else {
    container.x = transform.px.v;
    container.y = transform.py.v;
  }

  container.pivot.x = transform.a.v[0];
  container.pivot.y = transform.a.v[1];

  container.scale.x = transform.s.v[0];
  container.scale.y = transform.s.v[1];

  if (transform.r) {
    container.rotation = transform.r.v + transform.orientation;
  } else if (transform.rz) {
    container.rotation = transform.rz.v + transform.or.v[2];
  }

  // let x = transform.p ? transform.p.v[0] : transform.px.v;
  // let y = transform.p ? transform.p.v[1] : transform.py.v;

  // const rotation = transform.r
  //   ? transform.r.v + transform.orientation
  //   : transform.rz
  //   ? transform.rz.v + transform.or.v[2]
  //   : 0;

  // localMatrixA.setTransform(
  //   x,
  //   y,
  //   transform.a.v[0],
  //   transform.a.v[1],
  //   transform.s.v[0],
  //   transform.s.v[1],
  //   rotation,
  //   0,
  //   0
  // );

  // if (parent) {
  //   const parentWorldTransform = parent.worldTransform.clone();
  //   container.setFromMatrix(localMatrixA.append(parentWorldTransform));
  // } else {
  //   container.setFromMatrix(localMatrixA);
  // }

  const parentAlpha = parent ? parent.alpha : 1;
  container.alpha = parentAlpha * transform.o.v;
};

/**
 * NullElement class
 * @class
 * @private
 */
class CompElement extends Container {
  /**
   * NullElement constructor
   * @param {object} elem layer data information
   * @param {object} config layer data information
   */
  constructor(lottieLayer, isRoot) {
    super();
    this.label = lottieLayer.fullname;
    this.lottieLayer = lottieLayer;

    if (!isRoot) {
      if (this.lottieLayer.masks) {
        this.mask = new LottieGraphicsMask(this.lottieLayer.session.local, this.lottieLayer);
        this.addChild(this.mask);
      }

      this.updateLottie = this.updateLottie.bind(this);
      this.updateLottie(this.lottieLayer, true);
      this.lottieLayer.on('updatelayer', this.updateLottie);
    }
    this.onRender = () => {
      this.updateLottie(this.lottieLayer, true);
    };
  }

  /**
   * a
   * @param {*} parent a
   */
  setTransformHierarchy(parent) {
    this.hierarchy = parent;
  }

  updateLottie(lottieLayer, _forceUpdate = false) {
    let forceUpdate = true;
    if (lottieLayer.transform && forceUpdate) this.updateLottieTransform(lottieLayer.transform);
    if (lottieLayer.masks && forceUpdate) this.updateLottieMasks(lottieLayer.masks);
    this.visible = lottieLayer.isInRange;
    this._onUpdate();
  }

  updateLottieTransform(transform) {
    updateTransformByHierarchy(this, transform, this.hierarchy);
  }

  /**
   * a
   * @param {*} masks a
   */
  updateLottieMasks(masks) {
    this.mask.updateMasks(masks);
  }
}

/**
 * PathPrimitive class
 * @class
 * @private
 */
class PathPrimitive extends Graphics {
  /**
   * PathPrimitive constructor
   * @param {object} primitive lottie element object
   */
  constructor(primitive) {
    super();
    this.passMatrix = new Matrix();
    this.primitive = primitive;
    this._lineStyle = {};
  }

  /**
   * a
   */
  setShapeTransform() {
    const trProps = this.primitive.preTransforms.finalTransform.props;
    this.passMatrix.set(trProps[0], trProps[1], trProps[4], trProps[5], trProps[12], trProps[13]);
    this.setFromMatrix(this.passMatrix);
  }

  /**
   * Updates the object transform for rendering
   */
  updateTransform() {
    this.setShapeTransform();
    this._onUpdate();
  }

  /**
   * a
   */
  updateLottiePrimitive() {
    this.updateTransform();
    const style = this.primitive;
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
        this._lineStyle.lineDash = style.da;
        this._lineStyle.lineDashOffset = style.do;
      } else {
        this._lineStyle.lineDash = [];
      }
    }

    if (type === 'st' || type === 'gs') {
      this._lineStyle.width = style.wi;
      this._lineStyle.cap = style.lc;
      this._lineStyle.join = style.lj;
      this._lineStyle.alpha = style.coOp;
      this._lineStyle.miterLimit = style.ml || 0;
      this.color = Tools.rgb2hex(style.co || style.grd);
      this.alpha = style.coOp;
      this._lineStyle.color = this.color;
      this.setStrokeStyle(this._lineStyle).stroke();
    } else {
      this.color = Tools.rgb2hex(style.co || style.grd);
      this.alpha = style.coOp;
      this.fill({ color: this.color, alpha: this.alpha });
    }
  }
}

/**
 * NullElement class
 * @class
 * @private
 */
class ShapeElement extends Graphics {
  /**
   * ShapeElement constructor
   */
  constructor(lottieLayer) {
    super();
    this.label = lottieLayer.fullname;
    this.lottieLayer = lottieLayer;
    if (this.lottieLayer.masks) {
      this.mask = new LottieGraphicsMask(this.lottieLayer.session.local, this.lottieLayer);
      this.addChild(this.mask);
    }

    this.lottiePrimitives = [];
    this.shipPrimitives();

    this.updateLottie = this.updateLottie.bind(this);
    this.updateLottie(this.lottieLayer, true);
    this.lottieLayer.on('updatelayer', this.updateLottie);
    this.onRender = () => {
      this.updateLottie(this.lottieLayer, true);
    };
  }

  shipPrimitives() {
    const primitives = this.lottieLayer.getPrimitives();
    this.lottiePrimitives = primitives.map(primitive => {
      const displayPrimitive = new PathPrimitive(primitive);
      this.addChild(displayPrimitive);
      return displayPrimitive;
    });
  }

  /**
   * update lottie information
   * @param {*} lottieLayer lottie element object
   * @param {boolean} forceUpdate forceUpdate
   */
  updateLottie(lottieLayer, _forceUpdate = false) {
    let forceUpdate = true;
    if (lottieLayer.transform && forceUpdate) this.updateLottieTransform(lottieLayer.transform);
    if (lottieLayer.masks && forceUpdate) this.updateLottieMasks(lottieLayer.masks);
    if (lottieLayer.shapes && forceUpdate) this.updateLottiePrimitives();
    this.visible = lottieLayer.isInRange;
    this._onUpdate();
  }

  /**
   * a
   * @param {*} parent a
   */
  setTransformHierarchy(parent) {
    this.hierarchy = parent;
  }

  /**
   * a
   * @param {*} transform
   */
  updateLottieTransform(transform) {
    updateTransformByHierarchy(this, transform, this.hierarchy);
  }

  /**
   * a
   * @param {*} masks a
   */
  updateLottieMasks(masks) {
    this.mask.updateMasks(masks);
  }

  /**
   * a
   */
  updateLottiePrimitives() {
    for (let i = 0; i < this.lottiePrimitives.length; i++) {
      // TODO: 应该每个图形都确认一下是否有变更，有变更的才跟新几何数据
      this.lottiePrimitives[i].updateLottiePrimitive();
    }
  }
}

function createSizedArray(len) {
  return Array.apply(null, { length: len });
}

/**
 * NullElement class
 * @class
 * @private
 */
class TextElement extends Text {
  /**
   * ShapeElement constructor
   */
  constructor(lottieLayer) {
    super();
    this.label = lottieLayer.fullname;
    this.lottieLayer = lottieLayer;
    this.lottieLayer.lettersChangedFlag = true;
    if (this.lottieLayer.masks) {
      this.mask = new LottieGraphicsMask(this.lottieLayer.session.local, this.lottieLayer);
      this.addChild(this.mask);
    }

    this.init();
    this.buildNewText();
    this.updateLottie = this.updateLottie.bind(this);
    this.updateLottie(this.lottieLayer, true);
    this.lottieLayer.on('updatelayer', this.updateLottie);
    this.onRender = () => {
      this.updateLottie(this.lottieLayer, true);
    };
  }

  init() {
    this._textSpans = [];
    this._yOffset = 0;
    this._fillColorAnim = false;
    this._strokeColorAnim = false;
    this._strokeWidthAnim = false;
    this._stroke = false;
    this._fill = false;
    this._justifyOffset = 0;
    this._currentRender = null;
    this._renderType = 'canvas';
    this._fillStyle = {};
    this._values = {
      fill: '#000000',
      stroke: '#000000',
      sWidth: 0,
      fValue: '',
    };
  }

  buildNewText() {
    const documentData = this.lottieLayer.textProperty.currentData;
    this.renderedLetters = createSizedArray(documentData.l ? documentData.l.length : 0);
    let hasFill = false;
    if (documentData.fc) {
      hasFill = true;
      this._values.fill = Tools.rgb2hex(
        documentData.fc.map(item => {
          return item > 1 ? item : item * 255;
        }),
        documentData.fc,
      );
    } else {
      this._values.fill = '#000000';
    }
    this._fill = hasFill;
    let hasStroke = false;
    if (documentData.sc) {
      hasStroke = true;
      this._values.stroke = this.buildColor(documentData.sc);
      this._values.sWidth = documentData.sw;
    }
    const fontManager = this.lottieLayer.global.fontManager;
    this._stroke = hasStroke;
    this._values.fontSize = documentData.finalSize;
    this._values.fontFamily = fontManager.getFontByName(documentData.f).fFamily;
    this._values.fontWeight = documentData.fWeight;
    this._values.fontStyle = documentData.fStyle;
    this._values.lineHeight = documentData.finalLineHeight;
    this._text = documentData.t;

    this.renderText();
  }

  async renderText() {
    this.text = this._text;
    if (this.style.fontFamily) {
      await Assets.get(this.style.fontFamily);
    }
    this.style.fontFamily = this._values.fontFamily;
    this.style.fontSize = this._values.fontSize;
    this.style.fill = this._values.fill;
    this.style.fontWeight = this._values.fontWeight;
    this.style.fontStyle = this._values.fontStyle;
    this.style.lineHeight = this._values.lineHeight;

    this.anchor.x = 0.5;
    this.anchor.y = 0.8;
  }

  /**
   * update lottie information
   * @param {*} lottieLayer lottie element object
   * @param {boolean} forceUpdate forceUpdate
   */
  updateLottie(lottieLayer, _forceUpdate = false) {
    let forceUpdate = true;
    if (lottieLayer.transform && forceUpdate) {
      this.updateLottieTransform(lottieLayer.transform);
    }
    if (lottieLayer.masks && forceUpdate) {
      this.updateLottieMasks(lottieLayer.masks);
    }
    if (lottieLayer._mdf) {
      this.renderText();
    }
    this.visible = lottieLayer.isInRange;
    this._onUpdate();
  }

  /**
   * a
   * @param {*} parent a
   */
  setTransformHierarchy(parent) {
    this.hierarchy = parent;
  }

  /**
   * a
   * @param {*} transform
   */
  updateLottieTransform(transform) {
    updateTransformByHierarchy(this, transform, this.hierarchy);
  }

  /**
   * a
   * @param {*} masks a
   */
  updateLottieMasks(masks) {
    this.mask.updateMasks(masks);
  }
}

function createSizedArray$1(len) {
  return Array.apply(null, { length: len });
}

class MatrixHelper extends Matrix {
  reset() {
    // 重置为单位矩阵
    this.a = 1; // x 缩放
    this.b = 0; // y 倾斜
    this.c = 0; // x 倾斜
    this.d = 1; // y 缩放
    this.tx = 0; // x 平移
    this.ty = 0; // y 平移
    return this;
  }

  /**
   * 只计算变换后的 X 坐标
   * 基于矩阵变换公式：x' = x * a + y * c + tx
   * @param {number} x - 原始 X 坐标
   * @param {number} y - 原始 Y 坐标
   * @param {number} z - 原始 Z 坐标 (对于 2D 变换通常为 0)
   * @returns {number} 变换后的 X 坐标
   */
  applyToX(x, y, z = 0) {
    return x * this.a + y * this.c + this.tx;
  }

  /**
   * 只计算变换后的 Y 坐标
   * 基于矩阵变换公式：y' = x * b + y * d + ty
   * @param {number} x - 原始 X 坐标
   * @param {number} y - 原始 Y 坐标
   * @param {number} z - 原始 Z 坐标 (对于 2D 变换通常为 0)
   * @returns {number} 变换后的 Y 坐标
   */
  applyToY(x, y, z = 0) {
    return x * this.b + y * this.d + this.ty;
  }

  /**
   * 计算变换后的 Z 坐标（对于 2D 矩阵，这通常返回原始的 z 值）
   * 这个方法主要是为了与您的原始代码保持一致性
   * @param {number} x - 原始 X 坐标
   * @param {number} y - 原始 Y 坐标
   * @param {number} z - 原始 Z 坐标
   * @returns {number} Z 坐标（对于 2D 变换通常不变）
   */
  applyToZ(x, y, z = 0) {
    // 对于 2D 矩阵，Z 坐标通常不变
    return z;
  }

  /**
   * 批量变换多个点的 X 坐标
   * @param {Array<{x: number, y: number}>} points - 点数组
   * @returns {Array<number>} 变换后的 X 坐标数组
   */
  applyToXArray(points) {
    return points.map(point => this.applyToX(point.x, point.y));
  }

  /**
   * 批量变换多个点的 Y 坐标
   * @param {Array<{x: number, y: number}>} points - 点数组
   * @returns {Array<number>} 变换后的 Y 坐标数组
   */
  applyToYArray(points) {
    return points.map(point => this.applyToY(point.x, point.y));
  }
}

/**
 * NullElement class
 * @class
 * @private
 */
class TextGlyphsElement extends Graphics {
  /**
   * ShapeElement constructor
   */
  constructor(lottieLayer) {
    super();
    this.label = lottieLayer.fullname;
    this.lottieLayer = lottieLayer;
    this.lottieLayer.lettersChangedFlag = true;
    if (this.lottieLayer.masks) {
      this.mask = new LottieGraphicsMask(this.lottieLayer.session.local, this.lottieLayer);
      this.addChild(this.mask);
    }

    this.init();
    this.buildNewText();
    this.updateLottie = this.updateLottie.bind(this);
    this.updateLottie(this.lottieLayer, true);
    this.lottieLayer.on('updatelayer', this.updateLottie);
    this.onRender = () => {
      this.updateLottie(this.lottieLayer, true);
    };
  }

  init() {
    this._textSpans = [];
    this._yOffset = 0;
    this._fillColorAnim = false;
    this._strokeColorAnim = false;
    this._strokeWidthAnim = false;
    this._stroke = false;
    this._fill = false;
    this._justifyOffset = 0;
    this._currentRender = null;
    this._renderType = 'canvas';
    this._fillStyle = {};
    this._values = {
      fill: '#000000',
      stroke: '#000000',
      sWidth: 0,
      fValue: '',
    };
  }

  buildNewText() {
    const documentData = this.lottieLayer.textProperty.currentData;
    this.renderedLetters = createSizedArray$1(documentData.l ? documentData.l.length : 0);
    let hasFill = false;
    if (documentData.fc) {
      hasFill = true;
      this._values.fill = Tools.rgb2hex(
        documentData.fc.map(item => {
          return item > 1 ? item : item * 255;
        }),
        documentData.fc,
      );
    } else {
      this._values.fill = '#000000';
    }
    this._fill = hasFill;
    let hasStroke = false;
    if (documentData.sc) {
      hasStroke = true;
      this._values.stroke = this.buildColor(documentData.sc);
      this._values.sWidth = documentData.sw;
    }
    const fontManager = this.lottieLayer.global.fontManager;
    let fontData = fontManager.getFontByName(documentData.f);
    let i;
    let len;
    let letters = documentData.l;
    let matrixHelper = new MatrixHelper();
    this._stroke = hasStroke;
    this._values.fValue = documentData.finalSize + 'px ' + fontManager.getFontByName(documentData.f).fFamily;
    len = documentData.finalText.length;
    let charData;
    let shapeData;
    let k;
    let kLen;
    let shapes;
    let j;
    let jLen;
    let pathNodes;
    let commands;
    let pathArr;
    let singleShape = this.lottieLayer.data.singleShape;
    // let singleShape = false;
    let trackingOffset = documentData.tr * 0.001 * documentData.finalSize;
    let xPos = 0;
    let yPos = 0;
    let firstLine = true;
    let cnt = 0;

    for (i = 0; i < len; i += 1) {
      charData = fontManager.getCharData(
        documentData.finalText[i],
        fontData.fStyle,
        fontManager.getFontByName(documentData.f).fFamily,
      );
      shapeData = (charData && charData.data) || {};
      matrixHelper.reset();
      if (singleShape && letters[i].n) {
        xPos = -trackingOffset;
        yPos += documentData.yOffset;
        yPos += firstLine ? 1 : 0;
        firstLine = false;
      }
      shapes = shapeData.shapes ? shapeData.shapes[0].it : [];
      jLen = shapes.length;
      matrixHelper.scale(documentData.finalSize / 100, documentData.finalSize / 100);
      commands = createSizedArray$1(jLen - 1);
      let commandsCounter = 0;
      for (j = 0; j < jLen; j += 1) {
        if (shapes[j].ty === 'sh') {
          kLen = shapes[j].ks.k.i.length;
          pathNodes = shapes[j].ks.k;
          pathArr = [];
          for (k = 1; k < kLen; k += 1) {
            if (k === 1) {
              pathArr.push(
                matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0),
                matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0),
              );
            }
            pathArr.push(
              matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0),
              matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0),
              matrixHelper.applyToX(pathNodes.i[k][0], pathNodes.i[k][1], 0),
              matrixHelper.applyToY(pathNodes.i[k][0], pathNodes.i[k][1], 0),
              matrixHelper.applyToX(pathNodes.v[k][0], pathNodes.v[k][1], 0),
              matrixHelper.applyToY(pathNodes.v[k][0], pathNodes.v[k][1], 0),
            );
          }
          pathArr.push(
            matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0),
            matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0),
            matrixHelper.applyToX(pathNodes.i[0][0], pathNodes.i[0][1], 0),
            matrixHelper.applyToY(pathNodes.i[0][0], pathNodes.i[0][1], 0),
            matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0),
            matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0),
          );
          commands[commandsCounter] = pathArr;
          commandsCounter += 1;
        }
      }
      if (singleShape) {
        xPos += letters[i].l;
        xPos += trackingOffset;
      }
      if (this._textSpans[cnt]) {
        this._textSpans[cnt].elem = commands;
      } else {
        this._textSpans[cnt] = { elem: commands };
      }
      cnt += 1;
    }
    this.renderText();
  }

  renderText() {
    this.lottieLayer.textAnimator.getMeasures(
      this.lottieLayer.textProperty.currentData,
      this.lottieLayer.lettersChangedFlag,
    );

    let i;
    let len;
    let j;
    let jLen;
    let k;
    let kLen;
    let renderedLetters = this.lottieLayer.textAnimator.renderedLetters;

    let letters = this.lottieLayer.textProperty.currentData.l;

    len = letters.length;
    var renderedLetter;
    var lastFill = null;
    var lastStroke = null;
    var lastStrokeW = null;
    var commands;
    var pathArr;
    let alpha = 1;

    this.clear();
    for (i = 0; i < len; i += 1) {
      if (!letters[i].n) {
        renderedLetter = renderedLetters[i];
        if (renderedLetter) {
          this.save();
          const p = renderedLetter.p;
          const matrix = new Matrix(p[0], p[1], p[4], p[5], p[12], p[13]);

          this.setTransform(matrix);
        }
        if (this._fill) {
          this._fillStyle.alpha = alpha;
          if (renderedLetter && renderedLetter.fc) {
            if (lastFill !== renderedLetter.fc) {
              // renderer.ctxFillStyle(renderedLetter.fc);
              lastFill = Tools.rgb2hex(renderedLetter.fc);
              this._fillStyle.color = Tools.rgb2hex(renderedLetter.fc);
            }
          } else if (lastFill !== this._values.fill) {
            lastFill = this._values.fill;
            this._fillStyle.color = this._values.fill;
          } else {
            this._fillStyle.color = this._values.fill;
          }
          commands = this._textSpans[i].elem;
          jLen = commands.length;
          this.beginPath();
          for (j = 0; j < jLen; j += 1) {
            pathArr = commands[j];
            kLen = pathArr.length;
            this.moveTo(pathArr[0], pathArr[1]);
            for (k = 2; k < kLen; k += 6) {
              this.bezierCurveTo(
                pathArr[k],
                pathArr[k + 1],
                pathArr[k + 2],
                pathArr[k + 3],
                pathArr[k + 4],
                pathArr[k + 5],
              );
            }
            this.closePath();
            this.setFillStyle(this._fillStyle);

            const point = {
              x: pathArr[0],
              y: pathArr[1],
            };

            const matrix = this.getTransform();
            if (this.containsPoint(matrix.apply(point))) {
              this.cut();
            } else {
              this.stroke({ alpha: 0 });
              this.fill();
            }
          }
        }

        if (this._stroke) {
          this.strokeStyle.alpha = alpha;
          if (renderedLetter && renderedLetter.sw) {
            if (lastStrokeW !== renderedLetter.sw) {
              lastStrokeW = renderedLetter.sw;
              this.strokeStyle.pixelLine = renderedLetter.sw;
            }
          } else if (lastStrokeW !== this._values.sWidth) {
            lastStrokeW = this._values.sWidth;
            this.strokeStyle.pixelLine = this._values.sWidth;
          }
          if (renderedLetter && renderedLetter.sc) {
            if (lastStroke !== renderedLetter.sc) {
              lastStroke = renderedLetter.sc;
              this.strokeStyle.color = renderedLetter.sc;
            }
          } else if (lastStroke !== this._values.stroke) {
            lastStroke = this._values.stroke;
            this.strokeStyle.color = this._values.stroke;
          }
          commands = this._textSpans[i].elem;
          jLen = commands.length;
          this.beginPath();
          for (j = 0; j < jLen; j += 1) {
            pathArr = commands[j];
            kLen = pathArr.length;
            this.moveTo(pathArr[0], pathArr[1]);
            for (k = 2; k < kLen; k += 6) {
              this.bezierCurveTo(
                pathArr[k],
                pathArr[k + 1],
                pathArr[k + 2],
                pathArr[k + 3],
                pathArr[k + 4],
                pathArr[k + 5],
              );
            }
          }
          this.closePath();
          this.stroke();
        }
        if (renderedLetter) {
          this.restore();
        }
      }
    }
  }

  /**
   * update lottie information
   * @param {*} lottieLayer lottie element object
   * @param {boolean} forceUpdate forceUpdate
   */
  updateLottie(lottieLayer, _forceUpdate = false) {
    let forceUpdate = true;
    if (lottieLayer.transform && forceUpdate) {
      this.updateLottieTransform(lottieLayer.transform);
    }
    if (lottieLayer.masks && forceUpdate) {
      this.updateLottieMasks(lottieLayer.masks);
    }
    if (lottieLayer._mdf) {
      this.renderText();
    }
    this.visible = lottieLayer.isInRange;
    this._onUpdate();
  }

  /**
   * a
   * @param {*} parent a
   */
  setTransformHierarchy(parent) {
    this.hierarchy = parent;
  }

  /**
   * a
   * @param {*} transform
   */
  updateLottieTransform(transform) {
    updateTransformByHierarchy(this, transform, this.hierarchy);
  }

  /**
   * a
   * @param {*} masks a
   */
  updateLottieMasks(masks) {
    this.mask.updateMasks(masks);
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
   * @param {object} lottieLayer lottie element object
   */
  constructor(lottieLayer) {
    super();
    this.label = lottieLayer.fullname;
    this.lottieLayer = lottieLayer;

    const hex = parseInt(this.lottieLayer.color.replace('#', ''), 16);
    this.rect(0, 0, this.lottieLayer.width, this.lottieLayer.height).fill(hex);

    if (this.lottieLayer.masks) {
      this.mask = new LottieGraphicsMask(this.lottieLayer.session.local, this.lottieLayer);
      this.addChild(this.mask);
    }

    this.updateLottie = this.updateLottie.bind(this);
    this.updateLottie(this.lottieLayer, true);
    this.lottieLayer.on('updatelayer', this.updateLottie);
  }

  /**
   * update lottie information
   * @param {*} lottieLayer lottie element object
   * @param {boolean} forceUpdate forceUpdate
   */
  updateLottie(lottieLayer, _forceUpdate = false) {
    let forceUpdate = true;
    if (lottieLayer.transform && forceUpdate) this.updateLottieTransform(lottieLayer.transform);
    if (lottieLayer.masks && forceUpdate) this.updateLottieMasks(lottieLayer.masks);
    this.visible = lottieLayer.isInRange;
    this._onUpdate();
  }

  /**
   * a
   * @param {*} parent a
   */
  setTransformHierarchy(parent) {
    this.hierarchy = parent;
  }

  /**
   * a
   * @param {*} transform
   */
  updateLottieTransform(transform) {
    updateTransformByHierarchy(this, transform, this.hierarchy);
  }

  /**
   * a
   * @param {*} masks a
   */
  updateLottieMasks(masks) {
    this.mask.updateMasks(masks);
  }
}

/**
 * SpriteElement class
 * @class
 * @private
 */
class SpriteElement extends Sprite {
  /**
   * NullElement constructor
   * @param {object} elem layer data information
   * @param {object} config layer data information
   */
  constructor(lottieLayer, imageInfo) {
    const { texture: texturePromise } = imageInfo;
    super();
    this.label = lottieLayer.fullname;

    texturePromise
      .then(texture => {
        this.texture = texture;
      })
      .catch(e => {
        console.error(e);
      });

    this.lottieLayer = lottieLayer;

    if (this.lottieLayer.masks) {
      this.mask = new LottieGraphicsMask(this.lottieLayer.session.local, this.lottieLayer);
      this.addChild(this.mask);
    }

    this.updateLottie = this.updateLottie.bind(this);
    this.updateLottie(this.lottieLayer, true);
    this.lottieLayer.on('updatelayer', this.updateLottie);
  }

  /**
   * update lottie information
   * @param {*} lottieLayer lottie element object
   * @param {boolean} forceUpdate forceUpdate
   */
  updateLottie(lottieLayer, _forceUpdate = false) {
    let forceUpdate = true;
    if (lottieLayer.transform && forceUpdate) this.updateLottieTransform(lottieLayer.transform);
    if (lottieLayer.masks && forceUpdate) this.updateLottieMasks(lottieLayer.masks);
    // this.visible = lottieLayer.isInRange;
    this.visible = lottieLayer.isInRange;
    this._onUpdate();
  }

  /**
   * a
   * @param {*} parent a
   */
  setTransformHierarchy(parent) {
    this.hierarchy = parent;
  }

  /**
   * a
   * @param {*} transform
   */
  updateLottieTransform(transform) {
    updateTransformByHierarchy(this, transform, this.hierarchy);
  }

  /**
   * a
   * @param {*} masks a
   */
  updateLottieMasks(masks) {
    this.mask.updateMasks(masks);
  }
}

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

const TEXTURE_OPTIONS = { resourceOptions: { crossorigin: '*' } };

/**
 * an texture loader
 */
class LoadTexture extends Eventer {
  /**
   * an texture loader
   * @param {array} assets assets
   * @param {object} options options
   * @param {string} [options.prefix] prefix
   * @param {boolean} [options.autoLoad=true] autoLoad
   */
  constructor(assets, { prefix, autoLoad = true, textureOptions = TEXTURE_OPTIONS }) {
    super();
    this.assets = assets;
    this.prefix = prefix || '';
    this.textures = {};
    this._total = 0;
    this._failed = 0;
    this._received = 0;
    this.loaded = false;
    this.textureOptions = textureOptions;
    if (autoLoad) this.load();
  }

  /**
   * load assets
   */
  load() {
    this.assets.forEach(asset => {
      const id = asset.id;
      const url = createUrl(asset, this.prefix);
      const texturePromise = Assets.load(url);
      this.textures[id] = texturePromise;
      this._total++;
      texturePromise
        .then(() => {
          this._received++;
          this.emit('update');
          if (this._received + this._failed >= this._total) this._onComplete();
        })
        .catch(e => {
          this._failed++;
          this.emit('update');
          if (this._received + this._failed >= this._total) this._onComplete();
        });
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

/**
 * an texture loader
 * @param {Array} assets assets images
 * @param {Object} options loader options
 * @param {String} [options.prefix] path prefix
 * @param {Boolean} [options.autoLoad=true] auto load
 * @return {LoadTexture}
 */
function loadTexture(assets, options = {}) {
  return new LoadTexture(assets, options);
}

/**
 * an json loader
 * @param {String} path json path
 * @return {LoadJson}
 */
function loadJson(path) {
  return new LoadJson(path);
}

const getLayerBySubstituteId = (lottieFile, substituteId) => {
  const { substituteIds } = lottieFile || {};
  if (!substituteIds || Object.keys(substituteIds).length === 0) return null;
  let layer;
  // 在复合图层内部
  if (substituteId && substituteId.indexOf('_') === -1) {
    const outerIndex = Number(substituteId);
    if (!Number.isNaN(outerIndex)) {
      layer = lottieFile?.layers?.[outerIndex];
    }
  } else if (substituteId) {
    // 在顶层图层
    const substituteIdArr = substituteId.split('_');
    const outerIndex = Number(substituteIdArr[0]);
    const innerIndex = Number(substituteIdArr[1]);
    if (!Number.isNaN(outerIndex) && !Number.isNaN(innerIndex)) {
      const asset = lottieFile.assets[outerIndex];
      layer = asset?.layers?.[innerIndex];
    }
  }
  return layer;
};

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
   * @param {string} options.path bodymovin json url, which export from AE by bodymovin and you upload to some remote
   * @param {number} [options.repeats=0] need repeat some times?
   * @param {boolean} [options.infinite=false] play this animation round and round forever
   * @param {boolean} [options.alternate=false] alternate play direction every round
   * @param {number} [options.wait=0] need wait how much millisecond to start
   * @param {number} [options.delay=0] need delay how much millisecond to begin, effect every loop round
   * @param {number} [options.timeScale=1] animation speed, time scale factor
   * @param {boolean} [options.autoLoad=true] auto load assets, if this animation have
   * @param {boolean} [options.autoStart=true] auto start animation after assets loaded
   * @param {boolean} [options.enable3D=true] parse 3D layer with 3D context, just work in webgl
   * @param {boolean} [options.copyJSON=false] copy json when this lottie data has two parse instance
   * @param {boolean} [options.overlapMode=false] enable overlap mode, it is useful when you have a overlap expression
   * @param {object} [options.segments={}] animation segments, splite by start and end keyframe number
   * @param {boolean} [options.initSegment=''] animation segments, init finite state machine
   * @param {boolean} [options.justDisplayOnImagesLoaded=true] just display group when all images loaded
   * @param {boolean} [options.depthTest=true] enable depth test for 3d layer
   * @param {boolean} [options.maskComp=false] add mask for each comp
   * @param {string} [options.prefix=''] assets url prefix, look like link path
   * @param {boolean} [options.replaceData=''] assets url prefix, look like link path
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
     * 是否启用3D图层解析
     * @member {boolean}
     * @private
     */
    this._enable3D = Tools.isBoolean(options.enable3D) ? options.enable3D : true;

    /**
     * 是否为3D图层开启深度检测
     * @member {boolean}
     * @private
     */
    this._depthTest = Tools.isBoolean(options.depthTest) ? options.depthTest : true;

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
     * 该lottie的相机对象，仅在有3D上下文时才有
     * @member {CameraLottieLayer|CameraNullLottieLayer}
     */
    this.camera = null;

    /**
     * 该动画组的父容器
     * @member {AnimationManager}
     */
    this.parent = null;

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

    // 纠正有些用户会把 json 链接传给 keyframes
    if (options.keyframes && Tools.isString(options.keyframes)) {
      options.path = options.keyframes;
      options.keyframes = null;
    }

    if (options.keyframes) {
      if (!this._prefix && options.keyframes.prefix) this._prefix = options.keyframes.prefix;
      if (!options.replaceData) {
        this._setupDate(options.keyframes);
      } else {
        this._response = options.keyframes;
        if (this._replaceData) {
          this._setupReplaceData();
        }
      }
    } else if (options.path) {
      let prefix = '';
      if (options.path.lastIndexOf('\\') !== -1) {
        prefix = options.path.substr(0, options.path.lastIndexOf('\\') + 1);
      } else {
        prefix = options.path.substr(0, options.path.lastIndexOf('/') + 1);
      }
      if (!this._prefix && prefix) this._prefix = prefix;

      this.jsonLoader = loadJson(options.path);
      this.jsonLoader.once('success', response => {
        if (!options.replaceData) {
          this._setupDate(response);
        } else {
          this._response = response;
          if (this._replaceData) {
            this._setupReplaceData();
          }
        }
      });
      this.jsonLoader.once('error', error => {
        this.emit('error', error);
      });
    }
  }

  replaceData(data) {
    this._replaceData = data;
    this._setupReplaceData();
  }

  _setupReplaceData() {
    if (this._response && this._replaceData) {
      if (this._response.substituteIds) {
        const revertSubstituteIds = {};
        for (const key in this._response.substituteIds) {
          const value = this._response.substituteIds[key];
          revertSubstituteIds[value] = key;
        }

        for (const name in this._replaceData) {
          const data = this._replaceData[name];

          const layer = getLayerBySubstituteId(this._response, revertSubstituteIds[name]);
          if (!layer) continue;
          // 更新图片图层或文本图层的内容
          const { ty } = layer;
          if (ty === 2) {
            const asset = lottieFile.assets.find(item => item.id === layer.refId);
            if (asset) {
              asset.p = data;
            }
          } else if (ty === 5) {
            if (layer?.t?.d?.k?.[0]?.s?.t) {
              layer.t.d.k[0].s.t = data;
            }
          }
        }
      }
      this._setupDate(this._response);
    }
  }

  /**
   * 安装动画数据
   * @private
   * @param {object} data data.json
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
    const { w, h, st = 0, fr, ip, op, assets } = data;

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

    /**
     * lottie 资源对象
     * @member {array}
     */
    this.assets = assets;

    let textureLoader = null;
    const images = assets.filter(it => {
      return it.u || it.p || it.e;
    });
    if (images.length > 0) {
      this.textureLoader = textureLoader = loadTexture(images, {
        prefix: this._prefix,
        autoLoad: this._autoLoad,
      });
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
        w,
        h,
        frameRate: fr,
        maskComp: this._maskComp,
        overlapMode: this.overlapMode,
      },
      fontManager: new FontManager(),
      local: {
        w,
        h,
        ip,
        op,
        st,
      },
    };
    session.fontManager.addChars(data.chars || []);
    session.fontManager.addFonts(data.fonts, document.body);
    if (data.fonts?.list?.length) {
      const fonts = data.fonts.list
        .map(item => ({
          alias: item.fFamily,
          src: item.fPath,
          data: { family: item.fFamily },
        }))
        .filter(item => item.src);
      Assets.load(fonts).catch(e => {
        console.error(e);
      });
    }

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
   * @param {object} session session information
   */
  _buildElements(session) {
    this.root = this._extraComp(this.keyframes, session, true);
    this.display = this.root.display;
    this.group.addChild(this.display);

    this._prepareChildComp(this.root, session);

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
   * @private
   * @param {object} comp comp container
   * @param {arrya} layers layers
   * @param {object} session parse session date
   * @return {object}
   */
  _buildLottieTree(comp, layers, session) {
    const layersMap = {};
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      let element = null;
      // if (layer.td !== undefined) continue;

      switch (layer.ty) {
        case 0:
          element = this._extraComp(layer, session);
          break;
        case 1:
          element = this._extraSolid(layer, session);
          break;
        case 2:
          element = this._extraSprite(layer, session);
          break;
        case 3:
          element = this._extraNull(layer, session);
          break;
        case 4:
          element = this._extraShape(layer, session);
          break;
        case 5:
          element = this._extraText(layer, session);
          break;
        case 13:
          element = this._extraCamera(layer, session);
          break;
      }

      if (element) {
        // 有些动画层没有ind，比如序列帧
        if (layer.ind === undefined) layer.ind = i;
        layersMap[layer.ind] = element;
      }
    }

    const { local } = session;

    let nullCamera = null;
    if (local.has3D) {
      if (!local.currentCamera && !local.closedCamera) nullCamera = this._extraCamera(null, session);
      local.closedCamera = true;
    }
    let mattTT = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      const item = layersMap[layer.ind];
      if (!item) continue;
      if (!Tools.isUndefined(layer.parent)) {
        const parent = layersMap[layer.parent];
        // 矩阵暂时不能混合使用，3D和2D的图层不能有父子节点关系
        if (item.is3D || (!item.is3D && !parent.is3D)) {
          item.setTransformHierarchy(parent);
          item.display.setTransformHierarchy(parent.display);
        }
      }
      if (layer.td === 1 && mattTT !== null && !mattTT.display.mask) {
        mattTT.display.mask = item.display;
      }
      if (layer.tt === 1) {
        mattTT = item;
      } else {
        mattTT = null;
      }
      comp.addChild(item);

      if (local.currentCamera && item.is3D) {
        if (!local.currentPerspective.hadShipped) this._shipPerspectiveLayer(comp, local.currentPerspective);
        local.currentPerspective.addChild(item.display);
      } else if (item.display) {
        comp.display.addChild(item.display);
      }
    }

    if (nullCamera) {
      comp.addChild(nullCamera);
    }

    const childCompsArray = session.local.childCompsArray;
    for (let i = 0; i < childCompsArray.length; i++) {
      const comp = childCompsArray[i];
      this._prepareChildComp(comp, session);
    }

    return layersMap;
  }

  /**
   * ship a perspective layer once time
   * @param {object} comp comp container
   * @param {object} perspective perspective layer
   */
  _shipPerspectiveLayer(comp, perspective) {
    comp.display.addChild(perspective);
    perspective.hadShipped = true;
  }

  /**
   * 准备提取预合成
   * @private
   * @param {object} comp comp container
   * @param {object} session session
   */
  _prepareChildComp(comp, session) {
    const { layers, w, h, ip, op, st = 0 } = comp.data;
    const newSession = {
      ...session,
      global: session.global,
      local: {
        w,
        h,
        ip,
        op,
        st,
        childCompsArray: [],
        currentCamera: null,
        closedCamera: session.local.closedCamera || false,
        currentPerspective: null,
      },
    };
    this._buildLottieTree(comp, layers, newSession);
  }

  /**
   * 提取预合成
   * @private
   * @param {object} layer layer data
   * @param {object} _session session
   * @param {boolean} isRoot isRoot
   * @return {lottieLayer}
   */
  _extraComp(layer, _session, isRoot = false) {
    const lottieLayer = new CompLottieLayer(layer, _session);

    // 当根节点的 ddd 属性为 1 是，其实它不是3D图层
    if (isRoot) lottieLayer.is3D = false;

    if (lottieLayer.is3D && this._enable3D) {
      _session.local.has3D = true;
      // lottieLayer.display = new CompElement3D(lottieLayer, isRoot);
    } else {
      lottieLayer.display = new CompElement(lottieLayer, isRoot);
    }
    if (!isRoot) _session.local.childCompsArray.push(lottieLayer);
    return lottieLayer;
  }

  /**
   * 提取实体图层
   * @private
   * @param {object} layer layer data
   * @param {object} session session
   * @return {lottieLayer}
   */
  _extraSolid(layer, session) {
    const lottieLayer = new SolidLottieLayer(layer, session);
    lottieLayer.display = new SolidElement(lottieLayer);
    return lottieLayer;
  }

  /**
   * 提取图片图层
   * @private
   * @param {object} layer layer data
   * @param {object} session session
   * @return {lottieLayer}
   */
  _extraSprite(layer, session) {
    const asset = Tools.getAssets(layer.refId, this.assets);
    const texture = this.textureLoader.getTextureById(asset.id);
    const lottieLayer = new SpriteLottieLayer(layer, session);
    if (lottieLayer.is3D && this._enable3D) {
      session.local.has3D = true;
      // lottieLayer.display = new SpriteElement3D(lottieLayer, {
      //   asset,
      //   texture,
      // });
    } else {
      lottieLayer.display = new SpriteElement(lottieLayer, {
        asset,
        texture,
      });
    }
    return lottieLayer;
  }

  /**
   * 提取空图层
   * @private
   * @param {object} layer layer data
   * @param {object} session session
   * @return {lottieLayer}
   */
  _extraNull(layer, session) {
    const lottieLayer = new NullLottieLayer(layer, session);
    lottieLayer.display = new CompElement(lottieLayer);
    return lottieLayer;
  }

  /**
   * 提取形状图层
   * @private
   * @param {object} layer layer data
   * @param {object} session session
   * @return {lottieLayer}
   */
  _extraShape(layer, session) {
    const lottieLayer = new ShapeLottieLayer(layer, session);
    if (lottieLayer.is3D && this._enable3D);
    else {
      lottieLayer.display = new ShapeElement(lottieLayer);
    }
    return lottieLayer;
  }

  /**
   * 提取文字图层
   * @private
   * @param {object} layer layer data
   * @param {object} session session
   */
  _extraText(layer, session) {
    layer.global = session;
    const lottieLayer = new TextLottieLayer(layer, session);
    const usesGlyphs = !!session.fontManager.chars?.length;
    if (usesGlyphs) {
      lottieLayer.display = new TextGlyphsElement(lottieLayer);
    } else {
      lottieLayer.display = new TextElement(lottieLayer);
    }

    return lottieLayer;
  }

  /**
   * 提取相机层
   * @private
   * @param {object} layer layer data
   * @param {object} session session
   * @return {lottieLayer}
   */
  _extraCamera(layer, session) {
    if (session.local.closedCamera || !this._enable3D) return;
    let lottieLayer = null;
    if (layer) {
      lottieLayer = new CameraLottieLayer(layer, session);
    } else {
      lottieLayer = new CameraNullLottieLayer(layer, session);
    }
    // lottieLayer.display = new PerspectiveElement3D(lottieLayer);
    // session.local.currentPerspective = new PerspectiveElement3D(
    //   lottieLayer,
    //   this._depthTest
    // );
    session.local.currentCamera = lottieLayer;
    return lottieLayer;
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
   * @return {boolean}
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
   * @return {boolean}
   */
  _searchNodes(selector, node, nodes, returnWhenMatch = false) {
    if (node.childLayers && node.childLayers.length > 0) {
      const preComps = [];
      for (let i = 0; i < node.childLayers.length; i++) {
        const childNode = node.childLayers[i];
        if (this._queryMatch(selector, childNode, nodes) && returnWhenMatch) return true;
        if (childNode.childLayers && childNode.childLayers.length > 0) preComps.push(childNode);
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
   * bind other animation-group or display-object to this animation-group with selector
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
   * unbind other animation-group or display-object to this animation-group with selector
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
   * bind interactive event from display layer with selector
   * <br/> `Note:` only can use after data was setup or after DisplayReady event
   * @param {*} selector name | classname | id
   * @param {*} eventName interactive event name
   * @param {*} handle callback handle
   * @return {this}
   */
  bindInteractiveEventByQuerySelector(selector, eventName, handle) {
    const layerDisplay = this.getDisplayByQuerySelector(selector);
    if (layerDisplay) {
      layerDisplay.interactive = true;
      layerDisplay.on(eventName, handle);
    }
    return this;
  }

  /**
   * unbind interactive event from display layer with selector
   * <br/> `Note:` only can use after data was setup or after DisplayReady event
   * @param {*} selector name | classname | id
   * @param {*} eventName interactive event name
   * @param {*} handle callback handle
   * @return {this}
   */
  unbindInteractiveEventByQuerySelector(selector, eventName, handle) {
    const layerDisplay = this.getDisplayByQuerySelector(selector);
    if (layerDisplay) {
      layerDisplay.off(eventName, handle);
    }
    return this;
  }

  /**
   * replace image from image layer with selector
   * <br/> `Note:` only can use after data was setup or after DisplayReady event
   * @param {*} selector name | classname | id
   * @param {*} image url | texture
   * @return {this}
   */
  replaceImageByQuerySelector(selector, image = Texture.EMPTY) {
    const layerDisplay = this.getDisplayByQuerySelector(selector);
    if (layerDisplay && layerDisplay.isSprite) {
      const texture =
        typeof image === 'string' ? Texture.from(image, { resourceOptions: { crossorigin: '*' } }) : image;
      layerDisplay.texture = texture;
    }
    return this;
  }

  /**
   * replace image from image layer with selector
   * <br/> `Note:` only can use after data was setup or after DisplayReady event
   * @param {*} selector name | classname | id
   * @param {*} image url | texture or array[url | texture]
   * @return {this}
   */
  replaceImageByQuerySelectorAll(selector, image = [Texture.EMPTY]) {
    const layers = this.querySelectorAll(selector);
    const isArrImage = Tools.isArray(image);
    layers.forEach((layer, idx) => {
      const layerDisplay = layer.display;
      if (layerDisplay && layerDisplay.isSprite) {
        const imageItem = isArrImage ? image[idx] : image;
        const texture =
          typeof imageItem === 'string'
            ? Texture.from(imageItem, { resourceOptions: { crossorigin: '*' } })
            : imageItem;
        layerDisplay.texture = texture;
      }
    });
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
    const correctedFrameNum = this.direction === 1 ? this.beginFrame + this.frameNum : this.frameNum;
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
   * @return {this}
   */
  setSpeed(speed) {
    this.timeScale = speed;
    return this;
  }

  /**
   * set finite state machine
   * <br/> `Note:` only can use after data was setup or after DisplayReady event
   * @param {string|array} name segment name which define in segments props, you can also pass an array like [10, 30]
   * @param {object} options animation config
   * @param {number} [options.repeats=0] need repeat somt times?
   * @param {boolean} [options.infinite=false] play this animation round and round forever
   * @param {boolean} [options.alternate=false] alternate direction every round
   * @param {number} [options.wait=0] need wait how much millisecond to start
   * @param {number} [options.delay=0] need delay how much millisecond to begin, effect every loop round
   * @param {number} [options.direction=1] need direction
   * @return {this}
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
    if (Tools.isNumber(options.direction)) {
      this.direction = options.direction;
    } else {
      this.direction = 1;
    }

    this.replay();
    return this;
  }

  /**
   * impl same as lottie goToAndStop
   * <br/> `Note:` only can use after data was setup or after DisplayReady event
   * @param {number} value number value
   * @param {boolean} isFrame frame base or time base
   * @return {this}
   */
  goToAndStop(value, isFrame = false) {
    this.frameNum = isFrame ? value : value * this.frameMult;
    this.update(0, true);
    this.pause();
    return this;
  }

  /**
   * impl same as lottie goToAndStop
   * <br/> `Note:` only can use after data was setup or after DisplayReady event
   * @param {number} value number value
   * @param {boolean} isFrame frame base or time base
   * @return {this}
   */
  goToAndPlay(value, isFrame = false) {
    this.frameNum = isFrame ? value : value * this.frameMult;
    this.update(0, true);
    this.resume();
    return this;
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
    // 根据播放方向设置初始帧位置
    if (this.direction === -1) {
      // 倒着播放从duration开始
      this.frameNum = this.duration;
    } else {
      // 正常播放从0开始
      this.frameNum = 0;
    }
    this.duration = Math.floor(this.endFrame - this.beginFrame);
    return this;
  }

  /**
   * show animation root display
   * @return {this}
   */
  show() {
    if (this._justDisplayNeedSet) {
      this._justDisplayNeedSet = false;
    } else {
      this._justDisplayNeedSet = null;
    }
    this.group.visible = true;
    return this;
  }

  /**
   * hide animation root display
   * @return {this}
   */
  hide() {
    if (this._justDisplayNeedSet) {
      this._justDisplayNeedSet = false;
    } else {
      this._justDisplayNeedSet = null;
    }
    this.group.visible = false;
    return this;
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
     * get app object
     * @member {ticker}
     */
    this.app = app;

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
   * is use webgl mode
   * @return {boolean}
   */
  isWebGLMode() {
    // return this.app.renderer.type === RENDERER_TYPE.WEBGL;
    return true;
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
   * @param {string} options.path bodymovin json url, which export from AE by bodymovin and you upload to some remote
   * @param {number} [options.repeats=0] need repeat some times?
   * @param {boolean} [options.infinite=false] play this animation round and round forever
   * @param {boolean} [options.alternate=false] alternate play direction every round
   * @param {number} [options.wait=0] need wait how much millisecond to start
   * @param {number} [options.delay=0] need delay how much millisecond to begin, effect every loop round
   * @param {number} [options.timeScale=1] animation speed, time scale factor
   * @param {boolean} [options.autoLoad=true] auto load assets, if this animation have
   * @param {boolean} [options.autoStart=true] auto start animation after assets loaded
   * @param {boolean} [options.enable3D=true] parse 3D layer with 3D context, just work in webgl
   * @param {boolean} [options.copyJSON=false] copy json when this lottie data has two parse instance
   * @param {boolean} [options.overlapMode=false] enable overlap mode, it is useful when you have a overlap expression
   * @param {object} [options.segments={}] animation segments, splite by start and end keyframe number
   * @param {boolean} [options.initSegment=''] animation segments, init finite state machine
   * @param {boolean} [options.justDisplayOnImagesLoaded=true] just display group when all images loaded
   * @param {boolean} [options.depthTest=true] enable depth test for 3d layer
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
    options.enable3D = false;
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
      autoPreventDefault = true,
      transparent,
      antialias,
      preserveDrawingBuffer,
      resolution,
      forceCanvas,
      backgroundColor,
      clearBeforeRender = true,
      roundPixels,
      forceFXAA,
      legacy,
      powerPreference,
      sharedTicker,
      sharedLoader,
      pixiOptions = {},
    } = options;

    /**
     * pixi application 对象，管理渲染事项
     * @member {PIXI.Application}
     */
    this.app = new Application();
    this.app.init(
      Object.assign(pixiOptions, {
        view,
        width,
        height,
        autoPreventDefault,
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
      }),
    );
    if (autoPreventDefault === false) {
      this.app.renderer.plugins.interaction.autoPreventDefault = autoPreventDefault;
      this.app.renderer.view.style.touchAction = 'auto';
    }

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
    const { width, height } = this.app.renderer;
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

  /**
   * destroy pixi application and all lottie animate
   * @param {boolean} [removeView=false] - Automatically remove canvas from DOM.
   * @param {object|boolean} [stageOptions] - Options parameter. A boolean will act as if all options
   *  have been set to that value
   * @param {boolean} [stageOptions.children=false] - if set to true, all the children will have their destroy
   *  method called as well. 'stageOptions' will be passed on to those calls.
   * @param {boolean} [stageOptions.texture=false] - Only used for child Sprites if stageOptions.children is set
   *  to true. Should it destroy the texture of the child sprite
   * @param {boolean} [stageOptions.baseTexture=false] - Only used for child Sprites if stageOptions.children is set
   *  to true. Should it destroy the base texture of the child sprite
   */
  destroy(removeView, stageOptions) {
    this.app.destroy(removeView, stageOptions);
    this.manager.destroy();
  }
}

/**
 * parser a bodymovin data, and post some config for this animation group
 * @alias loadAnimation
 * @memberof LottieAnimation
 * @param {object} options lottie animation setting
 * @param {object} options.pixiOptions pixi application options
 * @param {HTMLCanvasElement} options.view pixi Application canvas
 * @param {number} options.width pixi Application canvas width, usually use data.w
 * @param {number} options.height pixi Application canvas width, usually use data.h
 * @param {boolean} [options.autoPreventDefault=true] - prevent default event fro canvas, make your canvas can not scroll if it is true
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
 * @param {boolean} [options.useAESize=true] - If the render view is transparent, default false
 *
 * @param {object} options.keyframes bodymovin data, which export from AE by bodymovin
 * @param {string} options.path bodymovin json url, which export from AE by bodymovin and you upload to some remote
 * @param {number} [options.repeats=0] need repeat some times?
 * @param {boolean} [options.infinite=false] play this animation round and round forever
 * @param {boolean} [options.alternate=false] alternate play direction every round
 * @param {number} [options.wait=0] need wait how much millisecond to start
 * @param {number} [options.delay=0] need delay how much millisecond to begin, effect every loop round
 * @param {number} [options.timeScale=1] animation speed, time scale factor
 * @param {boolean} [options.autoLoad=true] auto load assets, if this animation have
 * @param {boolean} [options.autoStart=true] auto start animation after assets loaded
 * @param {boolean} [options.enable3D=true] parse 3D layer with 3D context, just work in webgl
 * @param {boolean} [options.copyJSON=false] copy json when this lottie data has two parse instance
 * @param {boolean} [options.overlapMode=false] enable overlap mode, it is useful when you have a overlap expression
 * @param {object} [options.segments={}] animation segments, splite by start and end keyframe number
 * @param {boolean} [options.initSegment=''] animation segments, init finite state machine
 * @param {boolean} [options.justDisplayOnImagesLoaded=true] just display group when all images loaded
 * @param {boolean} [options.depthTest=true] enable depth test for 3d layer
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

export {
  AnimationManager,
  CompElement,
  CompElement as NullElement,
  ShapeElement,
  SolidElement,
  SpriteElement,
  TextElement,
  TextGlyphsElement,
  Tween,
  addHandleToTicker,
  loadAnimation,
  loadJson,
  loadTexture,
  useTicker,
};
//# sourceMappingURL=index.module.js.map
