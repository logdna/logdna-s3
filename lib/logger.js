'use strict'

const {createLogger} = require('@logdna/logger')

let logger

module.exports = {
  buildLoggerURL
, createLoggerClient
}

function buildLoggerURL(config) {
  const ssl = config.get('ssl')
  const host = config.get('ingestion-host')
  const port = config.get('ingestion-port')
  const endpoint = config.get('ingestion-endpoint')
  const protocol = ssl ? 'https' : 'http'
  const url = `${protocol}://${host}:${port}${endpoint}`
  return url
}

function createLoggerClient(config) {
  logger = createLogger(config.get('ingestion-key'), {
    flushLimit: config.get('flush-limit')
  , flushIntervalMs: config.get('flush-interval')
  , hostname: config.get('hostname')
  , indexMeta: true
  , proxy: config.get('proxy') || config.get('https-proxy') || config.get('http-proxy')
  , tags: config.get('tags')
  , url: buildLoggerURL(config)
  , UserAgent: config.get('user-agent')
  })

  return logger
}
