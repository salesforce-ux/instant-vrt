/* global describe, beforeEach, it, xit */

const { assert } = require('chai')
const path = require('path')
const tests = require('./123.json')
const refs = require('./abc.json')

const compare = require('../compare')
const report = require('../report')

describe('compare', () => {
  it('passes', () => {
    const res = compare(tests["passing"], refs["passing"])
    assert.equal(res.passed, true)
  })

  it('puts the lines of html fail in results html', () => {
    const res = compare(tests["fail_html"], refs["fail_html"])
    assert.equal(res.passed, false)
    assert.deepEqual(res.html, [3])
  })

  it('fails pairs of the style fails in results style', () => {
    const res = compare(tests["fail_style"], refs["fail_style"])
    assert.deepEqual(res.style[0], ['border-bottom-color'])
    assert.deepEqual(res.style[3], ['display'])
  })
})

describe('report', () => {
  it('shows the html output', () => {
    const res = report(compare(tests["fail_html"], refs["fail_html"]))
    expect(res).toMatchSnapshot()
  })
  it('shows the style output', () => {
    const res = report(compare(tests["fail_style"], refs["fail_style"]))
    expect(res).toMatchSnapshot()
  })
  it('is too different', () => {
    const res = report(compare(tests["tooDifferent"], refs["tooDifferent"]))
    expect(res).toMatchSnapshot()
  })
})
