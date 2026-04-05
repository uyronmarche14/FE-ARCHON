import type {
  ProjectsListResponse,
  ProjectStatusSummary,
  ProjectSummary,
} from "@/contracts/projects";
import type {
  ProjectTaskStatus,
  TaskCard,
  TaskStatus,
} from "@/contracts/tasks";
import type { ProjectStatusColor } from "@/contracts/workflow";

export type BoardLane = {
  description: string;
  status: TaskStatus;
  tasks: TaskCard[];
  title: string;
};

export type BoardMetric = {
  label: string;
  value: string;
};

export type BoardFilterChip = {
  label: string;
  statusId: "ALL" | string;
  value: number;
  active: boolean;
  color: ProjectStatusColor | null;
};

export type BoardTaskAssigneeFilter = "ALL" | "UNASSIGNED" | string;
export type BoardTaskStatusFilter = "ALL" | string;
export type BoardTaskDueDateFilter =
  | "ALL"
  | "NO_DUE_DATE"
  | "OVERDUE"
  | "NEXT_7_DAYS"
  | "FUTURE";
export type BoardTaskSort =
  | "DEFAULT"
  | "DUE_DATE"
  | "NEWEST_UPDATED"
  | "OLDEST_CREATED";

export function createEmptyTaskStatuses(): ProjectTaskStatus[] {
  return [];
}

export function createBoardLanes(statuses: ProjectTaskStatus[]): BoardLane[] {
  return statuses.map((status, index) => ({
    status,
    tasks: status.tasks,
    title: status.name,
    description: getBoardStatusDescription(status, index),
  }));
}

export function filterAndSortTaskStatuses(
  statuses: ProjectTaskStatus[],
  options: {
    searchQuery: string;
    statusFilter: BoardTaskStatusFilter;
    assigneeFilter: BoardTaskAssigneeFilter;
    dueDateFilter: BoardTaskDueDateFilter;
    sortOrder: BoardTaskSort;
  },
): ProjectTaskStatus[] {
  const normalizedSearchQuery = options.searchQuery.trim().toLowerCase();

  return statuses
    // Filter at the lane level first so the board can keep its workflow structure
    // even when the user scopes down to a single status chip.
    .filter(
      (status) =>
        options.statusFilter === "ALL" || status.id === options.statusFilter,
    )
    .map((status) => ({
      ...status,
      tasks: sortBoardTasks(
        status.tasks.filter((task) => {
          const searchableText = [
            task.title,
            task.description ?? "",
            task.acceptanceCriteria ?? "",
            task.notes ?? "",
          ]
            .join(" ")
            .toLowerCase();

          if (
            normalizedSearchQuery.length > 0 &&
            !searchableText.includes(normalizedSearchQuery)
          ) {
            return false;
          }

          if (
            options.assigneeFilter === "UNASSIGNED" &&
            task.assigneeId !== null
          ) {
            return false;
          }

          if (
            options.assigneeFilter !== "ALL" &&
            options.assigneeFilter !== "UNASSIGNED" &&
            task.assigneeId !== options.assigneeFilter
          ) {
            return false;
          }

          if (!matchesDueDateFilter(task.dueDate, options.dueDateFilter)) {
            return false;
          }

          return true;
        }),
        options.sortOrder,
      ),
    }));
}

export function createAssigneeFilterOptions(
  statuses: ProjectTaskStatus[],
  members: Array<{ id: string; name: string }>,
) {
  const allTasks = flattenTaskStatuses(statuses);

  return [
    { label: "All assignees", value: "ALL" as const },
    { label: "Unassigned", value: "UNASSIGNED" as const },
    ...members.map((member) => ({
      label: member.name,
      value: member.id,
      count: allTasks.filter((task) => task.assigneeId === member.id).length,
    })),
  ];
}

export function flattenTaskStatuses(statuses: ProjectTaskStatus[]) {
  return statuses.flatMap((status) => status.tasks);
}

export function createBoardMetrics(statuses: ProjectTaskStatus[]): BoardMetric[] {
  const totalTasks = getTotalTaskCount(statuses);
  const openTasks = statuses.reduce(
    (total, status) => total + (status.isClosed ? 0 : status.tasks.length),
    0,
  );
  const completedTasks = statuses.reduce(
    (total, status) => total + (status.isClosed ? status.tasks.length : 0),
    0,
  );

  return [
    { label: "Tracked tasks", value: String(totalTasks) },
    { label: "Open tasks", value: String(openTasks) },
    { label: "Completed", value: String(completedTasks) },
  ];
}

