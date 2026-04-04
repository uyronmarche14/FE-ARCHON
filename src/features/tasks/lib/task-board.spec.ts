import { describe, expect, it } from "vitest";
import type { ProjectsListResponse, ProjectSummary } from "@/contracts/projects";
import type { ProjectTaskStatus, TaskCard, TaskStatus } from "@/contracts/tasks";
import {
  applyTaskStatusChangeToProjectsList,
  insertStatusIntoTaskStatuses,
  moveTaskToStatus,
} from "@/features/tasks/lib/task-board";

function createTaskStatus(overrides: Partial<TaskStatus> = {}): TaskStatus {
  return {
    id: overrides.id ?? "status-todo",
    name: overrides.name ?? "Todo",
    position: overrides.position ?? 1,
    isClosed: overrides.isClosed ?? false,
    color: overrides.color ?? (overrides.isClosed ? "GREEN" : "SLATE"),
  };
}

function createTask(overrides: Partial<TaskCard> = {}): TaskCard {
  const status =
    overrides.status ??
    createTaskStatus({
      id: overrides.statusId ?? "status-todo",
      name: "Todo",
      position: 1,
      isClosed: false,
    });

  return {
    id: overrides.id ?? "task-1",
    projectId: overrides.projectId ?? "project-1",
    title: overrides.title ?? "Task",
    description: overrides.description ?? null,
    acceptanceCriteria: overrides.acceptanceCriteria ?? null,
    notes: overrides.notes ?? null,
    parentTaskId: overrides.parentTaskId ?? null,
    statusId: overrides.statusId ?? status.id,
    status,
    position: overrides.position ?? 1,
    assigneeId: overrides.assigneeId ?? null,
    dueDate: overrides.dueDate ?? null,
    links: overrides.links ?? [],
    checklistItems: overrides.checklistItems ?? [],
    subtasks: overrides.subtasks ?? [],
    createdAt: overrides.createdAt ?? "2026-04-01T09:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-01T09:00:00.000Z",
  };
}

function createProjectTaskStatus(
  overrides: Partial<ProjectTaskStatus> = {},
): ProjectTaskStatus {
  return {
    ...createTaskStatus(overrides),
    tasks: overrides.tasks ?? [],
  };
}

function createProjectSummary(
  overrides: Partial<ProjectSummary> = {},
): ProjectSummary {
  return {
    id: overrides.id ?? "project-1",
    name: overrides.name ?? "Project one",
    description: overrides.description ?? null,
    role: overrides.role ?? "OWNER",
    statuses: overrides.statuses ?? [],
  };
}

describe("task-board helpers", () => {
  it("moves a task between dynamic statuses and clears position for v1 kanban moves", () => {
    const todoStatus = createProjectTaskStatus({
      id: "status-todo",
      name: "Todo",
      position: 1,
      tasks: [
        createTask({
          id: "task-todo",
          statusId: "status-todo",
          status: createTaskStatus({
            id: "status-todo",
            name: "Todo",
            position: 1,
          }),
          position: 2,
        }),
      ],
    });
    const doneStatus = createProjectTaskStatus({
      id: "status-done",
      name: "Done",
      position: 2,
      isClosed: true,
      tasks: [],
    });

    const result = moveTaskToStatus(
      [todoStatus, doneStatus],
      "task-todo",
      "status-done",
    );

    expect(result.changed).toBe(true);
    expect(result.previousTask?.statusId).toBe("status-todo");
    expect(result.nextTask).toMatchObject({
      id: "task-todo",
      statusId: "status-done",
      position: null,
    });
    expect(result.nextTask?.status).toMatchObject({
      id: "status-done",
      name: "Done",
      isClosed: true,
    });
    expect(result.nextStatuses[0]?.tasks).toHaveLength(0);
    expect(result.nextStatuses[1]?.tasks).toEqual([
      expect.objectContaining({
        id: "task-todo",
        statusId: "status-done",
        position: null,
      }),
    ]);
  });

  it("treats same-status moves as a no-op", () => {
    const todoStatus = createProjectTaskStatus({
      id: "status-todo",
      name: "Todo",
      position: 1,
      tasks: [
        createTask({
          id: "task-todo",
          statusId: "status-todo",
          status: createTaskStatus({
            id: "status-todo",
            name: "Todo",
            position: 1,
          }),
        }),
      ],
    });

    const result = moveTaskToStatus([todoStatus], "task-todo", "status-todo");

    expect(result.changed).toBe(false);
    expect(result.nextTask).toBeNull();
    expect(result.nextStatuses).toEqual([todoStatus]);
    expect(result.previousTask).toMatchObject({
      id: "task-todo",
      statusId: "status-todo",
    });
  });

  it("updates project status counts immutably for optimistic status changes", () => {
    const projects: ProjectsListResponse = {
      items: [
        createProjectSummary({
          id: "project-1",
          statuses: [
            {
              id: "status-todo",
              name: "Todo",
              position: 1,
              isClosed: false,
              color: "SLATE",
              taskCount: 2,
            },
            {
              id: "status-progress",
              name: "In Progress",
              position: 2,
              isClosed: false,
              color: "BLUE",
              taskCount: 1,
            },
            {
              id: "status-done",
              name: "Done",
              position: 3,
              isClosed: true,
              color: "GREEN",
              taskCount: 0,
            },
          ],
        }),
        createProjectSummary({
          id: "project-2",
          name: "Project two",
          role: "MEMBER",
          statuses: [
            {
              id: "other-status",
              name: "Todo",
              position: 1,
              isClosed: false,
              color: "SLATE",
              taskCount: 1,
            },
          ],
        }),
      ],
    };

    const nextProjects = applyTaskStatusChangeToProjectsList(
      projects,
      "project-1",
      "status-todo",
      "status-done",
    );

    expect(nextProjects).not.toBe(projects);
    expect(nextProjects?.items[0]?.statuses).toEqual([
      {
        id: "status-todo",
        name: "Todo",
        position: 1,
        isClosed: false,
        color: "SLATE",
        taskCount: 1,
      },
      {
        id: "status-progress",
        name: "In Progress",
        position: 2,
        isClosed: false,
        color: "BLUE",
        taskCount: 1,
      },
      {
        id: "status-done",
        name: "Done",
        position: 3,
        isClosed: true,
        color: "GREEN",
        taskCount: 1,
      },
    ]);
    expect(nextProjects?.items[1]).toEqual(projects.items[1]);
  });

  it("inserts a newly created dynamic status in board order", () => {
    const statuses = [
      createProjectTaskStatus({
        id: "status-todo",
        name: "Todo",
        position: 1,
      }),
      createProjectTaskStatus({
        id: "status-done",
        name: "Done",
        position: 3,
        isClosed: true,
      }),
    ];

    const nextStatuses = insertStatusIntoTaskStatuses(statuses, {
      id: "status-review",
      name: "Review",
      position: 2,
      isClosed: false,
      color: "AMBER",
      taskCount: 0,
    });

    expect(nextStatuses.map((status) => status.name)).toEqual([
      "Todo",
      "Review",
      "Done",
    ]);
    expect(nextStatuses[1]).toMatchObject({
      id: "status-review",
      isClosed: false,
      position: 2,
      tasks: [],
    });
  });
});
