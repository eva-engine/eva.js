import { UI, UISystem, UIShapeType } from '../lib';

describe('plugin-ui', () => {
  describe('UI component', () => {
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

    it('init() with shapes array preserves entries', () => {
      const ui = new UI();
      ui.init({
        shapes: [
          { type: UIShapeType.RECT, style: { width: 10, height: 10 } },
          { type: UIShapeType.CIRCLE, style: { radius: 5 } },
        ],
      });
      expect(ui.getShapeCount()).toBe(2);
      expect(ui.getShape(1)?.type).toBe(UIShapeType.CIRCLE);
    });
  });

  describe('UISystem', () => {
    it('declares the canonical Eva system name "UISystem"', () => {
      expect(UISystem.systemName).toBe('UISystem');
    });

    it('can be instantiated', () => {
      const sys = new UISystem();
      expect(sys.name).toBe('UISystem');
    });
  });
});
