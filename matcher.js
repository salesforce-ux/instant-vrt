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

const loadAndWriteOrCompareVrt = (dir, name, dom) => {
  const shouldUpdate = process.argv.filter(x => x === '-u')[0]
  ensureDirectory(SNAP_DIR(dir))
  const desc = 'snapshot' // future thinking?
  const snapPath = path.resolve(SNAP_DIR(dir), getSnapPath(name))
  const file = tryRequire(snapPath) || {}
  const contents = file[desc]

  if(!shouldUpdate && contents) {
    const result = compare(contents, dom)
    return {pass: result.passed, message: message(report(result))}
  } else {
    file[desc] = dom
    fs.writeFileSync(snapPath, JSON.stringify(file, null, 2))
    return {pass: true, message: 'no snap'}
  }
}

const assertMatchesDOM = (dir, name, dom) => {
  const result = loadAndWriteOrCompareVrt(dir, name, dom)
  if(!result.pass) {
    throw(new Error(result.message))
  }
}

module.exports = { assertMatchesDOM }
