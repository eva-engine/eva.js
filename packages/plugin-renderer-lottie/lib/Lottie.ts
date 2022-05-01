import { Component } from '@eva/eva.js';
import { IExpandOpts, IOptions } from './types';
import { Sprite, Text, TextStyle, Graphics } from 'pixi.js';
import { Field } from '@eva/inspector-decorator';

interface ExtendOptions extends IOptions {
  autoStart: boolean;
}

export default class Lottie extends Component {
  // @decorators.IDEProp 复杂编辑后续添加
  slot: { [key: string]: string };

  static componentName: string = 'Lottie';

  @Field({ type: 'resource', required: true })
  public resource: string;
  public anim: any;
  public options: ExtendOptions;
  public loadStatus: boolean = false;
  public firstPlay: () => void | null = null;
  // public slotCache: { [key: string]: any };
  public prevSlot: { [name: string]: any } = {};
  public currentSlot: { [name: string]: any } = {};

  constructor(options: IOptions) {
    super();
    this.options = {
      autoStart: false,
      ...options,
    };
    this.on('success', () => {
      this.loadStatus = true;
      const { ip, op } = this.anim.keyframes;
      for (let i = ip; i <= op; i++) {
        const event = `@${i}`;
        this.anim.on(event, e => this.emit(event, e));
      }
      this.firstPlay && this.firstPlay();
    });
  }

  play(
    params: number[] = [],
    expandOpts: IExpandOpts = {
      repeats: 0,
    },
  ) {
    if (!this.loadStatus) {
      this.firstPlay = () => {
        this.play(params, expandOpts);
      };
      return;
    }

    const { slot = [] } = expandOpts;
    slot.forEach(({ name, type, value, style = {} }) => {
      const { x, y, anchor = { x: 0, y: 0 }, pivot = { x: 0, y: 0 }, width, height } = style;
      if (type === 'IMAGE') {
        this.currentSlot[name] = Sprite.from(value);
      } else if (type === 'TEXT') {
        this.currentSlot[name] = new Text(value, new TextStyle(style));
      }
      if (x) this.currentSlot[name].x = x;
      if (y) this.currentSlot[name].y = y;
      if (width) this.currentSlot[name].width = width;
      if (height) this.currentSlot[name].height = height;
      this.currentSlot[name].anchor.set(anchor.x || 0, anchor.y || 0);
      this.currentSlot[name].pivot.set(
        this.currentSlot[name].width * (pivot.x || 0),
        this.currentSlot[name].height * (pivot.y || 0),
      );
      if (this.prevSlot[name]) this.anim.unbindSlot(name, this.prevSlot[name]);
      this.anim.bindSlot(name, this.currentSlot[name]);
      this.prevSlot[name] = this.currentSlot[name];
    });

    this.anim.playSegment(this.playParamsHandle(params), expandOpts);
  }

  playParamsHandle(params) {
    let p = [].concat(params);
    const { keyframes } = this.anim;
    if (!p.length || p.length > 2) {
      p = [keyframes.ip, keyframes.op];
    } else if (p.length === 1) {
      p = [p[0] % keyframes.op, keyframes.op];
    }
    return p;
  }

  onTap(name, callback) {
    const g = new Graphics();
    this.on('success', () => {
      const ele = this.anim.querySelector(name);
      const display = ele.display;
      g.beginFill(0xffffff);
      g.drawRect(0, 0, 100, 100);
      g.endFill();
      g.alpha = 0;
      display.addChild(g);
      ele.display.interactive = true;
      ele.display.on('pointertap', () => {
        callback();
      });
    });
  }
}
