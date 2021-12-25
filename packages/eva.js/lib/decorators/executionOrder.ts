/**
 * Set the component priority, it decides at which order the life cycle functions of components will be invoked. Smaller priority get invoked before larger priority.
 * This will affect `start`, `onResume`, `onPause`,`update` and `lateUpdate`, but `onDestroy` won't be affected.
 * @param priority - The execution order of life cycle methods for Component. Smaller priority get invoked before larger priority.
 */
export function executionOrder(priority: number) {
  return function (constructor) {
    constructor._executionOrder = priority;
  };
}
