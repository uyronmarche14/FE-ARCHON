import type { ProjectSummary } from "@/contracts/projects";
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

const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

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
    return "UN";
  }

  const cleanedValue = assigneeId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  return cleanedValue.slice(0, 2) || "AS";
}

export function getTaskDueLabel(dueDate: string | null) {
  return dueDate ? `Due ${dueDate}` : "No due date";
}

export function getTaskUpdatedLabel(updatedAt: string) {
  return `Updated ${updatedAt.slice(0, 10)}`;
}

export function getTaskPositionLabel(position: number | null, status: TaskStatus) {
  if (position === null) {
    return `No fixed position in ${formatTaskStatusLabel(status)}.`;
  }

  return `Card ${position} in the ${formatTaskStatusLabel(status)} lane.`;
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
