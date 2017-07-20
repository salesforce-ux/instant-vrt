const React = require('react')
const Example = require('./Example')
const Diff = require('../../../diff/client/components/diff-code')
const Toggler = require('./Toggler')

const TestItem = React.createClass({
  displayName: 'TestItem',

  getInitialState () {
    return {showDiff: this.props.showDiff}
  },

  buildExample (test) {
    return <Example key={`example-${test.file}-${this.props.buildSha}`} sha={this.props.buildSha} parsed={test.parsed._1} test={test} title="Build" />
  },

  refExample (test) {
    return <Example key={`example-${test.file}-${this.props.refSha}`} sha={this.props.refSha} parsed={test.parsed._2} test={test} title="Reference" />
  },

  diffExample (bE, rE) {
    const b = React.cloneElement(bE, {style: {position: 'absolute', top: '0', right: '0', bottom: '0', left: '0'}, title: 'Diff'})
    const r = React.cloneElement(rE, {style: {WebkitFilter: 'opacity(50%)'}, filter: true, title: 'Diff'})
    return (
      <div className="diff" key={`diff-${this.props.test.file}`}>
        {[b, r]}
      </div>
    )
  },

  renderDiffButton (bE, rE) {
    const {test} = this.props
    if (!test.style.length) return
    return (
      <div className="slds-p-around--medium slds-size--1-of-1">
        <button
          className="slds-button slds-button--brand slds-size--1-of-1"
          key={`diff-button-${this.props.test.file}`}
          onClick={() => this.setState({showDiff: true})}
        >
          Show Diff
        </button>
      </div>
    )
  },

  renderResult (test) {
    const bE = this.buildExample(test)
    const rE = this.refExample(test)
    const baseKids = [bE, rE]
    const kids = this.state.showDiff ? baseKids.concat(this.diffExample(bE, rE)) : baseKids.concat(this.renderDiffButton(bE, rE))
    return (
      <div key={`result-${test.file}`} className="slds-grid slds-wrap slds-p-top--small">
        {kids}
      </div>
    )
  },

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
        {this.renderResult(test)}
        {!test.markup.length > 0
          ? null
          : <Toggler className="slds-p-horizontal--medium slds-size--1-of-1" togglerClassName="slds-size--1-of-1" name="Show markup changes">
              <Diff key={`diff-${test.file}`} next={test.parsed._1.html} prev={test.parsed._2.html} />
            </Toggler>
        }
      </div>
    )
  }
})

module.exports = TestItem
