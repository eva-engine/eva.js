import { Game, GameObject, RESOURCE_TYPE, resource } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { getSignalBus, SignalBusSystem } from '@eva/plugin-signal-bus';
import { InputActionMap, InputActionSystem } from '@eva/plugin-input-action';
import {
  BehaviorScript,
  BehaviorScriptSystem,
  createBehaviorScriptInspectorMetadata,
  defineBehaviorScript,
  runBehaviorScriptValidationAsync,
} from '@eva/plugin-behavior-script';

export const name = 'behavior-script - first-class gameplay script';

interface PlayerProps {
  speed: number;
  color: string;
}

interface PlayerState {
  jumps: number;
  reloads: number;
  vx: number;
}

function createPlayerController(defaultColor: string) {
  return defineBehaviorScript<PlayerProps, PlayerState>({
    manifest: {
      scriptId: 'example.player-controller',
      displayName: 'Example Player Controller',
      description: 'Lifecycle, input, signal, event, diagnostics, and hot reload demo.',
      source: {
        uri: 'examples/src/behavior-script.ts',
        exportName: 'createPlayerController',
      },
      props: [
        { name: 'speed', type: 'number', default: 260, min: 0, max: 900, step: 10 },
        { name: 'color', type: 'color', default: defaultColor },
      ],
      inputs: [
        { action: 'left', phases: ['hold', 'release'] },
        { action: 'right', phases: ['hold', 'release'] },
        { action: 'jump', phases: ['press'] },
      ],
      signals: [
        { name: 'player:jump', direction: 'emit' },
        { name: 'player:damaged', direction: 'emit' },
      ],
      events: [{ name: 'damage', target: 'component', direction: 'listen' }],
      groups: [{ name: 'player' }, { name: 'controllable' }],
      nodes: [{ name: 'weapon', path: 'Weapon' }],
      resources: [
        {
          name: 'avatar',
          resource: 'examplePlayerAvatar',
          type: 'IMAGE',
          required: true,
          preload: true,
          description: 'Player avatar texture dependency.',
        },
      ],
      tags: ['example', 'ai-safe'],
    },
    factory: ctx => {
      let jumps = 0;
      let reloads = 0;
      let vx = 0;
      const baseColor = ctx.props.color ?? defaultColor;

      function paint(color: string) {
        const graphics = (ctx.gameObject as any)?.getComponent?.(Graphics);
        if (!graphics) return;
        (graphics.graphics as any).clear().circle(0, 0, 48).fill(color);
      }

      function flash(color: string) {
        paint(color);
        window.setTimeout(() => paint(baseColor), 120);
      }

      function setHorizontalVelocity(direction: -1 | 0 | 1) {
        vx = direction * (ctx.props.speed ?? 260);
      }

      return {
        ready() {
          paint(baseColor);
        },
        enable() {
          paint(baseColor);
        },
        disable() {
          vx = 0;
          paint('#7b8794');
        },
        process(frame) {
          const transform = ctx.gameObject?.transform;
          if (!transform) return;

          transform.position.x += (vx * frame.deltaTime) / 1000;
          transform.position.x = Math.max(64, Math.min(686, transform.position.x));
        },
        input(event) {
          if (event.action === 'left') {
            setHorizontalVelocity(event.phase === 'hold' ? -1 : 0);
            event.handled = true;
            return;
          }
          if (event.action === 'right') {
            setHorizontalVelocity(event.phase === 'hold' ? 1 : 0);
            event.handled = true;
            return;
          }
          if (event.action !== 'jump' || event.phase !== 'press') return;
          event.handled = true;
          jumps += 1;
          ctx.emitSignal('player:jump', { jumps, source: event.source });
          flash('#ffdd55');
        },
        onEvent(name, payload) {
          if (name !== 'damage') return;
          ctx.emitSignal('player:damaged', payload);
          flash('#ff6868');
        },
        groupBoost(amount = 1) {
          ctx.emitSignal('player:boosted', { amount });
          flash('#9f7aea');
        },
        propsChanged(props, previousProps) {
          if (props.color !== previousProps.color) paint(props.color ?? defaultColor);
        },
        serializeState() {
          return { jumps, reloads, vx };
        },
        restoreState(state) {
          jumps = state?.jumps ?? 0;
          reloads = (state?.reloads ?? 0) + 1;
          vx = state?.vx ?? 0;
          flash('#52c41a');
        },
      };
    },
  });
}

