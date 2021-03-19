'use strict'

const async = require('async')

const config = require('./lib/config.js')
const {handleEvent} = require('./lib/event-handler.js')
const {flush} = require('./lib/logger.js')
const {getLogs, prepareLogs} = require('./lib/transformer.js')
const {batchify, getProperty} = require('./lib/utils.js')

const DOT_REGEXP = /\./g

module.exports = {
  handler
}

async function handler(event, context, callback) {
  config.validateEnvVars()
  const tags = config.get('tags')
  if (tags) {
    config.set('tags', tags.split(',').map((tag) => {
      return tag.trim()
    }).join(','))
  }

  const eventData = handleEvent(event)
  const s3params = {
    Bucket: getProperty(eventData, 'meta.bucket.name')
  , Key: getProperty(eventData, 'meta.object.key')
  }

  let lines
  try {
    lines = getLogs(s3params)
  } catch (e) {
    return callback(e)
  }

  const logArrays = prepareLogs(lines, eventData)
  const batches = batchify(logArrays, config.get('batch-limit'))
  if (!config.get('hostname')) {
    config.set('hostname', s3params.Bucket.replace(DOT_REGEXP, '_'))
  }

  async.everySeries(batches, (batch, next) => {
    setTimeout(() => {
      return flush(batch, config, next)
    }, config.get('batch-interval'))
  }, callback)
}
