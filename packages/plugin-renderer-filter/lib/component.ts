import { Component } from "@eva/eva.js";

export type FilterType = "blur" | "colorMatrix" | "displacement" | "noise" | "alpha";

export type ColorMatrixPreset =
	| "sepia"
	| "grayscale"
	| "negative"
	| "polaroid"
	| "vintage"
	| "lsd"
	| "predator"
	| "kodachrome"
	| "browni"
	| "technicolor"
	| "blackAndWhite"
	| "tint"
	| "saturate"
	| "brightness"
	| "contrast"
	| "hue"
	| "night";

/**
 * 单条 filter spec — 各类型共用的字段池,只读自己关心的字段。
 */
export interface FilterSpec {
	type: FilterType;
	enabled?: boolean;

	// BlurFilter
	strength?: number;
	quality?: number;
	blurX?: number;
	blurY?: number;

	// ColorMatrixFilter
	preset?: ColorMatrixPreset;
	presetArg?: number;
	matrix?: number[];

	// DisplacementFilter
	resource?: string;
	scaleX?: number;
	scaleY?: number;

	// NoiseFilter
	noise?: number;
	seed?: number;
	noiseAnimSpeed?: number;

	// AlphaFilter
	alpha?: number;
}

export interface FilterParams {
	filters?: FilterSpec[];
	filterArea?: { x: number; y: number; width: number; height: number };
}

/**
 * Filter 组件
 *
 * 给挂载它的 GameObject 应用一组 PixiJS 内置 2D 滤镜:Blur / ColorMatrix / Displacement / Noise / Alpha。
 * 实现层是 PixiJS DisplayObject.filters 数组,FilterSystem 把 spec 实例化为 PixiJS Filter 实例并绑到容器上。
 *
 * @example
 * ```typescript
 * sprite.addComponent(new Filter({
 *   filters: [
 *     { type: "blur", strength: 8 },
 *     { type: "colorMatrix", preset: "sepia" },
 *   ],
 * }));
 * ```
 */
export default class Filter extends Component<FilterParams> {
	static componentName: string = "Filter";

	filters: FilterSpec[] = [];
	filterArea: FilterParams["filterArea"] | null = null;

	init(params?: FilterParams) {
		if (params) {
			this.filters = params.filters ?? [];
			this.filterArea = params.filterArea ?? null;
		}
	}
}
