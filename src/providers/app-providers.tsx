"use client";

import { AuthSessionProvider } from "@/features/auth/providers/auth-session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToasterProvider } from "@/providers/toaster-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthSessionProvider>
        {children}
        <ToasterProvider />
      </AuthSessionProvider>
    </QueryProvider>
  );
}
