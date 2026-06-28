import type { PluginStruct } from '@eva/eva.js';
import { BehaviorScript } from './BehaviorScript';
import { BehaviorScriptSystem } from './BehaviorScriptSystem';
import type {
  BehaviorScriptFactory,
  BehaviorScriptModule,
  BehaviorScriptPluginConfig,
  BehaviorScriptSystemParams,
} from './types';

export interface BehaviorScriptPluginStruct extends PluginStruct {
  createSystem(params?: BehaviorScriptSystemParams): BehaviorScriptSystem;
}

/**
 * Legacy Eva.js PluginStruct factory — components + systems only. Kept for
 * back-compat with code that wires plugin-behavior-script via direct
 * `dslGetComponents()` / `dslGetSystems()` lists (no DSL registry).
 *
 * For the @ali/eva-dsl integration, prefer `createBehaviorScriptDslExtension`
 * (returns a `RegistryExtensions` with a setup hook that auto-registers script
 * modules into every BehaviorScriptSystem instance — multi-canvas safe).
 */
export function createBehaviorScriptExtension(config: BehaviorScriptPluginConfig = {}): BehaviorScriptPluginStruct {
  class ConfiguredBehaviorScriptSystem extends BehaviorScriptSystem {
    init(params?: BehaviorScriptSystemParams) {
      super.init({
        ...config,
        ...params,
        scripts: {
          ...(config.scripts ?? {}),
          ...(params?.scripts ?? {}),
        },
        scriptModules: [...(config.scriptModules ?? []), ...(params?.scriptModules ?? [])],
      });
    }
  }

  return {
    Components: [BehaviorScript as any],
    Systems: [ConfiguredBehaviorScriptSystem as any],
    createSystem(params?: BehaviorScriptSystemParams) {
      return new BehaviorScriptSystem({
        ...config,
        ...params,
        scripts: {
          ...(config.scripts ?? {}),
          ...(params?.scripts ?? {}),
        },
        scriptModules: [...(config.scriptModules ?? []), ...(params?.scriptModules ?? [])],
      });
    },
  };
}

/**
 * Config for {@link createBehaviorScriptDslExtension}. Supply factories via
 * `scripts` (a simple map for ad-hoc lists) and/or `scriptModules` (uri-keyed
 * bundles — preferred for HMR because the registry slot replaces by uri).
 */
export interface BehaviorScriptDslExtensionConfig {
  /**
   * Map of `scriptId → factory`. Equivalent to a single scriptModule with a
   * synthesized uri `inline://behavior-scripts`.
   */
  scripts?: Record<string, BehaviorScriptFactory>;
  /** Module-uri-keyed bundles. Preferred for HMR. */
  scriptModules?: BehaviorScriptModule[];
  /** Override the setup hook id (default: `behavior-script:register-modules`). */
  hookId?: string;
  /** Override the inline-scripts synthesized uri (default: `inline://behavior-scripts`). */
  inlineUri?: string;
}

/**
 * Loose shape of `RegistryExtensions` from `@ali/eva-dsl`. We intentionally do
 * not import the type here to keep `plugin-behavior-script` free of a runtime
 * dependency on `@ali/eva-dsl` (this package may be loaded in non-DSL Eva.js
 * apps that don't ship the DSL runtime). Consumers should still treat the
 * return value as the dsl-side `RegistryExtensions`.
 */
type DslRegistryExtensionsShape = {
  module?: string;
  components?: Record<string, any>;
  systems?: Record<string, any>;
  registerHooks?: Array<{
    id: string;
    setup(ctx: any): void | Promise<void>;
    teardown?(ctx: any): void | Promise<void>;
  }>;
};

const DEFAULT_INLINE_URI = 'inline://behavior-scripts';
const DEFAULT_HOOK_ID = 'behavior-script:register-modules';

/**
 * Build a `RegistryExtensions` for `@ali/eva-dsl` that:
 *   1. Registers `BehaviorScript` component + `BehaviorScriptSystem` class
 *      into the DSL runtime registry — same way any other plugin participates.
 *   2. Attaches an `ExtensionSetupHook` that fires AFTER `game.init()` (so
 *      `BehaviorScriptSystem` instances exist) and BEFORE
 *      `globalEntitiesManager.initialize` / `sceneManager.createScene` (so
 *      every BehaviorScript component finds its factory at attach time —
 *      closes the race window that prompted ad-hoc `registerBehaviorScripts`
 *      helpers in user code).
 *   3. Multi-canvas safe — iterates ALL `BehaviorScriptSystem` instances in
 *      `game.systems`, not just the first.
 *   4. HMR safe — re-registering with the same `hookId` replaces the previous
 *      setup; the underlying `BehaviorScriptSystem.registerModule` already
 *      slots by `uri`, so factories swap atomically.
 *
 * Usage (sandbox / user app entry):
 *
 *   await renderDSLObject(canvas, DSL, {
 *     components: dslGetComponents(),
 *     systems:    dslGetSystems(),
 *     extensions: [
 *       createBehaviorScriptDslExtension({
 *         scriptModules: [{
 *           uri: 'src/games/home/scripts/index.ts',
 *           exports: { gameDirectorFactory, nianMoverFactory, ... },
 *         }],
 *       }),
 *     ],
 *   }, opts);
 */
export function createBehaviorScriptDslExtension(
  config: BehaviorScriptDslExtensionConfig = {},
): DslRegistryExtensionsShape {
  const hookId = config.hookId ?? DEFAULT_HOOK_ID;
  const inlineUri = config.inlineUri ?? DEFAULT_INLINE_URI;

  const modules: BehaviorScriptModule[] = [];
  if (config.scripts && Object.keys(config.scripts).length > 0) {
    modules.push({ uri: inlineUri, exports: { ...config.scripts } });
  }
  if (config.scriptModules) {
    for (const mod of config.scriptModules) modules.push(mod);
  }

  return {
    module: '@eva/plugin-behavior-script',
    components: { BehaviorScript: BehaviorScript as any },
    systems: { BehaviorScriptSystem: BehaviorScriptSystem as any },
    registerHooks: [
      {
        id: hookId,
        async setup(ctx) {
          if (modules.length === 0) return;
          const candidates: any[] =
            typeof ctx?.getAllSystems === 'function'
              ? ctx.getAllSystems('BehaviorScript')
              : Array.isArray(ctx?.systems?.())
              ? ctx.systems().filter((s: any) => s?.constructor?.systemName === 'BehaviorScript' || s?.name === 'BehaviorScript')
              : [];
          if (candidates.length === 0) {
            console.warn(`[plugin-behavior-script] no BehaviorScriptSystem instance found at setup '${hookId}' — DSL must declare \"BehaviorScriptSystem\" in systems[]`);
            return;
          }
          for (const sys of candidates) {
            if (typeof sys.registerModule !== 'function') continue;
            for (const mod of modules) {
              try {
                sys.registerModule(mod);
              } catch (err) {
                console.error(`[plugin-behavior-script] registerModule failed for uri '${mod.uri}':`, err);
              }
            }
          }
        },
        async teardown(ctx) {
          if (modules.length === 0) return;
          const candidates: any[] =
            typeof ctx?.getAllSystems === 'function'
              ? ctx.getAllSystems('BehaviorScript')
              : [];
          for (const sys of candidates) {
            const unregister = sys?.unregisterModule;
            if (typeof unregister === 'function') {
              for (const mod of modules) {
                try {
                  unregister.call(sys, mod.uri);
                } catch (_err) {
                  // teardown must never throw — swallow
                }
              }
            }
          }
        },
      },
    ],
  };
}
