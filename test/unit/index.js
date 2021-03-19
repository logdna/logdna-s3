'use strict'
process.env.INGESTION_KEY = 'abc213'

const {test, threw} = require('tap')

const config = require('../../lib/config.js')
const {handler} = require('../../index.js')
const {setProperty} = require('../../lib/utils.js')
const transformer = require('../../lib/transformer.js')

const BUCKET_NAME = 'random_name'
const EMPTY_EVENT = {}
const ERROR_MESSAGE = 'A connection-based error occurred that will not be retried.'
  + ' See meta data for details.'
const ERROR_STATUS_CODE = 403
const EVENT_ERROR_MESSAGE = 'Cannot Parse the S3 Event'
const FILE_NAME = 'log+File.json'
const LOG_LINE = 'test log'
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

test('handler is the main method in lambda functions', async (t) => {
  t.test('test with empty event', async (t) => {
    await t.rejects(handler(EMPTY_EVENT, null), {
      message: EVENT_ERROR_MESSAGE
    , meta: {
        event: EMPTY_EVENT
      }
    }, 'Expected error is thrown')
  })

  t.test('test without tags', async (t) => {
    config.set('hostname', undefined)
    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = transformer.getObject
    transformer.getObject = async function({
      Bucket: BUCKET_NAME
    , Key: FILE_NAME
    }) {
      return {
        Body: input
      }
    }

    t.tearDown(() => {
      transformer.getObject = getObject
    })

    await t.rejects(handler(EVENT_DATA, null), {
      message: ERROR_MESSAGE
    , meta: {
        code: ERROR_STATUS_CODE
      , firstLine: input
      , lastLine: null
      , retrying: false
      , attempts: 1
      }
    }, 'Expected error is thrown')
  })

  t.test('test with tags', async (t) => {
    config.set('hostname', undefined)
    config.set('tags', `${BUCKET_NAME},, ,${FILE_NAME}`)
    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = transformer.getObject
    transformer.getObject = async function({
      Bucket: BUCKET_NAME
    , Key: FILE_NAME
    }) {
      return {
        Body: input
      }
    }

    t.tearDown(() => {
      transformer.getObject = getObject
    })

    await t.rejects(handler(EVENT_DATA, null), {
      message: ERROR_MESSAGE
    , meta: {
        code: ERROR_STATUS_CODE
      , firstLine: input
      , lastLine: null
      , retrying: false
      , attempts: 1
      }
    }, 'Expected error is thrown')
  })

  t.test('test without hostname', async (t) => {
    setProperty(EVENT_DATA, 'Records.0.s3.bucket.name', undefined)
    config.set('hostname', undefined)
    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = transformer.getObject
    transformer.getObject = async function({
      Bucket: BUCKET_NAME
    , Key: FILE_NAME
    }) {
      return {
        Body: input
      }
    }

    t.tearDown(() => {
      transformer.getObject = getObject
    })

    await t.rejects(handler(EVENT_DATA, null), {
      message: ERROR_MESSAGE
    , meta: {
        code: ERROR_STATUS_CODE
      , firstLine: input
      , lastLine: null
      , retrying: false
      , attempts: 1
      }
    }, 'Expected error is thrown')
  })
}).catch(threw)
