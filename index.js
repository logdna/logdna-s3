'use strict'

const async = require('async')

const config = require('./lib/config.js')
const eventHandler = require('./lib/event-handler.js')
const logger = require('./lib/logger.js')
const transformer = require('./lib/transformer.js')

const BATCH_INTERVAL = parseInt(process.env.LOGDNA_BATCH_INTERVAL) || 50

exports.handler = (event, context, callback) => {
  const conf = config.getConfig(event)
  , eventData = eventHandler.processEvent(eventHandler.parseEvent(event))
  , payload = conf.eventlog ? [eventHandler.prepareEvent(eventData)] : []

  let s3params = undefined
  if (eventData && eventData.meta) {
    s3params = {
      Bucket: eventData.meta.bucket && eventData.meta.bucket.name || undefined
    , Key: eventData.meta.object && eventData.meta.object.key || undefined
    }
  }

  if (conf.filelog) {
    return transformer.getLogs(s3params, (error, lines) => {
      if (error) {
        if (conf.eventlog) {
          return logger.flush(payload, conf, callback)
        }

        return callback(error)
      }

      const logArrays = payload.concat(transformer.prepareLogs(lines, eventData))
      const batches = transformer.batchify(logArrays)
      return async.everySeries(batches, (batch, next) => {
        setTimeout(() => {
          return logger.flush(batch, config, next)
        }, BATCH_INTERVAL)
      }, callback)
    })
  } else if (!conf.eventlog) {
    return callback('None of file and event logging has been enabled!')
  }

  return logger.flush(payload, conf, callback)
}
