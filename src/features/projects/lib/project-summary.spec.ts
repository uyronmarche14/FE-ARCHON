import { describe, expect, it } from "vitest";
import type { ProjectStatusSummary } from "@/contracts/projects";
import {
  getProjectCompletionPercentage,
  getProjectInitials,
  getProjectProgressSegments,
} from "@/features/projects/lib/project-summary";

function createProjectStatusSummary(
  overrides: Partial<ProjectStatusSummary> = {},
): ProjectStatusSummary {
  return {
    id: overrides.id ?? "status-todo",
    name: overrides.name ?? "Todo",
    position: overrides.position ?? 1,
    isClosed: overrides.isClosed ?? false,
    color: overrides.color ?? (overrides.isClosed ? "GREEN" : "SLATE"),
    taskCount: overrides.taskCount ?? 0,
  };
}

describe("project summary helpers", () => {
  it("normalizes initials from multi-word project names", () => {
    expect(getProjectInitials("  Quality   readiness ")).toBe("QR");
    expect(getProjectInitials("launch")).toBe("L");
    expect(getProjectInitials("")).toBe("PR");
  });

  it("builds progress segments from ordered dynamic project statuses", () => {
    expect(
      getProjectProgressSegments([
        createProjectStatusSummary({
          id: "status-todo",
          name: "Todo",
          position: 1,
          taskCount: 3,
        }),
        createProjectStatusSummary({
          id: "status-progress",
          name: "In Progress",
          position: 2,
          taskCount: 2,
        }),
        createProjectStatusSummary({
          id: "status-done",
          name: "Done",
          position: 3,
          isClosed: true,
          taskCount: 5,
        }),
      ]),
    ).toEqual([
      {
        id: "status-todo",
        name: "Todo",
        count: 3,
        isClosed: false,
        width: 30,
      },
      {
        id: "status-progress",
        name: "In Progress",
        count: 2,
        isClosed: false,
        width: 20,
      },
      {
        id: "status-done",
        name: "Done",
        count: 5,
        isClosed: true,
        width: 50,
      },
    ]);

    expect(
      getProjectProgressSegments([
        createProjectStatusSummary(),
        createProjectStatusSummary({
          id: "status-done",
          name: "Done",
          position: 2,
          isClosed: true,
        }),
      ]),
    ).toEqual([]);
  });

  it("calculates completion percentage from closed dynamic statuses", () => {
    expect(
      getProjectCompletionPercentage([
        createProjectStatusSummary({
          id: "status-todo",
          name: "Todo",
          position: 1,
          taskCount: 3,
        }),
        createProjectStatusSummary({
          id: "status-progress",
          name: "In Progress",
          position: 2,
          taskCount: 2,
        }),
        createProjectStatusSummary({
          id: "status-done",
          name: "Done",
          position: 3,
          isClosed: true,
          taskCount: 5,
        }),
      ]),
    ).toBe(50);

    expect(
      getProjectCompletionPercentage([
        createProjectStatusSummary(),
        createProjectStatusSummary({
          id: "status-done",
          name: "Done",
          position: 2,
          isClosed: true,
        }),
      ]),
    ).toBe(0);
  });
});
