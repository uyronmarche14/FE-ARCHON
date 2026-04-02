import type {
  TaskGroups,
  TaskLogEventType,
  TaskLogValue,
  TaskStatus,
} from "@/contracts/tasks";

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

export type CreateProjectInviteRequest = {
  email: string;
  role?: ProjectRole;
};

export type CreateProjectInviteResponse = {
  message: string;
  email: string;
  expiresAt: string;
};

export type InvitePreview = {
  project: {
    id: string;
    name: string;
  };
  email: string;
  role: ProjectRole;
  expiresAt: string;
  invitedBy: {
    id: string;
    name: string;
  };
};

export type AcceptInviteResponse = {
  accepted: true;
  project: {
    id: string;
    name: string;
  };
};

export type ProjectActivityEntry = {
  id: string;
  eventType: TaskLogEventType;
  fieldName: string | null;
  oldValue: TaskLogValue;
  newValue: TaskLogValue;
  summary: string;
  createdAt: string;
  actor: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    title: string;
    status: TaskStatus;
  };
};

export type ProjectActivityResponse = {
  items: ProjectActivityEntry[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};
