'use strict'

module.exports = function formatObjectKey(key) {
  return decodeURIComponent(key.replace(/\+/g, ' '))
}
