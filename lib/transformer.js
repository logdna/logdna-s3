'use strict'

const aws = require('aws-sdk')
const zlib = require('zlib')

const formatter = require('./formatter.js')

const BATCH_LIMIT = parseInt(process.env.LOGDNA_BATCH_LIMIT) || 25
const s3 = new aws.S3({
  apiVersion: '2006-03-01'
})

const batchify = (logs) => {
  const batches = []
  let batch = [], batch_size = 0
  logs.forEach((log) => {
    batch.push(log)
    batch_size += 1
    if (batch_size >= BATCH_LIMIT) {
      batches.push(batch)
      batch = []
      batch_size = 0
    }
  })

  if (batch_size > 0) { batches.push(batch) }
  return batches
}

const extractData = (data) => {
  const {Records, logFiles, ...meta} = data
  const ts = meta && meta.eventTime ? (new Date(meta.eventTime)).getTime() : undefined
  data = Records || logFiles || data
  return Array.isArray(data) ? data.map((entry) => {
    return {
      line: JSON.stringify(entry)
    , meta
    , timestamp: entry.eventTime ? (new Date(entry.eventTime)).getTime() : ts
    }
  }) : [{line: JSON.stringify(data), meta, timestamp: ts}]
}

const getLogs = (params, callback) => {
  const keyFormat = formatter.checkFileFormat(params.Key)
  return s3.getObject(params, (error, data) => {
    if (error) {
      return callback(`Error in Getting ${params.Key} from ${params.Bucket}: ${error}`)
    }

    data = keyFormat.gz ? zlib.gunzipSync(data.Body) : data.Body
    data = data.toString('ascii')
    if (keyFormat.json) {
      try {
        data = JSON.parse(data)
        return callback(null, extractData(data))
      } catch (e) {
        return callback(`Error in Parsing the Data from JSON file ${params.Key}: ${e}`)
      }
    }

    return callback(null, data.split('\n').map((line) => {
      return {line}
    }))
  })
}

const prepareLogs = (logs, eventData) => {
  return logs.filter(log => log !== '').map((log) => {
    return {
      file: eventData.file
    , timestamp: log.timestamp || eventData.timestamp
    , meta: {...eventData.meta, ...log.meta}
    , line: log.line
    }
  })
}

module.exports = {
  batchify
, extractData
, getLogs
, prepareLogs
}
