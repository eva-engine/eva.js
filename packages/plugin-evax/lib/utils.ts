import cloneDeep from 'lodash-es/cloneDeep';
import isObject from 'lodash-es/isObject';

const _defineCache = new Map();

export function defineProperty(
  key,
  deep,
  store,
  originKey,
  originStore,
  callback,
) {
  if (!_defineCache.has(store)) {
    _defineCache.set(store, []);
  }
  if (_defineCache.get(store).indexOf(key) > -1) {
    return;
  }

  _defineCache.get(store).push(key);

  const props = key.split('.');

  let obj = store;

  const length = props.length;

  for (let i = 0; i < length - 1; i++) {
    if (obj[props[i]] === undefined) {
      return;
    }
    obj = obj[props[i]];
  }

  const value = obj[props[length - 1]];

  if (deep && isObject(value)) {
    for (const key in value) {
      defineProperty(key, deep, value, originKey, originStore, callback);
    }
  }

  const _key = `_${props[length - 1]}`;
  obj[_key] = value;

  Object.defineProperty(obj, _key, {
    enumerable: false,
  });

  Object.defineProperty(obj, props[length - 1], {
    set(val) {
      const oldStore = cloneDeep(originStore);
      obj[`_${props[length - 1]}`] = val;
      callback(originKey, oldStore);

      if (deep && isObject(val)) {
        _defineCache.delete(obj);
        for (const key in val) {
          defineProperty(key, deep, val, originKey, originStore, callback);
        }
      }
    },
    get() {
      return obj[`_${props[length - 1]}`];
    },
  });
}

export function updateStore(store, newStore, force) {
  for (const key in store) {
    if (!(key in newStore)) {
      continue;
    }
    if (typeof store[key] === 'object') {
      updateStore(store[key], newStore[key], force);
    } else {
      if (force || store[key] !== newStore[key]) {
        store[key] = newStore[key];
      }
    }
  }
}
