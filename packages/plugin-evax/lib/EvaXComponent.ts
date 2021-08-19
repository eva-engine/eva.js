import { Component } from '@eva/eva.js';
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

export default class EvaXComponent extends Component<EvaXParams> {
  static componentName: string = 'EvaX';
  constructor(gameObject) {
    super(gameObject);
  }
  evax: EvaXSystem;
  // @decorators.IDEProp 复杂编辑后续添加
  events: Events = {};
  init(option: EvaXParams = { events: {} }) {
    const { events } = option;
    this.events = events || {};
  }
}
