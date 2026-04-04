"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateProjectStatusRequest } from "@/contracts/projects";
import { createProjectStatus } from "@/features/projects/services/create-project-status";

export function useCreateProjectStatus(projectId: string) {
  return useMutation({
    mutationFn: (request: CreateProjectStatusRequest) =>
      createProjectStatus(projectId, request),
  });
}
