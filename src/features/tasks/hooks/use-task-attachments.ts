"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAttachmentsQueryKey } from "@/features/tasks/lib/task-query-keys";
import { getTaskAttachments } from "@/features/tasks/services/get-task-attachments";

export function useTaskAttachments(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: taskAttachmentsQueryKey(taskId),
    queryFn: () => getTaskAttachments(taskId),
    enabled: enabled && taskId.length > 0,
  });
}
