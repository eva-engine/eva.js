
# @eva/plugin-renderer-tilemap

Eva.js TileMap / TileSet rendering plugin — Godot-style chunked v2 path + Phaser-style v1 path.

More Introduction
- [EN](https://eva.js.org)
- [中文](https://eva-engine.gitee.io)

## Behavior contracts

### Tilemap entity is transform-fixed

The Tilemap component renders its chunks in a single `Container` mounted under the
host GameObject's display container. The geometry of chunks is computed once at
build time from `cellSize`, `mapOrigin`, and the layer's `cellData`. Once built:

- **`transform.position`**: respected — moving the host entity translates the
  whole tilemap as expected (PIXI display tree).
- **`transform.rotation`**: respected — the chunk Container rotates with the host.
- **`transform.scale`**: respected visually, but chunk geometry itself is not
  recomputed. Cell collision math (e.g. `cullingBoundsHint`) does **not** see
  the host scale.
- **`transform.size`**: **ignored**. Tilemap chunks are sized from `cellSize`,
  not the host entity size. Resizing the host entity does not resize cells.

If you need to resize cells at runtime, update the `cellSize` prop on the
Tilemap component — the change emits a CHANGE event for which the system
rebuilds layer chunks. Do not mutate `transform.size` and expect the tilemap
to reflow.

This is intentional. Tilemaps are typically world-fixed terrain; making them
react to host `transform.size` would require per-frame geometry recomputation,
which is much more expensive than the current sprite-build path and only
useful in niche cases (e.g. minimap or auto-fit UI).

### v1 vs v2 paths

The system auto-detects path by component props:

- `tileset: string` set → v1 path (Phaser-style: single tileset image +
  `layers[].data[][]`).
- `tilemapRef: string` set → v2 path (Godot-style: external `.tileset.json`
  resource via `RESOURCE_TYPE.TILESET` + chunked `layersV2[].cellData.chunks`).

Switching modes on a live entity (e.g. host clears `tileset` and sets
`tilemapRef`) is handled by `handleChange` with proper teardown of the
previous mode's containers and animation drivers (see `ensureV1Built` /
`ensureV2Built`).

### componentObserver watch list

The decorator watches `tileset`, `tilemapRef`, and **`layersV2`** with
`deep: false`. The host must **reassign `component.layersV2 = [...]` with a
new array reference** for paint-stroke patches to trigger a rebuild —
mutating the array in place will not fire the observer.

### Hot reload (SSE)

When the host PUTs an updated `.tileset.json` to the design server, the
server emits `tileset.updated` SSE; the host calls `reloadTilesetInRuntime`
which invalidates the Eva resource cache and toggles `tilemapRef` to force a
rebuild. See `apps/eva-design/src/app/tileset-hot-reload.ts` (host) +
`hot-reload.ts:diffTilesetForChunkRebuild` (plugin diff helper).

### Performance probes

20 probe names declared in `probes.ts`. Most are emitted in hot paths (animation
tick, paint apply, chunk culling, mode-switch failures, animation errors,
context loss, etc.); the rest are deferred to Cycle 2 (GPU upload, autotile,
draw calls by atlas, bodies destroyed). Phase B `budgetCoverage` is enforced
locally via `__tests__/probe-coverage.spec.ts`.

### Animation driver wiring

In v2 mode, animated source tiles (with `animation.frames[]`) are registered
in `record.animatedSpritesByAnimKey` at sprite-build time. The `update()` tick
walks all `animationDrivers` and applies dirty-frame texture swaps to live
sprites. In tab-hidden or WebGL-context-lost states, the tick is skipped.

### Physics (stop-gap)

ADR-0019 Phase 1 — plugin-matterjs `registerBodySource` integration — is
deferred. The current path:

1. `physics/tilemap-static-body-host.ts:buildTileMapStaticBodyDefinitions`
   produces `BodyDefinition[]` from a TileSet's `physicsLayers` and a
   chunked cellData snapshot.
2. The host (game-side) spawns child GameObjects with `Physics` components
   per definition. The plugin does **not** push bodies into Matter.World
   directly.
3. `ADR_0019_NATIVE_REGISTRY_AVAILABLE = false` is a stable flag the host
   can branch on once the matterjs PR lands.

### Mesh rendering path

`chunk-mesh.ts:buildChunkMesh` is currently a stub. `ChunkRenderStrategy`
dispatches dense chunks to the mesh path; the path falls back to sprite
rendering when `isMeshPathAvailable()` returns false (current default).
Activation depends on real PIXI Mesh + tile-shader wiring (Cycle 2).
