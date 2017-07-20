const Task = require('data.task')
const Redis = require('../common/redis')
const queue = require('../common/queue')
const { Status } = require('../common/gh')
const { findBuild, findReference } = require('../build/model')

const makeStatus = isPassing =>
  isPassing
  ? Status.statuses.get('vrt-success')
  : Status.statuses.get('vrt-failure')

const getVrt = sha =>
  new Task((rej, res) =>
    Redis.Vrt.get(sha, (err, head) =>
      err ? res(null) : res(head)))

const updateGithub = (sha, isPassing, targetUrl) =>
  getVrt(sha)
  .map(head =>
    Status.publish({
      status: makeStatus(isPassing).set('target_url', targetUrl),
      sha: head
    }))

const queueVrt = (sha, branch) =>
  findReference(branch)
  .map(maybeRef =>
    maybeRef
    .fold(() => sha,
          ref => ref.GitInfo.sha))
  .map(refSha =>
    queue.vrt.add({sha, refSha}))

const makeVrtDeployment = (sha, head) =>
  new Task((rej, res) => {
    Redis.Vrt.set(sha, head)
    res(Status.publish({status: Status.statuses.get('vrt-pending'), sha: head}))
  })

module.exports = {queueVrt, updateGithub, makeVrtDeployment}
