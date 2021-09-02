'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-renderer-spine38.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-renderer-spine38.cjs.js');
}
