"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { getPendingProjectInvites } from "@/features/projects/services/get-pending-project-invites";

export const pendingProjectInvitesQueryKey = ["project-invites", "pending"] as const;

export function usePendingProjectInvites() {
  const { session, status } = useAuthSession();

  return useQuery({
    queryKey: pendingProjectInvitesQueryKey,
    queryFn: getPendingProjectInvites,
    enabled: status === "authenticated" && session !== null,
  });
}
