/**
 * Action input configuration
 */
interface ActionInputs {
  token: string;
  issueScope: "target" | "all";
  targetIssueCreators: string[];
  minLinkedPRs: number;
  minMergedPRs: number;
  targetLabels: string[];
}

/**
 * Parse action inputs from environment variables
 * @returns Parsed action inputs
 */
export function parseInputs(): ActionInputs {
  const token = process.env.GITHUB_TOKEN as string;
  const issueScope = (process.env.ISSUE_SCOPE || "target") as "target" | "all";

  const targetIssueCreatorsInput = process.env.TARGET_ISSUE_CREATORS || "";
  const targetIssueCreators = targetIssueCreatorsInput
    .split(",")
    .map((creator) => creator.trim())
    .filter((creator) => creator.length > 0);

  const minLinkedPRs = parseInt(process.env.MIN_LINKED_PRS || "1", 10);
  const minMergedPRs = parseInt(process.env.MIN_MERGED_PRS || "1", 10);

  const targetLabelsInput = process.env.TARGET_LABELS || "";
  const targetLabels = targetLabelsInput
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  return {
    token,
    issueScope,
    targetIssueCreators,
    minLinkedPRs,
    minMergedPRs,
    targetLabels,
  };
}
