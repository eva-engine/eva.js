import type { BehaviorScriptDiagnostic, BehaviorScriptPhase, BehaviorScriptSource } from './types';

export interface BehaviorScriptDiagnosticOptions {
  scriptId: string;
  phase: BehaviorScriptPhase;
  message: string;
  stack?: string;
  timestamp: number;
  gameObjectName?: string;
  registrySourceUri?: string;
  componentSource?: BehaviorScriptSource;
  error?: any;
}

export interface BehaviorScriptStackLocation {
  uri?: string;
  line?: number;
  column?: number;
}

export function createBehaviorScriptDiagnostic(options: BehaviorScriptDiagnosticOptions): BehaviorScriptDiagnostic {
  const source = resolveBehaviorScriptDiagnosticSource({
    registrySourceUri: options.registrySourceUri,
    componentSource: options.componentSource,
    error: options.error,
    stack: options.stack,
  });
  const diagnostic: BehaviorScriptDiagnostic = {
    id: '',
    severity: 'error',
    scriptId: options.scriptId,
    phase: options.phase,
    message: options.message,
    stack: options.stack,
    timestamp: options.timestamp,
    gameObjectName: options.gameObjectName,
    componentName: 'BehaviorScript',
    source,
  };
  const codeFrame = createBehaviorScriptCodeFrame(source);

  if (codeFrame) {
    diagnostic.codeFrame = codeFrame;
  }

  return diagnostic;
}

export function resolveBehaviorScriptDiagnosticSource(options: {
  registrySourceUri?: string;
  componentSource?: BehaviorScriptSource;
  error?: any;
  stack?: string;
}): BehaviorScriptSource {
  const componentSource = options.componentSource ?? {};
  const errorSource = extractErrorSource(options.error);
  const preferredUri = componentSource.uri ?? options.registrySourceUri ?? errorSource.uri;
  const stackLocation = parseBehaviorScriptStackLocation(options.stack, preferredUri);
  const source: BehaviorScriptSource = {
    ...(options.registrySourceUri ? { uri: options.registrySourceUri } : {}),
    ...componentSource,
    ...errorSource,
  };

  if (!source.uri && stackLocation.uri) source.uri = stackLocation.uri;
  source.line = options.error?.line ?? stackLocation.line ?? errorSource.line ?? componentSource.line;
  source.column = options.error?.column ?? stackLocation.column ?? errorSource.column ?? componentSource.column;

  return source;
}

export function parseBehaviorScriptStackLocation(
  stack: string | undefined,
  preferredUri?: string,
): BehaviorScriptStackLocation {
  if (!stack) return {};

  const matches: BehaviorScriptStackLocation[] = [];
  for (const line of stack.split('\n')) {
    const location = parseStackLine(line);
    if (!location.uri) continue;
    matches.push(location);
  }

  if (!matches.length) return {};
  if (preferredUri) {
    const match = matches.find(location => location.uri === preferredUri || location.uri?.includes(preferredUri));
    return match ?? {};
  }
  return matches[0];
}

export function createBehaviorScriptCodeFrame(source?: BehaviorScriptSource): string | undefined {
  if (!source?.content || !source.line) return;

  const lines = source.content.split(/\r?\n/);
  const line = clamp(Math.floor(source.line), 1, lines.length);
  const column = Math.max(1, Math.floor(source.column ?? 1));
  const start = Math.max(1, line - 1);
  const end = Math.min(lines.length, line + 1);
  const width = String(end).length;
  const frame: string[] = [];

  for (let current = start; current <= end; current += 1) {
    const marker = current === line ? '>' : ' ';
    frame.push(`${marker} ${String(current).padStart(width, ' ')} | ${lines[current - 1]}`);
    if (current === line) {
      frame.push(`  ${''.padStart(width, ' ')} | ${''.padStart(column - 1, ' ')}^`);
    }
  }

  return frame.join('\n');
}

function parseStackLine(line: string): BehaviorScriptStackLocation {
  const trimmed = line.trim();
  const parenMatch = /\((.+):(\d+):(\d+)\)$/.exec(trimmed);
  const bareMatch = /at (.+):(\d+):(\d+)$/.exec(trimmed);
  const match = parenMatch ?? bareMatch;
  if (!match) return {};

  return {
    uri: match[1],
    line: Number(match[2]),
    column: Number(match[3]),
  };
}

function extractErrorSource(error: any): BehaviorScriptSource {
  const source = error?.source;
  if (!source || typeof source !== 'object') return {};
  return source;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
