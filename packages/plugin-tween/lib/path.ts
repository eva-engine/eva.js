import type { Component, GameObject } from '@eva/eva.js';

/**
 * 把字符串路径解析成 (target, key) 二元组,以便就地写入。
 *
 * 支持:
 *   - "transform.position.x"
 *   - "transform.rotation"
 *   - "components.<ComponentName>.<key>"     // 通过 componentName 找
 *   - "store.<keyPath>"                       // 走 mx.store(若存在)
 */
export interface PathBinding {
  read(): number;
  write(v: number): void;
}

export function bindPath(go: GameObject, path: string): PathBinding | null {
  const parts = path.split('.');
  if (parts[0] === 'transform') {
    const obj = go.transform as any;
    return diveIntoObject(obj, parts.slice(1));
  }
  if (parts[0] === 'components' && parts.length >= 3) {
    const compName = parts[1];
    const comp = findComponent(go, compName);
    if (!comp) return null;
    return diveIntoObject(comp as any, parts.slice(2));
  }
  if (parts[0] === 'store' && parts.length >= 2) {
    return bindStore(parts.slice(1).join('.'));
  }
  return null;
}

function diveIntoObject(root: any, keys: string[]): PathBinding | null {
  if (!root || keys.length === 0) return null;
  let parent = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (parent[k] == null) return null;
    parent = parent[k];
  }
  const last = keys[keys.length - 1];
  return {
    read: () => Number(parent[last] ?? 0),
    write: (v: number) => {
      parent[last] = v;
    },
  };
}

function findComponent(go: GameObject, name: string): Component | null {
  const comps: any[] = (go as any).components || [];
  for (const c of comps) {
    const cn = c?.constructor?.componentName;
    if (cn === name) return c;
  }
  // 退路:Eva.js 部分版本支持 getComponent(name)
  if (typeof (go as any).getComponent === 'function') {
    return ((go as any).getComponent(name) as Component) ?? null;
  }
  return null;
}

function bindStore(key: string): PathBinding | null {
  // mx.store 是宿主全局,不强依赖
  const mx: any = (globalThis as any).mx;
  if (!mx?.store) return null;
  return {
    read: () => Number(mx.store.get?.(key) ?? 0),
    write: (v: number) => {
      mx.store.update?.({ [key]: v });
    },
  };
}
