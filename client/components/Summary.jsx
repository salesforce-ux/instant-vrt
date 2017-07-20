const React = require('react')

const renderAttrs = t => {
  let result = ''
  const attrs = t.attributes
  for (let i = 0; i < attrs.length; i++) {
    result += `${attrs[i].name}=${attrs[i].textContent}`
  }
  return result
}

const tagToString = t =>
  t ? `<${t.tagName.toLowerCase()} ${renderAttrs(t)} />` : '?'

const highlight = el => {
  el.style.backgroundColor = 'yellow'
}

const unhighlight = el => {
  el.style.backgroundColor = ''
}

const formatStyle = (elements, e, x) =>
  <div
    onMouseOver={() => highlight(elements[e.idx])}
    onMouseOut={() => unhighlight(elements[e.idx])}>
    {tagToString(elements[e.idx])} {x.lines[e.idx][e.item]}
  </div>

const Summary = React.createClass({
  displayName: 'Summary',

  getInitialState () {
    return {showChanges: false}
  },

  items (x, elements) {
    const errors = x.errors
    return errors.map((e, i) =>
      <li key={i}>
        {formatStyle(elements, e, x)}
      </li>
    )
  },

  summaryItem (name, x, elements) {
    return (
      <ol className="slds-list--ordered">
        {this.items(x, elements)}
      </ol>
    )
  },

  render () {
    const {formattedStyle, elements} = this.props
    return (
      <div>
        <button
          className="toggle-code-changes slds-button slds-button--icon slds-button--icon-small slds-button--icon-border"
          onClick={() => {
            this.setState({
              showChanges: !this.state.showChanges
            })
          }}
        >
          <svg className="slds-button__icon" aria-hidden="true">
            <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#insert_tag_field" />
          </svg>
        </button>
        <div className={!this.state.showChanges ? 'slds-hide' : null}>
          { formattedStyle ? this.summaryItem('Style', formattedStyle, elements) : null }
        </div>
      </div>
    )
  }
})

module.exports = Summary
