import { Component } from '../../eva.js/lib';
import type { ComponentParams, Transform } from '../../eva.js/lib';

export default class Test extends Component<ComponentParams> {
  static componentName = 'Test';
  readonly name = 'Test';

  size = [10, 10];
  style = { color: 'rgba(255, 255, 255)' };
  geomerty = { data: undefined };
  transform: Transform;

  start() {}

  onResume() {}

  update() {}

  onPause() {}

  lateUpdate() {}
}
