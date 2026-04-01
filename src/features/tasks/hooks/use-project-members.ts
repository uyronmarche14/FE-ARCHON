"use client";

import { useQuery } from "@tanstack/react-query";
import { projectDetailQueryKey } from "@/features/projects/lib/project-query-keys";
import { getProjectDetail } from "@/features/projects/services/get-project-detail";

export function useProjectMembers(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: projectDetailQueryKey(projectId),
    queryFn: () => getProjectDetail(projectId),
    enabled: enabled && projectId.length > 0,
    select: (projectDetail) => projectDetail.members,
  });
}
