'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-renderer-event.cjs.prod.js')
} else {
  module.exports = require('./dist/plugin-renderer-event.cjs.js')
}
