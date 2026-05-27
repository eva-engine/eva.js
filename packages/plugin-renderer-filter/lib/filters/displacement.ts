import { DisplacementFilter, Sprite, Texture } from "pixi.js";
import { resource } from "@eva/eva.js";
import type { FilterSpec } from "../component";

/**
 * Build a DisplacementFilter from FilterSpec.
 * Pulls the displacement texture from the Eva.js resource registry.
 * If the resource isn't ready yet, returns a no-op filter (caller can later swap).
 */
export function createDisplacementFilter(spec: FilterSpec): DisplacementFilter {
	const scale = { x: spec.scaleX ?? 20, y: spec.scaleY ?? 20 };
	let sprite: Sprite;
	if (spec.resource) {
		const res = (resource as any).getResource?.(spec.resource);
		const data = res?.data ?? res?.instance ?? null;
		const tex: Texture | null =
			data?.texture instanceof Texture
				? data.texture
				: data?.image
					? Texture.from(data.image)
					: null;
		sprite = new Sprite(tex ?? Texture.EMPTY);
	} else {
		sprite = new Sprite(Texture.EMPTY);
	}
	return new DisplacementFilter({ sprite, scale });
}
