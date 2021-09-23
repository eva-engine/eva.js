export function createNowTime() {
  let nowtime = null;
  if (Date.now) {
    nowtime = Date.now;
  } else {
    nowtime = () => new Date().getTime();
  }

  return nowtime;
}
