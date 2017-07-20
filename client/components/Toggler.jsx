const React = require('react')
const classNames = require('classnames')

const Toggler = React.createClass({
  getInitialState () {
    return {showing: false}
  },

  toggle (e) {
    e.preventDefault()
    this.setState({showing: !this.state.showing})
  },

  render () {
    const {showing} = this.state
    return (
      <div className={this.props.className}>
        <a
          className={classNames(
            'slds-button slds-button--neutral',
            this.props.togglerClassName
          )}
          href="#"
          onClick={this.toggle}
        >
          {this.props.name}
        </a>
        {this.state.showing ? this.props.children : null}
      </div>
    )
  }
})

module.exports = Toggler
