// External Libraries
const agent = require('agentkeepalive');
const async = require('async');
const aws = require('aws-sdk');
const request = require('request');
const zlib = require('zlib');

// Constants
const BATCH_INTERVAL_MS = parseInt(process.env.LOGDNA_BATCH_INTERVAL) || 50;
const BATCH_LIMIT = parseInt(process.env.LOGDNA_BATCH_LIMIT) || 25;
const FREE_SOCKET_TIMEOUT_MS = parseInt(process.env.LOGDNA_FREE_SOCKET_TIMEOUT) || 300000;
const LOGDNA_URL = process.env.LOGDNA_URL || 'https://logs.logdna.com/logs/ingest';
const MAX_REQUEST_RETRIES = parseInt(process.env.LOGDNA_MAX_REQUEST_RETRIES) || 5;
const MAX_REQUEST_TIMEOUT_MS = parseInt(process.env.LOGDNA_MAX_REQUEST_TIMEOUT) || 30000;
const REQUEST_RETRY_INTERVAL_MS = parseInt(process.env.LOGDNA_REQUEST_RETRY_INTERVAL) || 100;
const INTERNAL_SERVER_ERROR = 500;
const DEFAULT_HTTP_ERRORS = [
    'ECONNRESET'
    , 'EHOSTUNREACH'
    , 'ETIMEDOUT'
    , 'ESOCKETTIMEDOUT'
    , 'ECONNREFUSED'
    , 'ENOTFOUND'
];

// RegExp:
const DOT_REGEXP = /\./g;

// Initializations
const s3 = new aws.S3({
    apiVersion: '2006-03-01'
});

// Get Configuration from Environment Variables
const getConfig = (event) => {
    const pkg = require('./package.json');
    let config = {
        eventlog: false
        , filelog: true
        , hostname: event.Records[0].s3.bucket.name.replace(DOT_REGEXP, '_')
        , UserAgent: `${pkg.name}/${pkg.version}`
    };

    if (process.env.LOGDNA_KEY) config.key = process.env.LOGDNA_KEY;
    if (process.env.LOGDNA_HOSTNAME) config.hostname = process.env.LOGDNA_HOSTNAME;
    if (process.env.LOGDNA_TAGS) {
        config.tags = process.env.LOGDNA_TAGS.split(',').map(tag => tag.trim()).join(',');
    }

    if (process.env.LOGDNA_EVENTLOG) {
        config.eventlog = process.env.LOGDNA_EVENTLOG.toLowerCase();
        config.eventlog = config.eventlog.indexOf('yes') > -1 || config.eventlog.indexOf('true') > -1;
    }

    if (process.env.LOGDNA_FILELOG) {
        config.eventlog = process.env.LOGDNA_FILELOG.toLowerCase();
        config.eventlog = config.eventlog.indexOf('yes') > -1 || config.eventlog.indexOf('true') > -1;
    }

    return config;
};

// Prepare Datetime
const formatTime = (datetime) => {
    const components = (new Date(datetime)).toString().split(' ');
    var timeString = `[${components[2]}/${components[1]}/${components[3]}:`;
    return `${timeString}${components[4]} ${components[5].split('GMT').pop()}]`;
};

// Prepare Message
const formatMessage = (record) => {
    let message = `${record.bucket.owner} ${record.s3.region} ${record.bucket.name}`;
    message = `${message} ${formatTime(record.event.time)} ${record.request.sourceIPAddress}`;
    return `${message} ${record.event.name} ${record.object.key} ${record.object.size}`;
};

// Check File Format
const checkFormat = (key) => {
    return {
        json: key && key.indexOf('.json') >= 0 && key.indexOf('.jsonl') === -1
        , gz: key && key.indexOf('.gz') >= 0
    };
};

// Parse Event Payload
const parseEvent = (event) => {
    event.Records[0].s3.object.key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
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
    };
};

// Process Event Data After Parsing
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
    };
};

// Prepare the Messages and Options
const prepareEvent = (eventData) => {
    return Object.assign({}, eventData, {
        line: formatMessage(eventData)
    });
};

