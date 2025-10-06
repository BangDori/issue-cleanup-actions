import * as core from "@actions/core";
import { IssueClassification } from "../type/types";

/**
 * Set GitHub Actions outputs
 */
export function setActionOutputs(
  classification: IssueClassification,
  report: string
): void {
  core.setOutput("classification", JSON.stringify(classification));
  core.setOutput("completed-count", classification.completed.length);
  core.setOutput("in-progress-count", classification.inProgress.length);
  core.setOutput("pending-count", classification.pending.length);
  core.setOutput("report", report);
}
