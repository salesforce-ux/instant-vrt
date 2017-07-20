const {toPairs} = require('lodash')

const renderStylePair = pairs =>
  pairs.map(([k, v]) => `${k}: ${v}\n`)

const findIndexByKey = (key, pairs) =>
  pairs.reduce((acc, [k, v], i) => k === key ? i : acc)

const Difference = (idx, key, item) =>
  ({idx, key, item})

const getStyleErrors = (styleAsOrderedPairs, tuplesOfIndexAndKeyName = []) =>
  tuplesOfIndexAndKeyName
  .map(({_1: idx, _2: key}) =>
    Difference(idx, key, findIndexByKey(key, styleAsOrderedPairs[idx])))

// formatStyle :: (Style, Tuple Index Key) -> {lines: [[Key, Val]], errors: {line: Int}, count: Int}
const formatStyle = (style, tuplesOfIndexAndKeyName = []) => {
  const styleAsOrderedPairs = style.map(toPairs)
  const errors = getStyleErrors(styleAsOrderedPairs, tuplesOfIndexAndKeyName)
  const lines = styleAsOrderedPairs.map(renderStylePair)
  return { lines, errors, count: tuplesOfIndexAndKeyName.length }
}

// formatHtml :: (HTML, [Int]) -> {lines: [[HTML]], errors: {Line: 0}, count: Int }
const formatHtml = (html, is = []) =>
  ({
    count: is.length,
    lines: html.split('\n').map(x => [x]),
    errors: is.reduce((acc, x) => Object.assign({[x]: 0}, acc), {})
  })

module.exports = {formatHtml, formatStyle}
