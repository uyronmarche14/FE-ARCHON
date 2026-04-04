"use client";

import { useMutation } from "@tanstack/react-query";
import type { UpdateProjectStatusRequest } from "@/contracts/projects";
import { updateProjectStatus } from "@/features/projects/services/update-project-status";

export function useUpdateProjectStatus(projectId: string) {
  return useMutation({
    mutationFn: ({
      statusId,
      request,
    }: {
      statusId: string;
      request: UpdateProjectStatusRequest;
    }) => updateProjectStatus(projectId, statusId, request),
  });
}
