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

// src/github/issue/issue-closer.ts
var issue_closer_exports = {};
__export(issue_closer_exports, {
  closeCompletedIssues: () => closeCompletedIssues
});
module.exports = __toCommonJS(issue_closer_exports);
async function closeCompletedIssues(octokit, context, issues) {
  for (const issue of issues) {
    await octokit.rest.issues.update({
      owner: context.owner,
      repo: context.repo,
      issue_number: issue.number,
      state: "closed"
    });
    console.log(`Closed issue #${issue.number}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  closeCompletedIssues
});
//# sourceMappingURL=issue-closer.js.map
