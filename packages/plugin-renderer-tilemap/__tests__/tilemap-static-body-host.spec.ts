import {
	buildTileMapStaticBodyDefinitions,
	extractPhysicsByCellKey,
	ADR_0019_NATIVE_REGISTRY_AVAILABLE,
} from '../lib/physics/tilemap-static-body-host';
import { DecompositionCache } from '../lib/physics/decomposition-cache';
import { CHUNK_SIZE } from '../lib/chunk-codec';

function makePackedCell(slot: number, col: number, row: number, altIdx: number = 0): number {
	return (slot & 0xff) | ((col & 0xff) << 8) | ((row & 0xff) << 16) | ((altIdx & 0x1f) << 24);
}

describe('extractPhysicsByCellKey', () => {
	it('test_extractPhysicsByCellKey_atlas_alt_with_physics_yields_keyed_entry', () => {
		// Arrange
		const raw = {
			sources: [
				{
					kind: 'atlas',
					tiles: [
						{
							atlasCoords: { col: 2, row: 3 },
							alternatives: [
								{
									altId: 0,
									physics: [
										{
											layerId: 'solid',
											polygons: [{ points: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 16 }, { x: 0, y: 16 }] }],
											friction: 0.5,
										},
									],
								},
							],
						},
					],
				},
			],
		};

		// Act
		const map = extractPhysicsByCellKey(raw);

		// Assert — slot 1 (1-based) + col 2 + row 3 + altId 0
		expect(map.size).toBe(1);
		expect(map.get('1,2,3,0')).toBeDefined();
		expect(map.get('1,2,3,0')!).toHaveLength(1);
		expect(map.get('1,2,3,0')![0]!.layerId).toBe('solid');
		expect(map.get('1,2,3,0')![0]!.friction).toBe(0.5);
	});

	it('test_extractPhysicsByCellKey_skips_alternatives_without_physics', () => {
		// Arrange
		const raw = {
			sources: [
				{
					kind: 'atlas',
					tiles: [{ atlasCoords: { col: 0, row: 0 }, alternatives: [{ altId: 0 }] }],
				},
			],
		};
		// Act
		const map = extractPhysicsByCellKey(raw);
		// Assert
		expect(map.size).toBe(0);
	});

	it('test_extractPhysicsByCellKey_skips_non_atlas_sources', () => {
		// Arrange — sceneCollection source with tiles=undefined
		const raw = {
			sources: [{ kind: 'sceneCollection' }],
		};
		// Act
		const map = extractPhysicsByCellKey(raw);
		// Assert
		expect(map.size).toBe(0);
	});

	it('test_extractPhysicsByCellKey_assigns_1_based_slot_per_source_index', () => {
		// Arrange — two atlas sources, both with physics tiles at (0,0)
		const raw = {
			sources: [
				{
					kind: 'atlas',
					tiles: [
						{
							atlasCoords: { col: 0, row: 0 },
							alternatives: [{ altId: 0, physics: [{ layerId: 'a', polygons: [{ points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }] }] }],
						},
					],
				},
				{
					kind: 'atlas',
					tiles: [
						{
							atlasCoords: { col: 0, row: 0 },
							alternatives: [{ altId: 0, physics: [{ layerId: 'b', polygons: [{ points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }] }] }],
						},
					],
				},
			],
		};
		// Act
		const map = extractPhysicsByCellKey(raw);
		// Assert — slot 1 for source[0], slot 2 for source[1]
		expect(map.get('1,0,0,0')![0]!.layerId).toBe('a');
		expect(map.get('2,0,0,0')![0]!.layerId).toBe('b');
	});

	it('test_extractPhysicsByCellKey_clamps_altId_to_5_bits', () => {
		// Arrange — altId=99 (> 0x1f); cell key uses altId & 0x1f = 99 & 31 = 3
		const raw = {
			sources: [
				{
					kind: 'atlas',
					tiles: [
						{
							atlasCoords: { col: 0, row: 0 },
							alternatives: [{ altId: 99, physics: [{ layerId: 'x', polygons: [{ points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }] }] }],
						},
					],
				},
			],
		};
		// Act
		const map = extractPhysicsByCellKey(raw);
		// Assert — masked altId == 3
		expect(map.get('1,0,0,3')).toBeDefined();
		expect(map.get('1,0,0,99')).toBeUndefined();
	});
});

