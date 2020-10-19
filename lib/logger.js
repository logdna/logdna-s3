'use strict'

const agent = require('agentkeepalive')
const async = require('async')
const request = require('request')

const FREE_SOCKET_TIMEOUT = parseInt(process.env.LOGDNA_FREE_SOCKET_TIMEOUT) || 300000
const LOGDNA_URL = process.env.LOGDNA_URL || 'https://logs.logdna.com/logs/ingest'
const MAX_REQUEST_RETRIES = parseInt(process.env.LOGDNA_MAX_REQUEST_RETRIES) || 5
const MAX_REQUEST_TIMEOUT = parseInt(process.env.LOGDNA_MAX_REQUEST_TIMEOUT) || 30000
const REQUEST_RETRY_INTERVAL = parseInt(process.env.LOGDNA_REQUEST_RETRY_INTERVAL) || 100
const INTERNAL_SERVER_ERROR = 500
const DEFAULT_HTTP_ERRORS = [
  'ECONNRESET'
, 'EHOSTUNREACH'
, 'ETIMEDOUT'
, 'ESOCKETTIMEDOUT'
, 'ECONNREFUSED'
, 'ENOTFOUND'
]

const flush = (payload, conf, callback) => {
  // Check for Ingestion Key
  if (!conf.key) return callback('Missing LogDNA Ingestion Key')

  // Prepare HTTP Request Options
  const options = {
    url: LOGDNA_URL
  , qs: conf.tags ? {
      tags: conf.tags
    , hostname: conf.hostname
    } : {
      hostname: conf.hostname
    }, method: 'POST'
  , body: JSON.stringify({
      e: 'ls'
    , ls: payload
    }), auth: {
      username: conf.key
    }, headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    , 'user-agent': conf.UserAgent
    }, timeout: MAX_REQUEST_TIMEOUT
  , withCredentials: false
  , agent: new agent.HttpsAgent({
      freeSocketTimeout: FREE_SOCKET_TIMEOUT
    })
  }

  // Flush the Log
  async.retry({
    times: MAX_REQUEST_RETRIES
  , interval: (retryCount) => {
      return REQUEST_RETRY_INTERVAL * Math.pow(2, retryCount)
    }
  , errorFilter: (errCode) => {
      return DEFAULT_HTTP_ERRORS.includes(errCode) || errCode === 'INTERNAL_SERVER_ERROR'
    }
  }, (reqCallback) => {
    return request(options, (error, response, body) => {
      if (error) return reqCallback(error.code)
      if (response.statusCode >= INTERNAL_SERVER_ERROR) {
        return reqCallback('INTERNAL_SERVER_ERROR')
      }

      return reqCallback(null, body)
    })
  }, callback)
}

module.exports = {
  flush
}
