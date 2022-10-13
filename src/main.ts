const core = require("@actions/core");

const makeShield = (type: string, repo: string) => `https://img.shields.io/github/${type}/opensearch-project/${repo}`
const makeLabeledShield = (type: string, repo: string, label: string) => `${makeShield(type, repo)}/${label}`
const makeLabeledLink = (issueState: string, repo: string, label: string) => `https://github.com/opensearch-project/${repo}/issues?q=is%3Aissue+is%3A${issueState}+label%3A"${label}"`;

const imageWithLink = (img: string, link: string, labelColor?: string) => `[![](${img}${!!labelColor?"?labelColor=" + labelColor : ''})](${link})`;

const makeOpenIssues = (repo: string) => imageWithLink(makeShield("issues", repo), `https://github.com/opensearch-project/${repo}/issues`); 
const makeOpenPullRequests = (repo: string) => imageWithLink(makeShield("issues-pr", repo), `https://github.com/opensearch-project/${repo}/pulls`);

const makeUntriagedBadge = (repo: string) => imageWithLink(makeLabeledShield("issues", repo, "untriaged"), makeLabeledLink("open", repo, "untriaged"), "red")
const makeSecurityIssues = (repo: string) => imageWithLink(makeLabeledShield("issues", repo, "security%20vulnerability"), makeLabeledLink("open", repo, "security%20vulnerability"), "red");

const makeCodeCoverage = (repo: string) => imageWithLink(`https://img.shields.io/codecov/c/gh/opensearch-project/${repo}`, `https://app.codecov.io/gh/opensearch-project/${repo}`);

const makeNextReleaseIssueCount = (repo: string, version: string) => {
    return imageWithLink(makeLabeledShield("issues", repo, normalizeVersion(version)), makeLabeledLink("open", repo, normalizeVersion(version)));
};

const makeNextReleaseClosedIssueCount = (repo: string, version: string) => {
    return imageWithLink(makeLabeledShield("issues-closed", repo, normalizeVersion(version)), makeLabeledLink("closed", repo, normalizeVersion(version)));
};

const normalizeVersion = (version: string) => {
    const versionParts = version.split("\.");
    let numericString: string;
    if (versionParts.length == 3) {
        numericString = version;
    } else if (versionParts.length == 2) {
        numericString = `${version}.0`;
    } else {
        throw new Error("Unable to understand version string, " + version);
    }    
    return `v${numericString}`;
}


export async function run() {
    const versionParam: string = core.getInput("versions", {required: true});
    const singleRepository: string | undefined = core.getInput("repository", {required: false});
    const versions = versionParam.split(",").map(str => str.trim());

    let result: string;
    if (!!singleRepository) {
        result = singleRepo(singleRepository, versions);
    } else {
        result = multiRepo(versions);
    }

    console.log(result);

    return result;
  }
  
  run()
    .catch(error => core.setFailed("Workflow failed! " + error.message));

export function multiRepo(versions: string[]): string {
    const repositories = [
        "OpenSearch",
        "OpenSearch-Dashboards",
        "alerting",
        "anomaly-detection",
        "asynchronous-search",
        "common-utils",
        "cross-cluster-replication",
        "dashboards-reports",
        "geospatial",
        "index-management",
        "job-scheduler",
        "k-NN",
        "ml-commons",
        "notifications",
        "observability",
        "performance-analyzer",
        "performance-analyzer-rca",
        "security",
        "sql",
    ];


    let lines: string[] = [];

    lines.push("## Release Readiness");
    const headingLine = `Repo | Triage | ${versions.join(" | ")}`;
    lines.push(headingLine);
    lines.push(headingLine.split("|").map(s => "---").join("|"));

    repositories.forEach(repo => {
        let line = `${repo}`;
        line = `${line} | ${makeUntriagedBadge(repo)}`;
        versions.forEach(ver => {
            line = `${line} | ${makeNextReleaseIssueCount(repo, ver)} ${makeNextReleaseClosedIssueCount(repo, ver)}`;
        });
        lines.push(line);
    });

    return lines.join("\r\n");
}

export function singleRepo(repo: string, versions: string[]): string {
    let tableKeys: string[] = [];
    let tableValues: string[] = [];

    tableKeys.push("Untriaged");
    tableValues.push(makeUntriagedBadge(repo));
    tableKeys.push("Security Issues");
    tableValues.push(makeSecurityIssues(repo));

    tableKeys.push(`Open Issues`);
    tableValues.push(makeOpenIssues(repo));
    tableKeys.push(`Open Pull Requests`);
    tableValues.push(makeOpenPullRequests(repo));

    tableKeys.push("Code Coverage");
    tableValues.push(makeCodeCoverage(repo));

    versions.forEach(version => {
        tableKeys.push(`Upcoming ${version} Release Issues`)
        tableValues.push(makeNextReleaseIssueCount(repo, version));    
    });

    // is this tabular output useful?  Badges seemly should stand on their own
    // const tableHeaderRow = tableKeys.join("|");
    // const tableDividerRow = tableKeys.map(s => "---").join("|");
    // const tableValuesRow = tableValues.join("|");

    // return tableHeaderRow + "\r\n" + tableDividerRow + "\r\n" + tableValuesRow;

    const lines: string[] = [];
    for (let i = 0; i < tableKeys.length; i++) {
        lines.push(`${tableValues[i]}`);
    }
    return lines.join(" ");
}