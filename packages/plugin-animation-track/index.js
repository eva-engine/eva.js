'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-animation-track.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-animation-track.cjs.js');
}
