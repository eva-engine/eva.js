import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import {
  BehaviorScript,
  BehaviorScriptRegistry,
  BehaviorScriptSystem,
  behaviorValueTypeToInspectorType,
  behaviorValueTypeToTypescript,
  createBehaviorScriptBinding,
  createBehaviorScriptCodeFrame,
  createBehaviorScriptDiagnostic,
  createBehaviorScriptExtension,
  createBehaviorScriptInspectorMetadata,
  createBehaviorScriptTypeHints,
  createBehaviorScriptWorkflow,
  defineBehaviorScript,
  getBehaviorScriptManifest,
  normalizeBehaviorScriptManifest,
  parseBehaviorScriptStackLocation,
  resolveBehaviorScriptProps,
  runBehaviorScriptValidation,
  runBehaviorScriptValidationAsync,
  validateBehaviorScriptBinding,
  validateBehaviorScriptManifest,
} from '@eva/plugin-behavior-script';

export const name = 'behavior-script-deep — Registry / Extension / Workflow / DSL binding 工具链';

const W = 750;
const H = 1000;

// 自带 DOM overlay,完全不依赖 plugin-renderer-text(其在 pixi 8.x 下整体加载失败)
function makeOverlay(canvas: HTMLCanvasElement) {
  const root = document.createElement('div');
  root.style.cssText = `
    position: fixed;
    pointer-events: none;
    color: #cdd5e0;
    font: 12px/1.45 ui-monospace, Menlo, Consolas, monospace;
    z-index: 10;
    text-shadow: 0 1px 0 #000a;
    white-space: pre-wrap;
  `;
  function reposition() {
    const rect = canvas.getBoundingClientRect();
    root.style.left = `${rect.left}px`;
    root.style.top = `${rect.top}px`;
    root.style.width = `${rect.width}px`;
    root.style.height = `${rect.height}px`;
  }
  reposition();
  window.addEventListener('resize', reposition);
  document.body.appendChild(root);
  return root;
}

interface SpinnerProps {
  speed: number;
  color: string;
  mode: 'cw' | 'ccw';
}

// 一个最小 BehaviorScriptDefinition:onUpdate 把 entity 旋转
const spinnerScript = defineBehaviorScript<SpinnerProps>({
  manifest: {
    scriptId: 'demo.spinner',
    displayName: 'Demo Spinner',
    description: 'Rotate the host gameObject every frame.',
    source: { uri: 'examples/src/behavior-script-deep.ts', exportName: 'spinnerScript' },
    props: [
      { name: 'speed', type: 'number', default: 2, min: 0, max: 12, step: 0.1, description: 'rad/s' },
      { name: 'color', type: 'color', default: '#5cd6ff' },
      {
        name: 'mode',
        type: 'enum',
        default: 'cw',
        enum: [
          { label: 'Clockwise', value: 'cw' },
          { label: 'Counter-clockwise', value: 'ccw' },
        ],
      },
    ],
    signals: [{ name: 'demo:spin:tick', direction: 'emit' }],
    events: [{ name: 'poke', target: 'component', direction: 'listen' }],
    groups: [{ name: 'spinners' }],
    tags: ['demo'],
  },
  factory: ctx => {
    return {
      ready() {
        const graphics = (ctx.gameObject as any)?.getComponent?.(Graphics);
        if (graphics) (graphics.graphics as any).clear().rect(-40, -40, 80, 80).fill(ctx.props.color ?? '#5cd6ff');
      },
      process(frame) {
        const t = ctx.gameObject?.transform;
        if (!t) return;
        const dir = ctx.props.mode === 'ccw' ? -1 : 1;
        t.rotation += (dir * (ctx.props.speed ?? 2) * frame.deltaTime) / 1000;
      },
      onEvent(name, payload) {
        if (name === 'poke') ctx.emitSignal('demo:spin:tick', payload);
      },
    };
  },
});

interface DemoEntry {
  api: string;
  ok: boolean;
  detail?: string;
}

