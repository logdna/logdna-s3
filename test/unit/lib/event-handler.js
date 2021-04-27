'use strict'

const {test, threw} = require('tap')
const {
  handleEvent
} = require('../../../lib/event-handler.js')

const AWS_REGION = 'us-east'
const BUCKET_ARN = 'random_arn'
const BUCKET_NAME = 'random_name'
const EVENT_SOURCE = 'test_source'
const FILE_NAME = 'log+File.json.gz'
const PRINCIPAL_ID = 'random_principalId'
const TIMESTAMP = Date.now()

test('handleEvent', async (t) => {
  t.test('no data', async (t) => {
    t.same(handleEvent(), undefined, 'empty input')
  })

  t.test('event with no object and no event time', async (t) => {
    const event = {
      Records: [{
        awsRegion: AWS_REGION
      , eventSource: EVENT_SOURCE
      , s3: {
          bucket: {
            arn: BUCKET_ARN
          , name: BUCKET_NAME
          , ownerIdentity: {
              principalId: PRINCIPAL_ID
            }
          }
        }
      , userIdentity: {
          principalId: PRINCIPAL_ID
        }
      }]
    }

    t.match(handleEvent(event), {
      file: BUCKET_NAME
    , timestamp: /^[0-9]{13}$/
    , meta: {
        bucket: {
          name: BUCKET_NAME
        , owner: PRINCIPAL_ID
        , arn: BUCKET_ARN
        }
      , object: undefined
      , region: AWS_REGION
      , source: EVENT_SOURCE
      , user: PRINCIPAL_ID
      }
    }, 'should pass this event')
  })

  t.test('event with invalid data', async (t) => {
    const event = {
      Records: [{
        awsRegion: AWS_REGION
      , eventSource: EVENT_SOURCE
      , eventTime: BUCKET_NAME
      , s3: {
          bucket: {
            arn: BUCKET_ARN
          , name: BUCKET_NAME
          , ownerIdentity: {
              principalId: PRINCIPAL_ID
            }
          }
        , object: {
            key: FILE_NAME
          }
        }
      , userIdentity: {
          principalId: PRINCIPAL_ID
        }
      }]
    }

    t.match(handleEvent(event), {
      file: `${BUCKET_NAME}/${FILE_NAME}`
    , timestamp: /^[0-9]{13}$/
    , meta: {
        bucket: {
          name: BUCKET_NAME
        , owner: PRINCIPAL_ID
        , arn: BUCKET_ARN
        }
      , object: {
          key: FILE_NAME
        }
      , region: AWS_REGION
      , source: EVENT_SOURCE
      , user: PRINCIPAL_ID
      }
    }, 'fully parse full event')
  })

  t.test('full perfect data', async (t) => {
    const event = {
      Records: [{
        awsRegion: AWS_REGION
      , eventSource: EVENT_SOURCE
      , eventTime: new Date(TIMESTAMP)
      , s3: {
          bucket: {
            arn: BUCKET_ARN
          , name: BUCKET_NAME
          , ownerIdentity: {
              principalId: PRINCIPAL_ID
            }
          }
        , object: {
            key: FILE_NAME
          }
        }
      , userIdentity: {
          principalId: PRINCIPAL_ID
        }
      }]
    }

    t.same(handleEvent(event), {
      file: `${BUCKET_NAME}/${FILE_NAME}`
    , timestamp: TIMESTAMP
    , meta: {
        bucket: {
          name: BUCKET_NAME
        , owner: PRINCIPAL_ID
        , arn: BUCKET_ARN
        }
      , object: {
          key: FILE_NAME
        }
      , region: AWS_REGION
      , source: EVENT_SOURCE
      , user: PRINCIPAL_ID
      }
    }, 'fully parse full event')
  })
}).catch(threw)
