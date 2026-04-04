export function projectTasksQueryKey(projectId: string) {
  return ["project", projectId, "tasks"] as const;
}

export function taskLogsQueryKey(taskId: string) {
  return ["task", taskId, "logs"] as const;
}

export function taskCommentsQueryKey(taskId: string) {
  return ["task", taskId, "comments"] as const;
}

export function taskAttachmentsQueryKey(taskId: string) {
  return ["task", taskId, "attachments"] as const;
}
