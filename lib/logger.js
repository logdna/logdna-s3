'use strict'

const agent = require('agentkeepalive')
const async = require('async')
const request = require('request')

const constants = require('./constants.js')

module.exports = {
  flush
}

function flush(payload, config, callback) {
  const options = {
    url: config.get('url')
  , qs: {
      tags: config.tags
    , hostname: config.hostname
    }
  , method: 'POST'
  , body: JSON.stringify({
      e: 'ls'
    , ls: payload
    })
  , auth: {
      username: config.get('ingestion-key')
    }
  , headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    , 'user-agent': config.get('user-agent')
    }
  , timeout: config.get('max-request-timeout')
  , withCredentials: false
  , agent: new agent.HttpsAgent({
      freeSocketTimeout: config.get('free-socket-timeout')
    })
  }

  async.retry({
    times: config.get('max-request-retries')
  , interval: (retryCount) => {
      return config.get('request-retry-interval') * Math.pow(2, retryCount)
    }
  , errorFilter: (errCode) => {
      return constants.DEFAULT_HTTP_ERRORS.includes(errCode)
        || errCode === constants.INTERNAL_SERVER_ERROR.code
    }
  }, (reqCallback) => {
    return request(options, (error, response, body) => {
      if (error) return reqCallback(error.code)
      if (response.statusCode >= constants.INTERNAL_SERVER_ERROR.statusCode) {
        return reqCallback(constants.INTERNAL_SERVER_ERROR.code)
      }

      return reqCallback(null, body)
    })
  }, callback)
}
