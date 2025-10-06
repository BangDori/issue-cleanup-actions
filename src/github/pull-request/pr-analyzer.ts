import { Octokit, RepoContext } from "../type/types";

/**
 * Get linked PRs from issue timeline
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

    const issuePattern = new RegExp(`#${issueNumber}\\b`, "i");
    if (prDetails.body && issuePattern.test(prDetails.body)) {
      return true;
    }
  }

  return false;
}
