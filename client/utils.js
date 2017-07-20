const Task = require('data.task')
const {ajax, post} = require('jquery')

const Http = {
  get: url =>
    new Task((rej, res) =>
      ajax({
        url,
        dataType: 'json',
        timeout: 180000 // 3 min for download
      })
      .fail(rej)
      .done(res)),

  post: (url, params) =>
    new Task((rej, res) =>
      post(url, params).fail(rej).done(res))
}

module.exports = { Http }
