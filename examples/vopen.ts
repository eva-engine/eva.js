let step: number = 0;
let checking = false;
let begin = [0, 0];
let changedTimes = 0;
let falseTimes = 0;
let now = [0, 0];
let middle = [0, 0];
let startHadler = e => {
  if (checking) return;
  now = begin = [e.touches[0].pageX / window.innerWidth, e.touches[0].pageY / window.innerHeight];
  checking = true;
  falseTimes = changedTimes = 0;
  checking = true;
  step = 0;
  middle = [0, 0];
};
document.addEventListener('touchstart', startHadler);
let moveHandler = (e: TouchEvent) => {
  if (!checking) return;
  let current = [e.changedTouches[0].pageX / window.innerWidth, e.changedTouches[0].pageY / window.innerHeight];
  let changed = [current[0] - now[0], current[1] - now[1]];
  now = current;
  changedTimes++;
  if (step === 0) {
    if (changed[0] < 0 || changed[1] < 0) {
      falseTimes++;
    }
    checkStepOrOver();
  } else {
    if (changed[0] < 0 || changed[1] > 0) {
      falseTimes++;
    }
    checkStepOrOver();
  }
}
function checkStepOrOver() {
  if (step === 0) {
    if (now[0] - begin[0] > .2 && now[1] - begin[1] > .2) {
      middle = now;
      step = 1;
    }
  } else {
    if (falseTimes / changedTimes > .3) return;
    if (now[0] - middle[0] > .2 && middle[1] - now[1] > .2) {
      document.removeEventListener('touchstart', startHadler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchcancel', endHandler);
      document.removeEventListener('touchend', endHandler);
      const event = document.createEvent('MessageEvent');
      event.initEvent('openvconsole');
      window.dispatchEvent(event);
    }
  }
}
document.addEventListener('touchmove', moveHandler);

let endHandler = () => {
  begin = [0, 0];
  now = [0, 0];
  checking = false;
  falseTimes = changedTimes = 0;
  step = 0;
  middle = [0, 0];
};
document.addEventListener('touchend', endHandler);
document.addEventListener('touchcancel', endHandler);
export default true;
