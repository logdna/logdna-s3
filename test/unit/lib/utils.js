'use strict'

const {test, threw} = require('tap')
const {
  batchify
, checkFileFormat
, getProperty
, hasProperty
, setProperty
} = require('../../../lib/utils.js')

test('batchify', async (t) => {
  t.test('chunks empty array', async (t) => {
    const input = []
    const result = batchify([], 2)
    t.deepEqual(input, [], 'empty array')
    t.notStrictEqual(input, result, 'new array created')
  })

  t.test('chunks input array', async (t) => {
    t.deepEqual(batchify([1, 2, 3], 1), [[1], [2], [3]], 'single element chunks')
    t.deepEqual(
      batchify([1, 2, 3, 4, 5], 2)
    , [[1, 2], [3, 4], [5]]
    , 'remainder in separate chunk')
    t.deepEqual(
      batchify([{a: 'b'}, {c: 'd'}, {e: 'f'}], 2)
    , [[{a: 'b'}, {c: 'd'}], [{e: 'f'}]]
    , 'chunks an array of objects')
  })
}).catch(threw)

test('checkFileFormat', async (t) => {
  t.deepEqual(checkFileFormat('sampleData.json.gz'), {
    json: true
  , gz: true
  }, 'it should detect the gzipped json format')

  t.deepEqual(checkFileFormat('sampleData.json'), {
    json: true
  , gz: false
  }, 'it should detect the regular json format')

  t.deepEqual(checkFileFormat('sampleData.gz'), {
    json: false
  , gz: true
  }, 'it should detect the regular gzipped format')

  t.deepEqual(checkFileFormat('sampleData.jsonl'), {
    json: false
  , gz: false
  }, 'it should detect the jsonl format')

  t.deepEqual(checkFileFormat('sampleData'), {
    json: false
  , gz: false
  }, 'it should detect no format')

  t.deepEqual(checkFileFormat(), undefined
  , 'it should return undefined for non-string')
}).catch(threw)

test('hasProperty', async (t) => {
  const obj = {a: 'b'}
  t.strictEqual(hasProperty(obj, 'a'), true, 'true for defined property')
  t.strictEqual(
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

  t.strictEqual(hasProperty(undefined, 'l1'), false, 'object being undefined')
  t.strictEqual(hasProperty(null, 'l1'), false, 'object being null')
  t.strictEqual(hasProperty(input), false, 'default string')
  t.strictEqual(hasProperty(input, 'l1.l1p2.l3p1'), true, 'default separator')
  t.strictEqual(hasProperty(input, 'l1-l1p2-l3p1', '-'), true, 'custom separator')
  t.strictEqual(hasProperty(input, 'l1.l1p2.l3p2.l4p1'), false
  , 'props beyond null values')
  t.strictEqual(hasProperty(input, 'l1.l1p2.nope'), false, 'no match')
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

  t.strictEqual(getProperty(undefined, 'l1'), undefined, 'object being undefined')
  t.strictEqual(getProperty(null, 'l1'), undefined, 'object being null')
  t.strictEqual(getProperty(input), undefined, 'default string')
  t.strictEqual(getProperty(input, 'l1.l1p2.l3p1'), 4, 'default separator')
  t.strictEqual(getProperty(input, 'l1-l1p2-l3p1', '-'), 4, 'custom separator')
  t.strictEqual(getProperty(input, 'l1.l1p2.l3p2.l4p1'), null
  , 'props beyond null values')
  t.strictEqual(getProperty(input, 'l1.l1p2.nope'), undefined, 'no match')
}).catch(threw)

test('setProperty', async (t) => {
  const input = {}

  t.throws(() => {
    setProperty(input, null, 1)
  }, /must be a string/ig)

  {
    const result = setProperty(input, '', 1)
    t.deepEqual(result, {}, 'empty key results in no change')
  }

  {
    const result = setProperty(input, 'x', 2)
    t.deepEqual(result, {x: 2}, 'singular key sets immeidate value')
  }

  {
    const result = setProperty(input, 'foo.bar', 1)
    t.deepEqual(result, {
      x: 2
    , foo: {
        bar: 1
      }
    }, 'sets nested properties')
  }

  {
    const result = setProperty(input, 'bar|baz|nested', [1, 2], '|')
    t.deepEqual(result, {
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
    t.deepEqual(result, {
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
