import { init } from './events/init';
import { EventSystem } from './events/EventSystem';

export const eventHandler = data => {
  const { type, events } = data;
  if (type === 'eva-events') {
    for (const res of events) {
      const { eventName, event, normalizedEvents } = res;
      const fn = EventSystem.eventsHandler[eventName];
      fn && fn({ ...event, preventDefault() {}, normalizedEvents });
    }
  }
};

init();