export async function init(canvas: HTMLCanvasElement) {
  getSignalBus().clear();
  const overlay = makeOverlay(canvas);
  const entries: DemoEntry[] = [];
  function record(api: string, ok: boolean, detail?: string) {
    entries.push({ api, ok, detail });
  }
  function tryRun<T>(api: string, fn: () => T): T | undefined {
    try {
      const v = fn();
      record(api, true);
      return v;
    } catch (e: any) {
      record(api, false, e?.message ?? String(e));
      return undefined;
    }
  }

  // ====================================================================
  // 1) BehaviorScriptRegistry 直接实例化 + 至少 4 个方法
  // ====================================================================
  const registry = new BehaviorScriptRegistry();
  // 注:实际方法名 registerScript / hasScript / getFactory / getManifest / getCatalog
  // 不是 register/has/get/list。task 里写的名称是描述性的,这里以源码签名为准。
  tryRun('new BehaviorScriptRegistry()', () => registry);
  tryRun('registry.registerScript()', () =>
    registry.registerScript('demo.spinner', spinnerScript, 'examples/src/behavior-script-deep.ts'),
  );
  // registerDefinition 是 BehaviorScriptRegistry 才有的便捷方法
  tryRun('registry.registerDefinition()', () =>
    registry.registerDefinition(
      defineBehaviorScript<{ tag: string }>({
        manifest: {
          scriptId: 'demo.tagger',
          displayName: 'Tagger',
          props: [{ name: 'tag', type: 'string', default: 'A' }],
        },
        factory: () => ({}),
      }),
    ),
  );
  console.log('[behavior-script-deep] registry.hasScript(demo.spinner)=', registry.hasScript('demo.spinner'));
  record('registry.hasScript()', true, `hasScript=${registry.hasScript('demo.spinner')}`);
  console.log('[behavior-script-deep] registry.getFactory(demo.spinner)=', registry.getFactory('demo.spinner'));
  record('registry.getFactory()', true, `factory.manifest.scriptId=${registry.getFactory('demo.spinner')?.manifest?.scriptId}`);
  console.log('[behavior-script-deep] registry.getManifests()=', registry.getManifests());
  record('registry.getManifests()', true, `count=${registry.getManifests().length}`);
  console.log('[behavior-script-deep] registry.getScriptIds()=', registry.getScriptIds());
  record('registry.getScriptIds()', true, registry.getScriptIds().join(','));
  console.log('[behavior-script-deep] registry.getCatalog()=', registry.getCatalog());
  record('registry.getCatalog()', true, `${registry.getCatalog().scripts.length} entries`);

  // registerModule:批量从一个对象注册所有 BehaviorScriptDefinition / 已附 manifest 的 factory
  const moduleReg = tryRun('registry.registerModule()', () =>
    registry.registerModule({
      uri: 'examples/src/behavior-script-deep.ts#extra',
      exports: {
        // 一个直接附 manifest 的 factory 也能被识别(isManifestBackedFactory)
        spinnerAlias: spinnerScript,
      },
    }),
  );
  console.log('[behavior-script-deep] registerModule result=', moduleReg);

  // onDidChange 监听
  const changeLog: string[] = [];
  const sub = registry.onDidChange(change => changeLog.push(`${change.type}:${change.scriptId ?? '*'}`));
  registry.unregisterScript('demo.tagger');
  sub.dispose();
  record('registry.onDidChange()', true, changeLog.join('|'));

  // ====================================================================
  // 2) createBehaviorScriptExtension 工厂 — 返回 PluginStruct + createSystem
  // ====================================================================
  // 注:createBehaviorScriptExtension 不是给 BehaviorScriptSystem 喂参数,
  // 它返回的对象自带 createSystem(),也可以直接当 PluginStruct 给 game.addPlugin(...)。
  // 这里我们用 createSystem() 拿到一个已 wire 好 registry/scripts 的系统实例。
  const extension = createBehaviorScriptExtension({
    registry,
    runMode: 'play',
    defaultPauseMode: 'stop',
    onDiagnostic: d => {
      console.warn('[behavior-script-deep] diagnostic via extension', d.scriptId, d.phase, d.message);
    },
  });
  record('createBehaviorScriptExtension()', !!extension && !!extension.createSystem,
    `Components=${extension.Components.length} Systems=${extension.Systems.length}`);
  const behaviorSystem = extension.createSystem();
  record('extension.createSystem()', behaviorSystem instanceof BehaviorScriptSystem);

  // ====================================================================
  // 3) createBehaviorScriptWorkflow — 一站式构造 binding + validation + typeHints
  // ====================================================================
  const workflow = createBehaviorScriptWorkflow<SpinnerProps>({
    scriptId: 'demo.spinner',
    props: { speed: 3, color: '#9d6cff', mode: 'cw' },
    registry,
    validate: { autoPlan: true },
  });
  record('createBehaviorScriptWorkflow()', true,
    `bindingType=${workflow.binding.type} bindingIssues=${workflow.bindingIssues.length} ` +
    `catalog=${workflow.catalog?.scripts.length} typeHints=${!!workflow.typeHints} ` +
    `validation=${workflow.validationReport?.status}`);
  console.log('[behavior-script-deep] workflow=', workflow);

  // ====================================================================
  // 4) defineBehaviorScript 已经在文件顶部演示
  // ====================================================================
  record('defineBehaviorScript()', !!spinnerScript.manifest,
    `scriptId=${spinnerScript.manifest?.scriptId}`);

  // ====================================================================
  // 5) getBehaviorScriptManifest / normalizeBehaviorScriptManifest / validateBehaviorScriptManifest
  // ====================================================================
  const fetched = getBehaviorScriptManifest(spinnerScript);
  record('getBehaviorScriptManifest()', !!fetched, fetched?.scriptId);
  console.log('[behavior-script-deep] manifest=', fetched);

  const rawManifest = {
    scriptId: 'demo.normalize',
    props: [
      { name: 'a', type: 'number' as const, default: 1 },
      { name: 'a', type: 'number' as const, default: 9 }, // 故意重复,看 normalize 去重
    ],
    lifecycle: [],
    tags: ['x', 'x', 'y'],
  };
  const normalized = normalizeBehaviorScriptManifest(rawManifest);
  record('normalizeBehaviorScriptManifest()', true,
    `props=${normalized.props?.length} tags=${normalized.tags?.join(',')} ` +
    `lifecycle=${normalized.lifecycle?.length}`);
  console.log('[behavior-script-deep] normalized manifest=', normalized);

  const issues = validateBehaviorScriptManifest({
    scriptId: '',
    props: [{ name: '', type: undefined as any }],
    signals: [{ name: 'sig', direction: undefined as any }],
  });
  record('validateBehaviorScriptManifest()', issues.length > 0,
    `issues=${issues.map(i => i.path).join('|')}`);
  console.log('[behavior-script-deep] manifest issues=', issues);

  // ====================================================================
  // 6) DSL binding 链:createBehaviorScriptBinding + resolveBehaviorScriptProps + validateBehaviorScriptBinding
  // ====================================================================
  // 一个伪 DSL 节点(只给部分 props,看 default 自动填回)
  const userInputProps: Partial<SpinnerProps> = { speed: 4 };
  const resolvedProps = resolveBehaviorScriptProps(spinnerScript.manifest, userInputProps);
  record('resolveBehaviorScriptProps()', true,
    `speed=${resolvedProps.speed} color=${resolvedProps.color} mode=${resolvedProps.mode}`);
  console.log('[behavior-script-deep] resolved props=', resolvedProps);

  const dslBinding = createBehaviorScriptBinding({
    scriptId: 'demo.spinner',
    props: resolvedProps,
    registry,
    enabled: true,
    priority: 0,
    groups: ['spinners'],
    nodes: { weapon: 'Weapon' },
    resources: {},
    pauseMode: 'inherit',
  });
  record('createBehaviorScriptBinding()', dslBinding.type === 'BehaviorScript',
    `props.scriptId=${dslBinding.props.scriptId}`);
  console.log('[behavior-script-deep] DSL binding=', dslBinding);

  const bindingIssues = validateBehaviorScriptBinding(dslBinding, { registry });
  record('validateBehaviorScriptBinding()', true, `issues=${bindingIssues.length}`);
  console.log('[behavior-script-deep] binding issues=', bindingIssues);

  // 故意造一个非法 binding(speed 超出 max)
  const badBinding = createBehaviorScriptBinding({
    scriptId: 'demo.spinner',
    props: { speed: 9999, color: '#fff', mode: 'cw' },
    registry,
  });
  const badIssues = validateBehaviorScriptBinding(badBinding, { registry });
  record('validateBehaviorScriptBinding(bad)', badIssues.length > 0,
    `bad-issues=${badIssues.map(i => i.message).join(' / ')}`);

  // ====================================================================
  // 7) runBehaviorScriptValidation / runBehaviorScriptValidationAsync
  // ====================================================================
  const syncReport = runBehaviorScriptValidation<SpinnerProps>({
    scriptId: 'demo.spinner',
    factory: spinnerScript,
    props: { speed: 2, color: '#62d96b', mode: 'cw' },
    autoPlan: true,
  });
  record('runBehaviorScriptValidation()', syncReport.ok,
    `${syncReport.status} steps=${syncReport.steps.length}`);
  console.log('[behavior-script-deep] sync validation=', syncReport);

  const asyncReport = await runBehaviorScriptValidationAsync<SpinnerProps>({
    scriptId: 'demo.spinner',
    factory: spinnerScript,
    props: { speed: 2, color: '#62d96b', mode: 'ccw' },
    autoPlan: true,
  });
  record('runBehaviorScriptValidationAsync()', asyncReport.ok,
    `${asyncReport.status} steps=${asyncReport.steps.length}`);
  console.log('[behavior-script-deep] async validation=', asyncReport);

  // ====================================================================
  // 8) 诊断 API:parseBehaviorScriptStackLocation / createBehaviorScriptCodeFrame / createBehaviorScriptDiagnostic
  // ====================================================================
  const fakeStack = [
    'TypeError: Cannot read property "x" of undefined',
    '    at process (examples/src/behavior-script-deep.ts:123:42)',
    '    at BehaviorScriptSystem.update (lib/BehaviorScriptSystem.ts:512:18)',
  ].join('\n');
  const stackLoc = parseBehaviorScriptStackLocation(fakeStack);
  record('parseBehaviorScriptStackLocation()', !!stackLoc.uri,
    `${stackLoc.uri}:${stackLoc.line}:${stackLoc.column}`);
  console.log('[behavior-script-deep] stack location=', stackLoc);

  const fakeSourceContent = [
    'function process(frame) {',
    '  const t = ctx.gameObject.transform;',
    '  t.rotation += frame.deltaTime;', // 假设是第 3 行
    '  // ...',
    '}',
  ].join('\n');
  const codeFrame = createBehaviorScriptCodeFrame({
    uri: 'examples/src/behavior-script-deep.ts',
    line: 3,
    column: 5,
    content: fakeSourceContent,
  });
  record('createBehaviorScriptCodeFrame()', typeof codeFrame === 'string' && codeFrame.length > 0,
    `${codeFrame?.length ?? 0} chars`);
  console.log('[behavior-script-deep] codeFrame:\n' + codeFrame);

  const diagnostic = createBehaviorScriptDiagnostic({
    scriptId: 'demo.spinner',
    phase: 'process',
    message: 'demo: faked diagnostic to display codeFrame',
    stack: fakeStack,
    timestamp: Date.now(),
    componentSource: {
      uri: 'examples/src/behavior-script-deep.ts',
      line: 3,
      column: 5,
      content: fakeSourceContent,
    },
  });
  record('createBehaviorScriptDiagnostic()', !!diagnostic.codeFrame,
    `severity=${diagnostic.severity} hasCodeFrame=${!!diagnostic.codeFrame}`);
  console.log('[behavior-script-deep] diagnostic=', diagnostic);

  // ====================================================================
  // 9) Inspector + type-hints
  // ====================================================================
  const inspectorTypeNumber = behaviorValueTypeToInspectorType('number');
  const inspectorTypeArray = behaviorValueTypeToInspectorType('array');
  record('behaviorValueTypeToInspectorType()', true,
    `number→${inspectorTypeNumber} array→${inspectorTypeArray}`);
  console.log('[behavior-script-deep] inspector types=', { number: inspectorTypeNumber, array: inspectorTypeArray });

  const inspectorMeta = createBehaviorScriptInspectorMetadata(spinnerScript.manifest);
  const propsField = inspectorMeta.children?.find(c => c.name === 'props');
  record('createBehaviorScriptInspectorMetadata()', !!inspectorMeta,
    `name=${inspectorMeta.name} children=${inspectorMeta.children?.length} ` +
    `propsChildren=${propsField?.children?.length ?? 0}`);
  console.log('[behavior-script-deep] inspector metadata=', inspectorMeta);

  const tsForNumber = behaviorValueTypeToTypescript('number');
  const tsForEnum = behaviorValueTypeToTypescript({
    name: 'mode',
    type: 'enum',
    enum: [{ value: 'cw' }, { value: 'ccw' }],
  });
  record('behaviorValueTypeToTypescript()', true, `number→${tsForNumber} enum→${tsForEnum}`);
  console.log('[behavior-script-deep] ts types=', { number: tsForNumber, enum: tsForEnum });

  const typeHints = createBehaviorScriptTypeHints(spinnerScript.manifest!);
  record('createBehaviorScriptTypeHints()', !!typeHints,
    `propsType=${typeHints.propsTypeName} completions=${typeHints.completions.length}`);
  console.log('[behavior-script-deep] type hints declarations:\n' + typeHints.declarations);
  console.log('[behavior-script-deep] type hints completions count=', typeHints.completions.length);

  // ====================================================================
  // 10) 真正实例化 BehaviorScript Component → 接到 Game,屏幕上能看到色块旋转
  // ====================================================================
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: W, height: H, backgroundColor: '#0e1116' }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      behaviorSystem,
    ],
  });
  // @ts-ignore
  window.game = game;

  const spinner = new GameObject('spinner', { position: { x: W / 2, y: 320 } });
  spinner.addComponent(new Graphics());
  spinner.addComponent(
    new BehaviorScript<SpinnerProps>({
      scriptId: 'demo.spinner',
      props: dslBinding.props.props as SpinnerProps,
      source: dslBinding.props.source,
      enabled: dslBinding.props.enabled,
      priority: dslBinding.props.priority,
      groups: dslBinding.props.groups,
      pauseMode: dslBinding.props.pauseMode,
    }),
  );
  game.scene.addChild(spinner);

  const ccwSpinner = new GameObject('spinner-ccw', { position: { x: W / 2, y: 540 } });
  ccwSpinner.addComponent(new Graphics());
  ccwSpinner.addComponent(
    new BehaviorScript<SpinnerProps>({
      scriptId: 'demo.spinner',
      props: { speed: 3, color: '#ff8a4c', mode: 'ccw' },
      enabled: true,
      groups: ['spinners'],
    }),
  );
  game.scene.addChild(ccwSpinner);

  // ====================================================================
  // 渲染 overlay UI
  // ====================================================================
  const header = document.createElement('div');
  header.style.cssText = 'padding:10px 14px;background:rgba(8,12,18,0.85);color:#fafafa;font-size:13px;line-height:1.5;';
  header.textContent =
    'behavior-script-deep — 演示 @eva/plugin-behavior-script 的 Registry / Extension / Workflow / DSL binding / diagnostics / inspector / type-hints 全工具链。屏幕中央两个色块通过 BehaviorScript 在每帧旋转。';
  overlay.appendChild(header);

  const checklist = document.createElement('div');
  checklist.style.cssText =
    'margin:8px 14px;padding:10px 12px;background:rgba(8,12,18,0.78);border-radius:6px;max-width:430px;max-height:540px;overflow:auto;font-size:12px;';
  const okCount = entries.filter(e => e.ok).length;
  const title = document.createElement('div');
  title.style.cssText = 'font-weight:600;color:#fafafa;margin-bottom:6px;';
  title.textContent = `已演示 API (${okCount}/${entries.length} 通过):`;
  checklist.appendChild(title);
  for (const entry of entries) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;align-items:flex-start;padding:1px 0;';
    const mark = document.createElement('span');
    mark.textContent = entry.ok ? '✅' : '❌';
    mark.style.cssText = 'flex:0 0 16px;';
    const label = document.createElement('span');
    label.style.cssText = entry.ok ? 'color:#cdd5e0;' : 'color:#ff8080;';
    label.textContent = entry.api + (entry.detail ? `  — ${entry.detail}` : '');
    row.appendChild(mark);
    row.appendChild(label);
    checklist.appendChild(row);
  }
  overlay.appendChild(checklist);

  // codeFrame 显示在 overlay 底部 (用 <pre> 保留缩进)
  const frameBox = document.createElement('pre');
  frameBox.style.cssText =
    'margin:8px 14px;padding:10px 12px;background:rgba(8,12,18,0.92);color:#9aa3b2;font-size:11px;line-height:1.4;border-left:3px solid #ff6868;border-radius:4px;max-width:430px;overflow:auto;';
  frameBox.textContent = 'createBehaviorScriptDiagnostic() codeFrame:\n' + (diagnostic.codeFrame ?? '<no codeFrame>');
  overlay.appendChild(frameBox);

  console.log('[behavior-script-deep] init complete:', `${okCount}/${entries.length} API entries OK`);
}
