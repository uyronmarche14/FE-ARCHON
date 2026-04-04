"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateTaskCommentRequest } from "@/contracts/tasks";
import { createTaskComment } from "@/features/tasks/services/create-task-comment";

export function useCreateTaskComment(taskId: string) {
  return useMutation({
    mutationFn: (request: CreateTaskCommentRequest) =>
      createTaskComment(taskId, request),
  });
}
