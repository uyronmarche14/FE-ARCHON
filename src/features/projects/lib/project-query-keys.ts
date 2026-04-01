export const projectsQueryKey = ["projects"] as const;

export function projectDetailQueryKey(projectId: string) {
  return ["project", projectId] as const;
}
