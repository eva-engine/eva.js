import {Component} from '../../eva.js/lib';

export default class Test extends Component {
  static componentName = 'Test';
  readonly name = 'Test';
  public size = [10, 10];
  public style = {color: 'rgba(255, 255, 255)'};
  public geomerty = {data: undefined};

  start() {}

  onResume() {}

  update() {}

  onPause() {}

  lateUpdate() {}
}
