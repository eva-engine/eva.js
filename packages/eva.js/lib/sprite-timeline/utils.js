export function createNowTime(syncLocker = true) {
  let nowtime = null;
  if(Date.now) {
    nowtime = Date.now;
  } else {
    nowtime = () => (new Date()).getTime();
  }

  return nowtime;
}

/*
  delay = 100 -> delay = {delay: 100}
  delay = {entropy: 100} -> delay = {delay: 100, isEntropy: true}
 */
export function formatDelay(delay) {
  if(typeof delay === 'number') {
    delay = {delay};
  } else if('entropy' in delay) {
    delay = {delay: delay.entropy, isEntropy: true};
  }
  return delay;
}
