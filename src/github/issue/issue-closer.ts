import { Octokit, RepoContext, Issue } from "../type/types";

/**
 * Close completed issues
 */
export async function closeCompletedIssues(
  octokit: Octokit,
  context: RepoContext,
  issues: Issue[]
): Promise<void> {
  for (const issue of issues) {
    await octokit.rest.issues.update({
      owner: context.owner,
      repo: context.repo,
      issue_number: issue.number,
      state: "closed",
    });
    console.log(`Closed issue #${issue.number}`);
  }
}
