'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/plugin-layout.cjs.prod.js')
} else {
  module.exports = require('./dist/plugin-layout.cjs.js')
}
