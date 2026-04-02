"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { taskLogsQueryKey } from "@/features/tasks/lib/task-query-keys";
import { getTaskLogs } from "@/features/tasks/services/get-task-logs";

export function useTaskLogs(taskId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: taskLogsQueryKey(taskId),
    queryFn: ({ pageParam }) =>
      getTaskLogs(taskId, {
        page: typeof pageParam === "number" ? pageParam : 1,
        pageSize: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: enabled && taskId.length > 0,
  });
}
