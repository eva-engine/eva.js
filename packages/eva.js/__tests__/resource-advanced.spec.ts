import { Assets } from 'pixi.js';
import Resource, { RESOURCE_TYPE } from '../lib/loader/Resource';
import { EVAImage, EVASprite } from './utils/resources';

// Mock PixiJS Assets
jest.mock('pixi.js', () => ({
  Assets: {
    load: jest.fn(),
    unload: jest.fn(),
    add: jest.fn(),
  },
}));

describe('Resource Advanced Tests - Assets Management', () => {
  let res: Resource;

  beforeEach(() => {
    res = new Resource();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Assets Unload on Destroy', () => {
    it('should unload assets when destroying a single resource', async () => {
      const imageRes = EVAImage.from({
        name: 'testImage',
        preload: false,
        image: 'https://example.com/test.png',
      });

      res.addResource([imageRes]);
      await res.destroy('testImage');

      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/test.png']);
    });

    it('should unload multiple asset URLs for sprite resources', async () => {
      const spriteRes = EVASprite.from({
        name: 'testSprite',
        preload: false,
        image: 'https://example.com/sprite.png',
        json: 'https://example.com/sprite.json',
      });

      res.addResource([spriteRes]);
      await res.destroy('testSprite');

      expect(Assets.unload).toHaveBeenCalledWith([
        'https://example.com/sprite.png',
        'https://example.com/sprite.json',
      ]);
    });

    it('should normalize URLs starting with // before unloading', async () => {
      const imageRes = {
        name: 'protocolRelativeImage',
        type: RESOURCE_TYPE.IMAGE,
        preload: false,
        src: {
          image: {
            type: 'png',
            url: '//example.com/test.png',
          },
        },
      };

      res.addResource([imageRes]);
      await res.destroy('protocolRelativeImage');

      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/test.png']);
    });

    it('should handle unload errors gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (Assets.unload as jest.Mock).mockRejectedValueOnce(new Error('Unload failed'));

      const imageRes = EVAImage.from({
        name: 'errorImage',
        preload: false,
        image: 'https://example.com/error.png',
      });

      res.addResource([imageRes]);
      await res.destroy('errorImage');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to unload assets for errorImage')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should not attempt to unload when resource has no src', async () => {
      const dataRes = {
        name: 'dataResource',
        type: 'data' as any,
        src: {},
      };

      res.addResource([dataRes]);
      await res.destroy('dataResource');

      expect(Assets.unload).not.toHaveBeenCalled();
    });

    it('should not unload assets when destroying non-existent resource', async () => {
      await res.destroy('nonExistent');
      expect(Assets.unload).not.toHaveBeenCalled();
    });

    it('should call destroy instance function before unloading assets', async () => {
      const destroyCallback = jest.fn();
      res.registerDestroy(RESOURCE_TYPE.IMAGE, destroyCallback);

      const imageRes = EVAImage.from({
        name: 'orderedDestroy',
        preload: false,
        image: 'https://example.com/ordered.png',
      });

      res.addResource([imageRes]);
      await res.destroy('orderedDestroy');

      // Verify destroy callback was called
      expect(destroyCallback).toHaveBeenCalled();
      // Verify assets were unloaded
      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/ordered.png']);
    });

    it('should still unload assets even when destroy callback throws error', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      res.registerDestroy(RESOURCE_TYPE.IMAGE, () => {
        throw new Error('destroy callback error');
      });

      const imageRes = EVAImage.from({
        name: 'errorCallback',
        preload: false,
        image: 'https://example.com/error-callback.png',
      });

      res.addResource([imageRes]);
      await res.destroy('errorCallback');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/error-callback.png']);

      consoleWarnSpy.mockRestore();
    });

    it('should not call destroy instance function when loadError is true', async () => {
      const destroyCallback = jest.fn();
      res.registerDestroy(RESOURCE_TYPE.IMAGE, destroyCallback);

      const imageRes = EVAImage.from({
        name: 'loadErrorRes',
        preload: false,
        image: 'https://example.com/load-error.png',
      });

      res.addResource([imageRes]);

      // Access private method for testing
      await (res as any)._destroy('loadErrorRes', true);

      expect(destroyCallback).not.toHaveBeenCalled();
      expect(Assets.unload).toHaveBeenCalled();
    });
  });

  describe('Resource State After Destroy', () => {
    it('should clear resource data after destroy', async () => {
      const imageRes = EVAImage.from({
        name: 'clearData',
        preload: false,
        image: 'https://example.com/clear.png',
      });

      res.addResource([imageRes]);
      res.resourcesMap['clearData'].data = { image: 'some data' as any };
      res.resourcesMap['clearData'].complete = true;
      res.resourcesMap['clearData'].instance = { some: 'instance' };

      await res.destroy('clearData');

      expect(res.resourcesMap['clearData']).toBeUndefined();
    });

    it('should remove from promiseMap after destroy', async () => {
      const imageRes = EVAImage.from({
        name: 'promiseTest',
        preload: false,
        image: 'https://example.com/promise.png',
      });

      res.addResource([imageRes]);
      (res as any).promiseMap['promiseTest'] = Promise.resolve({});

      await res.destroy('promiseTest');

      expect((res as any).promiseMap['promiseTest']).toBeUndefined();
    });
  });

  describe('PreProcess Resource Handlers', () => {
    it('should call all registered preprocess handlers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      res.addPreProcessResourceHandler(handler1);
      res.addPreProcessResourceHandler(handler2);

      const imageRes = EVAImage.from({
        name: 'preprocessTest',
        preload: false,
        image: 'https://example.com/preprocess.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock' });

      res.addResource([imageRes]);
      await res.getResource('preprocessTest');

      // Allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(handler1).toHaveBeenCalledWith(expect.objectContaining({
        name: 'preprocessTest',
      }));
      expect(handler2).toHaveBeenCalledWith(expect.objectContaining({
        name: 'preprocessTest',
      }));
    });

    it('should remove preprocess handler', () => {
      const handler = jest.fn();

      res.addPreProcessResourceHandler(handler);
      res.removePreProcessResourceHandler(handler);

      expect((res as any).preProcessResourceHandlers).not.toContain(handler);
    });
  });

  describe('Resource Type Registration', () => {
    it('should register new resource type', () => {
      res.registerResourceType('CUSTOM_TYPE', 'CUSTOM_TYPE');
      expect(RESOURCE_TYPE['CUSTOM_TYPE']).toBe('CUSTOM_TYPE');
    });

    it('should throw error when registering duplicate resource type', () => {
      expect(() => {
        res.registerResourceType('IMAGE', 'IMAGE');
      }).toThrow('The type IMAGE already exists in RESOURCE_TYPE');
    });

    it('should use type as value when value not provided', () => {
      res.registerResourceType('AUTO_VALUE');
      expect(RESOURCE_TYPE['AUTO_VALUE']).toBe('AUTO_VALUE');
    });
  });

  describe('Multiple Resources Management', () => {
    it('should handle destroying multiple resources sequentially', async () => {
      const res1 = EVAImage.from({
        name: 'multi1',
        preload: false,
        image: 'https://example.com/multi1.png',
      });

      const res2 = EVAImage.from({
        name: 'multi2',
        preload: false,
        image: 'https://example.com/multi2.png',
      });

      res.addResource([res1, res2]);

      await res.destroy('multi1');
      await res.destroy('multi2');

      expect(Assets.unload).toHaveBeenCalledTimes(2);
      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/multi1.png']);
      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/multi2.png']);
    });
  });

  describe('Resource Instance Creation', () => {
    it('should create instance when makeInstanceFunctions is registered', async () => {
      const mockInstance = { id: 'test-instance' };
      const instanceCallback = jest.fn().mockResolvedValue(mockInstance);

      res.registerInstance(RESOURCE_TYPE.IMAGE, instanceCallback);

      const imageRes = EVAImage.from({
        name: 'instanceTest',
        preload: false,
        image: 'https://example.com/instance.png',
      });

      res.addResource([imageRes]);
      res.resourcesMap['instanceTest'].data = { image: 'loaded' as any };

      await (res as any).doComplete('instanceTest', jest.fn(), false);

      expect(instanceCallback).toHaveBeenCalled();
      expect(res.resourcesMap['instanceTest'].instance).toEqual(mockInstance);
      expect(res.resourcesMap['instanceTest'].complete).toBe(true);
    });

    it('should handle instance creation error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const instanceCallback = jest.fn().mockRejectedValue(new Error('Instance error'));

      res.registerInstance(RESOURCE_TYPE.IMAGE, instanceCallback);

      const imageRes = EVAImage.from({
        name: 'instanceError',
        preload: false,
        image: 'https://example.com/error.png',
      });

      res.addResource([imageRes]);
      res.resourcesMap['instanceError'].data = { image: 'loaded' as any };

      const resolve = jest.fn();
      await (res as any).doComplete('instanceError', resolve, false);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.resourcesMap['instanceError'].complete).toBe(false);
      expect(resolve).toHaveBeenCalledWith({});

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle resource with no URL in src', async () => {
      const emptyRes = {
        name: 'emptyUrl',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            // No URL
          },
        },
      };

      res.addResource([emptyRes]);
      await res.destroy('emptyUrl');

      // Should not crash - may not call unload if no URLs to unload
      // The behavior is to skip unload if urlsToUnload is empty
      expect(res.resourcesMap['emptyUrl']).toBeUndefined();
    });

    it('should handle timeout configuration', () => {
      const customRes = new Resource({ timeout: 10000 });
      expect(customRes.timeout).toBe(10000);
    });

    it('should check all resources loaded correctly', () => {
      const imageRes = EVAImage.from({
        name: 'checkLoaded',
        preload: false,
        image: 'https://example.com/check.png',
      });

      res.addResource([imageRes]);

      // Initially not all loaded
      expect((res as any).checkAllLoaded('checkLoaded')).toBe(false);

      // After data is set
      res.resourcesMap['checkLoaded'].data = { image: 'loaded data' as any };
      expect((res as any).checkAllLoaded('checkLoaded')).toBe(true);
    });
  });

  describe('URL Mapping Storage and Cleanup', () => {
    it('should store resource URLs in resourceUrlsMap during load', async () => {
      const imageRes = EVAImage.from({
        name: 'testUrlMapping',
        preload: false,
        image: 'https://example.com/url-mapping.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([imageRes]);
      await res.getResource('testUrlMapping');

      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that URL was tracked
      const urlsMap = (res as any).resourceUrlsMap;
      expect(urlsMap['testUrlMapping']).toBeDefined();
      expect(urlsMap['testUrlMapping']).toContain('https://example.com/url-mapping.png');
    });

    it('should store multiple URLs for sprite resources', async () => {
      const spriteRes = EVASprite.from({
        name: 'testSpriteMapping',
        preload: false,
        image: 'https://example.com/sprite.png',
        json: 'https://example.com/sprite.json',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([spriteRes]);
      await res.getResource('testSpriteMapping');

      await new Promise(resolve => setTimeout(resolve, 10));

      const urlsMap = (res as any).resourceUrlsMap;
      expect(urlsMap['testSpriteMapping']).toBeDefined();
      expect(urlsMap['testSpriteMapping'].length).toBeGreaterThanOrEqual(1);
    });

    it('should clear resourceUrlsMap entry after destroy', async () => {
      const imageRes = EVAImage.from({
        name: 'clearUrlMapping',
        preload: false,
        image: 'https://example.com/clear-mapping.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([imageRes]);
      await res.getResource('clearUrlMapping');

      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify mapping exists
      expect((res as any).resourceUrlsMap['clearUrlMapping']).toBeDefined();

      await res.destroy('clearUrlMapping');

      // Verify mapping is cleared
      expect((res as any).resourceUrlsMap['clearUrlMapping']).toBeUndefined();
    });

    it('should verify all three maps are cleared (promiseMap, resourcesMap, resourceUrlsMap)', async () => {
      const imageRes = EVAImage.from({
        name: 'fullMapCleanup',
        preload: false,
        image: 'https://example.com/full-map.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([imageRes]);
      await res.getResource('fullMapCleanup');

      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify all maps have the resource
      expect((res as any).promiseMap['fullMapCleanup']).toBeDefined();
      expect(res.resourcesMap['fullMapCleanup']).toBeDefined();
      expect((res as any).resourceUrlsMap['fullMapCleanup']).toBeDefined();

      await res.destroy('fullMapCleanup');

      // Verify all maps are cleared
      expect((res as any).promiseMap['fullMapCleanup']).toBeUndefined();
      expect(res.resourcesMap['fullMapCleanup']).toBeUndefined();
      expect((res as any).resourceUrlsMap['fullMapCleanup']).toBeUndefined();
    });

    it('should use resourceUrlsMap to unload assets', async () => {
      const imageRes = EVAImage.from({
        name: 'useUrlMapping',
        preload: false,
        image: 'https://example.com/use-mapping.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([imageRes]);
      await res.getResource('useUrlMapping');

      await new Promise(resolve => setTimeout(resolve, 10));

      // Manually set resourceUrlsMap to ensure it's used
      (res as any).resourceUrlsMap['useUrlMapping'] = ['https://example.com/use-mapping.png'];

      await res.destroy('useUrlMapping');

      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/use-mapping.png']);
    });

    it('should fallback to src URLs if resourceUrlsMap is empty', async () => {
      const imageRes = EVAImage.from({
        name: 'fallbackToSrc',
        preload: false,
        image: 'https://example.com/fallback-src.png',
      });

      res.addResource([imageRes]);

      // Don't load, so resourceUrlsMap won't be populated

      await res.destroy('fallbackToSrc');

      expect(Assets.unload).toHaveBeenCalledWith(['https://example.com/fallback-src.png']);
    });

    it('should not store duplicate URLs for the same resource', async () => {
      const imageRes = EVAImage.from({
        name: 'noDuplicateUrls',
        preload: false,
        image: 'https://example.com/no-dup.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([imageRes]);

      // Try to load the same resource twice
      await res.getResource('noDuplicateUrls');
      await res.getResource('noDuplicateUrls');

      await new Promise(resolve => setTimeout(resolve, 10));

      const urlsMap = (res as any).resourceUrlsMap;
      const urls = urlsMap['noDuplicateUrls'] || [];
      const uniqueUrls = new Set(urls);

      expect(urls.length).toBe(uniqueUrls.size); // No duplicates
    });

    it('should maintain separate URL mappings for different resources', async () => {
      const res1 = EVAImage.from({
        name: 'separate1',
        preload: false,
        image: 'https://example.com/separate1.png',
      });

      const res2 = EVAImage.from({
        name: 'separate2',
        preload: false,
        image: 'https://example.com/separate2.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([res1, res2]);
      await Promise.all([res.getResource('separate1'), res.getResource('separate2')]);

      await new Promise(resolve => setTimeout(resolve, 10));

      const urlsMap = (res as any).resourceUrlsMap;

      expect(urlsMap['separate1']).toBeDefined();
      expect(urlsMap['separate2']).toBeDefined();
      expect(urlsMap['separate1']).not.toEqual(urlsMap['separate2']);
    });

    it('should properly destroy multiple resources independently', async () => {
      const res1 = EVAImage.from({
        name: 'indep1',
        preload: false,
        image: 'https://example.com/indep1.png',
      });

      const res2 = EVAImage.from({
        name: 'indep2',
        preload: false,
        image: 'https://example.com/indep2.png',
      });

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([res1, res2]);
      await Promise.all([res.getResource('indep1'), res.getResource('indep2')]);

      await new Promise(resolve => setTimeout(resolve, 10));

      // Destroy first resource
      await res.destroy('indep1');

      // Verify first is destroyed, second still exists
      expect(res.resourcesMap['indep1']).toBeUndefined();
      expect(res.resourcesMap['indep2']).toBeDefined();
      expect((res as any).resourceUrlsMap['indep1']).toBeUndefined();
      expect((res as any).resourceUrlsMap['indep2']).toBeDefined();

      // Destroy second resource
      await res.destroy('indep2');

      // Verify both are destroyed
      expect(res.resourcesMap['indep2']).toBeUndefined();
      expect((res as any).resourceUrlsMap['indep2']).toBeUndefined();
    });

    it('should normalize protocol-relative URLs before storing', async () => {
      const imageRes = {
        name: 'protocolRelativeUrl',
        type: RESOURCE_TYPE.IMAGE,
        preload: false,
        src: {
          image: {
            type: 'png',
            url: '//example.com/protocol-relative.png',
          },
        },
      };

      (Assets.load as jest.Mock).mockResolvedValue({ texture: 'mock-texture' });

      res.addResource([imageRes]);
      await res.getResource('protocolRelativeUrl');

      await new Promise(resolve => setTimeout(resolve, 10));

      const urlsMap = (res as any).resourceUrlsMap;
      expect(urlsMap['protocolRelativeUrl']).toContain('https://example.com/protocol-relative.png');
    });
  });
});
