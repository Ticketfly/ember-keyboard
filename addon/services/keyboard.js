import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  computed,
  on,
  Service
} = Ember;

export default Service.extend({
  responderStack: computed(() => Ember.A()),

  activate(responder) {
    const responderStack = this.get('responderStack');

    // ensure the responder appears only once in the stack
    responderStack.removeObject(responder);
    responderStack.unshiftObject(responder);
  },

  deactivate(responder) {
    this.get('responderStack').removeObject(responder);
  },

  _initializeListener: on('init', function() {
    const eventNames = ['keyup', 'keydown'].reduce(function(names, name) {
      return `${names} ${name}.ember-keyboard-listener`;
    }, '');

    if (window.Worker) {
      // this.set('keyWorker', new Worker('assets/workers/handle-key-event.js'));
    }

    Ember.$(document).on(eventNames, null, (event) => {
      const { keyWorker, responderStack } = this.getProperties('keyWorker', 'responderStack');

      if (keyWorker) {
        const listeners = {};
        responderStack.forEach((responder) => {
          listeners[responder.elementId] = Ember.listenersFor(responder);
        });
        keyWorker.postMessage(JSON.stringify({ event, listeners }));
      } else {
        handleKeyEvent(event, this.get('responderStack'));
      }
    });    
  }),

  _teardownListener: on('isDestroying', function() {
    const keyWorker = this.get('keyWorker');

    if (keyWorker) {
      keyWorker.terminate();
    }

    Ember.$(document).off('.ember-keyboard-listener');
  })
});
