import './events/init';
import { EventSystem } from './events/EventSystem';

export const eventHandler = data => {
  const { type, eventName, event, normalizedEvents } = data;
  if (type === 'eva-event') {
    const fn = EventSystem.eventsHandler[eventName];
    fn && fn({ ...event, preventDefault() {}, normalizedEvents });
  }
};
