import type { TaskStatus } from "@/contracts/tasks";

export type ProjectTaskCounts = Record<TaskStatus, number>;

export type ProjectRole = "OWNER" | "MEMBER";

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  role: ProjectRole;
  taskCounts: ProjectTaskCounts;
};

export type ProjectsListResponse = {
  items: ProjectSummary[];
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
};
