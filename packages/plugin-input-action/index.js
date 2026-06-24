'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-input-action.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-input-action.cjs.js');
}
