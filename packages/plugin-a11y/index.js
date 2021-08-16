'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-a11y.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-a11y.cjs.js');
}
