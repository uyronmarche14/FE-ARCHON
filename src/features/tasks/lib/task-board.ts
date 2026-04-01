import type { ProjectsListResponse, ProjectSummary } from "@/contracts/projects";
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

export function getTaskAssigneeLabel(assigneeId: string | null) {
  return assigneeId ?? "Unassigned";
}

export function getTaskAssigneeInitials(assigneeId: string | null) {
  if (!assigneeId) {
    return "UA";
  }

  const cleanedValue = assigneeId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  return cleanedValue.slice(0, 2) || "AS";
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

function sortBoardTasks(tasks: TaskCard[]) {
  return [...tasks].sort((left, right) => {
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
