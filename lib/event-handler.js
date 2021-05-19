'use strict'

const {object} = require('@logdna/stdlib')

module.exports = {
  handleEvent
}

function handleEvent(event) {
  const record = object.get(event, 'Records.0')
  if (!record) return undefined

  const key = object.get(record, 's3.object.key')
  let timestamp = Date.now()
  if (record.eventTime) {
    const eventTimestamp = (new Date(record.eventTime)).getTime()
    if (!isNaN(eventTimestamp)) timestamp = eventTimestamp
  }

  const bucket = {
    name: object.get(record, 's3.bucket.name')
  , owner: object.get(record, 's3.bucket.ownerIdentity.principalId')
  , arn: object.get(record, 's3.bucket.arn')
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
    , object: object.get(record, 's3.object')
    , region: record.awsRegion
    , source: record.eventSource
    , user: object.get(record, 'userIdentity.principalId')
    }
  }
}
