# Instant VRT

Visual regression testing based on HTML and computed styles.

<img alt="test output" src="docs/output.png" width="600px" />

## Installation

`npm install @salesforce-ux/instant-vrt`

# Writing a Test

```js
  it('snapshots the footer', () =>
    browser
    .getDOM('.landing__footer')
    .then(dom => assertMatchesDOM('footer', dom))
  )
```

There are 2 parts:
* `browser.getDOM('#mySelector')`
* `assertMatchesDOM(__dirname, 'snapshotName', dom)`

The runner works with any test framework (jest, mocha, tape), but it depends on
`selenium-webdriver` to gather the DOM.

You can use phantom, firefox, etc, but we recommend headless chrome. Here is an
example of setup:

```js
const getBrowser = () => {
  const options = webdriver.Capabilities.chrome();
  options.set('chromeOptions', { 'args': [ '--headless' ] })
  const chrome = new webdriver.Builder().forBrowser('chrome').withCapabilities(options)
  return decorate(chrome.build()) // decorate the browser with the getDOM function
}
```

If you don't want to decorate, the package also exposes the getDOM function directly
It is curried to take a browser:

```js
const getDOM = browser => selector => /*...*/`
```

# Full Example

```js
const express = require('express')
const chromedriver = require('chromedriver')
const webdriver = require('selenium-webdriver')
const By = webdriver.By
const until = webdriver.until
const path = require('path')

// if you don't want to decorate, this also exposes the getDOM function
const {decorate} = require('@salesforce-ux/instant-vrt/browser')
const {assertMatchesDOM} = require('@salesforce-ux/instant-vrt/matcher')

// Set up an express server to serve our site
const app = express()
app.use(express.static(path.resolve(__dirname, '../.www')));

// a helper function to setup webdriver
const getBrowser = () => {
  const options = webdriver.Capabilities.chrome();
  options.set('chromeOptions', { 'args': [ '--headless' ] })
  const chrome = new webdriver.Builder().forBrowser('chrome').withCapabilities(options)
  return decorate(chrome.build())
}

describe('VRT', () => {
  let server, browser

  beforeAll((done) => {
    server = app.listen(9000, done)
    browser = getBrowser()
    browser.manage().window().setSize(800, 600) // same window size is important
  })

  afterAll(() => {
    server.close()
    browser.quit()
  })

  describe('homepage', () => {
    beforeEach((done) => {
      browser.get('http://localhost:9000/')
      browser.wait(browser.findElements(By.css('.landing__primary-nav')), 2000).then(() => done())
    })

    it('snapshots the top nav', () =>
      browser
      .getDOM('.landing__top-nav')
      .then(dom => assertMatchesDOM(__dirname, 'top nav', dom))
    )

    it('snapshots the side nav', () =>
      browser
      .getDOM('.landing__primary-nav')
      .then(dom => assertMatchesDOM(__dirname, 'side nav', dom))
    )

    it('snapshots the footer', () =>
      browser
      .getDOM('.landing__footer')
      .then(dom => assertMatchesDOM(__dirname, 'footer', dom))
    )
  })
})
```

## Licenses

Source code is licensed under [BSD 3-Clause](https://git.io/sfdc-license)
