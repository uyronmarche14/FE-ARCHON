import type {
  ProjectMember,
  ProjectsListResponse,
  ProjectSummary,
} from "@/contracts/projects";
import type { TaskCard, TaskGroups, TaskStatus } from "@/contracts/tasks";

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

export type TaskMemberLookup = Record<string, string>;

export type BoardTaskAssigneeFilter = "ALL" | "UNASSIGNED" | string;
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

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const BOARD_LANE_CONTENT: Record<
  TaskStatus,
  Pick<BoardLane, "description" | "title">
> = {
  TODO: {
    title: "Todo",
    description: "Queued work prepared for the next execution cycle.",
  },
  IN_PROGRESS: {
    title: "In progress",
    description: "Work already moving and worth checking first.",
  },
  DONE: {
    title: "Done",
    description: "Completed work that confirms delivery momentum.",
  },
};

export function createEmptyTaskGroups(): TaskGroups {
  return {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };
}

export function createBoardLanes(taskGroups: TaskGroups): BoardLane[] {
  return TASK_STATUSES.map((status) => ({
    status,
    tasks: taskGroups[status],
    title: BOARD_LANE_CONTENT[status].title,
    description: BOARD_LANE_CONTENT[status].description,
  }));
}

export function filterAndSortTaskGroups(
  taskGroups: TaskGroups,
  options: {
    searchQuery: string;
    assigneeFilter: BoardTaskAssigneeFilter;
    dueDateFilter: BoardTaskDueDateFilter;
    sortOrder: BoardTaskSort;
  },
): TaskGroups {
  const normalizedSearchQuery = options.searchQuery.trim().toLowerCase();
  const nextGroups = createEmptyTaskGroups();

  for (const status of TASK_STATUSES) {
    nextGroups[status] = sortBoardTasks(
      taskGroups[status].filter((task) => {
        if (
          normalizedSearchQuery.length > 0 &&
          !`${task.title} ${task.description ?? ""}`
            .toLowerCase()
            .includes(normalizedSearchQuery)
        ) {
          return false;
        }

        if (options.assigneeFilter === "UNASSIGNED" && task.assigneeId !== null) {
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
    );
  }

  return nextGroups;
}

export function createAssigneeFilterOptions(
  taskGroups: TaskGroups,
  members: Array<{ id: string; name: string }>,
) {
  const allTasks = flattenTaskGroups(taskGroups);

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

export function flattenTaskGroups(taskGroups: TaskGroups) {
  return TASK_STATUSES.flatMap((status) => taskGroups[status]);
}

export function createBoardMetrics(taskGroups: TaskGroups): BoardMetric[] {
  const totalTasks = getTotalTaskCount(taskGroups);
  const inProgressCount = taskGroups.IN_PROGRESS.length;
  const doneCount = taskGroups.DONE.length;

  return [
    { label: "Tracked tasks", value: String(totalTasks) },
    { label: "Active lane cards", value: String(inProgressCount) },
    { label: "Completed", value: String(doneCount) },
  ];
}

export function createBoardFilters(taskGroups: TaskGroups) {
  return [
    { label: "All work", value: getTotalTaskCount(taskGroups), active: true },
    { label: "Todo", value: taskGroups.TODO.length },
    { label: "Active", value: taskGroups.IN_PROGRESS.length },
    { label: "Completed", value: taskGroups.DONE.length },
  ];
}

export function insertTaskIntoGroups(
  taskGroups: TaskGroups,
  task: TaskCard,
): TaskGroups {
  const nextGroups = cloneTaskGroups(taskGroups);
  nextGroups[task.status] = sortBoardTasks([...nextGroups[task.status], task]);

  return nextGroups;
}

export function updateTaskInGroups(
  taskGroups: TaskGroups,
  task: TaskCard,
): TaskGroups {
  const nextGroups = createEmptyTaskGroups();

  for (const status of TASK_STATUSES) {
    const laneTasks = taskGroups[status].filter((laneTask) => laneTask.id !== task.id);

    nextGroups[status] = laneTasks;
  }

  nextGroups[task.status] = sortBoardTasks([...nextGroups[task.status], task]);

  return nextGroups;
}

export function moveTaskToStatus(
  taskGroups: TaskGroups,
  taskId: string,
  nextStatus: TaskStatus,
) {
  const previousTask = flattenTaskGroups(taskGroups).find((task) => task.id === taskId);

  if (!previousTask || previousTask.status === nextStatus) {
    return {
      changed: false,
      nextTask: null,
      nextTaskGroups: taskGroups,
      previousTask: previousTask ?? null,
    } as const;
  }

  const nextTask: TaskCard = {
    ...previousTask,
    status: nextStatus,
    position: null,
  };

  return {
    changed: true,
    nextTask,
    nextTaskGroups: updateTaskInGroups(taskGroups, nextTask),
    previousTask,
  } as const;
}

export function removeTaskFromGroups(
  taskGroups: TaskGroups,
  taskId: string,
): TaskGroups {
  const nextGroups = createEmptyTaskGroups();

  for (const status of TASK_STATUSES) {
    nextGroups[status] = taskGroups[status].filter((task) => task.id !== taskId);
  }

  return nextGroups;
}

export function applyTaskStatusChangeToProjectsList(
  projects: ProjectsListResponse | undefined,
  projectId: string,
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
) {
  if (!projects || fromStatus === toStatus) {
    return projects;
  }

  return {
    items: projects.items.map((project) =>
      project.id === projectId
        ? {
            ...project,
            taskCounts: {
              ...project.taskCounts,
              [fromStatus]: Math.max(0, project.taskCounts[fromStatus] - 1),
              [toStatus]: project.taskCounts[toStatus] + 1,
            },
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
    "Scan open work quickly, keep active tasks in view, and open a lightweight preview without losing your place in the board."
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

export function getTaskPositionLabel(position: number | null, status: TaskStatus) {
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

export function formatTaskStatusLabel(status: TaskStatus) {
  if (status === "IN_PROGRESS") {
    return "In progress";
  }

  if (status === "DONE") {
    return "Done";
  }

  return "Todo";
}

function cloneTaskGroups(taskGroups: TaskGroups) {
  return {
    TODO: [...taskGroups.TODO],
    IN_PROGRESS: [...taskGroups.IN_PROGRESS],
    DONE: [...taskGroups.DONE],
  };
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

function getTotalTaskCount(taskGroups: TaskGroups) {
  return (
    taskGroups.TODO.length +
    taskGroups.IN_PROGRESS.length +
    taskGroups.DONE.length
  );
}

function humanizeProjectSlug(projectId: string) {
  return projectId
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatBoardDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function matchesDueDateFilter(
  dueDate: string | null,
  filter: BoardTaskDueDateFilter,
) {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "NO_DUE_DATE") {
    return dueDate === null;
  }

  if (dueDate === null) {
    return false;
  }

  const taskDueDate = new Date(`${dueDate}T00:00:00.000Z`);
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const sevenDaysFromToday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (filter === "OVERDUE") {
    return taskDueDate.getTime() < today.getTime();
  }

  if (filter === "NEXT_7_DAYS") {
    return (
      taskDueDate.getTime() >= today.getTime() &&
      taskDueDate.getTime() <= sevenDaysFromToday.getTime()
    );
  }

  return taskDueDate.getTime() > sevenDaysFromToday.getTime();
}
