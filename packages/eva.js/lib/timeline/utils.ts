export function createNowTime() {
  let lastTime = Number.NEGATIVE_INFINITY;

  return () => {
    const currentTime =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now
        ? Date.now()
        : new Date().getTime();
    lastTime = Math.max(lastTime, currentTime);
    return lastTime;
  };
}
