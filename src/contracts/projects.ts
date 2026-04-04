import type {
  ProjectTaskStatus,
  TaskLogEventType,
  TaskLogValue,
} from "@/contracts/tasks";

export type ProjectRole = "OWNER" | "MEMBER";

export type ProjectStatusSummary = {
  id: string;
  name: string;
  position: number;
  isClosed: boolean;
  taskCount: number;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  role: ProjectRole;
  statuses: ProjectStatusSummary[];
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
  statuses: ProjectTaskStatus[];
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
};

export type CreateProjectStatusRequest = {
  name: string;
  isClosed?: boolean;
};

export type ProjectStatusResponse = ProjectStatusSummary;

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
    statusId: string;
    statusName: string;
    isClosed: boolean;
  };
};

export type ProjectActivityResponse = {
  items: ProjectActivityEntry[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};
