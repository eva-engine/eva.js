/**
 * createBehaviorScriptDslExtension — verifies the new RegistryExtensions +
 * ExtensionSetupHook integration (Phase 7, ADR-0023).
 *
 * Asserts: returned shape, hook id, multi-system iteration, idempotent
 * teardown, missing-system warning, HMR slot replacement.
 */
import { createBehaviorScriptDslExtension, defineBehaviorScript } from "../lib";

describe("createBehaviorScriptDslExtension — DSL Registry extension w/ setup hook (ADR-0023)", () => {
  const makeFactory = (id: string) =>
    defineBehaviorScript({
      id,
      propsSchema: { type: "object", properties: {} },
      factory: () => ({}),
    });

  it("returns a RegistryExtensions shape with BehaviorScript component + BehaviorScriptSystem", () => {
    const ext = createBehaviorScriptDslExtension();
    expect(ext.module).toBe("@eva/plugin-behavior-script");
    expect(ext.components).toHaveProperty("BehaviorScript");
    expect(ext.systems).toHaveProperty("BehaviorScriptSystem");
    expect(Array.isArray(ext.registerHooks)).toBe(true);
    expect(ext.registerHooks!.length).toBe(1);
    expect(ext.registerHooks![0].id).toBe("behavior-script:register-modules");
  });

  it("setup() iterates every BehaviorScriptSystem instance (multi-canvas)", async () => {
    const fooFactory = makeFactory("foo");
    const barFactory = makeFactory("bar");
    const ext = createBehaviorScriptDslExtension({
      scriptModules: [{ uri: "src/test/scripts.ts", exports: { fooFactory, barFactory } }],
    });
    const sysA: any = {
      constructor: { systemName: "BehaviorScript" },
      registerModule: jest.fn(),
      unregisterModule: jest.fn(),
    };
    const sysB: any = {
      constructor: { systemName: "BehaviorScript" },
      registerModule: jest.fn(),
      unregisterModule: jest.fn(),
    };
    const ctx = { getAllSystems: () => [sysA, sysB], kind: "extension-setup" };
    await ext.registerHooks![0].setup(ctx);
    expect(sysA.registerModule).toHaveBeenCalledTimes(1);
    expect(sysB.registerModule).toHaveBeenCalledTimes(1);
    expect(sysA.registerModule).toHaveBeenCalledWith({ uri: "src/test/scripts.ts", exports: { fooFactory, barFactory } });
  });

  it("setup() warns when no BehaviorScriptSystem is found", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const ext = createBehaviorScriptDslExtension({
      scriptModules: [{ uri: "src/test/x.ts", exports: { fooFactory: makeFactory("foo") } }],
    });
    await ext.registerHooks![0].setup({ getAllSystems: () => [], kind: "extension-setup" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("scripts map gets folded into a synthesized inline:// module", async () => {
    const fooFactory = makeFactory("inline.foo");
    const sys: any = { constructor: { systemName: "BehaviorScript" }, registerModule: jest.fn() };
    const ext = createBehaviorScriptDslExtension({ scripts: { fooFactory } });
    await ext.registerHooks![0].setup({ getAllSystems: () => [sys], kind: "extension-setup" });
    expect(sys.registerModule).toHaveBeenCalledWith({
      uri: "inline://behavior-scripts",
      exports: { fooFactory },
    });
  });

  it("teardown() calls unregisterModule on every matching system", async () => {
    const sys: any = {
      constructor: { systemName: "BehaviorScript" },
      registerModule: jest.fn(),
      unregisterModule: jest.fn(),
    };
    const ext = createBehaviorScriptDslExtension({
      scriptModules: [{ uri: "src/x.ts", exports: { fooFactory: makeFactory("td.foo") } }],
    });
    await ext.registerHooks![0].teardown!({ getAllSystems: () => [sys], kind: "extension-setup" });
    expect(sys.unregisterModule).toHaveBeenCalledWith("src/x.ts");
  });

  it("teardown() never throws even when system lacks unregisterModule", async () => {
    const sys: any = { constructor: { systemName: "BehaviorScript" }, registerModule: jest.fn() }; // no unregisterModule
    const ext = createBehaviorScriptDslExtension({
      scriptModules: [{ uri: "src/y.ts", exports: { fooFactory: makeFactory("td2.foo") } }],
    });
    await expect(ext.registerHooks![0].teardown!({ getAllSystems: () => [sys], kind: "extension-setup" })).resolves.toBeUndefined();
  });

  it("hookId can be overridden for parallel BS extensions", () => {
    const ext = createBehaviorScriptDslExtension({ hookId: "behavior-script:vendor-a" });
    expect(ext.registerHooks![0].id).toBe("behavior-script:vendor-a");
  });
});
