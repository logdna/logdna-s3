'use strict'

const zlib = require('zlib')
const {object} = require('@logdna/stdlib')
const {
  checkFileFormat
, formatObjectKey
} = require('./utils/index.js')

const s3helper = require('./aws-s3-v2-wrapper.js')

module.exports = exports = {
  extractData
, getLogs
, prepareLogs
}

function extractData(data) {
  if (!data || !Object.keys(data).length) return []

  const {
    Records
  , logFiles
  , ...meta
  } = data

  const base = {
    timestamp: Date.now()
  }

  let records = data
  if (Records) {
    records = Records
    base.meta = meta
  } else if (logFiles) {
    records = logFiles
    base.meta = meta
  }

  if (meta && meta.eventTime) {
    base.timestamp = (new Date(meta.eventTime)).getTime()
  }

  if (!Array.isArray(records)) {
    const lineJSON = {
      line: records
    , ...base
    }

    if (typeof records !== 'string') {
      lineJSON.line = JSON.stringify(records)
    }

    return [lineJSON]
  }

  return records.map((record) => {
    const lineJSON = {
      line: record
    , ...base
    }

    if (typeof record !== 'string') {
      lineJSON.line = JSON.stringify(record)
    }

    if (record.eventTime) {
      lineJSON.timestamp = (new Date(record.eventTime)).getTime()
    }

    return lineJSON
  })
}

async function getLogs(params) {
  let err
  if (!object.has(params, 'Key') || !object.has(params, 'Bucket')) {
    err = new Error('Both Bucket and Key params must be provided')
    err.meta = {params}
    throw err
  }



  let content = await s3helper.getObject(params)
  const type = checkFileFormat(params.Key)
  if (type.gz) {
    try {
      content = zlib.gunzipSync(content)
    } catch (error) {
      err = new Error('Error in Unzipping the S3 Object')
      err.meta = {error, params, type}
      throw err
    }
  }

  content = content.toString('ascii')
  if (type.json) {
    try {
      content = JSON.parse(content)
    } catch (error) {
      err = new Error('Error in Parsing the JSON Data from the S3 Object')
      err.meta = {error, params, type}
      throw err
    }
  }

  if (typeof content === 'string') {
    content = content.split('\n')
  }

  content = extractData(content)
  return content
}

function prepareLogs(logs, eventData) {
  let logObjects = []
  if (logs && Array.isArray(logs)) {
    logObjects = logs.filter((log) => {
      return log && log.line
    }).map((log) => {
      const line = log.line
      const opts = {
        app: undefined
      , meta: {...log.meta}
      , timestamp: Date.now()
      }

      if (eventData) {
        opts.app = formatObjectKey(eventData.file)
        opts.meta = {...eventData.meta, ...opts.meta}
      }

      if (log.timestamp) {
        opts.timestamp = log.timestamp
      } else if (eventData && eventData.timestamp) {
        opts.timestamp = eventData.timestamp
      }

      return {line, opts}
    })
  }

  return logObjects
}
