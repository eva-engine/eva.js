'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-easing.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-easing.cjs.js');
}
