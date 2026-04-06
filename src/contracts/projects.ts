import type { ProjectTaskStatus } from "@/contracts/tasks";
import type {
  ProjectStatusColor,
  TaskLogEventType,
  TaskLogValue,
} from "@/contracts/workflow";
export type { ProjectStatusColor } from "@/contracts/workflow";

export type ProjectRole = "OWNER" | "MEMBER";

export type ProjectStatusSummary = {
  id: string;
  name: string;
  position: number;
  isClosed: boolean;
  color: ProjectStatusColor;
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

export type UpdateProjectRequest = {
  name?: string;
  description?: string | null;
};

export type DeleteProjectResponse = {
  message: string;
};

export type CreateProjectStatusRequest = {
  name: string;
  isClosed?: boolean;
  color?: ProjectStatusColor;
};

export type UpdateProjectStatusRequest = {
  name?: string;
  isClosed?: boolean;
  color?: ProjectStatusColor;
};

export type ReorderProjectStatusesRequest = {
  statuses: Array<{
    id: string;
  }>;
};

export type DeleteProjectStatusRequest = {
  moveToStatusId: string;
};

export type ProjectStatusResponse = ProjectStatusSummary;

export type ProjectStatusListResponse = {
  items: ProjectStatusSummary[];
};

export type CreateProjectInviteRequest = {
  email: string;
  role?: ProjectRole;
};

export type CreateProjectInviteResponse = {
  message: string;
  email: string;
  expiresAt: string;
  deliveryMode: "email" | "link";
  inviteUrl: string | null;
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

export type PendingProjectInvite = {
  token: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
  role: ProjectRole;
  expiresAt: string;
  invitedBy: {
    id: string;
    name: string;
  };
};

export type PendingProjectInvitesResponse = {
  items: PendingProjectInvite[];
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
