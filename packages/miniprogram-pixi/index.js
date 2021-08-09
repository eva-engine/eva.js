'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/miniprogram-pixi.cjs.prod.js');
} else {
  module.exports = require('./dist/miniprogram-pixi.cjs.js');
}
