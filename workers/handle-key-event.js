var handleKeyEvents = require('ember-keyboard/utils/handle-key-events');

onmessage = function(event) {
  var data = JSON.parse(event.data);
  var response = handleKeyEvents(data.event, data.listeners, true);

  postMessage(response);
}
