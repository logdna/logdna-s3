'use strict'

const {test} = require('tap')
const config = require('../../../lib/config.js')
const {buildLoggerURL} = require('../../../lib/logger.js')

const origMap = [...config.entries()]

function cleanupAfter(t) {
  t.teardown(() => {
    config.clear()
    for (const [key, val] of origMap) {
      config.set(key, val)
    }
  })
}

test('buildLoggerURL builds the correct ingestion URL', async (t) => {
  t.test('From config defaults', async (tt) => {
    const url = await buildLoggerURL(config)
    tt.equal(url, 'https://logs.logdna.com:443/logs/ingest', 'URL value is correct')
  })

  t.test('Using the newer "ingestion-xxx" env vars', async (tt) => {
    cleanupAfter(tt)
    config.set('ingestion-host', 'someserver.com')
    config.set('ingestion-port', '55500')
    config.set('ingestion-endpoint', '/our/endpoint')
    const url = await buildLoggerURL(config)
    tt.equal(
      url
    , 'https://someserver.com:55500/our/endpoint'
    , 'URL value is correct'
    )
  })

  t.test('Using ldlogssl to turn off https', async (tt) => {
    cleanupAfter(tt)
    config.set('ssl', false)
    config.set('ingestion-host', 'someserver.com')
    config.set('ingestion-port', '55500')
    config.set('ingestion-endpoint', '/our/endpoint')
    const url = await buildLoggerURL(config)
    tt.equal(
      url
    , 'http://someserver.com:55500/our/endpoint'
    , 'URL value is correct'
    )
  })
})
