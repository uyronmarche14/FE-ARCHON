"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateProjectInviteRequest } from "@/contracts/projects";
import { createProjectInvite } from "@/features/projects/services/create-project-invite";

export function useCreateProjectInvite(projectId: string) {
  return useMutation({
    mutationFn: (request: CreateProjectInviteRequest) =>
      createProjectInvite(projectId, request),
  });
}
