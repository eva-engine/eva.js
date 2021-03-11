class CallbackLoop {
  callbacks = [];

  add(callback) {
    this.callbacks.push(callback);
  }

  once(callback) {
    const that = this;
    function cb() {
      callback();
      const index = that.callbacks.findIndex(item => item == cb);
      if (index > -1) {
        that.callbacks.splice(index, 1);
      }
    }
    this.add(cb);
  }

  clear() {
    this.callbacks.length = 0;
  }

  values() {
    return this.callbacks;
  }

  detachAll() {
    this.callbacks.length = 0;
  }
}

export class Loader {
  loading = false;
  resources = new Map<string, Record<string, any>>();
  onLoad = new CallbackLoop();
  onStart = new CallbackLoop();
  onComplete = new CallbackLoop();
  onError = new CallbackLoop();

  add(options: Record<string, any>) {
    this.resources.set(options.name, options);
  }

  load() {
    const onStartCallbacks = [...this.onStart.values()];
    const onLoadCallbacks = [...this.onLoad.values()];
    const onErrorCallbacks = [...this.onError.values()];

    for (const fn of onStartCallbacks) {
      fn();
    }

    const resourceEntity = [...this.resources.values()];
    this.loading = true;
    resourceEntity.forEach(async res => {
      if (res.name.includes('mockError')) {
        onErrorCallbacks.forEach(fn => {
          fn('resource type not exists', this, res);
        });
        return;
      }

      // 只处理image类型的eva资源
      if (res.type === ResourceType.Image) {
        res.data = new Image();
      }

      for (const fn of onLoadCallbacks) {
        await fn(res, res);
      }
    });
    this.loading = false;

    const onCompleteCallbacks = [...this.onComplete.values()];
    for (const fn of onCompleteCallbacks) {
      fn();
    }
  }

  reset() {
    this.resources.clear();
    this.onLoad.clear();
    this.onStart.clear();
    this.onComplete.clear();
    this.onError.clear();
  }
}

export enum ResourceType {
  Unknown = 0,
  Buffer = 1,
  Blob = 2,
  Json = 3,
  Xml = 4,
  Image = 5,
  Audio = 6,
  Video = 7,
  Text = 8,
}

export enum XhrResponseType {
  Default = 'text',
  Buffer = 'arraybuffer',
  Blob = 'blob',
  Document = 'document',
  Json = 'json',
  Text = 'text',
}
