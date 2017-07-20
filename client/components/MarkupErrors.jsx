import escape from 'escape-html'
import {escapeRegExp} from 'lodash'
import React from 'react'

module.exports = props =>
  <div className="host">
    <pre style={{ maxHeight: 200, overflow: 'auto' }}>
      <code
        dangerouslySetInnerHTML={{
          __html: props.lines.map((lines, i) =>
            lines.map((line, ii) => {
              const num = ii || i
              const style = props.errors[i] === ii
              ? 'color: red;' : ''
              return `<a name="${num}" class="line_number">${num}</a> <span style="${style}">${escape(line)}</span>`
            }).join('')
          ).join('\n')
        }} />
      </pre>
  </div>
