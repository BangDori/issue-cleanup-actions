import { context, getOctokit } from "@actions/github";
import {
  parseInputs,
  collectIssuesFromCreators,
  collectAllIssues,
  classifyIssues,
  closeCompletedIssues,
  setActionOutputs,
  filterIssuesByLabels,
} from "./github";
import { generateReport } from "./lib/console";

async function run() {
  try {
    // Parse inputs
    const {
      token,
      issueScope,
      targetIssueCreators,
      minLinkedPRs,
      minMergedPRs,
      targetLabels,
    } = parseInputs();

    // Get repo context
    const { owner, repo } = context.repo;
    const repoContext = { owner, repo };

    // Initialize Octokit
    const octokit = getOctokit(token);

    // Collect issues based on scope
    let allIssues: any[];
    if (issueScope === "all") {
      console.log("Collecting all open issues (scope: all)");
      allIssues = await collectAllIssues(octokit, repoContext);
    } else {
      console.log(
        `Collecting issues from creators: ${targetIssueCreators.join(
          ", "
        )} (scope: target)`
      );
      allIssues = await collectIssuesFromCreators(
        octokit,
        repoContext,
        targetIssueCreators
      );
    }

    console.log(`Found ${allIssues.length} open issues`);

    // Filter issues by labels (if labels are specified)
    const issues = filterIssuesByLabels(allIssues, targetLabels);

    if (targetLabels.length > 0) {
      console.log(
        `Filtered to ${issues.length} issues with labels: ${targetLabels.join(
          ", "
        )}`
      );
    }

    // Classify issues based on PR status
    const classification = await classifyIssues(octokit, repoContext, issues, {
      minLinkedPRs,
      minMergedPRs,
    });

    console.log(
      `Completed: ${classification.completed.length}, In Progress: ${classification.inProgress.length}, Pending: ${classification.pending.length}`
    );

    // Close completed issues
    await closeCompletedIssues(octokit, repoContext, classification.completed);

    // Generate and log report
    const reportCreators = issueScope === "all" ? ["all"] : targetIssueCreators;
    const report = generateReport(reportCreators, classification);

    // Set outputs for GitHub Actions
    setActionOutputs(classification, report);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);
  }
}

void run();
