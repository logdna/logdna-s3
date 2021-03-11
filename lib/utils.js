'use strict'

module.exports = {
  batchify
, checkFileFormat
, getProperty
, hasProperty
, setProperty
}

function getProperty(obj, string = '', sep = '.') {
  /* eslint-disable-next-line no-eq-null */
  if (obj == null) return undefined

  const parts = string.split(sep)
  let ret = obj
  const last = parts.pop()
  let prop
  while ((prop = parts.shift())) {
    ret = ret[prop]
    /* eslint-disable-next-line no-eq-null */
    if (ret == null) return ret
  }

  return ret[last]
}

function setProperty(obj, prop, value, sep = '.') {
  if (typeof prop !== 'string') {
    throw new TypeError(
      'second argument must be a string'
    )
  }

  const keys = prop.split(sep)
  const last = keys.pop()
  if (!last) return obj

  _deepest(obj, keys)[last] = value
  return obj
}

function _deepest(obj, keys) {
  if (!keys.length) return obj
  for (const key of keys) {
    if (!obj[key]) {
      obj[key] = Object.create(null)
    }

    obj = obj[key]
  }

  return obj
}

function hasProperty(obj, string = '', sep = '.') {
  /* eslint-disable-next-line no-eq-null */
  if (obj == null) return false

  const parts = string.split(sep)
  let ret = obj
  const last = parts.pop()
  let prop
  while ((prop = parts.shift())) {
    ret = ret[prop]
    /* eslint-disable-next-line no-eq-null */
    if (ret == null) return false
  }

  return Object.prototype.hasOwnProperty.call(ret, last)
}

function checkFileFormat(key) {
  if (!key || typeof key !== 'string') return

  return {
    json: key.indexOf('.json') >= 0 && key.indexOf('.jsonl') === -1
  , gz: key.indexOf('.gz') >= 0
  }
}

function batchify(arr, size) {
  const batches = []
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size))
  }

  return batches
}
