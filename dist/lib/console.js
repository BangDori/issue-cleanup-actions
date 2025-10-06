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

// src/lib/console.ts
var console_exports = {};
__export(console_exports, {
  generateReport: () => generateReport
});
module.exports = __toCommonJS(console_exports);
function generateReport(creators, classification) {
  const { completed, inProgress, pending } = classification;
  const totalIssues = completed.length + inProgress.length + pending.length;
  const creatorText = creators.length === 1 ? creators[0] : creators.join(", ");
  let message = `Issue Status Report by ${creatorText} (Total: ${totalIssues})

`;
  if (completed.length > 0) {
    message += `Completed (${completed.length})
`;
    message += completed.map(
      (issue) => `   \u2022 Issue #${issue.number}. ${issue.title} (@${issue.user?.login || "unknown"})`
    ).join("\n") + "\n\n";
  }
  if (inProgress.length > 0) {
    message += `In Progress (${inProgress.length})
`;
    message += inProgress.map(
      (issue) => `   \u2022 Issue #${issue.number}. ${issue.title} (@${issue.user?.login || "unknown"})`
    ).join("\n") + "\n\n";
  }
  if (pending.length > 0) {
    message += `Pending (${pending.length})
`;
    message += pending.map(
      (issue) => `   \u2022 Issue #${issue.number}. ${issue.title} (@${issue.user?.login || "unknown"})`
    ).join("\n");
  }
  if (completed.length > 0) {
    message += "\n\n\u{1F973} Closed all completed issues!";
  }
  console.log(message);
  return message;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateReport
});
//# sourceMappingURL=console.js.map
