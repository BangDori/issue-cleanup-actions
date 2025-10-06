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

// src/github/issue/issue-label-filter.ts
var issue_label_filter_exports = {};
__export(issue_label_filter_exports, {
  filterIssuesByLabels: () => filterIssuesByLabels
});
module.exports = __toCommonJS(issue_label_filter_exports);
function filterIssuesByLabels(issues, targetLabels) {
  if (targetLabels.length === 0) {
    console.log("Skipping label filtering. Processing all issues.");
    return issues;
  }
  console.log(
    `Filtering to issues with labels: ${targetLabels.join(", ")}`
  );
  return issues.filter((issue) => {
    if (!issue.labels || issue.labels.length === 0) {
      return false;
    }
    const issueLabels = issue.labels.map(
      (label) => typeof label === "string" ? label : label.name
    );
    return targetLabels.some(
      (targetLabel) => issueLabels.includes(targetLabel)
    );
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  filterIssuesByLabels
});
//# sourceMappingURL=issue-label-filter.js.map
