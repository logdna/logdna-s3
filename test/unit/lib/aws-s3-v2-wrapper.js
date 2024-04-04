'use strict'

const {test, threw} = require('tap')
const s3helper = require('../../../lib/aws-s3-v2-wrapper.js')
const {getObject} = s3helper

const CORRUPTED_DATA_ERROR = 'Corrupted data returned from the object'
const S3_GETOBJECT_ERROR = 'Error in Getting the S3 Object'
const SAMPLE_BUCKET = 'sampleBucket'
const SAMPLE_OBJECT_KEY = 'test'
const LOG_LINE = 'test log'

test('s3 wrapper', async (t) => {

  t.test('where data is valid json', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: `${SAMPLE_OBJECT_KEY}.json`
    }

    const input = JSON.stringify({
      log: LOG_LINE
    })

    const send = s3helper.send
    s3helper.send = async function(params) {
      return {
        Body: [Buffer.from(input)]
      }
    }

    t.teardown(() => {
      s3helper.send = send
    })

    const data = await getObject(params)
    t.match(data.toString(), input, 'JSON success')
  })

  t.test('where s3 returns an error', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const send = s3helper.send
    s3helper.send = async function(params) {
      throw Error(S3_GETOBJECT_ERROR)
    }

    t.teardown(() => {
      s3helper.send = send
    })

    await t.rejects(getObject(params), {
      message: S3_GETOBJECT_ERROR
    , meta: {
        error: new Error(S3_GETOBJECT_ERROR)
      , params
      }
    }, 'Expected error is thrown')
  })

  t.test('where s3 returns an undefined data', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const send = s3helper.send
    s3helper.send = async function(params) {
      return undefined
    }

    t.teardown(() => {
      s3helper.send = send
    })

    await t.rejects(getObject(params), {
      message: CORRUPTED_DATA_ERROR
    , meta: {params}
    }, 'Expected error is thrown')
  })

  t.test('where s3 returns an undefined data', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const send = s3helper.send
    s3helper.send = async function(params) {
      return null
    }

    t.teardown(() => {
      s3helper.send = send
    })

    await t.rejects(getObject(params), {
      message: CORRUPTED_DATA_ERROR
    , meta: {params}
    }, 'Expected error is thrown')
  })

  t.test('where s3 returns an undefined data', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const send = s3helper.send
    s3helper.send = async function(params) {
      return {}
    }

    t.teardown(() => {
      s3helper.send = send
    })

    await t.rejects(getObject(params), {
      message: CORRUPTED_DATA_ERROR
    , meta: {params}
    }, 'Expected error is thrown')
  })

  t.test('where s3 returns an undefined data', async (t) => {
    const params = {
      Bucket: SAMPLE_BUCKET
    , Key: SAMPLE_OBJECT_KEY
    }

    const send = s3helper.send
    s3helper.send = async function(params) {
      return undefined
    }

    t.teardown(() => {
      s3helper.send = send
    })

    await t.rejects(getObject(params), {
      message: CORRUPTED_DATA_ERROR
    , meta: {params}
    }, 'Expected error is thrown')
  })
}).catch(threw)
