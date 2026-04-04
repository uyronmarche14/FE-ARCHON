"use client";

import type { Route } from "next";
import Link from "next/link";
import { FolderKanban, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProjects } from "@/features/projects/hooks/use-projects";
import {
  getProjectCompletionPercentage,
  getProjectInitials,
  getProjectOpenTaskCount,
  getProjectTotalTaskCount,
} from "@/features/projects/lib/project-summary";
import { getProjectPath } from "@/features/projects/lib/project-paths";
import { cn } from "@/lib/utils";

type ProjectsSidebarNavigationProps = {
  pathname: string;
  onNavigate?: () => void;
};

export function ProjectsSidebarNavigation({
  pathname,
  onNavigate,
}: ProjectsSidebarNavigationProps) {
  const projectsQuery = useProjects();
  const projects = projectsQuery.data?.items ?? [];

  return (
    <SidebarGroup className="mt-3">
      <div className="flex items-center justify-between gap-2 px-1.5">
        <SidebarGroupLabel className="px-0">Projects</SidebarGroupLabel>
        {projects.length > 0 ? (
          <Badge
            variant="muted"
            className="group-data-[state=collapsed]/sidebar:hidden"
          >
            {projects.length}
          </Badge>
        ) : null}
      </div>

      {projectsQuery.isPending ? (
        <div className="grid gap-2" aria-label="Loading projects">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : null}

      {projectsQuery.isError ? (
        <div className="space-y-2 rounded-2xl border border-sidebar-border/70 bg-card/80 px-3 py-3 group-data-[state=collapsed]/sidebar:px-2">
          <div className="group-data-[state=collapsed]/sidebar:hidden">
            <p className="text-sm font-medium text-foreground">
              Projects unavailable
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Retry to reconnect the workspace list.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl group-data-[state=collapsed]/sidebar:size-9 group-data-[state=collapsed]/sidebar:px-0"
            onClick={() => void projectsQuery.refetch()}
          >
            <RefreshCcw className="size-4" />
            <span className="group-data-[state=collapsed]/sidebar:hidden">
              Retry loading projects
            </span>
          </Button>
        </div>
      ) : null}

      {!projectsQuery.isPending &&
      !projectsQuery.isError &&
      projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sidebar-border/80 bg-card/60 px-3 py-3 group-data-[state=collapsed]/sidebar:px-2">
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-2xl bg-primary/10 text-primary">
              <FolderKanban className="size-4" />
            </div>
            <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
              <p className="text-sm font-medium text-foreground">
                No projects yet
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Create the first project from the dashboard.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!projectsQuery.isPending &&
      !projectsQuery.isError &&
      projects.length > 0 ? (
        <SidebarMenu>
          {projects.map((project) => {
            const href = getProjectPath(project.id) as Route;
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            const totalTasks = getProjectTotalTaskCount(project.statuses);
            const openTasks = getProjectOpenTaskCount(project.statuses);
            const completion = getProjectCompletionPercentage(project.statuses);

            return (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={project.name}
                  className="items-start"
                >
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <div
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-2xl text-[11px] font-semibold",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {getProjectInitials(project.name)}
                    </div>

                    <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {project.name}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {openTasks}/{totalTasks}
                        </span>
                      </div>

                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${completion}%` }}
                        />
                      </div>

                      <p className="mt-2 truncate text-[11px] text-muted-foreground">
                        {openTasks > 0
                          ? `${openTasks} tasks still active`
                          : "Ready for the next task set"}
                      </p>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      ) : null}
    </SidebarGroup>
  );
}
