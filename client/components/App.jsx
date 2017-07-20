/* global alert */

const React = require('react')

const Task = require('data.task')
const {Http} = require('../utils')
const TestItem = require('./TestItem')
const Overview = require('./Overview')

const downloadBuild = sha =>
  Http.get(`/download/${sha}`)

const downloadReport = (refsha, testsha) =>
  Http.get(`/reports/${refsha}/${testsha}`)

const commitMessage = ({sha, authorName, message}) =>
  <div className="slds-is-relative hover-popover">
    <a href={archiveLink(sha)} aria-describedby="help" className="slds-truncate slds-p-horizontal--xx-small slds-text-color--inverse" title={sha}>
      {sha.slice(0, 7)}
    </a>
    <div
      className="slds-popover slds-nubbin--top-left slds-hide"
      role="dialog"
      id="help"
      style={{position: 'absolute', top: 'calc(100% + 1rem)', left: '0'}}
    >
      <div className="slds-popover__body">
        <dl className="slds-dl--horizontal">
          <dt className="slds-dl--horizontal__label">Author:</dt>
          <dd className="slds-dl--horizontal__detail slds-tile__meta">{authorName}</dd>
          <dt className="slds-dl--horizontal__label">Message:</dt>
          <dd className="slds-dl--horizontal__detail slds-tile__meta">
            <p className="slds-text-longform">{message}</p>
          </dd>
        </dl>
      </div>
    </div>
  </div>

const getUrlShas = () =>
    window
    .location
    .href
    .match(/report\/(\S+)\/(\S+)/)
    .map(s => s.trim())

const testSha = () =>
  getUrlShas()[1]

const refSha = () =>
  getUrlShas()[2]

const archiveLink = sha =>
  `https://archive-${sha}.lightningdesignsystem.com/`

export default class Report extends React.Component {

  constructor () {
    super()
    this.state = {refBuild: null, testBuild: null, report: null, showFull: false, loadCount: 20}
  }

  componentWillMount () {
    this.getBuildInfo()
    this.getReport()
  }

  getReport () {
    Task.of(refBuild => testBuild => this.setState({refBuild, testBuild}))
    .ap(downloadBuild(refSha()))
    .ap(downloadBuild(testSha()))
    .chain(() => downloadReport(refSha(), testSha()))
    .fork(e => console.log(e),
          r => this.setState({report: r}))
  }

  getBuildInfo () {
    Http.get(`/info/${refSha()}/${testSha()}`)
      .fork(e => console.log(e),
            r => this.setState(r))
  }

  makeNewRef () {
    Http.post('/saveRef', {sha: testSha()})
      .fork(e => console.log(e),
            r => {
              alert('Saved Ref!')
            })
  }

  renderSpinner () {
    return (
      <div className="slds-col--padded-around-large slds-grid slds-grid--vertical slds-align--absolute-center slds-text-align--center">
        <h2 className="slds-text-heading--large">
          {
            this.state.refBuild
            ? `2/2 Comparing ${refSha()} and ${testSha()}`
            : `1/2 Downloading ${refSha()} and ${testSha()}...`
          }
        </h2>
        <div className="slds-spinner--small">
          <img src="/images/spinners/slds_spinner.gif" />
        </div>
      </div>
    )
  }

  passed () {
    return this.state.report.filter(r => r.passed)
  }

  failed () {
    return this.state.report.filter(r => !r.passed)
  }

  testlength () {
    return this.state.report.length
  }

  percentage () {
    return parseInt((this.passed().length / this.testlength()) * 100)
  }

  allPassed () {
    return this.percentage() === 100
  }

  updateResults (rs) {
    if (rs) this.setState({results: this.state.results.concat(rs)})
  }

  shouldShowDiffs () {
    this.failed().length < 20
  }

  loadedItems () {
    const failed = this.failed()
    const upTo = this.state.showFull ? this.state.loadCount : failed.length
    return failed.slice(0, upTo)
  }

  getTestItems (Component) {
    return this.loadedItems().map((t, i) => <Component key={`test-${i}`} test={t} buildSha={this.state.build.GitInfo.sha} refSha={this.state.ref.GitInfo.sha} showDiff={this.shouldShowDiffs()} />)
  }

  renderRefInfo ({build, ref}) {
    return (
      <div className="slds-global-header__item slds-grid slds-grid--vertical-align-center slds-col">
        <span className="slds-grid">
          Comparing
          {commitMessage(build.GitInfo)}
          ....to....
          {commitMessage(ref.GitInfo)}
        </span>
        <div className=" slds-col--bump-left">
          <span className="slds-p-horizontal--medium">{this.state.report ? this.renderPassingCounts() : null}</span>
          <button
            className="slds-button slds-button--neutral slds-m-around--large"
            onClick={() => this.setState({showFull: !this.state.showFull})}>
            Show {this.state.showFull ? 'Overview' : 'Full Report'}
          </button>
          <button
            className="slds-button slds-button--neutral"
            onClick={() => this.makeNewRef()}
          >
            Make {testSha().slice(0, 7)} the new reference?
          </button>
        </div>
      </div>
    )
  }

  renderReport (full) {
    const failed = this.failed()
    return (
      <div className="slds-p-around--x-large">
        { this.allPassed()
          ? <div className="slds-align--absolute-center" style={{ height: '100%' }}>
            <span className="slds-text-heading--large">100% Passed!</span>
          </div>
          : null }
        {this.getTestItems(full ? TestItem : Overview)}
        { this.state.showFull && (this.state.loadCount < this.failed().length)
          ? <button
              className="slds-button slds-button--neutral"
              onClick={() => this.setState({loadCount: this.state.loadCount + 20}) }
            >
              Load More Items
            </button>
          : null
        }
      </div>
    )
  }

  renderPassingCounts () {
    return (
      <span>
        {this.passed().length}/{this.testlength()} passed - {this.percentage()}%
      </span>
    )
  }

  render () {
    const { style } = this.props
    return (
      <div className="app slds-grid slds-grid--frame slds-grid--vertical" style={style}>
        <header className="slds-global-header_container slds-size--1-of-1" style={{ zIndex: '1' }}>
          <div className="app-header slds-global-header slds-grid">
            <div className="slds-global-header__item">
              <div className="logo">
                <svg className="slds-icon" aria-hidden="true">
                  <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#salesforce1" />
                </svg>
              </div>
            </div>
            {this.state.build ? this.renderRefInfo(this.state) : null}
          </div>
        </header>
        <div style={{ height: '50px' }}></div>
        <main>
          {this.state.report ? this.renderReport(this.state.showFull) : this.renderSpinner()}
        </main>
      </div>
    )
  }
}

module.exports = Report
