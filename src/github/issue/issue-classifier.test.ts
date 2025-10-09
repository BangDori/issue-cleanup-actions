import { describe, it, expect, vi, beforeEach } from "vitest";
import { classifyIssues } from "./issue-classifier";
import { RepoContext } from "../type/types";
import * as prAnalyzer from "../pull-request/pr-analyzer";

vi.mock("../pull-request/pr-analyzer");

describe("classifyIssues", () => {
  let mockOctokit: any;
  let context: RepoContext;

  beforeEach(() => {
    context = { owner: "test-owner", repo: "test-repo" };
    mockOctokit = {};
    vi.clearAllMocks();
  });

  it("should classify issue as pending when linked PRs < minLinkedPRs", async () => {
    const issues = [{ number: 1, title: "Issue 1", user: { login: "user1" } }];

    vi.mocked(prAnalyzer.getLinkedPRs).mockResolvedValue([]);

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 1,
      minMergedPRs: 1,
    });

    expect(result.pending).toEqual([
      { number: 1, title: "Issue 1", user: { login: "user1" } },
    ]);
    expect(result.inProgress).toEqual([]);
    expect(result.completed).toEqual([]);
  });

  it("should classify issue as in-progress when merged PRs < minMergedPRs", async () => {
    const issues = [{ number: 1, title: "Issue 1", user: { login: "user1" } }];
    const mockLinkedPRs = [{ number: 10 }];

    vi.mocked(prAnalyzer.getLinkedPRs).mockResolvedValue(mockLinkedPRs);
    vi.mocked(prAnalyzer.countMergedPRs).mockResolvedValue(0);

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 1,
      minMergedPRs: 1,
    });

    expect(result.inProgress).toEqual([
      { number: 1, title: "Issue 1", user: { login: "user1" } },
    ]);
    expect(result.pending).toEqual([]);
    expect(result.completed).toEqual([]);
  });

  it("should classify issue as completed when merged PRs meet threshold and has issue reference", async () => {
    const issues = [{ number: 1, title: "Issue 1", user: { login: "user1" } }];
    const mockLinkedPRs = [{ number: 10 }];

    vi.mocked(prAnalyzer.getLinkedPRs).mockResolvedValue(mockLinkedPRs);
    vi.mocked(prAnalyzer.countMergedPRs).mockResolvedValue(1);
    vi.mocked(prAnalyzer.hasIssueReferenceInPRs).mockResolvedValue(true);

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 1,
      minMergedPRs: 1,
    });

    expect(result.completed).toEqual([
      { number: 1, title: "Issue 1", user: { login: "user1" } },
    ]);
    expect(result.inProgress).toEqual([]);
    expect(result.pending).toEqual([]);
  });

  it("should classify issue as in-progress when merged PRs meet threshold but no issue reference", async () => {
    const issues = [{ number: 1, title: "Issue 1", user: { login: "user1" } }];
    const mockLinkedPRs = [{ number: 10 }];

    vi.mocked(prAnalyzer.getLinkedPRs).mockResolvedValue(mockLinkedPRs);
    vi.mocked(prAnalyzer.countMergedPRs).mockResolvedValue(1);
    vi.mocked(prAnalyzer.hasIssueReferenceInPRs).mockResolvedValue(false);

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 1,
      minMergedPRs: 1,
    });

    expect(result.inProgress).toEqual([
      { number: 1, title: "Issue 1", user: { login: "user1" } },
    ]);
    expect(result.completed).toEqual([]);
    expect(result.pending).toEqual([]);
  });

  it("should classify multiple issues correctly", async () => {
    const issues = [
      { number: 1, title: "Issue 1", user: { login: "user1" } },
      { number: 2, title: "Issue 2", user: { login: "user2" } },
      { number: 3, title: "Issue 3", user: { login: "user3" } },
    ];

    vi.mocked(prAnalyzer.getLinkedPRs)
      .mockResolvedValueOnce([]) // Issue 1: no linked PRs
      .mockResolvedValueOnce([{ number: 10 }]) // Issue 2: has linked PRs
      .mockResolvedValueOnce([{ number: 11 }]); // Issue 3: has linked PRs

    vi.mocked(prAnalyzer.countMergedPRs)
      .mockResolvedValueOnce(0) // Issue 2: no merged PRs
      .mockResolvedValueOnce(1); // Issue 3: has merged PRs

    vi.mocked(prAnalyzer.hasIssueReferenceInPRs).mockResolvedValueOnce(true); // Issue 3: has reference

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 1,
      minMergedPRs: 1,
    });

    expect(result.pending).toEqual([
      { number: 1, title: "Issue 1", user: { login: "user1" } },
    ]);
    expect(result.inProgress).toEqual([
      { number: 2, title: "Issue 2", user: { login: "user2" } },
    ]);
    expect(result.completed).toEqual([
      { number: 3, title: "Issue 3", user: { login: "user3" } },
    ]);
  });

  it("should sort issues by number in descending order", async () => {
    const issues = [
      { number: 5, title: "Issue 5", user: { login: "user1" } },
      { number: 10, title: "Issue 10", user: { login: "user2" } },
      { number: 3, title: "Issue 3", user: { login: "user3" } },
    ];

    vi.mocked(prAnalyzer.getLinkedPRs).mockResolvedValue([]);

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 1,
      minMergedPRs: 1,
    });

    expect(result.pending).toEqual([
      { number: 10, title: "Issue 10", user: { login: "user2" } },
      { number: 5, title: "Issue 5", user: { login: "user1" } },
      { number: 3, title: "Issue 3", user: { login: "user3" } },
    ]);
  });

  it("should handle empty issues array", async () => {
    const result = await classifyIssues(mockOctokit, context, [], {
      minLinkedPRs: 1,
      minMergedPRs: 1,
    });

    expect(result.pending).toEqual([]);
    expect(result.inProgress).toEqual([]);
    expect(result.completed).toEqual([]);
  });

  it("should respect custom minLinkedPRs threshold", async () => {
    const issues = [{ number: 1, title: "Issue 1", user: { login: "user1" } }];
    const mockLinkedPRs = [{ number: 10 }];

    vi.mocked(prAnalyzer.getLinkedPRs).mockResolvedValue(mockLinkedPRs);

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 2, // Require 2 linked PRs
      minMergedPRs: 1,
    });

    expect(result.pending).toEqual([
      { number: 1, title: "Issue 1", user: { login: "user1" } },
    ]);
  });

  it("should respect custom minMergedPRs threshold", async () => {
    const issues = [{ number: 1, title: "Issue 1", user: { login: "user1" } }];
    const mockLinkedPRs = [{ number: 10 }, { number: 11 }];

    vi.mocked(prAnalyzer.getLinkedPRs).mockResolvedValue(mockLinkedPRs);
    vi.mocked(prAnalyzer.countMergedPRs).mockResolvedValue(1);

    const result = await classifyIssues(mockOctokit, context, issues, {
      minLinkedPRs: 2,
      minMergedPRs: 2, // Require 2 merged PRs
    });

    expect(result.inProgress).toEqual([
      { number: 1, title: "Issue 1", user: { login: "user1" } },
    ]);
  });
});
