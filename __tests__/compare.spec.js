/* global describe, beforeEach, it, xit */

const { assert } = require('chai')
const path = require('path')
const tests = require('./123.json')
const refs = require('./abc.json')

const compare = require('../compare')
const report = require('../report')

describe('compare', () => {
  it('passes on a 1 liner ', () => {
    const test = {html: '<span>hey</span>', style: ['color: red;']}
    const ref = {html: '<span>hey</span>', style: ['color: red;']}
    const res = compare(test, ref)
    assert.equal(res.passed, true)
  })
  it('fails style on a 1 liner ', () => {
    const test = {html: '<span>hey</span>', style: ['color: red;']}
    const ref = {html: '<span>hey</span>', style: ['color: blue;']}
    const res = compare(test, ref)
    assert.equal(res.passed, false)
    assert.equal(report(res).html.length, 0)
    assert.equal(report(res).style.length > 0, true)
  })
  it('fails html on a 1 liner ', () => {
    const test = {html: '<span>hey</span>', style: ['color: red;']}
    const ref = {html: '<span>different</span>', style: ['color: red;']}
    const res = compare(test, ref)
    assert.equal(res.passed, false)
    assert.equal(report(res).html.length > 0, true)
    assert.equal(report(res).style.length, 0)
  })
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
