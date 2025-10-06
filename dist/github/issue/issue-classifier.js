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

// src/github/issue/issue-classifier.ts
var issue_classifier_exports = {};
__export(issue_classifier_exports, {
  classifyIssues: () => classifyIssues
});
module.exports = __toCommonJS(issue_classifier_exports);

// src/github/pull-request/pr-analyzer.ts
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

// src/github/issue/issue-classifier.ts
async function classifyIssues(octokit, context, issues, options) {
  const completed = [];
  const inProgress = [];
  const pending = [];
  for (const issue of issues) {
    const linkedPRs = await getLinkedPRs(octokit, context, issue.number);
    if (linkedPRs.length < options.minLinkedPRs) {
      pending.push(issue);
      continue;
    }
    const mergedCount = await countMergedPRs(octokit, context, linkedPRs);
    if (mergedCount < options.minMergedPRs) {
      inProgress.push(issue);
      continue;
    }
    const hasReference = await hasIssueReferenceInPRs(
      octokit,
      context,
      issue.number,
      linkedPRs
    );
    if (hasReference) {
      completed.push(issue);
    } else {
      inProgress.push(issue);
    }
  }
  completed.sort((a, b) => b.number - a.number);
  inProgress.sort((a, b) => b.number - a.number);
  pending.sort((a, b) => b.number - a.number);
  return { completed, inProgress, pending };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  classifyIssues
});
//# sourceMappingURL=issue-classifier.js.map
