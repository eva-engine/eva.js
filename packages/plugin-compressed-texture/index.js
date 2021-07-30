'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-compressed-texture.cjs.prod.js')
} else {
  module.exports = require('./dist/plugin-compressed-texture.cjs.js')
}
