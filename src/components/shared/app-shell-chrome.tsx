"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";

type AppShellChromeProps = {
  children: React.ReactNode;
};

const projectLinks = [
  { href: "/app", label: "Projects" },
  {
    href: "/app/projects/demo-project" as Route,
    label: "Launch planning",
  },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function AppShellChrome({ children }: AppShellChromeProps) {
  const { status } = useAuthSession();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-border p-6 lg:border-r lg:border-b-0">
          <div>
            <p className="font-semibold">Archon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Minimal app shell placeholder
            </p>
          </div>
          <nav className="mt-6 space-y-2">
            {projectLinks.map((projectLink) => (
              <Link
                key={projectLink.href}
                href={projectLink.href}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                {projectLink.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex flex-col">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <p className="font-medium">Workspace</p>
              <p className="text-sm text-muted-foreground">Session: {status}</p>
            </div>
            <Link
              href="/signup"
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Signup route
            </Link>
          </header>
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
