"use client";

import { useMutation } from "@tanstack/react-query";
import type { UpdateTaskStatusRequest } from "@/contracts/tasks";
import { patchTaskStatus } from "@/features/tasks/services/patch-task-status";

export function useUpdateTaskStatus() {
  return useMutation({
    mutationFn: ({
      taskId,
      request,
    }: {
      taskId: string;
      request: UpdateTaskStatusRequest;
    }) => patchTaskStatus(taskId, request),
  });
}
