'use strict'

module.exports = {
  DEFAULT_HTTP_ERRORS: [
    'ECONNRESET'
  , 'EHOSTUNREACH'
  , 'ETIMEDOUT'
  , 'ESOCKETTIMEDOUT'
  , 'ECONNREFUSED'
  , 'ENOTFOUND'
  ]
, INTERNAL_SERVER_ERROR: {
    statusCode: 500
  , code: 'INTERNAL_SERVER_ERROR'
  }
}
