import { type } from '@eva/inspector-decorator'
import {decorators, System} from '../lib';

const {componentObserver} = decorators;

describe('decorators', () => {
  it('ide decorator should collect props', () => {
    class Test {
      static IDEProps: string[] = [];

      @type('string') public name: string = 'Test';
      @type('size') public size: number[] = [10, 10];
    }
    expect(Test.IDEProps.length).toBe(2);
    expect(Test.IDEProps).toEqual(['name', 'size']);
  });

  it('class use component observer decorator', () => {
    @componentObserver({
      Transform: [
        'size',
        ['style', 'color'],
        {prop: 'position', deep: false},
        {prop: ['transform', 'translate'], deep: true},
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
