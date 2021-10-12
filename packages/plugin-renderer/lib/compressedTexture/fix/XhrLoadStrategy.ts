// 这里是为了处理被放在一个对象里面的类不能被继承问题，TS4020错误
// This is to deal with the problem that the class placed in an object cannot be extendsed, TS4020 error
import { resourceLoader } from '@eva/eva.js'
import type { XhrLoadStrategy as _XhrLoadStrategy } from 'resource-loader'
let { XhrLoadStrategy: XLS } = resourceLoader;
export const XhrLoadStrategy: typeof _XhrLoadStrategy = XLS as typeof _XhrLoadStrategy