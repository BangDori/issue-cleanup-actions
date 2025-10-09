import { Octokit, RepoContext } from "../type/types";

/**
 * Get linked PRs from issue timeline
 *
 * Retrieves all pull requests that are cross-referenced in the issue timeline.
 * This includes PRs that mention the issue in their body, title, or comments.
 */
export async function getLinkedPRs(
  octokit: Octokit,
  context: RepoContext,
  issueNumber: number
): Promise<any[]> {
  const { data: timeline } = await octokit.rest.issues.listEventsForTimeline({
    owner: context.owner,
    repo: context.repo,
    issue_number: issueNumber,
  });

  // Filter for cross-referenced events that are pull requests (not regular issues)
  return timeline.filter(
    (event: any) =>
      event.event === "cross-referenced" &&
      event.source &&
      event.source.type === "issue" &&
      event.source.issue.pull_request
  );
}

/**
 * Count merged PRs from linked PRs
 *
 * Counts how many of the linked PRs have actually been merged into the repository.
 * This is used to determine if an issue has sufficient merged PRs to be considered
 * "in progress" or potentially "completed".
 */
export async function countMergedPRs(
  octokit: Octokit,
  context: RepoContext,
  linkedPRs: any[]
): Promise<number> {
  let mergedCount = 0;

  for (const linkedPR of linkedPRs) {
    const prNumber = linkedPR.source.issue.number;

    const { data: prDetails } = await octokit.rest.pulls.get({
      owner: context.owner,
      repo: context.repo,
      pull_number: prNumber,
    });

    if (prDetails.merged) {
      mergedCount++;
    }
  }

  return mergedCount;
}

/**
 * Check if any PR body references the issue
 *
 * This function verifies that merged PRs actually intended to resolve the issue
 * by checking if the PR body contains an explicit reference to the issue number (e.g., "fixes #5", "closes #10").
 *
 * Why this is needed:
 * - A PR might be linked to an issue via timeline cross-reference without actually fixing it
 * - Multiple PRs might be merged, but none of them actually address the specific issue
 * - This ensures completed issues were intentionally resolved, not just incidentally linked
 *
 * Example:
 * - Issue #5: "Fix login bug"
 * - PR #10: "Refactor auth" (merged, but no #5 reference) → Not a fix
 * - PR #11: "Fix login bug closes #5" (merged, with #5 reference) → Actual fix
 */
export async function hasIssueReferenceInPRs(
  octokit: Octokit,
  context: RepoContext,
  issueNumber: number,
  linkedPRs: any[]
): Promise<boolean> {
  for (const linkedPR of linkedPRs) {
    const prNumber = linkedPR.source.issue.number;

    const { data: prDetails } = await octokit.rest.pulls.get({
      owner: context.owner,
      repo: context.repo,
      pull_number: prNumber,
    });

    // Use word boundary (\b) to prevent partial matches (e.g., #50 should not match #5)
    const issuePattern = new RegExp(`#${issueNumber}\\b`, "i");
    if (prDetails.body && issuePattern.test(prDetails.body)) {
      return true;
    }
  }

  return false;
}
