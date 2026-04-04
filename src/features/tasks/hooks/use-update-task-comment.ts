"use client";

import { useMutation } from "@tanstack/react-query";
import type { UpdateTaskCommentRequest } from "@/contracts/tasks";
import { updateTaskComment } from "@/features/tasks/services/update-task-comment";

export function useUpdateTaskComment(taskId: string) {
  return useMutation({
    mutationFn: ({
      commentId,
      request,
    }: {
      commentId: string;
      request: UpdateTaskCommentRequest;
    }) => updateTaskComment(taskId, commentId, request),
  });
}
