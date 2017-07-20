const React = require('react')
const Summary = require('./Summary')
const classNames = require('classnames')
const {formatStyle} = require('../model')

// This is a bit strange. I inject this during the create-snap process
// then remove it to reduce file size. Then i re-inject it here with the
// corresponding stylesheet path. Might want to rethink this...
const template = (sha, html) =>
`
  <!DOCTYPE html>
  <html lang="en" style="overflow-y: auto;">
    <head>
    <title>Salesforce User Experience SLDS Test</title>
    <meta charset="utf-8">
      <link rel="stylesheet" href="/stylesheet/${sha}">
    </head>
    <body style="padding: 1rem; pointer-events: none;">
      ${html}
    </body>
    <script>
    </script>
  </html>
`

const getHeight = iframe => {
  const height = iframe.contentWindow.document.body.getBoundingClientRect().height + 10
  return `${height}px`
}

const Example = React.createClass({

  getInitialState () {
    return {elements: []}
  },

  wrap (html) {
    return template(this.props.sha, html)
  },

  renderDiff (formattedStyle) {
    return (
      <div className="slds-size--1-of-1">
        <Summary
          formattedStyle={formattedStyle}
          elements={this.state.elements} />
      </div>
    )
  },

  getStyle () {
    return this.props.filter ? {WebkitFilter: 'invert(100%)'} : {}
  },

  iframeLoaded (e) {
    const iframe = e.target
    const elements = iframe.contentDocument.body.querySelectorAll('*')
    iframe.style.height = getHeight(iframe)
    this.setState({elements})
  },

  render () {
    const {sha, title, parsed, test} = this.props
    const formattedStyle = formatStyle(parsed.style, test.style)
    return (
      <div
        className={classNames(
          'slds-p-horizontal--medium',
          this.props.diffBuild ? 'slds-size--1-of-1' : 'slds-size--1-of-2',
          this.props.className
        )}
        style={this.props.style}
      >
        <figure className="slds-image slds-image--card">
          <iframe
            style={this.getStyle()}
            width="100%"
            height="100%"
            srcDoc={this.wrap(parsed.html)}
            onLoad={this.iframeLoaded}
            name={`${title}-${sha}`}
            id={`${title}-${sha}`}
          />
          <figcaption className="slds-image__title slds-image__title--card slds-wrap">
            <span className="slds-truncate" title={title}>
              {title}
              {this.props.title !== 'Diff' ? '-' + sha.slice(0, 7) : null}
            </span>
            { this.props.title === 'Diff'
              ? null
              : this.renderDiff(formattedStyle)
            }
          </figcaption>
        </figure>

      </div>
    )
  }
})

module.exports = Example
