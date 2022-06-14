'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-renderer-particles.cjs.prod.js')
} else {
  module.exports = require('./dist/plugin-renderer-particles.cjs.js')
}
