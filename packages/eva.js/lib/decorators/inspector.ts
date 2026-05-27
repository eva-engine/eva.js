import 'reflect-metadata';
import {
  ExecuteInEditMode,
  Field,
  getPropertiesOf,
  shouldExecuteInEditMode,
  step,
  type,
} from '@eva/inspector-decorator';
import type { ClassType, FieldMetadata, FieldOptions } from '@eva/inspector-decorator';

type IDEProps = Record<
  string,
  {
    key: string;
    type?: unknown;
    step?: number;
    [key: string]: unknown;
  }
>;

/**
 * Backward-compatible alias for `Field`.
 */
function inspectorField(options: FieldOptions = {}): PropertyDecorator {
  return Field(options);
}

export {
  ExecuteInEditMode,
  Field,
  getPropertiesOf,
  inspectorField,
  shouldExecuteInEditMode,
  step,
  type,
};
export type { ClassType, FieldMetadata, FieldOptions, IDEProps };
