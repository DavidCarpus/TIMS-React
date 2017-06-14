// if (process.env.NODE_ENV === 'production' || (location && location.hostname !== 'localhost')) {
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./configureStore.prod');
} else {
  module.exports = require('./configureStore.dev');
}
