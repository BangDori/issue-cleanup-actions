import { Octokit, RepoContext } from "../type/types";

/**
 * Collect all open issues from specified creators
 * @param octokit - GitHub API client
 * @param context - Repository context
 * @param creators - Array of creator usernames to filter by
 * @returns Array of issues from specified creators
 */
export async function collectIssuesFromCreators(
  octokit: Octokit,
  context: RepoContext,
  creators: string[]
): Promise<any[]> {
  const allIssuesMap = new Map<number, any>();

  for (const creator of creators) {
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner: context.owner,
      repo: context.repo,
      state: "open",
      creator: creator,
    });

    // Add to map to avoid duplicates and filter out PRs
    for (const issue of issues) {
      if (!issue.pull_request) {
        allIssuesMap.set(issue.number, issue);
      }
    }
  }

  return Array.from(allIssuesMap.values());
}

/**
 * Collect all open issues regardless of creator
 * @param octokit - GitHub API client
 * @param context - Repository context
 * @returns Array of all open issues
 */
export async function collectAllIssues(
  octokit: Octokit,
  context: RepoContext
): Promise<any[]> {
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner: context.owner,
    repo: context.repo,
    state: "open",
  });

  // Filter out PRs
  return issues.filter((issue) => !issue.pull_request);
}
