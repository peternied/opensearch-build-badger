import core = require('@actions/core')

const makeShield = (type: string, repo: string): string => `https://img.shields.io/github/${type}/opensearch-project/${repo}`
const makeLabeledShield = (type: string, repo: string, label: string): string => `${makeShield(type, repo)}/${label}`
const makeLabeledLink = (issueState: string, repo: string, label: string): string => `https://github.com/opensearch-project/${repo}/issues?q=is%3Aissue+is%3A${issueState}+label%3A"${label}"`

const imageWithLink = (altText: string, img: string, link: string, labelColor?: string): string => {
  const labelColorParameter = labelColor ? '?labelColor=' + labelColor : ''
  return `[![${altText}](${img}${labelColorParameter})](${link})`
}

const makeOpenIssues = (repo: string): string => imageWithLink('Open Issues', makeShield('issues', repo), `https://github.com/opensearch-project/${repo}/issues`)
const makeOpenPullRequests = (repo: string): string => imageWithLink('Open Pull Requests', makeShield('issues-pr', repo), `https://github.com/opensearch-project/${repo}/pulls`)

const makeUntriagedBadge = (repo: string): string => imageWithLink('Untriaged Issues', makeLabeledShield('issues', repo, 'untriaged'), makeLabeledLink('open', repo, 'untriaged'), 'red')
const makeSecurityIssues = (repo: string): string => imageWithLink('Security Vulnerabilities', makeLabeledShield('issues', repo, 'security%20vulnerability'), makeLabeledLink('open', repo, 'security%20vulnerability'), 'red')

const makeCodeCoverage = (repo: string): string => imageWithLink('Code Coverage',
    `https://codecov.io/gh/opensearch-project/${repo}/branch/main/graph/badge.svg`,
    `https://codecov.io/gh/opensearch-project/${repo}`)

const makeNextReleaseIssueCount = (repo: string, version: string): string => {
  const normalizedVersion = normalizeVersion(version)
  return imageWithLink(`${version} Open Issues`, makeLabeledShield('issues', repo, normalizedVersion), makeLabeledLink('open', repo, normalizedVersion))
}

const makeNextReleaseClosedIssueCount = (repo: string, version: string): string => {
  const normalizedVersion = normalizeVersion(version)
  return imageWithLink(`${version} Open Issues`, makeLabeledShield('issues-closed', repo, normalizedVersion), makeLabeledLink('closed', repo, normalizedVersion))
}

const normalizeVersion = (version: string): string => {
  const versionParts = version.split('.')
  let numericString: string
  if (versionParts.length === 3) {
    numericString = version
  } else if (versionParts.length === 2) {
    numericString = `${version}.0`
  } else {
    throw new Error('Unable to understand version string, ' + version)
  }
  return `v${numericString}`
}

export async function run (): Promise<string> {
  const versionParam: string = core.getInput('versions', { required: true })
  const singleRepository: string | undefined = core.getInput('repository', { required: false })
  const versions = versionParam.split(',').map(str => str.trim())

  let result: string
  if (singleRepository) {
    result = singleRepo(singleRepository, versions)
  } else {
    result = multiRepo(versions)
  }

  console.log(result)

  return result
}

run()
// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  .catch(error => core.setFailed('Workflow failed! ' + error.message))

export function multiRepo (versions: string[]): string {
  const repositories = [
    'OpenSearch',
    'OpenSearch-Dashboards',
    'alerting',
    'anomaly-detection',
    'asynchronous-search',
    'common-utils',
    'cross-cluster-replication',
    'dashboards-reports',
    'geospatial',
    'index-management',
    'job-scheduler',
    'k-NN',
    'ml-commons',
    'notifications',
    'observability',
    'performance-analyzer',
    'performance-analyzer-rca',
    'security',
    'sql'
  ]

  const lines: string[] = []

  lines.push('## Release Readiness')
  const headingLine = `Repo | Triage | ${versions.join(' | ')}`
  lines.push(headingLine)
  lines.push(headingLine.split('|').map(s => '---').join('|'))

  repositories.forEach(repo => {
    let line = `${repo}`
    line = `${line} | ${makeUntriagedBadge(repo)}`
    versions.forEach(ver => {
      line = `${line} | ${makeNextReleaseIssueCount(repo, ver)} ${makeNextReleaseClosedIssueCount(repo, ver)}`
    })
    lines.push(line)
  })

  return lines.join('\r\n')
}

export function singleRepo (repo: string, versions: string[]): string {
  const tableKeys: string[] = []
  const tableValues: string[] = []

  tableKeys.push('Code Coverage')
  tableValues.push(makeCodeCoverage(repo))

  tableKeys.push('Untriaged')
  tableValues.push(makeUntriagedBadge(repo))
  tableKeys.push('Security Issues')
  tableValues.push(makeSecurityIssues(repo))

  tableKeys.push('Open Issues')
  tableValues.push(makeOpenIssues(repo))
  tableKeys.push('Open Pull Requests')
  tableValues.push(makeOpenPullRequests(repo))

  versions.forEach(version => {
    tableKeys.push(`Upcoming ${version} Release Issues`)
    tableValues.push(makeNextReleaseIssueCount(repo, version))
  })

  // is this tabular output useful?  Badges seemly should stand on their own
  // const tableHeaderRow = tableKeys.join("|");
  // const tableDividerRow = tableKeys.map(s => "---").join("|");
  // const tableValuesRow = tableValues.join("|");

  // return tableHeaderRow + "\r\n" + tableDividerRow + "\r\n" + tableValuesRow;

  const lines: string[] = []
  for (let i = 0; i < tableKeys.length; i++) {
    lines.push(`${tableValues[i]}`)
  }
  return lines.join('\n')
}
