import { IssueClassification } from "../github/type/types";

/**
 * Generate summary report from classified issues
 */
export function generateReport(
  creators: string[],
  classification: IssueClassification
): string {
  const { completed, inProgress, pending } = classification;
  const totalIssues = completed.length + inProgress.length + pending.length;

  const creatorText = creators.length === 1 ? creators[0] : creators.join(", ");
  let message = `Issue Status Report by ${creatorText} (Total: ${totalIssues})\n\n`;

  if (completed.length > 0) {
    message += `Completed (${completed.length})\n`;
    message +=
      completed
        .map(
          (issue) =>
            `   • Issue #${issue.number}. ${issue.title} (@${
              issue.user?.login || "unknown"
            })`
        )
        .join("\n") + "\n\n";
  }

  if (inProgress.length > 0) {
    message += `In Progress (${inProgress.length})\n`;
    message +=
      inProgress
        .map(
          (issue) =>
            `   • Issue #${issue.number}. ${issue.title} (@${
              issue.user?.login || "unknown"
            })`
        )
        .join("\n") + "\n\n";
  }

  if (pending.length > 0) {
    message += `Pending (${pending.length})\n`;
    message += pending
      .map(
        (issue) =>
          `   • Issue #${issue.number}. ${issue.title} (@${
            issue.user?.login || "unknown"
          })`
      )
      .join("\n");
  }

  if (completed.length > 0) {
    message += "\n\n🥳 Closed all completed issues!";
  }

  console.log(message);
  return message;
}
