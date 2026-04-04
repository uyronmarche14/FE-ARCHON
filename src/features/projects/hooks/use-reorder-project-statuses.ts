"use client";

import { useMutation } from "@tanstack/react-query";
import type { ReorderProjectStatusesRequest } from "@/contracts/projects";
import { reorderProjectStatuses } from "@/features/projects/services/reorder-project-statuses";

export function useReorderProjectStatuses(projectId: string) {
  return useMutation({
    mutationFn: (request: ReorderProjectStatusesRequest) =>
      reorderProjectStatuses(projectId, request),
  });
}
