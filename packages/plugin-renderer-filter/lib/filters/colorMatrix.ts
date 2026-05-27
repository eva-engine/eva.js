import { ColorMatrixFilter } from "pixi.js";
import type { FilterSpec } from "../component";

export function createColorMatrixFilter(spec: FilterSpec): ColorMatrixFilter {
	const cm = new ColorMatrixFilter();
	if (spec.matrix && spec.matrix.length === 20) {
		(cm as any).matrix = spec.matrix as any;
		return cm;
	}
	const arg = spec.presetArg ?? 1;
	switch (spec.preset) {
		case "sepia": (cm as any).sepia(true); break;
		case "grayscale": (cm as any).greyscale(arg, true); break;
		case "negative": (cm as any).negative(true); break;
		case "polaroid": (cm as any).polaroid(true); break;
		case "vintage": (cm as any).vintage(true); break;
		case "lsd": (cm as any).lsd(true); break;
		case "predator": (cm as any).predator(arg, true); break;
		case "kodachrome": (cm as any).kodachrome(true); break;
		case "browni": (cm as any).browni(true); break;
		case "technicolor": (cm as any).technicolor(true); break;
		case "blackAndWhite": (cm as any).blackAndWhite(true); break;
		case "tint": (cm as any).tint(arg, true); break;
		case "saturate": (cm as any).saturate(arg, true); break;
		case "brightness": (cm as any).brightness(arg, true); break;
		case "contrast": (cm as any).contrast(arg, true); break;
		case "hue": (cm as any).hue(arg * 360, true); break;
		case "night": (cm as any).night(arg, true); break;
	}
	return cm;
}
