import { NoiseFilter } from "pixi.js";
import type { FilterSpec } from "../component";

export function createNoiseFilter(spec: FilterSpec): NoiseFilter {
	return new NoiseFilter({
		noise: spec.noise ?? 0.5,
		seed: spec.seed ?? Math.random(),
	} as any);
}
