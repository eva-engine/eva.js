/**
 * Collect property which react in Editor, such as EVA Design
 * @param target - component instance
 * @param propertyKey - property name
 */
export function type(type) {
  return function (target, propertyKey) {
    console.log(propertyKey, type);
    if (!target.constructor.IDEProps) {
      target.constructor.IDEProps = [];
    }
    target.constructor.IDEProps.push({key: propertyKey, type: type});
  };
}

export function IDEProp(target, propertyKey) {
  // console.log(propertyKey, type);
  if (!target.constructor.IDEProps) {
    target.constructor.IDEProps = [];
  }
  target.constructor.IDEProps.push(propertyKey);
}
