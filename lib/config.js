'use strict'

const {getProperty} = require('./utils.js')

const DOT_REGEXP = /\./g

module.exports = {
  getConfig
}

function getConfig(event) {
  const pkg = require('../package.json')
  const config = {
    UserAgent: `${pkg.name}/${pkg.version}`
  }

  if (process.env.LOGDNA_KEY) config.key = process.env.LOGDNA_KEY
  if (process.env.LOGDNA_HOSTNAME) config.hostname = process.env.LOGDNA_HOSTNAME
  if (process.env.LOGDNA_TAGS) {
    config.tags = process.env.LOGDNA_TAGS.split(',').map((tag) => {
      return tag.trim()
    }).join(',')
  }

  const bucketName = getProperty(event, 'Records.0.s3.bucket.name')
  if (bucketName && !config.hostname) {
    config.hostname = bucketName.replace(DOT_REGEXP, '_')
  }

  return config
}
