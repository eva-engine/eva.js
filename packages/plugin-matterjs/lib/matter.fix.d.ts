declare namespace Matter {
  interface IRunnerOptions {
    fps?: number;
    deltaSampleSize?: number;
  }
  interface IRendererOptions {
    pixelRatio?: number;
    showAngleIndicator?: boolean;
  }

  // 以下声明用于补齐 ts-jest 在没有装 @types/matter-js 时缺失的 Matter 命名空间成员。
  // 这些类型仅供编译期类型解析,运行时实际从 ./matter (webpack bundle) 取值,
  // 因此用 any 占位即可,不会影响 IIFE 行为。
  type Body = any;
  type Engine = any;
  type Runner = any;
  type Render = any;
  type World = any;
  type Composite = any;
  type Constraint = any;
  type MouseConstraint = any;
  type Mouse = any;
  type Events = any;
  type Bodies = any;
  type IPair = any;
  type IWorldDefinition = any;
  type IEngineDefinition = any;
}
