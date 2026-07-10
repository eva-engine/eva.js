class RequestAnimationFrameMockSession {
  handleCounter = 0;
  currentTime = 0;
  queue = new Map();
  requestAnimationFrame(callback) {
    const handle = this.handleCounter++;
    this.queue.set(handle, callback);
    return handle;
  }
  cancelAnimationFrame(handle) {
    this.queue.delete(handle);
  }
  triggerNextAnimationFrame(time = performance.now()) {
    this.currentTime = time;
    const nextEntry = this.queue.entries().next().value;
    if (nextEntry === undefined) return;

    const [nextHandle, nextCallback] = nextEntry;

    this.queue.delete(nextHandle);
    nextCallback(time);
  }
  stepTo(time: number) {
    this.triggerNextAnimationFrame(time);
  }
  advanceBy(deltaTime: number) {
    this.stepTo(this.currentTime + deltaTime);
  }
  triggerAllAnimationFrames(time = performance.now()) {
    const pendingHandles = Array.from(this.queue.keys());
    for (const handle of pendingHandles) {
      const callback = this.queue.get(handle);
      if (!callback) continue;
      this.queue.delete(handle);
      callback(time);
    }
    this.currentTime = time;
  }
  reset() {
    this.queue.clear();
    this.handleCounter = 0;
    this.currentTime = 0;
  }
}

export const requestAnimationFrameMock = new RequestAnimationFrameMockSession();

window.requestAnimationFrame = requestAnimationFrameMock.requestAnimationFrame.bind(requestAnimationFrameMock);
window.cancelAnimationFrame = requestAnimationFrameMock.cancelAnimationFrame.bind(requestAnimationFrameMock);
