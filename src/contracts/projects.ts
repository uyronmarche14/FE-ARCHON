export type ProjectStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type ProjectTaskCounts = Record<ProjectStatus, number>;

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
