"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteTaskComment } from "@/features/tasks/services/delete-task-comment";

export function useDeleteTaskComment(taskId: string) {
  return useMutation({
    mutationFn: (commentId: string) => deleteTaskComment(taskId, commentId),
  });
}
