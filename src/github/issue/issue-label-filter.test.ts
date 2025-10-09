import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { filterIssuesByLabels } from "./issue-label-filter";
import { Issue } from "../type/types";

describe("filterIssuesByLabels", () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should return all issues when no target labels specified", () => {
    const issues: Issue[] = [
      { number: 1, title: "Issue 1", user: { login: "user1" } },
      { number: 2, title: "Issue 2", user: { login: "user2" } },
    ];

    const result = filterIssuesByLabels(issues, []);

    expect(result).toEqual(issues);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Skipping label filtering. Processing all issues."
    );
  });

  it("should filter issues by single label", () => {
    const issues: Issue[] = [
      {
        number: 1,
        title: "Issue 1",
        user: { login: "user1" },
        labels: ["bug", "priority"],
      },
      {
        number: 2,
        title: "Issue 2",
        user: { login: "user2" },
        labels: ["enhancement"],
      },
      {
        number: 3,
        title: "Issue 3",
        user: { login: "user3" },
        labels: ["bug"],
      },
    ];

    const result = filterIssuesByLabels(issues, ["bug"]);

    expect(result).toEqual([
      {
        number: 1,
        title: "Issue 1",
        user: { login: "user1" },
        labels: ["bug", "priority"],
      },
      {
        number: 3,
        title: "Issue 3",
        user: { login: "user3" },
        labels: ["bug"],
      },
    ]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Filtering to issues with labels: bug"
    );
  });

  it("should filter issues by multiple labels (OR logic)", () => {
    const issues: Issue[] = [
      {
        number: 1,
        title: "Issue 1",
        user: { login: "user1" },
        labels: ["bug"],
      },
      {
        number: 2,
        title: "Issue 2",
        user: { login: "user2" },
        labels: ["enhancement"],
      },
      {
        number: 3,
        title: "Issue 3",
        user: { login: "user3" },
        labels: ["docs"],
      },
      {
        number: 4,
        title: "Issue 4",
        user: { login: "user4" },
        labels: ["auto"],
      },
      {
        number: 5,
        title: "Issue 5",
        user: { login: "user5" },
        labels: ["bug", "enhancement"],
      },
    ];

    const result = filterIssuesByLabels(issues, ["bug", "enhancement"]);

    expect(result).toEqual([
      {
        number: 1,
        title: "Issue 1",
        user: { login: "user1" },
        labels: ["bug"],
      },
      {
        number: 2,
        title: "Issue 2",
        user: { login: "user2" },
        labels: ["enhancement"],
      },
      {
        number: 5,
        title: "Issue 5",
        user: { login: "user5" },
        labels: ["bug", "enhancement"],
      },
    ]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Filtering to issues with labels: bug, enhancement"
    );
  });

  it("should return empty array when no issues match", () => {
    const issues: Issue[] = [
      {
        number: 1,
        title: "Issue 1",
        user: { login: "user1" },
        labels: ["enhancement"],
      },
      {
        number: 2,
        title: "Issue 2",
        user: { login: "user2" },
        labels: ["docs"],
      },
    ];

    const result = filterIssuesByLabels(issues, ["bug"]);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Filtering to issues with labels: bug"
    );
  });

  it("should handle empty issues array", () => {
    const result = filterIssuesByLabels([], ["bug"]);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith("No issues to filter.");
  });
});
