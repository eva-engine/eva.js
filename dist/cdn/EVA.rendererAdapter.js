(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('pixi.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'pixi.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.rendererAdapter = {}), global.PIXI));
}(this, (function (exports, pixi_js) { 'use strict';

  class Application extends pixi_js.Application {
      constructor(params) {
          params.autoStart = false;
          super(params);
      }
  }

  class Container extends pixi_js.Container {
  }

  class Graphics extends pixi_js.Graphics {
  }

  class NinePatch extends pixi_js.mesh.NineSlicePlane {
      constructor(img, leftWidth, topHeight, rightWidth, bottomHeight) {
          let texture;
          if (img === 'string') {
              texture = pixi_js.Texture.fromFrame(img);
          }
          else {
              texture = pixi_js.Texture.from(img);
          }
          super(texture, leftWidth, topHeight, rightWidth, bottomHeight);
      }
  }

  class Sprite {
      constructor(image) {
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
      set image(val) {
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
      }
      get image() {
          return this._image;
      }
  }

  class SpriteAnimation {
      constructor({ frames }) {
          this.animatedSprite = new pixi_js.extras.AnimatedSprite(frames);
      }
      play() {
          this.animatedSprite.play();
      }
      stop() {
          this.animatedSprite.stop();
      }
      gotoAndPlay(frameNumber) {
          this.animatedSprite.gotoAndPlay(frameNumber);
      }
      gotoAndStop(frameNumber) {
          this.animatedSprite.gotoAndStop(frameNumber);
      }
      set speed(val) {
          this.animatedSprite.animationSpeed = val;
      }
      get speed() {
          return this.animatedSprite.animationSpeed;
      }
  }

  class Text extends pixi_js.Text {
      constructor(text, style) {
          super(text, style);
      }
  }

  const PIXITilingSprite = pixi_js.extras.TilingSprite;
  class TilingSprite {
      constructor(image) {
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
      set image(val) {
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
      }
      get image() {
          return this._image;
      }
  }

  exports.Application = Application;
  exports.Container = Container;
  exports.Graphics = Graphics;
  exports.NinePatch = NinePatch;
  exports.Sprite = Sprite;
  exports.SpriteAnimation = SpriteAnimation;
  exports.Text = Text;
  exports.TilingSprite = TilingSprite;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
