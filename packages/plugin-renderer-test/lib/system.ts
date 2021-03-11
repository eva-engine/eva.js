import {System} from '../../eva.js/lib';

export default class Test extends System {
  static systemName = 'Test';
  readonly name = 'Test';
  static observerInfo = {
    Test: [
      {prop: ['size'], deep: false},
      {prop: ['geomerty', 'data', 'vertex'], deep: true},
      {prop: ['style'], deep: true},
    ],
  };

  init() {}

  awake() {}

  start() {}

  onResume() {}

  onPause() {}

  onDestroy() {}

  update() {}

  lateUpdate() {}

  destroy() {}
}
