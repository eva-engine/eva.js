import { AlphaFilter } from "pixi.js";
import type { FilterSpec } from "../component";

export function createAlphaFilter(spec: FilterSpec): AlphaFilter {
	return new AlphaFilter({ alpha: spec.alpha ?? 1 } as any);
}
