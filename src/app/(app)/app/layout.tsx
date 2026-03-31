import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShellLoading } from "@/components/shared/app-shell-loading";
import { ProtectedAppShell } from "@/features/auth/components/protected-app-shell";

type AppLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<AppShellLoading />}>
      <ProtectedAppShell>{children}</ProtectedAppShell>
    </Suspense>
  );
}