function ensureExampleResource(name: string) {
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

export async function init(canvas: HTMLCanvasElement) {
  getSignalBus().clear();
  ensureExampleResource('examplePlayerAvatar');

  const panel = createStatusPanel(canvas);
  const playerController = createPlayerController('#5596ff');
  const inspectorMetadata = createBehaviorScriptInspectorMetadata(playerController.manifest);
  const inspectorProps =
    inspectorMetadata.children
      ?.find(field => field.name === 'props')
      ?.children?.map(field => `${field.name}:${field.type}`)
      .join(', ') ?? 'props:json';
  const validationReport = await runBehaviorScriptValidationAsync({
    scriptId: 'example.player-controller',
    factory: playerController,
    props: { speed: 260, color: '#5596ff' },
    autoPlan: true,
  });

  const behaviorSystem = new BehaviorScriptSystem({
    scripts: {
      'example.player-controller': playerController,
    },
    onDiagnostic: renderStatus,
  });
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new InputActionSystem(),
      behaviorSystem,
    ],
  });

  const player = new GameObject('player', { position: { x: 375, y: 520 } });
  const weapon = new GameObject('Weapon', { position: { x: 42, y: -18 } });
  player.addChild(weapon);
  player.addComponent(new Graphics());
  player.addComponent(
    new InputActionMap({
      bindings: [
        { action: 'left', sources: [{ type: 'key', code: 'ArrowLeft' }] },
        { action: 'right', sources: [{ type: 'key', code: 'ArrowRight' }] },
        { action: 'jump', sources: [{ type: 'key', code: 'Space' }] },
      ],
    }),
  );
  const behavior = player.addComponent(
    new BehaviorScript({
      scriptId: 'example.player-controller',
      props: { speed: 260, color: '#5596ff' },
      source: { uri: 'examples/src/behavior-script.ts', exportName: 'createPlayerController' },
      hotReload: { enabled: true, keepState: true },
      enabled: true,
      priority: 0,
      groups: ['player', 'controllable'],
      nodes: { weapon: 'Weapon' },
      resources: { avatar: 'examplePlayerAvatar' },
      pauseMode: 'inherit',
    }),
  );
  game.scene.addChild(player);

  const floor = new GameObject('floor', { position: { x: 64, y: 620 } });
  const floorGraphics = floor.addComponent(new Graphics());
  (floorGraphics.graphics as any).rect(0, 0, 622, 8).fill('#2b3440');
  game.scene.addChild(floor);

  const bus = getSignalBus();
  const runtime = {
    jumps: 0,
    damage: 0,
    diagnostics: 0,
    groupCalls: 0,
    reloads: 0,
  };

  bus.on('player:jump', payload => {
    runtime.jumps = payload?.jumps ?? runtime.jumps + 1;
    renderStatus();
  });
  bus.on('player:damaged', () => {
    runtime.damage += 1;
    renderStatus();
  });
  bus.on('player:boosted', payload => {
    runtime.groupCalls += payload?.amount ?? 1;
    renderStatus();
  });
  bus.on('behavior:diagnostic', () => {
    runtime.diagnostics += 1;
    renderStatus();
  });

  canvas.addEventListener('click', () => {
    behaviorSystem.dispatchInput({ action: 'jump', phase: 'press', source: 'canvas' }, behavior);
  });
  canvas.addEventListener('dblclick', () => {
    behaviorSystem.emitEvent(behavior, 'damage', { amount: 1, source: 'canvas' });
  });
  window.addEventListener('keydown', event => {
    if (event.code === 'KeyP') {
      if (behaviorSystem.isPaused()) {
        behaviorSystem.onResume();
      } else {
        behaviorSystem.onPause();
      }
      renderStatus();
      return;
    }
    if (event.code === 'KeyE') {
      behaviorSystem.setEnabled(behavior, !behavior.enabled);
      renderStatus();
      return;
    }
    if (event.code === 'KeyG') {
      behaviorSystem.callGroup('player', 'groupBoost', 1);
      renderStatus();
      return;
    }
    if (event.code !== 'KeyH') return;
    runtime.reloads += 1;
    behaviorSystem.reloadScript('example.player-controller', createPlayerController('#52c41a'), { keepState: true });
    renderStatus();
  });

  window.setInterval(renderStatus, 120);
  renderStatus();

  function renderStatus() {
    const catalog = behaviorSystem
      .getCatalog()
      .scripts.map(script => script.scriptId)
      .join(', ');
    const runtimeSnapshot = behaviorSystem.getRuntimeSnapshot();
    const playerSnapshot = runtimeSnapshot.scripts.find(script => script.scriptId === behavior.scriptId);
    panel.textContent = [
      'BehaviorScript demo',
      'ArrowLeft/ArrowRight move, Space or click jumps, double-click damages, E toggles script, G calls group, P pauses, H hot reloads.',
      `validation: ${validationReport.status} - ${validationReport.message}`,
      `signals: ${validationReport.emittedSignals.map(signal => signal.name).join(', ')}`,
      `inspector props: ${inspectorProps}`,
      `run mode: ${behaviorSystem.getRunMode()}, executeInEditMode=${behavior.executeInEditMode}`,
      `script: ${behavior.enabled ? 'enabled' : 'disabled'}, priority=${behavior.priority}`,
      `pause: ${
        behaviorSystem.isPaused() ? 'paused' : 'running'
      }, default=${behaviorSystem.getDefaultPauseMode()}, component=${behavior.pauseMode}`,
      `hot reload: ${behavior.hotReload.enabled === false ? 'disabled' : 'enabled'}, keepState=${
        behavior.hotReload.keepState !== false
      }`,
      `catalog: ${catalog}`,
      `snapshot: ${playerSnapshot?.status ?? 'missing'}, active=${playerSnapshot?.active ?? false}, diagnostics=${
        playerSnapshot?.diagnostics ?? behavior.diagnostics.length
      }`,
      `groups: ${playerSnapshot?.groups.join(', ') ?? behavior.groups.join(', ')}`,
      `nodes: ${formatNodeSnapshot(playerSnapshot?.nodes)}`,
      `resources: ${formatResourceSnapshot(playerSnapshot?.resources)}`,
      `jumps: ${runtime.jumps}`,
      `damage events: ${runtime.damage}`,
      `group calls: ${runtime.groupCalls}`,
      `hot reloads: ${runtime.reloads}`,
      `diagnostics: ${runtime.diagnostics}`,
      `player.x: ${Math.round(player.transform.position.x)}`,
    ].join('\n');
  }
}

