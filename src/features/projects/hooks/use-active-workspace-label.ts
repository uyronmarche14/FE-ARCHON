"use client";

import { useMemo } from "react";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { getProjectIdFromPathname } from "@/features/projects/lib/project-paths";

export function useActiveWorkspaceLabel(pathname: string) {
  const { data } = useProjects();

  return useMemo(() => {
    if (pathname === "/app") {
      return "Dashboard";
    }

    const projectId = getProjectIdFromPathname(pathname);

    if (!projectId) {
      return "Workspace";
    }

    return (
      data?.items.find((project) => project.id === projectId)?.name ??
      "Workspace"
    );
  }, [data?.items, pathname]);
}
