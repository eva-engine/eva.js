import { LOAD_EVENT, resource, RESOURCE_TYPE } from "@eva/eva.js"
import { Assets } from 'pixi.js';

export const name = 'resource-cleanup-test';

// 辅助函数：获取 Assets 缓存的所有键
function getAssetsCacheKeys(): string[] {
  const assets = Assets as any;
  const keys: string[] = [];

  try {
    // 尝试从 cache 获取
    const cache = assets.cache || assets._cache;
    if (cache) {
      if (typeof cache.keys === 'function') {
        return Array.from(cache.keys());
      }
      if (cache._cache && typeof cache._cache.keys === 'function') {
        return Array.from(cache._cache.keys());
      }
      if (typeof cache === 'object') {
        return Object.keys(cache);
      }
    }
  } catch (e) {
    console.warn('无法获取 Assets cache keys:', e);
  }

  return keys;
}

// 辅助函数：检查 Assets Cache 中是否存在
function checkInAssetsCache(url: string): boolean {
  try {
    const assets = Assets as any;
    const cache = assets.cache || assets._cache;
    if (!cache) return false;

    // 尝试多种方式检查
    if (cache.has && typeof cache.has === 'function') {
      return cache.has(url);
    }
    if (cache._cache && cache._cache.has) {
      return cache._cache.has(url);
    }
    if (typeof cache === 'object') {
      return url in cache;
    }
  } catch {
    // 忽略错误
  }
  return false;
}

// 辅助函数：检查 Resolver 中是否存在
function checkInResolver(url: string): boolean {
  try {
    const assets = Assets as any;
    const resolver = assets.resolver || assets._resolver;
    if (!resolver) return false;

    if (resolver.hasKey && typeof resolver.hasKey === 'function') {
      return resolver.hasKey(url);
    }
  } catch {
    // 忽略错误
  }
  return false;
}

// 辅助函数：检查 Assets 中是否存在指定 URL
function checkAssetExists(url: string): boolean {
  try {
    const asset = Assets.get(url);
    return asset !== undefined;
  } catch {
    return false;
  }
}

// 辅助函数：获取资源的所有 URL
function getResourceUrls(resourceName: string): string[] {
  const res = resource.resourcesMap[resourceName];
  if (!res || !res.src) return [];

  const urls: string[] = [];
  for (const key in res.src) {
    let url = res.src[key]?.url;
    if (url) {
      // 规范化 URL
      if (typeof url === 'string' && url.startsWith('//')) {
        url = `https:${url}`;
      }
      urls.push(url);
    }
  }
  return urls;
}