export function createBoardFilters(
  statuses: ProjectTaskStatus[],
  activeStatusFilter: BoardTaskStatusFilter,
): BoardFilterChip[] {
  return [
    {
      label: "All work",
      statusId: "ALL",
      value: getTotalTaskCount(statuses),
      active: activeStatusFilter === "ALL",
      color: null,
    },
    ...statuses.map((status) => ({
      label: status.name,
      statusId: status.id,
      value: status.tasks.length,
      active: activeStatusFilter === status.id,
      color: status.color,
    })),
  ];
}

export function insertTaskIntoStatuses(
  statuses: ProjectTaskStatus[],
  task: TaskCard,
): ProjectTaskStatus[] {
  return statuses.map((status) =>
    status.id === task.statusId
      ? {
          ...status,
          tasks: sortBoardTasks([...status.tasks, task]),
        }
      : status,
  );
}

export function updateTaskInStatuses(
  statuses: ProjectTaskStatus[],
  task: TaskCard,
): ProjectTaskStatus[] {
  return statuses.map((status) => {
    const remainingTasks = status.tasks.filter(
      (laneTask) => laneTask.id !== task.id,
    );

    if (status.id === task.statusId) {
      return {
        ...status,
        tasks: sortBoardTasks([...remainingTasks, task]),
      };
    }

    return {
      ...status,
      tasks: remainingTasks,
    };
  });
}

export function moveTaskToStatus(
  statuses: ProjectTaskStatus[],
  taskId: string,
  nextStatusId: string,
) {
  const previousTask = flattenTaskStatuses(statuses).find(
    (task) => task.id === taskId,
  );
  const nextStatus = statuses.find((status) => status.id === nextStatusId) ?? null;

  if (!previousTask || !nextStatus || previousTask.statusId === nextStatusId) {
    return {
      changed: false,
      nextTask: null,
      nextStatuses: statuses,
      previousTask: previousTask ?? null,
    } as const;
  }

  // Build the moved snapshot from the destination status so optimistic board state,
  // badges, and drawer metadata all agree before the server round-trip finishes.
  const nextTask: TaskCard = {
    ...previousTask,
    statusId: nextStatus.id,
    status: {
      id: nextStatus.id,
      name: nextStatus.name,
      position: nextStatus.position,
      isClosed: nextStatus.isClosed,
      color: nextStatus.color,
    },
    position: null,
  };

  return {
    changed: true,
    nextTask,
    nextStatuses: updateTaskInStatuses(statuses, nextTask),
    previousTask,
  } as const;
}

export function removeTaskFromStatuses(
  statuses: ProjectTaskStatus[],
  taskId: string,
): ProjectTaskStatus[] {
  return statuses.map((status) => ({
    ...status,
    tasks: status.tasks.filter((task) => task.id !== taskId),
  }));
}

export function applyTaskStatusChangeToProjectsList(
  projects: ProjectsListResponse | undefined,
  projectId: string,
  fromStatusId: string,
  toStatusId: string,
) {
  if (!projects || fromStatusId === toStatusId) {
    return projects;
  }

  // The dashboard only needs status counts here, so adjust the affected summaries
  // without forcing a full project list refetch.
  return {
    items: projects.items.map((project) =>
      project.id === projectId
        ? {
            ...project,
            statuses: project.statuses.map((status) => ({
              ...status,
              taskCount:
                status.id === fromStatusId
                  ? Math.max(0, status.taskCount - 1)
                  : status.id === toStatusId
                    ? status.taskCount + 1
                    : status.taskCount,
            })),
          }
        : project,
    ),
  } satisfies ProjectsListResponse;
}

export function applyCreatedTaskToProjectSummary(
  project: ProjectSummary,
  taskStatusId: string,
) {
  return {
    ...project,
    statuses: project.statuses.map((status) =>
      status.id === taskStatusId
        ? {
            ...status,
            taskCount: status.taskCount + 1,
          }
        : status,
    ),
  };
}

export function applyDeletedTaskToProjectSummary(
  project: ProjectSummary,
  taskStatusId: string,
) {
  return {
    ...project,
    statuses: project.statuses.map((status) =>
      status.id === taskStatusId
        ? {
            ...status,
            taskCount: Math.max(0, status.taskCount - 1),
          }
        : status,
    ),
  };
}

export function applyCreatedStatusToProjectSummary(
  project: ProjectSummary,
  status: ProjectStatusSummary,
) {
  return {
    ...project,
    statuses: [...project.statuses, status].sort(
      (left, right) => left.position - right.position,
    ),
  };
}

export function insertStatusIntoTaskStatuses(
  statuses: ProjectTaskStatus[],
  status: ProjectStatusSummary,
): ProjectTaskStatus[] {
  return [...statuses, { ...status, tasks: [] }].sort(
    (left, right) => left.position - right.position,
  );
}

