import { getSignalBus } from '@eva/plugin-signal-bus';
import {
  createBehaviorScriptBindingDemo,
  createBehaviorScriptDemo,
  createBehaviorScriptInspectorDemo,
  createBehaviorScriptTypeHintsDemo,
  createBehaviorScriptWorkflowDemo,
  reportBehaviorScriptDemoAsync,
  reportBehaviorScriptDemo,
  validateBehaviorScriptDemoAsync,
  validateBehaviorScriptDemo,
} from '../demo/behavior-script-demo';

describe('plugin-behavior-script demo', () => {
  beforeEach(() => {
    getSignalBus().clear();
  });

  it('creates a DSL-compatible binding with no validation issues', () => {
    const { binding, issues } = createBehaviorScriptBindingDemo();

    expect(binding).toEqual({
      type: 'BehaviorScript',
      props: {
        scriptId: 'player.controller',
        props: { speed: 240 },
        source: undefined,
        hotReload: { enabled: true, keepState: true },
        enabled: true,
        priority: 0,
        groups: ['player', 'controllable'],
        nodes: { weapon: 'Weapon' },
        resources: { avatar: 'playerAvatar' },
        executeInEditMode: undefined,
        pauseMode: undefined,
      },
    });
    expect(issues).toEqual([]);
  });

  it('runs the demo script through AI validation steps', () => {
    const result = validateBehaviorScriptDemo();

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(result.missingSignals).toEqual([]);
    expect(result.emittedSignals.map(signal => signal.name)).toEqual(['player:jump', 'player:damaged']);
  });

  it('runs the demo script through async AI validation steps', async () => {
    const result = await validateBehaviorScriptDemoAsync();

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(result.missingResources).toEqual([]);
    expect(result.emittedSignals.map(signal => signal.name)).toEqual(['player:jump', 'player:damaged']);
  });

  it('reports validation details for editor and AI workflows', () => {
    const report = reportBehaviorScriptDemo();

    expect(report.ok).toBe(true);
    expect(report.status).toBe('passed');
    expect(report.message).toBe(
      'BehaviorScript "player.controller" passed 7 validation step(s) with 2 emitted signal(s).',
    );
    expect(report.suggestions).toEqual([]);
    expect(report.summary).toEqual({
      diagnostics: 0,
      errors: 0,
      emittedSignals: 2,
      failedAssertions: 0,
      missingSignals: 0,
      missingNodes: 0,
      missingResources: 0,
    });
    expect(report.failures).toEqual({
      diagnostics: [],
      errors: [],
      missingSignals: [],
      missingNodes: [],
      missingResources: [],
    });
    expect(report.manifest?.scriptId).toBe('player.controller');
    expect(report.steps).toEqual([
      'update',
      'lateUpdate',
      'fixedUpdate',
      'input:jump:press',
      'input:right:hold',
      'input:right:release',
      'event:damage',
    ]);
    expect(report.emittedSignals.map(signal => signal.name)).toEqual(['player:jump', 'player:damaged']);
    expect(report.runtimeSnapshot?.scripts[0]).toMatchObject({
      scriptId: 'player.controller',
      status: 'bound',
      active: true,
      diagnostics: 0,
      errors: 0,
    });
  });

  it('reports async validation details for editor and AI workflows', async () => {
    const report = await reportBehaviorScriptDemoAsync();

    expect(report.ok).toBe(true);
    expect(report.status).toBe('passed');
    expect(report.summary).toMatchObject({
      diagnostics: 0,
      errors: 0,
      missingSignals: 0,
      missingNodes: 0,
      missingResources: 0,
    });
    expect(report.runtimeSnapshot?.scripts[0].resources).toEqual([
      {
        name: 'avatar',
        resource: 'playerAvatar',
        available: true,
        loaded: false,
        type: 'IMAGE',
        required: undefined,
        preload: undefined,
      },
    ]);
  });

  it('exposes manifest-backed inspector metadata for the demo script', () => {
    const metadata = createBehaviorScriptInspectorDemo();
    const props = metadata.children?.find(field => field.name === 'props');

    expect(metadata.label).toBe('Player Controller');
    expect(metadata.children?.find(field => field.name === 'scriptId')).toMatchObject({
      default: 'player.controller',
      readonly: true,
    });
    expect(props?.children?.map(field => [field.name, field.type, field.default])).toEqual([['speed', 'number', 240]]);
  });

  it('exposes manifest-backed type hints for code completion and AI grounding', () => {
    const hints = createBehaviorScriptTypeHintsDemo();

    expect(hints.propsTypeName).toBe('PlayerControllerProps');
    expect(hints.declarations).toContain('export interface PlayerControllerProps');
    expect(hints.declarations).toContain('speed?: number;');
    expect(hints.declarations).toContain("export type PlayerControllerScriptInputAction = 'jump' | 'right';");
    expect(hints.declarations).toContain(
      "export type PlayerControllerScriptSignalName = 'player:jump' | 'player:damaged';",
    );
    expect(hints.declarations).toContain("export type PlayerControllerScriptEventName = 'damage';");
    expect(hints.declarations).toContain("export type PlayerControllerScriptGroupName = 'player' | 'controllable';");
    expect(hints.declarations).toContain("export type PlayerControllerScriptNodeName = 'weapon';");
    expect(hints.declarations).toContain("export type PlayerControllerScriptResourceName = 'avatar';");
    expect(hints.completions.map(entry => entry.label)).toEqual(
      expect.arrayContaining([
        'ctx.props.speed',
        'input:jump:press',
        'input:right:hold',
        'player:jump',
        'self:damage',
        'group:player',
        'node:weapon',
        'resource:avatar',
        'process(frame)',
      ]),
    );
  });

  it('builds the full demo workflow from module registration to validation report', () => {
    const workflow = createBehaviorScriptWorkflowDemo();

    expect(workflow.bindingIssues).toEqual([]);
    expect(workflow.binding.props.scriptId).toBe('player.controller');
    expect(workflow.binding.props.groups).toEqual(['player', 'controllable']);
    expect(workflow.binding.props.nodes).toEqual({ weapon: 'Weapon' });
    expect(workflow.binding.props.resources).toEqual({ avatar: 'playerAvatar' });
    expect(workflow.catalog.scripts.map(script => script.scriptId)).toEqual(['player.controller']);
    expect(workflow.typeHints?.propsTypeName).toBe('PlayerControllerProps');
    expect(workflow.validationReport?.ok).toBe(true);
    expect(workflow.validationReport?.status).toBe('passed');
    expect(workflow.validationReport?.suggestions).toEqual([]);
    expect(workflow.validationReport?.steps).toEqual([
      'update',
      'lateUpdate',
      'fixedUpdate',
      'input:jump:press',
      'input:right:hold',
      'input:right:release',
      'event:damage',
    ]);
  });

  it('boots the demo scene and advances the behavior script system', async () => {
    const { game, behaviorSystem, player } = await createBehaviorScriptDemo();

    try {
      expect(behaviorSystem.hasScript('player.controller')).toBe(true);
      expect(player.transform.position.x).toBeGreaterThan(0);
      expect(behaviorSystem.getCatalog().scripts.map(script => script.scriptId)).toEqual(['player.controller']);
      expect(behaviorSystem.getGroupScripts('player').map(script => script.gameObject?.name)).toEqual(['Player']);
      expect(behaviorSystem.getRuntimeSnapshot().scripts[0]).toMatchObject({
        scriptId: 'player.controller',
        status: 'bound',
        active: true,
        groups: ['player', 'controllable'],
        nodes: [
          {
            name: 'weapon',
            path: 'Weapon',
            resolved: true,
            gameObjectName: 'Weapon',
          },
        ],
        resources: [
          {
            name: 'avatar',
            resource: 'playerAvatar',
            available: true,
            type: 'IMAGE',
          },
        ],
        diagnostics: 0,
      });
    } finally {
      game.destroy();
    }
  });
});
