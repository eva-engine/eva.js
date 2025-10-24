import { init } from './events/init';
import { EventSystem } from './events/EventSystem';

export const eventHandler = data => {
  const { type, events, canvasRect, domElement, id } = data;
  if (type === 'eva-init') {
    const { canvasMap } = data;
    EventSystem.canvasMap = canvasMap;
  }
  if (type === 'eva-events') {
    for (const res of events) {
      const { eventName, event, normalizedEvents } = res;
      const fn = EventSystem.eventsHandler[id][eventName];
      fn && fn({ ...event, preventDefault() {}, normalizedEvents, canvasRect, domElement });
    }
  }
};

init();
