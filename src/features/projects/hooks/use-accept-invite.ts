"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pendingProjectInvitesQueryKey } from "@/features/projects/hooks/use-pending-project-invites";
import { projectsQueryKey } from "@/features/projects/lib/project-query-keys";
import { acceptInvite } from "@/features/projects/services/accept-invite";

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: pendingProjectInvitesQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectsQueryKey,
        }),
      ]);
    },
  });
}
