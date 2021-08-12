'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-renderer-text.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-renderer-text.cjs.js');
}
