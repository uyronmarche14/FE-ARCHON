"use client";

import { useMutation } from "@tanstack/react-query";
import type { UpdateProjectRequest } from "@/contracts/projects";
import { updateProject } from "@/features/projects/services/update-project";

export function useUpdateProject() {
  return useMutation({
    mutationFn: ({
      projectId,
      request,
    }: {
      projectId: string;
      request: UpdateProjectRequest;
    }) => updateProject(projectId, request),
  });
}
