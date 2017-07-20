const React = require('react')

const Overview = React.createClass({
  displayName: 'Overview',

  render () {
    const {test} = this.props
    const markup = test.markup || []
    const style = test.style || []
    return (
      <div className="slds-grid slds-grid--vertical slds-p-vertical--medium" key={`test-item-${test.file}`}>
        <div className="slds-grid slds-p-horizontal--medium">
          <strong className="slds-truncate">{test.file}</strong>
          <span className="slds-grid slds-col--bump-left">
            <span>Changes found: </span>
            <span className="slds-p-left--small">Markup: {markup.length}</span>
            <span className="slds-p-left--small">Style: {style.length}</span>
          </span>
        </div>
      </div>
    )
  }
})

module.exports = Overview
