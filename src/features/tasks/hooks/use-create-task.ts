"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateTaskRequest } from "@/contracts/tasks";
import { createTask } from "@/features/tasks/services/create-task";

export function useCreateTask(projectId: string) {
  return useMutation({
    mutationFn: (request: CreateTaskRequest) => createTask(projectId, request),
  });
}
