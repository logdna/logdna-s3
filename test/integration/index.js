'use strict'
process.env.INGESTION_KEY = 'abc123'

const os = require('os')
const nock = require('nock')
const {test, threw} = require('tap')
const {object} = require('@logdna/stdlib')

const {buildLoggerURL} = require('../../lib/logger.js')
const config = require('../../lib/config.js')
const {handler} = require('../../index.js')
const s3helper = require('../../lib/aws-s3-v2-wrapper.js')
const {
  formatObjectKey
, trimTags
} = require('../../lib/utils/index.js')

const responseText = 'This is the ingester response'
const BUCKET_NAME = 'random-name'
const FILE_NAME = 'log+File.json'
const HOSTNAME_REGEX = /[^0-9a-zA-Z\-.]/g
const LOG_LEVEL = 'INFO'
const LOG_LINE = 'test log'
const SAMPLE_HOSTNAME = 'sampleHostname/test'
const SAMPLE_TAGS = ' ,test,sample ,something'
const TIMESTAMP = Date.now()
const EVENT_DATA = {
  Records: [{
    eventTime: new Date(TIMESTAMP)
  , s3: {
      bucket: {
        name: BUCKET_NAME
      }
    , object: {
        key: FILE_NAME
      }
    }
  }]
}

// NOTE: We will NOT test the use of ENV vars directly here since they are cumbersome
// to work with (they can never be updated). For this, we will trust that env-config
// will do its job and read from the envrionment properly, but we will set the
// config's keys manually in these tests.
config.validateEnvVars()
nock.disableNetConnect()

test('test getting, parsing, and sending S3 event', async (t) => {
  t.test('test fully', async (t) => {
    t.on('end', async () => {
      nock.cleanAll()
    })

    config.set('tags', SAMPLE_TAGS)
    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = s3helper.getObject
    s3helper.getObject = async function({
      Bucket: BUCKET_NAME
    , Key: FILE_NAME
    }) {
      return input
    }

    nock(buildLoggerURL(config))
      .post('', (body) => {
        const numProps = Object.keys(body).length
        t.equal(numProps, 2, 'Number of request body properties')
        t.match(body, {
          e: 'ls'
        , ls: [
            {
              app: `${BUCKET_NAME}/${formatObjectKey(FILE_NAME)}`
            , level: LOG_LEVEL
            , line: input
            , meta: {
                bucket: object.get(EVENT_DATA, 'Records.0.s3.bucket')
              , object: object.get(EVENT_DATA, 'Records.0.s3.object')
              }
            , timestamp: Number
            }
          ]
        })
        t.equal(body.ls.length, 1, 'log line count')
        return true
      })
      .query((qs) => {
        t.match(qs, {
          hostname: String
        , tags: trimTags(SAMPLE_TAGS)
        , now: /^\d+$/
        }, 'Querystring properties look correct')
        return true
      })
      .reply(200, responseText)

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    await handler(EVENT_DATA, null)
  })

  t.test('test without tags', async (t) => {
    t.on('end', async () => {
      nock.cleanAll()
    })

    config.set('tags', undefined)
    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = s3helper.getObject
    s3helper.getObject = async function({
      Bucket: BUCKET_NAME
    , Key: FILE_NAME
    }) {
      return input
    }

    nock(buildLoggerURL(config))
      .post('', (body) => {
        const numProps = Object.keys(body).length
        t.equal(numProps, 2, 'Number of request body properties')
        t.match(body, {
          e: 'ls'
        , ls: [
            {
              app: `${BUCKET_NAME}/${formatObjectKey(FILE_NAME)}`
            , level: LOG_LEVEL
            , line: input
            , meta: {
                bucket: object.get(EVENT_DATA, 'Records.0.s3.bucket')
              , object: object.get(EVENT_DATA, 'Records.0.s3.object')
              }
            , timestamp: Number
            }
          ]
        })
        t.equal(body.ls.length, 1, 'log line count')
        return true
      })
      .query((qs) => {
        t.match(qs, {
          hostname: String
        , tags: ''
        , now: /^\d+$/
        }, 'Querystring properties look correct')
        return true
      })
      .reply(200, responseText)

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    await handler(EVENT_DATA, null)
  })

  t.test('test without tags and no bucket name', async (t) => {
    t.on('end', async () => {
      nock.cleanAll()
    })

    const input = JSON.stringify({
      log: LOG_LINE
    })

    object.set(EVENT_DATA, 'Records.0.s3.bucket.name', undefined)
    config.set('hostname', undefined)
    const getObject = s3helper.getObject
    s3helper.getObject = async function({
      Bucket: BUCKET_NAME
    , Key: FILE_NAME
    }) {
      return input
    }

    nock(buildLoggerURL(config))
      .post('', (body) => {
        const numProps = Object.keys(body).length
        t.equal(numProps, 2, 'Number of request body properties')
        t.match(body, {
          e: 'ls'
        , ls: [
            {
              app: formatObjectKey(FILE_NAME)
            , level: LOG_LEVEL
            , line: input
            , meta: {
                bucket: object.get(EVENT_DATA, 'Records.0.s3.bucket')
              , object: object.get(EVENT_DATA, 'Records.0.s3.object')
              }
            , timestamp: Number
            }
          ]
        })
        t.equal(body.ls.length, 1, 'log line count')
        return true
      })
      .query((qs) => {
        t.match(qs, {
          hostname: os.hostname()
        , tags: ''
        , now: /^\d+$/
        }, 'Querystring properties look correct')
        return true
      })
      .reply(200, responseText)

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    await handler(EVENT_DATA, null)
  })

  t.test('test without tags, bucket name but predefined hostname', async (t) => {
    t.on('end', async () => {
      nock.cleanAll()
    })

    const input = JSON.stringify({
      log: LOG_LINE
    })

    config.set('hostname', SAMPLE_HOSTNAME)
    const getObject = s3helper.getObject
    s3helper.getObject = async function({
      Bucket: BUCKET_NAME
    , Key: FILE_NAME
    }) {
      return input
    }

    nock(buildLoggerURL(config))
      .post('', (body) => {
        const numProps = Object.keys(body).length
        t.equal(numProps, 2, 'Number of request body properties')
        t.match(body, {
          e: 'ls'
        , ls: [
            {
              app: formatObjectKey(FILE_NAME)
            , level: LOG_LEVEL
            , line: input
            , meta: {
                bucket: object.get(EVENT_DATA, 'Records.0.s3.bucket')
              , object: object.get(EVENT_DATA, 'Records.0.s3.object')
              }
            , timestamp: Number
            }
          ]
        })
        t.equal(body.ls.length, 1, 'log line count')
        return true
      })
      .query((qs) => {
        t.match(qs, {
          hostname: SAMPLE_HOSTNAME.replace(HOSTNAME_REGEX, '')
        , tags: ''
        , now: /^\d+$/
        }, 'Querystring properties look correct')
        return true
      })
      .reply(200, responseText)

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    await handler(EVENT_DATA, null)
  })
}).catch(threw)
