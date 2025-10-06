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

// src/github/action/input.ts
var input_exports = {};
__export(input_exports, {
  parseInputs: () => parseInputs
});
module.exports = __toCommonJS(input_exports);
function parseInputs() {
  const token = process.env.GITHUB_TOKEN;
  const issueScope = process.env.ISSUE_SCOPE || "target";
  const targetIssueCreatorsInput = process.env.TARGET_ISSUE_CREATORS || "";
  const targetIssueCreators = targetIssueCreatorsInput.split(",").map((creator) => creator.trim()).filter((creator) => creator.length > 0);
  const minLinkedPRs = parseInt(process.env.MIN_LINKED_PRS || "1", 10);
  const minMergedPRs = parseInt(process.env.MIN_MERGED_PRS || "1", 10);
  const targetLabelsInput = process.env.TARGET_LABELS || "";
  const targetLabels = targetLabelsInput.split(",").map((label) => label.trim()).filter((label) => label.length > 0);
  return {
    token,
    issueScope,
    targetIssueCreators,
    minLinkedPRs,
    minMergedPRs,
    targetLabels
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseInputs
});
//# sourceMappingURL=input.js.map
