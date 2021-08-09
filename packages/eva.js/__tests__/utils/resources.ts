import { RESOURCE_TYPE } from '../../lib';

export interface EVAResourceParams {
  name: string;
  preload: boolean;
  type: RESOURCE_TYPE;
  imageType: 'png' | 'jpg' | 'jpeg' | 'webp';
  image: string;
  ske: string;
  tex: string;
  json: string;
  data: Record<string, any>;
}

type EVAResourceObject = Record<string, any>;

export class EVADataRes {
  static from(options: Partial<EVAResourceParams>): EVAResourceObject {
    const { name, data } = options;
    return {
      name,
      type: 'data',
      src: {
        vertex: {
          type: 'data',
          data,
        },
      },
    };
  }
}

export class EVADragonBone {
  static from(options: Partial<EVAResourceParams>): EVAResourceObject {
    const { name, preload, image, imageType = 'png', ske, tex } = options;
    return {
      name,
      type: RESOURCE_TYPE.DRAGONBONE,
      preload,
      src: {
        image: {
          type: imageType,
          url: image,
        },
        ske: {
          type: 'json',
          url: ske,
        },
        tex: {
          type: 'json',
          url: tex,
        },
      },
    };
  }
}

export class EVAImage {
  static from(options: Partial<EVAResourceParams>): EVAResourceObject {
    const { name, image, preload, imageType = 'png' } = options;
    return {
      name,
      preload,
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: imageType,
          url: image,
        },
      },
    };
  }
}

export class EVASprite {
  static from(options: Partial<EVAResourceParams>): EVAResourceObject {
    const { name, image, json, preload, imageType = 'png' } = options;
    return {
      name,
      preload,
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: imageType,
          url: image,
        },
        json: {
          type: 'json',
          url: json,
        },
      },
    };
  }
}

export class EVASpriteAnimation {
  static from(options: Partial<EVAResourceParams>): EVAResourceObject {
    const { name, image, json, preload, imageType = 'png' } = options;
    return {
      name,
      preload,
      type: RESOURCE_TYPE.SPRITE_ANIMATION,
      src: {
        image: {
          type: imageType,
          url: image,
        },
        json: {
          type: 'json',
          url: json,
        },
      },
    };
  }
}
