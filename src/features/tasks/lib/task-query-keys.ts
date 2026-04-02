export function projectTasksQueryKey(projectId: string) {
  return ["project", projectId, "tasks"] as const;
}

export function taskLogsQueryKey(taskId: string) {
  return ["task", taskId, "logs"] as const;
}
