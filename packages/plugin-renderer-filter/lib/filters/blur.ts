import { BlurFilter } from "pixi.js";
import type { FilterSpec } from "../component";

export function createBlurFilter(spec: FilterSpec): BlurFilter {
	const strength = spec.strength ?? 8;
	const opts: any = {
		strength,
		quality: spec.quality ?? 4,
	};
	if (spec.blurX != null) opts.strengthX = spec.blurX;
	if (spec.blurY != null) opts.strengthY = spec.blurY;
	return new BlurFilter(opts);
}
