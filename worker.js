require('../common/env')

const createLog = require('../common/log')('worker:vrt')
const queue = require('../common/queue')
const { createReport, makeBuildRef } = require('../build/model')
const runVrt = require('./runner')
const Task = require('data.task')
const { reportUrl } = require('../common/visual-test')
const { updateGithub } = require('./service')

const passingCount = results =>
  results.filter(r => r.passed).count()

const failingCount = results =>
  results.filter(r => !r.passed).count()

const updateGithubButton = ({isPassing, build, reference}) =>
  updateGithub(build.sha, isPassing, reportUrl(build.sha, reference.sha))

const packageResults = (sha, refSha, results) =>
({
  build: {sha},
  reference: {sha: refSha},
  testCount: results.count(),
  passingCount: passingCount(results),
  failingCount: failingCount(results),
  isPassing: passingCount(results) === results.count()
})

const updateRefIfPassing = report =>
  report.isPassing
  ? makeBuildRef(report.BuildId)
  : Task.of(null)

queue.vrt.process(1, (job, done) => {
  let { sha, refSha } = job.data
  let finishedLog = createLog('runVrt', job.jobId)

  runVrt(sha, refSha)
  .map(results => packageResults(sha, refSha, results))
  .chain(args =>
    createReport(args)
    .chain(updateRefIfPassing)
    .chain(() => updateGithubButton(args)))
  .map(finishedLog)
  .fork(done, () => done(null, true))
})
