import {
	GameObject,
	decorators,
	ComponentChanged,
	OBSERVER_TYPE,
} from "@eva/eva.js";
import { ContainerManager, RendererSystem, Renderer } from "@eva/plugin-renderer";
import type { Filter as PIXIFilter, Rectangle } from "pixi.js";
import FilterComponent, { FilterSpec } from "./component";
import { createBlurFilter } from "./filters/blur";
import { createColorMatrixFilter } from "./filters/colorMatrix";
import { createDisplacementFilter } from "./filters/displacement";
import { createNoiseFilter } from "./filters/noise";
import { createAlphaFilter } from "./filters/alpha";

interface BoundFilter {
	pixiFilters: PIXIFilter[];
	specs: FilterSpec[];
}

@decorators.componentObserver({
	Filter: [
		{ prop: ["filters"], deep: true },
		{ prop: ["filterArea"], deep: true },
	],
})
export default class FilterSystem extends Renderer {
	name: string = "FilterSystem";
	containerManager: ContainerManager;
	renderSystem: RendererSystem;

	private bound: Map<number, BoundFilter> = new Map();
	private elapsed = 0;

	init() {
		this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
		this.renderSystem.rendererManager.register(this);
	}

	rendererUpdate(_gameObject: GameObject) {
		// no-op (filters are static; filterArea applied on change only)
	}

	componentChanged(changed: ComponentChanged) {
		if (changed.componentName !== "Filter") return;
		const id = changed.gameObject.id;

		if (changed.type === OBSERVER_TYPE.REMOVE) {
			this.removeFilters(id);
			return;
		}

		// ADD or CHANGE
		this.applyFilters(changed.gameObject, changed.component as FilterComponent);
	}

	private applyFilters(go: GameObject, component: FilterComponent) {
		const container = this.containerManager.getContainer(go.id);
		if (!container) return;

		// Dispose existing
		this.disposeBound(go.id);

		const specs: FilterSpec[] = (component.filters || []).filter(
			(s) => s.enabled !== false,
		);
		const pixiFilters = specs.map((s) => this.createOne(s)).filter(Boolean) as PIXIFilter[];

		(container as any).filters = pixiFilters;

		if (component.filterArea) {
			const fa = component.filterArea;
			(container as any).filterArea = { x: fa.x, y: fa.y, width: fa.width, height: fa.height } as Rectangle;
		} else {
			(container as any).filterArea = null;
		}

		this.bound.set(go.id, { pixiFilters, specs });
	}

	private removeFilters(id: number) {
		const container = this.containerManager.getContainer(id);
		if (container) {
			(container as any).filters = null;
			(container as any).filterArea = null;
		}
		this.disposeBound(id);
	}

	private disposeBound(id: number) {
		const b = this.bound.get(id);
		if (!b) return;
		for (const f of b.pixiFilters) {
			try {
				(f as any).destroy?.();
			} catch {
				/* ignore */
			}
		}
		this.bound.delete(id);
	}

	private createOne(spec: FilterSpec): PIXIFilter | null {
		switch (spec.type) {
			case "blur":
				return createBlurFilter(spec) as unknown as PIXIFilter;
			case "colorMatrix":
				return createColorMatrixFilter(spec) as unknown as PIXIFilter;
			case "displacement":
				return createDisplacementFilter(spec) as unknown as PIXIFilter;
			case "noise":
				return createNoiseFilter(spec) as unknown as PIXIFilter;
			case "alpha":
				return createAlphaFilter(spec) as unknown as PIXIFilter;
			default:
				return null;
		}
	}

	update(time?: { deltaTime: number }) {
		// Animate noise seed for filters with noiseAnimSpeed
		const dt = (time?.deltaTime ?? 16) / 1000;
		this.elapsed += dt;
		for (const { pixiFilters, specs } of this.bound.values()) {
			for (let i = 0; i < specs.length; i++) {
				const s = specs[i];
				if (s.type === "noise" && s.noiseAnimSpeed) {
					const f = pixiFilters[i] as any;
					if (f) f.seed = (this.elapsed * s.noiseAnimSpeed) % 1;
				}
			}
		}
	}
}
