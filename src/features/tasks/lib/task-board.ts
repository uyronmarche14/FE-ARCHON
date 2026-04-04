import type {
  ProjectMember,
  ProjectsListResponse,
  ProjectStatusSummary,
  ProjectSummary,
} from "@/contracts/projects";
import type {
  ProjectStatusColor,
  ProjectTaskStatus,
  TaskCard,
  TaskStatus,
} from "@/contracts/tasks";

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

export type TaskMemberLookup = Record<string, string>;

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

export function createTaskMemberLookup(
  members: Pick<ProjectMember, "id" | "name">[],
): TaskMemberLookup {
  return members.reduce<TaskMemberLookup>((memberLookup, member) => {
    return {
      ...memberLookup,
      [member.id]: member.name,
    };
  }, {});
}

export function getTaskAssigneeLabel(
  assigneeId: string | null,
  memberLookup: TaskMemberLookup = {},
) {
  if (!assigneeId) {
    return "Unassigned";
  }

  return memberLookup[assigneeId] ?? "Unassigned";
}

export function getTaskAssigneeInitials(
  assigneeId: string | null,
  memberLookup: TaskMemberLookup = {},
) {
  const assigneeLabel = getTaskAssigneeLabel(assigneeId, memberLookup);

  if (assigneeLabel === "Unassigned") {
    return "UA";
  }

  return createInitialsFromName(assigneeLabel);
}

export function getTaskDueLabel(dueDate: string | null) {
  return dueDate ? `Due ${formatBoardDate(dueDate)}` : "No due date";
}

export function getTaskUpdatedLabel(updatedAt: string) {
  return `Updated ${formatBoardDate(updatedAt)}`;
}

export function getTaskPositionLabel(
  position: number | null,
  status: TaskStatus | string,
) {
  if (position === null) {
    return `No fixed order in ${formatTaskStatusLabel(status)}.`;
  }

  return `Card ${position} in ${formatTaskStatusLabel(status)}.`;
}

export function getTaskPositionSummaryLabel(position: number | null) {
  if (position === null) {
    return "Flexible";
  }

  return `#${position}`;
}

export function formatTaskStatusLabel(status: TaskStatus | string) {
  if (typeof status === "string") {
    const normalizedStatus =
      status === status.toUpperCase() ? status.toLowerCase() : status;

    return normalizedStatus
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return status.name;
}

export function getTaskStatusTone(status: TaskStatus) {
  if (status.color === "GREEN") {
    return "done" as const;
  }

  if (status.color === "BLUE" || status.color === "PURPLE") {
    return "progress" as const;
  }

  if (status.isClosed) {
    return "done" as const;
  }

  return "todo" as const;
}

export function getTaskStatusDotClassName(status: TaskStatus) {
  switch (status.color) {
    case "BLUE":
      return "bg-[color:var(--status-blue)]";
    case "AMBER":
      return "bg-[color:var(--status-amber)]";
    case "GREEN":
      return "bg-[color:var(--status-green)]";
    case "RED":
      return "bg-[color:var(--status-red)]";
    case "PURPLE":
      return "bg-[color:var(--status-purple)]";
    case "SLATE":
    default:
      return "bg-[color:var(--status-slate)]";
  }
}

export function getTaskStatusBadgeClassName(status: TaskStatus) {
  return getTaskStatusThemeClassName(status, "soft");
}

export function getTaskStatusCardClassName(status: TaskStatus) {
  return getTaskStatusThemeClassName(status, "card");
}

export function getTaskStatusSurfaceClassName(status: TaskStatus) {
  return getTaskStatusThemeClassName(status, "surface");
}

export function getTaskStatusChipClassName(
  status: TaskStatus,
  active: boolean,
) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  if (!active) {
    return `${base} border-transparent bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground`;
  }

  return `${base} ${getTaskStatusThemeClassName(status, "soft")} shadow-[0_1px_2px_rgba(15,23,42,0.04)]`;
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

function createInitialsFromName(name: string) {
  const nameParts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (nameParts.length === 0) {
    return "UA";
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
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

function formatBoardDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: value.includes("T") ? undefined : "numeric",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00.000Z`));
}

function humanizeProjectSlug(projectId: string) {
  return projectId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getTaskStatusThemeClassName(
  status: TaskStatus,
  tone: "soft" | "card" | "surface",
) {
  const colorKey = status.color.toLowerCase();

  if (tone === "card") {
    return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_18%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--status-${colorKey})_8%,white),white_52%,color-mix(in_srgb,var(--status-${colorKey})_6%,var(--surface-subtle)))]`;
  }

  if (tone === "surface") {
    return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--status-${colorKey})_8%,white)]`;
  }

  return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_24%,transparent)] bg-[color:color-mix(in_srgb,var(--status-${colorKey})_12%,white)] text-[color:var(--status-${colorKey})]`;
}
