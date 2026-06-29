import { GameObject, OBSERVER_TYPE, RESOURCE_TYPE, Scene, resource } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import {
  BehaviorScript,
  BehaviorScriptRegistry,
  BehaviorScriptSystem,
  behaviorValueTypeToInspectorType,
  behaviorValueTypeToTypescript,
  createBehaviorScriptExtension,
  createBehaviorScriptBinding,
  createBehaviorScriptCodeFrame,
  createBehaviorScriptInspectorMetadata,
  createBehaviorScriptTypeHints,
  createBehaviorScriptWorkflow,
  deriveBehaviorScriptValidationPlan,
  defineBehaviorScript,
  getBehaviorScriptManifest,
  parseBehaviorScriptStackLocation,
  runBehaviorScriptValidation,
  runBehaviorScriptValidationAsync,
  validateBehaviorScriptBinding,
  validateBehaviorScript,
  validateBehaviorScriptAsync,
  validateBehaviorScriptManifest,
} from '../lib';

function createComponent(params: ConstructorParameters<typeof BehaviorScript>[0], name = 'Player') {
  const component = new BehaviorScript(params);
  component.gameObject = { name } as any;
  component.init(params);
  return component;
}

function createEventTarget(name = 'Target') {
  const listeners = new Map<string, Set<(payload: any) => void>>();
  return {
    name,
    on(eventName: string, listener: (payload: any) => void) {
      const set = listeners.get(eventName) ?? new Set<(payload: any) => void>();
      set.add(listener);
      listeners.set(eventName, set);
    },
    off(eventName: string, listener: (payload: any) => void) {
      listeners.get(eventName)?.delete(listener);
    },
    emit(eventName: string, payload?: any) {
      for (const listener of Array.from(listeners.get(eventName) ?? [])) {
        listener(payload);
      }
    },
  };
}

function registerTestResource(name: string, type: RESOURCE_TYPE | string = RESOURCE_TYPE.IMAGE) {
  (resource as any).resourcesMap[name] = {
    name,
    type,
    src: {
      image: { type: 'data', data: { name } },
    },
    data: {},
    complete: false,
  };
}

function clearTestResources() {
  const resourcesMap = (resource as any).resourcesMap ?? {};
  for (const name of Object.keys(resourcesMap)) {
    if (name.startsWith('behavior:')) delete resourcesMap[name];
  }
  const promiseMap = (resource as any).promiseMap ?? {};
  for (const name of Object.keys(promiseMap)) {
    if (name.startsWith('behavior:')) delete promiseMap[name];
  }
}