describe('buildTileMapStaticBodyDefinitions', () => {
	function singleCellChunk(slot: number, col: number, row: number, altIdx: number = 0): Int32Array {
		const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
		arr[0] = makePackedCell(slot, col, row, altIdx); // chunk-local (0,0)
		return arr;
	}

	it('test_buildTileMapStaticBodyDefinitions_emits_bodies_grouped_by_layerId', () => {
		// Arrange — one painted cell with one physics polygon on layer "solid"
		const physicsByCellKey = new Map<string, Array<{ layerId: string; polygons: Array<{ points: Array<{ x: number; y: number }>; origin?: 'center' | 'topLeft' }>; oneWay?: boolean; friction?: number; restitution?: number }>>([
			['1,0,0,0', [{ layerId: 'solid', polygons: [{ points: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 16 }, { x: 0, y: 16 }] }] }]],
		]);
		const input = {
			chunksByKey: { '0,0': singleCellChunk(1, 0, 0) },
			physicsByCellKey,
			cellWidth: 16,
			cellHeight: 16,
			mapOriginX: 0,
			mapOriginY: 0,
			cache: new DecompositionCache(),
		};

		// Act
		const result = buildTileMapStaticBodyDefinitions(input, { worldX: 100, worldY: 200 });

		// Assert — 1 body, on layer "solid", translated by worldX/Y
		expect(result.totalBodyCount).toBe(1);
		expect(result.bodies).toHaveLength(1);
		expect(result.bodiesByLayerId.has('solid')).toBe(true);
		expect(result.bodiesByLayerId.get('solid')!).toHaveLength(1);
		// Cell (0,0) at origin + worldX/Y offset → vertices start at (100, 200)
		expect(result.bodies[0]!.vertices[0]).toEqual({ x: 100, y: 200 });
	});

	it('test_buildTileMapStaticBodyDefinitions_returns_empty_when_no_painted_cells_have_physics', () => {
		// Arrange — painted cell but no physicsByCellKey entry
		const input = {
			chunksByKey: { '0,0': singleCellChunk(1, 0, 0) },
			physicsByCellKey: new Map(),
			cellWidth: 16,
			cellHeight: 16,
			mapOriginX: 0,
			mapOriginY: 0,
			cache: new DecompositionCache(),
		};
		// Act
		const result = buildTileMapStaticBodyDefinitions(input, { worldX: 0, worldY: 0 });
		// Assert
		expect(result.totalBodyCount).toBe(0);
		expect(result.bodiesByLayerId.size).toBe(0);
	});

	it('test_buildTileMapStaticBodyDefinitions_groups_multi_layer_bodies_separately', () => {
		// Arrange — one cell with TWO physics layer entries
		const physicsByCellKey = new Map<string, Array<{ layerId: string; polygons: Array<{ points: Array<{ x: number; y: number }>; origin?: 'center' | 'topLeft' }>; oneWay?: boolean; friction?: number; restitution?: number }>>([
			['1,0,0,0', [
				{ layerId: 'solid', polygons: [{ points: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 16 }, { x: 0, y: 16 }] }] },
				{ layerId: 'hazard', polygons: [{ points: [{ x: 4, y: 4 }, { x: 12, y: 4 }, { x: 12, y: 12 }, { x: 4, y: 12 }] }] },
			]],
		]);
		const input = {
			chunksByKey: { '0,0': singleCellChunk(1, 0, 0) },
			physicsByCellKey,
			cellWidth: 16,
			cellHeight: 16,
			mapOriginX: 0,
			mapOriginY: 0,
			cache: new DecompositionCache(),
		};
		// Act
		const result = buildTileMapStaticBodyDefinitions(input, { worldX: 0, worldY: 0 });
		// Assert
		expect(result.totalBodyCount).toBe(2);
		expect(result.bodiesByLayerId.get('solid')!).toHaveLength(1);
		expect(result.bodiesByLayerId.get('hazard')!).toHaveLength(1);
	});
});

describe('ADR-0019 native registry flag', () => {
	it('test_ADR_0019_NATIVE_REGISTRY_AVAILABLE_is_false_until_matterjs_PR_lands', () => {
		expect(ADR_0019_NATIVE_REGISTRY_AVAILABLE).toBe(false);
	});
});
