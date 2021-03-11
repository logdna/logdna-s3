'use strict'

const async = require('async')

const {getConfig} = require('./lib/config.js')
const {handleEvent} = require('./lib/event-handler.js')
const {flush} = require('./lib/logger.js')
const {getLogs, prepareLogs} = require('./lib/transformer.js')
const {batchify, getProperty} = require('./lib/utils.js')

const BATCH_INTERVAL = parseInt(process.env.LOGDNA_BATCH_INTERVAL) || 50
const BATCH_LIMIT = parseInt(process.env.LOGDNA_BATCH_LIMIT) || 25

module.exports = {
  handler
}

function handler(event, context, callback) {
  const config = getConfig(event)
  const eventData = handleEvent(event)
  const s3params = {
    Bucket: getProperty(eventData, 'meta.bucket.name')
  , Key: getProperty(eventData, 'meta.object.key')
  }

  return getLogs(s3params, (error, lines) => {
    if (error) return callback(error)

    const logArrays = prepareLogs(lines, eventData)
    const batches = batchify(logArrays, BATCH_LIMIT)
    return async.everySeries(batches, (batch, next) => {
      setTimeout(() => {
        return flush(batch, config, next)
      }, BATCH_INTERVAL)
    }, callback)
  })
}
