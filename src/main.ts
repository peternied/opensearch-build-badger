import { table } from "console";

const core = require("@actions/core");


const repoRoot = 'https://github.com/opensearch-project/';
const makeShieldPrefix = (type: string) => `https://img.shields.io/github/${type}/opensearch-project`
const untriagedPrefix = `![](${makeShieldPrefix("issues")}`;
const makeUntriagedBadge = (repo: string) => `[${untriagedPrefix}/${repo}/untriaged)](${repoRoot}${repo}/issues?q=is%3Aissue+is%3Aopen+label%3Auntriaged)`;

const openIssuePrefix = `![](${makeShieldPrefix("issues")}`;
const closedIssuePrefix = `![](${makeShieldPrefix("issues-closed")}`;

const makeOpenIssueBadge = (repo: string, twoDigitVer: string) => `[${openIssuePrefix}/${repo}/v${twoDigitVer}.0)](${repoRoot}${repo}/issues?q=is%3Aissue+is%3Aopen+label%3Av${twoDigitVer}.0)`;
const makeClosedIssueBadge = (repo: string, twoDigitVer: string) => `[${closedIssuePrefix}/${repo}/v${twoDigitVer}.0)](${repoRoot}${repo}/issues?q=is%3Aissue+is%3Aclosed+label%3Av${twoDigitVer}.0)`;


const makeInactiveIssuesOverXDays = (repo: string, days: number) => `INACTIVE_ISSUES`;
const makeInactivePullRequestsOverXDays = (repo: string, days: number) => `INACTIVE_PRS`;
const makeSecurityIssues = (repo: string) => `SECURITY_ISSUES`;
const makeCodeCoverage = (repo: string) => `![https://img.shields.io/codecov/c/gh/opensearch-project/${repo}](https://app.codecov.io/gh/opensearch-project/${repo})`;

const makeNextReleaseIssueCount = (repo: string, twoDigitVer: string) => `NEXT_RELEASE_ISSUES`;


export async function run() {
    const versionParam: string = core.getInput("versions", {required: true});
    const singleRepository: string | undefined = "security"//core.getInput("repository", {required: false});
    const versions = versionParam.split(",").map(str => str.trim());

    if (!!singleRepository) {
        let tableKeys: string[] = [];
        let tableValues: string[] = [];

        tableKeys.push("Untriaged");
        tableValues.push(makeUntriagedBadge(singleRepository));

        const inactiveDays = 14;
        tableKeys.push(`Inactive Issues (${inactiveDays} days)`);
        tableValues.push(makeInactiveIssuesOverXDays(singleRepository, inactiveDays));
        tableKeys.push(`Inactive Pull Requests (${inactiveDays} days)`);
        tableValues.push(makeInactivePullRequestsOverXDays(singleRepository, inactiveDays));

        tableKeys.push("Security Issues");
        tableValues.push(makeSecurityIssues(singleRepository));

        tableKeys.push("Code Coverage");
        tableValues.push(makeCodeCoverage(singleRepository));

        const nextMajor = "3.0"
        tableKeys.push(`Upcoming ${nextMajor} Release Issues`)
        tableValues.push(makeSecurityIssues(makeNextReleaseIssueCount(singleRepository, nextMajor)));

        const nextMinor = "2.4"
        tableKeys.push(`Upcoming ${nextMinor} Release Issues`)
        tableValues.push(makeSecurityIssues(makeNextReleaseIssueCount(singleRepository, nextMinor)));

        const tableHeaderRow = tableKeys.join("|");
        const tableDividerRow = tableKeys.map(s => "---").join("|");
        const tableValuesRow = tableValues.join("|");

        console.log(tableHeaderRow + "\r\n" + tableDividerRow + "\r\n" + tableValuesRow);

        return;
    }


    const repositories = [
        "OpenSearch",
        // "OpenSearch-Dashboards",
        // "alerting",
        // "anomaly-detection",
        // "asynchronous-search",
        // "common-utils",
        // "cross-cluster-replication",
        // "dashboards-reports",
        // "geospatial",
        // "index-management",
        // "job-scheduler",
        // "k-NN",
        // "ml-commons",
        // "notifications",
        // "observability",
        // "performance-analyzer",
        // "performance-analyzer-rca",
        // "security",
        // "sql",
    ];


    let lines: string[] = [];

    lines.push(`## Release Readiness
Repo | Triage | ${versions.join(" | ")}
-----|-----|-----|-----|-------`);

    repositories.forEach(repo => {
        let line = `${repo}`;
        line = `${line} | ${makeUntriagedBadge(repo)}`;
        versions.forEach(ver => {
            line = `${line} | ${makeOpenIssueBadge(repo, ver)} ${makeClosedIssueBadge(repo, ver)}`;
        });
        lines.push(line);
    });

    const result = lines.join("\r\n");

    console.log(result);

    return result;
  }
  
  run()
    .catch(error => core.setFailed("Workflow failed! " + error.message));