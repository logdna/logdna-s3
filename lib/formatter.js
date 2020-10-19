'use strict'

const checkFileFormat = (key) => {
  return {
    json: key && key.indexOf('.json') >= 0 && key.indexOf('.jsonl') === -1
  , gz: key && key.indexOf('.gz') >= 0
  }
}

const formatTime = (datetime) => {
  const components = (new Date(datetime)).toString().split(' ')
  var timeString = `[${components[2]}/${components[1]}/${components[3]}:`
  return `${timeString}${components[4]} ${components[5].split('GMT').pop()}]`
}

const formatMessage = (record) => {
  return `${record.bucket.owner} ${record.s3.region} ${record.bucket.name}`
    + ` ${formatTime(record.event.time)} ${record.request.sourceIPAddress}`
    + ` ${record.event.name} ${record.object.key} ${record.object.size}`
}

module.exports = {
  checkFileFormat
, formatMessage
, formatTime
}
