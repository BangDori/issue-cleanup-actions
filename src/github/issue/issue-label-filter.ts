import { Issue } from "../type/types";

/**
 * Filter issues by target labels
 * If no labels are specified, returns all issues
 * If labels are specified, returns only issues that have at least one of the specified labels
 */
export function filterIssuesByLabels(
  issues: Issue[],
  targetLabels: string[]
): Issue[] {
  // If no issues, return empty array
  if (issues.length === 0) {
    console.log("No issues to filter.");
    return [];
  }

  // If no labels specified, return all issues
  if (targetLabels.length === 0) {
    console.log("Skipping label filtering. Processing all issues.");
    return issues;
  }

  console.log(
    `Filtering to issues with labels: ${targetLabels.join(", ")}`
  );

  // Filter issues that have at least one of the target labels
  return issues.filter((issue) => {
    if (!issue.labels || issue.labels.length === 0) {
      return false;
    }

    const issueLabels = issue.labels.map((label) =>
      typeof label === "string" ? label : label.name
    );

    return targetLabels.some((targetLabel) =>
      issueLabels.includes(targetLabel)
    );
  });
}
