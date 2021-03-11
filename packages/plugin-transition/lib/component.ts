import Animation from './animation';
import {Component} from '@eva/eva.js';

interface AnimationStruct {
  name: string;
  component: Component;
  values: {
    time: number;
    value: number;
    tween?: string;
  }[];
}
interface GroupStruct {
  [propName: string]: AnimationStruct[];
}

export default class Transition extends Component {
  static componentName: string = 'Transition';
  private animations: {[propName: string]: Animation} = {};
  group: GroupStruct = {};
  init({group}: {group: any} = {group: {}}) {
    this.group = group;
  }
  awake() {
    for (const name in this.group) {
      this.newAnimation(name);
    }
  }
  play(name: string, iteration: number) {
    if (!name) {
      name = Object.keys(this.group)[0];
    }
    if (name && !this.animations[name] && this.group[name]) {
      this.newAnimation(name);
    }
    if (name && this.animations[name]) {
      this.animations[name].play(iteration);
    }
  }
  newAnimation(name) {
    const animation = new Animation(this.group[name]);
    animation.on('finish', () => this.emit('finish', name));
    this.animations[name] = animation;
  }
  stop(name) {
    if (!name) {
      for (const key in this.animations) {
        this.animations[key].stop();
      }
    } else {
      this.animations[name].stop();
    }
  }
  onDestroy() {
    for (const key in this.animations) {
      this.animations[key].destroy();
    }
    this.group = null;
    this.animations = null;
    this.removeAllListeners();
  }
}
