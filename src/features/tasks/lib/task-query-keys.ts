export function projectTasksQueryKey(projectId: string) {
  return ["project", projectId, "tasks"] as const;
}
