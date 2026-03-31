"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarRange,
  ChevronRight,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AppShellChromeProps = {
  children: React.ReactNode;
};

const navigation = [
  {
    href: "/app" as Route,
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Project overview",
  },
  {
    href: "/app/projects/launch-planning" as Route,
    label: "Launch planning",
    icon: Sparkles,
    description: "Primary board",
  },
  {
    href: "/app/projects/qa-readiness" as Route,
    label: "QA readiness",
    icon: CalendarRange,
    description: "Validation runway",
  },
] as const;

export function AppShellChrome({ children }: AppShellChromeProps) {
  const pathname = usePathname();
  const { session, status } = useAuthSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeLabel = useMemo(() => {
    const match = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return match?.label ?? "Workspace";
  }, [pathname]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-sidebar-border/80 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            A
          </div>
          <div>
            <p className="text-sm font-semibold leading-none tracking-tight">Archon</p>
            <p className="text-xs text-muted-foreground">Execution workspace</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="px-2 py-3">
        <p className="px-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          Navigation
        </p>
        <nav className="mt-2 space-y-0.5">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center justify-between rounded-md px-2 py-2 transition-colors",
                  active
                    ? "bg-sidebar-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                ].join(" ")}
                onClick={() => setMobileNavOpen(false)}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={[
                      "grid size-7 place-items-center rounded-md border",
                      active
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border/80 bg-background text-muted-foreground",
                    ].join(" ")}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="size-3.5 opacity-50" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Session card */}
      <div className="mt-auto px-2 pb-3">
        <div className="rounded-md border border-border/80 bg-background/90 p-3">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Session
          </p>
          <p className="mt-2 text-sm font-medium leading-none">
            {session?.user.name ?? "Workspace visitor"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {session?.user.email ?? "Auth routes are next"}
          </p>
          <div className="mt-2">
            <Badge variant={status === "authenticated" ? "success" : "muted"}>
              {status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border/80 bg-sidebar lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[80%] max-w-xs border-r border-border bg-sidebar shadow-xl">
            <div className="flex items-center justify-between border-b border-sidebar-border/80 px-3 py-3">
              <p className="text-sm font-medium">Navigation</p>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      ) : null}

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-sm sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Button
                size="icon-xs"
                variant="outline"
                className="lg:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="size-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="outline"
                className="hidden lg:inline-flex"
              >
                <PanelLeftClose className="size-3.5" />
              </Button>
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Workspace
                </p>
                <h1 className="text-lg font-semibold leading-tight tracking-tight">{activeLabel}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-md border border-border/80 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
                <Search className="size-3.5" />
                <span>Search projects, tasks…</span>
              </div>
              <Button size="icon-xs" variant="outline">
                <Bell className="size-3.5" />
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Auth route</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5">{children}</main>
      </div>
    </div>
  );
}
