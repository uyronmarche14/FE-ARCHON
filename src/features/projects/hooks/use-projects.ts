"use client";

import { useQuery } from "@tanstack/react-query";
import { projectsQueryKey } from "@/features/projects/lib/project-query-keys";
import { getProjects } from "@/features/projects/services/get-projects";

export function useProjects() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: getProjects,
  });
}