describe('plugin-behavior-script', () => {
  beforeEach(() => {
    getSignalBus().clear();
    clearTestResources();
    jest.restoreAllMocks();
  });

  it('binds script lifecycle and per-frame phases', () => {
    const order: string[] = [];
    const component = createComponent({ scriptId: 'player', props: { speed: 12 } });
    const system = new BehaviorScriptSystem({
      scripts: {
        player: ctx => {
          order.push(`factory:${ctx.props.speed}`);
          return {
            setup: () => order.push('setup'),
            enterTree: () => order.push('enterTree'),
            ready: () => order.push('ready'),
            process: () => order.push('process'),
            lateProcess: () => order.push('lateProcess'),
            physicsProcess: () => order.push('physicsProcess'),
            pause: () => order.push('pause'),
            resume: () => order.push('resume'),
            exitTree: () => order.push('exitTree'),
            destroy: () => order.push('destroy'),
          };
        },
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(component);
    system.update({ deltaTime: 16 } as any);
    system.lateUpdate({ deltaTime: 16 } as any);
    system.fixedUpdate({ deltaTime: 16, fixedDeltaTime: 16, step: 1 });
    system.onPause();
    system.onResume();
    system.detach(component);

    expect(order).toEqual([
      'factory:12',
      'setup',
      'enterTree',
      'ready',
      'process',
      'lateProcess',
      'physicsProcess',
      'pause',
      'resume',
      'exitTree',
      'destroy',
    ]);
  });

  it('blocks active behavior phases while paused by default and resumes them afterward', () => {
    jest.useFakeTimers();
    const events: string[] = [];
    const target = createEventTarget();
    const component = createComponent({ scriptId: 'paused.player' });
    const system = new BehaviorScriptSystem({
      eventTargets: { world: target },
      scripts: {
        'paused.player': ctx => ({
          setup() {
            ctx.onSignal('probe:global', () => events.push('ctx-signal'));
            ctx.onEvent(target, 'damage', () => events.push('ctx-event'));
            ctx.setInterval(() => events.push('timer'), 5);
          },
          process: () => events.push('process'),
          lateProcess: () => events.push('lateProcess'),
          physicsProcess: () => events.push('physicsProcess'),
          input: event => events.push(`input:${event.action}`),
          unhandledInput: event => events.push(`unhandled:${event.action}`),
          onSignal: name => events.push(`signal:${name}`),
          pause: () => events.push(`pause:${ctx.isPaused()}:${ctx.getPauseMode()}`),
          resume: () => events.push(`resume:${ctx.isPaused()}`),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    try {
      system.attach(component);
      system.onPause();
      system.update({ deltaTime: 16 } as any);
      system.lateUpdate({ deltaTime: 16 } as any);
      system.fixedUpdate({ deltaTime: 16, fixedDeltaTime: 16, step: 1 });
      system.dispatchInput({ action: 'probe', phase: 'press' }, component);
      system.dispatchSignal('probe:direct', undefined, component);
      system.emitSignal('probe:global');
      target.emit('damage', { hp: 1 });
      jest.advanceTimersByTime(5);

      expect(system.isPaused()).toBe(true);
      expect(system.getDefaultPauseMode()).toBe('stop');
      expect(events).toEqual(['pause:true:stop']);

      system.onResume();
      system.update({ deltaTime: 16 } as any);
      system.lateUpdate({ deltaTime: 16 } as any);
      system.fixedUpdate({ deltaTime: 16, fixedDeltaTime: 16, step: 2 });
      system.dispatchInput({ action: 'probe', phase: 'press' }, component);
      system.dispatchSignal('probe:direct', undefined, component);
      system.emitSignal('probe:global');
      target.emit('damage', { hp: 1 });
      jest.advanceTimersByTime(5);

      expect(system.isPaused()).toBe(false);
      expect(events).toEqual([
        'pause:true:stop',
        'resume:false',
        'process',
        'lateProcess',
        'physicsProcess',
        'input:probe',
        'unhandled:probe',
        'signal:probe:direct',
        'ctx-signal',
        'ctx-event',
        'timer',
      ]);
    } finally {
      system.detach(component);
      jest.useRealTimers();
    }
  });

  it('lets pauseMode process and system defaultPauseMode process keep active phases running while paused', () => {
    const events: string[] = [];
    const inherited = createComponent({ scriptId: 'pause.inherited' }, 'Inherited');
    const explicit = createComponent({ scriptId: 'pause.explicit', pauseMode: 'process' }, 'Explicit');
    const stopped = createComponent({ scriptId: 'pause.stopped', pauseMode: 'stop' }, 'Stopped');
    const system = new BehaviorScriptSystem({
      defaultPauseMode: 'process',
      scripts: {
        'pause.inherited': () => ({
          process: () => events.push('inherited-process'),
          input: () => events.push('inherited-input'),
          pause: () => events.push('inherited-pause'),
        }),
        'pause.explicit': () => ({
          process: () => events.push('explicit-process'),
          input: () => events.push('explicit-input'),
          pause: () => events.push('explicit-pause'),
        }),
        'pause.stopped': () => ({
          process: () => events.push('stopped-process'),
          input: () => events.push('stopped-input'),
          pause: () => events.push('stopped-pause'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(inherited);
    system.attach(explicit);
    system.attach(stopped);
    system.onPause();
    system.update({ deltaTime: 16 } as any);
    system.dispatchInput({ action: 'probe', phase: 'press' });

    expect(events).toEqual([
      'inherited-pause',
      'explicit-pause',
      'stopped-pause',
      'inherited-process',
      'explicit-process',
      'inherited-input',
      'explicit-input',
    ]);
  });

  it('exposes runtime snapshots for editor debugging and AI reports', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const editable = createComponent(
      {
        scriptId: 'runtime.editable',
        source: { uri: 'scripts/runtime-editable.ts', exportName: 'EditableScript' },
        executeInEditMode: true,
        pauseMode: 'process',
        priority: -2,
      },
      'Editable',
    );
    const deferred = createComponent({ scriptId: 'runtime.deferred', priority: 5 }, 'Deferred');
    const editableFactory = defineBehaviorScript({
      manifest: {
        scriptId: 'runtime.editable',
        displayName: 'Runtime Editable',
        source: { uri: 'scripts/runtime-editable.ts', exportName: 'EditableScript' },
      },
      factory: () => ({
        process() {
          throw new Error('runtime snapshot failure');
        },
      }),
    });
    const deferredFactory = defineBehaviorScript({
      manifest: {
        scriptId: 'runtime.deferred',
        displayName: 'Runtime Deferred',
      },
      factory: () => ({}),
    });
    const system = new BehaviorScriptSystem({
      runMode: 'edit',
      scripts: {
        'runtime.editable': editableFactory,
        'runtime.deferred': deferredFactory,
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(editable);
    system.attach(deferred);
    system.onPause();
    system.update({ deltaTime: 16 } as any);

    const snapshot = system.getRuntimeSnapshot();
    const editableSnapshot = snapshot.scripts.find(script => script.scriptId === 'runtime.editable');
    const deferredSnapshot = snapshot.scripts.find(script => script.scriptId === 'runtime.deferred');

    expect(snapshot).toMatchObject({
      runMode: 'edit',
      paused: true,
      defaultPauseMode: 'stop',
    });
    expect(snapshot.catalog.scripts.map(script => script.scriptId)).toEqual(['runtime.editable', 'runtime.deferred']);
    expect(snapshot.diagnostics).toHaveLength(1);
    expect(editableSnapshot).toMatchObject({
      status: 'bound',
      bound: true,
      deferred: false,
      active: true,
      enabled: true,
      priority: -2,
      runMode: 'edit',
      paused: true,
      pauseMode: 'process',
      componentPauseMode: 'process',
      executeInEditMode: true,
      diagnostics: 1,
      errors: 1,
      warnings: 0,
      gameObjectName: 'Editable',
      source: { uri: 'scripts/runtime-editable.ts', exportName: 'EditableScript' },
      manifest: { scriptId: 'runtime.editable', displayName: 'Runtime Editable' },
      hotReload: { enabled: true, keepState: true },
    });
    expect(deferredSnapshot).toMatchObject({
      status: 'deferred',
      bound: false,
      deferred: true,
      active: false,
      enabled: true,
      priority: 5,
      runMode: 'edit',
      paused: true,
      pauseMode: 'stop',
      componentPauseMode: 'inherit',
      executeInEditMode: false,
      diagnostics: 0,
      errors: 0,
      gameObjectName: 'Deferred',
      manifest: { scriptId: 'runtime.deferred', displayName: 'Runtime Deferred' },
    });
    expect(error).toHaveBeenCalled();
  });

  it('supports Godot-style script groups for dispatch, callGroup, and runtime snapshots', () => {
    const events: string[] = [];
    const boss = createComponent({ scriptId: 'group.boss', groups: ['enemy'], priority: -5 }, 'Boss');
    const scout = createComponent({ scriptId: 'group.scout', groups: ['enemy', 'flying', 'enemy'] }, 'Scout');
    const disabled = createComponent({ scriptId: 'group.disabled', groups: ['enemy'], enabled: false }, 'Disabled');
    const system = new BehaviorScriptSystem({
      scripts: {
        'group.boss': defineBehaviorScript({
          manifest: {
            scriptId: 'group.boss',
            groups: [{ name: 'enemy', description: 'Enemy squad members.' }],
          },
          factory: () => ({
            input: event => events.push(`boss-input:${event.action}`),
            onSignal: name => events.push(`boss-signal:${name}`),
            mark(value: number) {
              events.push(`boss-mark:${value}`);
            },
          }),
        }),
        'group.scout': defineBehaviorScript({
          manifest: {
            scriptId: 'group.scout',
            groups: [{ name: 'enemy' }, { name: 'flying' }, { name: 'runtime' }],
          },
          factory: ctx => ({
            setup() {
              ctx.addToGroup('runtime');
              events.push(`scout-groups:${ctx.getGroups().join(',')}:${ctx.isInGroup('runtime')}`);
            },
            input: event => events.push(`scout-input:${event.action}`),
            onSignal: name => events.push(`scout-signal:${name}`),
            mark(value: number) {
              events.push(`scout-mark:${value}`);
              ctx.removeFromGroup('runtime');
            },
          }),
        }),
        'group.disabled': () => ({
          input: event => events.push(`disabled-input:${event.action}`),
          onSignal: name => events.push(`disabled-signal:${name}`),
          mark(value: number) {
            events.push(`disabled-mark:${value}`);
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(scout);
    system.attach(boss);
    system.attach(disabled);

    expect(system.getGroupScripts('enemy').map(script => script.gameObject?.name)).toEqual([
      'Boss',
      'Scout',
      'Disabled',
    ]);
    expect(system.getGroupScripts('runtime').map(script => script.gameObject?.name)).toEqual(['Scout']);
    expect(system.isInGroup(scout, 'flying')).toBe(true);

    system.dispatchInputToGroup('enemy', { action: 'attack', phase: 'press' });
    system.dispatchSignalToGroup('enemy', 'enemy:alert', { level: 1 });
    expect(system.callGroup('enemy', 'mark', 7)).toBe(2);

    const snapshot = system.getRuntimeSnapshot();
    expect(snapshot.scripts.find(script => script.scriptId === 'group.scout')).toMatchObject({
      groups: ['enemy', 'flying'],
      active: true,
    });
    expect(snapshot.scripts.find(script => script.scriptId === 'group.disabled')).toMatchObject({
      groups: ['enemy'],
      enabled: false,
      active: false,
    });
    expect(system.getGroupScripts('runtime')).toEqual([]);
    expect(events).toEqual([
      'scout-groups:enemy,flying,runtime:true',
      'boss-input:attack',
      'scout-input:attack',
      'boss-signal:enemy:alert',
      'scout-signal:enemy:alert',
      'boss-mark:7',
      'scout-mark:7',
    ]);
  });

  it('resolves manifest-backed NodePath references from the scene tree', () => {
    const events: string[] = [];
    const scene = new Scene('arena');
    const player = new GameObject('Player');
    const weapon = new GameObject('Weapon');
    const enemy = new GameObject('Enemy');
    const hud = new GameObject('Hud');
    player.addChild(weapon);
    scene.addChild(player);
    scene.addChild(enemy);
    scene.addChild(hud);

    const component = player.addComponent(
      new BehaviorScript({
        scriptId: 'node.player',
        nodes: {
          target: '/arena/Enemy',
          hud: '../Hud',
        },
      }),
    );
    const system = new BehaviorScriptSystem({
      scripts: {
        'node.player': defineBehaviorScript({
          manifest: {
            scriptId: 'node.player',
            nodes: [
              { name: 'weapon', path: 'Weapon', required: true },
              { name: 'target', path: 'Enemy', required: true },
              { name: 'hud', path: '../Hud' },
              { name: 'allEnemies', path: 'Enemy', multiple: true },
            ],
          },
          factory: ctx => ({
            ready() {
              events.push(`self:${ctx.getNode('self')?.name}`);
              events.push(`weapon:${ctx.getRequiredNode('weapon').name}`);
              events.push(`target:${ctx.getNode('target')?.name}`);
              events.push(`hud:${ctx.getNode('hud')?.name}`);
              events.push(`parent:${ctx.getNode('..')?.name}`);
              events.push(
                `all:${ctx
                  .getNodes('allEnemies')
                  .map(node => node.name)
                  .join(',')}`,
              );
              try {
                ctx.getRequiredNode('missing');
              } catch (error: any) {
                events.push(`missing:${error.message}`);
              }
            },
          }),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(component);

    expect(events).toEqual([
      'self:Player',
      'weapon:Weapon',
      'target:Enemy',
      'hud:Hud',
      'parent:arena',
      'all:Enemy',
      'missing:BehaviorScript node reference not found: missing',
    ]);
    expect(system.getRuntimeSnapshot().scripts[0].nodes).toEqual([
      { name: 'weapon', path: 'Weapon', resolved: true, gameObjectName: 'Weapon', required: true, multiple: undefined },
      {
        name: 'target',
        path: '/arena/Enemy',
        resolved: true,
        gameObjectName: 'Enemy',
        required: true,
        multiple: undefined,
      },
      { name: 'hud', path: '../Hud', resolved: true, gameObjectName: 'Hud', required: undefined, multiple: undefined },
      {
        name: 'allEnemies',
        path: 'Enemy',
        resolved: true,
        gameObjectName: 'Enemy',
        required: undefined,
        multiple: true,
      },
    ]);
  });

  it('resolves manifest-backed resource references through Eva resource manager', async () => {
    registerTestResource('behavior:playerIcon');
    registerTestResource('behavior:jumpSfx', RESOURCE_TYPE.AUDIO);
    const events: string[] = [];
    const loads: Array<Promise<void>> = [];
    const component = createComponent({
      scriptId: 'resource.player',
      resources: {
        icon: ' behavior:playerIcon ',
        sfx: 'behavior:jumpSfx',
      },
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'resource.player': defineBehaviorScript({
          manifest: {
            scriptId: 'resource.player',
            resources: [
              { name: 'icon', resource: 'behavior:defaultIcon', type: 'IMAGE', required: true, preload: true },
              { name: 'optional', resource: 'behavior:missingOptional', type: 'IMAGE' },
            ],
          },
          factory: ctx => ({
            ready() {
              events.push(`iconName:${ctx.getResourceName('icon')}`);
              events.push(`sfxName:${ctx.getResourceName('sfx')}`);
              events.push(`hasIcon:${ctx.hasResource('icon')}`);
              events.push(`hasOptional:${ctx.hasResource('optional')}`);
              loads.push(
                ctx.loadRequiredResource('icon').then(loaded => {
                  events.push(`loaded:${(loaded as any).name}:${(loaded as any).complete}`);
                }),
              );
              loads.push(
                ctx.loadRequiredResource('missing').catch(error => {
                  events.push(`missing:${error.message}`);
                }),
              );
            },
          }),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(component);
    await Promise.all(loads);

    expect(events).toEqual([
      'iconName:behavior:playerIcon',
      'sfxName:behavior:jumpSfx',
      'hasIcon:true',
      'hasOptional:false',
      'missing:BehaviorScript resource reference not found: missing -> missing',
      'loaded:behavior:playerIcon:true',
    ]);
    expect(system.getRuntimeSnapshot().scripts[0].resources).toEqual([
      {
        name: 'icon',
        resource: 'behavior:playerIcon',
        available: true,
        loaded: true,
        type: 'IMAGE',
        required: true,
        preload: true,
      },
      {
        name: 'optional',
        resource: 'behavior:missingOptional',
        available: false,
        loaded: undefined,
        type: 'IMAGE',
        required: undefined,
        preload: undefined,
      },
      {
        name: 'sfx',
        resource: 'behavior:jumpSfx',
        available: true,
        loaded: false,
        type: 'AUDIO',
        required: undefined,
        preload: undefined,
      },
    ]);
  });

  it('keeps disabled scripts attached but skips active behavior phases until re-enabled', () => {
    jest.useFakeTimers();
    const events: string[] = [];
    const target = createEventTarget();
    const component = createComponent({ scriptId: 'disabled.player', enabled: false });
    const system = new BehaviorScriptSystem({
      scripts: {
        'disabled.player': ctx => ({
          setup() {
            events.push(`setup:${ctx.isEnabled()}:${ctx.getPriority()}`);
            ctx.onSignal('disabled:signal', () => events.push('ctx-signal'));
            ctx.onEvent(target, 'damage', () => events.push('ctx-event'));
            ctx.setInterval(() => events.push('timer'), 5);
          },
          ready: () => events.push('ready'),
          enable: () => events.push('enable'),
          disable: () => events.push('disable'),
          enabledChanged: (enabled, previousEnabled) => events.push(`enabledChanged:${previousEnabled}->${enabled}`),
          process: () => events.push('process'),
          input: event => events.push(`input:${event.action}`),
          onSignal: name => events.push(`signal:${name}`),
          pause: () => events.push('pause'),
          resume: () => events.push('resume'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    try {
      system.attach(component);
      system.update({ deltaTime: 16 } as any);
      system.dispatchInput({ action: 'probe', phase: 'press' }, component);
      system.dispatchSignal('direct', undefined, component);
      system.emitSignal('disabled:signal');
      target.emit('damage');
      jest.advanceTimersByTime(5);
      system.onPause();
      system.onResume();

      expect(events).toEqual(['setup:false:0', 'ready', 'disable', 'pause', 'resume']);

      system.setEnabled(component, true);
      system.update({ deltaTime: 16 } as any);
      system.dispatchInput({ action: 'probe', phase: 'press' }, component);
      system.dispatchSignal('direct', undefined, component);
      system.emitSignal('disabled:signal');
      target.emit('damage');
      jest.advanceTimersByTime(5);

      expect(events).toEqual([
        'setup:false:0',
        'ready',
        'disable',
        'pause',
        'resume',
        'enabledChanged:false->true',
        'enable',
        'process',
        'input:probe',
        'signal:direct',
        'ctx-signal',
        'ctx-event',
        'timer',
      ]);

      system.setEnabled(component, false);
      system.update({ deltaTime: 16 } as any);
      system.dispatchInput({ action: 'probe', phase: 'press' }, component);
      system.emitSignal('disabled:signal');
      target.emit('damage');
      jest.advanceTimersByTime(5);

      expect(events).toEqual([
        'setup:false:0',
        'ready',
        'disable',
        'pause',
        'resume',
        'enabledChanged:false->true',
        'enable',
        'process',
        'input:probe',
        'signal:direct',
        'ctx-signal',
        'ctx-event',
        'timer',
        'enabledChanged:true->false',
        'disable',
      ]);
    } finally {
      system.detach(component);
      jest.useRealTimers();
    }
  });

  it('orders active behavior phases by priority and preserves attach order for ties', () => {
    const events: string[] = [];
    const late = createComponent({ scriptId: 'priority.late', priority: 10 }, 'Late');
    const earlyA = createComponent({ scriptId: 'priority.earlyA', priority: -5 }, 'EarlyA');
    const earlyB = createComponent({ scriptId: 'priority.earlyB', priority: -5 }, 'EarlyB');
    const system = new BehaviorScriptSystem({
      scripts: {
        'priority.late': () => ({
          process: () => events.push('late-process'),
          input: event => {
            events.push(`late-input:${event.handled ? 'handled' : 'open'}`);
          },
        }),
        'priority.earlyA': () => ({
          process: () => events.push('earlyA-process'),
          input: event => {
            events.push('earlyA-input');
            event.handled = true;
          },
        }),
        'priority.earlyB': () => ({
          process: () => events.push('earlyB-process'),
          input: () => events.push('earlyB-input'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(late);
    system.attach(earlyA);
    system.attach(earlyB);
    system.update({ deltaTime: 16 } as any);
    system.dispatchInput({ action: 'probe', phase: 'press' });

    expect(system.getBoundScripts()).toEqual([earlyA, earlyB, late]);
    expect(events).toEqual(['earlyA-process', 'earlyB-process', 'late-process', 'earlyA-input']);
  });

  it('skips non-editable scripts in edit mode and attaches them when play mode starts', () => {
    const events: string[] = [];
    const skipped = createComponent({ scriptId: 'skipped' }, 'Skipped');
    const editable = createComponent({ scriptId: 'editable', executeInEditMode: true }, 'Editable');
    const system = new BehaviorScriptSystem({
      runMode: 'edit',
      scripts: {
        skipped: () => ({
          ready: () => events.push('skipped-ready'),
          process: () => events.push('skipped-process'),
          input: event => events.push(`skipped-input:${event.action}`),
        }),
        editable: () => ({
          ready: () => events.push('editable-ready'),
          process: () => events.push('editable-process'),
          input: event => events.push(`editable-input:${event.action}`),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(skipped);
    system.attach(editable);
    system.update({ deltaTime: 16 } as any);
    system.dispatchInput({ action: 'probe', phase: 'press' });

    expect(system.getRunMode()).toBe('edit');
    expect(system.getBoundScripts()).toEqual([editable]);
    expect(events).toEqual(['editable-ready', 'editable-process', 'editable-input:probe']);

    system.setRunMode('play');
    system.update({ deltaTime: 16 } as any);
    system.dispatchInput({ action: 'play', phase: 'press' });

    expect(system.getRunMode()).toBe('play');
    expect(system.getBoundScripts()).toEqual([editable, skipped]);
    expect(events).toEqual([
      'editable-ready',
      'editable-process',
      'editable-input:probe',
      'skipped-ready',
      'editable-process',
      'skipped-process',
      'editable-input:play',
      'skipped-input:play',
    ]);
  });

  it('reacts when executeInEditMode changes while the system is in edit mode', () => {
    const events: string[] = [];
    const component = createComponent({ scriptId: 'toggle.edit', executeInEditMode: false });
    const system = new BehaviorScriptSystem({
      runMode: 'edit',
      scripts: {
        'toggle.edit': () => ({
          ready: () => events.push('ready'),
          exitTree: () => events.push('exit'),
          destroy: () => events.push('destroy'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.componentChanged({
      component,
      componentName: 'BehaviorScript',
      type: OBSERVER_TYPE.ADD,
    });
    component.executeInEditMode = true;
    system.componentChanged({
      component,
      componentName: 'BehaviorScript',
      prop: { prop: ['executeInEditMode'], deep: false },
      type: OBSERVER_TYPE.CHANGE,
    });
    component.executeInEditMode = false;
    system.componentChanged({
      component,
      componentName: 'BehaviorScript',
      prop: { prop: ['executeInEditMode'], deep: false },
      type: OBSERVER_TYPE.CHANGE,
    });

    expect(events).toEqual(['ready', 'exit', 'destroy']);
    expect(system.getBoundScripts()).toEqual([]);
  });

  it('dispatches input before unhandled input and respects handled flag', () => {
    const order: string[] = [];
    const first = createComponent({ scriptId: 'first' }, 'First');
    const second = createComponent({ scriptId: 'second' }, 'Second');
    const system = new BehaviorScriptSystem({
      scripts: {
        first: () => ({
          input: event => {
            order.push(`first:${event.action}`);
            event.handled = true;
          },
          unhandledInput: () => order.push('first-unhandled'),
        }),
        second: () => ({
          input: () => order.push('second-input'),
          unhandledInput: () => order.push('second-unhandled'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(first);
    system.attach(second);

    system.dispatchInput({ action: 'jump', phase: 'press' });

    expect(order).toEqual(['first:jump']);
  });

  it('routes manifest input actions from InputAction signals into input and unhandledInput once', () => {
    const order: string[] = [];
    const first = createComponent({ scriptId: 'input.first' }, 'First');
    const second = createComponent({ scriptId: 'input.second' }, 'Second');
    const firstFactory = defineBehaviorScript({
      manifest: {
        scriptId: 'input.first',
        inputs: [{ action: 'jump', phases: ['press'] }],
      },
      factory: () => ({
        input: event => order.push(`first-input:${event.action}:${event.phase}:${event.source}`),
        unhandledInput: event => {
          order.push(`first-unhandled:${event.action}`);
          event.handled = true;
        },
      }),
    });
    const secondFactory = defineBehaviorScript({
      manifest: {
        scriptId: 'input.second',
        inputs: [{ action: 'jump', phases: ['press'] }],
      },
      factory: () => ({
        input: event => order.push(`second-input:${event.action}:${event.phase}`),
        unhandledInput: event => order.push(`second-unhandled:${event.action}`),
      }),
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'input.first': firstFactory,
        'input.second': secondFactory,
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(first);
    system.attach(second);

    getSignalBus().emit('input:jump:press', { action: 'jump' });
    getSignalBus().emit('input:jump:release', { action: 'jump' });
    system.detach(first);
    system.detach(second);
    getSignalBus().emit('input:jump:press', { action: 'jump' });

    expect(order).toEqual([
      'first-input:jump:press:input:jump:press',
      'second-input:jump:press',
      'first-unhandled:jump',
    ]);
  });

  it('uses press release and hold as default manifest input phases', () => {
    const phases: Array<string | undefined> = [];
    const component = createComponent({ scriptId: 'input.defaults' });
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'input.defaults',
        inputs: [{ action: 'move' }],
      },
      factory: () => ({
        input: event => phases.push(event.phase),
      }),
    });
    const system = new BehaviorScriptSystem({ scripts: { 'input.defaults': factory } });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    getSignalBus().emit('input:move:press', { action: 'move' });
    getSignalBus().emit('input:move:hold', { action: 'move' });
    getSignalBus().emit('input:move:release', { action: 'move' });
    getSignalBus().emit('input:move:cancel', { action: 'move' });

    expect(phases).toEqual(['press', 'hold', 'release']);
  });

  it('offers managed signal subscriptions and cleans them on detach', () => {
    const payloads: any[] = [];
    const component = createComponent({ scriptId: 'score' });
    const system = new BehaviorScriptSystem({
      scripts: {
        score: ctx => ({
          setup: () => {
            ctx.onSignal('score:add', payload => payloads.push(payload));
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitSignal('score:add', { value: 5 });
    system.detach(component);
    system.emitSignal('score:add', { value: 10 });

    expect(payloads).toEqual([{ value: 5 }]);
  });

  it('routes manifest listen signals from the global bus into onSignal and cleans them on detach', () => {
    const payloads: any[] = [];
    const component = createComponent({ scriptId: 'score.listener' });
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'score.listener',
        signals: [
          { name: 'score:add', direction: 'listen' },
          { name: 'score:add', direction: 'listen' },
          { name: 'score:changed', direction: 'both' },
          { name: 'score:outbound', direction: 'emit' },
        ],
      },
      factory: () => ({
        onSignal: (name, payload) => payloads.push({ name, payload }),
      }),
    });
    const system = new BehaviorScriptSystem({ scripts: { 'score.listener': factory } });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitSignal('score:add', { value: 5 });
    getSignalBus().emit('score:changed', { value: 6 });
    getSignalBus().emit('score:outbound', { value: 7 });
    system.detach(component);
    getSignalBus().emit('score:add', { value: 10 });

    expect(payloads).toEqual([
      { name: 'score:add', payload: { value: 5 } },
      { name: 'score:changed', payload: { value: 6 } },
    ]);
  });

  it('keeps dispatchSignal as an explicit direct onSignal dispatch without requiring manifest listeners', () => {
    const payloads: any[] = [];
    const component = createComponent({ scriptId: 'direct.signal' });
    const system = new BehaviorScriptSystem({
      scripts: {
        'direct.signal': () => ({
          onSignal: (name, payload) => payloads.push({ name, payload }),
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitSignal('score:add', { value: 5 });
    system.dispatchSignal('score:add', { value: 6 });

    expect(payloads).toEqual([{ name: 'score:add', payload: { value: 6 } }]);
  });

  it('captures managed signal listener errors as signal diagnostics', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const component = createComponent({
      scriptId: 'signal.bad',
      source: { uri: 'scripts/signal-bad.ts', line: 6, column: 2 },
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'signal.bad': ctx => ({
          setup: () => {
            ctx.onSignal('score:add', () => {
              throw new Error('signal exploded');
            });
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitSignal('score:add', { value: 5 });

    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'signal.bad',
      phase: 'signal',
      message: 'signal exploded',
      source: { uri: 'scripts/signal-bad.ts', line: 6, column: 2 },
    });
    expect(error).toHaveBeenCalled();
  });

  it('offers managed local event subscriptions and cleans them on detach', () => {
    const payloads: any[] = [];
    const component = createComponent({ scriptId: 'evented' });
    const system = new BehaviorScriptSystem({
      scripts: {
        evented: ctx => ({
          setup: () => {
            ctx.onEvent(ctx.component, 'damage', payload => payloads.push(payload));
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitEvent(component, 'damage', { hp: -1 });
    system.detach(component);
    system.emitEvent(component, 'damage', { hp: -2 });

    expect(payloads).toEqual([{ hp: -1 }]);
  });

  it('routes manifest listen events into onEvent across component gameObject and named targets', () => {
    const payloads: any[] = [];
    const component = createComponent({ scriptId: 'manifest.events' });
    const gameObject = createEventTarget('GameObject');
    const hud = createEventTarget('Hud');
    component.gameObject = gameObject as any;
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'manifest.events',
        events: [
          { name: 'damage', target: 'self', direction: 'listen' },
          { name: 'damage', target: 'self', direction: 'listen' },
          { name: 'damage', target: 'gameObject', direction: 'listen' },
          { name: 'damage', target: 'hud', direction: 'both' },
          { name: 'emit-only', target: 'self', direction: 'emit' },
        ],
      },
      factory: () => ({
        onEvent: (name, payload, target) => {
          const targetName = target === component ? 'component' : (target as any).name;
          payloads.push({ name, payload, target: targetName });
        },
      }),
    });
    const system = new BehaviorScriptSystem({
      eventTargets: { hud },
      scripts: { 'manifest.events': factory },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitEvent(component, 'damage', { hp: -1 });
    system.emitEvent(gameObject, 'damage', { hp: -2 });
    system.emitEvent(hud, 'damage', { hp: -3 });
    system.emitEvent(component, 'emit-only', { ignored: true });
    system.detach(component);
    system.emitEvent(component, 'damage', { hp: -4 });

    expect(factory.manifest?.events?.map(event => `${event.target}:${event.name}`)).toEqual([
      'self:damage',
      'gameObject:damage',
      'hud:damage',
      'self:emit-only',
    ]);
    expect(payloads).toEqual([
      { name: 'damage', payload: { hp: -1 }, target: 'component' },
      { name: 'damage', payload: { hp: -2 }, target: 'GameObject' },
      { name: 'damage', payload: { hp: -3 }, target: 'Hud' },
    ]);
  });

  it('captures manifest event listener errors as event diagnostics', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const component = createComponent({
      scriptId: 'manifest.event.bad',
      source: { uri: 'scripts/manifest-event-bad.ts', line: 14, column: 5 },
    });
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'manifest.event.bad',
        events: [{ name: 'boom', target: 'self', direction: 'listen' }],
      },
      factory: () => ({
        onEvent: () => {
          throw new Error('manifest event exploded');
        },
      }),
    });
    const system = new BehaviorScriptSystem({ scripts: { 'manifest.event.bad': factory } });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitEvent(component, 'boom', { value: true });

    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'manifest.event.bad',
      phase: 'event',
      message: 'manifest event exploded',
      source: { uri: 'scripts/manifest-event-bad.ts', line: 14, column: 5 },
    });
    expect(error).toHaveBeenCalled();
  });

  it('captures local event listener errors as event diagnostics', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const component = createComponent({
      scriptId: 'event.bad',
      source: { uri: 'scripts/event-bad.ts', line: 12, column: 1 },
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'event.bad': ctx => ({
          setup: () => {
            ctx.onEvent(ctx.component, 'boom', () => {
              throw new Error('event exploded');
            });
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.emitEvent(component, 'boom', { value: true });

    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'event.bad',
      phase: 'event',
      message: 'event exploded',
      source: { uri: 'scripts/event-bad.ts', line: 12, column: 1 },
    });
    expect(error).toHaveBeenCalled();
  });

  it('manages custom disposers and timers on detach', () => {
    jest.useFakeTimers();
    const events: string[] = [];
    const component = createComponent({ scriptId: 'cleanup.managed' });
    const system = new BehaviorScriptSystem({
      scripts: {
        'cleanup.managed': ctx => ({
          setup: () => {
            const manual = ctx.addDisposer(() => events.push('manual-cleanup'));
            manual.dispose();
            ctx.addDisposer({ dispose: () => events.push('dispose-cleanup') });
            ctx.addDisposer({ destroy: () => events.push('destroy-cleanup') });
            ctx.setTimeout(() => events.push('timeout'), 10);
            ctx.setInterval(() => events.push('interval'), 5);
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    try {
      system.attach(component);
      jest.advanceTimersByTime(12);
      system.detach(component);
      jest.advanceTimersByTime(20);

      expect(events.filter(event => event === 'manual-cleanup')).toHaveLength(1);
      expect(events.filter(event => event === 'timeout')).toHaveLength(1);
      expect(events.filter(event => event === 'interval')).toHaveLength(2);
      expect(events.filter(event => event === 'dispose-cleanup')).toHaveLength(1);
      expect(events.filter(event => event === 'destroy-cleanup')).toHaveLength(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('captures managed timer and cleanup errors as diagnostics', () => {
    jest.useFakeTimers();
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const component = createComponent({
      scriptId: 'cleanup.bad',
      source: { uri: 'scripts/cleanup-bad.ts', line: 3, column: 1 },
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'cleanup.bad': ctx => ({
          setup: () => {
            ctx.setTimeout(() => {
              throw new Error('timer exploded');
            }, 1);
            ctx.addDisposer(() => {
              throw new Error('cleanup exploded');
            });
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    try {
      system.attach(component);
      jest.advanceTimersByTime(1);
      system.detach(component, { keepDiagnostics: true });

      expect(component.diagnostics.map(diagnostic => [diagnostic.phase, diagnostic.message])).toEqual([
        ['timer', 'timer exploded'],
        ['cleanup', 'cleanup exploded'],
      ]);
      expect(error).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('captures diagnostics with script id, phase, source, and game object', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const diagnostics: string[] = [];
    const component = createComponent({
      scriptId: 'bad',
      source: { uri: 'scripts/bad.ts', line: 9, column: 3 },
    });
    const system = new BehaviorScriptSystem({
      onDiagnostic: diagnostic => diagnostics.push(`${diagnostic.scriptId}:${diagnostic.phase}`),
      scripts: {
        bad: () => ({
          ready: () => {
            throw new Error('ready exploded');
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(component);

    expect(diagnostics).toEqual(['bad:ready']);
    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'bad',
      phase: 'ready',
      message: 'ready exploded',
      gameObjectName: 'Player',
      source: { uri: 'scripts/bad.ts', line: 9, column: 3 },
    });
    expect(error).toHaveBeenCalled();
  });

  it('enriches diagnostics with stack-derived location and source code frames', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const sourceContent = ['export function ready() {', '  setupPlayer();', '  explodeHere();', '}'].join('\n');
    const component = createComponent({
      scriptId: 'generated.bad',
      source: { uri: 'ai/generated-player.ts', content: sourceContent },
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'generated.bad': () => ({
          ready: () => {
            const generatedError = new Error('generated boom');
            generatedError.stack = 'Error: generated boom\n    at ready (ai/generated-player.ts:3:3)';
            throw generatedError;
          },
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.attach(component);

    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'generated.bad',
      phase: 'ready',
      message: 'generated boom',
      source: { uri: 'ai/generated-player.ts', line: 3, column: 3 },
    });
    expect(component.diagnostics[0].codeFrame).toBe(
      ['  2 |   setupPlayer();', '> 3 |   explodeHere();', '    |   ^', '  4 | }'].join('\n'),
    );
    expect(error).toHaveBeenCalled();
  });

  it('parses behavior script stack locations and creates standalone code frames', () => {
    expect(
      parseBehaviorScriptStackLocation(
        ['Error: bad', '    at unrelated (dist/bundle.js:1:1)', '    at process (scripts/player.ts:8:5)'].join('\n'),
        'scripts/player.ts',
      ),
    ).toEqual({ uri: 'scripts/player.ts', line: 8, column: 5 });
    expect(
      createBehaviorScriptCodeFrame({
        uri: 'scripts/player.ts',
        line: 2,
        column: 7,
        content: ['line one', 'line two', 'line three'].join('\n'),
      }),
    ).toBe(['  1 | line one', '> 2 | line two', '    |       ^', '  3 | line three'].join('\n'));
  });

  it('hot reloads a script factory and restores serialized state', () => {
    const events: string[] = [];
    const component = createComponent({ scriptId: 'player', hotReload: { keepState: true } });
    const restored = jest.fn();
    const system = new BehaviorScriptSystem({
      scripts: {
        player: () => ({
          ready: () => events.push('v1-ready'),
          serializeState: () => ({ hp: 7 }),
          exitTree: () => events.push('v1-exit'),
          destroy: () => events.push('v1-destroy'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.reloadScript('player', () => ({
      restoreState: restored,
      ready: () => events.push('v2-ready'),
    }));

    expect(restored).toHaveBeenCalledWith({ hp: 7 });
    expect(events).toEqual(['v1-ready', 'v1-exit', 'v1-destroy', 'v2-ready']);
    expect(component.script).toBeDefined();
  });

  it('rolls back hot reload when the new factory fails', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const events: string[] = [];
    const component = createComponent({ scriptId: 'safe.hot', hotReload: { keepState: true } });
    const system = new BehaviorScriptSystem({
      scripts: {
        'safe.hot': () => ({
          ready: () => events.push('v1-ready'),
          input: event => events.push(`v1-input:${event.action}`),
          serializeState: () => ({ hp: 7 }),
          restoreState: state => events.push(`v1-restore:${state.hp}`),
          exitTree: () => events.push('v1-exit'),
          destroy: () => events.push('v1-destroy'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    const failingFactory = () => {
      throw new Error('bad generated script');
    };
    system.reloadScript('safe.hot', failingFactory);
    system.dispatchInput({ action: 'probe', phase: 'press' }, component);

    expect(events).toEqual(['v1-ready', 'v1-exit', 'v1-destroy', 'v1-restore:7', 'v1-ready', 'v1-input:probe']);
    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'safe.hot',
      phase: 'factory',
      message: 'bad generated script',
    });
    expect(system.getFactory('safe.hot')).not.toBe(failingFactory);
    expect(error).toHaveBeenCalled();
  });

  it('rolls back hot reload when the new script fails during ready', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const events: string[] = [];
    const component = createComponent({ scriptId: 'safe.ready', hotReload: { keepState: true } });
    const system = new BehaviorScriptSystem({
      scripts: {
        'safe.ready': () => ({
          ready: () => events.push('v1-ready'),
          input: event => events.push(`v1-input:${event.action}`),
          serializeState: () => ({ hp: 11 }),
          restoreState: state => events.push(`v1-restore:${state.hp}`),
          exitTree: () => events.push('v1-exit'),
          destroy: () => events.push('v1-destroy'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.reloadScript('safe.ready', () => ({
      ready: () => {
        throw new Error('ready failed');
      },
      exitTree: () => events.push('v2-exit'),
      destroy: () => events.push('v2-destroy'),
    }));
    system.dispatchInput({ action: 'probe', phase: 'press' }, component);

    expect(events).toEqual([
      'v1-ready',
      'v1-exit',
      'v1-destroy',
      'v2-exit',
      'v2-destroy',
      'v1-restore:11',
      'v1-ready',
      'v1-input:probe',
    ]);
    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'safe.ready',
      phase: 'ready',
      message: 'ready failed',
    });
    expect(error).toHaveBeenCalled();
  });

  it('allows hot reload rollback to be disabled explicitly', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const events: string[] = [];
    const component = createComponent({ scriptId: 'unsafe.hot', hotReload: { keepState: true } });
    const system = new BehaviorScriptSystem({
      scripts: {
        'unsafe.hot': () => ({
          ready: () => events.push('v1-ready'),
          input: event => events.push(`v1-input:${event.action}`),
          serializeState: () => ({ hp: 3 }),
          exitTree: () => events.push('v1-exit'),
          destroy: () => events.push('v1-destroy'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.reloadScript(
      'unsafe.hot',
      () => {
        throw new Error('no rollback');
      },
      { rollbackOnError: false },
    );
    system.dispatchInput({ action: 'probe', phase: 'press' }, component);

    expect(events).toEqual(['v1-ready', 'v1-exit', 'v1-destroy']);
    expect(system.getBoundScripts()).toEqual([]);
    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'unsafe.hot',
      phase: 'factory',
      message: 'no rollback',
    });
    expect(error).toHaveBeenCalled();
  });

  it('respects component hotReload.enabled and only force reloads when requested', () => {
    const events: string[] = [];
    const component = createComponent({
      scriptId: 'manual.hot',
      hotReload: { enabled: false, keepState: true },
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'manual.hot': () => ({
          ready: () => events.push('v1-ready'),
          input: event => events.push(`v1-input:${event.action}`),
          serializeState: () => ({ value: 9 }),
          exitTree: () => events.push('v1-exit'),
          destroy: () => events.push('v1-destroy'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    system.reloadScript('manual.hot', () => ({
      ready: () => events.push('v2-ready'),
      input: event => events.push(`v2-input:${event.action}`),
    }));
    system.dispatchInput({ action: 'probe', phase: 'press' }, component);

    system.reloadScript(
      'manual.hot',
      () => ({
        restoreState: state => events.push(`v3-restore:${state.value}`),
        ready: () => events.push('v3-ready'),
      }),
      { force: true },
    );

    expect(events).toEqual(['v1-ready', 'v1-input:probe', 'v1-exit', 'v1-destroy', 'v3-restore:9', 'v3-ready']);
  });

  it('binds, updates, and unbinds through Eva component observer changes', () => {
    const events: string[] = [];
    const component = createComponent({ scriptId: 'observer', props: { speed: 1 } });
    const system = new BehaviorScriptSystem({
      scripts: {
        observer: () => ({
          ready: () => events.push('ready'),
          process: () => events.push('process'),
          propsChanged: props => events.push(`props:${props.speed}`),
          exitTree: () => events.push('exit'),
          destroy: () => events.push('destroy'),
        }),
      },
    });
    system.init(system.__systemDefaultParams);

    system.componentObserver.add({
      component,
      componentName: 'BehaviorScript',
      type: OBSERVER_TYPE.ADD,
    });
    system.update({ deltaTime: 16 } as any);

    component.props = { speed: 2 };
    system.componentObserver.add({
      component,
      componentName: 'BehaviorScript',
      prop: { prop: ['props'], deep: true },
      type: OBSERVER_TYPE.CHANGE,
    });
    system.update({ deltaTime: 16 } as any);

    system.componentObserver.add({
      component,
      componentName: 'BehaviorScript',
      type: OBSERVER_TYPE.REMOVE,
    });
    system.update({ deltaTime: 16 } as any);

    expect(events).toEqual(['ready', 'process', 'props:2', 'process', 'exit', 'destroy']);
  });

  it('exposes an Eva plugin struct for renderer registration', () => {
    const moduleFactory = defineBehaviorScript({
      manifest: {
        scriptId: 'extension.module',
        category: 'demo',
      },
      factory: () => ({}),
    });
    const extension = createBehaviorScriptExtension({
      scripts: {
        noop: () => ({}),
      },
      scriptModules: [
        {
          uri: 'extension/module.ts',
          exports: { moduleFactory },
        },
      ],
    });

    expect(extension.Components).toContain(BehaviorScript);
    expect(extension.Systems?.length).toBe(1);
    expect(extension.createSystem().hasScript('noop')).toBe(false);

    const system = extension.createSystem();
    system.init(system.__systemDefaultParams);
    expect(system.hasScript('noop')).toBe(true);
    expect(system.hasScript('extension.module')).toBe(true);
    expect(system.getCatalog().scripts.map(script => script.scriptId)).toEqual(['noop', 'extension.module']);
  });

  it('defines manifest-backed scripts for editor and AI type hints', () => {
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'typed.player',
        displayName: 'Typed Player',
        props: [
          { name: 'speed', type: 'number', default: 120, min: 0, step: 10 },
          { name: 'speed', type: 'number', default: 240 },
          { name: 'mode', type: 'enum', enum: [{ value: 'walk' }, { value: 'run' }] },
        ],
        inputs: [
          { action: 'jump', phases: ['press'] },
          { action: 'jump', phases: ['hold'] },
        ],
        signals: [
          { name: 'player:jump', direction: 'emit' },
          { name: 'player:jump', direction: 'emit' },
        ],
        events: [
          { name: 'damage', target: 'self', direction: 'listen' },
          { name: 'damage', target: 'self', direction: 'listen' },
        ],
        groups: [{ name: 'player', description: 'Player-controlled scripts.' }, { name: 'player' }],
        nodes: [
          { name: 'weapon', path: 'Weapon', required: true },
          { name: 'weapon', path: 'OtherWeapon' },
        ],
        resources: [
          { name: 'avatar', resource: 'playerAvatar', type: 'IMAGE', required: true },
          { name: 'avatar', resource: 'otherAvatar' },
        ],
        tags: ['ai-safe', 'ai-safe'],
      },
      factory: () => ({}),
    });

    const manifest = getBehaviorScriptManifest(factory);
    expect(manifest?.scriptId).toBe('typed.player');
    expect(manifest?.props?.map(prop => prop.name)).toEqual(['speed', 'mode']);
    expect(manifest?.inputs?.map(input => input.action)).toEqual(['jump']);
    expect(manifest?.signals?.map(signal => signal.name)).toEqual(['player:jump']);
    expect(manifest?.events?.map(event => event.name)).toEqual(['damage']);
    expect(manifest?.groups?.map(group => group.name)).toEqual(['player']);
    expect(manifest?.nodes?.map(node => [node.name, node.path, node.required])).toEqual([['weapon', 'Weapon', true]]);
    expect(manifest?.resources?.map(resource => [resource.name, resource.resource, resource.required])).toEqual([
      ['avatar', 'playerAvatar', true],
    ]);
    expect(manifest?.lifecycle?.some(item => item.phase === 'physicsProcess')).toBe(true);
    expect(manifest?.tags).toEqual(['ai-safe']);
  });

  it('reports manifest issues before registration', () => {
    expect(
      validateBehaviorScriptManifest({
        scriptId: '',
        props: [{ name: 'mode', type: 'enum' }],
        inputs: [{ action: '' }],
        signals: [{ name: '', direction: 'emit' }],
        events: [{ name: '', direction: 'listen' }],
        groups: [{ name: '' }],
        nodes: [{ name: '' }],
        resources: [{ name: '' }],
      }),
    ).toEqual([
      { path: 'scriptId', message: 'scriptId is required' },
      { path: 'props.0.enum', message: 'enum property "mode" needs options' },
      { path: 'inputs.0.action', message: 'input action is required' },
      { path: 'signals.0.name', message: 'signal name is required' },
      { path: 'events.0.name', message: 'event name is required' },
      { path: 'groups.0.name', message: 'group name is required' },
      { path: 'nodes.0.name', message: 'node reference name is required' },
      { path: 'resources.0.name', message: 'resource reference name is required' },
    ]);

    expect(() =>
      defineBehaviorScript({
        manifest: { scriptId: '', props: [{ name: 'mode', type: 'enum' }] },
        factory: () => ({}),
      }),
    ).toThrow('Invalid BehaviorScript manifest');
  });

  it('exposes generic BehaviorScript inspector metadata for Editor component forms', () => {
    const metadata = BehaviorScript.getInspectorMetadata();

    expect(metadata).toMatchObject({
      name: 'BehaviorScript',
      type: 'object',
      label: 'Behavior Script',
      group: 'Logic',
      isFolder: true,
    });
    expect(metadata.children?.map(field => field.name)).toEqual([
      'scriptId',
      'props',
      'source',
      'hotReload',
      'enabled',
      'priority',
      'groups',
      'nodes',
      'resources',
      'pauseMode',
      'executeInEditMode',
    ]);
    expect(metadata.children?.find(field => field.name === 'props')).toMatchObject({
      type: 'json',
      inspector: 'json',
      group: 'Script Props',
    });
  });

  it('creates manifest-backed inspector metadata for typed script props', () => {
    const manifestFactory = defineBehaviorScript({
      manifest: {
        scriptId: 'inspector.player',
        displayName: 'Inspector Player',
        description: 'Editable player script.',
        source: { uri: 'scripts/inspector-player.ts', exportName: 'InspectorPlayer', line: 4, column: 2 },
        props: [
          { name: 'speed', type: 'number', label: 'Speed', default: 120, min: 0, max: 500, step: 10 },
          { name: 'color', type: 'color', default: '#5596ff' },
          {
            name: 'mode',
            type: 'enum',
            default: 'walk',
            enum: [
              { value: 'walk', label: 'Walk' },
              { value: 'run', label: 'Run' },
            ],
          },
          { name: 'sprite', type: 'asset', description: 'Sprite asset id.' },
        ],
        groups: [{ name: 'player' }, { name: 'controllable' }],
        nodes: [
          { name: 'weapon', path: 'Weapon', required: true },
          { name: 'target', path: '../Enemy' },
        ],
        resources: [
          { name: 'avatar', resource: 'playerAvatar', type: 'IMAGE', required: true },
          { name: 'jumpSfx', resource: 'playerJump', type: 'AUDIO' },
        ],
      },
      factory: () => ({}),
    });

    const metadata = createBehaviorScriptInspectorMetadata(manifestFactory.manifest);
    const props = metadata.children?.find(field => field.name === 'props');

    expect(metadata).toMatchObject({
      name: 'BehaviorScript',
      label: 'Inspector Player',
      description: 'Editable player script.',
    });
    expect(metadata.children?.find(field => field.name === 'scriptId')).toMatchObject({
      default: 'inspector.player',
      readonly: true,
    });
    expect(metadata.children?.find(field => field.name === 'groups')).toMatchObject({
      type: 'string[]',
      default: ['player', 'controllable'],
    });
    expect(metadata.children?.find(field => field.name === 'nodes')).toMatchObject({
      type: 'json',
      default: { weapon: 'Weapon', target: '../Enemy' },
    });
    expect(metadata.children?.find(field => field.name === 'resources')).toMatchObject({
      type: 'json',
      default: { avatar: 'playerAvatar', jumpSfx: 'playerJump' },
    });
    expect(
      metadata.children?.find(field => field.name === 'source')?.children?.map(field => [field.name, field.default]),
    ).toEqual([
      ['uri', 'scripts/inspector-player.ts'],
      ['exportName', 'InspectorPlayer'],
      ['line', 4],
      ['column', 2],
    ]);
    expect(props).toMatchObject({
      type: 'object',
      isFolder: true,
      children: [
        { name: 'speed', type: 'number', label: 'Speed', default: 120, min: 0, max: 500, step: 10 },
        { name: 'color', type: 'color', default: '#5596ff' },
        { name: 'mode', type: 'enum', inspector: 'enum', default: 'walk', options: ['walk', 'run'] },
        { name: 'sprite', type: 'asset', inspector: 'asset', assetType: 'any' },
      ],
    });
  });

  it('maps behavior value hints to inspector control types', () => {
    expect(behaviorValueTypeToInspectorType('number')).toBe('number');
    expect(behaviorValueTypeToInspectorType('string')).toBe('string');
    expect(behaviorValueTypeToInspectorType('boolean')).toBe('boolean');
    expect(behaviorValueTypeToInspectorType('color')).toBe('color');
    expect(behaviorValueTypeToInspectorType('asset')).toBe('asset');
    expect(behaviorValueTypeToInspectorType('enum')).toBe('enum');
    expect(behaviorValueTypeToInspectorType('vec2')).toBe('json');
    expect(behaviorValueTypeToInspectorType('object')).toBe('json');
    expect(behaviorValueTypeToInspectorType('array')).toBe('json');
  });

  it('creates manifest-backed type hints for completions and declarations', () => {
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'hints.player-controller',
        displayName: 'Hints Player',
        props: [
          { name: 'speed', type: 'number', required: true, description: 'Horizontal speed.' },
          { name: 'move-mode', type: 'enum', enum: [{ value: 'walk' }, { value: 'run' }] },
          { name: 'origin', type: 'vec2' },
        ],
        inputs: [{ action: 'jump', phases: ['press'] }],
        signals: [
          { name: 'player:jump', direction: 'emit' },
          { name: 'player:buff', direction: 'listen' },
        ],
        events: [{ name: 'damage', target: 'self', direction: 'listen' }],
        groups: [{ name: 'player' }, { name: 'controllable' }],
        nodes: [
          { name: 'weapon', path: 'Weapon', required: true, description: 'Equipped weapon node.' },
          { name: 'targets', path: 'Enemy', multiple: true },
        ],
        resources: [
          { name: 'avatar', resource: 'playerAvatar', type: 'IMAGE', required: true, description: 'Avatar texture.' },
          { name: 'jumpSfx', resource: 'playerJump', type: 'AUDIO' },
        ],
      },
      factory: () => ({}),
    });

    const hints = createBehaviorScriptTypeHints(factory.manifest);

    expect(hints.propsTypeName).toBe('HintsPlayerProps');
    expect(hints.scriptTypeName).toBe('HintsPlayerScript');
    expect(hints.declarations).toContain('import type { EvaBehaviorScript }');
    expect(hints.declarations).toContain('speed: number;');
    expect(hints.declarations).toContain("'move-mode'?: 'walk' | 'run';");
    expect(hints.declarations).toContain('origin?: [number, number];');
    expect(hints.declarations).toContain("export type HintsPlayerScriptInputAction = 'jump';");
    expect(hints.declarations).toContain("export type HintsPlayerScriptSignalName = 'player:jump' | 'player:buff';");
    expect(hints.declarations).toContain("export type HintsPlayerScriptEventName = 'damage';");
    expect(hints.declarations).toContain("export type HintsPlayerScriptGroupName = 'player' | 'controllable';");
    expect(hints.declarations).toContain("export type HintsPlayerScriptNodeName = 'weapon' | 'targets';");
    expect(hints.declarations).toContain("export type HintsPlayerScriptResourceName = 'avatar' | 'jumpSfx';");
    expect(hints.completions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'prop',
          label: 'ctx.props.speed',
          detail: 'number',
          documentation: 'Horizontal speed.',
        }),
        expect.objectContaining({
          kind: 'input',
          label: 'input:jump:press',
          insertText: "event.action === 'jump' && event.phase === 'press'",
        }),
        expect.objectContaining({
          kind: 'signal',
          label: 'player:jump',
          insertText: "ctx.emitSignal('player:jump', payload)",
        }),
        expect.objectContaining({
          kind: 'signal',
          label: 'player:buff',
          insertText: "onSignal('player:buff', payload)",
        }),
        expect.objectContaining({
          kind: 'event',
          label: 'self:damage',
          insertText: "onEvent('damage', payload, target)",
        }),
        expect.objectContaining({
          kind: 'group',
          label: 'group:player',
          insertText: "ctx.callGroup('player', '$0')",
        }),
        expect.objectContaining({
          kind: 'node',
          label: 'node:weapon',
          insertText: "ctx.getRequiredNode('weapon')",
          detail: 'NodePath:Weapon',
          documentation: 'Equipped weapon node.',
        }),
        expect.objectContaining({
          kind: 'resource',
          label: 'resource:avatar',
          insertText: "ctx.loadRequiredResource('avatar')",
          detail: 'Resource:playerAvatar',
          documentation: 'Avatar texture.',
        }),
        expect.objectContaining({
          kind: 'lifecycle',
          label: 'process(frame)',
        }),
        expect.objectContaining({
          kind: 'lifecycle',
          label: 'enable()',
        }),
        expect.objectContaining({
          kind: 'lifecycle',
          label: 'disable()',
        }),
        expect.objectContaining({
          kind: 'lifecycle',
          label: 'enabledChanged(enabled, previousEnabled)',
        }),
      ]),
    );
  });

  it('maps behavior value hints to TypeScript types', () => {
    expect(behaviorValueTypeToTypescript('number')).toBe('number');
    expect(behaviorValueTypeToTypescript('color')).toBe('string');
    expect(behaviorValueTypeToTypescript('asset')).toBe('string');
    expect(behaviorValueTypeToTypescript('array')).toBe('any[]');
    expect(behaviorValueTypeToTypescript('object')).toBe('Record<string, any>');
    expect(behaviorValueTypeToTypescript('vec2')).toBe('[number, number]');
    expect(behaviorValueTypeToTypescript({ name: 'mode', type: 'enum', enum: [{ value: 'walk' }, { value: 2 }] })).toBe(
      "'walk' | 2",
    );
  });

  it('creates DSL-compatible BehaviorScript bindings with manifest defaults', () => {
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'binding.player',
        source: { uri: 'scripts/binding-player.ts', exportName: 'BindingPlayer' },
        props: [
          { name: 'speed', type: 'number', default: 120, min: 0, max: 500 },
          { name: 'mode', type: 'enum', default: 'walk', enum: [{ value: 'walk' }, { value: 'run' }] },
        ],
      },
      factory: () => ({}),
    });
    const registry = new BehaviorScriptRegistry();
    registry.registerScript('binding.player', factory, 'scripts/binding-player.ts');

    expect(
      createBehaviorScriptBinding({
        scriptId: 'binding.player',
        props: { speed: 240 },
        registry,
        hotReload: { enabled: true, keepState: true },
        enabled: false,
        priority: -10,
        groups: ['player', 'controllable', 'player'],
        nodes: { weapon: ' Weapon ', target: '../Enemy' },
        resources: { avatar: ' playerAvatar ', jumpSfx: 'playerJump' },
        pauseMode: 'process',
      }),
    ).toEqual({
      type: 'BehaviorScript',
      props: {
        scriptId: 'binding.player',
        props: { speed: 240, mode: 'walk' },
        source: { uri: 'scripts/binding-player.ts', exportName: 'BindingPlayer' },
        hotReload: { enabled: true, keepState: true },
        enabled: false,
        priority: -10,
        groups: ['player', 'controllable'],
        nodes: { weapon: 'Weapon', target: '../Enemy' },
        resources: { avatar: 'playerAvatar', jumpSfx: 'playerJump' },
        executeInEditMode: undefined,
        pauseMode: 'process',
      },
    });
  });

  it('validates DSL-compatible BehaviorScript bindings against registry and manifest props', () => {
    const registry = new BehaviorScriptRegistry();
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'binding.enemy',
        props: [
          { name: 'hp', type: 'number', required: true, min: 1, max: 9 },
          { name: 'variant', type: 'enum', enum: [{ value: 'small' }, { value: 'boss' }] },
          { name: 'enabled', type: 'boolean' },
        ],
      },
      factory: () => ({}),
    });
    registry.registerScript('binding.enemy', factory);

    expect(
      validateBehaviorScriptBinding(
        {
          type: 'BehaviorScript',
          props: {
            scriptId: 'binding.enemy',
            props: { hp: 0, variant: 'huge', enabled: 'yes' },
            groups: ['enemy', ''],
            nodes: { target: '' },
            resources: { avatar: '' },
          },
        },
        { registry },
      ),
    ).toEqual([
      { path: 'props.props.hp', message: 'BehaviorScript prop "hp" must be >= 1' },
      { path: 'props.props.variant', message: 'BehaviorScript prop "variant" must be one of small, boss' },
      { path: 'props.props.enabled', message: 'BehaviorScript prop "enabled" must be boolean' },
      { path: 'props.groups.1', message: 'BehaviorScript group must be a non-empty string' },
      { path: 'props.nodes.target', message: 'BehaviorScript node reference path must be a non-empty string' },
      { path: 'props.resources.avatar', message: 'BehaviorScript resource reference must be a non-empty string' },
    ]);

    expect(
      validateBehaviorScriptBinding(
        {
          scriptId: 'binding.enemy',
          props: { variant: 'small' },
        },
        { registry },
      ),
    ).toEqual([{ path: 'props.props.hp', message: 'BehaviorScript prop "hp" is required' }]);

    expect(validateBehaviorScriptBinding({ scriptId: 'missing.script' }, { registry })).toEqual([
      { path: 'props.scriptId', message: 'Unknown behavior script: missing.script' },
    ]);
  });

  it('creates an end-to-end behavior script workflow from module to binding and validation report', () => {
    const events: string[] = [];
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'workflow.player',
        props: [
          { name: 'speed', type: 'number', default: 100, min: 0 },
          { name: 'mode', type: 'enum', default: 'walk', enum: [{ value: 'walk' }, { value: 'run' }] },
        ],
        signals: [{ name: 'workflow:ready', direction: 'emit' }],
        groups: [{ name: 'player' }],
        nodes: [{ name: 'target', path: 'Enemy' }],
        resources: [{ name: 'avatar', resource: 'defaultAvatar', type: 'IMAGE' }],
      },
      factory: ctx => ({
        ready: () => ctx.emitSignal('workflow:ready', { speed: ctx.props.speed }),
        ping: (value: number) => events.push(`ping:${value}`),
      }),
    });

    const workflow = createBehaviorScriptWorkflow({
      scriptId: 'workflow.player',
      props: { speed: 200 },
      scriptModules: [{ uri: 'workflow/player.ts', exports: { factory } }],
      hotReload: { enabled: true, keepState: true },
      groups: ['player'],
      nodes: { target: 'Enemy' },
      resources: { avatar: 'workflowAvatar' },
      validate: {
        expectedSignals: ['workflow:ready'],
        steps: [{ type: 'update' }, { type: 'groupCall', group: 'player', method: 'ping', args: [3] }],
        assertions: [
          {
            name: 'group-call-ran',
            check: () => events.join('|') === 'ping:3',
          },
        ],
      },
    });

    expect(workflow.binding).toEqual({
      type: 'BehaviorScript',
      props: {
        scriptId: 'workflow.player',
        props: { speed: 200, mode: 'walk' },
        source: undefined,
        hotReload: { enabled: true, keepState: true },
        enabled: undefined,
        priority: undefined,
        groups: ['player'],
        nodes: { target: 'Enemy' },
        resources: { avatar: 'workflowAvatar' },
        executeInEditMode: undefined,
        pauseMode: undefined,
      },
    });
    expect(workflow.bindingIssues).toEqual([]);
    expect(workflow.catalog?.scripts.map(script => script.scriptId)).toEqual(['workflow.player']);
    expect(workflow.validationReport?.ok).toBe(true);
    expect(workflow.validationReport?.emittedSignals.map(signal => signal.name)).toEqual(['workflow:ready']);
    expect(workflow.validationReport?.steps).toEqual(['update', 'groupCall:player.ping']);
    expect(workflow.validationReport?.runtimeSnapshot?.scripts[0].groups).toEqual(['player']);
    expect(workflow.validationReport?.runtimeSnapshot?.scripts[0].nodes).toEqual([
      {
        name: 'target',
        path: 'Enemy',
        resolved: false,
        gameObjectName: undefined,
        required: undefined,
        multiple: undefined,
      },
    ]);
    expect(workflow.validationReport?.runtimeSnapshot?.scripts[0].resources).toEqual([
      {
        name: 'avatar',
        resource: 'workflowAvatar',
        available: false,
        loaded: undefined,
        type: 'IMAGE',
        required: undefined,
        preload: undefined,
      },
    ]);
  });

  it('surfaces binding issues in workflow before runtime validation is needed', () => {
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'workflow.bad',
        props: [{ name: 'hp', type: 'number', required: true, min: 1 }],
      },
      factory: () => ({}),
    });

    const workflow = createBehaviorScriptWorkflow({
      scriptId: 'workflow.bad',
      props: { hp: 0 },
      factory,
    });

    expect(workflow.bindingIssues).toEqual([
      { path: 'props.props.hp', message: 'BehaviorScript prop "hp" must be >= 1' },
    ]);
    expect(workflow.validationReport).toBeUndefined();
  });

  it('lets BehaviorScriptSystem expose registered manifests', () => {
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'typed.enemy',
        props: [{ name: 'hp', type: 'number', default: 3 }],
        signals: [{ name: 'enemy:defeated', direction: 'emit' }],
        events: [{ name: 'damage', target: 'self', direction: 'listen' }],
      },
      factory: () => ({}),
    });
    const system = new BehaviorScriptSystem({
      scripts: {
        'typed.enemy': factory,
      },
    });
    system.init(system.__systemDefaultParams);

    expect(system.getManifest('typed.enemy')?.props?.[0]).toMatchObject({ name: 'hp', type: 'number' });
    expect(system.getManifest('typed.enemy')?.events?.[0]).toMatchObject({ name: 'damage', target: 'self' });
    expect(system.getManifests().map(manifest => manifest.scriptId)).toEqual(['typed.enemy']);
  });

  it('registers manifest-backed script modules into a registry', () => {
    const registry = new BehaviorScriptRegistry();
    const namedFactory = defineBehaviorScript({
      manifest: {
        scriptId: 'module.named',
        props: [{ name: 'value', type: 'number', default: 1 }],
      },
      factory: () => ({}),
    });
    const definition = {
      manifest: {
        scriptId: 'module.definition',
        signals: [{ name: 'module:ready', direction: 'emit' as const }],
      },
      factory: () => ({}),
    };

    const result = registry.registerModule({
      uri: 'scripts/module.ts',
      exports: {
        namedFactory,
        definition,
        helper: 42,
      },
    });

    expect(result).toEqual({
      uri: 'scripts/module.ts',
      registered: ['module.named', 'module.definition'],
      skipped: ['helper'],
    });
    expect(registry.getScriptIds()).toEqual(['module.named', 'module.definition']);
    expect(registry.getSourceUri('module.named')).toBe('scripts/module.ts');
    expect(registry.getManifest('module.definition')?.signals?.[0]).toMatchObject({ name: 'module:ready' });
    expect(registry.getCatalog()).toEqual({
      scripts: [
        {
          scriptId: 'module.named',
          manifest: registry.getManifest('module.named'),
          sourceUri: 'scripts/module.ts',
        },
        {
          scriptId: 'module.definition',
          manifest: registry.getManifest('module.definition'),
          sourceUri: 'scripts/module.ts',
        },
      ],
    });
  });

  it('lets BehaviorScriptSystem register script modules directly from params', () => {
    const component = createComponent({ scriptId: 'params.module' });
    const events: string[] = [];
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'params.module',
        displayName: 'Params Module',
      },
      factory: () => ({
        ready: () => events.push('ready'),
      }),
    });
    const system = new BehaviorScriptSystem({
      scriptModules: [
        {
          uri: 'params/module.ts',
          exports: { factory },
        },
      ],
    });
    system.init(system.__systemDefaultParams);

    system.attach(component);

    expect(events).toEqual(['ready']);
    expect(system.getCatalog()).toEqual({
      scripts: [
        {
          scriptId: 'params.module',
          manifest: factory.manifest,
          sourceUri: 'params/module.ts',
        },
      ],
    });
  });

  it('lets BehaviorScriptSystem resolve scripts from an injected registry', () => {
    const registry = new BehaviorScriptRegistry();
    const events: string[] = [];
    registry.registerDefinition({
      manifest: {
        scriptId: 'registry.player',
        inputs: [{ action: 'fire', phases: ['press'] }],
      },
      factory: () => ({
        ready: () => events.push('ready'),
        input: event => events.push(`input:${event.action}`),
      }),
    });
    const component = createComponent({ scriptId: 'registry.player' });
    const system = new BehaviorScriptSystem({ registry });
    system.init(system.__systemDefaultParams);

    system.attach(component);
    system.dispatchInput({ action: 'fire', phase: 'press' }, component);
    system.onDestroy();

    expect(events).toEqual(['ready', 'input:fire']);
    expect(system.getScriptIds()).toEqual(['registry.player']);
    expect(registry.hasScript('registry.player')).toBe(true);
  });

  it('auto-reloads bound scripts when an injected registry replaces a factory', () => {
    const registry = new BehaviorScriptRegistry();
    const events: string[] = [];
    registry.registerDefinition({
      manifest: { scriptId: 'registry.hot' },
      factory: () => ({
        ready: () => events.push('v1-ready'),
        serializeState: () => ({ hp: 5 }),
        exitTree: () => events.push('v1-exit'),
        destroy: () => events.push('v1-destroy'),
      }),
    });
    const component = createComponent({ scriptId: 'registry.hot', hotReload: { keepState: true } });
    const system = new BehaviorScriptSystem({ registry });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    registry.registerDefinition({
      manifest: { scriptId: 'registry.hot' },
      factory: () => ({
        restoreState: state => events.push(`v2-restore:${state.hp}`),
        ready: () => events.push('v2-ready'),
      }),
    });

    expect(events).toEqual(['v1-ready', 'v1-exit', 'v1-destroy', 'v2-restore:5', 'v2-ready']);
  });

  it('rolls back registry-driven hot reload failures to the previous registered factory', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const registry = new BehaviorScriptRegistry();
    const events: string[] = [];
    registry.registerDefinition({
      manifest: { scriptId: 'registry.safe-hot' },
      factory: () => ({
        ready: () => events.push('v1-ready'),
        input: event => events.push(`v1-input:${event.action}`),
        serializeState: () => ({ hp: 5 }),
        restoreState: state => events.push(`v1-restore:${state.hp}`),
        exitTree: () => events.push('v1-exit'),
        destroy: () => events.push('v1-destroy'),
      }),
    });
    const component = createComponent({ scriptId: 'registry.safe-hot', hotReload: { keepState: true } });
    const system = new BehaviorScriptSystem({ registry });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    const badFactory = () => {
      throw new Error('registry reload failed');
    };
    registry.registerDefinition({
      manifest: { scriptId: 'registry.safe-hot' },
      factory: badFactory,
    });
    system.dispatchInput({ action: 'probe', phase: 'press' }, component);

    expect(events).toEqual(['v1-ready', 'v1-exit', 'v1-destroy', 'v1-restore:5', 'v1-ready', 'v1-input:probe']);
    expect(registry.getFactory('registry.safe-hot')).not.toBe(badFactory);
    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'registry.safe-hot',
      phase: 'factory',
      message: 'registry reload failed',
    });
    expect(error).toHaveBeenCalled();
  });

  it('does not auto-reload registry updates when component hot reload is disabled', () => {
    const registry = new BehaviorScriptRegistry();
    const events: string[] = [];
    registry.registerDefinition({
      manifest: { scriptId: 'registry.disabled-hot' },
      factory: () => ({
        ready: () => events.push('v1-ready'),
        input: event => events.push(`v1-input:${event.action}`),
        exitTree: () => events.push('v1-exit'),
        destroy: () => events.push('v1-destroy'),
      }),
    });
    const component = createComponent({
      scriptId: 'registry.disabled-hot',
      hotReload: { enabled: false },
    });
    const system = new BehaviorScriptSystem({ registry });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    registry.registerDefinition({
      manifest: { scriptId: 'registry.disabled-hot' },
      factory: () => ({
        ready: () => events.push('v2-ready'),
        input: event => events.push(`v2-input:${event.action}`),
      }),
    });
    system.dispatchInput({ action: 'probe', phase: 'press' }, component);

    expect(events).toEqual(['v1-ready', 'v1-input:probe']);
  });

  it('detaches bound scripts and reports diagnostics when a registry entry is removed', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const registry = new BehaviorScriptRegistry();
    registry.registerDefinition({
      manifest: { scriptId: 'registry.removed' },
      factory: () => ({}),
    });
    const component = createComponent({ scriptId: 'registry.removed' });
    const system = new BehaviorScriptSystem({ registry });
    system.init(system.__systemDefaultParams);
    system.attach(component);

    registry.unregisterScript('registry.removed');

    expect(component.script).toBeUndefined();
    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'registry.removed',
      phase: 'factory',
      message: 'Behavior script unregistered: registry.removed',
    });
    expect(error).toHaveBeenCalled();
  });

  it('uses registry source uri for diagnostics when component source is absent', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const registry = new BehaviorScriptRegistry();
    registry.registerDefinition(
      {
        manifest: { scriptId: 'registry.source' },
        factory: () => ({
          ready: () => {
            throw new Error('source failure');
          },
        }),
      },
      'scripts/source.ts',
    );
    const component = createComponent({ scriptId: 'registry.source' });
    const system = new BehaviorScriptSystem({ registry });
    system.init(system.__systemDefaultParams);

    system.attach(component);

    expect(component.diagnostics[0]).toMatchObject({
      scriptId: 'registry.source',
      phase: 'ready',
      source: { uri: 'scripts/source.ts' },
    });
    expect(error).toHaveBeenCalled();
  });

  it('validates AI-generated scripts with lifecycle, input, signal, fixed frame, and assertions', () => {
    const events: string[] = [];

    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'ai.player',
        inputs: [{ action: 'jump', phases: ['press'] }],
        events: [{ name: 'damage', target: 'self', direction: 'listen' }],
        signals: [{ name: 'player:jump', direction: 'emit' }],
        props: [{ name: 'speed', type: 'number', default: 10 }],
      },
      factory: ctx => ({
        ready: () => {
          events.push('ready');
          ctx.emitSignal('player:ready', { speed: ctx.props.speed });
        },
        input: event => {
          if (event.action === 'jump') {
            event.handled = true;
            ctx.emitSignal('player:jump', { action: event.action });
          }
        },
        setup: () => {
          ctx.onEvent(ctx.component, 'damage', payload => events.push(`event:${payload.value}`));
        },
        physicsProcess: frame => events.push(`physics:${frame.step}`),
      }),
    });

    const result = validateBehaviorScript({
      scriptId: 'ai.player',
      props: { speed: 10 },
      expectedSignals: ['player:ready', 'player:jump'],
      factory,
      steps: [
        { type: 'input', event: { action: 'jump', phase: 'press' } },
        { type: 'event', name: 'damage', payload: { value: 2 } },
        { type: 'fixedUpdate', frame: { step: 3 } },
      ],
      assertions: [
        {
          name: 'expected-events',
          check: () => events.join('|') === 'ready|event:2|physics:3',
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(result.emittedSignals.map(signal => signal.name)).toEqual(['player:ready', 'player:jump']);
  });

  it('awaits async lifecycle work for AI validation of generated resource scripts', async () => {
    registerTestResource('behavior:asyncAvatar');
    const events: string[] = [];
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'ai.async-resource',
        signals: [{ name: 'avatar:ready', direction: 'emit' }],
        resources: [{ name: 'avatar', resource: 'behavior:asyncAvatar', type: 'IMAGE', required: true }],
      },
      factory: ctx => ({
        async ready() {
          const loaded = await ctx.loadRequiredResource('avatar');
          events.push(`loaded:${(loaded as any).name}:${(loaded as any).complete}`);
          ctx.emitSignal('avatar:ready', { resource: (loaded as any).name });
        },
      }),
    });

    const result = await validateBehaviorScriptAsync({
      scriptId: 'ai.async-resource',
      factory,
      expectedSignals: ['avatar:ready'],
      steps: [],
      assertions: [
        {
          name: 'resource-loaded',
          check: async () => events.join('|') === 'loaded:behavior:asyncAvatar:true',
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(result.emittedSignals).toEqual([{ name: 'avatar:ready', payload: { resource: 'behavior:asyncAvatar' } }]);
    expect(result.runtimeSnapshot?.scripts[0].resources).toEqual([
      {
        name: 'avatar',
        resource: 'behavior:asyncAvatar',
        available: true,
        loaded: true,
        type: 'IMAGE',
        required: true,
        preload: undefined,
      },
    ]);
  });

  it('reports rejected async behavior phases in async validation reports', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const report = await runBehaviorScriptValidationAsync({
      scriptId: 'ai.async.bad',
      source: { uri: 'ai/async-bad.ts', line: 8, column: 4 },
      factory: () => ({
        async process() {
          await Promise.resolve();
          throw new Error('async generated update failed');
        },
      }),
      steps: [{ type: 'update' }],
    });

    expect(report.ok).toBe(false);
    expect(report.status).toBe('failed');
    expect(report.summary).toMatchObject({
      diagnostics: 1,
      errors: 0,
      missingSignals: 0,
      missingNodes: 0,
      missingResources: 0,
    });
    expect(report.failures.diagnostics[0]).toMatchObject({
      scriptId: 'ai.async.bad',
      phase: 'process',
      message: 'async generated update failed',
      source: { uri: 'ai/async-bad.ts', line: 8, column: 4 },
    });
    expect(report.suggestions[0]).toBe(
      'Fix runtime diagnostic in ai.async.bad.process: async generated update failed (ai/async-bad.ts:8:4).',
    );
    expect(error).toHaveBeenCalled();
  });

  it('derives AI validation smoke steps and expected signals from the script manifest', () => {
    const events: string[] = [];
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'ai.auto-plan',
        inputs: [{ action: 'fire', phases: ['press'] }],
        events: [{ name: 'damage', target: 'self', direction: 'listen', payload: { value: 'number' } }],
        signals: [
          { name: 'ai:buff', direction: 'listen', payload: { amount: 'number' } },
          { name: 'ai:fired', direction: 'emit' },
        ],
      },
      factory: ctx => ({
        input: event => {
          if (event.action !== 'fire') return;
          events.push(`input:${event.phase}:${event.source}`);
          ctx.emitSignal('ai:fired', { source: event.source });
        },
        onEvent: (name, payload) => events.push(`event:${name}:${payload.value}`),
        onSignal: (name, payload) => events.push(`signal:${name}:${payload.amount}`),
      }),
    });

    const derived = deriveBehaviorScriptValidationPlan(factory.manifest, { frames: false });
    expect(derived.expectedSignals).toEqual(['ai:fired']);
    expect(
      derived.steps.map(step => {
        if (step.type === 'input') return `input:${step.event.action}:${step.event.phase}`;
        if (step.type === 'event') return `event:${step.name}:${step.target}`;
        if (step.type === 'signal') return `signal:${step.name}`;
        return step.type;
      }),
    ).toEqual(['input:fire:press', 'event:damage:self', 'signal:ai:buff']);

    const result = validateBehaviorScript({
      scriptId: 'ai.auto-plan',
      factory,
      autoPlan: { frames: false },
      assertions: [
        {
          name: 'manifest-contract-covered',
          check: () => events.join('|') === 'input:press:manifest|event:damage:1|signal:ai:buff:1',
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.missingSignals).toEqual([]);
    expect(result.emittedSignals).toEqual([{ name: 'ai:fired', payload: { source: 'manifest' } }]);
  });

  it('validates edit-mode execution only when executeInEditMode is enabled', () => {
    const factory = defineBehaviorScript({
      manifest: {
        scriptId: 'ai.edit-mode',
        signals: [{ name: 'edit:ready', direction: 'emit' }],
      },
      factory: ctx => ({
        ready: () => ctx.emitSignal('edit:ready', { runMode: ctx.runMode }),
      }),
    });

    const skipped = validateBehaviorScript({
      scriptId: 'ai.edit-mode',
      factory,
      systemParams: { runMode: 'edit' },
      expectedSignals: ['edit:ready'],
    });
    const executed = validateBehaviorScript({
      scriptId: 'ai.edit-mode',
      factory,
      executeInEditMode: true,
      systemParams: { runMode: 'edit' },
      expectedSignals: ['edit:ready'],
    });

    expect(skipped.ok).toBe(false);
    expect(skipped.missingSignals).toEqual(['edit:ready']);
    expect(executed.ok).toBe(true);
    expect(executed.emittedSignals).toEqual([{ name: 'edit:ready', payload: { runMode: 'edit' } }]);
  });

  it('validates process pauseMode for AI-generated scripts that must run while paused', () => {
    const events: string[] = [];
    const result = validateBehaviorScript({
      scriptId: 'ai.pause-menu',
      pauseMode: 'process',
      factory: ctx => ({
        pause: () => events.push(`pause:${ctx.isPaused()}:${ctx.getPauseMode()}`),
        process: () => events.push('process'),
        input: event => events.push(`input:${event.action}`),
      }),
      steps: [{ type: 'pause' }, { type: 'update' }, { type: 'input', event: { action: 'confirm', phase: 'press' } }],
      assertions: [
        {
          name: 'paused-script-keeps-processing',
          check: () => events.join('|') === 'pause:true:process|process|input:confirm',
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('validates disabled AI-generated scripts without running active steps', () => {
    const events: string[] = [];
    const result = validateBehaviorScript({
      scriptId: 'ai.disabled-script',
      enabled: false,
      priority: -3,
      expectedSignals: ['disabled:ready'],
      factory: ctx => ({
        ready: () => {
          events.push(`ready:${ctx.isEnabled()}:${ctx.getPriority()}`);
          ctx.emitSignal('disabled:ready');
        },
        enable: () => events.push('enable'),
        disable: () => events.push('disable'),
        enabledChanged: (enabled, previousEnabled) => events.push(`enabledChanged:${previousEnabled}->${enabled}`),
        process: () => events.push('process'),
        input: event => events.push(`input:${event.action}`),
      }),
      steps: [
        { type: 'update' },
        { type: 'input', event: { action: 'confirm', phase: 'press' } },
        { type: 'enabled', enabled: true },
        { type: 'update' },
      ],
      assertions: [
        {
          name: 'disabled-active-steps-skipped',
          check: () => events.join('|') === 'ready:false:-3|disable|enabledChanged:false->true|enable|process',
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.emittedSignals).toEqual([{ name: 'disabled:ready', payload: undefined }]);
  });

  it('fails validation when script diagnostics are emitted', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = validateBehaviorScript({
      scriptId: 'ai.bad',
      source: { uri: 'ai/bad.ts', line: 4, column: 2 },
      factory: () => ({
        process: () => {
          throw new Error('bad generated update');
        },
      }),
      steps: [{ type: 'update' }],
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      scriptId: 'ai.bad',
      phase: 'process',
      message: 'bad generated update',
      source: { uri: 'ai/bad.ts', line: 4, column: 2 },
    });
    expect(error).toHaveBeenCalled();
  });

  it('reports missing expected signals and assertion failures', () => {
    const result = validateBehaviorScript({
      scriptId: 'ai.assert',
      expectedSignals: ['score:changed'],
      factory: () => ({}),
      assertions: [
        {
          name: 'score-advanced',
          check: () => 'score did not change',
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.missingSignals).toEqual(['score:changed']);
    expect(result.errors).toEqual([{ step: 'score-advanced', message: 'score did not change' }]);
  });

  it('creates editor-facing validation reports with manifest, source, steps, and summary', () => {
    const registry = new BehaviorScriptRegistry();
    const factory = registry.registerDefinition(
      {
        manifest: {
          scriptId: 'ai.report',
          source: { uri: 'scripts/report.ts', exportName: 'ReportScript' },
          signals: [{ name: 'report:ready', direction: 'emit' }],
        },
        factory: ctx => ({
          ready: () => ctx.emitSignal('report:ready', { ok: true }),
          input: event => {
            if (event.action === 'go') event.handled = true;
          },
        }),
      },
      'scripts/report.ts',
    );

    const report = runBehaviorScriptValidation({
      scriptId: 'ai.report',
      factory,
      systemParams: { registry },
      expectedSignals: ['report:ready'],
      steps: [{ type: 'input', event: { action: 'go', phase: 'press' } }],
    });

    expect(report).toMatchObject({
      ok: true,
      status: 'passed',
      scriptId: 'ai.report',
      source: { uri: 'scripts/report.ts', exportName: 'ReportScript' },
      message: 'BehaviorScript "ai.report" passed 1 validation step(s) with 1 emitted signal(s).',
      suggestions: [],
      summary: {
        diagnostics: 0,
        errors: 0,
        emittedSignals: 1,
        missingSignals: 0,
        missingNodes: 0,
        missingResources: 0,
        failedAssertions: 0,
      },
      failures: {
        diagnostics: [],
        errors: [],
        missingSignals: [],
        missingNodes: [],
        missingResources: [],
      },
      steps: ['input:go:press'],
    });
    expect(report.manifest?.scriptId).toBe('ai.report');
    expect(report.catalog?.scripts.map(script => script.scriptId)).toEqual(['ai.report']);
    expect(report.runtimeSnapshot).toMatchObject({
      runMode: 'play',
      paused: false,
      defaultPauseMode: 'stop',
      scripts: [
        {
          status: 'bound',
          scriptId: 'ai.report',
          bound: true,
          active: true,
          enabled: true,
          diagnostics: 0,
          errors: 0,
          source: { uri: 'scripts/report.ts', exportName: 'ReportScript' },
          manifest: { scriptId: 'ai.report' },
        },
      ],
    });
  });

  it('creates failure reports for diagnostics, missing signals, and assertions', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const report = runBehaviorScriptValidation({
      scriptId: 'ai.report.bad',
      source: { uri: 'scripts/report-bad.ts' },
      expectedSignals: ['report:missing'],
      factory: () => ({
        process: () => {
          throw new Error('report failed');
        },
      }),
      steps: [{ type: 'update' }],
      assertions: [
        {
          name: 'assertion-name',
          check: () => false,
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.status).toBe('failed');
    expect(report.message).toBe(
      'BehaviorScript "ai.report.bad" failed validation: 1 diagnostic(s), 1 error(s), 1 missing signal(s).',
    );
    expect(report.suggestions).toEqual([
      'Fix runtime diagnostic in ai.report.bad.process: report failed (scripts/report-bad.ts).',
      'Fix validation step "assertion-name": Assertion failed: assertion-name.',
      'Emit missing expected signal(s): report:missing.',
    ]);
    expect(report.summary).toMatchObject({
      diagnostics: 1,
      errors: 1,
      emittedSignals: 0,
      missingSignals: 1,
      missingNodes: 0,
      missingResources: 0,
      failedAssertions: 1,
    });
    expect(report.failures.diagnostics[0]).toMatchObject({
      scriptId: 'ai.report.bad',
      phase: 'process',
      message: 'report failed',
    });
    expect(report.failures.errors[0]).toEqual({
      step: 'assertion-name',
      message: 'Assertion failed: assertion-name',
    });
    expect(report.failures.missingSignals).toEqual(['report:missing']);
    expect(report.failures.missingNodes).toEqual([]);
    expect(report.failures.missingResources).toEqual([]);
    expect(report.steps).toEqual(['update']);
    expect(report.runtimeSnapshot?.scripts[0]).toMatchObject({
      scriptId: 'ai.report.bad',
      status: 'bound',
      diagnostics: 1,
      errors: 1,
      active: true,
      source: { uri: 'scripts/report-bad.ts' },
    });
    expect(error).toHaveBeenCalled();
  });

  it('fails validation reports when required manifest node references are unresolved', () => {
    const report = runBehaviorScriptValidation({
      scriptId: 'ai.required-node',
      factory: defineBehaviorScript({
        manifest: {
          scriptId: 'ai.required-node',
          nodes: [{ name: 'target', path: 'Enemy', required: true }],
        },
        factory: () => ({}),
      }),
      steps: [{ type: 'update' }],
    });

    expect(report.ok).toBe(false);
    expect(report.status).toBe('failed');
    expect(report.message).toBe('BehaviorScript "ai.required-node" failed validation: 1 missing required node(s).');
    expect(report.summary).toMatchObject({
      diagnostics: 0,
      errors: 0,
      emittedSignals: 0,
      missingSignals: 0,
      missingNodes: 1,
      failedAssertions: 0,
    });
    expect(report.failures.missingNodes).toEqual([
      {
        scriptId: 'ai.required-node',
        name: 'target',
        path: 'Enemy',
        gameObjectName: 'ai.required-node',
        required: true,
        multiple: undefined,
      },
    ]);
    expect(report.suggestions).toEqual(['Resolve missing required node reference(s): target -> Enemy.']);
    expect(report.runtimeSnapshot?.scripts[0].nodes).toEqual([
      {
        name: 'target',
        path: 'Enemy',
        resolved: false,
        gameObjectName: undefined,
        required: true,
        multiple: undefined,
      },
    ]);
  });

  it('fails validation reports when required manifest resources are not registered', () => {
    const report = runBehaviorScriptValidation({
      scriptId: 'ai.required-resource',
      factory: defineBehaviorScript({
        manifest: {
          scriptId: 'ai.required-resource',
          resources: [{ name: 'avatar', resource: 'behavior:missingAvatar', type: 'IMAGE', required: true }],
        },
        factory: () => ({}),
      }),
      steps: [{ type: 'update' }],
    });

    expect(report.ok).toBe(false);
    expect(report.status).toBe('failed');
    expect(report.message).toBe(
      'BehaviorScript "ai.required-resource" failed validation: 1 missing required resource(s).',
    );
    expect(report.summary).toMatchObject({
      diagnostics: 0,
      errors: 0,
      emittedSignals: 0,
      missingSignals: 0,
      missingNodes: 0,
      missingResources: 1,
      failedAssertions: 0,
    });
    expect(report.failures.missingResources).toEqual([
      {
        scriptId: 'ai.required-resource',
        name: 'avatar',
        resource: 'behavior:missingAvatar',
        gameObjectName: 'ai.required-resource',
        type: 'IMAGE',
        required: true,
        preload: undefined,
      },
    ]);
    expect(report.suggestions).toEqual([
      'Register missing required resource reference(s): avatar -> behavior:missingAvatar.',
    ]);
    expect(report.runtimeSnapshot?.scripts[0].resources).toEqual([
      {
        name: 'avatar',
        resource: 'behavior:missingAvatar',
        available: false,
        loaded: undefined,
        type: 'IMAGE',
        required: true,
        preload: undefined,
      },
    ]);
  });

  it('includes diagnostic line columns and code frames in validation reports', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const sourceContent = [
      'export default function script() {',
      '  return {',
      '    process() {',
      '      failNow();',
      '    }',
      '  };',
      '}',
    ].join('\n');
    const report = runBehaviorScriptValidation({
      scriptId: 'ai.report.frame',
      source: { uri: 'ai/report-frame.ts', content: sourceContent },
      factory: () => ({
        process: () => {
          const generatedError = new Error('frame failed');
          generatedError.stack = 'Error: frame failed\n    at process (ai/report-frame.ts:4:7)';
          throw generatedError;
        },
      }),
      steps: [{ type: 'update' }],
    });

    expect(report.ok).toBe(false);
    expect(report.suggestions[0]).toBe(
      'Fix runtime diagnostic in ai.report.frame.process: frame failed (ai/report-frame.ts:4:7).',
    );
    expect(report.failures.diagnostics[0]).toMatchObject({
      source: { uri: 'ai/report-frame.ts', line: 4, column: 7 },
    });
    expect(report.failures.diagnostics[0].codeFrame).toContain('> 4 |       failNow();');
    expect(error).toHaveBeenCalled();
  });

  it('validates hot reload with serialized state restoration', () => {
    const restored = jest.fn();
    const result = validateBehaviorScript({
      scriptId: 'ai.reload',
      factory: () => ({
        serializeState: () => ({ coins: 3 }),
      }),
      steps: [
        {
          type: 'hotReload',
          factory: () => ({
            restoreState: restored,
          }),
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(restored).toHaveBeenCalledWith({ coins: 3 });
  });

  it('test_onRegistryChange_fires_listener_on_register_and_unregister', () => {
    const system = new BehaviorScriptSystem();
    system.init();
    const listener = jest.fn();
    const handle = system.onRegistryChange(listener);

    const factory = defineBehaviorScript({
      id: 'rc.echo',
      factory: () => ({}),
    });
    system.registerScript('rc.echo', factory);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'register', scriptId: 'rc.echo' }),
    );

    system.unregisterScript('rc.echo');
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'unregister', scriptId: 'rc.echo' }),
    );

    handle.dispose();
    const factory2 = defineBehaviorScript({ id: 'rc.echo.2', factory: () => ({}) });
    system.registerScript('rc.echo.2', factory2);
    // dispose 之后不再触发 listener
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
