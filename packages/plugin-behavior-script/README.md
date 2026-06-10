# @eva/plugin-behavior-script

`@eva/plugin-behavior-script` makes gameplay scripts a first-class Eva.js plugin instead of many one-off custom components.

It is designed as the runtime host that the DSL Editor, AI patch generator, and validation tools can target:

- DSL declares a stable `BehaviorScript` component.
- Runtime registers `scriptId -> factory` in `BehaviorScriptSystem`.
- The system forwards lifecycle, frame updates, fixed steps, input, signals, pause/resume, and teardown.
- Runtime failures become structured diagnostics with `scriptId`, phase, game object, source, message, stack, and optional code frame.
- Hot reload can replace a script factory and restore serialized state.

## DSL shape

```json
{
  "type": "BehaviorScript",
  "props": {
    "scriptId": "player.controller",
    "props": {
      "speed": 420,
      "jumpImpulse": 780
    },
    "source": {
      "uri": "src/scripts/player-controller.ts",
      "exportName": "PlayerController",
      "line": 1,
      "column": 1
    },
    "hotReload": {
      "enabled": true,
      "keepState": true
    },
    "enabled": true,
    "priority": 0,
    "pauseMode": "inherit"
  }
}
```

## Runtime registration

```ts
import {
  BehaviorScript,
  BehaviorScriptRegistry,
  BehaviorScriptSystem,
  defineBehaviorScript,
} from '@eva/plugin-behavior-script';

const playerControllerFactory = defineBehaviorScript({
  manifest: {
    scriptId: 'player.controller',
    displayName: 'Player Controller',
    props: [{ name: 'speed', type: 'number', default: 420, min: 0, step: 10 }],
    inputs: [{ action: 'jump', phases: ['press'] }],
    events: [{ name: 'damage', target: 'self', direction: 'listen' }],
    signals: [
      { name: 'input:jump:press', direction: 'listen' },
      { name: 'player:jump', direction: 'emit' },
      { name: 'player:damaged', direction: 'emit' },
    ],
    tags: ['ai-safe'],
  },
  factory: ctx => ({
    onSignal(name) {
      if (name === 'input:jump:press') ctx.emitSignal('player:jump');
    },
    onEvent(name, payload) {
      if (name === 'damage') ctx.emitSignal('player:damaged', payload);
    },
    process(frame) {
      const transform = ctx.gameObject?.transform;
      if (transform) transform.position.x += (ctx.props.speed * frame.deltaTime) / 1000;
    },
    serializeState() {
      return { cooldown: 0 };
    },
    restoreState(state) {
      console.log('restored', state);
    },
  }),
});

const registry = new BehaviorScriptRegistry();
registry.registerModule({
  uri: 'src/scripts/player-controller.ts',
  exports: {
    playerControllerFactory,
  },
});

const behaviorSystem = new BehaviorScriptSystem({ registry });

// Or let the system create its own registry from script modules:
const behaviorSystemFromModules = new BehaviorScriptSystem({
  scriptModules: [{ uri: 'src/scripts/player-controller.ts', exports: { playerControllerFactory } }],
});
```

`BehaviorScriptSystem.getManifest(scriptId)` and `getManifests()` expose the registered type hints for Inspector controls, AI prompt grounding, code completion, and diagnostics UI.

`BehaviorScriptSystem.getCatalog()` returns a stable Editor-facing snapshot:

```ts
const catalog = behaviorSystem.getCatalog();
// { scripts: [{ scriptId, manifest, sourceUri }] }
```

`BehaviorScriptSystem.getRuntimeSnapshot()` exposes the current Editor/debug view of all bound and deferred behavior scripts:

```ts
const snapshot = behaviorSystem.getRuntimeSnapshot();
// {
//   runMode: "play",
//   paused: false,
//   scripts: [{ scriptId, status: "bound", active: true, diagnostics: 0 }]
// }
```

The snapshot includes `status`, `active`, `enabled`, `priority`, `pauseMode`, `executeInEditMode`, `source`, `manifest`, and diagnostic counts. Validation reports also carry `runtimeSnapshot`, so AI-generated scripts can be shown with their runtime state after automatic smoke steps.

`BehaviorScriptRegistry` is the script asset boundary: runtime hosts can register direct factories, `defineBehaviorScript()` definitions, or module exports. This keeps `BehaviorScript.scriptId` stable in DSL while allowing dev-server HMR or Editor asset scans to replace runtime factories.

