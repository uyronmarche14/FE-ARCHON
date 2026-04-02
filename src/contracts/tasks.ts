export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskCard = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number | null;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskGroups = Record<TaskStatus, TaskCard[]>;

export type ProjectTasksResponse = {
  taskGroups: TaskGroups;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
};

export type UpdateTaskRequest = {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
};

export type UpdateTaskStatusRequest = {
  status: TaskStatus;
  position?: number | null;
};

export type DeleteTaskResponse = {
  message: string;
};

export type TaskLogEventType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "STATUS_CHANGED";

export type TaskLogAssigneeValue = {
  id: string;
  name: string;
};

export type TaskLogValue = string | number | boolean | TaskLogAssigneeValue | null;

export type TaskLogEntry = {
  id: string;
  eventType: TaskLogEventType;
  fieldName: string | null;
  oldValue: TaskLogValue;
  newValue: TaskLogValue;
  summary: string;
  actor: {
    id: string;
    name: string;
  };
  createdAt: string;
};

export type TaskLogsResponse = {
  items: TaskLogEntry[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};
