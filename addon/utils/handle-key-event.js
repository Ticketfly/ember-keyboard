import Ember from 'ember';
import KEY_MAP from 'ember-keyboard/fixtures/key-map';

const { hasListeners } = Ember;

const triggerEventListener = function triggerEventListenver(isWorker, responder, eventName, event) {
  if (isWorker) {
  } else {
    responder.trigger(eventName, event);
  }
}

// Transforms jquery events' `keyup` and `keydown` into Ember conventional `keyUp` and `keyDown`.
const normalizedEventType = function normalizedEventType(key, event) {
  return `key${Ember.String.capitalize(event.type.replace('key', ''))}:${key}`;
};

// Since app devs might define their modifier keys in any order (eg. `keyUp:shift+ctrl+a` or
// `keyUp:ctrl+shift+a`), we must check for each variant until we find the correct one.
const findEventListener = function findEventListener(isWorker, responder, keys, event, eventName) {
  if (keys.length === 0) {
    if (hasListeners(responder, eventName)) {
      triggerEventListener(isWorker, responder, eventName, event);

      // by returning true, we'll short-circuit the `findEventListener` and `handleKeyEvent` find loops
      return true;
    }
  }

  return keys.find((key) => {
    const modifiedEventName = !eventName ? normalizedEventType(key, event) : `${eventName}+${key}`;
    const remainingKeys = keys.filter((keyName) => keyName !== key);

    return findEventListener(isWorker, responder, remainingKeys, event, modifiedEventName);
  });
};

const pressedKeys = function pressedKeys(event) {
  const key = event.key || KEY_MAP[event.keyCode];

  return ['ctrl', 'meta', 'alt', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.pushObject(keyName);
    }

    return keys;
  }, Ember.A([key]));
};

export default function handleKeyEvent(event, responderStack, isWorker) {
  const keys = pressedKeys(event); 

  responderStack.find((responder) => {
    return findEventListener(isWorker, responder, keys, event);
  });
}
