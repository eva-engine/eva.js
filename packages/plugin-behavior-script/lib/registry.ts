import { defineBehaviorScript } from './manifest';
import type { BehaviorScriptDefinition, BehaviorScriptManifest } from './manifest';
import type {
  BehaviorScriptCatalog,
  BehaviorScriptFactory,
  BehaviorScriptModule,
  BehaviorScriptModuleRegistration,
  BehaviorScriptRegistryChange,
  BehaviorScriptRegistryChangeListener,
  BehaviorScriptRegistryLike,
} from './types';

interface RegisteredScriptRecord {
  factory: BehaviorScriptFactory;
  sourceUri?: string;
}

export class BehaviorScriptRegistry implements BehaviorScriptRegistryLike {
  private records = new Map<string, RegisteredScriptRecord>();
  private listeners = new Set<BehaviorScriptRegistryChangeListener>();

  registerScript(scriptId: string, factory: BehaviorScriptFactory, sourceUri?: string): BehaviorScriptFactory {
    this.records.set(scriptId, { factory, sourceUri });
    this.emitChange({
      type: 'register',
      scriptId,
      factory,
      manifest: factory.manifest,
      sourceUri,
    });
    return factory;
  }

  registerDefinition<Props extends Record<string, any> = Record<string, any>, State = any>(
    definition: BehaviorScriptDefinition<Props, State>,
    sourceUri?: string,
  ): BehaviorScriptFactory<Props, State> {
    const factory = defineBehaviorScript(definition);
    // BehaviorScriptDefinition is a union of legacy {manifest, factory} and
    // first-class flat {id, propsSchema, factory} since Phase 1 (ADR-0021).
    // After defineBehaviorScript runs, factory.manifest is always present.
    const scriptId = factory.manifest?.scriptId ?? (definition as any).id ?? (definition as any).manifest?.scriptId;
    this.registerScript(scriptId, factory, sourceUri);
    return factory;
  }

  registerModule(module: BehaviorScriptModule): BehaviorScriptModuleRegistration {
    const result: BehaviorScriptModuleRegistration = {
      uri: module.uri,
      registered: [],
      skipped: [],
    };

    for (const item of collectModuleItems(module.exports)) {
      if (isBehaviorScriptDefinition(item.value)) {
        const factory = this.registerDefinition(item.value, module.uri);
        result.registered.push(factory.manifest!.scriptId);
        continue;
      }

      if (isManifestBackedFactory(item.value)) {
        this.registerScript(item.value.manifest!.scriptId, item.value, module.uri);
        result.registered.push(item.value.manifest!.scriptId);
        continue;
      }

      result.skipped.push(item.name);
    }

    return result;
  }

  registerModules(modules: BehaviorScriptModule[]): BehaviorScriptModuleRegistration[] {
    return modules.map(module => this.registerModule(module));
  }

  /**
   * Drop every script that was registered under the given `sourceUri`. Idempotent.
   * Used by `ExtensionSetupHook.teardown()` to release factory refs cleanly.
   */
  unregisterModule(sourceUri: string): string[] {
    if (!sourceUri) return [];
    const dropped: string[] = [];
    for (const [scriptId, record] of Array.from(this.records.entries())) {
      if (record.sourceUri === sourceUri) {
        dropped.push(scriptId);
        this.unregisterScript(scriptId);
      }
    }
    return dropped;
  }

  unregisterScript(scriptId: string) {
    const record = this.records.get(scriptId);
    this.records.delete(scriptId);
    this.emitChange({
      type: 'unregister',
      scriptId,
      factory: record?.factory,
      manifest: record?.factory.manifest,
      sourceUri: record?.sourceUri,
    });
  }

  hasScript(scriptId: string): boolean {
    return this.records.has(scriptId);
  }

  getFactory(scriptId: string): BehaviorScriptFactory | undefined {
    return this.records.get(scriptId)?.factory;
  }

  getManifest(scriptId: string): BehaviorScriptManifest | undefined {
    return this.getFactory(scriptId)?.manifest;
  }

  getManifests(): BehaviorScriptManifest[] {
    return Array.from(this.records.values())
      .map(record => record.factory.manifest)
      .filter(Boolean) as BehaviorScriptManifest[];
  }

  getSourceUri(scriptId: string): string | undefined {
    return this.records.get(scriptId)?.sourceUri;
  }

  getScriptIds(): string[] {
    return Array.from(this.records.keys());
  }

  getCatalog(): BehaviorScriptCatalog {
    return {
      scripts: this.getScriptIds().map(scriptId => ({
        scriptId,
        manifest: this.getManifest(scriptId),
        sourceUri: this.getSourceUri(scriptId),
      })),
    };
  }

  clear() {
    this.records.clear();
    this.emitChange({ type: 'clear' });
  }

  onDidChange(listener: BehaviorScriptRegistryChangeListener) {
    this.listeners.add(listener);
    return {
      dispose: () => {
        this.listeners.delete(listener);
      },
    };
  }

  private emitChange(change: BehaviorScriptRegistryChange) {
    for (const listener of Array.from(this.listeners)) {
      listener(change);
    }
  }
}

function collectModuleItems(exportsValue: Record<string, any> | any[]): Array<{ name: string; value: any }> {
  if (Array.isArray(exportsValue)) {
    return exportsValue.map((value, index) => ({ name: String(index), value }));
  }

  return Object.keys(exportsValue).map(name => ({ name, value: exportsValue[name] }));
}

function isBehaviorScriptDefinition(value: any): value is BehaviorScriptDefinition {
  return Boolean(value?.manifest?.scriptId && typeof value?.factory === 'function');
}

function isManifestBackedFactory(value: any): value is BehaviorScriptFactory {
  return Boolean(typeof value === 'function' && value.manifest?.scriptId);
}
