'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-canvas-layer.cjs.prod.js');
} else {
  module.exports = require('./dist/plugin-canvas-layer.cjs.js');
}
