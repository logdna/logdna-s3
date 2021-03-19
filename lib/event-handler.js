'use strict'

const {getProperty} = require('./utils.js')

module.exports = {
  handleEvent
}

function handleEvent(event) {
  const record = getProperty(event, 'Records.0')
  if (!record) return undefined

  const key = getProperty(record, 's3.object.key')
  let timestamp = Date.now()
  if (record.eventTime) {
    const eventTimestamp = (new Date(record.eventTime)).getTime()
    if (!isNaN(eventTimestamp)) timestamp = eventTimestamp
  }

  const object = getProperty(record, 's3.object')
  const bucket = {
    name: getProperty(record, 's3.bucket.name')
  , owner: getProperty(record, 's3.bucket.ownerIdentity.principalId')
  , arn: getProperty(record, 's3.bucket.arn')
  }

  let file = ''
  if (bucket.name) {
    file = `${file}${bucket.name}/`
  }

  if (key) {
    file = `${file}${key}`
  }

  return {
    file
  , timestamp
  , meta: {
      bucket
    , object
    , region: record.awsRegion
    , source: record.eventSource
    , user: getProperty(record, 'userIdentity.principalId')
    }
  }
}
