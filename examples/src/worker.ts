import Worker from './worker2.ts?worker';

export const name = 'worker';

export function init(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log(window.innerWidth, window.innerHeight);

  // Create an OffscreenCanvas from the canvas
  const offscreenCanvas = canvas.transferControlToOffscreen();

  // Create a new worker
  const worker = new Worker();

  // Send the OffscreenCanvas to the worker
  worker.postMessage(
    {
      type: 'eva-init',
      canvasMap: {
        [canvas.id]: offscreenCanvas,
      },
      width: 750,
      height: (window.innerHeight / window.innerWidth) * 750,
      resolution: 1,
    },
    [offscreenCanvas],
  );

  let events = [];

  const flushEvents = () => {
    window.requestAnimationFrame(() => {
      if (events.length) {
        console.log(events.length);
        worker.postMessage({
          type: 'eva-events',
          events: [...events],
          canvasRect: canvas.getBoundingClientRect(),
          id: canvas.id,
          domElement: {
            width: canvas.width,
            height: canvas.height,
          },
        });
        events = [];
      }
      flushEvents();
    });
  };

  const sendEvent = (eventName, target = canvas) => {
    target.addEventListener(
      eventName,
      event => {
        const normalizedEvents = [];
        const eventClone: any = {
          type: event.type,
          clientX: event.clientX,
          clientY: event.clientY,
          x: event.clientX,
          y: event.clientY,
          isPrimary: event.isPrimary,
          width: event.width,
          height: event.height,
          tiltX: event.tiltX,
          tiltY: event.tiltY,
          pointerType: event.pointerType,
          pointerId: event.pointerId,
          pressure: event.pressure,
          twist: event.twist,
          tangentialPressure: event.tangentialPressure,
        };

        if (event instanceof TouchEvent) {
          for (let i = 0, li = event.changedTouches.length; i < li; i++) {
            const target = event.changedTouches[i];
            const touch: any = {
              clientX: target.clientX,
              clientY: target.clientY,
              force: target.force,
              identifier: target.identifier,
              pageX: target.pageX,
              pageY: target.pageY,
              radiusX: target.radiusX,
              radiusY: target.radiusY,
              rotationAngle: target.rotationAngle,
              screenX: target.screenX,
              screenY: target.screenY,
            };

            if (typeof touch.button === 'undefined') touch.button = 0;
            if (typeof touch.buttons === 'undefined') touch.buttons = 1;
            if (typeof touch.isPrimary === 'undefined') {
              touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
            }
            if (typeof touch.width === 'undefined') touch.width = touch.radiusX || 1;
            if (typeof touch.height === 'undefined') touch.height = touch.radiusY || 1;
            if (typeof touch.tiltX === 'undefined') touch.tiltX = 0;
            if (typeof touch.tiltY === 'undefined') touch.tiltY = 0;
            if (typeof touch.pointerType === 'undefined') touch.pointerType = 'touch';
            if (typeof touch.pointerId === 'undefined') touch.pointerId = touch.identifier || 0;
            if (typeof touch.pressure === 'undefined') touch.pressure = touch.force || 0.5;
            if (typeof touch.twist === 'undefined') touch.twist = 0;
            if (typeof touch.tangentialPressure === 'undefined') touch.tangentialPressure = 0;
            if (typeof touch.layerX === 'undefined') touch.layerX = touch.offsetX = touch.clientX;
            if (typeof touch.layerY === 'undefined') touch.layerY = touch.offsetY = touch.clientY;

            // mark the touch as normalized, just so that we know we did it
            touch.isNormalized = true;
            touch.type = event.type;

            normalizedEvents.push(touch);
          }
        }
        // apparently PointerEvent subclasses MouseEvent, so yay
        else if (
          !globalThis.MouseEvent ||
          (event instanceof MouseEvent && !(event instanceof globalThis.PointerEvent))
        ) {
          const tempEvent: any = {
            isTrusted: event.isTrusted,
            altKey: event.altKey,
            bubbles: event.bubbles,
            button: event.button,
            buttons: event.buttons,
            cancelBubble: event.cancelBubble,
            cancelable: event.cancelable,
            clientX: event.clientX,
            clientY: event.clientY,
            composed: event.composed,
            ctrlKey: event.ctrlKey,
            currentTarget: null,
            defaultPrevented: event.defaultPrevented,
            detail: event.detail,
            eventPhase: event.eventPhase,
            fromElement: null,
            layerX: event.layerX,
            layerY: event.layerY,
            metaKey: event.metaKey,
            movementX: event.movementX,
            movementY: event.movementY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            pageX: event.pageX,
            pageY: event.pageY,
            relatedTarget: null,
            returnValue: event.returnValue,
            screenX: event.screenX,
            screenY: event.screenY,
            shiftKey: event.shiftKey,
            sourceCapabilities: {
              firesTouchEvents: event.sourceCapabilities?.firesTouchEvents,
            },
            target: null,
            timeStamp: event.timeStamp,
            toElement: null,
            type: event.type,
            view: null,
            x: event.x,
          };

          if (typeof tempEvent.isPrimary === 'undefined') tempEvent.isPrimary = true;
          if (typeof tempEvent.width === 'undefined') tempEvent.width = 1;
          if (typeof tempEvent.height === 'undefined') tempEvent.height = 1;
          if (typeof tempEvent.tiltX === 'undefined') tempEvent.tiltX = 0;
          if (typeof tempEvent.tiltY === 'undefined') tempEvent.tiltY = 0;
          if (typeof tempEvent.pointerType === 'undefined') tempEvent.pointerType = 'mouse';
          if (typeof tempEvent.pointerId === 'undefined') tempEvent.pointerId = 1;
          if (typeof tempEvent.pressure === 'undefined') tempEvent.pressure = 0.5;
          if (typeof tempEvent.twist === 'undefined') tempEvent.twist = 0;
          if (typeof tempEvent.tangentialPressure === 'undefined') tempEvent.tangentialPressure = 0;

          tempEvent.isNormalized = true;

          normalizedEvents.push(tempEvent);
        } else {
          normalizedEvents.push(eventClone);
        }

        events.push({
          eventName,
          event: eventClone,
          normalizedEvents,
        });
      },
      true,
    );
  };

  sendEvent('mousedown');
  sendEvent('mousemove');
  sendEvent('mouseout');
  sendEvent('mouseover');
  sendEvent('mouseup', document);

  sendEvent('pointermove');
  sendEvent('pointerdown');
  sendEvent('pointerleave');
  sendEvent('pointerover');
  sendEvent('pointerup', document);

  sendEvent('touchstart');
  sendEvent('touchend');
  sendEvent('touchmove');

  flushEvents();
}
