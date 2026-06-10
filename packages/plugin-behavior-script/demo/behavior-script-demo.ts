import { Game, GameObject, RESOURCE_TYPE, Scene, resource } from '@eva/eva.js';
import {
  BehaviorScript,
  BehaviorScriptSystem,
  createBehaviorScriptBinding,
  createBehaviorScriptInspectorMetadata,
  createBehaviorScriptTypeHints,
  createBehaviorScriptWorkflow,
  defineBehaviorScript,
  runBehaviorScriptValidationAsync,
  runBehaviorScriptValidation,
  validateBehaviorScriptBinding,
  validateBehaviorScript,
  validateBehaviorScriptAsync,
} from '../lib';

const playerControllerFactory = defineBehaviorScript({
  manifest: {
    scriptId: 'player.controller',
    displayName: 'Player Controller',
    props: [{ name: 'speed', type: 'number', default: 240, min: 0, step: 10 }],
    inputs: [
      { action: 'jump', phases: ['press'] },
      { action: 'right', phases: ['hold', 'release'] },
    ],
    signals: [
      { name: 'player:jump', direction: 'emit' },
      { name: 'player:damaged', direction: 'emit' },
    ],
    events: [{ name: 'damage', target: 'self', direction: 'listen' }],
    groups: [{ name: 'player' }, { name: 'controllable' }],
    nodes: [{ name: 'weapon', path: 'Weapon' }],
    resources: [{ name: 'avatar', resource: 'playerAvatar', type: 'IMAGE', description: 'Player avatar texture.' }],
    tags: ['demo', 'ai-safe'],
  },
  factory: ctx => {
    let vx = 0;
    return {
      setup() {
        ctx.addDisposer(() => {
          vx = 0;
        });
      },
      input(event) {
        if (event.action === 'right' && event.phase === 'hold') {
          vx = ctx.props.speed ?? 120;
          event.handled = true;
          return;
        }
        if (event.action === 'right' && event.phase === 'release') {
          vx = 0;
          event.handled = true;
          return;
        }
        if (event.action !== 'jump') return;
        event.handled = true;
        ctx.emitSignal('player:jump', { action: event.action });
      },
      process(frame) {
        const transform = ctx.gameObject?.transform;
        if (!transform) return;
        transform.position.x += (vx * frame.deltaTime) / 1000;
      },
      onEvent(name, payload) {
        if (name === 'damage') ctx.emitSignal('player:damaged', payload);
      },
      serializeState() {
        return { vx };
      },
      restoreState(state) {
        vx = state?.vx ?? 0;
      },
    };
  },
});

function ensureDemoResource(name: string) {
  if ((resource as any).resourcesMap?.[name]) return;
  resource.addResource([
    {
      name,
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: { type: 'data', data: { name } },
      },
    },
  ]);
}

export async function createBehaviorScriptDemo() {
  ensureDemoResource('playerAvatar');

  const behaviorSystem = new BehaviorScriptSystem({
    scriptModules: [
      {
        uri: 'demo/behavior-script-demo.ts',
        exports: {
          playerControllerFactory,
        },
      },
    ],
  });

  const game = new Game();
  await game.init({ autoStart: false, systems: [behaviorSystem] });

  const scene = new Scene('behavior-script-demo');
  const player = new GameObject('Player');
  const weapon = new GameObject('Weapon');
  player.addChild(weapon);
  player.addComponent(
    new BehaviorScript({
      scriptId: 'player.controller',
      props: { speed: 240 },
      source: { uri: 'demo/behavior-script-demo.ts', exportName: 'player.controller' },
      groups: ['player', 'controllable'],
      nodes: { weapon: 'Weapon' },
      resources: { avatar: 'playerAvatar' },
    }),
  );
  scene.addGameObject(player);
  game.loadScene({ scene });

  behaviorSystem.update({ deltaTime: 0, frameCount: 0, time: 0, currentTime: 0, fps: 60 });
  behaviorSystem.emitSignal('input:right:hold', { action: 'right' });
  behaviorSystem.update({ deltaTime: 16, frameCount: 1, time: 16, currentTime: 16, fps: 60 });

  return { game, behaviorSystem, player };
}

export function validateBehaviorScriptDemo() {
  return validateBehaviorScript({
    scriptId: 'player.controller',
    props: { speed: 240 },
    factory: playerControllerFactory,
    autoPlan: true,
  });
}

export function validateBehaviorScriptDemoAsync() {
  ensureDemoResource('playerAvatar');
  return validateBehaviorScriptAsync({
    scriptId: 'player.controller',
    props: { speed: 240 },
    factory: playerControllerFactory,
    autoPlan: true,
  });
}

export function reportBehaviorScriptDemo() {
  return runBehaviorScriptValidation({
    scriptId: 'player.controller',
    props: { speed: 240 },
    factory: playerControllerFactory,
    autoPlan: true,
  });
}

export function reportBehaviorScriptDemoAsync() {
  ensureDemoResource('playerAvatar');
  return runBehaviorScriptValidationAsync({
    scriptId: 'player.controller',
    props: { speed: 240 },
    factory: playerControllerFactory,
    autoPlan: true,
  });
}

export function createBehaviorScriptBindingDemo() {
  const binding = createBehaviorScriptBinding({
    scriptId: 'player.controller',
    props: { speed: 240 },
    manifest: playerControllerFactory.manifest,
    hotReload: { enabled: true, keepState: true },
    enabled: true,
    priority: 0,
    groups: ['player', 'controllable'],
    nodes: { weapon: 'Weapon' },
    resources: { avatar: 'playerAvatar' },
  });

  return {
    binding,
    issues: validateBehaviorScriptBinding(binding, { manifest: playerControllerFactory.manifest }),
  };
}

export function createBehaviorScriptInspectorDemo() {
  return createBehaviorScriptInspectorMetadata(playerControllerFactory.manifest);
}

export function createBehaviorScriptTypeHintsDemo() {
  return createBehaviorScriptTypeHints(playerControllerFactory.manifest);
}

export function createBehaviorScriptWorkflowDemo() {
  return createBehaviorScriptWorkflow({
    scriptId: 'player.controller',
    props: { speed: 240 },
    scriptModules: [
      {
        uri: 'demo/behavior-script-demo.ts',
        exports: { playerControllerFactory },
      },
    ],
    hotReload: { enabled: true, keepState: true },
    enabled: true,
    priority: 0,
    groups: ['player', 'controllable'],
    nodes: { weapon: 'Weapon' },
    resources: { avatar: 'playerAvatar' },
    validate: {
      autoPlan: true,
    },
  });
}
