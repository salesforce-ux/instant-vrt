const express = require('express')
const path = require('path')
const Task = require('data.task')
const rootPath = path.resolve.bind(path, __dirname)

const auth = require('../common/auth')
const paths = require('../common/paths')
const useSession = require('../common/session')
const bodyParser = require('body-parser')

const futurize = require('futurize').futurize(Task)
const s3 = require('../common/s3')
const download = futurize(s3.download)

const { useEngine } = require('../common/engine')
const { isDev } = require('../common/env-utils')
const { s3Handler } = require('../archive/util')

const { approveReport, findBuild, findAllRefs } = require('../build/model')
const runVrt = require('./runner')
const {queueVrt, updateGithub} = require('./service')

let local = path.resolve.bind(path, __dirname)
let app = express()
let session = useSession(app)
app.use(auth.session)

useEngine(app, __dirname)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

const findBuilds = (refSha, buildSha) =>
  Task.of(ref => build => ({ref, build}))
  .ap(findBuild(refSha))
  .ap(findBuild(buildSha))

app.get('/nightly', (req, res) =>
  findAllRefs()
  .map(bs => bs.map(b => b.GitInfo))
  .fork(e => res.status(500).send(e),
        r => res.json(r)))

// here for now
app.get('/ci/:sha/:branch', (req, res) =>
  queueVrt(req.params.sha, req.params.branch)
  .fork(e => res.status(500).send(e),
        r => res.send('QUEUED')))

app.get('/info/:ref/:sha', (req, res) =>
  Task.of(req.params)
  .chain(({ref, sha}) => findBuilds(ref, sha))
  .fork(e => res.status(500).send('Can\'t find builds'),
        r => res.json(r)))

const downloadSnap = sha =>
  download(`design-system/${sha}/snapshot.json`, `${__dirname}/${sha}.snap`)

app.get('/download/:sha', (req, res) =>
  downloadSnap(req.params.sha)
  .fork(e => { throw e },
        r => res.json({sha: req.params.sha})))

app.get('/reports/:ref/:sha', (req, res) =>
  Task.of(req.params)
  .chain(({ref, sha}) => findBuilds(ref, sha))
  .chain(({build, ref}) => runVrt(build.GitInfo.sha, ref.GitInfo.sha))
  .fork(
    e => res.status(500).send(e),
    r => {
      res.write(JSON.stringify(r.toJS())) // try to stream it
      res.end()
    }))

app.get('/report/:ref/:sha', (req, res) =>
  res.sendFile(rootPath('public/index.html')))

app.post('/saveRef', (req, res) =>
  approveReport(req.body.sha)
  .chain(() => updateGithub(req.body.sha, true, {}))
  .fork((e) => res.send(e),
        () => res.sendStatus(200)))

if (isDev()) {
  const webpack = require('webpack')
  const webpackMiddleware = require('webpack-dev-middleware')
  const config = require('./webpack.config')
  app.use(webpackMiddleware(webpack(config), {
    noInfo: true,
    publicPath: config.output.publicPath
  }))
} else {
  app.get('/assets/scripts/bundle/:entry', (req, res) => {
    res.sendFile(local('.dist', req.params.entry))
  })
}

app.use('/assets', express.static(paths.slds('assets')))
app.use('/fonts', express.static(paths.slds('assets/fonts')))
app.use('/images', express.static(local('public/images')))
app.use('virtualized', express.static(local('@node_modules/react-virtualized')))

app.get('/stylesheet/:sha', (req, res) => {
  const path = '/assets/styles/salesforce-lightning-design-system.css'
  s3Handler({ req, res, path, sha: req.params.sha, folder: 'dist' })
})

module.exports = app
