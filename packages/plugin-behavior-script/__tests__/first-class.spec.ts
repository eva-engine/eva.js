import { GameObject, Scene } from '@eva/eva.js';
import {
  BehaviorScript,
  BehaviorScriptRegistry,
  BehaviorScriptSystem,
  defineBehaviorScript,
  assertScriptIdValid,
  BehaviorScriptIdError,
  isScriptIdShapeValid,
  exportScriptCatalog,
} from '../lib';
import type { BehaviorScriptInitFlat } from '../lib/BehaviorScript';

describe('BehaviorScript first-class — Phase 1 contract (ADR-0020)', () => {
  describe('defineBehaviorScript dual signature', () => {
    it('accepts the new flat shape { id, propsSchema, factory }', () => {
      const factory = defineBehaviorScript<{ speed: number }>({
        id: 'test.flat',
        displayName: 'Test Flat',
        category: 'Test',
        propsSchema: {
          type: 'object',
          required: ['speed'],
          properties: {
            speed: { type: 'number', default: 100, minimum: 0, maximum: 500 },
          },
        },
        factory: () => ({ process() {} }),
      });
      expect(factory.manifest).toBeDefined();
      expect(factory.manifest!.scriptId).toBe('test.flat');
      expect(factory.manifest!.displayName).toBe('Test Flat');
      expect(factory.manifest!.propsSchema).toBeDefined();
      expect(factory.manifest!.propsSchema!.properties.speed).toEqual(
        expect.objectContaining({ type: 'number', default: 100, minimum: 0, maximum: 500 }),
      );
    });

    it('still accepts the legacy { manifest, factory } shape', () => {
      const factory = defineBehaviorScript<{ speed: number }>({
        manifest: {
          scriptId: 'test.legacy',
          props: [
            { name: 'speed', type: 'number', default: 100, min: 0, max: 500, required: true },
          ],
        },
        factory: () => ({ process() {} }),
      });
      expect(factory.manifest!.scriptId).toBe('test.legacy');
      // Legacy `props[]` is preserved AND a `propsSchema` is synthesized.
      expect(factory.manifest!.propsSchema).toBeDefined();
      expect(factory.manifest!.propsSchema!.properties.speed).toEqual(
        expect.objectContaining({ type: 'number', default: 100, minimum: 0, maximum: 500 }),
      );
      expect(factory.manifest!.propsSchema!.required).toContain('speed');
    });
  });

  describe('scriptId validation', () => {
    it('accepts valid shapes', () => {
      expect(() => assertScriptIdValid('NianMover')).not.toThrow();
      expect(() => assertScriptIdValid('nian.composite')).not.toThrow();
      expect(() => assertScriptIdValid('npc-idle')).not.toThrow();
      expect(() => assertScriptIdValid('player.controller_v2')).not.toThrow();
      expect(isScriptIdShapeValid('npc-alert')).toBe(true);
    });

    it('rejects reserved built-in names', () => {
      for (const reserved of ['Img', 'Text', 'Spine', 'Transform', 'BehaviorScript']) {
        try {
          assertScriptIdValid(reserved);
          fail(`Expected ${reserved} to be rejected`);
        } catch (err) {
          expect(err).toBeInstanceOf(BehaviorScriptIdError);
          expect((err as BehaviorScriptIdError).code).toBe('BS_ID_COLLIDES_BUILTIN');
        }
      }
    });

    it('rejects malformed identifiers', () => {
      for (const bad of ['1abc', 'has space', 'a', '中文', '']) {
        expect(isScriptIdShapeValid(bad)).toBe(false);
      }
    });

    it('defineBehaviorScript throws on reserved id', () => {
      expect(() =>
        defineBehaviorScript({
          id: 'Img',
          factory: () => ({}),
        }),
      ).toThrow(/collides with a reserved/);
    });
  });

  describe('BehaviorScript.init flat shape (DSL type=scriptId path)', () => {
    it('reads scriptId from __bsScriptId and userProps from top-level keys', () => {
      const component = new BehaviorScript<{ speed: number; jumpImpulse: number }>();
      const params: BehaviorScriptInitFlat<{ speed: number; jumpImpulse: number }> = {
        __bsScriptId: 'player.controller',
        speed: 420,
        jumpImpulse: 780,
      };
      component.init(params);
      expect(component.scriptId).toBe('player.controller');
      expect(component.props).toEqual({ speed: 420, jumpImpulse: 780 });
      expect(component.enabled).toBe(true);
      expect(component.priority).toBe(0);
      expect(component.pauseMode).toBe('inherit');
    });

    it('reads runtime wrapper fields from __bsWrapper', () => {
      const component = new BehaviorScript();
      const params: BehaviorScriptInitFlat = {
        __bsScriptId: 'demo',
        __bsWrapper: {
          enabled: false,
          priority: 5,
          pauseMode: 'stop',
          groups: ['ai'],
          nodes: { target: 'world/player' },
          executeInEditMode: true,
        },
        someUserProp: 'kept',
      };
      component.init(params);
      expect(component.scriptId).toBe('demo');
      expect(component.enabled).toBe(false);
      expect(component.priority).toBe(5);
      expect(component.pauseMode).toBe('stop');
      expect(component.groups).toEqual(['ai']);
      expect(component.nodes).toEqual({ target: 'world/player' });
      expect(component.executeInEditMode).toBe(true);
      expect(component.props).toEqual({ someUserProp: 'kept' });
    });

    it('still accepts legacy {scriptId, props, ...} shape', () => {
      const component = new BehaviorScript<{ speed: number }>();
      component.init({
        scriptId: 'demo',
        props: { speed: 200 } as any,
        enabled: false,
        priority: 3,
        pauseMode: 'process',
      });
      expect(component.scriptId).toBe('demo');
      expect(component.props).toEqual({ speed: 200 });
      expect(component.enabled).toBe(false);
      expect(component.priority).toBe(3);
      expect(component.pauseMode).toBe('process');
    });
  });

  describe('Base-class observer fallback (eva.js core change)', () => {
    it('BehaviorScriptSystem observer catches an anonymous subclass instance', () => {
      // Synthetic subclass of BehaviorScript with a unique componentName —
      // this is the runtime shape that "type=scriptId DSL" would produce in
      // Phase 2 when SceneManager looks up the script as a real Component class.
      class Synthetic extends BehaviorScript {
        static componentName = 'TestSyntheticScript';
      }

      let hooked = false;
      const system = new BehaviorScriptSystem();
      system.init({
        scripts: {
          TestSyntheticScript: defineBehaviorScript({
            id: 'TestSyntheticScript',
            factory: () => ({
              setup() {
                hooked = true;
              },
            }),
          }),
        },
      });

      const scene = new Scene('test');
      const entity = new GameObject('host');
      scene.addChild(entity);
      const comp = entity.addComponent(Synthetic);
      // Init with flat shape using the synthetic class's componentName.
      comp.init({ __bsScriptId: 'TestSyntheticScript' } as any);
      system.attach(comp);

      expect(hooked).toBe(true);
      expect(comp.scriptId).toBe('TestSyntheticScript');
      system.destroy();
    });
  });

  describe('catalog export', () => {
    it('exposes script catalog snapshot with version + timestamp', () => {
      const registry = new BehaviorScriptRegistry();
      const factory = defineBehaviorScript({
        id: 'export.demo',
        propsSchema: {
          type: 'object',
          properties: { x: { type: 'number', default: 0 } },
        },
        factory: () => ({}),
      });
      registry.registerScript('export.demo', factory, 'src/test/demo.ts');
      const snapshot = exportScriptCatalog(registry);
      expect(snapshot.version).toBe(1);
      expect(snapshot.generatedAt).toEqual(expect.any(String));
      expect(snapshot.scripts).toHaveLength(1);
      expect(snapshot.scripts[0].scriptId).toBe('export.demo');
      expect(snapshot.scripts[0].manifest?.propsSchema?.properties.x).toEqual(
        expect.objectContaining({ type: 'number', default: 0 }),
      );
      expect(snapshot.scripts[0].sourceUri).toBe('src/test/demo.ts');
    });
  });
});
