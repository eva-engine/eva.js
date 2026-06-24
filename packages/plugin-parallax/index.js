'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-parallax.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-parallax.cjs.js');
}
