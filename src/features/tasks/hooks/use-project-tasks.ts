"use client";

import { useQuery } from "@tanstack/react-query";
import { projectTasksQueryKey } from "@/features/tasks/lib/task-query-keys";
import { getProjectTasks } from "@/features/tasks/services/get-project-tasks";

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: projectTasksQueryKey(projectId),
    queryFn: () => getProjectTasks(projectId),
    enabled: projectId.length > 0,
  });
}
