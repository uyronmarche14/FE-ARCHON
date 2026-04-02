"use client";

import { useQuery } from "@tanstack/react-query";
import { taskLogsQueryKey } from "@/features/tasks/lib/task-query-keys";
import { getTaskLogs } from "@/features/tasks/services/get-task-logs";

export function useTaskLogs(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: taskLogsQueryKey(taskId),
    queryFn: () => getTaskLogs(taskId),
    enabled: enabled && taskId.length > 0,
  });
}
