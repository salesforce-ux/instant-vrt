const { html: htmlBeautify } = require("js-beautify")

const beautify = html =>
  htmlBeautify(html, {
    indent_size: 2,
    indent_char: " ",
    unformatted: ["a"],
    "wrap_line_length ": 78,
    indent_inner_html: true
  });

const getDOM = browser => selector =>
  browser.executeScript(`
    const el = document.querySelector("${selector}")
    const kids = Array.from(el.querySelectorAll('*'))
    const extractCSS = el => getComputedStyle(el).cssText;
    return {
      html: el.outerHTML,
      style: [extractCSS(el)].concat(kids.map(extractCSS))
    }
  `)
  .then(diff =>
    ({html: beautify(diff.html), style: diff.style})
  )

const decorate = browser =>
  Object.assign(browser, {getDOM: getDOM(browser)})

module.exports = {decorate, getDOM}
