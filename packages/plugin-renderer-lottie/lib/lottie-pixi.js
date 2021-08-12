import {
  Tools as t,
  Eventer as e,
  BezierEasing as s,
  TransformFrames as i,
  AnimationManager as n,
} from './lottie-core';
import {
  Graphics as r,
  Container as h,
  Shader as o,
  glCore as a,
  WebGLRenderer as l,
  ObjectRenderer as p,
  utils as c,
  CanvasRenderer as u,
  BLEND_MODES as d,
  Matrix as f,
  Sprite as m,
  Rectangle as g,
  Texture as y,
  settings as w,
  UPDATE_PRIORITY as v,
  ticker as x,
  DisplayObject as b,
  Application as P,
} from 'pixi.js';
class T extends r {
  constructor(t) {
    super(), (this.parentCompBox = t), this.lineStyle(0);
  }
  updateLayerMask(t) {
    for (let e = 0; e < t.viewData.length; e++) {
      if (t.viewData[e].inv) {
        const t = this.parentCompBox;
        this.moveTo(0, 0), this.lineTo(t.w, 0), this.lineTo(t.w, t.h), this.lineTo(0, t.h), this.lineTo(0, 0);
      }
      const s = t.viewData[e].v,
        i = s.v[0];
      this.moveTo(i[0], i[1]);
      const n = s._length;
      let r = 1;
      for (; r < n; r++) {
        const t = s.o[r - 1],
          e = s.i[r],
          i = s.v[r];
        this.bezierCurveTo(t[0], t[1], e[0], e[1], i[0], i[1]);
      }
      const h = s.o[r - 1],
        o = s.i[0],
        a = s.v[0];
      this.bezierCurveTo(h[0], h[1], o[0], o[1], a[0], a[1]), t.viewData[e].inv && this.addHole();
    }
  }
  updateMasks(t) {
    this.clear(), this.beginFill(0), this.updateLayerMask(t), this.endFill();
  }
}
class M extends r {
  constructor(t) {
    super(), (this.viewport = t), this.lineStyle(0), this.initCompMask();
  }
  initCompMask() {
    this.clear(), this.beginFill(0);
    const t = this.viewport;
    this.moveTo(0, 0),
      this.lineTo(t.w, 0),
      this.lineTo(t.w, t.h),
      this.lineTo(0, t.h),
      this.lineTo(0, 0),
      this.endFill();
  }
}
class k extends h {
  constructor(t, e) {
    super(), (this.lottieElement = t), (this.config = e);
  }
  onSetupLottie() {
    if (this.config.maskComp) {
      const t = this.config.viewport;
      (this.preCompMask = new M(t)), (this.mask = this.preCompMask), this.addChild(this.mask);
    }
    if (this.lottieElement.hasValidMasks()) {
      const t = this.config.session.local;
      if (((this.graphicsMasks = new T(t)), this.mask)) {
        const t = new h();
        (t.mask = this.graphicsMasks), t.addChild(this.mask), (this.lottieElement.innerDisplay = t), this.addChild(t);
      } else (this.mask = this.graphicsMasks), this.addChild(this.mask);
    }
  }
  setHierarchy(t) {
    this.hierarchy = t;
  }
  show() {
    this.visible = !0;
  }
  hide() {
    this.visible = !1;
  }
  updateLottieTransform(t) {
    (this.x = t.x),
      (this.y = t.y),
      (this.pivot.x = t.anchorX),
      (this.pivot.y = t.anchorY),
      (this.scale.x = t.scaleX),
      (this.scale.y = t.scaleY),
      (this.rotation = t.rotation),
      (this.alpha = t.alpha);
  }
  updateLottieMasks(t) {
    this.graphicsMasks && this.graphicsMasks.updateMasks(t);
  }
}
class C extends o {
  constructor(t) {
    super(
      t,
      [
        'attribute vec2 aVertexPosition;',
        'uniform mat3 translationMatrix;',
        'uniform mat3 projectionMatrix;',
        'void main(void){',
        '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
        '}',
      ].join('\n'),
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
function S(t, e) {
  (this.buffer = new t(10)), (this.length = 0);
}
S.prototype = {
  reset() {
    this.length = 0;
  },
  destroy() {
    (this.buffer = null), (this.length = 0);
  },
  push(...t) {
    if (this.length + t.length > this.buffer.length) {
      const e = new this.buffer.constructor(Math.max(this.length + t.length, Math.round(2 * this.buffer.length)));
      e.set(this.buffer, 0), (this.buffer = e);
    }
    for (let e = 0; e < t.length; e++) this.buffer[this.length++] = t[e];
    return this.length;
  },
  setBuffer(t) {
    (this.buffer = t), (this.length = this.buffer.length);
  },
};
class D {
  constructor(t, e, s) {
    (this.gl = t),
      (this.vertices = new S(Float32Array)),
      (this.indices = new S(Uint16Array)),
      (this.buffer = a.GLBuffer.createVertexBuffer(t)),
      (this.indexBuffer = a.GLBuffer.createIndexBuffer(t)),
      (this.dirty = !0),
      (this.shader = e),
      (this.vao = new a.VertexArrayObject(t, s)
        .addIndex(this.indexBuffer)
        .addAttribute(this.buffer, e.attributes.aVertexPosition, t.FLOAT, !1, 8, 0));
  }
  reset() {
    this.vertices.reset(), this.indices.reset();
  }
  upload() {
    this.buffer.upload(this.vertices.buffer), this.indexBuffer.upload(this.indices.buffer), (this.dirty = !1);
  }
  destroy() {
    this.vertices.destroy(),
      this.indices.destroy(),
      this.vao.destroy(),
      this.buffer.destroy(),
      this.indexBuffer.destroy(),
      (this.gl = null),
      (this.buffer = null),
      (this.indexBuffer = null);
  }
}
function _(t, e, s) {
  return t.push(e, s), t;
}
function O(t, e) {
  return Math.sqrt(t * t + e * e);
}
function L(t, e, s, i, n) {
  return (
    (function (t, e) {
      const s = 1 - t;
      return s * s * s * e;
    })(t, e) +
    (function (t, e) {
      const s = 1 - t;
      return 3 * s * s * t * e;
    })(t, s) +
    (function (t, e) {
      return 3 * (1 - t) * t * t * e;
    })(t, i) +
    (function (t, e) {
      return t * t * t * e;
    })(t, n)
  );
}
function A(t, e, s, i, n, r, h) {
  if (!(isFinite(e) && isFinite(s) && isFinite(i) && isFinite(n) && isFinite(r) && isFinite(h))) return t;
  const o = t[t.length - 2],
    a = t[t.length - 1],
    l = (function (t, e, s, i, n, r, h, o) {
      const a = n - s,
        l = r - i,
        p = s - t,
        c = i - e;
      return O(h - n, o - r) + O(a, l) + O(p, c);
    })(o, a, e, s, i, n, r, h),
    p = Math.min(10 / l, 0.5);
  for (let l = p; l < 1; l += p) {
    const p = L(l, o, e, i, r),
      c = L(l, a, s, n, h);
    t.push(p, c);
  }
  return t.push(r, h), t;
}
function I(t, e) {
  for (let s = 0; s < t.length; s++) {
    const { cmd: i, args: n } = t[s];
    switch (i) {
      case 'M':
      case 'L':
        _(e, n[0], n[1]);
        break;
      case 'C':
        A(e, n[0], n[1], n[2], n[3], n[4], n[5]);
    }
  }
  return e;
}
function E(t, e, s, i, n, r, h) {
  (n %= 2 * Math.PI),
    (r %= 2 * Math.PI),
    n < 0 && (n += 2 * Math.PI),
    r < 0 && (r += 2 * Math.PI),
    n >= r && (r += 2 * Math.PI);
  let o = r - n,
    a = 1;
  h && ((a = -1), (o = 2 * Math.PI - o), 0 == o && (o = 2 * Math.PI));
  const l = o * i;
  let p = Math.sqrt(l / 1) >> 0;
  p = p % 2 == 0 ? p + 1 : p;
  const c = o / p;
  let u = n;
  for (let n = 0; n < p + 1; n++) t.push(e, s, e + i * Math.cos(u), s + i * Math.sin(u)), (u += a * c);
}
function B(t, e, s) {
  const i = I(t.cmds, []),
    n = t.isClosed,
    r = e.lineDash.length >= 2,
    h = e.lineWidth / 2;
  let o,
    a = [i[0], i[1]];
  for (let t = 2; t < i.length; t += 2)
    (i[t] == a[a.length - 2] && i[t + 1] == a[a.length - 1]) || a.push(i[t], i[t + 1]);
  if ((!n || (a[a.length - 2] == a[0] && a[a.length - 1] == a[1]) || a.push(a[0], a[1]), r)) {
    const t = (function (t, e, s, i) {
      e && t.push(t[0], t[1]);
      let n = i,
        r = 0,
        h = 1;
      for (; n > s[r]; ) (n -= s[r]), r++, (h = h ? 0 : 1), r == s.length && (r = 0);
      let o = [t[0], t[1]],
        a = [h];
      for (let e = 2; e < t.length; e += 2) {
        let i = [t[e] - t[e - 2], t[e + 1] - t[e - 1]],
          l = O(i[0], i[1]);
        (i[0] /= l), (i[1] /= l);
        let p = 0;
        for (; l - p + n >= s[r]; )
          (p += s[r] - n),
            (n = 0),
            (h = h ? 0 : 1),
            r++,
            r == s.length && (r = 0),
            a.push(h),
            o.push(t[e - 2] + p * i[0], t[e - 1] + p * i[1]);
        l - p != 0 && (o.push(t[e], t[e + 1]), a.push(h)), (n += l - p);
      }
      return e && (t.pop(), t.pop(), o.pop(), o.pop(), a.pop()), { newPoints: o, toDrawOrNotToDraw: a };
    })(a, n, e.lineDash, e.lineDashOffset);
    (o = t.toDrawOrNotToDraw), (a = t.newPoints);
  }
  const l = s.length;
  let p = s.length;
  const c = [];
  if (n) a.push(a[2], a[3]);
  else {
    const t = [a[2] - a[0], a[3] - a[1]],
      i = O(t[0], t[1]);
    (t[0] /= i), (t[1] /= i);
    const n = [-t[1], t[0]],
      l = [a[0] + h * n[0], a[1] + h * n[1]],
      u = [a[0] - h * n[0], a[1] - h * n[1]];
    if ('butt' == e.lineCap) s.push(l[0], l[1], u[0], u[1]);
    else if ('square' == e.lineCap) s.push(l[0] - h * t[0], l[1] - h * t[1], u[0] - h * t[0], u[1] - h * t[1]);
    else {
      s.push(a[0], a[1], l[0], l[1]);
      const t = Math.atan2(l[1] - a[1], l[0] - a[0]),
        e = Math.atan2(u[1] - a[1], u[0] - a[0]);
      E(s, a[0], a[1], h, t, e), s.push(a[0], a[1], u[0], u[1]), s.push(l[0], l[1], u[0], u[1]);
    }
    if (r) {
      const t = o[0];
      for (let e = p; e < s.length; e += 2) c.push(t);
      p = s.length;
    }
  }
  for (let t = 2; t < a.length - 2; t += 2) {
    const i = [a[t] - a[t - 2], a[t + 1] - a[t - 1]],
      n = [-i[1], i[0]];
    let l = O(n[0], n[1]);
    (n[0] /= l), (n[1] /= l);
    let u = [a[t + 2] - a[t], a[t + 3] - a[t + 1]];
    (l = O(u[0], u[1])), (u[0] /= l), (u[1] /= l);
    let d = [a[t] - a[t - 2], a[t + 1] - a[t - 1]];
    (l = O(d[0], d[1])), (d[0] /= l), (d[1] /= l);
    let f = [d[0] + u[0], d[1] + u[1]];
    l = O(f[0], f[1]);
    let m,
      g,
      y = 0;
    l > 0
      ? ((f[0] /= l), (f[1] /= l), (g = [-f[1], f[0]]), (m = g[0] * n[0] + g[1] * n[1]), (y = h / m))
      : ((y = 0), (g = [-f[1], f[0]]));
    const w = [a[t] + y * g[0], a[t + 1] + y * g[1]],
      v = [a[t] - y * g[0], a[t + 1] - y * g[1]];
    if ('miter' == e.lineJoin && 1 / m <= e.miterLimit) s.push(w[0], w[1], v[0], v[1]);
    else {
      const i = d[1] * u[0] - d[0] * u[1];
      if ('round' == e.lineJoin)
        if (i < 0) {
          const e = [a[t] + d[1] * h, a[t + 1] - d[0] * h],
            i = [a[t] + u[1] * h, a[t + 1] - u[0] * h];
          s.push(w[0], w[1], e[0], e[1]);
          const n = Math.atan2(e[1] - a[t + 1], e[0] - a[t]),
            r = Math.atan2(i[1] - a[t + 1], i[0] - a[t]);
          E(s, a[t], a[t + 1], h, n, r), s.push(w[0], w[1], i[0], i[1]);
        } else {
          const e = [a[t] - d[1] * h, a[t + 1] + d[0] * h],
            i = [a[t] - u[1] * h, a[t + 1] + u[0] * h];
          s.push(e[0], e[1], v[0], v[1]);
          const n = Math.atan2(i[1] - a[t + 1], i[0] - a[t]),
            r = Math.atan2(e[1] - a[t + 1], e[0] - a[t]);
          E(s, a[t], a[t + 1], h, n, r), s.push(i[0], i[1], v[0], v[1]);
        }
      else if (i < 0) {
        const e = [a[t] + d[1] * h, a[t + 1] - d[0] * h],
          i = [a[t] + u[1] * h, a[t + 1] - u[0] * h];
        s.push(w[0], w[1], e[0], e[1], w[0], w[1], i[0], i[1]);
      } else {
        const e = [a[t] - d[1] * h, a[t + 1] + d[0] * h],
          i = [a[t] - u[1] * h, a[t + 1] + u[0] * h];
        s.push(e[0], e[1], v[0], v[1], i[0], i[1], v[0], v[1]);
      }
    }
    if (r) {
      const e = o[t / 2];
      for (let t = p; t < s.length; t += 2) c.push(e);
      p = s.length;
    }
  }
  if (n) s.push(s.buffer[l], s.buffer[l + 1], s.buffer[l + 2], s.buffer[l + 3]);
  else {
    const t = [a[a.length - 2] - a[a.length - 4], a[a.length - 1] - a[a.length - 3]],
      i = Math.sqrt(Math.pow(t[0], 2) + Math.pow(t[1], 2));
    (t[0] /= i), (t[1] /= i);
    const n = [-t[1], t[0]],
      r = [a[a.length - 2] + h * n[0], a[a.length - 1] + h * n[1]],
      o = [a[a.length - 2] - h * n[0], a[a.length - 1] - h * n[1]];
    if ('butt' == e.lineCap) s.push(r[0], r[1], o[0], o[1]);
    else if ('square' == e.lineCap) s.push(r[0] + h * t[0], r[1] + h * t[1], o[0] + h * t[0], o[1] + h * t[1]);
    else {
      s.push(r[0], r[1], o[0], o[1]), s.push(a[a.length - 2], a[a.length - 1], o[0], o[1]);
      const t = Math.atan2(o[1] - a[a.length - 1], o[0] - a[a.length - 2]),
        e = Math.atan2(r[1] - a[a.length - 1], r[0] - a[a.length - 2]);
      E(s, a[a.length - 2], a[a.length - 1], h, t, e), s.push(a[a.length - 2], a[a.length - 1], r[0], r[1]);
    }
  }
  if (r) {
    const t = o[o.length - 1];
    for (let e = p; e < s.length; e += 2) c.push(t);
    p = s.length;
  }
  return c;
}
function F(t, e) {
  const s = t.isClosed;
  let i = !0;
  const n = I(t.cmds, []);
  let r = [n[0], n[1]];
  for (let t = 2; t < n.length; t += 2)
    (n[t] == r[r.length - 2] && n[t + 1] == r[r.length - 1]) || r.push(n[t], n[t + 1]);
  if ((!s || (r[r.length - 2] == r[0] && r[r.length - 1] == r[1]) || r.push(r[0], r[1]), r.length >= 6)) {
    for (let t = 0; t < r.length; t++) e.push(r[t]);
    i = !1;
  }
  return i;
}
l.registerPlugin(
  'lottiegraphics',
  class extends p {
    constructor(t) {
      super(t),
        (this.graphicsDataPool = []),
        (this.primitiveShader = null),
        (this.webGLData = null),
        (this.gl = t.gl),
        (this.CONTEXT_UID = 0);
    }
    onContextChange() {
      (this.gl = this.renderer.gl),
        (this.CONTEXT_UID = this.renderer.CONTEXT_UID),
        (this.primitiveShader = new C(this.gl));
    }
    destroy() {
      p.prototype.destroy.call(this);
      for (let t = 0; t < this.graphicsDataPool.length; ++t) this.graphicsDataPool[t].destroy();
      this.graphicsDataPool = null;
    }
    render(t) {
      const e = this.renderer,
        s = e.gl,
        i = this.getWebGLData(t);
      if ((t.isDirty && this.updateGraphics(t, i), 0 === i.indices.length)) return;
      const n = this.primitiveShader;
      e.bindShader(n),
        e.state.setBlendMode(t.blendMode),
        (n.uniforms.translationMatrix = t.transform.worldTransform.toArray(!0)),
        (n.uniforms.color = c.hex2rgb(t.color)),
        (n.uniforms.alpha = t.worldAlpha),
        e.bindVao(i.vao),
        i.vao.draw(s.TRIANGLES, i.indices.length);
    }
    updateGraphics(t, e) {
      e.reset(), 'stroke' === t.drawType ? this.buildStroke(t, e) : this.buildFill(t, e), (t.isDirty = !1);
    }
    buildStroke(t, e) {
      const { vertices: s, indices: i } = e,
        { paths: n, lineStyle: r } = t,
        h = r.lineDash.length >= 2;
      for (let t = 0; t < n.length; t++) {
        const e = n[t],
          o = s.length / 2,
          a = B(e, r, s);
        if (h) for (let t = o + 2; t < s.length / 2; t += 2) a[t - o - 1] && i.push(t - 2, t, t - 1, t, t + 1, t - 1);
        else for (let t = o + 2; t < s.length / 2; t += 2) i.push(t - 2, t, t - 1, t, t + 1, t - 1);
      }
      e.upload();
    }
    buildFill(t, e) {
      const { vertices: s, indices: i } = e,
        { paths: n } = t;
      let r = [];
      const h = [];
      for (let t = 0; t < n.length; t++) {
        const e = n[t],
          s = [];
        if (F(e, s)) break;
        const i = e.holes,
          o = [];
        for (let t = 0; t < i.length; t++) {
          const e = i[t],
            n = s.length;
          if (F(e, s)) break;
          o.push(n / 2);
        }
        const a = c.earcut(s, o, 2),
          l = r.length / 2;
        for (let t = 0; t < s.length; t += 2) r.push(s[t], s[t + 1]);
        for (let t = 0; t < a.length; t += 3) h.push(l + a[t], l + a[t + 1], l + a[t + 2]);
      }
      r.length < 6 || h < 3 || (s.setBuffer(new Float32Array(r)), i.setBuffer(new Uint16Array(h)), e.upload());
    }
    getWebGLData(t) {
      return (
        (t.webGLData && this.CONTEXT_UID === t.webGLData.CONTEXT_UID) ||
          ((t.webGLData = new D(this.renderer.gl, this.primitiveShader, this.renderer.state.attribState)),
          (t.webGLData.CONTEXT_UID = this.CONTEXT_UID)),
        t.webGLData
      );
    }
  },
);
u.registerPlugin(
  'lottiegraphics',
  class {
    constructor(t) {
      this.renderer = t;
    }
    destroy() {
      this.renderer = null;
    }
    render(t) {
      const e = this.renderer,
        s = e.context,
        i = t.lineStyle,
        n = t.worldAlpha,
        r = t.transform.worldTransform,
        h = e.resolution;
      s.setTransform(r.a * h, r.b * h, r.c * h, r.d * h, r.tx * h, r.ty * h),
        e.setBlendMode(t.blendMode),
        (s.globalAlpha = n),
        'stroke' === t.drawType
          ? ((s.lineWidth = i.lineWidth),
            (s.lineJoin = i.lineJoin),
            (s.miterLimit = i.miterLimit),
            (s.lineCap = i.lineCap),
            (s.lineDashOffset = i.lineDashOffset),
            s.setLineDash(i.lineDash || []),
            this.buildStroke(t))
          : this.buildFill(t);
    }
    buildStroke(t) {
      const e = this.renderer.context,
        s = `#${`00000${(0 | t.color).toString(16)}`.substr(-6)}`,
        { paths: i, lineStyle: n } = t;
      (e.lineWidth = n.lineWidth),
        (e.lineJoin = n.lineJoin),
        (e.miterLimit = n.miterLimit),
        (e.lineCap = n.lineCap),
        (e.lineDashOffset = n.lineDashOffset),
        e.setLineDash(n.lineDash || []),
        e.beginPath();
      for (let t = 0; t < i.length; t++) this.drawPath(e, i[t]);
      (e.strokeStyle = s), e.stroke();
    }
    buildFill(t) {
      const e = this.renderer.context,
        s = `#${`00000${(0 | t.color).toString(16)}`.substr(-6)}`,
        { paths: i } = t;
      e.beginPath();
      for (let t = 0; t < i.length; t++) {
        const s = i[t];
        this.drawPath(e, s);
        for (let t = 0; t < s.holes.length; t++) this.drawPath(e, s.holes[t]);
      }
      (e.fillStyle = s), e.fill();
    }
    drawPath(t, e) {
      for (let s = 0; s < e.cmds.length; s++) {
        const { cmd: i, args: n } = e.cmds[s];
        switch (i) {
          case 'M':
            t.moveTo(n[0], n[1]);
            break;
          case 'L':
            t.lineTo(n[0], n[1]);
            break;
          case 'C':
            t.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
        }
      }
    }
  },
);
class W {
  constructor() {
    (this.cmds = []), (this.holes = []), (this.isClosed = !1), (this.isClockWise = !1);
  }
  getLength() {
    return this.cmds.length;
  }
  add(t, e) {
    this.cmds.push({ cmd: t, args: e });
  }
  moveTo(t = 0, e = 0) {
    this.add('M', [t, e]);
  }
  lineTo(t, e) {
    this.add('L', [t, e]);
  }
  bezierCurveTo(t, e, s, i, n, r) {
    this.add('C', [t, e, s, i, n, r]);
  }
  closePath() {
    this.isClosed = !0;
  }
}
class X extends h {
  constructor() {
    super(),
      (this.paths = []),
      (this._samplerPoints = []),
      (this.currentPath = null),
      (this.color = 0),
      (this.lineStyle = {
        lineWidth: 1,
        lineJoin: 'miter',
        miterLimit: 10,
        lineCap: 'butt',
        lineDash: [],
        lineDashOffset: 0,
      }),
      (this.isDirty = !0),
      (this.drawType = ''),
      (this.blendMode = d.NORMAL),
      (this.webGLData = null),
      (this.firstIsClockWise = !0),
      (this.preClockWiseStatus = null);
  }
  clear() {
    (this.paths.length = 0),
      (this.currentPath = null),
      (this.firstIsClockWise = !0),
      (this.preClockWiseStatus = null),
      (this.isDirty = !0);
  }
  moveTo(t = 0, e = 0) {
    this.endPath(), (this.currentPath = new W()), this.currentPath.moveTo(t, e), this._samplerPoints.push([t, e]);
  }
  lineTo(t, e) {
    this.currentPath.lineTo(t, e), this._samplerPoints.push([t, e]);
  }
  bezierCurveTo(t, e, s, i, n, r) {
    this.currentPath.bezierCurveTo(t, e, s, i, n, r), this._samplerPoints.push([n, r]);
  }
  endPath() {
    if (this.currentPath && this.currentPath.getLength() > 1) {
      const t = this.paths.length,
        e =
          (function (t) {
            const e = t.length;
            let s = 0;
            for (let i = e - 1, n = 0; n < e; i = n++) s += t[i][0] * t[n][1] - t[n][0] * t[i][1];
            return 0.5 * s;
          })(this._samplerPoints) > 0;
      if (
        ((this.currentPath.isClockWise = e),
        0 === t && (this.firstIsClockWise = e),
        t > 0 && this.preClockWiseStatus === this.firstIsClockWise && this.preClockWiseStatus !== e)
      ) {
        (t > 0 ? this.paths[t - 1] : null).holes.push(this.currentPath);
      } else this.paths.push(this.currentPath), (this.preClockWiseStatus = e);
      (this.currentPath = null), (this.isDirty = !0);
    }
    this._samplerPoints.length = 0;
  }
  closePath() {
    this.currentPath.closePath();
  }
  stroke() {
    this.endPath(), (this.drawType = 'stroke');
  }
  fill() {
    null !== this.currentPath && (this.closePath(), this.endPath(), (this.drawType = 'fill'));
  }
  _renderWebGL(t) {
    t.setObjectRenderer(t.plugins.lottiegraphics), t.plugins.lottiegraphics.render(this);
  }
  _renderCanvas(t) {
    t.plugins.lottiegraphics.render(this);
  }
}
class z extends X {
  constructor(t, e) {
    super(), (this.lottieElement = t), (this.config = e), (this.passMatrix = new f());
  }
  setShapeTransform() {
    const t = this.lottieElement.preTransforms.finalTransform.props;
    this.passMatrix.set(t[0], t[1], t[4], t[5], t[12], t[13]), this.transform.setFromMatrix(this.passMatrix);
  }
  updateTransform() {
    this.setShapeTransform(),
      this.transform.updateTransform(this.parent.transform),
      (this.worldAlpha = this.alpha * this.parent.worldAlpha),
      this._bounds.updateID++;
  }
  updateLottieGrahpics(e) {
    const s = e.type;
    if ((this.clear(), (('st' === s || 'gs' === s) && 0 === e.wi) || !e.data._shouldRender || 0 === e.coOp)) return;
    const i = e.elements,
      n = i.length;
    for (let t = 0; t < n; t += 1) {
      const e = i[t].trNodes,
        s = e.length;
      for (let t = 0; t < s; t++)
        'm' == e[t].t
          ? this.moveTo(e[t].p[0], e[t].p[1])
          : 'c' == e[t].t
          ? this.bezierCurveTo(e[t].pts[0], e[t].pts[1], e[t].pts[2], e[t].pts[3], e[t].pts[4], e[t].pts[5])
          : this.closePath();
    }
    ('st' !== s && 'gs' !== s) ||
      (e.da
        ? ((this.lineStyle.lineDash = e.da), (this.lineStyle.lineDashOffset = e.do))
        : (this.lineStyle.lineDash = [])),
      'st' === s || 'gs' === s
        ? ((this.lineStyle.lineWidth = e.wi),
          (this.lineStyle.lineCap = e.lc),
          (this.lineStyle.lineJoin = e.lj),
          (this.lineStyle.miterLimit = e.ml || 0),
          (this.color = t.rgb2hex(e.co || e.grd)),
          (this.alpha = e.coOp),
          this.stroke())
        : ((this.color = t.rgb2hex(e.co || e.grd)), (this.alpha = e.coOp), this.fill());
  }
}
class G extends r {
  constructor(t, e) {
    super(), (this.lottieElement = t), (this.config = e);
    const s = parseInt(e.color.replace('#', ''), 16);
    this.beginFill(s), this.drawRect(0, 0, e.rect.width, e.rect.height), this.endFill();
  }
  onSetupLottie() {
    if (this.lottieElement.hasValidMasks()) {
      const t = this.config.session.local;
      (this.graphicsMasks = new T(t)), (this.mask = this.graphicsMasks), this.addChild(this.mask);
    }
  }
  setHierarchy(t) {
    this.hierarchy = t;
  }
  show() {
    this.visible = !0;
  }
  hide() {
    this.visible = !1;
  }
  updateLottieTransform(t) {
    (this.x = t.x),
      (this.y = t.y),
      (this.pivot.x = t.anchorX),
      (this.pivot.y = t.anchorY),
      (this.scale.x = t.scaleX),
      (this.scale.y = t.scaleY),
      (this.rotation = t.rotation),
      (this.alpha = t.alpha);
  }
  updateLottieMasks(t) {
    this.graphicsMasks && this.graphicsMasks.updateMasks(t);
  }
}
class R extends m {
  constructor(t, e) {
    const { texture: s, asset: i } = e;
    super(s),
      s.baseTexture.hasLoaded
        ? ((s.orig = new g(0, 0, i.w, i.h)), s._updateUvs())
        : s.baseTexture.on('loaded', () => {
            (s.orig = new g(0, 0, i.w, i.h)), s._updateUvs();
          }),
      (this.lottieElement = t),
      (this.config = e);
  }
  onSetupLottie() {
    if (this.lottieElement.hasValidMasks()) {
      const t = this.config.session.local;
      (this.graphicsMasks = new T(t)), (this.mask = this.graphicsMasks), this.addChild(this.mask);
    }
  }
  setHierarchy(t) {
    this.hierarchy = t;
  }
  show() {
    this.visible = !0;
  }
  hide() {
    this.visible = !1;
  }
  updateLottieTransform(t) {
    (this.x = t.x),
      (this.y = t.y),
      (this.pivot.x = t.anchorX),
      (this.pivot.y = t.anchorY),
      (this.scale.x = t.scaleX),
      (this.scale.y = t.scaleY),
      (this.rotation = t.rotation),
      (this.alpha = t.alpha);
  }
  updateLottieMasks(t) {
    this.graphicsMasks && this.graphicsMasks.updateMasks(t);
  }
}
const U = /^(https?:)?\/\//;
class N extends e {
  constructor(t, { prefix: e, autoLoad: s = !0 }) {
    super(),
      (this.assets = t),
      (this.prefix = e || ''),
      (this.textures = {}),
      (this._total = 0),
      (this._failed = 0),
      (this._received = 0),
      (this.loaded = !1),
      s && this.load();
  }
  load() {
    this.assets.forEach(t => {
      const e = t.id,
        s = (function (t, e) {
          if (1 === t.e) return t.p;
          e && (e = e.replace(/\/?$/, '/'));
          const s = t.u + t.p;
          let i = '';
          return (i = t.up ? t.up : U.test(s) ? s : e + s), i;
        })(t, this.prefix),
        i = y.fromImage(s, '*');
      (this.textures[e] = i),
        this._total++,
        i.baseTexture.hasLoaded
          ? (this._received++, this.emit('update'), this._received + this._failed >= this._total && this._onComplete())
          : (i.baseTexture.once('loaded', () => {
              this._received++, this.emit('update'), this._received + this._failed >= this._total && this._onComplete();
            }),
            i.baseTexture.once('error', () => {
              this._failed++, this.emit('update'), this._received + this._failed >= this._total && this._onComplete();
            }));
    });
  }
  _onComplete() {
    (this.loaded = !0),
      this.emit('complete'),
      this._failed > 0 && (this._failed >= this._total ? this.emit('fail') : this.emit('partlyfail', this._failed));
  }
  getTextureById(t) {
    return this.textures[t];
  }
}
function j(t) {
  return t.response && 'object' == typeof t.response
    ? t.response
    : t.response && 'string' == typeof t.response
    ? JSON.parse(t.response)
    : t.responseText
    ? JSON.parse(t.responseText)
    : void 0;
}
class q extends e {
  constructor(t) {
    super(),
      (this.path = t),
      (this.onSuccess = this.onSuccess.bind(this)),
      (this.onFail = this.onFail.bind(this)),
      (function (t, e, s) {
        let i,
          n = new XMLHttpRequest();
        n.open('GET', t, !0);
        try {
          n.responseType = 'json';
        } catch (t) {
          console.error('lottie-pixi loadAjax:', t);
        }
        n.send(),
          (n.onreadystatechange = function () {
            if (4 == n.readyState)
              if (200 == n.status) (i = j(n)), e(i);
              else
                try {
                  (i = j(n)), e(i);
                } catch (t) {
                  s && s(t);
                }
          });
      })(t, this.onSuccess, this.onFail);
  }
  onSuccess(t) {
    this.emit('success', t), this.emit('complete', t);
  }
  onFail(t) {
    this.emit('fail', t), this.emit('error', t);
  }
}
const Y = {
  Linear: { None: t => t },
  Ease: {
    In: (function () {
      const t = new s(0.42, 0, 1, 1);
      return function (e) {
        return t.get(e);
      };
    })(),
    Out: (function () {
      const t = new s(0, 0, 0.58, 1);
      return function (e) {
        return t.get(e);
      };
    })(),
    InOut: (function () {
      const t = new s(0.42, 0, 0.58, 1);
      return function (e) {
        return t.get(e);
      };
    })(),
    Bezier(t, e, i, n) {
      const r = new s(t, e, i, n);
      return function (t) {
        return r.get(t);
      };
    },
  },
  Elastic: {
    In: t => (0 === t ? 0 : 1 === t ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin(5 * (t - 1.1) * Math.PI)),
    Out: t => (0 === t ? 0 : 1 === t ? 1 : Math.pow(2, -10 * t) * Math.sin(5 * (t - 0.1) * Math.PI) + 1),
    InOut: t =>
      0 === t
        ? 0
        : 1 === t
        ? 1
        : (t *= 2) < 1
        ? -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin(5 * (t - 1.1) * Math.PI)
        : 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin(5 * (t - 1.1) * Math.PI) + 1,
  },
  Back: {
    In(t) {
      const e = 1.70158;
      return t * t * ((e + 1) * t - e);
    },
    Out(t) {
      const e = 1.70158;
      return --t * t * ((e + 1) * t + e) + 1;
    },
    InOut(t) {
      const e = 2.5949095;
      return (t *= 2) < 1 ? t * t * ((e + 1) * t - e) * 0.5 : 0.5 * ((t -= 2) * t * ((e + 1) * t + e) + 2);
    },
  },
  Bounce: {
    In: t => 1 - Y.Bounce.Out(1 - t),
    Out: t =>
      t < 1 / 2.75
        ? 7.5625 * t * t
        : t < 2 / 2.75
        ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        : t < 2.5 / 2.75
        ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375,
    InOut: t => (t < 0.5 ? 0.5 * Y.Bounce.In(2 * t) : 0.5 * Y.Bounce.Out(2 * t - 1) + 0.5),
  },
};
function J(s) {
  e.call(this),
    (this.element = s.element || {}),
    (this.duration = s.duration || 300),
    (this.living = !0),
    (this.resident = s.resident || !1),
    (this.infinite = s.infinite || !1),
    (this.alternate = s.alternate || !1),
    (this.repeats = s.repeats || 0),
    (this.delay = s.delay || 0),
    (this.wait = s.wait || 0),
    (this.timeScale = t.isNumber(s.timeScale) ? s.timeScale : 1),
    s.onComplete && this.on('complete', s.onComplete.bind(this)),
    s.onUpdate && this.on('update', s.onUpdate.bind(this)),
    this.init(),
    (this.paused = !1);
}
function V(e) {
  J.call(this, e), (e.from = e.from || {});
  for (const s in e.to) t.isUndefined(e.from[s]) && (e.from[s] = this.element[s]);
  (this.ease = e.ease || Y.Ease.InOut), (this.from = e.from), (this.to = e.to);
}
function H(e) {
  J.call(this, e),
    (this.dynamicProperties = []),
    (this._mdf = !1),
    (this.keyframes = t.copyJSON(e.keyframes)),
    (this.frameRate = e.frameRate || 30),
    (this.tpf = 1e3 / this.frameRate),
    (this.ip = t.isUndefined(e.ip) ? this.keyframes.ip : e.ip),
    (this.op = t.isUndefined(e.ip) ? this.keyframes.op : e.op),
    (this.tfs = this.op - this.ip),
    (this.duration = this.tfs * this.tpf),
    (this.ignoreProps = t.isArray(e.ignoreProps) ? e.ignoreProps : []),
    (this.transform = new i(this, this.keyframes.ks));
}
function $(t, e) {
  J.call(this, e),
    (this.runners = []),
    (this.queues = []),
    (this.cursor = 0),
    (this.total = 0),
    (this.alternate = !1),
    t && this.then(t);
}
(J.prototype = Object.create(e.prototype)),
  (J.prototype.update = function (e) {
    const s = this.direction * this.timeScale * e;
    if (this.waitCut > 0) return void (this.waitCut -= Math.abs(s));
    if (this.paused || !this.living || this.delayCut > 0)
      return void (this.delayCut > 0 && (this.delayCut -= Math.abs(s)));
    this.progress += s;
    let i = !1;
    const n = this.progress;
    let r;
    return (
      this.spill() &&
        (this.repeatsCut > 0 || this.infinite
          ? (this.repeatsCut > 0 && --this.repeatsCut,
            (this.delayCut = this.delay),
            this.alternate
              ? ((this.direction *= -1), (this.progress = t.codomainBounce(this.progress, 0, this.duration)))
              : ((this.direction = 1), (this.progress = t.euclideanModulo(this.progress, this.duration))))
          : (i = !0)),
      i
        ? (this.resident || (this.living = !1),
          (this.progress = t.clamp(n, 0, this.duration)),
          (r = this.nextPose()),
          this.emit('complete', r, n - this.progress))
        : ((r = this.nextPose()), this.emit('update', r, this.progress / this.duration)),
      r
    );
  }),
  (J.prototype.spill = function () {
    const t = this.progress <= 0 && -1 === this.direction,
      e = this.progress >= this.duration && 1 === this.direction;
    return t || e;
  }),
  (J.prototype.init = function () {
    (this.direction = 1),
      (this.progress = 0),
      (this.repeatsCut = this.repeats),
      (this.delayCut = this.delay),
      (this.waitCut = this.wait);
  }),
  (J.prototype.nextPose = function () {
    console.warn('should be overwrite');
  }),
  (J.prototype.linear = function (t, e, s) {
    return (e - t) * s + t;
  }),
  (J.prototype.setSpeed = function (t) {
    return (this.timeScale = t), this;
  }),
  (J.prototype.pause = function () {
    return (this.paused = !0), this;
  }),
  (J.prototype.resume = function () {
    return (this.paused = !1), this;
  }),
  (J.prototype.restart = J.prototype.resume),
  (J.prototype.stop = function () {
    return (this.repeats = 0), (this.infinite = !1), (this.progress = this.duration), this;
  }),
  (J.prototype.cancel = function () {
    return (this.living = !1), this;
  }),
  (V.prototype = Object.create(J.prototype)),
  (V.prototype.nextPose = function () {
    const t = {},
      e = this.ease(this.progress / this.duration);
    for (const s in this.to)
      void 0 !== this.element[s] && (this.element[s] = t[s] = this.linear(this.from[s], this.to[s], e));
    return t;
  }),
  (H.prototype = Object.create(J.prototype)),
  (H.prototype.prepareProperties = function (t) {
    const e = this.dynamicProperties.length;
    let s;
    for (s = 0; s < e; s += 1)
      this.dynamicProperties[s].getValue(t), this.dynamicProperties[s]._mdf && (this._mdf = !0);
  }),
  (H.prototype.addDynamicProperty = function (t) {
    -1 === this.dynamicProperties.indexOf(t) && this.dynamicProperties.push(t);
  }),
  (H.prototype.nextPose = function () {
    const t = {},
      e = this.ip + this.progress / this.tpf;
    return (
      this.prepareProperties(e),
      -1 === this.ignoreProps.indexOf('position') &&
        (-1 === this.ignoreProps.indexOf('x') && (t.x = this.element.x = this.transform.x),
        -1 === this.ignoreProps.indexOf('y') && (t.y = this.element.y = this.transform.y)),
      -1 === this.ignoreProps.indexOf('pivot') &&
        ((t.pivot = {}),
        -1 === this.ignoreProps.indexOf('pivotX') && (t.pivot.x = this.element.pivot.x = this.transform.anchorX),
        -1 === this.ignoreProps.indexOf('pivotY') && (t.pivot.y = this.element.pivot.y = this.transform.anchorY)),
      -1 === this.ignoreProps.indexOf('scale') &&
        ((t.scale = {}),
        -1 === this.ignoreProps.indexOf('scaleX') && (t.scale.x = this.element.scale.x = this.transform.scaleX),
        -1 === this.ignoreProps.indexOf('scaleY') && (t.scale.y = this.element.scale.y = this.transform.scaleY)),
      -1 === this.ignoreProps.indexOf('rotation') && (t.rotation = this.element.rotation = this.transform.rotation),
      -1 === this.ignoreProps.indexOf('alpha') && (t.alpha = this.element.alpha = this.transform.alpha),
      t
    );
  }),
  ($.prototype = Object.create(J.prototype)),
  ($.prototype.then = function (t) {
    return this.queues.push(t), (this.total = this.queues.length), this;
  }),
  ($.prototype.nextOne = function (t, e) {
    this.runners[this.cursor].init(), this.cursor++, (this._residueTime = Math.abs(e));
  }),
  ($.prototype.initOne = function () {
    const t = this.queues[this.cursor];
    (t.infinite = !1), (t.resident = !0), (t.element = this.element);
    let e = null;
    t.keyframes ? (e = new H(t)) : t.to && (e = new V(t)),
      null !== e && (e.on('complete', this.nextOne.bind(this)), this.runners.push(e));
  }),
  ($.prototype.nextPose = function (t) {
    return (
      !this.runners[this.cursor] && this.queues[this.cursor] && this.initOne(),
      this._residueTime > 0 && ((t += this._residueTime), (this._residueTime = 0)),
      this.runners[this.cursor].update(t)
    );
  }),
  ($.prototype.update = function (t) {
    if (this.wait > 0) return void (this.wait -= Math.abs(t));
    if (this.paused || !this.living || this.delayCut > 0)
      return void (this.delayCut > 0 && (this.delayCut -= Math.abs(t)));
    const e = this.cursor,
      s = this.nextPose(this.timeScale * t);
    return (
      this.emit('update', { index: e, pose: s }, this.progress / this.duration),
      this.spill() &&
        (this.repeats > 0 || this.infinite
          ? (this.repeats > 0 && --this.repeats, (this.delayCut = this.delay), (this.cursor = 0))
          : (this.resident || (this.living = !1), this.emit('complete', s))),
      s
    );
  }),
  ($.prototype.spill = function () {
    return this.cursor >= this.total;
  });
const K = { settings: w, UPDATE_PRIORITY: v, animationTicker: x.shared };
function Q(t) {
  K.animationTicker = t;
}
function Z(t) {
  (this.element = t),
    (this.animates = []),
    (this.timeScale = 1),
    (this.paused = !1),
    (this.updateDeltaTime = this.updateDeltaTime.bind(this)),
    K.animationTicker.add(this.updateDeltaTime, K.UPDATE_PRIORITY.HIGH);
}
(Z.prototype.clearAnimators = function (t) {
  if (this.paused) return;
  const e = this.animates;
  for (let s = 0; s < t.length; s++) {
    const i = t[s];
    e[i].living || e[i].resident || this.animates.splice(i, 1);
  }
}),
  (Z.prototype.updateDeltaTime = function (t) {
    if (this.animates.length <= 0) return;
    const e = t / K.settings.TARGET_FPMS;
    this.update(e);
  }),
  (Z.prototype.update = function (t) {
    if (this.paused) return;
    if (this.animates.length <= 0) return;
    t = this.timeScale * t;
    const e = [];
    for (let s = 0; s < this.animates.length; s++)
      this.animates[s].living || this.animates[s].resident ? this.animates[s].update(t) : e.push(s);
    e.length > 0 && this.clearAnimators(e);
  }),
  (Z.prototype.animate = function (t, e) {
    return (t.element = this.element), this._addMove(new V(t), e);
  }),
  (Z.prototype.queues = function (t, e, s) {
    return (e.element = this.element), this._addMove(new $(t, e), s);
  }),
  (Z.prototype.bodymovin = function (t, e) {
    return (t.element = this.element), this._addMove(new H(t), e);
  }),
  (Z.prototype._addMove = function (t, e) {
    return e && this.clearAll(), this.animates.push(t), t;
  }),
  (Z.prototype.pause = function () {
    this.paused = !0;
  }),
  (Z.prototype.resume = function () {
    this.paused = !1;
  }),
  (Z.prototype.restart = Z.prototype.resume),
  (Z.prototype.setSpeed = function (t) {
    this.timeScale = t;
  }),
  (Z.prototype.clearAll = function () {
    this.animates.length = 0;
  }),
  (b.prototype.setupAnimations = function () {
    this.animations || (this.animations = new Z(this));
  }),
  (b.prototype.animate = function (t, e) {
    return this.animations || this.setupAnimations(), this.animations.animate(t, e);
  }),
  (b.prototype.queues = function (t, e = {}, s) {
    return this.animations || this.setupAnimations(), this.animations.queues(t, e, s);
  }),
  (b.prototype.bodymovin = function (t, e) {
    return this.animations || this.setupAnimations(), this.animations.bodymovin(t, e);
  }),
  Object.defineProperties(b.prototype, {
    scaleXY: {
      get() {
        return this.scale.x;
      },
      set(t) {
        this.scale.set(t);
      },
    },
    scaleX: {
      get() {
        return this.scale.x;
      },
      set(t) {
        this.scale.x = t;
      },
    },
    scaleY: {
      get() {
        return this.scale.y;
      },
      set(t) {
        this.scale.y = t;
      },
    },
    pivotX: {
      get() {
        return this.pivot.x;
      },
      set(t) {
        this.pivot.x = t;
      },
    },
    pivotY: {
      get() {
        return this.pivot.y;
      },
      set(t) {
        this.pivot.y = t;
      },
    },
  }),
  (h.prototype.updateTransform = function () {
    this.emit('pretransform'),
      this._boundsID++,
      this.hierarchy && this.hierarchy.transform
        ? (this.hierarchy.updateTransform(), this.transform.updateTransform(this.hierarchy.transform))
        : this.transform.updateTransform(this.parent.transform),
      (this.worldAlpha = this.alpha * this.parent.worldAlpha);
    for (let t = 0, e = this.children.length; t < e; ++t) {
      const e = this.children[t];
      e.visible && e.updateTransform();
    }
    this.emit('posttransform');
  }),
  (h.prototype.containerUpdateTransform = h.prototype.updateTransform);
class tt extends e {
  constructor(t) {
    super(),
      (this.animate = null),
      t.keyframes &&
        t.useAESize &&
        (t.width !== t.keyframes.w || t.height !== t.keyframes.h) &&
        ((t.width = t.keyframes.w), (t.height = t.keyframes.h));
    const {
      view: e,
      width: s,
      height: i,
      transparent: r,
      antialias: h,
      preserveDrawingBuffer: o,
      resolution: a,
      forceCanvas: l,
      backgroundColor: p,
      clearBeforeRender: c,
      roundPixels: u,
      forceFXAA: d,
      legacy: f,
      powerPreference: m,
      sharedTicker: g,
      sharedLoader: y,
    } = t;
    (this.app = new P({
      view: e,
      width: s,
      height: i,
      transparent: r,
      antialias: h,
      preserveDrawingBuffer: o,
      resolution: a,
      forceCanvas: l,
      backgroundColor: p,
      clearBeforeRender: c,
      roundPixels: u,
      forceFXAA: d,
      legacy: f,
      powerPreference: m,
      sharedTicker: g,
      sharedLoader: y,
    })),
      (this.manager = new n(this.app)),
      (this.loaded = !1),
      this.parseData(t);
  }
  resizeWithAESize() {
    const { width: t, height: e } = this.app.renderer;
    (t === this.animate.keyframes.w && e === this.animate.keyframes.h) ||
      this.app.renderer.resize(this.animate.keyframes.w, this.animate.keyframes.h);
  }
  parseData(t) {
    (this.animate = this.manager.parseAnimation(t)),
      this.animate.isDisplayLoaded
        ? (t.useAESize && this.resizeWithAESize(), this.app.stage.addChild(this.animate.group))
        : this.animate.once('DisplayReady', () => {
            t.useAESize && this.resizeWithAESize(),
              this.app.stage.addChild(this.animate.group),
              this.emit('DisplayReady', this);
          }),
      this.animate.isImagesLoaded
        ? (this.loaded = !0)
        : (this.animate.once('success', () => {
            (this.loaded = !0), this.emit('success', this);
          }),
          this.animate.once('error', t => {
            this.emit('error', t);
          }));
  }
}
function et(e) {
  return (
    e.container && !e.view && (e.view = e.container),
    e.animationData && !e.keyframes && (e.keyframes = e.animationData),
    e.assetsPath && !e.prefix && (e.prefix = e.assetsPath.replace(/images\/?$/, '')),
    e.initialSegment && !e.initSegment && (e.initSegment = e.initialSegment),
    t.isBoolean(e.autoplay) && !t.isBoolean(e.autoStart) && (e.autoStart = e.autoplay),
    t.isBoolean(e.loop) && !t.isBoolean(e.infinite) && (e.infinite = e.loop),
    (e.view = t.isString(e.view) ? document.querySelector(e.view) : e.view),
    (e.useAESize = !t.isBoolean(e.useAESize) || e.useAESize),
    new tt(e)
  );
}
export {
  Y as Tween,
  et as loadAnimation,
  Q as useTicker,
  k as CompElement,
  z as PathLottie,
  G as SolidElement,
  R as SpriteElement,
  h as Container,
  q as LoadJson,
  N as LoadTexture,
};
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
