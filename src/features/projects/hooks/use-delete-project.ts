"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteProject } from "@/features/projects/services/delete-project";

export function useDeleteProject() {
  return useMutation({
    mutationFn: deleteProject,
  });
}
