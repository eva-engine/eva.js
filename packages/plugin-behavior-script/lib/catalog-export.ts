import type { BehaviorScriptManifest } from './manifest';
import type {
  BehaviorScriptCatalog,
  BehaviorScriptCatalogEntry,
  BehaviorScriptRegistryLike,
} from './types';

/**
 * Editor-facing snapshot of the BehaviorScript registry. Phase 2 of the
 * BehaviorScript first-class roadmap (ADR-0020) wires this into a dev-server
 * endpoint so the MetadataDrivenInspector can render scripts whose code lives
 * outside the Editor process.
 *
 * Phase 1 only needs the function — it's safe to call from any environment
 * that owns a `BehaviorScriptRegistryLike` instance.
 */
export interface BehaviorScriptCatalogExport extends BehaviorScriptCatalog {
  /** Schema version of this export envelope; bump when shape changes. */
  version: number;
  generatedAt: string;
  scripts: BehaviorScriptCatalogEntry[];
}

export function exportScriptCatalog(
  registry: Pick<BehaviorScriptRegistryLike, 'getScriptIds' | 'getManifest' | 'getSourceUri' | 'getCatalog'>,
): BehaviorScriptCatalogExport {
  // Prefer the registry's native getCatalog() when present — it already builds
  // the {scriptId, manifest, sourceUri}[] array. We only wrap with version/timestamp.
  const native = typeof (registry as any).getCatalog === 'function'
    ? (registry as any).getCatalog()
    : undefined;
  const scripts: BehaviorScriptCatalogEntry[] = native?.scripts ?? buildEntries(registry);
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    scripts: scripts.map(entry => ({
      scriptId: entry.scriptId,
      manifest: entry.manifest ? sanitizeManifestForExport(entry.manifest) : undefined,
      sourceUri: entry.sourceUri,
    })),
  };
}

function buildEntries(
  registry: Pick<BehaviorScriptRegistryLike, 'getScriptIds' | 'getManifest' | 'getSourceUri'>,
): BehaviorScriptCatalogEntry[] {
  const ids = registry.getScriptIds?.() ?? [];
  return ids.map(scriptId => ({
    scriptId,
    manifest: registry.getManifest?.(scriptId),
    sourceUri: registry.getSourceUri?.(scriptId),
  }));
}

/**
 * Strip fields that don't survive JSON round-tripping cleanly (e.g.
 * `source.content` may contain a full TS source blob — Editor only needs URI
 * + line/column for "open in editor").
 */
function sanitizeManifestForExport(manifest: BehaviorScriptManifest): BehaviorScriptManifest {
  const cloned: BehaviorScriptManifest = { ...manifest };
  if (manifest.source) {
    cloned.source = {
      uri: manifest.source.uri,
      exportName: manifest.source.exportName,
      line: manifest.source.line,
      column: manifest.source.column,
      // intentionally drop `content` — too heavy for catalog snapshots
    };
  }
  return cloned;
}
