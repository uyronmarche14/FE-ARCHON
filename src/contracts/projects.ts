import type { TaskGroups, TaskStatus } from "@/contracts/tasks";

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

export type ProjectMember = {
  id: string;
  name: string;
  role: ProjectRole;
};

export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  members: ProjectMember[];
  taskGroups: TaskGroups;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
};
