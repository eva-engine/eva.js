'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/spine-base.cjs.prod.js');
} else {
  module.exports = require('./dist/spine-base.cjs.js');
}
