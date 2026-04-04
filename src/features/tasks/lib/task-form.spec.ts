import { describe, expect, it } from "vitest";
import type { TaskCard } from "@/contracts/tasks";
import {
  buildUpdateTaskRequest,
  normalizeCreateTaskFormValues,
  validateTaskFormValues,
} from "@/features/tasks/lib/task-form";

const existingTask: TaskCard = {
  id: "task-refresh-flow",
  projectId: "qa-readiness",
  title: "Wire refresh token flow",
  description: "Keep session bootstrap calm during auth routing.",
  statusId: "status-progress",
  status: {
    id: "status-progress",
    name: "In Progress",
    position: 2,
    isClosed: false,
    color: "BLUE",
  },
  acceptanceCriteria: null,
  notes: null,
  parentTaskId: null,
  position: null,
  assigneeId: "member-1",
  dueDate: "2026-04-10",
  links: [],
  checklistItems: [],
  subtasks: [],
  createdAt: "2026-04-02T09:00:00.000Z",
  updatedAt: "2026-04-02T10:00:00.000Z",
};

describe("task-form", () => {
  it("normalizes create values and keeps the selected status id", () => {
    expect(
      normalizeCreateTaskFormValues({
        title: "  Prepare   smoke notes  ",
        description: "  Capture launch checks.  ",
        acceptanceCriteria: "",
        notes: "",
        statusId: "status-done",
        assigneeId: " member-1 ",
        dueDate: " 2026-04-12 ",
        links: [],
        checklistItems: [],
      }),
    ).toEqual({
      title: "Prepare smoke notes",
      description: "Capture launch checks.",
      statusId: "status-done",
      assigneeId: "member-1",
      dueDate: "2026-04-12",
    });
  });

  it("validates required title and date format", () => {
    expect(
      validateTaskFormValues({
        title: "   ",
        description: "",
        acceptanceCriteria: "",
        notes: "",
        statusId: "status-todo",
        assigneeId: "",
        dueDate: "not-a-date",
        links: [],
        checklistItems: [],
      }),
    ).toEqual({
      title: "Task title is required.",
      dueDate: "Due date must be a valid date.",
    });
  });

  it("validates long descriptions against the backend limit", () => {
    expect(
      validateTaskFormValues({
        title: "Prepare smoke notes",
        description: "x".repeat(5001),
        acceptanceCriteria: "",
        notes: "",
        statusId: "status-todo",
        assigneeId: "",
        dueDate: "",
        links: [],
        checklistItems: [],
      }),
    ).toEqual({
      description: "Summary must be 5000 characters or fewer.",
    });
  });

  it("maps cleared optional edit fields to null", () => {
    expect(
      buildUpdateTaskRequest(existingTask, {
        title: "Wire refresh token flow",
        description: "",
        acceptanceCriteria: "",
        notes: "",
        statusId: "status-progress",
        assigneeId: "",
        dueDate: "",
        links: [],
        checklistItems: [],
      }),
    ).toEqual({
      description: null,
      assigneeId: null,
      dueDate: null,
    });
  });

  it("returns null when edit values have no real changes", () => {
    expect(
      buildUpdateTaskRequest(existingTask, {
        title: "  Wire   refresh token flow ",
        description: "Keep session bootstrap calm during auth routing.",
        acceptanceCriteria: "",
        notes: "",
        statusId: "status-progress",
        assigneeId: "member-1",
        dueDate: "2026-04-10",
        links: [],
        checklistItems: [],
      }),
    ).toBeNull();
  });
});
