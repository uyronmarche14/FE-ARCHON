"use client";

import { useQuery } from "@tanstack/react-query";
import { taskCommentsQueryKey } from "@/features/tasks/lib/task-query-keys";
import { getTaskComments } from "@/features/tasks/services/get-task-comments";

export function useTaskComments(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: taskCommentsQueryKey(taskId),
    queryFn: () => getTaskComments(taskId),
    enabled: enabled && taskId.length > 0,
  });
}
