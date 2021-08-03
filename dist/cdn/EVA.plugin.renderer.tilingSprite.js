(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter'))
    : typeof define === 'function' && define.amd
    ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'], factory)
    : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory(
        ((global.EVA = global.EVA || {}),
        (global.EVA.plugin = global.EVA.plugin || {}),
        (global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}),
        (global.EVA.plugin.renderer.tilingSprite = {})),
        global.EVA,
        global.EVA.plugin.renderer,
        global.EVA.rendererAdapter,
      ));
})(this, function (exports, eva_js, pluginRenderer, rendererAdapter) {
  'use strict';

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
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  class TilingSprite$2 extends eva_js.Component {
    constructor() {
      super(...arguments);
      this.resource = '';
      this.tileScale = {
        x: 1,
        y: 1,
      };
      this.tilePosition = {
        x: 0,
        y: 0,
      };
    }
    init(obj) {
      if (obj) {
        this.resource = obj.resource;
        this.tileScale = obj.tileScale;
        this.tilePosition = obj.tilePosition;
      }
    }
  }
  TilingSprite$2.componentName = 'TilingSprite';
  __decorate([eva_js.decorators.IDEProp], TilingSprite$2.prototype, 'resource', void 0);
  __decorate([eva_js.decorators.IDEProp], TilingSprite$2.prototype, 'tileScale', void 0);
  __decorate([eva_js.decorators.IDEProp], TilingSprite$2.prototype, 'tilePosition', void 0);

  let TilingSprite = class TilingSprite extends pluginRenderer.Renderer {
    constructor() {
      super(...arguments);
      this.name = 'TilingSprite';
      this.imgs = {};
    }
    init() {
      this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
      this.renderSystem.rendererManager.register(this);
    }
    rendererUpdate(gameObject) {
      const {width, height} = gameObject.transform.size;
      const img = this.imgs[gameObject.id];
      if (img) {
        img.tilingSprite.width = width;
        img.tilingSprite.height = height;
      }
    }
    componentChanged(changed) {
      return __awaiter(this, void 0, void 0, function* () {
        if (changed.componentName === 'TilingSprite') {
          const component = changed.component;
          if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
            const sprite = new rendererAdapter.TilingSprite(null);
            eva_js.resource.getResource(component.resource).then(({data}) => {
              if (!data) {
                throw new Error(`GameObject:${changed.gameObject.name}'s TilingSprite resource load error`);
              }
              sprite.image = data.image;
            });
            this.imgs[changed.gameObject.id] = sprite;
            this.containerManager.getContainer(changed.gameObject.id).addChildAt(sprite.tilingSprite, 0);
            this.setProp(changed.gameObject.id, component);
          } else if (changed.type === eva_js.OBSERVER_TYPE.CHANGE) {
            if (changed.prop.prop[0] === 'resource') {
              const {data} = yield eva_js.resource.getResource(component.resource);
              if (!data) {
                throw new Error(`GameObject:${changed.gameObject.name}'s TilingSprite resource load error`);
              }
              this.imgs[changed.gameObject.id].image = data.image;
            } else {
              this.setProp(changed.gameObject.id, component);
            }
          } else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
            const sprite = this.imgs[changed.gameObject.id];
            this.containerManager.getContainer(changed.gameObject.id).removeChild(sprite.tilingSprite);
            sprite.tilingSprite.destory(true);
            delete this.imgs[changed.gameObject.id];
          }
        }
      });
    }
    setProp(id, component) {
      this.imgs[id].tilingSprite.tilePosition = component.tilePosition;
      this.imgs[id].tilingSprite.tileScale = component.tileScale;
    }
  };
  TilingSprite = __decorate(
    [
      eva_js.decorators.componentObserver({
        TilingSprite: [
          {prop: ['resource'], deep: false},
          {prop: ['tileScale'], deep: true},
          {prop: ['tilePosition'], deep: true},
        ],
      }),
    ],
    TilingSprite,
  );
  var TilingSprite$1 = TilingSprite;

  exports.TilingSprite = TilingSprite$2;
  exports.TilingSpriteSystem = TilingSprite$1;

  Object.defineProperty(exports, '__esModule', {value: true});
});
