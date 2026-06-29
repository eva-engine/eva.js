/**
 * 与 libs/dsl/src/editor/chunk-codec.ts 同形的解码 helper。
 * 在 plugin 内复制一份是为了避免 @eva/* 反向依赖 @ali/eva-dsl 或本仓 libs/dsl。
 *
 * 这里只需要解码 + 拆 cell;编码留给 DSL 编辑层。
 */

export const CHUNK_SIZE = 16;
export const CHUNK_CELL_COUNT = CHUNK_SIZE * CHUNK_SIZE;

export interface CellRecord {
  sourceSlot: number;
  col: number;
  row: number;
  altIdx: number;
  flipH: boolean;
  flipV: boolean;
  transpose: boolean;
}

export function unpackCell(packed: number): CellRecord {
  return {
    sourceSlot: packed & 0xff,
    col: (packed >>> 8) & 0xff,
    row: (packed >>> 16) & 0xff,
    altIdx: (packed >>> 24) & 0x1f,
    flipH: ((packed >>> 29) & 1) === 1,
    flipV: ((packed >>> 30) & 1) === 1,
    transpose: ((packed >>> 31) & 1) === 1,
  };
}

export function isEmptyCellValue(packed: number): boolean {
  return (packed & 0xff) === 0;
}

export function decodeChunk(blob: { blob: string; nonEmpty: number }): Int32Array {
  const bytes = base64Decode(blob.blob);
  if (bytes.byteLength !== CHUNK_CELL_COUNT * 4) {
    throw new Error(`decodeChunk: expected ${CHUNK_CELL_COUNT * 4} bytes, got ${bytes.byteLength}`);
  }
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Int32Array(copy.buffer);
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64Decode(s: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  const bufCtor = (globalThis as { Buffer?: { from: (a: string, e: string) => Uint8Array } }).Buffer;
  if (bufCtor) {
    return new Uint8Array(bufCtor.from(s, 'base64'));
  }
  // manual fallback
  const clean = s.replace(/[^A-Za-z0-9+/]/g, '');
  const padding = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0;
  const len = Math.floor((clean.length * 3) / 4) - padding;
  const out = new Uint8Array(len);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const v0 = BASE64_ALPHABET.indexOf(clean[i]!);
    const v1 = BASE64_ALPHABET.indexOf(clean[i + 1]!);
    const v2 = clean[i + 2] ? BASE64_ALPHABET.indexOf(clean[i + 2]!) : 0;
    const v3 = clean[i + 3] ? BASE64_ALPHABET.indexOf(clean[i + 3]!) : 0;
    const w = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    if (p < len) out[p++] = (w >> 16) & 0xff;
    if (p < len) out[p++] = (w >> 8) & 0xff;
    if (p < len) out[p++] = w & 0xff;
  }
  return out;
}
