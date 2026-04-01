"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteTask } from "@/features/tasks/services/delete-task";

export function useDeleteTask() {
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
  });
}
