import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:keyboard', 'Unit | Service | keyboard');

// transforms Ember.Objects and Ember.Arrays into normal objects and arrays
const normalize = function normalize(data) {
  return JSON.parse(JSON.stringify(data));
};

test('`activate` adds the supplied responder to the _responderStack', function(assert) {
  const service = this.subject();
  const responder = Ember.Object.create({ name: 'foo' });
  const secondItem = Ember.Object.create({ name: 'bar' });

  service.activate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder]), 'adds responder to sortedResponderStack');

  service.activate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder]), 'ensures responder uniquness');

  service.activate(secondItem);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([secondItem, responder]), 'adds to the top of the stack');
});

test('`sortedResponderStack` sorts the sortedResponderStack by priorty', function(assert) {
  const service = this.subject();
  const responder = Ember.Object.create({ name: 'foo', keyboardPriority: 0 });
  const secondItem = Ember.Object.create({ name: 'bar', keyboardPriority: 1 });
  const thirdItem = Ember.Object.create({ name: 'baz' });
  const fourthItem = Ember.Object.create({ name: 'beetle' });
  const fifthItem = Ember.Object.create({ name: 'EMT', keyboardFirstResponder: true });

  service.activate(responder);
  service.activate(secondItem);
  service.activate(thirdItem);
  service.activate(fourthItem);
  service.activate(fifthItem);
  
  const expected = normalize([fifthItem, responder, secondItem, fourthItem, thirdItem]);

  assert.deepEqual(normalize(service.get('sortedResponderStack')), expected, 'sort by priority ascending, non-priority at the end');
});

test('`_ensureSingleFirstResponder` ensures that only a single responder is firstResponder', function(assert) {
  const service = this.subject();
  const responder = Ember.Object.create({ name: 'foo', keyboardPriority: 0 });
  const secondItem = Ember.Object.create({ name: 'bar', keyboardPriority: 2 });
  const thirdItem = Ember.Object.create({ name: 'baz', keyboardPriority: 1 });
  const fourthItem = Ember.Object.create({ name: 'beetle' });

  service.activate(responder);
  service.activate(secondItem);
  service.activate(thirdItem);
  service.activate(fourthItem);
  
  thirdItem.set('keyboardFirstResponder', true);

  // init the sortedResponderStack
  service.get('sortedResponderStack');

  fourthItem.set('keyboardFirstResponder', true);
  
  const expected = ['beetle', 'foo', 'baz', 'bar'];

  assert.deepEqual(service.get('sortedResponderStack').mapBy('name'), expected, 'ensures a single firstResponder');
});

test('`deactivate` removes the supplied responder from the _responderStack', function(assert) {
  const service = this.subject();
  const responder = Ember.Object.create({ name: 'bar' });

  service.activate(responder);
  service.deactivate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), [], 'removes responder from sortedResponderStack');
});