function formatNodeSnapshot(nodes: Array<{ name: string; resolved: boolean; gameObjectName?: string }> = []) {
  return nodes.length
    ? nodes.map(node => `${node.name}=${node.resolved ? node.gameObjectName ?? 'resolved' : 'missing'}`).join(', ')
    : 'none';
}

function formatResourceSnapshot(
  resources: Array<{ name: string; resource: string; available: boolean; loaded?: boolean }> = [],
) {
  return resources.length
    ? resources
        .map(
          resource =>
            `${resource.name}=${resource.available ? resource.resource : 'missing'}:${
              resource.loaded ? 'ready' : 'pending'
            }`,
        )
        .join(', ')
    : 'none';
}

function createStatusPanel(canvas: HTMLCanvasElement) {
  const panel = document.createElement('pre');
  panel.style.position = 'fixed';
  panel.style.left = '16px';
  panel.style.top = '16px';
  panel.style.margin = '0';
  panel.style.padding = '12px';
  panel.style.width = '360px';
  panel.style.maxWidth = 'calc(100vw - 32px)';
  panel.style.background = 'rgba(12, 18, 28, 0.84)';
  panel.style.color = '#e8edf4';
  panel.style.font = '12px/1.55 Menlo, Consolas, monospace';
  panel.style.whiteSpace = 'pre-wrap';
  panel.style.pointerEvents = 'none';
  panel.style.zIndex = '10';
  canvas.insertAdjacentElement('afterend', panel);
  return panel;
}
