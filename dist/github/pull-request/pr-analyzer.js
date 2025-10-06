"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/github/pull-request/pr-analyzer.ts
var pr_analyzer_exports = {};
__export(pr_analyzer_exports, {
  countMergedPRs: () => countMergedPRs,
  getLinkedPRs: () => getLinkedPRs,
  hasIssueReferenceInPRs: () => hasIssueReferenceInPRs
});
module.exports = __toCommonJS(pr_analyzer_exports);
async function getLinkedPRs(octokit, context, issueNumber) {
  const { data: timeline } = await octokit.rest.issues.listEventsForTimeline({
    owner: context.owner,
    repo: context.repo,
    issue_number: issueNumber
  });
  return timeline.filter(
    (event) => event.event === "cross-referenced" && event.source && event.source.type === "issue" && event.source.issue.pull_request
  );
}
async function countMergedPRs(octokit, context, linkedPRs) {
  let mergedCount = 0;
  for (const linkedPR of linkedPRs) {
    const prNumber = linkedPR.source.issue.number;
    const { data: prDetails } = await octokit.rest.pulls.get({
      owner: context.owner,
      repo: context.repo,
      pull_number: prNumber
    });
    if (prDetails.merged) {
      mergedCount++;
    }
  }
  return mergedCount;
}
async function hasIssueReferenceInPRs(octokit, context, issueNumber, linkedPRs) {
  for (const linkedPR of linkedPRs) {
    const prNumber = linkedPR.source.issue.number;
    const { data: prDetails } = await octokit.rest.pulls.get({
      owner: context.owner,
      repo: context.repo,
      pull_number: prNumber
    });
    const issuePattern = new RegExp(`#${issueNumber}\\b`, "i");
    if (prDetails.body && issuePattern.test(prDetails.body)) {
      return true;
    }
  }
  return false;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  countMergedPRs,
  getLinkedPRs,
  hasIssueReferenceInPRs
});
//# sourceMappingURL=pr-analyzer.js.map
