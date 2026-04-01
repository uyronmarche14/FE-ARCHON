import type { ApiErrorDetails } from "@/contracts/api";
import type {
  CreateTaskRequest,
  TaskCard,
  TaskStatus,
  UpdateTaskRequest,
} from "@/contracts/tasks";

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string;
  dueDate: string;
};

export type TaskFormErrors = Partial<
  Record<"title" | "description" | "assigneeId" | "dueDate", string>
>;

export function createTaskFormValues(
  status: TaskStatus,
  task?: TaskCard | null,
): TaskFormValues {
  if (!task) {
    return {
      title: "",
      description: "",
      status,
      assigneeId: "",
      dueDate: "",
    };
  }

  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    assigneeId: task.assigneeId ?? "",
    dueDate: task.dueDate ?? "",
  };
}

export function normalizeCreateTaskFormValues(
  values: TaskFormValues,
): CreateTaskRequest {
  const normalizedTitle = normalizeTaskTitle(values.title);
  const normalizedDescription = normalizeOptionalText(values.description);
  const normalizedAssigneeId = normalizeOptionalText(values.assigneeId);
  const normalizedDueDate = normalizeOptionalText(values.dueDate);

  return {
    title: normalizedTitle,
    status: values.status,
    ...(normalizedDescription ? { description: normalizedDescription } : {}),
    ...(normalizedAssigneeId ? { assigneeId: normalizedAssigneeId } : {}),
    ...(normalizedDueDate ? { dueDate: normalizedDueDate } : {}),
  };
}

export function buildUpdateTaskRequest(
  task: TaskCard,
  values: TaskFormValues,
): UpdateTaskRequest | null {
  const request: UpdateTaskRequest = {};
  const normalizedTitle = normalizeTaskTitle(values.title);
  const normalizedDescription = normalizeOptionalText(values.description);
  const normalizedAssigneeId = normalizeOptionalText(values.assigneeId);
  const normalizedDueDate = normalizeOptionalText(values.dueDate);

  if (normalizedTitle !== task.title) {
    request.title = normalizedTitle;
  }

  if (normalizedDescription !== task.description) {
    request.description = normalizedDescription;
  }

  if (normalizedAssigneeId !== task.assigneeId) {
    request.assigneeId = normalizedAssigneeId;
  }

  if (normalizedDueDate !== task.dueDate) {
    request.dueDate = normalizedDueDate;
  }

  return Object.keys(request).length > 0 ? request : null;
}

export function validateTaskFormValues(
  values: TaskFormValues,
): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const normalizedTitle = normalizeTaskTitle(values.title);
  const normalizedDescription = normalizeOptionalText(values.description);
  const normalizedDueDate = normalizeOptionalText(values.dueDate);

  if (!normalizedTitle) {
    errors.title = "Task title is required.";
  } else if (normalizedTitle.length > 160) {
    errors.title = "Task title must be 160 characters or fewer.";
  }

  if (normalizedDescription !== null && normalizedDescription.length > 5000) {
    errors.description = "Task description must be 5000 characters or fewer.";
  }

  if (normalizedDueDate && Number.isNaN(Date.parse(normalizedDueDate))) {
    errors.dueDate = "Due date must be a valid date.";
  }

  return errors;
}

export function mapTaskFormErrors(details?: ApiErrorDetails): TaskFormErrors {
  if (!details) {
    return {};
  }

  return {
    title: readTaskFieldError(details.title),
    description: readTaskFieldError(details.description),
    assigneeId: readTaskFieldError(details.assigneeId),
    dueDate: readTaskFieldError(details.dueDate),
  };
}

function normalizeTaskTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function readTaskFieldError(detail?: string[] | string) {
  if (Array.isArray(detail)) {
    return detail[0];
  }

  return typeof detail === "string" ? detail : undefined;
}
