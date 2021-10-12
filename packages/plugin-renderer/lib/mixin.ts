import { BaseTexture, utils } from 'pixi.js';

export const mixinPIXI = () => {
    BaseTexture.prototype.destroy = function () {
        if (this.imageUrl) {
            delete utils.TextureCache[this.imageUrl];

            this.imageUrl = null;
        }

        this.source = null;

        this.dispose();

        BaseTexture.removeFromCache(this);
        this.textureCacheIds = null;

        this._destroyed = true;
    };
}