export function reorderTaskStatuses(
  statuses: ProjectTaskStatus[],
  movedStatusId: string,
  targetStatusId: string,
): ProjectTaskStatus[] {
  const reorderedStatuses = reorderStatusCollection(
    statuses,
    movedStatusId,
    targetStatusId,
  );

  if (reorderedStatuses === statuses) {
    return statuses;
  }

  return reorderedStatuses.map((status) => ({
    ...status,
    tasks: status.tasks.map((task) => ({
      ...task,
      status: {
        ...task.status,
        name: status.name,
        position: status.position,
        isClosed: status.isClosed,
        color: status.color,
      },
    })),
  }));
}

export function applyStatusReorderToProjectsList(
  projects: ProjectsListResponse | undefined,
  projectId: string,
  movedStatusId: string,
  targetStatusId: string,
) {
  if (!projects || movedStatusId === targetStatusId) {
    return projects;
  }

  return {
    items: projects.items.map((project) =>
      project.id === projectId
        ? {
            ...project,
            statuses: reorderStatusCollection(
              project.statuses,
              movedStatusId,
              targetStatusId,
            ),
          }
        : project,
    ),
  } satisfies ProjectsListResponse;
}

export function getBoardProjectName(
  projectId: string,
  projectSummary?: ProjectSummary | null,
) {
  return projectSummary?.name ?? humanizeProjectSlug(projectId);
}

export function getBoardProjectDescription(projectSummary?: ProjectSummary | null) {
  return (
    projectSummary?.description ??
    "Scan open work quickly, keep active tasks in view, and open a richer task workspace without losing your place on the board."
  );
}

function getBoardStatusDescription(status: TaskStatus, index: number) {
  if (status.isClosed) {
    return "Completed work captured for handoff, review, and reference.";
  }

  if (index === 0) {
    return "Queued work prepared for the next execution cycle.";
  }

  return "Work currently moving through this workflow stage.";
}

function reorderStatusCollection<T extends { id: string; position: number }>(
  statuses: T[],
  movedStatusId: string,
  targetStatusId: string,
): T[] {
  const movedIndex = statuses.findIndex((status) => status.id === movedStatusId);
  const targetIndex = statuses.findIndex(
    (status) => status.id === targetStatusId,
  );

  if (
    movedIndex < 0 ||
    targetIndex < 0 ||
    movedIndex === targetIndex ||
    statuses.length <= 1
  ) {
    return statuses;
  }

  const nextStatuses = [...statuses];
  const [movedStatus] = nextStatuses.splice(movedIndex, 1);

  nextStatuses.splice(targetIndex, 0, movedStatus);

  return nextStatuses.map((status, index) => ({
    ...status,
    position: index + 1,
  }));
}

function sortBoardTasks(tasks: TaskCard[], sortOrder: BoardTaskSort = "DEFAULT") {
  return [...tasks].sort((left, right) => {
    if (sortOrder === "DUE_DATE") {
      if (left.dueDate && right.dueDate) {
        return (
          new Date(`${left.dueDate}T00:00:00.000Z`).getTime() -
          new Date(`${right.dueDate}T00:00:00.000Z`).getTime()
        );
      }

      if (left.dueDate) {
        return -1;
      }

      if (right.dueDate) {
        return 1;
      }
    }

    if (sortOrder === "NEWEST_UPDATED") {
      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    }

    if (sortOrder === "OLDEST_CREATED") {
      return (
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      );
    }

    if (left.position !== null && right.position !== null) {
      if (left.position !== right.position) {
        return left.position - right.position;
      }
    } else if (left.position !== null) {
      return -1;
    } else if (right.position !== null) {
      return 1;
    }

    return (
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
  });
}

function getTotalTaskCount(statuses: ProjectTaskStatus[]) {
  return statuses.reduce((total, status) => total + status.tasks.length, 0);
}

function matchesDueDateFilter(
  dueDate: string | null,
  dueDateFilter: BoardTaskDueDateFilter,
) {
  if (dueDateFilter === "ALL") {
    return true;
  }

  if (dueDateFilter === "NO_DUE_DATE") {
    return dueDate === null;
  }

  if (dueDate === null) {
    return false;
  }

  const dueDateValue = new Date(`${dueDate}T00:00:00.000Z`).getTime();
  const now = Date.now();
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

  if (dueDateFilter === "OVERDUE") {
    return dueDateValue < now;
  }

  if (dueDateFilter === "NEXT_7_DAYS") {
    return dueDateValue >= now && dueDateValue <= sevenDaysFromNow;
  }

  return dueDateValue > sevenDaysFromNow;
}

function humanizeProjectSlug(projectId: string) {
  return projectId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
