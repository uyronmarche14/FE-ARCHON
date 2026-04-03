"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LayoutDashboard, Plus, Search } from "lucide-react";
import { AccountMenu } from "@/components/shared/account-menu";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { useActiveWorkspaceLabel } from "@/features/projects/hooks/use-active-workspace-label";
import {
  getProjectIdFromPathname,
  getProjectPath,
} from "@/features/projects/lib/project-paths";
import { getProjectInitials } from "@/features/projects/lib/project-summary";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type AppShellChromeProps = {
  children: React.ReactNode;
};

export function AppShellChrome({ children }: AppShellChromeProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppShellChromeLayout>{children}</AppShellChromeLayout>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AppShellChromeLayout({ children }: AppShellChromeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { clearSession, session, status } = useAuthSession();
  const projectsQuery = useProjects();
  const { closeMobileSidebar } = useSidebar();
  const activeLabel = useActiveWorkspaceLabel(pathname);
  const sessionName = session?.user.name ?? "Workspace visitor";
  const sessionEmail = session?.user.email ?? "Authentication required";
  const sessionInitials = getInitials(sessionName);
  const currentProjectId = getProjectIdFromPathname(pathname);
  const currentProject = currentProjectId
    ? (projectsQuery.data?.items.find((project) => project.id === currentProjectId) ?? null)
    : null;
  const currentProjectHref = currentProjectId
    ? (getProjectPath(currentProjectId) as Route)
    : null;
  const isCurrentProjectActive = currentProjectHref
    ? pathname === currentProjectHref || pathname.startsWith(`${currentProjectHref}/`)
    : false;

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      showSuccessToast("Logged out", "Your session has been closed.");
    } catch (error) {
      showApiErrorToast(
        error,
        "This browser session was cleared, but the server could not confirm logout.",
      );
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-shell-inset via-background to-background">
      <Sidebar>
        <SidebarHeader className="space-y-4">
          <div className="flex items-center group-data-[state=collapsed]/sidebar:justify-center">
            <AccountMenu
              email={sessionEmail}
              initials={sessionInitials}
              logoutPending={logoutMutation.isPending}
              name={sessionName}
              onLogout={handleLogout}
              status={status}
              variant="sidebar"
            />
          </div>
          <div className="group-data-[state=collapsed]/sidebar:hidden">
            <CreateProjectDialog
              trigger={
                <Button
                  size="default"
                  className="w-full justify-start rounded-[1rem] font-semibold shadow-none"
                >
                  <Plus className="mr-2 size-4" />
                  Create project
                </Button>
              }
            />
          </div>
          <div className="hidden group-data-[state=collapsed]/sidebar:flex justify-center">
            <CreateProjectDialog
              trigger={
                <Button
                  size="icon"
                  className="rounded-[1rem] shadow-none"
                  aria-label="Create project"
                >
                  <Plus className="size-4" />
                </Button>
              }
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-3 group-data-[state=collapsed]/sidebar:gap-2">
          <SidebarGroup>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app"}
                  tooltip="Dashboard"
                >
                  <Link
                    href={"/app" as Route}
                    aria-current={pathname === "/app" ? "page" : undefined}
                    onClick={closeMobileSidebar}
                  >
                    <LayoutDashboard className="size-4" />
                    <span className="min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:hidden">
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {currentProjectHref ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isCurrentProjectActive}
                    tooltip={currentProject?.name ?? "Current project"}
                  >
                    <Link
                      href={currentProjectHref}
                      aria-current={isCurrentProjectActive ? "page" : undefined}
                      onClick={closeMobileSidebar}
                    >
                      <div
                        aria-hidden="true"
                        className={cn(
                          "grid size-5 place-items-center rounded-md border text-[10px] font-semibold group-data-[state=collapsed]/sidebar:size-5",
                          isCurrentProjectActive
                            ? "border-transparent bg-transparent text-secondary-foreground"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        {currentProject ? getProjectInitials(currentProject.name) : "PJ"}
                      </div>
                      <span className="min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:hidden">
                        {currentProject?.name ?? "Current project"}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/82 px-4 pt-4 pb-4 backdrop-blur-md sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger />
              <div className="min-w-0 rounded-[1rem] border border-border/60 bg-card/90 px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Workspace
                </p>
                <h1 className="truncate text-[14px] font-semibold text-foreground sm:text-[15px]">
                  {activeLabel}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="hidden md:flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[16rem] justify-between rounded-[1rem] bg-background border-border/80 text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] xl:min-w-[20rem] hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="flex items-center gap-2 text-[13px]">
                        <Search className="size-4" />
                        Search projects...
                      </span>
                      <span className="rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                        Cmd K
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search is visual-only in this pass.</TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <CreateProjectDialog
                  trigger={
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-[0.95rem] border-border/80 bg-background text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        aria-label="Quick create project"
                      >
                        <Plus className="size-[1.05rem]" />
                      </Button>
                    </TooltipTrigger>
                  }
                />
                <TooltipContent>Create a new project without leaving the current page.</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-[0.95rem] border-border/80 bg-background text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:hidden"
                    aria-label="Search workspace"
                  >
                    <Search className="size-[1.1rem]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search is visual-only in this pass.</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-[0.95rem] border-border/80 bg-background text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    aria-label="Notifications"
                  >
                    <Bell className="size-[1.1rem]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications are visual-only in this pass.</TooltipContent>
              </Tooltip>

              <div className="md:hidden">
                <AccountMenu
                  email={sessionEmail}
                  initials={sessionInitials}
                  logoutPending={logoutMutation.isPending}
                  name={sessionName}
                  onLogout={handleLogout}
                  status={status}
                  variant="navbar"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </SidebarInset>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("") || "WS";
}
