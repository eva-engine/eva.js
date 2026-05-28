import {
  GameObject,
  decorators,
  resource,
  ComponentChanged,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { Sprite, Texture } from 'pixi.js';
import VideoComponent from './component';

interface VideoRecord {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  texture: Texture | null;
  sprite: Sprite;
  component: VideoComponent;
  endedHandler: (() => void) | null;
  resizedToVideo: boolean;
}

/**
 * 把 `src` 解析为可播放 URL。
 * 1. 如果 `src` 是完整 URL(以 http(s):// 或 / 开头,或包含 .mp4/.webm/.ogv 后缀),直接使用。
 * 2. 否则尝试从 resource manager 拿对应资源 base 元数据,优先取 `src.video.url` 或 `src.url`。
 */
function resolveSrc(src: string): string {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.startsWith('/')) {
    return src;
  }
  if (/\.(mp4|webm|ogv|m4v|mov)(\?|#|$)/i.test(src)) {
    return src;
  }
  // try resource registry
  try {
    const all = (resource as any).resourcesMap || (resource as any).resources;
    if (all && all[src]) {
      const meta = all[src];
      const sources = meta.src || meta.data || {};
      const candidate = sources.video || sources.audio || sources.image || sources;
      if (candidate?.url) return candidate.url as string;
      if (candidate?.src) return candidate.src as string;
    }
  } catch {
    /* ignore */
  }
  return src;
}

/**
 * 透明 1x1 像素的 PNG，用作未就绪时的占位 texture 资源。
 * 不直接用 Texture.EMPTY 是因为 EMPTY 的 source 在 v8 里某些路径上会触发 isValid 校验。
 */
const TRANSPARENT_PIXEL_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

@decorators.componentObserver({
  Video: [
    { prop: ['src'], deep: false },
    { prop: ['loop'], deep: false },
    { prop: ['muted'], deep: false },
    { prop: ['volume'], deep: false },
    { prop: ['playbackRate'], deep: false },
  ],
})
export default class VideoSystem extends Renderer {
  static systemName = 'Video';
  name: string = 'Video';
  private records: { [propName: number]: VideoRecord } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }

  rendererUpdate(gameObject: GameObject) {
    const record = this.records[gameObject.id];
    if (!record) return;
    const c = record.component;
    const v = record.video;

    // 视频可绘制时把帧拷贝到 canvas，再通过 texture.source.update() 推到 GPU。
    if (record.ctx && v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
      // 首次拿到真实尺寸时按 video 自然尺寸调整 canvas 分辨率。
      if (!record.resizedToVideo) {
        record.canvas.width = v.videoWidth;
        record.canvas.height = v.videoHeight;
        record.resizedToVideo = true;
        // 重建 texture 以让 PixiJS 感知新的源尺寸。
        const oldTex = record.texture;
        const newTex = Texture.from(record.canvas);
        record.texture = newTex;
        record.sprite.texture = newTex;
        if (oldTex && oldTex !== newTex) {
          try { oldTex.destroy(false); } catch { /* ignore */ }
        }
      }
      try {
        record.ctx.drawImage(v, 0, 0, record.canvas.width, record.canvas.height);
        // PixiJS v8: 通过 texture.source.update() 通知 GPU 上传新帧。
        const src = record.texture?.source as any;
        if (src) {
          if (typeof src.update === 'function') src.update();
          else src.dirty = true;
        }
      } catch {
        /* drawImage 在某些跨域场景会抛 SecurityError，忽略让下一帧继续尝试 */
      }
    }

    const w = c.width ?? (v.videoWidth || 256);
    const h = c.height ?? (v.videoHeight || 256);
    record.sprite.width = w;
    record.sprite.height = h;
    record.sprite.anchor.set(c.anchorX ?? 0.5, c.anchorY ?? 0.5);
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'Video') return;
    const component = changed.component as VideoComponent;
    const gameObjectId = changed.gameObject.id;

    if (changed.type === OBSERVER_TYPE.ADD) {
      const record = this.createRecord(component);
      this.records[gameObjectId] = record;
      const container = this.containerManager.getContainer(gameObjectId);
      if (container) container.addChildAt(record.sprite, 0);
      this.attachEndedHandler(record, changed.gameObject);
      this.startLoad(record);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      const propKey = changed.prop?.prop?.[0];
      if (propKey === 'src') {
        try { record.video.pause(); } catch { /* ignore */ }
        const url = resolveSrc(component.src);
        record.video.src = url;
        record.component = component;
        component.videoElement = record.video;
        component.completed = false;
        record.resizedToVideo = false;
        try { record.video.load(); } catch { /* ignore */ }
        if (component.autoplay !== false) this.tryPlay(record.video);
      } else if (propKey === 'loop') {
        record.video.loop = !!component.loop;
      } else if (propKey === 'muted') {
        record.video.muted = !!component.muted;
      } else if (propKey === 'volume') {
        record.video.volume = Math.max(0, Math.min(1, component.volume ?? 1));
      } else if (propKey === 'playbackRate') {
        record.video.playbackRate = component.playbackRate ?? 1;
      }
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      this.tearDown(record);
      const container = this.containerManager?.getContainer(gameObjectId);
      if (container) container.removeChild(record.sprite);
      try { record.sprite.destroy({ children: true }); } catch { /* ignore */ }
      delete this.records[gameObjectId];
    }
  }

  private createRecord(component: VideoComponent): VideoRecord {
    const video = document.createElement('video');
    video.crossOrigin = component.crossOrigin ?? 'anonymous';
    video.loop = !!component.loop;
    video.muted = component.muted !== false;
    video.volume = Math.max(0, Math.min(1, component.volume ?? 1));
    video.playbackRate = component.playbackRate ?? 1;
    video.playsInline = component.playsInline !== false;
    (video as any)['webkit-playsinline'] = '';
    video.preload = 'auto';
    component.videoElement = video;

    // 用一个 canvas 作为帧中转：PixiJS 直接把这个 canvas 当 ImageSource，
    // 完全绕过 PixiJS v8 的 VideoSource（避免 _onPlayStart/_mediaReady 无限递归）。
    const canvas = document.createElement('canvas');
    canvas.width = component.width ?? 256;
    canvas.height = component.height ?? 256;
    const ctx = canvas.getContext('2d');

    // 占位 texture：用透明 PNG 兜底，绝不传 EMPTY（v8 在某些 isValid 路径上不友好）。
    const placeholderTex = Texture.from(TRANSPARENT_PIXEL_DATA_URL);
    const sprite = new Sprite(placeholderTex);
    sprite.anchor.set(component.anchorX ?? 0.5, component.anchorY ?? 0.5);

    return {
      video,
      canvas,
      ctx,
      texture: placeholderTex,
      sprite,
      component,
      endedHandler: null,
      resizedToVideo: false,
    };
  }

  private attachEndedHandler(record: VideoRecord, _go: GameObject) {
    const handler = () => {
      record.component.completed = true;
      try {
        record.video.dispatchEvent(new Event('eva-video-complete'));
      } catch {
        /* ignore */
      }
    };
    record.video.addEventListener('ended', handler);
    record.endedHandler = handler;
  }

  private startLoad(record: VideoRecord) {
    const url = resolveSrc(record.component.src);
    record.video.src = url;
    try { record.video.load(); } catch { /* ignore */ }
    if (record.component.autoplay !== false) {
      // 元数据就绪后再 play，这样 videoWidth/videoHeight 已经稳定。
      const onCanPlay = () => {
        record.video.removeEventListener('canplay', onCanPlay);
        record.video.removeEventListener('loadeddata', onCanPlay);
        this.tryPlay(record.video);
      };
      if (record.video.readyState >= 2) {
        this.tryPlay(record.video);
      } else {
        record.video.addEventListener('canplay', onCanPlay);
        record.video.addEventListener('loadeddata', onCanPlay);
      }
    }
  }

  private tryPlay(video: HTMLVideoElement) {
    try {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[Video] autoplay rejected:', err?.message || err);
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Video] autoplay threw:', e);
    }
  }

  private tearDown(record: VideoRecord) {
    try { record.video.pause(); } catch { /* ignore */ }
    if (record.endedHandler) {
      try { record.video.removeEventListener('ended', record.endedHandler); } catch { /* ignore */ }
    }
    try {
      record.video.removeAttribute('src');
      record.video.load();
    } catch { /* ignore */ }
    if (record.texture) {
      try { record.texture.destroy(false); } catch { /* ignore */ }
      record.texture = null;
    }
  }

  destroy(): void {
    for (const key in this.records) {
      const id = parseInt(key);
      const record = this.records[id];
      this.tearDown(record);
      const container = this.containerManager?.getContainer(id);
      if (container) container.removeChild(record.sprite);
      try { record.sprite.destroy({ children: true }); } catch { /* ignore */ }
      delete this.records[id];
    }
  }
}
