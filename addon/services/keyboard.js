import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  computed,
  isEmpty,
  on,
  Service
} = Ember;

export default Service.extend({
  _responderStack: computed(() => Ember.A()),

  activate(responder) {
    // ensure the responder appears only once in the stack
    this.deactivate(responder);
    this.get('_responderStack').unshiftObject(responder);
  },

  deactivate(responder) {
    this.get('_responderStack').removeObject(responder);
  },

  sortedResponderStack: computed('_responderStack.@each.keyboardPriority',
                                 '_responderStack.@each.keyboardFirstResponder', {
    get() {
      this._ensureSingleFirstResponder();

      return this.get('_responderStack').sort((a, b) => {
        // place the keyboardFirstResponder at the bottom of the stack
        if (a.keyboardFirstResponder) {
          return -1;
        } else if (b.keyboardFirstResponder) {
          return 1;
        }

        // place responders with no priority at the top of the stack
        const emptyA = isEmpty(a.keyboardPriority);
        const emptyB = isEmpty(b.keyboardPriority);
        if (emptyA && emptyB) {
          return 0;
        } else if (emptyA) {
          return 1;
        } else if (emptyB) {
          return -1;
        }

        // otherwise, sort by priority
        return a.keyboardPriority - b.keyboardPriority;
      });
    }
  }).readOnly(),

  _ensureSingleFirstResponder() {
    const responderStack = this.get('_responderStack');

    const count = responderStack.filterBy('keyboardFirstResponder').length;

    if (count > 1) {
      // the firstObject will always be the previous keyboardFirstResponder
      responderStack.set('firstObject.keyboardFirstResponder', undefined);
    }
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
