"use client";

import { useMutation } from "@tanstack/react-query";
import { acceptInvite } from "@/features/projects/services/accept-invite";

export function useAcceptInvite() {
  return useMutation({
    mutationFn: acceptInvite,
  });
}
