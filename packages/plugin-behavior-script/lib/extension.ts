import type { PluginStruct } from '@eva/eva.js';
import { BehaviorScript } from './BehaviorScript';
import { BehaviorScriptSystem } from './BehaviorScriptSystem';
import type { BehaviorScriptPluginConfig, BehaviorScriptSystemParams } from './types';

export interface BehaviorScriptPluginStruct extends PluginStruct {
  createSystem(params?: BehaviorScriptSystemParams): BehaviorScriptSystem;
}

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