// Gett the Logs from File
const getLogs = (params, callback) => {
    const keyFormat = checkFormat(params.Key);
    return s3.getObject(params, (error, data) => {
        if (error) return callback(error);
        data = keyFormat.gz ? zlib.gunzipSync(data.Body) : data.Body;
        data = data.toString('ascii');

        if (keyFormat.json) {
            try {
                data = JSON.parse(data);
                return callback(null, Array.isArray(data) ? data.map(entry => JSON.stringify(entry)) : JSON.stringify(data));
            } catch (e) {
                return callback(null, data.split('\n').map(line => line.trim()).filter((line) => {
                    try {
                        return line === JSON.stringify(JSON.parse(line));
                    } catch (e) {
                        return false;
                    }
                }));
            }
        }

        return callback(null, data.split('\n'));
    });
};

// Batchify
const batchify = (logs) => {
    let batches = [], batch = [], batch_size = 0;
    logs.forEach((log) => {
        batch.push(log);
        batch_size += 1;
        if (batch_size >= BATCH_LIMIT) {
            batches.push(batch);
            batch = [];
            batch_size = 0;
        }
    });

    if (batch_size > 0) { batches.push(batch); }
    return batches;
};

// Prepare the Logs
const prepareLogs = (logs, eventData) => {
    return logs.filter(log => log !== '').map((log) => {
        return Object.assign({}, eventData, {
            line: log
        });
    });
};

// Ship the Logs
const send = (payload, config, callback) => {
    // Check for Ingestion Key
    if (!config.key) return callback('Missing LogDNA Ingestion Key');

    // Prepare HTTP Request Options
    const options = {
        url: LOGDNA_URL
        , qs: config.tags ? {
            tags: config.tags
            , hostname: config.hostname
        } : {
            hostname: config.hostname
        }, method: 'POST'
        , body: JSON.stringify({
            e: 'ls'
            , ls: payload
        }), auth: {
            username: config.key
        }, headers: {
            'Content-Type': 'application/json; charset=UTF-8'
            , 'user-agent': config.UserAgent
        }, timeout: MAX_REQUEST_TIMEOUT_MS
        , withCredentials: false
        , agent: new agent.HttpsAgent({
            freeSocketTimeout: FREE_SOCKET_TIMEOUT_MS
        })
    };

    // Flush the Log
    async.retry({
        times: MAX_REQUEST_RETRIES
        , interval: retryCount => REQUEST_RETRY_INTERVAL_MS * Math.pow(2, retryCount)
        , errorFilter: errCode => DEFAULT_HTTP_ERRORS.includes(errCode) || errCode === 'INTERNAL_SERVER_ERROR'
    }, (reqCallback) => {
        return request(options, (error, response, body) => {
            if (error) return reqCallback(error.code);
            if (response.statusCode >= INTERNAL_SERVER_ERROR) return reqCallback('INTERNAL_SERVER_ERROR');
            return reqCallback(null, body);
        });
    }, callback);
};

// Main Handler
exports.handler = (event, context, callback) => {
    const config = getConfig(event)
        , eventData = processEvent(parseEvent(event))
        , payload = config.eventlog ? [prepareEvent(eventData)] : []
        , s3params = {
            Bucket: eventData && eventData.meta && eventData.meta.bucket && eventData.meta.bucket.name || undefined
            , Key: eventData && eventData.meta && eventData.meta.object && eventData.meta.object.key || undefined
        };

    if (config.filelog) {
        return getLogs(s3params, (error, lines) => {
            if (error) {
                if (config.eventlog) return send(payload, config, callback);
                return callback(error);
            }

            return async.everySeries(batchify(payload.concat(prepareLogs(lines, eventData))), (batch, next) => {
                setTimeout(() => {
                    return send(batch, config, next);
                }, BATCH_INTERVAL_MS);
            }, callback);
        });
    } else if (!config.eventlog) {
        return callback('None of file and event logging has been enabled!');
    }

    return send(payload, config, callback);
};
