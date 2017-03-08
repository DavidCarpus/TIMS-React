const notifier = require('node-notifier');
// String
notifier.notify('Message');

// Object
notifier.notify({
  'title': 'My notification',
  'message': 'Hello, there!',
  sound:true,
  // '/usr/share/sounds/ubuntu/notifications/Xylo.ogg',
});
