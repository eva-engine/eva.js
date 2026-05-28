import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

/** Single declarative drawing op applied to a RenderTexture. */
export type RenderTextureOp =
  /** Fill the whole RT (or a sub-rect) with a solid color. */
  | {
      type: 'fill';
      color: number;
      alpha?: number;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }
  /** Clear the RT (transparent). */
  | {
      type: 'clear';
    }
  /** Draw an image / atlas frame / text-as-texture into the RT. */
  | {
      type: 'draw';
      /** Resource name registered in DSL assets (image / sprite / saved RT). */
      resource: string;
      /** Optional sprite atlas frame name. */
      frame?: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      alpha?: number;
      tint?: number;
      rotation?: number;
      anchorX?: number;
      anchorY?: number;
      scaleX?: number;
      scaleY?: number;
      blendMode?: string;
    }
  /** Convenience alias for drawing an atlas frame at (x,y). */
  | {
      type: 'drawFrame';
      resource: string;
      frame: string;
      x?: number;
      y?: number;
      alpha?: number;
      tint?: number;
    }
  /** Erase a region (alpha→0) by drawing with destination-out blend. */
  | {
      type: 'erase';
      resource?: string;
      frame?: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      anchorX?: number;
      anchorY?: number;
    }
  /** Draw a text string (PIXI.Text) into the RT. */
  | {
      type: 'drawText';
      text: string;
      x?: number;
      y?: number;
      style?: {
        fontFamily?: string;
        fontSize?: number;
        fontWeight?: string | number;
        fill?: number | string;
        stroke?: number | string;
        strokeThickness?: number;
        align?: 'left' | 'center' | 'right';
      };
      alpha?: number;
      tint?: number;
    }
  /** Repeat the previous draw N times with offset (paint trail). */
  | {
      type: 'paint';
      resource: string;
      frame?: string;
      x?: number;
      y?: number;
      step?: { x?: number; y?: number };
      times?: number;
      alpha?: number;
      tint?: number;
      tintCycle?: number[];
    };

export interface RenderTextureParams {
  /** Logical width in design units. */
  width: number;
  /** Logical height in design units. */
  height: number;
  /** Declarative draw queue replayed every commit. */
  ops?: RenderTextureOp[];
  /** Optional clear color before replaying ops. */
  backgroundColor?: number;
  backgroundAlpha?: number;
  /** Save final RT as a resource key (so other Img/Sprite can reference it). */
  saveAs?: string;
  /** Append ops instead of clearing on each commit. Defaults true (Phaser-like). */
  append?: boolean;
}

/**
 * RenderTexture component.
 *
 * Equivalent of Phaser RenderTexture / DynamicTexture. Holds a Pixi RenderTexture
 * underneath and lets the DSL declaratively enqueue draw ops via `ops`.
 *
 * Mutating `ops` (or any of the simple props) replays the queue.
 */
export default class RenderTexture extends Component<RenderTextureParams> {
  static componentName: string = 'RenderTexture';

  @type('number') width: number = 256;
  @type('number') height: number = 256;
  @type('array') ops: RenderTextureOp[] = [];
  @type('number') backgroundColor: number = -1;
  @type('number') backgroundAlpha: number = 1;
  saveAs?: string;
  append: boolean = true;

  /** Bumped by clear()/fill()/etc. so the system can detect imperative changes. */
  dirty: number = 0;

  init(obj?: RenderTextureParams) {
    if (obj) Object.assign(this, obj);
    if (!Array.isArray(this.ops)) this.ops = [];
  }

  /** Append an op + mark dirty (works at runtime, not just init). */
  addOp(op: RenderTextureOp) {
    this.ops = [...this.ops, op];
    this.dirty++;
  }

  /** Clear the queue (and the texture next commit). */
  clearOps() {
    this.ops = [{ type: 'clear' }];
    this.dirty++;
  }
}
