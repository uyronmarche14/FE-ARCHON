"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteTaskAttachment } from "@/features/tasks/services/delete-task-attachment";

export function useDeleteTaskAttachment(taskId: string) {
  return useMutation({
    mutationFn: (attachmentId: string) =>
      deleteTaskAttachment(taskId, attachmentId),
  });
}
