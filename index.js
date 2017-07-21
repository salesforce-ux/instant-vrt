const compare = require('./compare')
const report = require('./report')

module.exports = (testPath, refPath) =>
  compare(testPath, refPath).map(files => files.map(report))
