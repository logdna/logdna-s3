'use strict'

const formatter = require('./formatter.js')

const parseEvent = (event) => {
  const key = event.Records[0].s3.object.key
  event.Records[0].s3.object.key = decodeURIComponent(key.replace(/\+/g, ' '))
  return {
    event: {
      version: event.Records[0].eventVersion
    , source: event.Records[0].eventSource
    , time: event.Records[0].eventTime
    , name: event.Records[0].eventName
    }
  , s3: {
      region: event.Records[0].awsRegion
    , user: event.Records[0].userIdentity.principalId
    , schema: event.Records[0].s3.s3SchemaVersion
    , configuration: event.Records[0].s3.configurationId
    }
  , bucket: {
      name: event.Records[0].s3.bucket.name
    , owner: event.Records[0].s3.bucket.ownerIdentity.principalId
    , arn: event.Records[0].s3.bucket.arn
    }, object: event.Records[0].s3.object
  }
}

const prepareEvent = (eventData) => {
  return {
    ...eventData
  , line: formatter.formatMessage(eventData)
  }
}

const processEvent = (eventData) => {
  return {
    file: `${eventData.bucket.name}/${eventData.object.key}`
  , timestamp: (new Date(eventData.event.time)).getTime()
  , meta: {
      bucket: eventData.bucket
    , object: eventData.object
    , region: eventData.s3.region
    , source: eventData.event.source
    , user: eventData.event.user
    }
  }
}

module.exports = {
  parseEvent
, prepareEvent
, processEvent
}
