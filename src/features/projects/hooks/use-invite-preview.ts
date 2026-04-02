"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvitePreview } from "@/features/projects/services/get-invite-preview";

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: ["invite", token] as const,
    queryFn: () => getInvitePreview(token),
    enabled: token.length > 0,
  });
}
