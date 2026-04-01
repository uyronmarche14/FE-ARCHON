"use client";

import { useMutation } from "@tanstack/react-query";
import type { UpdateTaskRequest } from "@/contracts/tasks";
import { updateTask } from "@/features/tasks/services/update-task";

export function useUpdateTask() {
  return useMutation({
    mutationFn: ({
      taskId,
      request,
    }: {
      taskId: string;
      request: UpdateTaskRequest;
    }) => updateTask(taskId, request),
  });
}
