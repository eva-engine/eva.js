(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('pixi.js'), require('@eva/plugin-renderer')) :
  typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', 'pixi.js', '@eva/plugin-renderer'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.graphics = {}), global.EVA, global.PIXI, global.EVA.plugin.renderer));
}(this, (function (exports, eva_js, pixi_js, pluginRenderer) { 'use strict';

  class Graphics$3 extends pixi_js.Graphics {
  }

  class Graphics$2 extends eva_js.Component {
      constructor() {
          super(...arguments);
          this.graphics = null;
      }
      init() {
          this.graphics = new Graphics$3();
      }
  }
  Graphics$2.componentName = 'Graphics';

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

    var Graphics = (function (_super) {
        __extends(Graphics, _super);
        function Graphics() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'Graphics';
            return _this;
        }
        Graphics.prototype.init = function () {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        };
        Graphics.prototype.componentChanged = function (changed) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .addChildAt(changed.component.graphics, 0);
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                        this.containerManager
                            .getContainer(changed.gameObject.id)
                            .removeChild(changed.component.graphics);
                        changed.component.graphics.destroy(true);
                    }
                    return [2];
                });
            });
        };
        Graphics.systemName = 'Graphics';
        Graphics = __decorate([
            eva_js.decorators.componentObserver({
                Graphics: ['graphics'],
            })
        ], Graphics);
        return Graphics;
    }(pluginRenderer.Renderer));

  exports.Graphics = Graphics$2;
  exports.GraphicsSystem = Graphics$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
