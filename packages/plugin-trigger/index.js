'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-trigger.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-trigger.cjs.js');
}
