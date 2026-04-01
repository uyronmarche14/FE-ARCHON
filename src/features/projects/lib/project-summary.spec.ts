import { describe, expect, it } from "vitest";
import {
  getProjectCompletionPercentage,
  getProjectInitials,
  getProjectProgressSegments,
} from "@/features/projects/lib/project-summary";

describe("project summary helpers", () => {
  it("normalizes initials from multi-word project names", () => {
    expect(getProjectInitials("  Quality   readiness ")).toBe("QR");
    expect(getProjectInitials("launch")).toBe("L");
    expect(getProjectInitials("")).toBe("PR");
  });

  it("builds board progress segments from task counts", () => {
    expect(
      getProjectProgressSegments({
        TODO: 3,
        IN_PROGRESS: 2,
        DONE: 5,
      }),
    ).toEqual([
      { status: "TODO", count: 3, width: 30 },
      { status: "IN_PROGRESS", count: 2, width: 20 },
      { status: "DONE", count: 5, width: 50 },
    ]);

    expect(
      getProjectProgressSegments({
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
      }),
    ).toEqual([]);
  });

  it("calculates completion percentage from task counts", () => {
    expect(
      getProjectCompletionPercentage({
        TODO: 3,
        IN_PROGRESS: 2,
        DONE: 5,
      }),
    ).toBe(50);

    expect(
      getProjectCompletionPercentage({
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
      }),
    ).toBe(0);
  });
});
