"use client";

import { useMutation } from "@tanstack/react-query";
import { createProject } from "@/features/projects/services/create-project";

export function useCreateProject() {
  return useMutation({
    mutationFn: createProject,
  });
}
