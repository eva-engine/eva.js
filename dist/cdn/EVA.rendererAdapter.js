(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.rendererAdapter = {}), global.PIXI));
}(this, (function (exports, pixi_js) { 'use strict';

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

    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(params) {
            var _this = this;
            params.autoStart = false;
            _this = _super.call(this, params) || this;
            return _this;
        }
        return Application;
    }(pixi_js.Application));

    var Container = (function (_super) {
        __extends(Container, _super);
        function Container() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Container;
    }(pixi_js.Container));

    var Graphics = (function (_super) {
        __extends(Graphics, _super);
        function Graphics() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Graphics;
    }(pixi_js.Graphics));

    var NinePatch = (function (_super) {
        __extends(NinePatch, _super);
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
    }(pixi_js.mesh.NineSlicePlane));

    var Sprite = (function () {
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
    }());

    var SpriteAnimation = (function () {
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
    }());

    var Text = (function (_super) {
        __extends(Text, _super);
        function Text(text, style) {
            return _super.call(this, text, style) || this;
        }
        return Text;
    }(pixi_js.Text));

    var PIXITilingSprite = pixi_js.extras.TilingSprite;
    var TilingSprite = (function () {
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
    }());

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
