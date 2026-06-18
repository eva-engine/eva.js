import { GameObject, OBSERVER_TYPE } from '@eva/eva.js';
import {
  Shape, UI, UISystem, PluginUiSystem, ShapeType, UIShapeType,
  Button, FancyButton, CheckBox, Switcher, RadioGroup,
  ProgressBar, CircularProgressBar, Slider, DoubleSlider,
  Input, List, ScrollBox, Select, Dialog, MaskedFrame,
} from '../lib';
import { COMPONENT_DEFINITIONS } from '../lib/components';
import { hasExplicitRenderSize } from '../lib/internal/size-sync';
import { resolveViewRef } from '../lib/internal/view-resolver';

describe('plugin-ui (v2 - 完整封装 @pixi/ui v2.x)', () => {
  describe('Shape component (基础形状,保留 Graphics 直绘)', () => {
    it('declares the canonical Eva component name "Shape"', () => {
      expect(Shape.componentName).toBe('Shape');
    });

    it('keeps UI as a legacy TypeScript export alias', () => {
      expect(UI).toBe(Shape);
      expect(UI.componentName).toBe('Shape');
      expect(UIShapeType).toBe(ShapeType);
    });

    it('exposes inspector metadata for editor consumption', () => {
      const meta = Shape.getInspectorMetadata();
      expect(meta.name).toBe('Shape');
      expect(meta.isFolder).toBe(true);
      const childNames = (meta.children ?? []).map((c) => c.name);
      expect(childNames).toEqual(expect.arrayContaining(['componentName', 'shapes', 'type', 'style']));
    });

    it('keeps shapes empty until init() receives params', () => {
      const shape = new Shape();
      expect(shape.getShapeCount()).toBe(0);
    });

    it('init() with single type+style folds into a one-shape array', () => {
      const shapeComponent = new Shape();
      shapeComponent.init({
        type: ShapeType.ROUNDED_RECT,
        style: { width: 200, height: 80, radius: 16, fill: '#FF0000' },
      });
      expect(shapeComponent.getShapeCount()).toBe(1);
      const shape = shapeComponent.getShape(0) as any;
      expect(shape?.type).toBe(ShapeType.ROUNDED_RECT);
      expect((shape?.style as any).fill).toBe('#FF0000');
    });
  });

  describe('UISystem (单一 system 驱动 16 组件)', () => {
    it('declares the canonical Eva system name "UISystem"', () => {
      expect(UISystem.systemName).toBe('UISystem');
    });

    it('PluginUiSystem alias resolves to the same UISystem class', () => {
      expect(PluginUiSystem).toBe(UISystem);
    });

    it('can be instantiated', () => {
      const sys = new UISystem();
      expect(sys.name).toBe('UISystem');
    });

    it('syncs Transform.size changes to plugin-ui wrapper runtime instances', () => {
      const sys: any = new UISystem();
      const go = new GameObject('button', { size: { width: 120, height: 40 } });
      const instance = {
        width: 10,
        height: 10,
        setSize: jest.fn(function setSize(this: any, width: number, height: number) {
          this.width = width;
          this.height = height;
        }),
      };
      sys.instances.set('FancyButton', new Map([[go.id, instance]]));

      go.transform.size.width = 240;
      go.transform.size.height = 64;
      sys.componentChanged(makeTransformSizeChange(go));

      expect(instance.setSize).toHaveBeenCalledWith(240, 64);
      expect(instance.width).toBe(240);
      expect(instance.height).toBe(64);
    });

    it('does not route Transform.size changes through the Shape redraw path', () => {
      const sys: any = new UISystem();
      const go = new GameObject('shape', { size: { width: 100, height: 40 } });
      const shape = go.addComponent(new Shape());
      shape.redraw = jest.fn();

      go.transform.size.width = 180;
      go.transform.size.height = 80;
      sys.componentChanged(makeTransformSizeChange(go));

      expect(shape.redraw).not.toHaveBeenCalled();
    });

    it('relayouts List and ScrollBox when any observed Transform.size changes', () => {
      const sys: any = new UISystem();
      const go = new GameObject('item', { size: { width: 100, height: 30 } });
      const list = { arrangeChildren: jest.fn() };
      const scrollBox = {
        list: { arrangeChildren: jest.fn() },
        resize: jest.fn(),
      };
      sys.instances.set('List', new Map([[1, list]]));
      sys.instances.set('ScrollBox', new Map([[2, scrollBox]]));

      go.transform.size.width = 160;
      sys.componentChanged(makeTransformSizeChange(go));

      expect(list.arrangeChildren).toHaveBeenCalled();
      expect(scrollBox.list.arrangeChildren).toHaveBeenCalled();
      expect(scrollBox.resize).toHaveBeenCalledWith(true);
    });
  });

  describe('@pixi/ui 全部 15 个 wrapper component name 正确', () => {
    it.each([
      ['Button', Button],
      ['FancyButton', FancyButton],
      ['CheckBox', CheckBox],
      ['Switcher', Switcher],
      ['RadioGroup', RadioGroup],
      ['ProgressBar', ProgressBar],
      ['CircularProgressBar', CircularProgressBar],
      ['Slider', Slider],
      ['DoubleSlider', DoubleSlider],
      ['Input', Input],
      ['List', List],
      ['ScrollBox', ScrollBox],
      ['Select', Select],
      ['Dialog', Dialog],
      ['MaskedFrame', MaskedFrame],
    ])('%s.componentName === %s', (name, Cls: any) => {
      expect(Cls.componentName).toBe(name);
    });
  });

  describe('Button', () => {
    it('init() applies enabled / view', () => {
      const c = new Button();
      c.init({ enabled: false, view: { color: 0xff0000, width: 80, height: 32 } });
      expect(c.enabled).toBe(false);
      expect(c.view).toBeDefined();
    });

    it('tracks all signals used by the @pixi/ui Button graphics story', () => {
      const c: any = new Button();
      const signalMap = COMPONENT_DEFINITIONS.Button.signalMap?.(c) ?? {};

      (signalMap.down as Function)();
      expect(c.downCount).toBe(1);
      expect(c.visualState).toBe('pressed');
      expect(c.lastSignal).toBe('down');

      (signalMap.hover as Function)();
      expect(c.hoverCount).toBe(1);
      expect(c.visualState).toBe('hover');

      (signalMap.up as Function)();
      expect(c.upCount).toBe(1);
      expect(c.visualState).toBe('default');

      (signalMap.out as Function)();
      expect(c.outCount).toBe(1);
      expect(c.visualState).toBe('default');

      (signalMap.upOut as Function)();
      expect(c.upOutCount).toBe(1);
      expect(c.lastSignal).toBe('upOut');

      (signalMap.press as Function)();
      expect(c.pressCount).toBe(1);
      expect(c.visualState).toBe('default');
    });
  });

  describe('FancyButton', () => {
    it('init() applies 4 state views + selectedTint', () => {
      const c = new FancyButton();
      c.init({
        enabled: false, text: 'Click', selectedTint: '#FF00FF',
        views: { default: { color: 0xff0000, width: 80, height: 32 } },
      });
      expect(c.enabled).toBe(false);
      expect(c.text).toBe('Click');
      expect(c.selectedTint).toBe('#FF00FF');
      expect(c.views.default).toBeDefined();
    });

    it('init() keeps @pixi/ui story options for icon, text fitting, animation, and nine-slice sizing', () => {
      const c: any = new FancyButton();
      c.init({
        text: 'Click me',
        textStyle: { fill: '#FFFFFF', fontSize: 40 },
        textClass: 'bitmap',
        bitmapFontName: 'TitleFont',
        views: {
          default: { texture: 'button.png' },
          hover: { texture: 'button_hover.png' },
          pressed: { texture: 'button_pressed.png' },
          disabled: { texture: 'button_disabled.png' },
          icon: { texture: 'avatar-01.png' },
        },
        padding: 11,
        textOffset: { x: 30, y: -5 },
        iconOffset: { x: -100, y: -7 },
        defaultTextScale: 0.99,
        defaultIconScale: 0.2,
        defaultTextAnchor: { x: 0.5, y: 0.5 },
        defaultIconAnchor: { x: 0.5, y: 0.5 },
        anchorX: 0.5,
        anchorY: 0.5,
        nineSliceSprite: [25, 20, 25, 20],
        contentFittingMode: 'default',
        ignoreRefitting: true,
        width: 300,
        height: 137,
        animations: { pressed: { props: { y: 10 }, duration: 100 } },
      });
      expect(c.views.icon.texture).toBe('avatar-01.png');
      expect(c.textStyle.fontSize).toBe(40);
      expect(c.textClass).toBe('bitmap');
      expect(c.bitmapFontName).toBe('TitleFont');
      expect(c.iconOffset.x).toBe(-100);
      expect(c.defaultIconScale).toBe(0.2);
      expect(c.nineSliceSprite).toEqual([25, 20, 25, 20]);
      expect(c.contentFittingMode).toBe('default');
      expect(c.ignoreRefitting).toBe(true);
      expect(c.width).toBe(300);
      expect(c.height).toBe(137);
      expect(c.animations.pressed.duration).toBe(100);
    });
  });

  describe('CheckBox', () => {
    it('init() applies enabled/checked/text/views', () => {
      const c = new CheckBox();
      c.init({ enabled: true, checked: true, text: '记住我', views: {
        checked: { color: 0x22c55e, width: 24, height: 24 },
        unchecked: { color: 0x999999, width: 24, height: 24 },
      }, textStyle: { fill: '#FFFFFF', fontSize: 22 }, textOffset: { x: 2, y: -1 } });
      expect(c.checked).toBe(true);
      expect(c.text).toBe('记住我');
      expect(c.views.checked).toBeDefined();
      expect(c.textStyle.fontSize).toBe(22);
      expect(c.textOffset.y).toBe(-1);
    });

    it('syncOnChange updates label style without rebuilding switcher views', () => {
      let currentStyle = {
        unchecked: {},
        checked: {},
        text: { fill: '#ffffff', fontSize: 18 },
        textOffset: { x: 0, y: 0 },
      };
      const inst: any = {
        _style: currentStyle,
        checked: true,
        text: 'Radio 1',
        labelText: { style: currentStyle.text },
        alignText: jest.fn(),
        get style() { return this._style; },
        set style(next) {
          this._style = next;
          throw new Error('View with id 1 does not exist.');
        },
      };

      expect(() => {
        COMPONENT_DEFINITIONS.CheckBox.syncOnChange?.(inst, {
          checked: true,
          text: 'Radio 1',
          textStyle: { fill: '#f8fafc', fontSize: 22 },
          textOffset: { x: 4, y: 1 },
        });
      }).not.toThrow();

      expect(inst.checked).toBe(true);
      expect(inst.style.textOffset).toEqual({ x: 4, y: 1 });
      expect((inst.labelText?.style as any).fontSize).toBe(22);
      expect(inst.alignText).toHaveBeenCalled();
    });
  });

  describe('Switcher', () => {
    it('init() applies active / triggerEvent / views', () => {
      const c = new Switcher();
      c.init({
        active: 1, triggerEvent: ['onPress', 'onHover', 'onOut'],
        views: [{ color: 0x111, width: 40, height: 20 }, { color: 0xeee, width: 40, height: 20 }],
      });
      expect(c.active).toBe(1);
      expect(c.triggerEvent).toEqual(['onPress', 'onHover', 'onOut']);
      expect(c.views.length).toBe(2);
    });
  });

  describe('RadioGroup', () => {
    it('init() applies selectedId / direction', () => {
      const c = new RadioGroup();
      c.init({ selectedId: 'b', direction: 'horizontal', elementsMargin: 8 });
      expect(c.selectedId).toBe('b');
      expect(c.direction).toBe('horizontal');
      expect(c.elementsMargin).toBe(8);
    });
  });

  describe('ProgressBar', () => {
    it('getProgressPct normalizes value via valueRange', () => {
      const pb = new ProgressBar();
      pb.init({ value: 25, valueRange: [0, 100] });
      expect(pb.getProgressPct()).toBe(25);

      pb.init({ value: 50, valueRange: [0, 200] });
      expect(pb.getProgressPct()).toBe(25);
    });

    it('keeps declarative nine-slice sizing props used by @pixi/ui stories', () => {
      const pb: any = new ProgressBar();
      pb.init({
        bgView: { texture: 'slider_bg.png' },
        fillView: { texture: 'slider_progress.png' },
        nineSliceSprite: { bg: [44, 20, 44, 19], fill: [34, 16, 34, 15] },
        fillPaddings: { top: 4, right: 0, bottom: 4, left: 0 },
        width: 490,
        height: 38,
      });
      expect(pb.bgView.texture).toBe('slider_bg.png');
      expect(pb.nineSliceSprite.bg).toEqual([44, 20, 44, 19]);
      expect(pb.fillPaddings.top).toBe(4);
      expect(pb.width).toBe(490);
      expect(pb.height).toBe(38);
    });
  });

  describe('CircularProgressBar', () => {
    it('init() applies radius/lineWidth/colors/cap/offset', () => {
      const c = new CircularProgressBar();
      c.init({
        radius: 40,
        lineWidth: 8,
        fillColor: '#22c55e',
        backgroundColor: '#1f2937',
        cap: 'round',
        rotation: 19.2,
        offset: { x: 0.5, y: 1 },
      });
      expect(c.radius).toBe(40);
      expect(c.lineWidth).toBe(8);
      expect(c.cap).toBe('round');
      expect(c.rotation).toBe(19.2);
      expect(c.offset.x).toBe(0.5);
      expect(c.offset.y).toBe(1);
    });
    it('getProgressPct same as ProgressBar', () => {
      const c = new CircularProgressBar();
      c.init({ value: 75, valueRange: [0, 100] });
      expect(c.getProgressPct()).toBe(75);
    });
  });

  describe('Slider', () => {
    it('init() applies value/min/max/step/orientation/views', () => {
      const c = new Slider();
      c.init({ value: 50, min: 0, max: 100, step: 5, orientation: 'horizontal', views: {
        bg: { color: 0x222, width: 200, height: 8 },
        fill: { color: 0x0bf, width: 200, height: 8 },
        thumb: { color: 0xfff, width: 16, height: 16, radius: 8 },
      } });
      expect(c.value).toBe(50);
      expect(c.step).toBe(5);
      expect(c.views.thumb).toBeDefined();
    });

    it('init() applies @pixi/ui story sizing, nine-slice, and value text options', () => {
      const c: any = new Slider();
      c.init({
        value: 50,
        width: 500,
        height: 38,
        showValue: true,
        nineSliceSprite: { bg: [44, 20, 44, 19], fill: [34, 16, 34, 15] },
        fillPaddings: { top: 4, right: 0, bottom: 4, left: 0 },
        valueTextStyle: { fill: '#FFFFFF', fontSize: 20 },
        valueTextOffset: { y: -40 },
      });
      expect(c.width).toBe(500);
      expect(c.height).toBe(38);
      expect(c.nineSliceSprite.fill).toEqual([34, 16, 34, 15]);
      expect(c.valueTextStyle.fontSize).toBe(20);
      expect(c.valueTextOffset.y).toBe(-40);
    });

    it('passes texture refs through as @pixi/ui texture views', () => {
      const c: any = new Slider();
      c.init({
        views: {
          bg: { texture: 'slider_bg.png' },
          fill: { texture: 'slider_progress.png' },
          thumb: { texture: 'radio_checked.png' },
        },
      });
      const options = COMPONENT_DEFINITIONS.Slider.optionsBuilder(c, {
        object: { bg: {}, fill: {}, thumb: {} },
      } as any) as any;
      expect(options.bg).toBeDefined();
      expect(options.fill).toBeDefined();
      expect(options.slider).toBeDefined();
      expect(typeof options.bg).not.toBe('string');
      expect(typeof options.fill).not.toBe('string');
      expect(typeof options.slider).not.toBe('string');
    });
  });

  describe('DoubleSlider', () => {
    it('init() applies value1/value2/min/max', () => {
      const c = new DoubleSlider();
      c.init({ value1: 25, value2: 75, min: 0, max: 100 });
      expect(c.value1).toBe(25);
      expect(c.value2).toBe(75);
    });

    it('init() applies @pixi/ui double slider story options', () => {
      const c: any = new DoubleSlider();
      c.init({
        value1: 15,
        value2: 85,
        step: 5,
        width: 500,
        height: 38,
        showValue: true,
        nineSliceSprite: { bg: [44, 20, 44, 19], fill: [34, 16, 34, 15] },
        fillPaddings: { top: 4, right: 0, bottom: 4, left: 0 },
        valueTextStyle: { fill: '#FFFFFF', fontSize: 20 },
        valueTextOffset: { y: -40 },
      });
      expect(c.value1).toBe(15);
      expect(c.value2).toBe(85);
      expect(c.step).toBe(5);
      expect(c.width).toBe(500);
      expect(c.height).toBe(38);
      expect(c.fillPaddings.bottom).toBe(4);
    });

    it('passes texture refs through as @pixi/ui texture views', () => {
      const c: any = new DoubleSlider();
      c.init({
        views: {
          bg: { texture: 'slider_bg.png' },
          fill: { texture: 'slider_progress.png' },
          slider1: { texture: 'radio_checked.png' },
          slider2: { texture: 'radio_checked.png' },
        },
      });
      const options = COMPONENT_DEFINITIONS.DoubleSlider.optionsBuilder(c, {
        object: { bg: {}, fill: {}, slider1: {}, slider2: {} },
      } as any) as any;
      expect(options.bg).toBeDefined();
      expect(options.fill).toBeDefined();
      expect(options.slider1).toBeDefined();
      expect(options.slider2).toBeDefined();
      expect(typeof options.bg).not.toBe('string');
      expect(typeof options.fill).not.toBe('string');
      expect(typeof options.slider1).not.toBe('string');
      expect(typeof options.slider2).not.toBe('string');
    });
  });

  describe('Input', () => {
    it('init() applies value/placeholder/secure/textStyle', () => {
      const c = new Input();
      c.init({ value: 'hello', placeholder: 'name', secure: true, textStyle: { fontSize: 18 }, width: 320, height: 80 });
      expect(c.value).toBe('hello');
      expect(c.placeholder).toBe('name');
      expect(c.secure).toBe(true);
      expect(c.textStyle.fontSize).toBe(18);
      expect(c.width).toBe(320);
      expect(c.height).toBe(80);
    });
  });

  describe('List', () => {
    it('init() applies type / elementsMargin / padding', () => {
      const c = new List();
      c.init({ type: 'horizontal', elementsMargin: 12, padding: 8 });
      expect(c.type).toBe('horizontal');
      expect(c.elementsMargin).toBe(12);
      expect(c.padding).toBe(8);
    });
  });

  describe('ScrollBox', () => {
    it('init() applies width/height/direction/background', () => {
      const c = new ScrollBox();
      c.init({
        width: 300,
        height: 200,
        direction: 'vertical',
        background: 0x111111,
        radius: 6,
        vertPadding: 4,
        horPadding: 8,
        topPadding: 10,
        rightPadding: 12,
        globalScroll: false,
        shiftScroll: true,
        proximityRange: 100,
        proximityDebounce: 10,
      });
      expect(c.width).toBe(300);
      expect(c.direction).toBe('vertical');
      expect(c.vertPadding).toBe(4);
      expect(c.horPadding).toBe(8);
      expect(c.topPadding).toBe(10);
      expect(c.rightPadding).toBe(12);
      expect(c.globalScroll).toBe(false);
      expect(c.shiftScroll).toBe(true);
      expect(c.proximityRange).toBe(100);
      expect(c.proximityDebounce).toBe(10);
    });

    it('tracks explicit width/height params separately from metadata defaults', () => {
      const defaultSized = new ScrollBox() as any;
      expect(defaultSized.width).toBe(320);
      expect(defaultSized.height).toBe(240);
      expect(hasExplicitRenderSize(defaultSized)).toBe(false);

      const explicit = new ScrollBox() as any;
      explicit.init({ width: 300, height: 200 });
      expect(hasExplicitRenderSize(explicit)).toBe(true);
    });
  });

  describe('Select', () => {
    it('init() applies items / selectedIndex', () => {
      const c = new Select();
      c.init({
        items: [{ text: 'A' }, { text: 'B' }],
        selectedIndex: 1,
        width: 250,
        height: 50,
        radius: 15,
        visibleItems: 5,
        itemBackgroundColor: '#e91e63',
        itemHoverColor: '#ff729a',
        textClass: 'html',
        open: true,
      });
      expect(c.items.length).toBe(2);
      expect(c.selectedIndex).toBe(1);
      expect(c.width).toBe(250);
      expect(c.visibleItems).toBe(5);
      expect(c.itemHoverColor).toBe('#ff729a');
      expect(c.textClass).toBe('html');
      expect(c.open).toBe(true);
    });
  });

  describe('Dialog', () => {
    it('init() applies open/title/backdropAlpha/closeOnBackdropClick', () => {
      const c = new Dialog();
      c.init({
        open: true,
        title: 'Hello',
        titleStyle: { fill: '#FFFFFF', fontSize: 24 },
        content: 'Body',
        contentStyle: { fill: '#FFFFFF', fontSize: 16, wordWrap: true },
        contentButtons: [{ text: 'A', width: 60, height: 60, color: '#e91e63' }],
        contentCheckBoxes: [{ text: 'A', size: 30, uncheckedColor: '#3e3f40', checkedColor: '#e91e63' }],
        buttons: [{ kind: 'button', text: 'OK', width: 120, height: 44, color: '#e91e63' }],
        buttonList: { elementsMargin: 40 },
        buttonListOffset: { y: -1 },
        scrollBox: { elementsMargin: 10, padding: 10, offset: { y: 1 }, size: { height: 190 } },
        animations: { open: { props: {}, duration: 300 } },
        backdropAlpha: 0.7,
        closeOnBackdropClick: false,
      });
      expect(c.open).toBe(true);
      expect(c.title).toBe('Hello');
      expect(c.content).toBe('Body');
      expect(c.titleStyle.fontSize).toBe(24);
      expect(c.contentButtons[0].text).toBe('A');
      expect(c.contentCheckBoxes[0].size).toBe(30);
      expect(c.buttons[0].text).toBe('OK');
      expect(c.buttons[0].kind).toBe('button');
      expect(c.buttonList.elementsMargin).toBe(40);
      expect(c.buttonListOffset.y).toBe(-1);
      expect(c.scrollBox.padding).toBe(10);
      expect(c.scrollBox.offset.y).toBe(1);
      expect(c.scrollBox.size.height).toBe(190);
      expect(c.animations.open.duration).toBe(300);
      expect(c.backdropAlpha).toBe(0.7);
      expect(c.closeOnBackdropClick).toBe(false);
    });

    it('applySize lays out internals without scaling the backdrop-sized root container', () => {
      const inst: any = {
        width: 10000,
        height: 10000,
        options: { padding: 20 },
        innerView: {
          width: 1,
          height: 1,
          pivot: { set: jest.fn() },
        },
        contentView: { x: 0, y: 0 },
        titleText: { width: 100, height: 24, x: 0, y: 0 },
        buttonContainer: { width: 120, height: 44, x: 0, y: 0 },
        scrollBox: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          setSize: jest.fn(function setSize(this: any, width: number, height: number) {
            this.width = width;
            this.height = height;
          }),
          resize: jest.fn(),
        },
      };

      COMPONENT_DEFINITIONS.Dialog.applySize?.(inst, { width: 320, height: 250 }, { padding: 20 }, {
        componentName: 'Dialog',
        source: 'initial-transform',
      } as any);

      expect(inst.width).toBe(10000);
      expect(inst.height).toBe(10000);
      expect(inst.options.width).toBe(320);
      expect(inst.options.height).toBe(250);
      expect(inst.innerView.width).toBe(320);
      expect(inst.innerView.height).toBe(250);
      expect(inst.innerView.pivot.set).toHaveBeenCalledWith(160, 125);
      expect(inst.titleText.x).toBe(160);
      expect(inst.buttonContainer.x).toBe(100);
      expect(inst.buttonContainer.y).toBe(186);
      expect(inst.scrollBox.x).toBe(20);
      expect(inst.scrollBox.y).toBe(44);
      expect(inst.scrollBox.setSize).toHaveBeenCalledWith(280, 142);
    });

    it('wires contentButtons so letter selections emit and close the dialog', () => {
      const pressHandlers: Function[] = [];
      const button = {
        onPress: {
          connect: jest.fn((handler: Function) => {
            pressHandlers.push(handler);
            return { disconnect: jest.fn() };
          }),
        },
      };
      const inst: any = {
        close: jest.fn(),
        open: jest.fn(),
      };
      const component: any = {
        selectCount: 0,
        lastSignal: 'idle',
        __dialogContentButtons: [
          { button, params: { text: 'A', value: 'A', closeOnPress: true }, index: 0 },
        ],
      };
      const go = { name: 'letters', emit: jest.fn() };

      COMPONENT_DEFINITIONS.Dialog.onAttachedExtra?.(inst, component, go, null);
      pressHandlers[0]();

      expect(component.selectedContentIndex).toBe(0);
      expect(component.selectedContentValue).toBe('A');
      expect(component.selectCount).toBe(1);
      expect(component.lastSignal).toBe('select');
      expect(inst.close).toHaveBeenCalled();
      expect(go.emit).toHaveBeenCalledWith('select', expect.objectContaining({ index: 0, value: 'A' }));
      expect(go.emit).toHaveBeenCalledWith('dialog:select', expect.objectContaining({ index: 0, value: 'A' }));
    });
  });

  describe('MaskedFrame', () => {
    it('init() applies targetView / maskView', () => {
      const c = new MaskedFrame();
      c.init({
        targetView: { color: 0xff0000, width: 100, height: 100 },
        maskView: { color: 0xffffff, width: 80, height: 80, radius: 40 },
        borderWidth: 10,
        borderColor: '#FFFFFF',
      });
      expect(c.targetView).toBeDefined();
      expect(c.maskView).toBeDefined();
      expect(c.borderWidth).toBe(10);
      expect(c.borderColor).toBe('#FFFFFF');
    });

    it('inline Shape mask views expose clone() for @pixi/ui border rendering', () => {
      const host = new GameObject('host');
      const mask = resolveViewRef(undefined, host, {
        shape: { type: 'circle', style: { radius: 20, fill: 0x000000 } },
      }) as any;
      expect(typeof mask.clone).toBe('function');
      expect(mask.clone()).toBeDefined();
    });
  });
});

function makeTransformSizeChange(go: GameObject): any {
  return {
    componentName: 'Transform',
    component: go.transform,
    gameObject: go,
    type: OBSERVER_TYPE.CHANGE,
    prop: { prop: ['size'], deep: true },
  };
}
