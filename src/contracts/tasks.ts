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

export type DeleteTaskResponse = {
  message: string;
};
