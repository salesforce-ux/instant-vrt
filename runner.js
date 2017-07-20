const Task = require('data.task')
const futurize = require('futurize').futurize(Task)
const s3 = require('../common/s3')
const download = futurize(s3.download)
const compare = require('./compare')
const report = require('./report')

const downloadSnap = sha =>
  download(`design-system/${sha}/snapshot.json`, `${__dirname}/${sha}.snap`)

module.exports = (sha, ref) =>
  Task.of(shaSnap => refSnap => [shaSnap, refSnap])
  .ap(downloadSnap(sha))
  .ap(downloadSnap(ref))
  .map(tmpFolders => tmpFolders.map(t => t.name))
  .chain(([test, ref]) => compare(test, ref))
  .map(files => files.map(report))
