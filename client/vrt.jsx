const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./components/App')
const { Style } = require('../../diff/client/components/style')

const s = document.createElement('style')
s.innerHTML = Style.getStyles()
document.body.appendChild(s)

ReactDOM.render(
  <App />,
  document.getElementById('react-target')
)
