"use client";

import { useMutation } from "@tanstack/react-query";
import { confirmEmailVerification } from "@/features/auth/services/confirm-email-verification";

export function useConfirmEmailVerification() {
  return useMutation({
    mutationFn: confirmEmailVerification,
  });
}
