import { Persistence, PersistenceSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

declare const global: any;

describe('plugin-persistence — mx.store ↔ localStorage', () => {
  let savedStore: Record<string, any> = {};

  beforeEach(() => {
    savedStore = {};
    // 注入 mx.store
    global.mx = {
      store: {
        get: (k: string) => savedStore[k],
        update: (patch: Record<string, any>) => {
          for (const k in patch) savedStore[k] = patch[k];
        },
      },
    };
    localStorage.clear();
    getSignalBus().clear();
    jest.useRealTimers();
  });

  afterEach(() => {
    delete global.mx;
  });

  it('save 把当前 mx.store 值写入 localStorage(带 namespace 前缀)', () => {
    savedStore.highScore = 88;
    savedStore.tutorialDone = true;
    const p = new Persistence();
    p.init({ namespace: 'test', keys: ['highScore', 'tutorialDone'] });
    p.save();
    expect(localStorage.getItem('test:highScore')).toBe('88');
    expect(localStorage.getItem('test:tutorialDone')).toBe('true');
  });

  it('load 从 localStorage 读回写入 mx.store', () => {
    localStorage.setItem('ns:lvl', '5');
    localStorage.setItem('ns:hero', '"Eva"');
    const p = new Persistence();
    p.init({ namespace: 'ns', keys: ['lvl', 'hero'], autoload: false });
    p.load();
    expect(savedStore.lvl).toBe(5);
    expect(savedStore.hero).toBe('Eva');
  });

  it('autoload=true 时 awake 自动 load', () => {
    localStorage.setItem('a:k', '42');
    const p = new Persistence();
    p.init({ namespace: 'a', keys: ['k'] });
    p.awake();
    expect(savedStore.k).toBe(42);
  });

  it('clear 清掉 localStorage 对应 keys', () => {
    localStorage.setItem('c:a', '1');
    localStorage.setItem('c:b', '2');
    localStorage.setItem('other:a', 'should-stay');
    const p = new Persistence();
    p.init({ namespace: 'c', keys: ['a', 'b'] });
    p.clear();
    expect(localStorage.getItem('c:a')).toBeNull();
    expect(localStorage.getItem('c:b')).toBeNull();
    expect(localStorage.getItem('other:a')).toBe('should-stay');
  });

  it('autosave=true 监听 store:change:{key} 信号 → debounce 后 save', async () => {
    jest.useFakeTimers();
    savedStore.score = 0;
    const p = new Persistence();
    p.init({ namespace: 'b', keys: ['score'], autoload: false, saveDebounceMs: 50 });
    p.awake();
    savedStore.score = 999;
    getSignalBus().emit('store:change:score');
    expect(localStorage.getItem('b:score')).toBeNull();
    jest.advanceTimersByTime(60);
    expect(localStorage.getItem('b:score')).toBe('999');
  });

  it('autosave=false 不订阅', () => {
    const p = new Persistence();
    p.init({ namespace: 'na', keys: ['x'], autoload: false, autosave: false });
    p.awake();
    savedStore.x = 1;
    getSignalBus().emit('store:change:x');
    expect(localStorage.getItem('na:x')).toBeNull();
  });

  it('load 失败的 key 警告但不抛错(损坏 JSON)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('w:bad', '{not json');
    const p = new Persistence();
    p.init({ namespace: 'w', keys: ['bad'], autoload: false });
    p.load();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('onDestroy 立即 flush + 清理 timer / 订阅', () => {
    jest.useFakeTimers();
    savedStore.s = 5;
    const p = new Persistence();
    p.init({ namespace: 'd', keys: ['s'], autoload: false });
    p.awake();
    p.onDestroy();
    expect(localStorage.getItem('d:s')).toBe('5');
  });

  describe('PersistenceSystem', () => {
    it('能实例化', () => {
      expect(new PersistenceSystem().name).toBe('Persistence');
    });
  });
});
