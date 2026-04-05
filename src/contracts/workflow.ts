export type ProjectStatusColor =
  | "SLATE"
  | "BLUE"
  | "AMBER"
  | "GREEN"
  | "RED"
  | "PURPLE";

export type TaskLogEventType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "STATUS_CHANGED";

export type TaskLogAssigneeValue = {
  id: string;
  name: string;
};

export type TaskLogValue =
  | string
  | number
  | boolean
  | TaskLogAssigneeValue
  | null;
