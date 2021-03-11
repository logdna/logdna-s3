'use strict'

const zlib = require('zlib')
const aws = require('aws-sdk')
const {
  checkFileFormat
, hasProperty
} = require('./utils.js')

const s3 = new aws.S3({
  apiVersion: '2006-03-01'
})

module.exports = {
  extractData
, getLogs
, prepareLogs
, s3
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

async function getLogs(params, callback) {
  if (!hasProperty(params, 'Key') || !hasProperty(params, 'Bucket')) {
    return callback('Both Bucket and Key params must be provided')
  }

  const keyFormat = checkFileFormat(params.Key)
  let data
  try {
    data = await s3.getObject(params)
  } catch (e) {
    return callback(`Error in Getting ${params.Bucket}/${params.Key}: ${e}`)
  }

  if (!hasProperty(data, 'Body')) {
    return callback(`Corrupted data returned from ${params.Bucket}/${params.Key}`)
  }

  let content = data.Body
  if (keyFormat.gz) {
    try {
      content = zlib.gunzipSync(content)
    } catch (e) {
      return callback(`Error in Unzipping ${params.Bucket}/${params.Key}: ${e}`)
    }
  }

  content = content.toString('ascii')
  if (keyFormat.json) {
    try {
      content = JSON.parse(content)
    } catch (e) {
      return callback('Error in Parsing the JSON Data from '
        + `${params.Bucket}/${params.Key}: ${e}`)
    }
  }

  return callback(null, extractData(content))
}

function prepareLogs(logs, eventData) {
  if (!logs || !Array.isArray(logs)) return undefined

  return logs.filter((log) => {
    return log && log.line
  }).map((log) => {
    const result = {
      file: undefined
    , line: log.line
    , meta: {...log.meta}
    , timestamp: Date.now()
    }

    if (eventData) {
      result.file = eventData.file
      result.meta = {...eventData.meta, ...result.meta}
    }

    if (log.timestamp) {
      result.timestamp = log.timestamp
    } else if (eventData && eventData.timestamp) {
      result.timestamp = eventData.timestamp
    }

    return result
  })
}
