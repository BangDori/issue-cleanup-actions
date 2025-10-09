import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLinkedPRs,
  countMergedPRs,
  hasIssueReferenceInPRs,
} from "./pr-analyzer";
import { RepoContext } from "../type/types";

describe("pr-analyzer", () => {
  let mockOctokit: any;
  let context: RepoContext;

  beforeEach(() => {
    context = { owner: "test-owner", repo: "test-repo" };
    mockOctokit = {
      rest: {
        issues: {
          listEventsForTimeline: vi.fn(),
        },
        pulls: {
          get: vi.fn(),
        },
      },
    };
  });

  describe("getLinkedPRs", () => {
    it("should return linked PRs from issue timeline", async () => {
      const issueNumber = 1;
      const mockTimeline = [
        {
          event: "cross-referenced",
          source: {
            type: "issue",
            issue: { number: 10, pull_request: {} },
          },
        },
        {
          event: "cross-referenced",
          source: {
            type: "issue",
            issue: { number: 11, pull_request: {} },
          },
        },
        { event: "commented", source: null },
      ];

      mockOctokit.rest.issues.listEventsForTimeline = vi
        .fn()
        .mockResolvedValue({ data: mockTimeline });

      const result = await getLinkedPRs(mockOctokit, context, issueNumber);

      expect(
        mockOctokit.rest.issues.listEventsForTimeline
      ).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        issue_number: issueNumber,
      });
      expect(result).toHaveLength(2);
      expect(result[0].source.issue.number).toBe(10);
      expect(result[1].source.issue.number).toBe(11);
    });

    it("should filter out non-PR cross-references", async () => {
      const mockTimeline = [
        {
          event: "cross-referenced",
          source: {
            type: "issue",
            issue: { number: 10, pull_request: {} },
          },
        },
        {
          event: "cross-referenced",
          source: { type: "issue", issue: { number: 11 } }, // No pull_request
        },
        {
          event: "cross-referenced",
          source: { type: "commit" }, // Not an issue
        },
      ];

      mockOctokit.rest.issues.listEventsForTimeline = vi
        .fn()
        .mockResolvedValue({ data: mockTimeline });

      const result = await getLinkedPRs(mockOctokit, context, 1);

      expect(result).toHaveLength(1);
      expect(result[0].source.issue.number).toBe(10);
    });

    it("should return empty array when no linked PRs", async () => {
      mockOctokit.rest.issues.listEventsForTimeline = vi
        .fn()
        .mockResolvedValue({ data: [] });

      const result = await getLinkedPRs(mockOctokit, context, 1);

      expect(result).toHaveLength(0);
    });
  });

  describe("countMergedPRs", () => {
    it("should count merged PRs correctly", async () => {
      const linkedPRs = [
        { source: { issue: { number: 10 } } },
        { source: { issue: { number: 11 } } },
        { source: { issue: { number: 12 } } },
      ];

      mockOctokit.rest.pulls.get = vi
        .fn()
        .mockResolvedValueOnce({ data: { merged: true } })
        .mockResolvedValueOnce({ data: { merged: false } })
        .mockResolvedValueOnce({ data: { merged: true } });

      const result = await countMergedPRs(mockOctokit, context, linkedPRs);

      expect(result).toBe(2);
      expect(mockOctokit.rest.pulls.get).toHaveBeenCalledTimes(3);
    });

    it("should return 0 when no PRs are merged", async () => {
      const linkedPRs = [
        { source: { issue: { number: 10 } } },
        { source: { issue: { number: 11 } } },
      ];

      mockOctokit.rest.pulls.get = vi.fn().mockResolvedValue({
        data: { merged: false },
      });

      const result = await countMergedPRs(mockOctokit, context, linkedPRs);

      expect(result).toBe(0);
    });

    it("should return 0 for empty linked PRs array", async () => {
      const result = await countMergedPRs(mockOctokit, context, []);

      expect(result).toBe(0);
      expect(mockOctokit.rest.pulls.get).not.toHaveBeenCalled();
    });
  });

  describe("hasIssueReferenceInPRs", () => {
    it("should return true when PR body contains issue reference", async () => {
      const linkedPRs = [{ source: { issue: { number: 10 } } }];

      mockOctokit.rest.pulls.get = vi.fn().mockResolvedValue({
        data: { body: "This PR fixes #5 and resolves the issue." },
      });

      const result = await hasIssueReferenceInPRs(
        mockOctokit,
        context,
        5,
        linkedPRs
      );

      expect(result).toBe(true);
    });

    it("should return true when any PR contains issue reference", async () => {
      const linkedPRs = [
        { source: { issue: { number: 10 } } },
        { source: { issue: { number: 11 } } },
      ];

      mockOctokit.rest.pulls.get = vi
        .fn()
        .mockResolvedValueOnce({ data: { body: "No reference here" } })
        .mockResolvedValueOnce({ data: { body: "Closes #5" } });

      const result = await hasIssueReferenceInPRs(
        mockOctokit,
        context,
        5,
        linkedPRs
      );

      expect(result).toBe(true);
    });

    it("should return false when no PR contains issue reference", async () => {
      const linkedPRs = [
        { source: { issue: { number: 10 } } },
        { source: { issue: { number: 11 } } },
      ];

      mockOctokit.rest.pulls.get = vi.fn().mockResolvedValue({
        data: { body: "Some PR description without reference" },
      });

      const result = await hasIssueReferenceInPRs(
        mockOctokit,
        context,
        5,
        linkedPRs
      );

      expect(result).toBe(false);
    });

    it("should return false when PR body is null", async () => {
      const linkedPRs = [{ source: { issue: { number: 10 } } }];

      mockOctokit.rest.pulls.get = vi.fn().mockResolvedValue({
        data: { body: null },
      });

      const result = await hasIssueReferenceInPRs(
        mockOctokit,
        context,
        5,
        linkedPRs
      );

      expect(result).toBe(false);
    });

    it("should return false for empty linked PRs array", async () => {
      const result = await hasIssueReferenceInPRs(mockOctokit, context, 5, []);

      expect(result).toBe(false);
      expect(mockOctokit.rest.pulls.get).not.toHaveBeenCalled();
    });

    it("should match issue reference case-insensitively", async () => {
      const linkedPRs = [{ source: { issue: { number: 10 } } }];

      mockOctokit.rest.pulls.get = vi.fn().mockResolvedValue({
        data: { body: "Fixes #5" },
      });

      const result = await hasIssueReferenceInPRs(
        mockOctokit,
        context,
        5,
        linkedPRs
      );

      expect(result).toBe(true);
    });

    it("should not match partial issue numbers", async () => {
      const linkedPRs = [{ source: { issue: { number: 10 } } }];

      mockOctokit.rest.pulls.get = vi.fn().mockResolvedValue({
        data: { body: "This references #50 and #500" },
      });

      const result = await hasIssueReferenceInPRs(
        mockOctokit,
        context,
        5,
        linkedPRs
      );

      expect(result).toBe(false);
    });
  });
});
