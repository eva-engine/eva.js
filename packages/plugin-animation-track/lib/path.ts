import type { Component, GameObject } from '@eva/eva.js';

export interface PathBinding {
  read(): number;
  write(v: number): void;
}

export function bindPath(go: GameObject, path: string): PathBinding | null {
  const parts = path.split('.');
  if (parts[0] === 'transform') return diveIntoObject(go.transform as any, parts.slice(1));
  if (parts[0] === 'components' && parts.length >= 3) {
    const c = findComponent(go, parts[1]);
    if (!c) return null;
    return diveIntoObject(c as any, parts.slice(2));
  }
  if (parts[0] === 'store' && parts.length >= 2) {
    const mx: any = (globalThis as any).mx;
    if (!mx?.store) return null;
    const key = parts.slice(1).join('.');
    return {
      read: () => Number(mx.store.get?.(key) ?? 0),
      write: (v: number) => mx.store.update?.({ [key]: v }),
    };
  }
  return null;
}

function diveIntoObject(root: any, keys: string[]): PathBinding | null {
  if (!root || keys.length === 0) return null;
  let parent = root;
  for (let i = 0; i < keys.length - 1; i++) {
    if (parent[keys[i]] == null) return null;
    parent = parent[keys[i]];
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
    if (c?.constructor?.componentName === name) return c;
  }
  if (typeof (go as any).getComponent === 'function') {
    return ((go as any).getComponent(name) as Component) ?? null;
  }
  return null;
}