When `BehaviorScriptSystem` receives an injected registry, it subscribes to registry changes by default. Re-registering the same `scriptId` hot-reloads bound scripts and preserves state through `serializeState()` / `restoreState()`. If the new factory, `restoreState`, `setup`, `enterTree`, or `ready` fails during reload, the system keeps the diagnostic and rolls the component back to the previous factory/state by default. Pass `reloadScript(scriptId, factory, { rollbackOnError: false })` only when a host wants failed reloads to leave the script unbound. A component can opt out with `hotReload.enabled=false`; hosts may still call `reloadScript(scriptId, factory, { force: true })` for an explicit forced refresh. Unregistering a script detaches bound instances and emits a structured diagnostic. Pass `autoReload: false` to disable registry-driven reloads for tests or custom hosts.

Signals have two supported paths:

- Manifest `signals` with `direction: "listen"` or `"both"` are automatically subscribed through the global `SignalBus` and routed to the behavior instance `onSignal(name, payload)` lifecycle hook. This is the preferred path for Editor-visible, typed gameplay contracts because it can power completion, Inspector hints, AI validation, and error localization.
- `ctx.onSignal(name, listener)` is for local dynamic subscriptions inside `setup()`. These listeners are also managed by the system and listener failures are captured as `phase: "signal"` diagnostics.

`ctx.emitSignal()` and `BehaviorScriptSystem.emitSignal()` publish to the global `SignalBus`. Use `BehaviorScriptSystem.dispatchSignal(name, payload, target?)` only when a tool or test needs to directly invoke `onSignal()` without requiring a manifest listener.

Declared input actions are also first-class. Manifest `inputs` subscribe to the existing `@eva/plugin-input-action` signal convention:

```ts
inputs: [{ action: 'jump', phases: ['press'] }];
// listens for input:jump:press and dispatches input({ action: 'jump', phase: 'press' })
```

If `phases` is omitted, the system listens for `press`, `release`, and `hold`. Input events are delivered to scripts that declared the matching action/phase using the same `input(event)` then `unhandledInput(event)` order as manual `BehaviorScriptSystem.dispatchInput()`, and `event.handled=true` stops later handlers.

Manifest `events` with `direction: "listen"` or `"both"` are automatically bound and routed to the behavior instance `onEvent(name, payload, target)` hook. Supported targets are:

- omitted, `"self"`, or `"component"`: the `BehaviorScript` component
- `"gameObject"`: the component host game object
- any other string: a host-provided target from `new BehaviorScriptSystem({ eventTargets })`

`ctx.onEvent(target, name, listener)` binds local Eva/EventEmitter or DOM-style events and automatically disposes listeners when the script is detached. Listener exceptions are captured as `phase: "event"` diagnostics, so local event failures can be shown next to script source just like lifecycle errors.

Scripts can also register generic cleanup work through `ctx.addDisposer(disposer)`, `ctx.setTimeout(listener, delay)`, and `ctx.setInterval(listener, delay)`. These handles are disposed automatically on detach, hot reload, or component destroy. Timer callback failures are reported as `phase: "timer"` diagnostics; disposer failures are reported as `phase: "cleanup"` diagnostics.

`BehaviorScriptSystem` runs in `runMode: "play"` by default. In `runMode: "edit"`, behavior scripts are deferred unless their component sets `executeInEditMode=true`; switching back to play mode attaches deferred scripts. This lets Editor previews avoid gameplay side effects while still allowing opt-in editor tools and gizmos.

Active script execution is controllable from DSL. `enabled=false` keeps the script attached, keeps lifecycle and cleanup hooks available, and preserves diagnostics/hot reload, but skips active callbacks: `process`, `lateProcess`, `physicsProcess`, `input`, `unhandledInput`, `onSignal`, `onEvent`, and managed timer callbacks. The script still receives `disable()` on attach when it starts disabled, and `enabledChanged(enabled, previousEnabled)` plus `enable()` / `disable()` when the host toggles it through `BehaviorScriptSystem.setEnabled(component, enabled)`. `priority` controls active callback ordering across behavior scripts; lower values run first and equal priorities keep attach order.

Groups mirror Godot-style script groups. Set `BehaviorScript.groups` in DSL or call `ctx.addToGroup(name)` / `ctx.removeFromGroup(name)` at runtime. Hosts can query and operate on groups with:

```ts
system.getGroupScripts('enemy');
system.dispatchInputToGroup('enemy', { action: 'attack', phase: 'press' });
system.dispatchSignalToGroup('enemy', 'enemy:alert', { level: 1 });
system.callGroup('enemy', 'takeDamage', 10);
```

Group dispatch and `callGroup` respect `enabled` and pause behavior. Exceptions thrown by group method calls are captured as `phase: "groupCall"` diagnostics. Manifests may declare `groups: [{ name, description }]` so Editor panels, type hints, AI prompt grounding, runtime snapshots, and validation reports can expose known group names.

