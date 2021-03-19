'use strict'

const Config = require('@logdna/env-config')

const pkg = require('../package.json')

const config = new Config([
  Config
    .number('flush-interval')
    .default(1000)
    .desc('The number of milliseconds to wait between sending payloads to LogDNA')
, Config
    .number('flush-limit')
    .default(25)
    .desc('If the length of the send buffer exceeds this length, send immediately')
, Config
    .string('hostname')
    .desc('Optionally, use alternative host name set through the environment')
, Config
    .string('http-proxy')
    .desc('An http:// proxy URL to pass through before going to LogDNA')
, Config
    .string('https-proxy')
    .desc('A secure (https://) proxy URL to pass through before going to LogDNA')
, Config
    .string('ingestion-key')
    .required()
    .desc('LogDNA Ingestion Key to stream the logs from files')
, Config
    .string('ingestion-endpoint')
    .default('/logs/ingest')
    .desc('The endpoint for log ingestion at LogDNA')
, Config
    .string('ingestion-host')
    .default('logs.logdna.com')
    .desc('The host for log ingestion')
, Config
    .number('ingestion-port')
    .default(443)
    .desc('The port for log ingestion')
, Config
    .string('proxy')
    .desc('A full proxy URL (including protocol) to pass through before going to LogDNA')
, Config
    .boolean('ssl')
    .default(true)
    .desc('Use https:// for log ingestion')
, Config
    .string('tags')
    .desc('Optionally, use comma-separated tags set through the environment')
, Config
    .string('user-agent')
    .default(`${pkg.name}/${pkg.version}`)
    .desc('user-agent header value to use while sending logs')
])

module.exports = config
