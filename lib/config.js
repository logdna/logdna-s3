'use strict'

const Config = require('@logdna/env-config')

const pkg = require('../package.json')

const config = new Config([
  Config
    .number('batch-interval')
    .default(50)
    .desc('The number of milliseconds between sending each batch')
, Config
    .number('batch-limit')
    .default(25)
    .desc('The number of lines within each batch')
, Config
    .number('free-socket-timeout')
    .default(300000)
    .desc('The number of milliseconds to wait for inactivity before timing out')
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
    .number('max-request-retries')
    .default(5)
    .desc('Maximum number of retries for sending each batch')
, Config
    .number('max-request-timeout')
    .default(300)
    .desc('Maximum request timeout in sending each batch')
, Config
    .string('proxy')
    .desc('A full proxy URL (including protocol) to pass through before going to LogDNA')
, Config
    .number('request-retry-interval')
    .default(100)
    .desc('The number of milliseconds between each retry')
, Config
    .boolean('ssl')
    .default(true)
    .desc('Use https:// for log ingestion')
, Config
    .string('tags')
    .desc('Optionally, use comma-separated tags set through the environment')
, Config
    .string('url')
    .default('https://logs.logdna.com/logs/ingest')
    .desc('*Combination of SSL, INGESTION_HOST, INGESTION_PORT, and INGESTION_ENDPOINT*')
, Config
    .string('user-agent')
    .default(`${pkg.name}/${pkg.version}`)
    .desc('user-agent header value to use while sending logs')
])

module.exports = config
