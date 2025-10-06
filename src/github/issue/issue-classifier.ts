import {
  Octokit,
  RepoContext,
  Issue,
  IssueClassification,
} from "../type/types";
import {
  getLinkedPRs,
  countMergedPRs,
  hasIssueReferenceInPRs,
} from "../pull-request/pr-analyzer";

/**
 * Options for issue classification
 */
interface ClassifierOptions {
  minLinkedPRs: number;
  minMergedPRs: number;
}

/**
 * Classify issues based on PR status
 * @param octokit - GitHub API client
 * @param context - Repository context
 * @param issues - Issues to classify
 * @param options - Classification options
 * @returns Classified issues (completed, inProgress, pending)
 */
export async function classifyIssues(
  octokit: Octokit,
  context: RepoContext,
  issues: any[],
  options: ClassifierOptions
): Promise<IssueClassification> {
  const completed: Issue[] = [];
  const inProgress: Issue[] = [];
  const pending: Issue[] = [];

  for (const issue of issues) {
    // Get linked PRs from timeline
    const linkedPRs = await getLinkedPRs(octokit, context, issue.number);

    // Check if minimum linked PRs requirement is met
    if (linkedPRs.length < options.minLinkedPRs) {
      pending.push(issue);
      continue;
    }

    // Count merged PRs
    const mergedCount = await countMergedPRs(octokit, context, linkedPRs);

    // Check if minimum merged PRs requirement is met
    if (mergedCount < options.minMergedPRs) {
      inProgress.push(issue);
      continue;
    }

    // Check if any PR body references this issue
    const hasReference = await hasIssueReferenceInPRs(
      octokit,
      context,
      issue.number,
      linkedPRs
    );

    if (hasReference) {
      completed.push(issue);
    } else {
      inProgress.push(issue);
    }
  }

  // Sort by issue number
  completed.sort((a, b) => b.number - a.number);
  inProgress.sort((a, b) => b.number - a.number);
  pending.sort((a, b) => b.number - a.number);

  return { completed, inProgress, pending };
}
