'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-camera2d.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-camera2d.cjs.js');
}
