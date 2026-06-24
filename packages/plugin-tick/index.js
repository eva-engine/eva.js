'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-tick.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-tick.cjs.js');
}
