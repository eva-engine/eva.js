import { Text, TextSystem } from '../lib';

describe('Text Plugin - 文本渲染', () => {
  let textSystem: TextSystem;

  beforeEach(() => {
    textSystem = new TextSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (textSystem) {
      textSystem.destroy();
    }
  });

  describe('TextSystem 初始化', () => {
    it('应该成功创建 TextSystem 实例', () => {
      expect(textSystem).toBeDefined();
      expect(textSystem.name).toBe('Text');
    });
  });

  describe('Text 组件', () => {
    it('应该创建 Text 组件实例', () => {
      const text = new Text({
        text: 'Hello World',
      });

      expect(text).toBeDefined();
      expect(text.name).toBe('Text');
    });

    it('应该支持文本内容', () => {
      const content = 'Test Text';
      const text = new Text({
        text: content,
      });

      expect(text.text).toBe(content);
    });

    it('应该支持样式配置', () => {
      const text = new Text({
        text: 'Styled Text',
        style: {
          fontSize: 24,
          fill: '#ffffff',
          fontFamily: 'Arial',
        },
      });

      expect(text.style).toBeDefined();
      expect(text.style.fontSize).toBe(24);
    });
  });

  describe('文本样式', () => {
    it('应该支持字体大小', () => {
      const text = new Text({
        text: 'Test',
        style: {
          fontSize: 32,
        },
      });

      expect(text.style.fontSize).toBe(32);
    });

    it('应该支持字体颜色', () => {
      const text = new Text({
        text: 'Test',
        style: {
          fill: '#ff0000',
        },
      });

      expect(text.style.fill).toBe('#ff0000');
    });

    it('应该支持字体类型', () => {
      const text = new Text({
        text: 'Test',
        style: {
          fontFamily: 'Helvetica',
        },
      });

      expect(text.style.fontFamily).toBe('Helvetica');
    });

    it('应该支持粗体', () => {
      const text = new Text({
        text: 'Test',
        style: {
          fontWeight: 'bold',
        },
      });

      expect(text.style.fontWeight).toBe('bold');
    });

    it('应该支持斜体', () => {
      const text = new Text({
        text: 'Test',
        style: {
          fontStyle: 'italic',
        },
      });

      expect(text.style.fontStyle).toBe('italic');
    });
  });

  describe('文本对齐', () => {
    it('应该支持水平对齐', () => {
      const text = new Text({
        text: 'Test',
        style: {
          align: 'center',
        },
      });

      expect(text.style.align).toBe('center');
    });

    it('应该支持垂直对齐', () => {
      const text = new Text({
        text: 'Test',
        style: {
          verticalAlign: 'middle',
        },
      });

      expect(text.style.verticalAlign).toBe('middle');
    });
  });

  describe('文本修饰', () => {
    it('应该支持描边', () => {
      const text = new Text({
        text: 'Test',
        style: {
          stroke: '#000000',
          strokeThickness: 2,
        },
      });

      expect(text.style.stroke).toBe('#000000');
      expect(text.style.strokeThickness).toBe(2);
    });

    it('应该支持阴影', () => {
      const text = new Text({
        text: 'Test',
        style: {
          dropShadow: true,
          dropShadowColor: '#000000',
          dropShadowBlur: 4,
        },
      });

      expect(text.style.dropShadow).toBe(true);
    });
  });

  describe('文本换行', () => {
    it('应该支持自动换行', () => {
      const text = new Text({
        text: 'This is a long text that should wrap',
        style: {
          wordWrap: true,
          wordWrapWidth: 200,
        },
      });

      expect(text.style.wordWrap).toBe(true);
      expect(text.style.wordWrapWidth).toBe(200);
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        textSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });

  describe('文本更新', () => {
    it('应该能够动态更新文本内容', () => {
      const text = new Text({
        text: 'Original',
      });

      text.text = 'Updated';
      expect(text.text).toBe('Updated');
    });
  });
});
