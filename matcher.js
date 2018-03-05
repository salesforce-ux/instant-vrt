// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

const fs = require('fs')
const path = require('path')
const compare = require('./compare');
const report = require('./report');

const ensureDirectory = dir =>
  fs.existsSync(dir) ? dir : fs.mkdirSync(dir)

const SNAP_DIR = dir => path.resolve(dir, '__snapshots__')
let CURRENT_TEST, CURRENT_SUITE

const sanitize = x =>
  x.replace(/\W+/ig, '_')

const getSnapPath = desc =>
  `${sanitize(desc)}.json`

const tryRequire = filePath => {
  try { return require(filePath) } catch(e) {}
}

const message = ({html, style}) =>
  [html, style].filter(x => x).join('\n')

const loadAndWriteOrCompareVrt = ({ directory, dom, name, update = false }) => {
  ensureDirectory(SNAP_DIR(directory))
  const desc = 'snapshot' // future thinking?
  const snapPath = path.resolve(SNAP_DIR(directory), getSnapPath(name))
  const file = tryRequire(snapPath) || {}
  const contents = file[desc]

  if(!update && contents) {
    const result = compare(contents, dom)
    return {pass: result.passed, message: message(report(result))}
  } else {
    file[desc] = dom
    fs.writeFileSync(snapPath, JSON.stringify(file, null, 2))
    return {pass: true, message: 'no snap'}
  }
}

const assertMatchesDOM = (options) => {
  const result = loadAndWriteOrCompareVrt(options)
  if(!result.pass) {
    throw(new Error(result.message))
  }
}

module.exports = { assertMatchesDOM }
