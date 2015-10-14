import Ember from 'ember';
import KEY_MAP from 'ember-keyboard/fixtures/key-map';

const { hasListeners} = Ember;

// Transforms jquery events' `keyup` and `keydown` into Ember conventional `keyUp` and `keyDown`.
const normalizedEventType = (key, event) => {
  return `key${Ember.String.capitalize(event.type.replace('key', ''))}:${key}`;
};

// Since app devs might define their modifier keys in any order (eg. `keyUp:shift+ctrl+a` or
// `keyUp:ctrl+shift+a`), we must check for each variant until we find the correct one.
const triggerEventListener = (responder, keys, event, eventName) => {
  if (keys.length === 0) {
    if (hasListeners(responder, eventName)) {
      responder.trigger(eventName, event);

      // by returning true, we'll short-circuit the `triggerEventListener` and `handleKeyEvent` find loops
      return true;
    }
  }

  return keys.find((key) => {
    const modifiedEventName = !eventName ? normalizedEventType(key, event) : `${eventName}+${key}`;
    const remainingKeys = keys.filter((keyName) => keyName !== key);

    return triggerEventListener(responder, remainingKeys, event, modifiedEventName);
  });
};

export default function handleKeyEvent(event, responderStack) {
  const key = event.key || KEY_MAP[event.keyCode];
  const keys = ['ctrl', 'meta', 'alt', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.pushObject(keyName);
    }

    return keys;
  }, Ember.A([key]));

  responderStack.find((responder) => {
    return triggerEventListener(responder, keys, event);
  });
}
