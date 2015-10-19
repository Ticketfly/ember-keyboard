import Ember from 'ember';
import KEY_MAP from 'ember-keyboard/fixtures/key-map';

const { hasListeners } = Ember;

// joins and sorts any active modifier keys with the primary key.
const gatherKeys = function gatherKeys(event) {
  const key = event.key || KEY_MAP[event.keyCode];

  return ['ctrl', 'meta', 'alt', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.pushObject(keyName);
    }

    return keys;
  }, Ember.A([key])).sort().join('+');
};

export default function handleKeyEvent(event, responderStack) {
  const keys = gatherKeys(event);
  const listener = `${event.type}:${keys}`;

  // finds the first responder with the listener, or terminates with a listener that has explicitly
  // set `keyboardBubbles` to `false`.
  const responder = responderStack.find((responder) => {
    return hasListeners(responder, listener) || responder.get('keyboardBubbles') === false;
  });

  if (responder) {
    responder.trigger(listener);
  }
}