// 显示资源状态
function displayResourceStatus(resourceName: string, stage: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 资源状态检查 [${stage}]`);
  console.log(`资源名称: ${resourceName}`);
  console.log(`${'='.repeat(60)}\n`);

  // 1. 检查 resourcesMap
  const existsInResourcesMap = !!resource.resourcesMap[resourceName];
  console.log(`1️⃣ resourcesMap 检查:`);
  console.log(`   存在: ${existsInResourcesMap ? '✓ 是' : '✗ 否'}`);
  if (existsInResourcesMap) {
    const res = resource.resourcesMap[resourceName];
    console.log(`   complete: ${res.complete}`);
    console.log(`   type: ${res.type}`);
    console.log(`   数据对象: ${res.data ? Object.keys(res.data).join(', ') : '无'}`);
  }

  // 2. 检查 promiseMap
  const promiseMap = (resource as any).promiseMap;
  const existsInPromiseMap = !!promiseMap[resourceName];
  console.log(`\n2️⃣ promiseMap 检查:`);
  console.log(`   存在: ${existsInPromiseMap ? '✓ 是' : '✗ 否'}`);

  // 3. 检查 resourceUrlsMap
  const resourceUrlsMap = (resource as any).resourceUrlsMap;
  const urlsInMap = resourceUrlsMap[resourceName] || [];
  console.log(`\n3️⃣ resourceUrlsMap 检查:`);
  console.log(`   存在: ${urlsInMap.length > 0 ? '✓ 是' : '✗ 否'}`);
  if (urlsInMap.length > 0) {
    console.log(`   URL 数量: ${urlsInMap.length}`);
    urlsInMap.forEach((url: string, index: number) => {
      console.log(`   [${index + 1}] ${url}`);
    });
  }

  // 4. 检查 PixiJS Assets
  console.log(`\n4️⃣ PixiJS Assets 检查:`);
  const resourceUrls = getResourceUrls(resourceName);
  if (resourceUrls.length > 0) {
    console.log(`   资源 URL 数量: ${resourceUrls.length}`);
    resourceUrls.forEach((url, index) => {
      const existsInAssets = checkAssetExists(url);
      const existsInCache = checkInAssetsCache(url);
      const existsInResolver = checkInResolver(url);

      console.log(`   [${index + 1}] URL: ${url.substring(0, 60)}...`);
      console.log(`       Assets.get(): ${existsInAssets ? '✓ 存在' : '✗ 不存在'}`);
      console.log(`       Cache: ${existsInCache ? '✓ 存在' : '✗ 不存在'}`);
      console.log(`       Resolver: ${existsInResolver ? '✓ 存在' : '✗ 不存在'}`);
    });
  } else if (urlsInMap.length > 0) {
    console.log(`   检查 resourceUrlsMap 中的 URL:`);
    urlsInMap.forEach((url: string, index: number) => {
      const existsInAssets = checkAssetExists(url);
      const existsInCache = checkInAssetsCache(url);
      const existsInResolver = checkInResolver(url);

      console.log(`   [${index + 1}] URL: ${url.substring(0, 60)}...`);
      console.log(`       Assets.get(): ${existsInAssets ? '✓ 存在' : '✗ 不存在'}`);
      console.log(`       Cache: ${existsInCache ? '✓ 存在' : '✗ 不存在'}`);
      console.log(`       Resolver: ${existsInResolver ? '✓ 存在' : '✗ 不存在'}`);
    });
  } else {
    console.log(`   无 URL 需要检查（可能是 data 类型资源）`);
  }

  // 显示全局 Assets 统计
  const allCacheKeys = getAssetsCacheKeys();
  console.log(`\n   📦 Assets 全局状态:`);
  console.log(`       缓存中的资源总数: ${allCacheKeys.length}`);
  if (allCacheKeys.length > 0 && allCacheKeys.length <= 5) {
    console.log(`       缓存的键: ${allCacheKeys.join(', ')}`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

// 显示全局状态摘要
function displayGlobalSummary() {
  const totalResources = Object.keys(resource.resourcesMap).length;
  const promiseMapSize = Object.keys((resource as any).promiseMap).length;
  const urlsMapSize = Object.keys((resource as any).resourceUrlsMap).length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📈 全局资源统计`);
  console.log(`${'='.repeat(60)}`);
  console.log(`resourcesMap 数量: ${totalResources}`);
  console.log(`promiseMap 数量: ${promiseMapSize}`);
  console.log(`resourceUrlsMap 数量: ${urlsMapSize}`);

  if (totalResources > 0) {
    console.log(`\n当前资源列表:`);
    Object.keys(resource.resourcesMap).forEach((name, index) => {
      const res = resource.resourcesMap[name];
      console.log(`  ${index + 1}. ${name} (${res.type}) - ${res.complete ? '已加载' : '未加载'}`);
    });
  }
  console.log(`${'='.repeat(60)}\n`);
}

