(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('pixi.js')) :
  typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', 'pixi.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.event = {}), global.EVA, global.EVA.plugin.renderer, global.PIXI));
}(this, (function (exports, eva_js, pluginRenderer, pixi_js) { 'use strict';

  exports.HIT_AREA_TYPE = void 0;
  (function (HIT_AREA_TYPE) {
      HIT_AREA_TYPE["Circle"] = "Circle";
      HIT_AREA_TYPE["Ellipse"] = "Ellipse";
      HIT_AREA_TYPE["Polygon"] = "Polygon";
      HIT_AREA_TYPE["Rect"] = "Rect";
      HIT_AREA_TYPE["RoundedRect"] = "RoundedRect";
  })(exports.HIT_AREA_TYPE || (exports.HIT_AREA_TYPE = {}));
  class Event$2 extends eva_js.Component {
      constructor() {
          super(...arguments);
          this.hitArea = undefined;
      }
      init(params) {
          params && Object.assign(this, params);
      }
  }
  Event$2.componentName = 'Event';

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

  const hitAreaFunc = {
      Circle: pixi_js.Circle,
      Ellipse: pixi_js.Ellipse,
      Polygon: pixi_js.Polygon,
      Rect: pixi_js.Rectangle,
      RoundedRect: pixi_js.RoundedRectangle,
  };
  const propertyForHitArea = {
      Circle: ['x', 'y', 'radius'],
      Ellipse: ['x', 'y', 'width', 'height'],
      Rect: ['x', 'y', 'width', 'height'],
      RoundedRect: ['x', 'y', 'width', 'height', 'radius'],
      Polygon: ['paths'],
  };
  let Event = class Event extends pluginRenderer.Renderer {
      constructor() {
          super(...arguments);
          this.name = 'Event';
      }
      init({ moveWhenInside = false } = {}) {
          this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
          this.renderSystem.rendererManager.register(this);
          try {
              this.renderSystem.application.renderer.plugins.interaction.moveWhenInside = moveWhenInside;
          }
          catch (e) {
              console.error('Setting moveWhenInside error.', e);
          }
      }
      componentChanged(changed) {
          switch (changed.type) {
              case eva_js.OBSERVER_TYPE.ADD:
                  this.add(changed);
                  break;
              case eva_js.OBSERVER_TYPE.REMOVE:
                  this.remove(changed);
                  break;
              case eva_js.OBSERVER_TYPE.CHANGE:
                  this.change(changed);
                  break;
          }
      }
      add(changed) {
          const container = this.containerManager.getContainer(changed.gameObject.id);
          container.interactive = true;
          container.interactiveChildren = true;
          const component = changed.component;
          if (component.hitArea) {
              this.addHitArea(changed, container, component.hitArea);
          }
          container.on('pointertap', e => {
              component.emit('tap', {
                  stopPropagation: () => e.stopPropagation(),
                  data: {
                      pointerId: e.data.pointerId,
                      position: {
                          x: e.data.global.x,
                          y: e.data.global.y,
                      },
                  },
                  gameObject: component.gameObject,
              });
          });
          container.on('pointerdown', e => {
              component.emit('touchstart', {
                  stopPropagation: () => e.stopPropagation(),
                  data: {
                      pointerId: e.data.pointerId,
                      position: {
                          x: e.data.global.x,
                          y: e.data.global.y,
                      },
                  },
                  gameObject: component.gameObject,
              });
          });
          container.on('pointermove', e => {
              component.emit('touchmove', {
                  stopPropagation: () => e.stopPropagation(),
                  data: {
                      pointerId: e.data.pointerId,
                      position: {
                          x: e.data.global.x,
                          y: e.data.global.y,
                      },
                  },
                  gameObject: component.gameObject,
              });
          });
          container.on('pointerup', e => {
              component.emit('touchend', {
                  stopPropagation: () => e.stopPropagation(),
                  data: {
                      pointerId: e.data.pointerId,
                      position: {
                          x: e.data.global.x,
                          y: e.data.global.y,
                      },
                  },
                  gameObject: component.gameObject,
              });
          });
          container.on('pointerupoutside', e => {
              component.emit('touchendoutside', {
                  stopPropagation: () => e.stopPropagation(),
                  data: {
                      pointerId: e.data.pointerId,
                      position: {
                          x: e.data.global.x,
                          y: e.data.global.y,
                      },
                  },
                  gameObject: component.gameObject,
              });
          });
          container.on('pointercancel', e => {
              component.emit('touchcancel', {
                  stopPropagation: () => e.stopPropagation(),
                  data: {
                      pointerId: e.data.pointerId,
                      position: {
                          x: e.data.global.x,
                          y: e.data.global.y,
                      },
                  },
                  gameObject: component.gameObject,
              });
          });
      }
      remove(changed) {
          const container = this.containerManager.getContainer(changed.gameObject.id);
          container.interactive = false;
          container.off('tap');
          container.off('pointerdown');
          container.off('pointermove');
          container.off('pointerup');
          container.off('pointerupoutside');
          container.off('pointercancel');
          changed.component.removeAllListeners();
      }
      change(changed) {
          const container = this.containerManager.getContainer(changed.gameObject.id);
          container.interactive = true;
          const component = changed.component;
          if (component.hitArea) {
              this.addHitArea(changed, container, component.hitArea);
          }
          else {
              component.hitArea = null;
          }
      }
      addHitArea(changed, container, hitArea) {
          const { type, style } = hitArea;
          if (!hitAreaFunc[type]) {
              console.error(`${changed.gameObject.name}'s hitArea type is not defined`);
              return;
          }
          const params = [];
          for (const key of propertyForHitArea[type]) {
              params.push(style[key]);
          }
          const hitAreaShape = new hitAreaFunc[type](...params);
          container.hitArea = hitAreaShape;
      }
  };
  Event.systemName = 'Event';
  Event = __decorate([
      eva_js.decorators.componentObserver({
          Event: [{ prop: ['hitArea'], deep: true }],
      })
  ], Event);
  var Event$1 = Event;

  exports.Event = Event$2;
  exports.EventSystem = Event$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
