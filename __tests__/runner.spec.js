/* global describe, beforeEach, it, xit */

const { assert } = require('chai')
const path = require('path')

const compare = require('../compare')
const report = require('../report')

describe('vrt/runners', () => {
  let results

  beforeEach(done => {
    compare(path.resolve(__dirname, '123.test'), path.resolve(__dirname, 'abc.test'))
    .fork(e => { throw e }, r => {
      results = r.map(report).toJS()
      done()
    })
  })

  it('returns all results and skips any new additions', () => {
    assert.equal(results.length, 5)
  })

  it('passes the comparison', () => {
    assert.equal(results[0].passed, true)
  })

  it('fails the comparison', () => {
    assert.equal(results[1].passed, false)
  })

  it('shows the markup failures', () => {
    assert.deepEqual(results[1].markup.toJS(), [3])
  })

  it('shows the style failures', () => {
    const s = results[2].style
    assert.deepEqual(s.count(), 2)
    assert.deepEqual(s.first()._1, 2)
    assert.deepEqual(s.first()._2, 'height')
  })

  it('ignores uniq id bumps', () => {
    assert.deepEqual(results[4].file, 'markup_id_test.html')
    assert.deepEqual(results[4].passed, true)
  })
})
