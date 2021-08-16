'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-sound.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-sound.cjs.js');
}
