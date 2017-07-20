const I = require('immutable')

const didPass = result =>
  !(markupResult(result).count() || styleResult(result).count())

const markupResult = result =>
  result.markup.extract() || I.List()

const styleResult = result =>
  result.style.extract() || I.List()

const Report = ({_1: file, _2: parsed, _3: result}) => {
  const passed = didPass(result)
  return passed
  ? {file, passed}
  : {
    file,
    parsed,
    passed,
    markup: markupResult(result),
    style: styleResult(result)
  }
}

module.exports = Report
