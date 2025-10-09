import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActionOutputs } from "./output";
import * as core from "@actions/core";
import { IssueClassification } from "../type/types";

vi.mock("@actions/core");

describe("setActionOutputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set all outputs correctly", () => {
    const classification: IssueClassification = {
      completed: [
        { number: 1, title: "Issue 1", user: { login: "user1" } },
        { number: 2, title: "Issue 2", user: { login: "user2" } },
      ],
      inProgress: [{ number: 3, title: "Issue 3", user: { login: "user3" } }],
      pending: [],
    };
    const report = "Test report";

    setActionOutputs(classification, report);

    expect(core.setOutput).toHaveBeenCalledWith(
      "classification",
      JSON.stringify(classification)
    );
    expect(core.setOutput).toHaveBeenCalledWith("completed-count", 2);
    expect(core.setOutput).toHaveBeenCalledWith("in-progress-count", 1);
    expect(core.setOutput).toHaveBeenCalledWith("pending-count", 0);
    expect(core.setOutput).toHaveBeenCalledWith("report", report);
    expect(core.setOutput).toHaveBeenCalledTimes(5);
  });

  it("should handle empty classification", () => {
    const classification: IssueClassification = {
      completed: [],
      inProgress: [],
      pending: [],
    };
    const report = "";

    setActionOutputs(classification, report);

    expect(core.setOutput).toHaveBeenCalledWith("completed-count", 0);
    expect(core.setOutput).toHaveBeenCalledWith("in-progress-count", 0);
    expect(core.setOutput).toHaveBeenCalledWith("pending-count", 0);
    expect(core.setOutput).toHaveBeenCalledWith("report", "");
  });

  it("should handle multiple pending issues", () => {
    const classification: IssueClassification = {
      completed: [],
      inProgress: [],
      pending: [
        { number: 1, title: "Issue 1", user: { login: "user1" } },
        { number: 2, title: "Issue 2", user: { login: "user2" } },
        { number: 3, title: "Issue 3", user: { login: "user3" } },
      ],
    };
    const report = "3 pending issues";

    setActionOutputs(classification, report);

    expect(core.setOutput).toHaveBeenCalledWith("completed-count", 0);
    expect(core.setOutput).toHaveBeenCalledWith("in-progress-count", 0);
    expect(core.setOutput).toHaveBeenCalledWith("pending-count", 3);
  });
});
