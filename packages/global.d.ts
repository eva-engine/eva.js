interface Window {
  __EVA_GAME_INSTANCE__?: import('@eva/eva.js').Game;
  __EVA_INSPECTOR_ENV__?: boolean;
}
declare const DEV: boolean;
declare const __DEV__: boolean;
declare const __TEST__: boolean;
// for tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R;
    toHaveBeenWarnedLast(): R;
    toHaveBeenWarnedTimes(n: number): R;
  }
}

declare module '@eva/inspector-decorator' {
  export interface ClassType<T = any> {
    new (...args: any): T;
  }

  export type TypeValue = ClassType | Function | object | symbol;
  export interface RecursiveArray<TValue> extends Array<RecursiveArray<TValue> | TValue> {}
  export type ReturnTypeFuncValue = TypeValue | RecursiveArray<TypeValue>;
  export type ReturnTypeFunc = (returns?: void) => ReturnTypeFuncValue;

  export interface FieldOptions {
    type?: string;
    min?: number;
    max?: number;
    step?: number;
    filter?(val: any): any;
    filters?: ((val: any) => any)[];
    [key: string]: any;
  }

  export interface FieldMetadata extends FieldOptions {
    name: string;
    type: string;
    children?: FieldMetadata[];
    isFolder?: boolean;
    isArray: boolean;
    addable?: boolean;
  }

  export function Field(): PropertyDecorator;
  export function Field(options: FieldOptions): PropertyDecorator;
  export function Field(returnTypeFunction?: ReturnTypeFunc): PropertyDecorator;
  export function Field(returnTypeFunction?: ReturnTypeFunc | FieldOptions, maybeOptions?: FieldOptions): PropertyDecorator;
  export function getPropertiesOf<T extends ClassType<any> & { componentName?: string }>(
    target: T,
    isRoot?: boolean,
  ): FieldMetadata;
  export function type(type: string): PropertyDecorator;
  export function step(step: number): PropertyDecorator;
  export const ExecuteInEditMode: ClassDecorator;
  export const shouldExecuteInEditMode: (target: ClassType) => boolean;
}
