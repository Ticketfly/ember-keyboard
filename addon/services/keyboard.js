import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  computed,
  on,
  Service
} = Ember;

export default Service.extend({
  _responderStack: computed(() => Ember.A()),

  activate(responder) {
    // ensure the responder appears only once in the stack
    this.deactivate(responder);
    this.get('_responderStack').pushObject(responder);
  },

  deactivate(responder) {
    this.get('_responderStack').removeObject(responder);
  },

  sortedResponderStack: computed('_responderStack.@each.keyboardPriority',
                                 '_responderStack.@each.keyboardFirstResponder', {
    get() {
      this._ensureSingleFirstResponder();

      return this.get('_responderStack').sort((a, b) => {
        // place the keyboardFirstResponder at the top of the stack
        if (a.keyboardFirstResponder) {
          return -1;
        } else if (b.keyboardFirstResponder) {
          return 1;
        }

        // otherwise, sort by priority
        return b.keyboardPriority - a.keyboardPriority;
      });
    }
  }).readOnly(),

  _ensureSingleFirstResponder() {
    const responderStack = this.get('_responderStack');
    const firstResponders = responderStack.filterBy('keyboardFirstResponder');

    firstResponders.forEach((responder, index) => {
      // the last responder will always be the new keyboardFirstResponder
      if (index === firstResponders.length - 1) { return; }

      responder.set('keyboardFirstResponder', undefined);
    });
  },

  _initializeListener: on('init', function() {
    const eventNames = ['keyup', 'keydown'].map(function(name) {
      return `${name}.ember-keyboard-listener`;
    }).join(' ');

    Ember.$(document).on(eventNames, null, (event) => {
      handleKeyEvent(event, this.get('sortedResponderStack'));
    });    
  }),

  _teardownListener: on('isDestroying', function() {
    Ember.$(document).off('.ember-keyboard-listener');
  })
});
