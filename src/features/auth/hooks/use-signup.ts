"use client";

import { useMutation } from "@tanstack/react-query";
import { signup } from "@/features/auth/services/signup";

export function useSignup() {
  return useMutation({
    mutationFn: signup,
  });
}
