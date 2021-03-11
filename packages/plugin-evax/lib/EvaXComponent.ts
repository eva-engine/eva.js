import {Component, decorators} from '@eva/eva.js';
import EvaXSystem from './EvaXSystem';

interface Events {
  [propName: string]: Function & {
    deep: boolean;
    handler: Function;
  };
}

export interface EvaXParams {
  events: Events;
}

export default class EvaXComponent extends Component {
  static componentName: string = 'EvaX';
  constructor(gameObject) {
    super(gameObject);
  }
  evax: EvaXSystem;
  @decorators.IDEProp events: Events = {};
  init(option: EvaXParams = {events: {}}) {
    const {events} = option;
    this.events = events || {};
  }
}
