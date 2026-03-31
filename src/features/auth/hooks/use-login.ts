"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/services/login";

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}
