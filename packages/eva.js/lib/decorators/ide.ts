/**
 * Collect property which react in Editor, such as EVA Design
 * @param target - component instance
 * @param propertyKey - property name
 */
export function IDEProp(target, propertyKey) {
  if (!target.constructor.IDEProps) {
    target.constructor.IDEProps = [];
  }
  target.constructor.IDEProps.push(propertyKey);
}
