'use strict'

const zlib = require('zlib')
const {test, threw} = require('tap')

const transformer = require('../../../lib/transformer.js')
const s3helper = require('../../../lib/aws-s3-v2-wrapper.js')
const {
  extractData
, getLogs
, prepareLogs
} = transformer

/* eslint-disable */
const INITIAL_GETLOGS_ERROR = 'Both Bucket and Key params must be provided'
const JSON_PARSE_ERROR = 'Error in Parsing the JSON Data from the S3 Object'
const META_EVENT_TIME = new Date(Date.now() - 1000)
const LOG_EVENT_TIME = new Date()
const LOG_LINE = 'test log'
const SAMPLE_BUCKET = 'sampleBucket'
const SAMPLE_OBJECT_KEY = 'test'
const ZLIB_GUNZIP_ERROR = 'Error in Unzipping the S3 Object'
/* eslint-enable */

test('extractData', async (t) => {
  t.test('no data', async (t) => {
    t.same(extractData(), [], 'empty array')
  })

  t.test('empty json', async (t) => {
    t.same(extractData({}), [], 'empty array')
  })

  t.test('empty array', async (t) => {
    t.same(extractData([]), [], 'empty array')
  })

  t.test('empty string', async (t) => {
    t.same(extractData(''), [], 'empty array')
  })

  t.test('data having Records array containing json', async (t) => {
    const data = {
      Records: [{
        log: `${LOG_LINE} 0`
      , eventTime: LOG_EVENT_TIME
      }, {
        log: `${LOG_LINE} 1`
      , eventTime: LOG_EVENT_TIME
      }]
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data.Records[0])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(LOG_EVENT_TIME)).getTime()
    }, {
      line: JSON.stringify(data.Records[1])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(LOG_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having Records array containing json without eventTime', async (t) => {
    const data = {
      Records: [{
        log: `${LOG_LINE} 0`
      }, {
        log: `${LOG_LINE} 1`
      }]
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data.Records[0])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }, {
      line: JSON.stringify(data.Records[1])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having Records array containing non-json', async (t) => {
    const data = {
      Records: [
        `${LOG_LINE} 0`
      , `${LOG_LINE} 1`
      ]
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: data.Records[0]
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }, {
      line: data.Records[1]
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having json Records', async (t) => {
    const data = {
      Records: {
        log: LOG_LINE
      }
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data.Records)
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having string Records', async (t) => {
    const data = {
      Records: LOG_LINE
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: data.Records
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having string Records without eventTime', async (t) => {
    const data = {
      Records: LOG_LINE
    , sampleField: 'test'
    }

    t.match(extractData(data), [{
      line: data.Records
    , meta: {
        sampleField: data.sampleField
      }
    , timestamp: /^[0-9]{13}$/
    }])
  })

  t.test('data having logFiles array containing json', async (t) => {
    const data = {
      logFiles: [{
        log: `${LOG_LINE} 0`
      , eventTime: LOG_EVENT_TIME
      }, {
        log: `${LOG_LINE} 1`
      , eventTime: LOG_EVENT_TIME
      }]
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data.logFiles[0])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(LOG_EVENT_TIME)).getTime()
    }, {
      line: JSON.stringify(data.logFiles[1])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(LOG_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having logFiles array containing json without eventTime', async (t) => {
    const data = {
      logFiles: [{
        log: `${LOG_LINE} 0`
      }, {
        log: `${LOG_LINE} 1`
      }]
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data.logFiles[0])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }, {
      line: JSON.stringify(data.logFiles[1])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having logFiles array containing non-json', async (t) => {
    const data = {
      logFiles: [
        `${LOG_LINE} 0`
      , `${LOG_LINE} 1`
      ]
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: data.logFiles[0]
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }, {
      line: data.logFiles[1]
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having json logFiles', async (t) => {
    const data = {
      logFiles: {
        log: LOG_LINE
      }
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data.logFiles)
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having string logFiles', async (t) => {
    const data = {
      logFiles: LOG_LINE
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: data.logFiles
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data having string logFiles without eventTime', async (t) => {
    const data = {
      logFiles: LOG_LINE
    , sampleField: 'test'
    }

    t.match(extractData(data), [{
      line: data.logFiles
    , meta: {
        sampleField: data.sampleField
      }
    , timestamp: /^[0-9]{13}$/
    }])
  })

  t.test('data not having Records or logFiles', async (t) => {
    const data = {
      log: LOG_LINE
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data)
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })

  t.test('data not having Records or logFiles nor eventTime', async (t) => {
    const data = {
      log: LOG_LINE
    , sampleField: 'test'
    }

    t.match(extractData(data), [{
      line: JSON.stringify(data)
    , timestamp: /^[0-9]{13}$/
    }])
  })

  t.test('data having both Records and logFiles array containing json', async (t) => {
    const data = {
      logFiles: [{
        log: `${LOG_LINE} 0`
      , eventTime: LOG_EVENT_TIME
      }, {
        log: `${LOG_LINE} 1`
      , eventTime: LOG_EVENT_TIME
      }]
    , Records: [{
        log: `${LOG_LINE} 0`
      }, {
        log: `${LOG_LINE} 1`
      }]
    , eventTime: META_EVENT_TIME
    , sampleField: 'test'
    }

    t.same(extractData(data), [{
      line: JSON.stringify(data.Records[0])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }, {
      line: JSON.stringify(data.Records[1])
    , meta: {
        eventTime: data.eventTime
      , sampleField: data.sampleField
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }])
  })
}).catch(threw)

test('prepareLogs', async (t) => {
  t.test('undefined logs', async (t) => {
    t.same(prepareLogs(null, null), [], 'must return an empty array')
  })

  t.test('non-Array logs', async (t) => {
    t.same(prepareLogs({
      logs: ['logs']
    }, null), [], 'must return an empty array')
  })

  t.test('array logs not having line field', async (t) => {
    t.same(prepareLogs([{
      ts: Date.now()
    }, undefined], null), [], 'must return an empty array')
  })

  t.test('array of logs without meta, timestamp, and eventData', async (t) => {
    const input = Array.from({
      length: 5
    }, function(_, i) {
      return {
        line: `${LOG_LINE} ${i}`
      }
    })

    const output = input.map(function(item) {
      const line = item.line
      const opts = {
        timestamp: /^[0-9]{13}$/
      , meta: {}
      }

      return {line, opts}
    })

    t.match(prepareLogs(input, null), output, 'must return an array with no meta')
  })

  t.test('array of logs without timestamp and eventData', async (t) => {
    const input = Array.from({
      length: 5
    }, function(_, i) {
      return {
        line: `${LOG_LINE} ${i}`
      , meta: {
          sampleField: 'sample'
        }
      }
    })

    const output = input.map(function(item) {
      const line = item.line
      const opts = {
        timestamp: /^[0-9]{13}$/
      , meta: item.meta
      }

      return {line, opts}
    })

    t.match(prepareLogs(input, null), output, 'must return an array with meta')
  })

  t.test('array of logs without eventData', async (t) => {
    const input = Array.from({
      length: 5
    }, function(_, i) {
      return {
        line: `${LOG_LINE} ${i}`
      , meta: {
          sampleField: 'sample'
        }
      , timestamp: (new Date(LOG_EVENT_TIME)).getTime()
      }
    })

    const output = input.map(function(item) {
      const line = item.line
      const opts = {
        app: undefined
      , meta: item.meta
      , timestamp: item.timestamp
      }

      return {line, opts}
    })

    t.same(prepareLogs(input, null), output
    , 'must return an array with meta and timestamp')
  })

  t.test('array of logs with full eventData', async (t) => {
    const input = Array.from({
      length: 5
    }, function(_, i) {
      return {
        line: `${LOG_LINE} ${i}`
      , meta: {
          sampleField: 'sample'
        }
      }
    })

    const eventData = {
      file: SAMPLE_OBJECT_KEY
    , meta: {
        eventField: 'sampleEvent'
      }
    , timestamp: (new Date(META_EVENT_TIME)).getTime()
    }

    const output = input.map(function(item) {
      const line = item.line
      const opts = {
        app: eventData.file
      , timestamp: eventData.timestamp
      , meta: {
          ...item.meta
        , ...eventData.meta
        }
      }

      return {line, opts}
    })

    t.same(prepareLogs(input, eventData), output
    , 'must return an array with full data')
  })

  t.test('array of logs with no timestamp', async (t) => {
    const input = Array.from({
      length: 5
    }, function(_, i) {
      return {
        line: `${LOG_LINE} ${i}`
      , meta: {
          sampleField: 'sample'
        }
      }
    })

    const eventData = {
      file: SAMPLE_OBJECT_KEY
    , meta: {
        eventField: 'sampleEvent'
      }
    }

    const output = input.map(function(item) {
      const line = item.line
      const opts = {
        app: eventData.file
      , timestamp: /^[0-9]{13}$/
      , meta: {
          ...item.meta
        , ...eventData.meta
        }
      }

      return {line, opts}
    })

    t.match(prepareLogs(input, eventData), output
    , 'must return an array with default timestamp')
  })
}).catch(threw)

test('getLogs', async (t) => {
  t.test('undefined params', async (t) => {
    try {
      await getLogs(undefined)
    } catch (error) {
      t.equal(error.message, INITIAL_GETLOGS_ERROR
      , 'error message should be strictly equal')
      t.same(error.meta, {params: undefined}, 'error meta should be deeply equal')
    }
  })


  t.test('null params', async (t) => {
    try {
      await getLogs(null)
    } catch (error) {
      t.equal(error.message, INITIAL_GETLOGS_ERROR
      , 'error message should be strictly equal')
      t.same(error.meta, {params: null}, 'error meta should be deeply equal')
    }
  })


  t.test('empty params', async (t) => {
    try {
      await getLogs({})
    } catch (error) {
      t.equal(error.message, INITIAL_GETLOGS_ERROR
      , 'error message should be strictly equal')
      t.same(error.meta, {params: {}}, 'error meta should be deeply equal')
    }
  })

  t.test('params having just Key', async (t) => {
    const params = {Key: SAMPLE_OBJECT_KEY}
    try {
      await getLogs(params)
    } catch (error) {
      t.equal(error.message, INITIAL_GETLOGS_ERROR
      , 'error message should be strictly equal')
      t.same(error.meta, {params}, 'error meta should be deeply equal')
    }
  })

  t.test('params having just Bucket', async (t) => {
    const params = {Bucket: SAMPLE_BUCKET}
    try {
      await getLogs(params)
    } catch (error) {
      t.equal(error.message, INITIAL_GETLOGS_ERROR
      , 'error message should be strictly equal')
      t.same(error.meta, {params}, 'error meta should be deeply equal')
    }
  })

  t.test('where data is unzippable', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.gz`
    }

    const type = {
      json: false
    , gz: true
    }

    const getObject = s3helper.getObject
    s3helper.getObject = async function(params) {
      return LOG_LINE
    }

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    await t.rejects(getLogs(params), {
      message: ZLIB_GUNZIP_ERROR
    , meta: {params, type}
    }, 'Expected error is thrown')
  })


  t.test('where data is zippable', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.gz`
    }

    const getObject = s3helper.getObject
    s3helper.getObject = async function(params) {
      return zlib.gzipSync(Buffer.from(LOG_LINE))
    }

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    const data = await getLogs(params)
    t.match(data, [{
      line: LOG_LINE
    , timestamp: /^[0-9]{13}$/
    }], 'first success')
  })

  t.test('where data is valid zippable json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.json.gz`
    }

    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = s3helper.getObject
    s3helper.getObject = async function(params) {
      return zlib.gzipSync(Buffer.from(input))
    }

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    const data = await getLogs(params)
    t.match(data, [{
      line: input
    , timestamp: /^[0-9]{13}$/
    }], 'Zipped JSON success')
  })

  t.test('where data is zippable but corrupted json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.json.gz`
    }

    const type = {
      json: true
    , gz: true
    }

    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = s3helper.getObject
    s3helper.getObject = async function(params) {
      return zlib.gzipSync(Buffer.from(input + ' noise'))
    }

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    await t.rejects(getLogs(params), {
      message: JSON_PARSE_ERROR
    , meta: {params, type}
    }, 'Expected error is thrown')
  })

  t.test('where data is valid json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.json`
    }

    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = s3helper.getObject
    s3helper.getObject = async function(params) {
      return input
    }

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    const data = await getLogs(params)
    t.match(data, [{
      line: input
    , timestamp: /^[0-9]{13}$/
    }], 'JSON success')
  })

  t.test('where data is valid non-json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.log`
    }

    const input = [
      `${LOG_LINE} 0`
    , `${LOG_LINE} 1`
    , `${LOG_LINE} 2`
    ].join('\n')

    const getObject = s3helper.getObject
    s3helper.getObject = async function(params) {
      return input
    }

    t.teardown(() => {
      s3helper.getObject = getObject
    })

    const data = await getLogs(params)
    t.match(data, [{
      line: `${LOG_LINE} 0`
    , timestamp: /^[0-9]{13}$/
    }, {
      line: `${LOG_LINE} 1`
    , timestamp: /^[0-9]{13}$/
    }, {
      line: `${LOG_LINE} 2`
    , timestamp: /^[0-9]{13}$/
    }], 'JSON success')
  })

  t.test('where data is valid gzipped non-json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.jsonl.gz`
    }

    const input = [
      `${LOG_LINE} 0`
    , `${LOG_LINE} 1`
    , `${LOG_LINE} 2`
    ].join('\n')

    const getObject = s3helper.getObject
    s3helper.getObject = async function(params) {
      return zlib.gzipSync(Buffer.from(input))
    }

    t.teardown(() => {
      transformer.getObject = getObject
    })

    const data = await getLogs(params)
    t.match(data, [{
      line: `${LOG_LINE} 0`
    , timestamp: /^[0-9]{13}$/
    }, {
      line: `${LOG_LINE} 1`
    , timestamp: /^[0-9]{13}$/
    }, {
      line: `${LOG_LINE} 2`
    , timestamp: /^[0-9]{13}$/
    }], 'JSON success')
  })
}).catch(threw)
