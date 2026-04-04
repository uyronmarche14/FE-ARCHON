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
  },
  position: null,
  assigneeId: "member-1",
  dueDate: "2026-04-10",
  createdAt: "2026-04-02T09:00:00.000Z",
  updatedAt: "2026-04-02T10:00:00.000Z",
};

describe("task-form", () => {
  it("normalizes create values and keeps the selected status id", () => {
    expect(
      normalizeCreateTaskFormValues({
        title: "  Prepare   smoke notes  ",
        description: "  Capture launch checks.  ",
        statusId: "status-done",
        assigneeId: " member-1 ",
        dueDate: " 2026-04-12 ",
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
        statusId: "status-todo",
        assigneeId: "",
        dueDate: "not-a-date",
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
        statusId: "status-todo",
        assigneeId: "",
        dueDate: "",
      }),
    ).toEqual({
      description: "Task description must be 5000 characters or fewer.",
    });
  });

  it("maps cleared optional edit fields to null", () => {
    expect(
      buildUpdateTaskRequest(existingTask, {
        title: "Wire refresh token flow",
        description: "",
        statusId: "status-progress",
        assigneeId: "",
        dueDate: "",
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
        statusId: "status-progress",
        assigneeId: "member-1",
        dueDate: "2026-04-10",
      }),
    ).toBeNull();
  });
});
