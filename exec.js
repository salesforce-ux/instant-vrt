const CP = require('child_process')
const Task = require('data.task')

const exec = cmd =>
  new Task((rej, res) =>
    CP.exec(cmd, (e, so, se) =>
      e ? rej(e) : res(so, se)))

module.exports = exec
