import { Field, getPropertiesOf } from '@eva/inspector-decorator';
import { decorators, System } from '../lib';

const { componentObserver } = decorators;

describe('decorators', () => {
  it('ide decorator should collect props', () => {
    class Test {
      @Field() public name: string = 'Test';
      @Field(() => Number) public size: number[] = [10, 10];
    }
    const attrs = getPropertiesOf(Test);
    expect(attrs.children[0].type).toBe('string');
    expect(attrs.children[0].isArray).toBe(false);
    expect(attrs.children[1].type).toBe('number');
    expect(attrs.children[1].isArray).toBe(true);
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
