import { Field, type, step, getPropertiesOf } from '../lib';
import {decorators, Component, System} from '../lib';

const {componentObserver} = decorators;

describe('decorators', () => {
  it('ide decorator should collect props', () => {
    class Test {
      static IDEProps: any = {};

      @type('string') public name: string = 'Test';
      @type('size') public size: number[] = [10, 10];
    }
    expect(Test.IDEProps).toEqual({
      name: {
        key: 'name',
        type: 'string'
      },
      size: {
        key: 'size',
        type: 'size'
      }
    });
    expect(getPropertiesOf(Test).children).toEqual([
      expect.objectContaining({
        name: 'name',
        type: 'string',
        isArray: false,
      }),
      expect.objectContaining({
        name: 'size',
        type: 'size',
        isArray: false,
      }),
    ]);
  });

  it('inspector decorator should merge type and step metadata', () => {
    class Test {
      static componentName = 'Test';

      @type('number') @step(0.1) public alpha: number = 1;
    }

    expect((Test as any).IDEProps.alpha).toEqual({
      key: 'alpha',
      type: 'number',
      step: 0.1,
    });
    expect(getPropertiesOf(Test).children[0]).toEqual(
      expect.objectContaining({
        name: 'alpha',
        type: 'number',
        step: 0.1,
        isArray: false,
      }),
    );
  });

  it('inspector Field should expose nested class metadata for object arrays', () => {
    class Style {
      @Field({ type: 'color' })
      colors: string[];
    }

    class Text {
      static componentName = 'Text';

      @Field({ type: 'vector2' })
      mask: { x: number; y: number };

      @Field(() => Style)
      style: Style[];

      @Field(() => [Style])
      styleList: Style[];
    }

    const data = getPropertiesOf(Text);
    const style = data.children.find(item => item.name === 'style');
    const styleList = data.children.find(item => item.name === 'styleList');

    for (const metadata of [style, styleList]) {
      expect(metadata).toEqual(
        expect.objectContaining({
          type: 'object',
          isArray: true,
          addable: true,
        }),
      );
      expect(metadata.children[0]).toEqual(
        expect.objectContaining({
          name: 'colors',
          type: 'color',
          isArray: true,
          addable: true,
        }),
      );
    }
  });

  it('Component should expose inspector metadata on both class and instance APIs', () => {
    class Style {
      @Field({ type: 'color' })
      fill: string;
    }

    class TestComponent extends Component {
      static componentName = 'TestComponent';

      @Field(() => Style)
      style: Style;

      @Field(() => [Style])
      styleList: Style[];

      @type('number') @step(0.5) public alpha: number = 1;
    }

    const classMetadata = TestComponent.getInspectorMetadata();
    const instanceMetadata = new TestComponent().getInspectorMetadata();
    const style = classMetadata.children.find(item => item.name === 'style');
    const styleList = classMetadata.children.find(item => item.name === 'styleList');

    expect(classMetadata).toEqual(instanceMetadata);
    expect(classMetadata).toEqual(
      expect.objectContaining({
        name: 'TestComponent',
        type: 'object',
        isFolder: true,
      }),
    );
    expect(style).toEqual(
      expect.objectContaining({
        name: 'style',
        type: 'object',
        isArray: false,
      }),
    );
    expect(style.children[0]).toEqual(
      expect.objectContaining({
        name: 'fill',
        type: 'color',
      }),
    );
    expect(styleList).toEqual(
      expect.objectContaining({
        name: 'styleList',
        type: 'object',
        isArray: true,
        addable: true,
      }),
    );
    expect((TestComponent as any).IDEProps.alpha).toEqual({
      key: 'alpha',
      type: 'number',
      step: 0.5,
    });
  });

  it('class use component observer decorator', () => {
    @componentObserver({
      Transform: [
        'size',
        ['style', 'color'],
        { prop: 'position', deep: false },
        { prop: ['transform', 'translate'], deep: true },
      ],
    })
    class Test extends System {}
    expect(Test.observerInfo['Transform'].length).toBe(4);
  });

  it('class with observerInfo', () => {
    @componentObserver()
    class Test extends System {
      static observerInfo = {};
    }
    expect(Test.observerInfo).toMatchObject({});
  });
});
