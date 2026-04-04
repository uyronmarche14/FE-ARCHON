import type { ApiErrorDetails } from "@/contracts/api";
import type {
  CreateTaskRequest,
  TaskCard,
  UpdateTaskRequest,
} from "@/contracts/tasks";

export type TaskFormLinkValue = {
  id: string;
  label: string;
  url: string;
};

export type TaskFormChecklistItemValue = {
  id: string;
  label: string;
  isCompleted: boolean;
};

export type TaskFormValues = {
  title: string;
  description: string;
  acceptanceCriteria: string;
  notes: string;
  statusId: string;
  assigneeId: string;
  dueDate: string;
  links: TaskFormLinkValue[];
  checklistItems: TaskFormChecklistItemValue[];
};

export type TaskFormErrors = Partial<
  Record<
    | "title"
    | "description"
    | "acceptanceCriteria"
    | "notes"
    | "assigneeId"
    | "dueDate"
    | "links"
    | "checklistItems",
    string
  >
>;

export function createTaskFormValues(
  statusId: string,
  task?: TaskCard | null,
): TaskFormValues {
  if (!task) {
    return {
      title: "",
      description: "",
      acceptanceCriteria: "",
      notes: "",
      statusId,
      assigneeId: "",
      dueDate: "",
      links: [],
      checklistItems: [],
    };
  }

  return {
    title: task.title,
    description: task.description ?? "",
    acceptanceCriteria: task.acceptanceCriteria ?? "",
    notes: task.notes ?? "",
    statusId: task.statusId,
    assigneeId: task.assigneeId ?? "",
    dueDate: task.dueDate ?? "",
    links: task.links.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
    })),
    checklistItems: task.checklistItems.map((item) => ({
      id: item.id,
      label: item.label,
      isCompleted: item.isCompleted,
    })),
  };
}

export function normalizeCreateTaskFormValues(
  values: TaskFormValues,
): CreateTaskRequest {
  const normalizedTitle = normalizeTaskTitle(values.title);
  const normalizedDescription = normalizeOptionalText(values.description);
  const normalizedAcceptanceCriteria = normalizeOptionalText(
    values.acceptanceCriteria,
  );
  const normalizedNotes = normalizeOptionalText(values.notes);
  const normalizedAssigneeId = normalizeOptionalText(values.assigneeId);
  const normalizedDueDate = normalizeOptionalText(values.dueDate);
  const normalizedLinks = normalizeTaskLinks(values.links);
  const normalizedChecklistItems = normalizeChecklistItems(values.checklistItems);

  return {
    title: normalizedTitle,
    statusId: values.statusId,
    ...(normalizedDescription ? { description: normalizedDescription } : {}),
    ...(normalizedAcceptanceCriteria
      ? { acceptanceCriteria: normalizedAcceptanceCriteria }
      : {}),
    ...(normalizedNotes ? { notes: normalizedNotes } : {}),
    ...(normalizedAssigneeId ? { assigneeId: normalizedAssigneeId } : {}),
    ...(normalizedDueDate ? { dueDate: normalizedDueDate } : {}),
    ...(normalizedLinks.length > 0 ? { links: normalizedLinks } : {}),
    ...(normalizedChecklistItems.length > 0
      ? { checklistItems: normalizedChecklistItems }
      : {}),
  };
}

export function buildUpdateTaskRequest(
  task: TaskCard,
  values: TaskFormValues,
): UpdateTaskRequest | null {
  const request: UpdateTaskRequest = {};
  const normalizedTitle = normalizeTaskTitle(values.title);
  const normalizedDescription = normalizeOptionalText(values.description);
  const normalizedAcceptanceCriteria = normalizeOptionalText(
    values.acceptanceCriteria,
  );
  const normalizedNotes = normalizeOptionalText(values.notes);
  const normalizedAssigneeId = normalizeOptionalText(values.assigneeId);
  const normalizedDueDate = normalizeOptionalText(values.dueDate);
  const normalizedLinks = normalizeTaskLinks(values.links);
  const normalizedChecklistItems = normalizeChecklistItems(values.checklistItems);

  if (normalizedTitle !== task.title) {
    request.title = normalizedTitle;
  }

  if (normalizedDescription !== task.description) {
    request.description = normalizedDescription;
  }

  if (normalizedAcceptanceCriteria !== task.acceptanceCriteria) {
    request.acceptanceCriteria = normalizedAcceptanceCriteria;
  }

  if (normalizedNotes !== task.notes) {
    request.notes = normalizedNotes;
  }

  if (normalizedAssigneeId !== task.assigneeId) {
    request.assigneeId = normalizedAssigneeId;
  }

  if (normalizedDueDate !== task.dueDate) {
    request.dueDate = normalizedDueDate;
  }

  if (
    JSON.stringify(normalizedLinks) !==
    JSON.stringify(
      task.links.map((link) => ({
        label: link.label,
        url: link.url,
      })),
    )
  ) {
    request.links = normalizedLinks;
  }

  if (
    JSON.stringify(normalizedChecklistItems) !==
    JSON.stringify(
      task.checklistItems.map((item) => ({
        label: item.label,
        isCompleted: item.isCompleted,
      })),
    )
  ) {
    request.checklistItems = normalizedChecklistItems;
  }

  return Object.keys(request).length > 0 ? request : null;
}

