'use strict'

const {once} = require('events')
const {object} = require('@logdna/stdlib')

const config = require('./lib/config.js')
const {handleEvent} = require('./lib/event-handler.js')
const {createLoggerClient} = require('./lib/logger.js')
const {getLogs, prepareLogs} = require('./lib/transformer.js')
const {trimTags} = require('./lib/utils/index.js')

const HOSTNAME_REGEX = /[^0-9a-zA-Z\-.]/g

module.exports = {
  handler
}

async function handler(event, context) {
  config.validateEnvVars()
  const eventData = handleEvent(event)
  if (!eventData) {
    const error = new Error('Cannot Parse the S3 Event')
    error.meta = {event}
    throw error
  }

  const s3params = {
    Bucket: object.get(eventData, 'meta.bucket.name')
  , Key: object.get(eventData, 'meta.object.key')
  }

  const tags = config.get('tags')
  if (tags) {
    config.set('tags', trimTags(tags))
  }

  const hostname = config.get('hostname') || s3params.Bucket
  if (hostname) {
    config.set('hostname', hostname.replace(HOSTNAME_REGEX, ''))
  }

  const logger = createLoggerClient(config)
  const lines = await getLogs(s3params)
  logger.on('error', console.error)
  logger.on('warn', console.warn)
  const logs = prepareLogs(lines, eventData)
  for (const log of logs) {
    const {line, opts} = log
    logger.log(line, opts)
  }

  // Ensure logs have been flushed to LogDNA before finishing
  await once(logger, 'cleared')
  return 'Done!'
}
