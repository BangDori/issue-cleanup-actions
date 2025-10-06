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

// src/github/issue/issue-collector.ts
var issue_collector_exports = {};
__export(issue_collector_exports, {
  collectAllIssues: () => collectAllIssues,
  collectIssuesFromCreators: () => collectIssuesFromCreators
});
module.exports = __toCommonJS(issue_collector_exports);
async function collectIssuesFromCreators(octokit, context, creators) {
  const allIssuesMap = /* @__PURE__ */ new Map();
  for (const creator of creators) {
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner: context.owner,
      repo: context.repo,
      state: "open",
      creator
    });
    for (const issue of issues) {
      if (!issue.pull_request) {
        allIssuesMap.set(issue.number, issue);
      }
    }
  }
  return Array.from(allIssuesMap.values());
}
async function collectAllIssues(octokit, context) {
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner: context.owner,
    repo: context.repo,
    state: "open"
  });
  return issues.filter((issue) => !issue.pull_request);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  collectAllIssues,
  collectIssuesFromCreators
});
//# sourceMappingURL=issue-collector.js.map
