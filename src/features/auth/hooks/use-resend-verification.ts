"use client";

import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "@/features/auth/services/resend-verification";

export function useResendVerification() {
  return useMutation({
    mutationFn: resendVerification,
  });
}
