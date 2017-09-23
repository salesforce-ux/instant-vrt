const quickDiff = (x, y) =>
  JSON.stringify(x) === JSON.stringify(y)

// now we could parse and round here, but taking the first dec should suffice. #famouslastwords
const removeFloat = x =>
  x.replace(/(\d+)\.(\d+)px/ig, (x, y, z) => `${y}.${z.slice(0, 1)}px`)

const toObj = str =>
  str.split('; ').reduce((acc, s) => {
    const [k, v] = s.split(': ')
    return k ? Object.assign(acc, {[k]: removeFloat(v)}) : acc
  }, {})

const stripComments = x =>
  x.replace(/<!--.*-->/ig, '')

const getHtmlFails = (testLines, refLines) =>
  refLines
  .map((line, i) =>
    testLines[i] === line ? null : i
  )
  .filter(x => x != null)

const getStyleFails = (testStyle, refStyle) => {
  let fails = []
  for (i = 0; i < refStyle.length; i++) {
    for (k in refStyle[i]) {
      if(testStyle[i] && testStyle[i][k] !== refStyle[i][k]) {
        fails[i] = fails[i] || []
        fails[i].push(k)
      }
    }
  } return fails
}

const deserialize = x =>
  ({
    html: x.html,
    htmlLines: x.html.split('\n').map(stripComments),
    style: x.style.map(s => typeof s === "string" ? toObj(s) : s) // legacy snaps
  })

const Result = (test, ref, html, style, passed) =>
  ({ test, ref, html, style, passed })

module.exports = (test_, ref_) => {
  const test = deserialize(test_)
  const ref = deserialize(ref_)
  if (quickDiff(test_, ref_)) return Result(test, ref, [], [], true)
  const htmlFails = test.html === ref.html ? [] : getHtmlFails(test.htmlLines, ref.htmlLines)
  const styleFails = test_.style === ref_.style ? [] : getStyleFails(test.style, ref.style)
  const passed = (htmlFails.length + styleFails.length) === 0
  return Result(test, ref, htmlFails, styleFails, passed)
}