export function validateTaskFormValues(
  values: TaskFormValues,
): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const normalizedTitle = normalizeTaskTitle(values.title);
  const normalizedDescription = normalizeOptionalText(values.description);
  const normalizedAcceptanceCriteria = normalizeOptionalText(
    values.acceptanceCriteria,
  );
  const normalizedNotes = normalizeOptionalText(values.notes);
  const normalizedDueDate = normalizeOptionalText(values.dueDate);

  if (!normalizedTitle) {
    errors.title = "Task title is required.";
  } else if (normalizedTitle.length > 160) {
    errors.title = "Task title must be 160 characters or fewer.";
  }

  if (normalizedDescription !== null && normalizedDescription.length > 5000) {
    errors.description = "Summary must be 5000 characters or fewer.";
  }

  if (
    normalizedAcceptanceCriteria !== null &&
    normalizedAcceptanceCriteria.length > 5000
  ) {
    errors.acceptanceCriteria =
      "Acceptance criteria must be 5000 characters or fewer.";
  }

  if (normalizedNotes !== null && normalizedNotes.length > 5000) {
    errors.notes = "Notes must be 5000 characters or fewer.";
  }

  if (normalizedDueDate && Number.isNaN(Date.parse(normalizedDueDate))) {
    errors.dueDate = "Due date must be a valid date.";
  }

  if (values.links.some((link) => link.label.trim().length === 0)) {
    errors.links = "Each link needs a label.";
  } else if (values.links.some((link) => link.url.trim().length === 0)) {
    errors.links = "Each link needs a URL.";
  } else if (
    values.links.some((link) => !isValidTaskUrl(normalizeOptionalText(link.url)))
  ) {
    errors.links = "Each link must use a valid absolute URL.";
  }

  if (
    values.checklistItems.some((item) => item.label.trim().replace(/\s+/g, " ").length === 0)
  ) {
    errors.checklistItems = "Checklist items cannot be empty.";
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
    acceptanceCriteria: readTaskFieldError(details.acceptanceCriteria),
    notes: readTaskFieldError(details.notes),
    assigneeId: readTaskFieldError(details.assigneeId),
    dueDate: readTaskFieldError(details.dueDate),
    links: readTaskFieldError(details.links),
    checklistItems: readTaskFieldError(details.checklistItems),
  };
}

export function createEmptyTaskFormLink(): TaskFormLinkValue {
  return {
    id: crypto.randomUUID(),
    label: "",
    url: "",
  };
}

export function createEmptyTaskChecklistItem(): TaskFormChecklistItemValue {
  return {
    id: crypto.randomUUID(),
    label: "",
    isCompleted: false,
  };
}

function normalizeTaskTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeTaskLinks(links: TaskFormLinkValue[]) {
  return links.map((link) => ({
    label: normalizeTaskTitle(link.label),
    url: link.url.trim(),
  }));
}

function normalizeChecklistItems(checklistItems: TaskFormChecklistItemValue[]) {
  return checklistItems.map((item) => ({
    label: normalizeTaskTitle(item.label),
    isCompleted: item.isCompleted,
  }));
}

function isValidTaskUrl(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function readTaskFieldError(
  detail?: string | number | boolean | string[] | null,
) {
  if (Array.isArray(detail)) {
    return detail[0];
  }

  return typeof detail === "string" ? detail : undefined;
}
