"use client";

import { useMutation } from "@tanstack/react-query";
import { logout } from "@/features/auth/services/logout";

export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}
