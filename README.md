# Ember-keyboard

`ember-keyboard`, an Ember addon for the painless support of keyboard events.

## Features

* Contextual responders, allowing you to manage multiple components with unique and conflicting key requirements. (Thanks to [`ember-key-responder`](https://github.com/yapplabs/ember-key-responder) for the inspiration)
* Human-readable key-mappings. (Thanks to [`ember-keyboard-service`](https://github.com/Fabriquartz/ember-keyboard-service) for the inspiration)
* Support for both `keyUp` and `keyDown`, as well as the modifier keys: `ctrl`, `alt`, `shift`, and `meta`.
* Non-invasive, service-based injection.
* Compatible with both Ember 1.13 and 2.0+.

## Usage

First, inject `ember-keyboard` into your component:

```js
export default Ember.Component.extend({
  keyboard: Ember.inject.service()
});
```

Once the `keyboard` service is injected, you need to activate it.

```js
activateKeyboard: on('didInsertElement', function() {
  this.get('keyboard').activate(this);
})
```

This will place the component at the bottom of the `eventStack`, meaning that it will be the first component to respond to a key event. Let's say you want your component to respond to the key `a` as well as `ctrl+shift+a`:

```js
import { keyUp } from 'ember-keyboard';

. . . .

aFunction: keyUp('a', function() {
  console.log('`a` was pressed');
}),

anotherFunction: keyUp('ctrl+shift+a', function() {
  console.log('`ctrl+shift+a` was pressed');
})
```

The modifier keys include `ctrl`, `shift`, `alt`, and `meta`. For a full list of the primary keys (such as `a`, `1`, ` `, `Escape`, and `ArrowLeft`), look [here](https://github.com/Ticketfly/ember-keyboard/blob/master/addon/fixtures/key-map.js).

Finally, when you're ready for a component to leave the `eventStack` you can deactivate it:

```js
deactivateKeyboard: on('willDestroyElement', function() {
  this.get('keyboard').deactivate(this);
})
```

## Options

`ember-keyboard` will search its responders for optional attributes. These options provide greater control over `ember-keyboard`'s [event bubbling](#event-bubbling).

### `keyboardPriority`

By default, when you `activate` a component it gets added to the bottom of the `eventStack`. As more components get added, each will arrive at the bottom of the stack, where it will become the first responder. If you need more control over the `eventStack`'s organization, you can set the `keyboardPriority` of its responders. In this case:

```js
component1.set('keyboardPriority', 3);
component2.set('keyboardPriority', 1);
component4.set('keyboardPriority', 2);

keyboard.activate(component1);
keyboard.activate(component2);
keyboard.activate(component3);
keyboard.activate(component4);
```

The `eventStack`'s order will be `[component2, component4, component1, component3]`. Note that precedence is given to lower numbers, and all numbers are given precedence over `undefined`. 

### `keyboardFirstResponder`

Sometimes you'll want a component to temporarily become the first responder, regardless of its priority. For instance, a user might click or focusIn a low priority item. When that happens, you can temporarily give it first responder priority by:

```js
keyboard.activate(component);

component.set('keyboardFirstPriority', true);
```

You can later `component.set('keyboardFirstResponder', false)` and the component will automatically return to its original priority. Additionally, if you set another component to `keyboardFirstResponder`, the previous `keyboardFirstResponder` will return to its old priority.

### `keyboardBubbles`

By default, events will bubble up the `eventStack`. However, if you want to stop an event from bubbling after a particular component, you can do so by:

```js
keyboard.activate(component);

component.set('keyboardBubbles', false);
```

This is especially useful with modals, as it'll prevent interaction with the rest of your app. If there are components you still want to respond to events, make sure their priority is higher than the priority of the component that stops bubbling.

## Concepts & Advanced Usage

### Event Bubbling

When you run `this.get('keyboard').activate(this)`, you place a component at the bottom of the `eventStack`. When a key is pressed, it will be first to respond. If it lacks a registered listener for that key, then it will bubble the event up to the next component on the stack. This will continue until the event is handled or it terminates at the top of the stack. This allows you to have mutliple component responders, with precedence given to components lower on the stack.

As an example, imagine that you have a `search-bar` component that you want to focus whenever the user presses the `s` key. At the same time, you have a `nav-bar` component that responds to `ArrowLeft` and `ArrowRight`. When the `s` key is pressed, it first passes through `nav-bar` at the bottom of the stack. Since there are no `keyUp:s` listeners, the event bubbles up to `search-bar`, which can than respond to the keypress.

Now let's say your `modal-dialog` component pops up. It also responds to `ArrowLeft` and `ArrowRight` to cycle through modal states. When the user clicks `ArrowRight`, the event now goes to `modal-dialog` which has arrived at the bottom of the stack. Since it has a listener for `ArrowRight`, it handles the keypress and the event never bubbles up to `nav-bar`.

### `keyUp` and `keyDown`

From a UI perspective, you'll usually want to register your listeners with `keyUp`. However, there are special scenarios where `keyDown` might be more desirable, usually because it fires repeatedly while the key is held. This could allow users to rapidly cycle through modal states or scroll through a custom window pane. You can import either `keyUp` or `keyDown` from `ember-keyboard`:

```js
import { keyDown, keyUp } from 'ember-keyboard';
```
