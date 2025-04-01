'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-worker.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-worker.cjs.js');
}
