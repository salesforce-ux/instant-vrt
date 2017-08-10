const chalk = require('chalk')

const tags = html =>
  html.match(/<\w+.*?>/ig)

const showElement = (html,i) =>
  tags(html)[i]

const html = result => {
  const testLines = result.test.htmlLines
  const refLines = result.ref.htmlLines

  return result.html.map(lineNumber => {
    return [ testLines[lineNumber - 1],
      chalk.red(testLines[lineNumber]),
      chalk.green(refLines[lineNumber]),
      testLines[lineNumber + 1]
    ].join('\n')
  }).join('\n')
}

const ifNotInCache = (cache, key, f) =>
  cache[key]
  ? null
  : cache[key] = f()

const styleLine = (fail, refStyle, testStyle) =>
  Object.keys(refStyle).map(k =>
    fail.indexOf(k) >= 0
    ? [`${k}:`, chalk.red(refStyle[k]), chalk.green(`${testStyle[k]},\n`)].join(' ')
    : ''
  ).filter(x => x).join('')

const styleDiff = ({test, ref}, cache) => (fail, i) => {
  const oldEl = showElement(ref.html, i)
  const newEl = showElement(test.html, i)
  const els = oldEl == newEl ? oldEl : `${oldEl}\n${newEl}`
  return ifNotInCache(cache, els, () => `${els}\n{\n${styleLine(fail, ref.style[i], test.style[i])}}`)
}

const style = result =>
  result.style.map(styleDiff(result, {})).filter(x => x).join('\n')

const showLines = lines =>
  lines.length ? `Failed on lines: ${lines.join(', ')}\n` : ''

const Report = result =>
  ({
    html: showLines(result.html).concat(html(result)),
    style: showLines(result.style.map((x, i) => i).filter(x => x != null)).concat(style(result))
  })

module.exports = Report
