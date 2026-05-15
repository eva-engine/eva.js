import { GameObject, Transform } from '@eva/eva.js';
import { Point, ObservablePoint } from 'pixi.js';
import { Container } from '@eva/renderer-adapter';

export type BoundsCoordinateSpace = 'world' | 'canvas' | 'design';

export interface RenderBounds {
  /** Bounds x in Eva design/canvas coordinates. */
  x: number;
  /** Bounds y in Eva design/canvas coordinates. */
  y: number;
  /** Actual rendered width measured from Pixi getBounds(), or Transform.size fallback. */
  width: number;
  /** Actual rendered height measured from Pixi getBounds(), or Transform.size fallback. */
  height: number;
  /** Bounds right edge in the same coordinate space. */
  right: number;
  /** Bounds bottom edge in the same coordinate space. */
  bottom: number;
  /** Coordinate space of the returned values. world/canvas/design are the same logical Eva coordinates. */
  coordinateSpace: BoundsCoordinateSpace;
  /** Whether this value came from Pixi display object bounds or Transform.size fallback. */
  source: 'pixi' | 'transform';
}

export interface GetBoundsOptions {
  /**
   * Returned coordinate space.
   * Eva's Pixi world coordinates use the same logical units as canvas/design coordinates.
   */
  coordinateSpace?: BoundsCoordinateSpace;
  /** Use Transform.size when Pixi bounds are unavailable or still zero. Defaults to true. */
  fallbackToTransform?: boolean;
}

const toRenderBounds = (
  bounds: { x?: number; y?: number; width?: number; height?: number },
  coordinateSpace: BoundsCoordinateSpace,
  source: RenderBounds['source'],
): RenderBounds => {
  const x = Number.isFinite(bounds.x) ? bounds.x : 0;
  const y = Number.isFinite(bounds.y) ? bounds.y : 0;
  const width = Number.isFinite(bounds.width) ? bounds.width : 0;
  const height = Number.isFinite(bounds.height) ? bounds.height : 0;
  return {
    x,
    y,
    width,
    height,
    right: x + width,
    bottom: y + height,
    coordinateSpace,
    source,
  };
};

export default class ContainerManager {
  containerMap: { [propName: number]: Container } = {};

  addContainer({ name, container, gameObject }: { name: number; container: Container; gameObject: GameObject }) {
    this.containerMap[name] = container;
    container.gName = gameObject.name || name;
  }

  getContainer(name: number) {
    return this.containerMap[name];
  }

  /**
   * Return actual rendered bounds for a GameObject.
   *
   * The primary path uses PixiJS Container#getBounds(), so renderers such as
   * Text/Img/Graphics/Sprite/Spine report the real display size after loading
   * and style application. If the display object is not ready yet, callers can
   * fall back to Transform.size in the same Eva design/canvas coordinate space.
   */
  getBounds(gameObject: GameObject, options: GetBoundsOptions = {}): RenderBounds | null {
    if (!gameObject || gameObject.destroyed) return null;

    const coordinateSpace = options.coordinateSpace || 'world';
    const fallbackToTransform = options.fallbackToTransform !== false;
    const container = this.getContainer(gameObject.id);

    if (container?.getBounds) {
      try {
        const bounds = container.getBounds();
        if (bounds && Number.isFinite(bounds.width) && Number.isFinite(bounds.height) && (bounds.width !== 0 || bounds.height !== 0)) {
          return toRenderBounds(bounds, coordinateSpace, 'pixi');
        }
      } catch (error) {
        // Pixi can throw while async resources are still being attached; fallback below keeps editor tools stable.
      }
    }

    if (!fallbackToTransform) return null;
    return this.getTransformBounds(gameObject, coordinateSpace);
  }

  private getTransformBounds(gameObject: GameObject, coordinateSpace: BoundsCoordinateSpace): RenderBounds {
    const transform = gameObject.transform;
    const container = this.getContainer(gameObject.id);
    let x = container?.worldTransform?.tx;
    let y = container?.worldTransform?.ty;

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      const position = this.resolveFallbackWorldPosition(transform);
      x = position.x;
      y = position.y;
    }

    const scaleX = Number.isFinite(transform.scale?.x) ? transform.scale.x : 1;
    const scaleY = Number.isFinite(transform.scale?.y) ? transform.scale.y : 1;
    const width = Math.abs((transform.size?.width || 0) * scaleX);
    const height = Math.abs((transform.size?.height || 0) * scaleY);
    return toRenderBounds({ x, y, width, height }, coordinateSpace, 'transform');
  }

  private resolveFallbackWorldPosition(transform: Transform): { x: number; y: number } {
    if (!transform) return { x: 0, y: 0 };
    const parent = transform.parent;
    const parentPosition = parent ? this.resolveFallbackWorldPosition(parent) : { x: 0, y: 0 };
    const parentSize = parent?.size || { width: 0, height: 0 };
    return {
      x: parentPosition.x + (transform.position?.x || 0) + parentSize.width * (transform.anchor?.x || 0),
      y: parentPosition.y + (transform.position?.y || 0) + parentSize.height * (transform.anchor?.y || 0),
    };
  }

  removeContainer(name: number) {
    const container = this.containerMap[name];
    if (container) {
      container.destroy({ children: true });
    }
    delete this.containerMap[name];
  }

  updateTransform({ name, transform }: { name: number; transform: Transform }) {
    const container = this.containerMap[name];
    if (!container || !transform) return;
    const { anchor, origin, position, rotation, scale, size, skew } = transform;
    container.rotation = rotation;
    // @ts-ignore
    container.scale = scale as Point;
    container.pivot.x = size.width * origin.x;
    container.pivot.y = size.height * origin.y;
    // @ts-ignore
    container.skew = skew as ObservablePoint;
    let x = position.x;
    let y = position.y;
    if (transform.parent) {
      const parent = transform.parent;
      x = x + parent.size.width * anchor.x;
      y = y + parent.size.height * anchor.y;
    }

    // @ts-ignore
    container.position = { x, y } as Point;
  }
}
