"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { TaskLogEventType } from "@/contracts/tasks";
import { getProjectActivity } from "@/features/projects/services/get-project-activity";

type UseProjectActivityOptions = {
  enabled?: boolean;
  eventType?: TaskLogEventType | "ALL";
  q?: string;
  pageSize?: number;
};

export function useProjectActivity(
  projectId: string,
  options: UseProjectActivityOptions = {},
) {
  const pageSize = options.pageSize ?? 10;

  return useInfiniteQuery({
    queryKey: [
      "project",
      projectId,
      "activity",
      {
        eventType: options.eventType ?? "ALL",
        q: options.q ?? "",
        pageSize,
      },
    ] as const,
    queryFn: ({ pageParam }) =>
      getProjectActivity(projectId, {
        page: typeof pageParam === "number" ? pageParam : 1,
        pageSize,
        eventType: options.eventType ?? "ALL",
        q: options.q,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: (options.enabled ?? true) && projectId.length > 0,
  });
}
