import {
  UI, UISystem, PluginUiSystem, UIShapeType,
  Button, FancyButton, CheckBox, Switcher, RadioGroup,
  ProgressBar, CircularProgressBar, Slider, DoubleSlider,
  Input, List, ScrollBox, Select, Dialog, MaskedFrame,
} from '../lib';

describe('plugin-ui (v2 - 完整封装 @pixi/ui v2.x)', () => {
  describe('UI component (基础形状,保留 Graphics 直绘)', () => {
    it('declares the canonical Eva component name "UI"', () => {
      expect(UI.componentName).toBe('UI');
    });

    it('exposes inspector metadata for editor consumption', () => {
      const meta = UI.getInspectorMetadata();
      expect(meta.name).toBe('UI');
      expect(meta.isFolder).toBe(true);
      const childNames = (meta.children ?? []).map((c) => c.name);
      expect(childNames).toEqual(expect.arrayContaining(['componentName', 'shapes', 'type', 'style']));
    });

    it('keeps shapes empty until init() receives params', () => {
      const ui = new UI();
      expect(ui.getShapeCount()).toBe(0);
    });

    it('init() with single type+style folds into a one-shape array', () => {
      const ui = new UI();
      ui.init({
        type: UIShapeType.ROUNDED_RECT,
        style: { width: 200, height: 80, radius: 16, fill: '#FF0000' },
      });
      expect(ui.getShapeCount()).toBe(1);
      const shape = ui.getShape(0);
      expect(shape?.type).toBe(UIShapeType.ROUNDED_RECT);
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
  });

  describe('CheckBox', () => {
    it('init() applies enabled/checked/text/views', () => {
      const c = new CheckBox();
      c.init({ enabled: true, checked: true, text: '记住我', views: {
        checked: { color: 0x22c55e, width: 24, height: 24 },
        unchecked: { color: 0x999999, width: 24, height: 24 },
      } });
      expect(c.checked).toBe(true);
      expect(c.text).toBe('记住我');
      expect(c.views.checked).toBeDefined();
    });
  });

  describe('Switcher', () => {
    it('init() applies active / triggerEvent / views', () => {
      const c = new Switcher();
      c.init({
        active: 1, triggerEvent: 'onPress',
        views: [{ color: 0x111, width: 40, height: 20 }, { color: 0xeee, width: 40, height: 20 }],
      });
      expect(c.active).toBe(1);
      expect(c.triggerEvent).toBe('onPress');
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
  });

  describe('CircularProgressBar', () => {
    it('init() applies radius/lineWidth/colors', () => {
      const c = new CircularProgressBar();
      c.init({ radius: 40, lineWidth: 8, fillColor: '#22c55e', backgroundColor: '#1f2937' });
      expect(c.radius).toBe(40);
      expect(c.lineWidth).toBe(8);
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
  });

  describe('DoubleSlider', () => {
    it('init() applies value1/value2/min/max', () => {
      const c = new DoubleSlider();
      c.init({ value1: 25, value2: 75, min: 0, max: 100 });
      expect(c.value1).toBe(25);
      expect(c.value2).toBe(75);
    });
  });

  describe('Input', () => {
    it('init() applies value/placeholder/secure/textStyle', () => {
      const c = new Input();
      c.init({ value: 'hello', placeholder: 'name', secure: true, textStyle: { fontSize: 18 } });
      expect(c.value).toBe('hello');
      expect(c.placeholder).toBe('name');
      expect(c.secure).toBe(true);
      expect(c.textStyle.fontSize).toBe(18);
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
      c.init({ width: 300, height: 200, direction: 'vertical', background: 0x111111, radius: 6 });
      expect(c.width).toBe(300);
      expect(c.direction).toBe('vertical');
    });
  });

  describe('Select', () => {
    it('init() applies items / selectedIndex', () => {
      const c = new Select();
      c.init({ items: [{ text: 'A' }, { text: 'B' }], selectedIndex: 1 });
      expect(c.items.length).toBe(2);
      expect(c.selectedIndex).toBe(1);
    });
  });

  describe('Dialog', () => {
    it('init() applies open/title/backdropAlpha/closeOnBackdropClick', () => {
      const c = new Dialog();
      c.init({ open: true, title: 'Hello', backdropAlpha: 0.7, closeOnBackdropClick: false });
      expect(c.open).toBe(true);
      expect(c.title).toBe('Hello');
      expect(c.backdropAlpha).toBe(0.7);
      expect(c.closeOnBackdropClick).toBe(false);
    });
  });

  describe('MaskedFrame', () => {
    it('init() applies targetView / maskView', () => {
      const c = new MaskedFrame();
      c.init({
        targetView: { color: 0xff0000, width: 100, height: 100 },
        maskView: { color: 0xffffff, width: 80, height: 80, radius: 40 },
      });
      expect(c.targetView).toBeDefined();
      expect(c.maskView).toBeDefined();
    });
  });
});