Node references mirror Godot-style NodePath access. Manifests may declare stable references:

```ts
nodes: [
  { name: 'weapon', path: 'Weapon', required: true },
  { name: 'target', path: '/arena/Enemy' },
];
```

`BehaviorScript.nodes` in DSL can override those paths per instance, for example `{ "target": "../Boss" }`. Scripts can call `ctx.getNode('weapon')`, `ctx.getRequiredNode('weapon')`, or `ctx.getNodes('Enemy')`. Supported paths include `self` / `.`, `..`, relative child paths like `Weapon/Muzzle`, absolute scene paths like `/arena/Enemy`, and bare names which fall back to Eva `findByName` / `findAllByName`. Runtime snapshots report whether each declared node reference resolved, and AI validation fails when a required manifest node cannot be resolved, giving Editor panels and repair prompts a concrete missing-reference surface.

Resource references are first-class too. Manifests may declare stable Eva resource dependencies:

```ts
resources: [
  { name: 'avatar', resource: 'playerAvatar', type: 'IMAGE', required: true },
  { name: 'jumpSfx', resource: 'playerJump', type: 'AUDIO' },
];
```

`BehaviorScript.resources` in DSL can override those keys per instance, for example `{ "avatar": "bossAvatar" }`. Scripts can call `ctx.getResourceName('avatar')`, `ctx.hasResource('avatar')`, `ctx.loadResource('avatar')`, or `ctx.loadRequiredResource('avatar')`. The runtime still uses Eva's global `resource` manager for actual loading; the BehaviorScript component stores only stable resource keys. Runtime snapshots report `available`, `loaded`, `type`, and `required`, and AI validation fails when a required resource reference is not registered.

Pause behavior is first-class too. `BehaviorScriptSystem` has `defaultPauseMode: "stop"` by default; components can set `pauseMode` to:

- `"inherit"`: use the system default.
- `"stop"`: keep lifecycle `pause()` / `resume()` but block `process`, `lateProcess`, `physicsProcess`, `input`, `unhandledInput`, `onSignal`, `onEvent`, and managed timer callbacks while paused.
- `"process"`: keep active behavior phases running while the system is paused.

Scripts can query `ctx.isEnabled()`, `ctx.getPriority()`, `ctx.getGroups()`, `ctx.isInGroup(name)`, `ctx.isPaused()`, and the effective `ctx.getPauseMode()` (`"stop"` or `"process"`) in setup, lifecycle hooks, or generated code. Use `"process"` for pause-menu UI, editor gizmos, or debug tools that need to stay live while gameplay is paused.

## Error localization

`BehaviorScript.source` can carry `uri`, `exportName`, `line`, `column`, and optional generated `content`. Runtime diagnostics preserve that source information, parse matching stack frames for more precise line/column values, and attach a `codeFrame` when source content is available:

```ts
const behavior = new BehaviorScript({
  scriptId: 'player.controller',
  source: {
    uri: 'ai/player-controller.ts',
    content: generatedSource,
  },
});
```

This lets Editor and AI repair flows show errors at the generated script line without reading local files from the runtime plugin. The helper exports `parseBehaviorScriptStackLocation()`, `createBehaviorScriptCodeFrame()`, and `createBehaviorScriptDiagnostic()` for hosts that need the same formatting outside `BehaviorScriptSystem`.

## Inspector metadata

Use `createBehaviorScriptInspectorMetadata(manifest)` to turn script manifests into Editor-friendly field metadata. The metadata keeps common `BehaviorScript` fields (`scriptId`, `source`, `hotReload`, `enabled`, `priority`, `pauseMode`, `executeInEditMode`) and expands manifest props under `props.*` so Inspector panels can render typed controls without reinterpreting the manifest shape.

```ts
import { createBehaviorScriptInspectorMetadata } from '@eva/plugin-behavior-script';

const inspector = createBehaviorScriptInspectorMetadata(playerControllerFactory.manifest);
// inspector.children includes scriptId, props.speed, props.mode, source, hotReload...
```

## Type hints

Use `createBehaviorScriptTypeHints(manifest)` when the Editor, AI prompt builder, or VSCode host needs code-facing hints instead of form metadata. It returns completion entries plus a TypeScript declaration block derived from props, input actions, signals, events, and lifecycle hooks:

```ts
import { createBehaviorScriptTypeHints } from '@eva/plugin-behavior-script';

const hints = createBehaviorScriptTypeHints(playerControllerFactory.manifest);
console.log(hints.declarations);
console.log(hints.completions.map(entry => entry.label));
```

This is the code-completion sibling of Inspector metadata: Inspector renders controls, while type hints ground generated script code and completion lists.

