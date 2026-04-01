import { describe, expect, it } from "vitest";
import type { ProjectsListResponse } from "@/contracts/projects";
import type { TaskCard, TaskGroups } from "@/contracts/tasks";
import {
  applyTaskStatusChangeToProjectsList,
  moveTaskToStatus,
} from "@/features/tasks/lib/task-board";

function createTask(overrides: Partial<TaskCard> = {}): TaskCard {
  return {
    id: overrides.id ?? "task-1",
    projectId: overrides.projectId ?? "project-1",
    title: overrides.title ?? "Task",
    description: overrides.description ?? null,
    status: overrides.status ?? "TODO",
    position: overrides.position ?? 1,
    assigneeId: overrides.assigneeId ?? null,
    dueDate: overrides.dueDate ?? null,
    createdAt: overrides.createdAt ?? "2026-04-01T09:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-01T09:00:00.000Z",
  };
}

describe("task-board helpers", () => {
  it("moves a task between lanes and clears position for v1 kanban moves", () => {
    const taskGroups: TaskGroups = {
      TODO: [createTask({ id: "task-todo", status: "TODO", position: 2 })],
      IN_PROGRESS: [],
      DONE: [],
    };

    const result = moveTaskToStatus(taskGroups, "task-todo", "DONE");

    expect(result.changed).toBe(true);
    expect(result.previousTask?.status).toBe("TODO");
    expect(result.nextTask).toMatchObject({
      id: "task-todo",
      status: "DONE",
      position: null,
    });
    expect(result.nextTaskGroups.TODO).toHaveLength(0);
    expect(result.nextTaskGroups.DONE).toEqual([
      expect.objectContaining({
        id: "task-todo",
        status: "DONE",
        position: null,
      }),
    ]);
  });

  it("treats same-lane moves as a no-op", () => {
    const taskGroups: TaskGroups = {
      TODO: [createTask({ id: "task-todo", status: "TODO" })],
      IN_PROGRESS: [],
      DONE: [],
    };

    const result = moveTaskToStatus(taskGroups, "task-todo", "TODO");

    expect(result.changed).toBe(false);
    expect(result.nextTask).toBeNull();
    expect(result.nextTaskGroups).toBe(taskGroups);
    expect(result.previousTask).toMatchObject({
      id: "task-todo",
      status: "TODO",
    });
  });

  it("updates project counts immutably for optimistic status changes", () => {
    const projects: ProjectsListResponse = {
      items: [
        {
          id: "project-1",
          name: "Project one",
          description: null,
          role: "OWNER",
          taskCounts: {
            TODO: 2,
            IN_PROGRESS: 1,
            DONE: 0,
          },
        },
        {
          id: "project-2",
          name: "Project two",
          description: null,
          role: "MEMBER",
          taskCounts: {
            TODO: 1,
            IN_PROGRESS: 0,
            DONE: 0,
          },
        },
      ],
    };

    const nextProjects = applyTaskStatusChangeToProjectsList(
      projects,
      "project-1",
      "TODO",
      "DONE",
    );

    expect(nextProjects).not.toBe(projects);
    expect(nextProjects?.items[0]?.taskCounts).toEqual({
      TODO: 1,
      IN_PROGRESS: 1,
      DONE: 1,
    });
    expect(nextProjects?.items[1]).toEqual(projects.items[1]);
  });
});
