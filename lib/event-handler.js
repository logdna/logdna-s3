'use strict'

const {
  getProperty
, setProperty
} = require('./utils.js')

module.exports = {
  handleEvent
}

function handleEvent(event) {
  let record = getProperty(event, 'Records.0')
  if (!record) return undefined

  let key = getProperty(record, 's3.object.key')
  if (key) {
    key = key.replace(/\+/g, ' ')
    record = setProperty(record, 's3.object.key', decodeURIComponent(key))
  }

  let timestamp = Date.now()
  if (record.eventTime) {
    timestamp = (new Date(record.eventTime)).getTime()
  }

  const object = getProperty(record, 's3.object')
  const bucket = {
    name: getProperty(record, 's3.bucket.name')
  , owner: getProperty(record, 's3.bucket.ownerIdentity.principalId')
  , arn: getProperty(record, 's3.bucket.arn')
  }

  let file = bucket.name
  if (key) {
    file = `${file}/${key}`
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
