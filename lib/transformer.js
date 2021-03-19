'use strict'

const {promisify} = require('util')
const zlib = require('zlib')
const aws = require('aws-sdk')
const {
  checkFileFormat
, formatObjectKey
, hasProperty
} = require('./utils.js')

const s3 = new aws.S3({
  apiVersion: '2006-03-01'
})

module.exports = exports = {
  extractData
, getLogs
, prepareLogs
, getObject: promisify(s3.getObject.bind(s3))
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
  if (!hasProperty(params, 'Key') || !hasProperty(params, 'Bucket')) {
    err = new Error('Both Bucket and Key params must be provided')
    err.meta = {params}
    throw err
  }

  let data
  try {
    data = await exports.getObject(params)
  } catch (error) {
    err = new Error('Error in Getting the S3 Object')
    err.meta = {error, params}
    throw err
  }

  if (!hasProperty(data, 'Body')) {
    err = new Error('Corrupted data returned from the object')
    err.meta = {params}
    throw err
  }

  let content = data.Body
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