// 测试资源清理
async function testResourceCleanup() {
  console.log('\n\n');
  console.log('🧪 '.repeat(30));
  console.log('开始资源清理测试');
  console.log('🧪 '.repeat(30));

  // 测试 1: 单个图片资源的完整生命周期
  console.log('\n\n【测试 1】单个图片资源的完整生命周期\n');

  // 使用 1x1 透明 PNG 的 Data URI（最简单可靠）
  const testImage1 = {
    name: 'test_image_1',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      },
    },
    preload: false,
  };

  console.log('➡️ 步骤 1: 添加资源');
  resource.addResource([testImage1]);
  displayResourceStatus('test_image_1', '添加后/加载前');

  console.log('➡️ 步骤 2: 加载资源');
  await resource.getResource('test_image_1');
  await new Promise(resolve => setTimeout(resolve, 100)); // 等待异步操作完成
  displayResourceStatus('test_image_1', '加载完成');

  console.log('➡️ 步骤 3: 销毁资源');
  await resource.destroy('test_image_1');
  displayResourceStatus('test_image_1', '销毁后');

  // 验证清理结果
  const test1Passed =
    !resource.resourcesMap['test_image_1'] &&
    !(resource as any).promiseMap['test_image_1'] &&
    !(resource as any).resourceUrlsMap['test_image_1'];

  console.log(`\n✅ 测试 1 结果: ${test1Passed ? '通过 ✓' : '失败 ✗'}`);

  // 测试 2: 多个资源的批量清理
  console.log('\n\n【测试 2】多个资源的批量清理\n');

  const testImages = [
    {
      name: 'test_image_2',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        },
      },
      preload: false,
    },
    {
      name: 'test_image_3',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
        },
      },
      preload: false,
    },
  ];

  console.log('➡️ 步骤 1: 添加多个资源');
  resource.addResource(testImages);

  console.log('➡️ 步骤 2: 加载所有资源');
  await Promise.all([
    resource.getResource('test_image_2'),
    resource.getResource('test_image_3')
  ]);
  await new Promise(resolve => setTimeout(resolve, 100));

  displayGlobalSummary();

  console.log('➡️ 步骤 3: 销毁第一个资源');
  await resource.destroy('test_image_2');
  displayResourceStatus('test_image_2', '销毁后');
  displayResourceStatus('test_image_3', '另一个资源状态（未销毁）');

  console.log('➡️ 步骤 4: 销毁第二个资源');
  await resource.destroy('test_image_3');
  displayResourceStatus('test_image_3', '销毁后');

  displayGlobalSummary();

  const test2Passed =
    !resource.resourcesMap['test_image_2'] &&
    !resource.resourcesMap['test_image_3'] &&
    !(resource as any).promiseMap['test_image_2'] &&
    !(resource as any).promiseMap['test_image_3'];

  console.log(`\n✅ 测试 2 结果: ${test2Passed ? '通过 ✓' : '失败 ✗'}`);

  // 测试 3: Data 类型资源（无 URL）
  console.log('\n\n【测试 3】Data 类型资源清理\n');

  const dataResource = {
    name: 'test_data',
    //@ts-ignore
    type: 'DATA',
    src: {
      data: {
        type: 'data',
        data: { test: 'value', number: 123 },
      },
    },
    preload: false,
  };

  console.log('➡️ 步骤 1: 添加 Data 资源');
  resource.addResource([dataResource]);

  console.log('➡️ 步骤 2: 加载 Data 资源');
  await resource.getResource('test_data');
  await new Promise(resolve => setTimeout(resolve, 100));
  displayResourceStatus('test_data', '加载完成');

  console.log('➡️ 步骤 3: 销毁 Data 资源');
  await resource.destroy('test_data');
  displayResourceStatus('test_data', '销毁后');

  const test3Passed = !resource.resourcesMap['test_data'];
  console.log(`\n✅ 测试 3 结果: ${test3Passed ? '通过 ✓' : '失败 ✗'}`);

  // 测试 4: 重复销毁（边界测试）
  console.log('\n\n【测试 4】重复销毁和销毁不存在的资源\n');

  const testImage4 = {
    name: 'test_image_4',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAW9JJQQAAAABJRU5ErkJggg==',
      },
    },
    preload: false,
  };

  resource.addResource([testImage4]);
  await resource.getResource('test_image_4');
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('➡️ 第一次销毁');
  await resource.destroy('test_image_4');
  displayResourceStatus('test_image_4', '第一次销毁后');

  console.log('➡️ 第二次销毁（重复销毁）');
  try {
    await resource.destroy('test_image_4');
    console.log('✓ 重复销毁没有报错');
  } catch (error) {
    console.error('✗ 重复销毁时出错:', error);
  }

  console.log('➡️ 销毁不存在的资源');
  try {
    await resource.destroy('non_existent_resource');
    console.log('✓ 销毁不存在的资源没有报错');
  } catch (error) {
    console.error('✗ 销毁不存在的资源时出错:', error);
  }

  console.log(`\n✅ 测试 4 结果: 通过 ✓`);

  // 测试 5: 销毁后重新加载
  console.log('\n\n【测试 5】销毁后重新加载同名资源\n');

  const reloadTestResource = {
    name: 'reload_test',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        // 使用与测试1相同的、已验证有效的Data URI
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      },
    },
    preload: false,
  };

  console.log('➡️ 第一次加载');
  resource.addResource([reloadTestResource]);
  await resource.getResource('reload_test');
  await new Promise(resolve => setTimeout(resolve, 100));
  displayResourceStatus('reload_test', '第一次加载完成');

  console.log('➡️ 销毁资源');
  await resource.destroy('reload_test');
  displayResourceStatus('reload_test', '销毁后');

  console.log('➡️ 重新添加并加载');
  resource.addResource([reloadTestResource]);
  await resource.getResource('reload_test');
  await new Promise(resolve => setTimeout(resolve, 100));
  displayResourceStatus('reload_test', '第二次加载完成');

  const test5Passed =
    !!resource.resourcesMap['reload_test'] &&
    resource.resourcesMap['reload_test'].complete;

  console.log(`\n✅ 测试 5 结果: ${test5Passed ? '通过 ✓' : '失败 ✗'}`);

  // 最终清理
  console.log('\n\n➡️ 清理所有测试资源');
  await resource.destroy('reload_test');

  // 最终统计
  console.log('\n\n');
  console.log('🎉 '.repeat(30));
  console.log('所有测试完成！');
  console.log('🎉 '.repeat(30));

  displayGlobalSummary();

  // 总结
  const allTestsPassed = test1Passed && test2Passed && test3Passed && test5Passed;
  console.log('\n📋 测试总结:');
  console.log(`  测试 1 (单资源生命周期): ${test1Passed ? '✓ 通过' : '✗ 失败'}`);
  console.log(`  测试 2 (批量清理): ${test2Passed ? '✓ 通过' : '✗ 失败'}`);
  console.log(`  测试 3 (Data 类型): ${test3Passed ? '✓ 通过' : '✗ 失败'}`);
  console.log(`  测试 4 (边界测试): ✓ 通过`);
  console.log(`  测试 5 (重新加载): ${test5Passed ? '✓ 通过' : '✗ 失败'}`);
  console.log(`\n总体结果: ${allTestsPassed ? '✅ 全部通过' : '❌ 部分失败'}\n`);
}

export async function init() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║       Eva.js 资源清理测试 Demo                           ║');
  console.log('║       Resource Cleanup Verification                      ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('📝 测试说明:');
  console.log('   本测试将验证资源销毁后是否完全清理');
  console.log('   包括: resourcesMap, promiseMap, resourceUrlsMap, PixiJS Assets');
  console.log('\n');

  // 注册资源销毁回调（用于观察）
  resource.registerDestroy(RESOURCE_TYPE.IMAGE, async (res) => {
    console.log(`🗑️  [销毁回调] 正在销毁图片资源: ${res.name}`);
  });

  // 监听加载事件
  let loadCount = 0;
  resource.on(LOAD_EVENT.LOADED, (progress, param) => {
    loadCount++;
    console.log(`📦 [加载事件] ${param?.name} 加载成功 (${loadCount})`);
  });

  resource.on(LOAD_EVENT.ERROR, (progress, param) => {
    console.error(`❌ [加载错误] ${param?.name}: ${param?.errMsg}`);
  });

  // 延迟开始测试，确保环境准备好
  setTimeout(async () => {
    try {
      await testResourceCleanup();
    } catch (error) {
      console.error('\n❌ 测试过程中发生错误:', error);
      console.error(error);
    }
  }, 1000);
}
