'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-signal-bus.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-signal-bus.cjs.js');
}
