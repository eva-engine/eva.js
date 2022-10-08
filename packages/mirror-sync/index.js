'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/mirror-sync.cjs.prod.js')
} else {
  module.exports = require('./dist/mirror-sync.cjs.js')
}
