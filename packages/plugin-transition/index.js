'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-transition.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-transition.cjs.js');
}
