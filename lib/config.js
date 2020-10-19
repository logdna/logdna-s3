'use strict'

const DOT_REGEXP = /\./g
const getConfig = (event) => {
  const pkg = require('../package.json')
  const config = {
    eventlog: false
  , filelog: true
  , hostname: event.Records[0].s3.bucket.name.replace(DOT_REGEXP, '_')
  , UserAgent: `${pkg.name}/${pkg.version}`
  }

  if (process.env.LOGDNA_KEY) config.key = process.env.LOGDNA_KEY
  if (process.env.LOGDNA_HOSTNAME) config.hostname = process.env.LOGDNA_HOSTNAME
  if (process.env.LOGDNA_TAGS) {
    config.tags = process.env.LOGDNA_TAGS.split(',').map(tag => tag.trim()).join(',')
  }

  if (process.env.LOGDNA_EVENTLOG) {
    config.eventlog = process.env.LOGDNA_EVENTLOG.toLowerCase()
    config.eventlog = config.eventlog.indexOf('yes') > -1
      || config.eventlog.indexOf('true') > -1
  }

  if (process.env.LOGDNA_FILELOG) {
    config.filelog = process.env.LOGDNA_FILELOG.toLowerCase()
    config.filelog = config.filelog.indexOf('yes') > -1
      || config.filelog.indexOf('true') > -1
  }

  return config
}

module.exports = {
  getConfig
}
