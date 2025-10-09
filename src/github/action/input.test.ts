import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { parseInputs } from "./input";

describe("parseInputs", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should parse inputs with default values", () => {
    process.env.GITHUB_TOKEN = "test-token";

    const result = parseInputs();

    expect(result).toEqual({
      token: "test-token",
      issueScope: "target",
      targetIssueCreators: [],
      minLinkedPRs: 1,
      minMergedPRs: 1,
      targetLabels: [],
    });
  });

  it("should parse issue scope as 'all'", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.ISSUE_SCOPE = "all";

    const result = parseInputs();

    expect(result).toEqual({
      token: "test-token",
      issueScope: "all",
      targetIssueCreators: [],
      minLinkedPRs: 1,
      minMergedPRs: 1,
      targetLabels: [],
    });
  });

  it("should parse single target issue creator", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.TARGET_ISSUE_CREATORS = "github-actions[bot]";

    const result = parseInputs();

    expect(result).toEqual({
      token: "test-token",
      issueScope: "target",
      targetIssueCreators: ["github-actions[bot]"],
      minLinkedPRs: 1,
      minMergedPRs: 1,
      targetLabels: [],
    });
  });

  it("should parse multiple target issue creators", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.TARGET_ISSUE_CREATORS = "user1, user2, user3";

    const result = parseInputs();

    expect(result).toEqual({
      token: "test-token",
      issueScope: "target",
      targetIssueCreators: ["user1", "user2", "user3"],
      minLinkedPRs: 1,
      minMergedPRs: 1,
      targetLabels: [],
    });
  });

  it("should filter out empty target issue creators", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.TARGET_ISSUE_CREATORS = "user1, , user3";

    const result = parseInputs();

    expect(result).toEqual({
      token: "test-token",
      issueScope: "target",
      targetIssueCreators: ["user1", "user3"],
      minLinkedPRs: 1,
      minMergedPRs: 1,
      targetLabels: [],
    });
  });

  it("should parse custom PR thresholds", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.MIN_LINKED_PRS = "2";
    process.env.MIN_MERGED_PRS = "3";

    const result = parseInputs();

    expect(result.minLinkedPRs).toBe(2);
    expect(result.minMergedPRs).toBe(3);
  });

  it("should parse single target label", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.TARGET_LABELS = "auto";

    const result = parseInputs();

    expect(result.targetLabels).toEqual(["auto"]);
  });

  it("should parse multiple target labels", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.TARGET_LABELS = "bug, enhancement, auto";

    const result = parseInputs();

    expect(result.targetLabels).toEqual(["bug", "enhancement", "auto"]);
  });

  it("should filter out empty target labels", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.TARGET_LABELS = "bug, , auto";

    const result = parseInputs();

    expect(result.targetLabels).toEqual(["bug", "auto"]);
  });

  it("should handle all inputs together", () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.ISSUE_SCOPE = "target";
    process.env.TARGET_ISSUE_CREATORS = "github-actions[bot], user1, user2";
    process.env.MIN_LINKED_PRS = "2";
    process.env.MIN_MERGED_PRS = "2";
    process.env.TARGET_LABELS = "auto, bug";

    const result = parseInputs();

    expect(result).toEqual({
      token: "test-token",
      issueScope: "target",
      targetIssueCreators: ["github-actions[bot]", "user1", "user2"],
      minLinkedPRs: 2,
      minMergedPRs: 2,
      targetLabels: ["auto", "bug"],
    });
  });
});
