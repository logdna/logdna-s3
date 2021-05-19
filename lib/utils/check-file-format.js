'use strict'

module.exports = function checkFileFormat(key) {
  if (!key || typeof key !== 'string') return

  return {
    json: key.includes('.json') && !key.includes('.jsonl')
  , gz: key.includes('.gz')
  }
}
