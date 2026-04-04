import type { TaskLogValue } from "@/contracts/tasks";

export function getTaskActivityEventLabel(eventType: string) {
  if (eventType === "TASK_UPDATED") {
    return "Updated";
  }

  if (eventType === "STATUS_CHANGED") {
    return "Moved";
  }

  return "Created";
}

export function getTaskActivityFieldLabel(fieldName: string) {
  if (fieldName === "assigneeId") {
    return "Assignee";
  }

  if (fieldName === "dueDate") {
    return "Due date";
  }

  if (fieldName === "description") {
    return "Description";
  }

  if (fieldName === "status") {
    return "Status";
  }

  return "Title";
}

export function formatTaskActivityValue(fieldName: string, value: TaskLogValue) {
  if (fieldName === "status" && typeof value === "string") {
    return formatTaskStatusLabel(value);
  }

  if (fieldName === "dueDate") {
    return typeof value === "string" ? formatTaskActivityDate(value) : "No due date";
  }

  if (fieldName === "description") {
    return typeof value === "string" && value.length > 0 ? value : "No description";
  }

  if (fieldName === "assigneeId") {
    return isTaskLogAssigneeValue(value) ? value.name : "Unassigned";
  }

  if (value === null) {
    return "Empty";
  }

  return String(value);
}

export function formatTaskActivityTimestamp(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(createdAt));
}

export function formatTaskActivityDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function formatTaskStatusLabel(status: unknown) {
  if (typeof status !== "string") {
    return "Unknown";
  }

  const normalizedStatus =
    status === status.toUpperCase() ? status.toLowerCase() : status;

  return normalizedStatus
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isTaskLogAssigneeValue(value: TaskLogValue): value is {
  id: string;
  name: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}
