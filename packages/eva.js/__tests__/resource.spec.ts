import Resource, { RESOURCE_TYPE, LOAD_EVENT } from '../lib/loader/Resource';
import { EVADataRes, EVAImage } from './utils/resources';

const imageRes = EVAImage.from({
  name: 'image',
  preload: true,
  image: 'https://gw.alicdn.com/tfs/TB1dAN1BbY1gK0jSZTEXXXDQVXa-512-512.png',
});

const imageRes2 = EVAImage.from({
  name: 'image2',
  preload: true,
  image: 'https://gw.alicdn.com/tfs/TB1RIpUBhn1gK0jSZKPXXXvUXXa-1024-1024.png',
});

const dataRes = EVADataRes.from({
  name: 'vertex',
  data: {},
});

describe('resource management', () => {
  let res: Resource;
  beforeEach(() => {
    res = new Resource();
  });

  it('constructor', () => {
    expect(res.timeout).toBe(6000);
  });

  it('constructor with timeout', () => {
    res = new Resource({ timeout: 5000 });
    expect(res.timeout).toBe(5000);
  });

  it('add resources', done => {
    const progressSpy = jest.fn();
    res.on(LOAD_EVENT.LOADED, progressSpy);
    res.on(LOAD_EVENT.COMPLETE, () => {
      expect(progressSpy).toBeCalledTimes(1);
      done();
    });
    res.addResource([imageRes]);
    res.preload();
  });

  it('resources is null', () => {
    res.addResource(null);
    expect('no resources').toHaveBeenWarned();
  });

  it('resources is undefined', () => {
    res.addResource(undefined);
    expect('no resources').toHaveBeenWarned();
  });

  it('resources is empty', () => {
    res.addResource([]);
    expect('no resources').toHaveBeenWarned();
  });

  it('resources is duplicate', () => {
    res.addResource([imageRes, imageRes]);
    expect(`${imageRes.name} was already added`).toHaveBeenWarned();
  });

  it('load image resource', done => {
    const checkResourceSpy = jest.spyOn(Resource.prototype as any, 'doComplete');
    res.on(LOAD_EVENT.COMPLETE, () => {
      expect(checkResourceSpy).toHaveBeenCalledTimes(1);
      done();
    });
    res.loadConfig([imageRes]);
  });

  it('load raw data resource', async () => {
    const resource = await res.loadSingle(dataRes);
    expect(resource.name).toBe('vertex');
  });

  it('preload without resource', done => {
    res.on(LOAD_EVENT.COMPLETE, loader => {
      expect(loader.resourceTotal).toBe(0);
      done();
    });
    res.preload();
  });

  it('preload with resources', done => {
    const progressSpy = jest.fn();
    res.on(LOAD_EVENT.PROGRESS, progressSpy);
    res.on(LOAD_EVENT.COMPLETE, loader => {
      expect(progressSpy).toBeCalledTimes(2);
      expect(loader.resourceTotal).toBe(2);
      done();
    });
    res.addResource([imageRes, imageRes2]);
    res.preload();
  });

  /**
   * 连续触发两次 preload，会导致 resourceManager 的 progress 属性被覆盖
   */
  it.skip('preload twice', async () => {
    res.loadConfig([imageRes]);
    res.loadConfig([imageRes2]);

    const [image, dragonBone] = await Promise.all([res.getResource(imageRes.name), res.getResource(imageRes2.name)]);

    expect(image).toMatchObject({});
    expect(dragonBone).toMatchObject({});
  });

  it('listening load event', done => {
    const startSpy = jest.fn();
    const progressSpy = jest.fn();
    const loadedSpy = jest.fn();
    res.on(LOAD_EVENT.START, startSpy);
    res.on(LOAD_EVENT.PROGRESS, progressSpy);
    res.on(LOAD_EVENT.LOADED, loadedSpy);
    res.on(LOAD_EVENT.COMPLETE, () => {
      expect(startSpy).toBeCalledTimes(1);
      expect(progressSpy).toBeCalledTimes(1);
      expect(loadedSpy).toBeCalledTimes(1);
      done();
    });

    res.loadConfig([imageRes]);
  });

  it('listening error event', done => {
    const errorSpy = jest.fn();
    res.on(LOAD_EVENT.ERROR, errorSpy);
    res.on(LOAD_EVENT.COMPLETE, () => {
      expect(errorSpy).toBeCalled();
      done();
    });

    const mockErrorResource = {
      type: RESOURCE_TYPE.IMAGE,
      name: 'mockError',
      preload: true,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/tfs/TB1dAN1BbY1gK0jSZTEXXXDQVXa-512-512.png',
        },
      },
    };

    res.loadConfig([mockErrorResource]);
  });

  it('get resource', async () => {
    res.addResource([imageRes]);
    const resource = await res.getResource(imageRes.name);
    expect(resource.name).toBe(imageRes.name);
  });

  it('get resource not exists', async () => {
    const resource = await res.getResource('notExistsRes');
    expect(resource).toMatchObject({});
  });

  it('regist instance', done => {
    const imageInstanceCallback = jest.fn();
    res.registerInstance(RESOURCE_TYPE.IMAGE, imageInstanceCallback);
    res.on(LOAD_EVENT.COMPLETE, () => {
      expect(imageInstanceCallback).toHaveBeenCalled();
      done();
    });
    res.loadConfig([imageRes]);
  });

  it('regist instance method which throw an error', done => {
    const imageInstanceCallback = () => {
      throw new Error('make instance error');
    };
    res.registerInstance(RESOURCE_TYPE.IMAGE, imageInstanceCallback);

    res.on(LOAD_EVENT.ERROR, (_, event) => {
      expect(event.errMsg).toBe('make instance error');
      expect(event.resource.name).toBe(imageRes.name);
      done();
    });

    res.loadConfig([imageRes]);
  });

  it('destroy resource not exists', () => {
    const resourceDestroyCallback = jest.fn();
    res.registerDestroy(RESOURCE_TYPE.IMAGE, resourceDestroyCallback);
    res.destroy('test');
    expect(resourceDestroyCallback).not.toHaveBeenCalled();
  });

  it('regist destroy callback which throw an error', async () => {
    res.addResource([imageRes]);
    res.registerDestroy(RESOURCE_TYPE.IMAGE, () => {
      throw new Error('destroy error');
    });
    await res.destroy(imageRes.name);
    expect(`destroy resource ${imageRes.name} error with 'destroy error'`).toHaveBeenWarned();
  });

  it('destroy resource by resource name', async () => {
    const imageResourceCallback = jest.fn();
    res.registerDestroy(RESOURCE_TYPE.IMAGE, imageResourceCallback);
    res.addResource([imageRes]);
    await res.destroy(imageRes.name);
    expect(imageResourceCallback).toBeCalled();
  });
});
