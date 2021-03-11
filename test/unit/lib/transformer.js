'use strict'

const zlib = require('zlib')
const {test, threw} = require('tap')

const {
  extractData
, getLogs
, prepareLogs
, s3
} = require('../../../lib/transformer.js')

const INITIAL_GETLOGS_ERROR = 'Both Bucket and Key params must be provided'
const CORRUPTED_DATA_ERROR = 'Corrupted data returned from'
const JSON_PARSE_ERROR = 'Error in Parsing the JSON Data from'
const META_EVENT_TIME = new Date(Date.now() - 1000)
const LOG_EVENT_TIME = new Date()
const LOG_LINE = 'test log'
const S3_GETOBJECT_ERROR = 's3.getObject failed to return an object'
const SAMPLE_BUCKET = 'sampleBucket'
const SAMPLE_OBJECT_KEY = 'test'
const ZLIB_GUNZIP_ERROR = 'Error in Unzipping'

test('extractData', async (t) => {
  t.test('no data', async (t) => {
    t.deepEqual(extractData(), [], 'empty array')
  })

  t.test('empty json', async (t) => {
    t.deepEqual(extractData({}), [], 'empty array')
  })

  t.test('empty array', async (t) => {
    t.deepEqual(extractData([]), [], 'empty array')
  })

  t.test('empty string', async (t) => {
    t.deepEqual(extractData(''), [], 'empty array')
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

    t.deepEqual(extractData(data), [{
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

test('getLogs', async (t) => {
  t.test('undefined params', async (t) => {
    getLogs(undefined, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, INITIAL_GETLOGS_ERROR, 'initial error')
    })
  })

  t.test('null params', async (t) => {
    getLogs(null, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, INITIAL_GETLOGS_ERROR, 'initial error')
    })
  })

  t.test('empty params', async (t) => {
    getLogs({}, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, INITIAL_GETLOGS_ERROR, 'initial error')
    })
  })

  t.test('params having just Key', async (t) => {
    getLogs({Key: SAMPLE_OBJECT_KEY}, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, INITIAL_GETLOGS_ERROR, 'initial error')
    })
  })

  t.test('params having just Bucket', async (t) => {
    getLogs({Bucket: SAMPLE_BUCKET}, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, INITIAL_GETLOGS_ERROR, 'initial error')
    })
  })

  t.test('where s3 returns an error', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const getObject = s3.getObject
    s3.getObject = function(params) {
      throw Error(S3_GETOBJECT_ERROR)
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error.split(': ')[2], S3_GETOBJECT_ERROR, 's3.getObject errors out')
    })
  })

  t.test('where s3 returns an undefined data', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const getObject = s3.getObject
    s3.getObject = function(params) {
      return undefined
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, `${CORRUPTED_DATA_ERROR} ${SAMPLE_BUCKET}/${SAMPLE_OBJECT_KEY}`
      , 's3.getObject result errors out')
    })
  })

  t.test('where s3 returns a null data', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const getObject = s3.getObject
    s3.getObject = function(params) {
      return null
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, `${CORRUPTED_DATA_ERROR} ${SAMPLE_BUCKET}/${SAMPLE_OBJECT_KEY}`
      , 's3.getObject result errors out')
    })
  })

  t.test('where s3 returns an empty data', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const getObject = s3.getObject
    s3.getObject = function(params) {
      return {}
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error, `${CORRUPTED_DATA_ERROR} ${SAMPLE_BUCKET}/${SAMPLE_OBJECT_KEY}`
      , 's3.getObject result errors out')
    })
  })

  t.test('where data is unzippable', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.gz`
    }

    const getObject = s3.getObject
    s3.getObject = function(params) {
      return {
        Body: LOG_LINE
      }
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error.split(': ')[0]
      , `${ZLIB_GUNZIP_ERROR} ${SAMPLE_BUCKET}/${params.Key}`
      , 'zlib.gunzipSync errors out')
    })
  })

  t.test('where data is zippable', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.gz`
    }

    const getObject = s3.getObject
    s3.getObject = function(params) {
      return {
        Body: zlib.gzipSync(Buffer.from(LOG_LINE))
      }
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.match(data, [{
        line: LOG_LINE
      , timestamp: /^[0-9]{13}$/
      }], 'first success')
      t.strictEqual(error, null, 'zlib.gunzipSync is clear')
    })
  })

  t.test('where data is zippable but corrupted json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.json.gz`
    }

    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = s3.getObject
    s3.getObject = function(params) {
      return {
        Body: zlib.gzipSync(Buffer.from(input + ' noise'))
      }
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.strictEqual(data, undefined, 'no success')
      t.strictEqual(error.split(': ')[0]
      , `${JSON_PARSE_ERROR} ${SAMPLE_BUCKET}/${params.Key}`
      , 'JSON.parse errors out')
    })
  })

  t.test('where data is valid zippable json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.json.gz`
    }

    const input = JSON.stringify({
      log: LOG_LINE
    })

    const getObject = s3.getObject
    s3.getObject = function(params) {
      return {
        Body: zlib.gzipSync(Buffer.from(input))
      }
    }

    t.tearDown(() => {
      s3.getObject = getObject
    })

    getLogs(params, (error, data) => {
      t.match(data, [{
        line: input
      , timestamp: /^[0-9]{13}$/
      }], 'JSON success')
      t.strictEqual(error, null, 'JSON.parse is clear')
    })
  })
}).catch(threw)

test('prepareLogs', async (t) => {
  t.test('undefined logs', async (t) => {
    t.strictEqual(prepareLogs(null, null), undefined, 'must return undefined')
  })

  t.test('non-Array logs', async (t) => {
    t.strictEqual(prepareLogs({
      logs: ['logs']
    }, null), undefined, 'must return undefined')
  })

  t.test('array logs not having line field', async (t) => {
    t.deepEqual(prepareLogs([{
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
      item.timestamp = /^[0-9]{13}$/
      item.meta = {}
      return item
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
      item.timestamp = /^[0-9]{13}$/
      return item
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
      item.file = undefined
      return item
    })

    t.deepEqual(prepareLogs(input, null), output
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
      item.timestamp = eventData.timestamp
      item.file = eventData.file
      item.meta = {
        ...item.meta
      , ...eventData.meta
      }

      return item
    })

    t.deepEqual(prepareLogs(input, eventData), output
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
      item.timestamp = /^[0-9]{13}$/
      item.file = eventData.file
      item.meta = {
        ...item.meta
      , ...eventData.meta
      }

      return item
    })

    t.match(prepareLogs(input, eventData), output
    , 'must return an array with default timestamp')
  })
}).catch(threw)
