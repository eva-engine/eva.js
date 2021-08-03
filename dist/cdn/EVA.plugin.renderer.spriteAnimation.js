(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@eva/eva.js'), require('@eva/plugin-renderer'), require('@eva/renderer-adapter'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter', 'pixi.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.EVA = global.EVA || {}, global.EVA.plugin = global.EVA.plugin || {}, global.EVA.plugin.renderer = global.EVA.plugin.renderer || {}, global.EVA.plugin.renderer.spriteAnimation = {}), global.EVA, global.EVA.plugin.renderer, global.EVA.rendererAdapter, global.PIXI));
}(this, (function (exports, eva_js, pluginRenderer, rendererAdapter, pixi_js) { 'use strict';

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

    class SpriteAnimation$2 extends eva_js.Component {
        constructor() {
            super(...arguments);
            this.resource = '';
            this.autoPlay = true;
            this.speed = 100;
            this.waitPlay = false;
            this.waitStop = false;
            this.times = Infinity;
            this.count = 0;
        }
        init(obj) {
            obj && Object.assign(this, obj);
            this.on('loop', () => {
                if (++this.count >= this.times) {
                    this.animate.stop();
                    this.emit('complete');
                }
            });
        }
        play(times = Infinity) {
            if (times === 0) {
                return;
            }
            this.times = times;
            if (!this.animate) {
                this.waitPlay = true;
            }
            else {
                this.animate.play();
                this.count = 0;
            }
        }
        stop() {
            if (!this.animate) {
                this.waitStop = true;
            }
            else {
                this.animate.stop();
            }
        }
        set animate(val) {
            this._animate = val;
            if (this.waitPlay) {
                this.waitPlay = false;
                this.play(this.times);
            }
            if (this.waitStop) {
                this.waitStop = false;
                this.stop();
            }
        }
        get animate() {
            return this._animate;
        }
        gotoAndPlay(frameNumber) {
            this.animate.gotoAndPlay(frameNumber);
        }
        gotoAndStop(frameNumber) {
            this.animate.gotoAndStop(frameNumber);
        }
    }
    SpriteAnimation$2.componentName = 'SpriteAnimation';
    __decorate([
        eva_js.decorators.IDEProp
    ], SpriteAnimation$2.prototype, "resource", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], SpriteAnimation$2.prototype, "autoPlay", void 0);
    __decorate([
        eva_js.decorators.IDEProp
    ], SpriteAnimation$2.prototype, "speed", void 0);

    const resourceKeySplit = '_s|r|c_';
    eva_js.resource.registerInstance(eva_js.RESOURCE_TYPE.SPRITE_ANIMATION, ({ name, data }) => {
        return new Promise(r => {
            const textureObj = data.json;
            const texture = pixi_js.BaseTexture.from(data.image);
            const frames = textureObj.frames || {};
            const animations = textureObj.animations || {};
            const newFrames = {};
            for (const key in frames) {
                const newKey = name + resourceKeySplit + key;
                newFrames[newKey] = frames[key];
            }
            for (const key in animations) {
                const spriteList = [];
                if (animations[key] && animations[key].length >= 0) {
                    for (const spriteName of animations[key]) {
                        const newSpriteName = name + resourceKeySplit + spriteName;
                        spriteList.push(newSpriteName);
                    }
                }
                animations[key] = spriteList;
            }
            textureObj.frames = newFrames;
            const spriteSheet = new pixi_js.Spritesheet(texture, textureObj);
            spriteSheet.parse(() => {
                const { textures } = spriteSheet;
                const spriteFrames = [];
                for (const key in textures) {
                    spriteFrames.push(textures[key]);
                }
                r(spriteFrames);
            });
        });
    });
    eva_js.resource.registerDestroy(eva_js.RESOURCE_TYPE.SPRITE_ANIMATION, ({ instance }) => {
        if (!instance)
            return;
        for (const texture of instance) {
            texture.destroy(true);
        }
    });
    let SpriteAnimation = class SpriteAnimation extends pluginRenderer.Renderer {
        constructor() {
            super(...arguments);
            this.name = 'SpriteAnimation';
            this.animates = {};
            this.autoPlay = {};
        }
        init() {
            this.renderSystem = this.game.getSystem(pluginRenderer.RendererSystem);
            this.renderSystem.rendererManager.register(this);
        }
        rendererUpdate(gameObject) {
            const { width, height } = gameObject.transform.size;
            if (this.animates[gameObject.id]) {
                this.animates[gameObject.id].animatedSprite.width = width;
                this.animates[gameObject.id].animatedSprite.height = height;
            }
        }
        componentChanged(changed) {
            return __awaiter(this, void 0, void 0, function* () {
                if (changed.componentName === 'SpriteAnimation') {
                    const component = changed.component;
                    this.autoPlay[changed.gameObject.id] = component.autoPlay;
                    if (changed.type === eva_js.OBSERVER_TYPE.ADD) {
                        const { instance: frames } = yield eva_js.resource.getResource(component.resource);
                        if (!frames) {
                            console.error(`GameObject:${changed.gameObject.name}'s Img resource load error`);
                        }
                        this.add({
                            frames: frames,
                            id: changed.gameObject.id,
                            component,
                        });
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.CHANGE) {
                        if (changed.prop && changed.prop.prop[0] === 'speed') {
                            this.animates[changed.gameObject.id].speed =
                                1000 / 60 / component.speed;
                        }
                        else {
                            const { instance: frames } = yield eva_js.resource.getResource(component.resource);
                            if (!frames) {
                                console.error(`GameObject:${changed.gameObject.name}'s Img resource load error`);
                            }
                            this.change({
                                frames: frames,
                                id: changed.gameObject.id,
                                component,
                            });
                        }
                    }
                    else if (changed.type === eva_js.OBSERVER_TYPE.REMOVE) {
                        this.remove(changed.gameObject.id);
                    }
                }
            });
        }
        add({ frames, id, component }) {
            const animate = new rendererAdapter.SpriteAnimation({ frames });
            this.animates[id] = animate;
            this.containerManager
                .getContainer(id)
                .addChildAt(animate.animatedSprite, 0);
            animate.animatedSprite.onComplete = () => {
                component.emit('complete');
            };
            animate.animatedSprite.onFrameChange = () => {
                component.emit('frameChange');
            };
            animate.animatedSprite.onLoop = () => {
                component.emit('loop');
            };
            component.animate = this.animates[id];
            this.animates[id].speed = 1000 / 60 / component.speed;
            if (this.autoPlay[id]) {
                animate.animatedSprite.play();
            }
        }
        change({ frames, id, component }) {
            this.remove(id, true);
            this.add({ frames, id, component });
        }
        remove(id, isChange) {
            const animate = this.animates[id];
            this.autoPlay[id] = animate.animatedSprite.playing;
            this.containerManager.getContainer(id).removeChild(animate.animatedSprite);
            animate.animatedSprite.destroy(true);
            delete this.animates[id];
            if (!isChange) {
                delete this.autoPlay[id];
            }
        }
    };
    SpriteAnimation.systemName = 'SpriteAnimation';
    SpriteAnimation = __decorate([
        eva_js.decorators.componentObserver({
            SpriteAnimation: ['speed', 'resource'],
        })
    ], SpriteAnimation);
    var SpriteAnimation$1 = SpriteAnimation;

    exports.SpriteAnimation = SpriteAnimation$2;
    exports.SpriteAnimationSystem = SpriteAnimation$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
