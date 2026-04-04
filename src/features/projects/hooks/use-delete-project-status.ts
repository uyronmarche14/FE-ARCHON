"use client";

import { useMutation } from "@tanstack/react-query";
import type { DeleteProjectStatusRequest } from "@/contracts/projects";
import { deleteProjectStatus } from "@/features/projects/services/delete-project-status";

export function useDeleteProjectStatus(projectId: string) {
  return useMutation({
    mutationFn: ({
      statusId,
      request,
    }: {
      statusId: string;
      request: DeleteProjectStatusRequest;
    }) => deleteProjectStatus(projectId, statusId, request),
  });
}
