"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ChevronDown, FolderKanban, RefreshCcw } from "lucide-react";
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
import { getProjectPath } from "@/features/projects/lib/project-paths";
import { sortProjectsByName } from "@/features/projects/lib/project-summary";
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
  const projects = sortProjectsByName(projectsQuery.data?.items ?? []);
  const [isExpanded, setIsExpanded] = useState(true);

  function toggleProjectsVisibility() {
    setIsExpanded((currentValue) => !currentValue);
  }

  return (
    <SidebarGroup className="mt-3">
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            aria-expanded={isExpanded}
            data-testid="sidebar-projects-toggle"
            tooltip={isExpanded ? "Collapse projects" : "Expand projects"}
            onClick={toggleProjectsVisibility}
            className="bg-background/75 text-foreground hover:border-transparent hover:bg-background/75"
          >
            <FolderKanban className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:hidden">
              Projects
            </span>
            {projects.length > 0 ? (
              <Badge
                variant="muted"
                size="xs"
                className="group-data-[state=collapsed]/sidebar:hidden"
              >
                {projects.length}
              </Badge>
            ) : null}
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform group-data-[state=collapsed]/sidebar:hidden",
                isExpanded ? "rotate-0" : "-rotate-90",
              )}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {projectsQuery.isPending && isExpanded ? (
        <div
          className="ml-4 grid gap-2 border-l border-sidebar-border/80 pl-4 group-data-[state=collapsed]/sidebar:hidden"
          aria-label="Loading projects"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-8 rounded-lg" />
          ))}
        </div>
      ) : null}

      {projectsQuery.isError && isExpanded ? (
        <div className="ml-4 space-y-2 rounded-[1rem] border border-sidebar-border/70 bg-card/80 px-3 py-3 group-data-[state=collapsed]/sidebar:hidden">
          <div>
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
      isExpanded &&
      projects.length === 0 ? (
        <div className="ml-4 rounded-[1rem] border border-dashed border-sidebar-border/80 bg-card/55 px-3 py-3 group-data-[state=collapsed]/sidebar:hidden">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">No projects yet</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Create the first project from the dashboard.
            </p>
          </div>
        </div>
      ) : null}

      {!projectsQuery.isPending &&
      !projectsQuery.isError &&
      isExpanded &&
      projects.length > 0 ? (
        <SidebarMenu
          className="ml-4 border-l border-sidebar-border/80 pl-3 group-data-[state=collapsed]/sidebar:hidden"
          data-testid="sidebar-projects-list"
        >
          {projects.map((project) => {
            const href = getProjectPath(project.id) as Route;
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={project.name}
                  className={cn(
                    "min-h-0 gap-2 rounded-[0.85rem] border-transparent bg-transparent px-2.5 py-1.5 text-[13px] font-medium shadow-none hover:border-transparent hover:bg-background/70",
                    active
                      ? "border-primary/10 bg-background text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                      : "text-muted-foreground",
                  )}
                >
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <span
                      className={cn(
                        "mt-0.5 size-2 shrink-0 rounded-full",
                        active
                          ? "bg-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]"
                          : "bg-sidebar-border",
                      )}
                    />

                    <span className="min-w-0 flex-1 truncate">{project.name}</span>
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