## Lifecycle contract

The behavior instance may implement:

```ts
setup(ctx);
enterTree();
ready();
process(frame);
lateProcess(frame);
physicsProcess(fixedFrame);
input(event);
unhandledInput(event);
onSignal(name, payload);
onEvent(name, payload, target);
propsChanged(nextProps, previousProps);
enable();
disable();
enabledChanged(enabled, previousEnabled);
pause();
resume();
exitTree();
destroy();
serializeState();
restoreState(state);
```

## AI validation flow

For AI-generated scripts, the Editor should:

1. Generate or update DSL patches that bind `BehaviorScript.scriptId`.
2. Register or hot-reload the script factory in `BehaviorScriptSystem`.
3. Run `validateBehaviorScript()` with `autoPlan: true` to derive smoke frames, declared input/events/signals, and expected emitted signals from the manifest. Use `validateBehaviorScriptAsync()` when generated hooks return promises, load resources, or include async assertions.
4. Fail the revision if `ok=false`, `behavior:diagnostic` emits an error, a required manifest node is missing, or a required resource is not registered.
5. Run visual/playtest validation for the affected scene.

This keeps generated code auditable: the persistent document stores script binding and props, while runtime code is validated through the plugin contract.

```ts
import {
  createBehaviorScriptBinding,
  createBehaviorScriptWorkflow,
  deriveBehaviorScriptValidationPlan,
  runBehaviorScriptValidation,
  runBehaviorScriptValidationAsync,
  validateBehaviorScript,
  validateBehaviorScriptAsync,
  validateBehaviorScriptBinding,
} from '@eva/plugin-behavior-script';

const derived = deriveBehaviorScriptValidationPlan(playerControllerFactory.manifest);
console.log(derived.steps, derived.expectedSignals);

const result = validateBehaviorScript({
  scriptId: 'player.controller',
  props: { speed: 420 },
  factory: playerControllerFactory,
  autoPlan: true,
  assertions: [
    {
      name: 'no-runtime-errors',
      check: ctx => ctx.diagnostics.length === 0,
    },
  ],
});

if (!result.ok) {
  console.warn(result.diagnostics, result.errors, result.missingSignals, result.missingNodes, result.missingResources);
}
```

The async variant keeps runtime scheduling synchronous, but waits for promises returned by lifecycle hooks and assertions before computing diagnostics, emitted signals, missing nodes, and missing resources:

```ts
const asyncReport = await runBehaviorScriptValidationAsync({
  scriptId: 'player.controller',
  factory: playerControllerFactory,
  autoPlan: true,
});
```

For Editor patch review or AI feedback, use the report wrapper. It returns machine-readable failures plus a human-readable status line and suggestions that can be shown in diagnostics UI or fed back to an AI repair prompt:

```ts
const report = runBehaviorScriptValidation({
  scriptId: 'player.controller',
  factory: playerControllerFactory,
  autoPlan: true,
});

console.log(report.summary, report.failures, report.manifest, report.source);
console.log(report.status, report.message, report.suggestions);
```

When a test needs a narrower path, pass explicit `steps` and `expectedSignals`; they override the auto-derived plan.

## DSL binding helper

The DSL document should store a plain `BehaviorScript` component. Use the binding helper to apply manifest defaults and validate AI-generated props before committing a DSL patch:

```ts
const binding = createBehaviorScriptBinding({
  scriptId: 'player.controller',
  props: { speed: 420 },
  registry,
  hotReload: { enabled: true, keepState: true },
});

const issues = validateBehaviorScriptBinding(binding, { registry });
// binding is `{ type: "BehaviorScript", props: { scriptId, props, source, hotReload } }`
```

## End-to-end workflow helper

`createBehaviorScriptWorkflow()` stitches the runtime pieces together for Editor/AI integrations:

```ts
const workflow = createBehaviorScriptWorkflow({
  scriptId: 'player.controller',
  props: { speed: 420 },
  scriptModules: [{ uri: 'src/scripts/player-controller.ts', exports: { playerControllerFactory } }],
  validate: {
    autoPlan: true,
  },
});

console.log(workflow.binding, workflow.bindingIssues, workflow.catalog, workflow.validationReport);
```

## Examples

- Package-level demo helpers live in `packages/plugin-behavior-script/demo/behavior-script-demo.ts`.
- The runnable Eva.js example is `examples/src/behavior-script.ts`; start the examples dev server and open `http://localhost:8083/#./src/behavior-script.ts`.

The runnable example covers manifest-backed type hints, lifecycle, auto-derived validation, `InputActionMap` signals, local events, diagnostics, and hot reload with preserved serialized state.
