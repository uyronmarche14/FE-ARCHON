"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateTaskAttachmentRequest } from "@/contracts/tasks";
import { createTaskAttachment } from "@/features/tasks/services/create-task-attachment";

export function useCreateTaskAttachment(taskId: string) {
  return useMutation({
    mutationFn: (request: CreateTaskAttachmentRequest) =>
      createTaskAttachment(taskId, request),
  });
}
