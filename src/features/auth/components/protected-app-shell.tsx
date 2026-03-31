"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppShellChrome } from "@/components/shared/app-shell-chrome";
import { AppShellLoading } from "@/components/shared/app-shell-loading";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";

type ProtectedAppShellProps = {
  children: React.ReactNode;
};

export function ProtectedAppShell({ children }: ProtectedAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useAuthSession();

  const currentPath = buildCurrentPath(pathname, searchParams);

  useEffect(() => {
    if (status !== "anonymous") {
      return;
    }

    router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
  }, [currentPath, router, status]);

  if (status === "authenticated") {
    return <AppShellChrome>{children}</AppShellChrome>;
  }

  return (
    <AppShellChrome>
      <AppShellLoading />
    </AppShellChrome>
  );
}

function buildCurrentPath(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  const query = searchParams.toString();

  if (!query) {
    return pathname;
  }

  return `${pathname}?${query}`;
}
