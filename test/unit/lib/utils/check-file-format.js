'use strict'

const {test, threw} = require('tap')
const {checkFileFormat} = require('../../../../lib/utils/index.js')

test('checkFileFormat', async (t) => {
  t.same(checkFileFormat('sampleData.json.gz'), {
    json: true
  , gz: true
  }, 'it should detect the gzipped json format')

  t.same(checkFileFormat('sampleData.json'), {
    json: true
  , gz: false
  }, 'it should detect the regular json format')

  t.same(checkFileFormat('sampleData.gz'), {
    json: false
  , gz: true
  }, 'it should detect the regular gzipped format')

  t.same(checkFileFormat('sampleData.jsonl'), {
    json: false
  , gz: false
  }, 'it should detect the jsonl format')

  t.same(checkFileFormat('sampleData'), {
    json: false
  , gz: false
  }, 'it should detect no format')

  t.same(checkFileFormat(), undefined
  , 'it should return undefined for non-string')
}).catch(threw)
