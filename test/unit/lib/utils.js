'use strict'

const {test, threw} = require('tap')
const {
  checkFileFormat
, getProperty
, hasProperty
, setProperty
} = require('../../../lib/utils.js')

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

test('hasProperty', async (t) => {
  const obj = {a: 'b'}
  t.equal(hasProperty(obj, 'a'), true, 'true for defined property')
  t.equal(
    hasProperty(obj, 'hasOwnProperty')
  , false
  , 'false for propertied defined on prototype'
  )
}).catch(threw)

test('complex hasProperty', async (t) => {
  const input = {
    l1: {
      l1p1: 2
    , l1p2: {
        l3p1: 4
      , l3p2: null
      }
    }
  }

  t.equal(hasProperty(undefined, 'l1'), false, 'object being undefined')
  t.equal(hasProperty(null, 'l1'), false, 'object being null')
  t.equal(hasProperty(input), false, 'default string')
  t.equal(hasProperty(input, 'l1.l1p2.l3p1'), true, 'default separator')
  t.equal(hasProperty(input, 'l1-l1p2-l3p1', '-'), true, 'custom separator')
  t.equal(hasProperty(input, 'l1.l1p2.l3p2.l4p1'), false
  , 'props beyond null values')
  t.equal(hasProperty(input, 'l1.l1p2.nope'), false, 'no match')
}).catch(threw)

test('getProperty', async (t) => {
  const input = {
    l1: {
      l1p1: 2
    , l1p2: {
        l3p1: 4
      , l3p2: null
      }
    }
  }

  t.equal(getProperty(undefined, 'l1'), undefined, 'object being undefined')
  t.equal(getProperty(null, 'l1'), undefined, 'object being null')
  t.equal(getProperty(input), undefined, 'default string')
  t.equal(getProperty(input, 'l1.l1p2.l3p1'), 4, 'default separator')
  t.equal(getProperty(input, 'l1-l1p2-l3p1', '-'), 4, 'custom separator')
  t.equal(getProperty(input, 'l1.l1p2.l3p2.l4p1'), null
  , 'props beyond null values')
  t.equal(getProperty(input, 'l1.l1p2.nope'), undefined, 'no match')
}).catch(threw)

test('setProperty', async (t) => {
  const input = {}

  t.throws(() => {
    setProperty(input, null, 1)
  }, /must be a string/ig)

  {
    const result = setProperty(input, '', 1)
    t.same(result, {}, 'empty key results in no change')
  }

  {
    const result = setProperty(input, 'x', 2)
    t.same(result, {x: 2}, 'singular key sets immeidate value')
  }

  {
    const result = setProperty(input, 'foo.bar', 1)
    t.same(result, {
      x: 2
    , foo: {
        bar: 1
      }
    }, 'sets nested properties')
  }

  {
    const result = setProperty(input, 'bar|baz|nested', [1, 2], '|')
    t.same(result, {
      x: 2
    , foo: {
        bar: 1
      }
    , bar: {
        baz: {
          nested: [1, 2]
        }
      }
    }, 'sets nested properties w/ custom separator')
  }

  {
    const result = setProperty(input, 'foo.bar', 100)
    t.same(result, {
      x: 2
    , foo: {
        bar: 100
      }
    , bar: {
        baz: {
          nested: [1, 2]
        }
      }
    }, 'subsequent calls override previous values')
  }
}).catch(threw)
