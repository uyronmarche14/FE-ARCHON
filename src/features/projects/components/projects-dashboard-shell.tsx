"use client";

import { useMemo } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, FolderKanban, Plus, RefreshCcw } from "lucide-react";
import { WorkspaceSectionHeader } from "@/components/shared/workspace-section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { getProjectPath } from "@/features/projects/lib/project-paths";
import {
  getProjectCompletionPercentage,
  getProjectInitials,
  getProjectOpenTaskCount,
  getProjectTotalTaskCount,
} from "@/features/projects/lib/project-summary";
import {
  getTaskStatusBadgeClassName,
  getTaskStatusSurfaceClassName,
} from "@/features/tasks/lib/task-board";
import type { ProjectSummary } from "@/contracts/projects";
import { cn } from "@/lib/utils";

export function ProjectsDashboardShell() {
  const projectsQuery = useProjects();
  const projectItems = projectsQuery.data?.items;
  const projects = useMemo(() => projectItems ?? [], [projectItems]);

  const totals = useMemo(() => {
    const totalTrackedTasks = projects.reduce((total, project) => {
      return total + getProjectTotalTaskCount(project.statuses);
    }, 0);
    const totalOpenTasks = projects.reduce((total, project) => {
      return total + getProjectOpenTaskCount(project.statuses);
    }, 0);
    const totalDoneTasks = projects.reduce((total, project) => {
      return total + getProjectCompletionCount(project);
    }, 0);

    return {
      totalTrackedTasks,
      totalOpenTasks,
      totalDoneTasks,
      ownerProjects: projects.filter((project) => project.role === "OWNER").length,
      completionRate:
        totalTrackedTasks > 0
          ? Math.round((totalDoneTasks / totalTrackedTasks) * 100)
          : 0,
    };
  }, [projects]);

  return (
    <section className="space-y-5">
      <Card className="overflow-hidden border-border/80 bg-card/98">
        <CardContent className="space-y-4 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_4%,white)_0%,color-mix(in_oklab,var(--background)_96%,white)_44%,color-mix(in_oklab,var(--surface-subtle)_95%,white)_100%)] px-4 py-4 sm:px-5 sm:py-5">
          <WorkspaceSectionHeader
            badge={
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" size="xs" className="bg-background/90">
                  Workspace overview
                </Badge>
                <Badge variant="muted" size="xs">
                  {projects.length} visible
                </Badge>
              </div>
            }
            title="Projects ready for the next move."
            description="Keep the workspace simple, check progress at a glance, and jump straight into a board when you need it."
            action={
              <CreateProjectDialog
                trigger={
                  <Button size="sm" className="w-full rounded-xl sm:w-auto">
                    <Plus className="size-4" />
                    Create project
                  </Button>
                }
              />
            }
          />

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricTile
              label="Visible projects"
              value={projects.length}
              detail="Accessible now"
            />
            <DashboardMetricTile
              label="Open work"
              value={totals.totalOpenTasks}
              detail="Todo and in progress"
            />
            <DashboardMetricTile
              label="Owner-led"
              value={totals.ownerProjects}
              detail="Primary workspaces"
            />
            <DashboardMetricTile
              label="Completion"
              value={`${totals.completionRate}%`}
              detail={`${totals.totalDoneTasks} done tasks`}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80 bg-card/98">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" size="xs">
                  Project list
                </Badge>
                {!projectsQuery.isPending && !projectsQuery.isError && projects.length > 0 ? (
                  <Badge variant="muted" size="xs">
                    {projects.length} visible
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold tracking-tight">Projects</p>
                <p className="text-sm leading-5 text-muted-foreground">
                  Open a workspace directly and keep the dashboard focused on quick scanning.
                </p>
              </div>
            </div>
          </div>

          {projectsQuery.isPending ? <ProjectsDashboardLoadingState /> : null}

          {!projectsQuery.isPending && projectsQuery.isError ? (
            <Card className="border-border/80 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_3%,white),color-mix(in_oklab,var(--surface-subtle)_95%,white))] shadow-none">
              <CardContent className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold">
                    We couldn&apos;t load your projects.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    The workspace stays stable. Retry and we&apos;ll reconnect the list.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    void projectsQuery.refetch();
                  }}
                >
                  <RefreshCcw className="size-4" />
                  Retry loading projects
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {!projectsQuery.isPending &&
          !projectsQuery.isError &&
          projects.length === 0 ? (
            <Card className="border-dashed border-border/85 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_4%,white),color-mix(in_oklab,var(--surface-subtle)_96%,white))] shadow-none">
              <CardContent className="px-5 py-8 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-[1.1rem] bg-primary/10 text-primary">
                  <FolderKanban className="size-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  Start with the first project
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Create a project and you&apos;ll move directly into its board shell with the workspace chrome already in place.
                </p>
                <div className="mt-5 flex justify-center">
                  <CreateProjectDialog
                    trigger={
                      <Button size="sm" className="rounded-xl">
                        <Plus className="size-4" />
                        Create project
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {!projectsQuery.isPending &&
          !projectsQuery.isError &&
          projects.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectDashboardCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function DashboardMetricTile({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[1rem] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_3%,white),color-mix(in_oklab,var(--card)_94%,white))] px-4 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_28px_-26px_rgba(15,23,42,0.35)]">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-[1.65rem] font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function ProjectsDashboardLoadingState() {
  return (
    <div className="grid gap-3 lg:grid-cols-2" aria-label="Loading projects">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1rem] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_3%,white),color-mix(in_oklab,var(--card)_94%,white))] p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_28px_-26px_rgba(15,23,42,0.35)]"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-9 rounded-[0.95rem]" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-3/4 rounded-full" />
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Skeleton className="h-12 rounded-[0.95rem]" />
            <Skeleton className="h-12 rounded-[0.95rem]" />
            <Skeleton className="h-12 rounded-[0.95rem]" />
          </div>
          <Skeleton className="mt-3 h-2 w-full rounded-full" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectDashboardCard({
  project,
}: {
  project: ProjectSummary;
}) {
  const totalTasks = getProjectTotalTaskCount(project.statuses);
  const openTasks = getProjectOpenTaskCount(project.statuses);
  const completion = getProjectCompletionPercentage(project.statuses);
  const leadStatus =
    project.statuses.find((status) => !status.isClosed) ?? project.statuses[0];

  return (
    <article className="rounded-[1rem] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_3%,white),color-mix(in_oklab,var(--background)_95%,white)_42%,color-mix(in_oklab,var(--surface-subtle)_94%,white)_100%)] p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_22px_40px_-34px_rgba(15,23,42,0.42)] transition-[border-color,box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_46px_-30px_rgba(15,23,42,0.46)]">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-[0.95rem] text-xs font-semibold shadow-[0_14px_24px_-22px_rgba(15,23,42,0.42)]",
            leadStatus
              ? getTaskStatusSurfaceClassName(leadStatus)
              : "border border-primary/10 bg-primary/[0.08] text-primary",
          )}
        >
          {getProjectInitials(project.name)}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={project.role === "OWNER" ? "default" : "muted"} size="xs">
              {project.role === "OWNER" ? "Owner" : "Member"}
            </Badge>
          </div>

          <div className="space-y-1">
            <h3 className="truncate text-[15px] font-semibold text-foreground">
              {project.name}
            </h3>
            <p className="text-sm leading-5 text-muted-foreground">
              {project.description ??
                "No description yet. Use the board to set the first execution context."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <ProjectCardMetric label="Open" value={openTasks} />
        <ProjectCardMetric label="Tracked" value={totalTasks} />
        <ProjectCardMetric label="Complete" value={`${completion}%`} />
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${completion}%` }}
        />
      </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.statuses.map((status) => (
            <Badge
              key={status.id}
              variant="outline"
              size="xs"
              className={getTaskStatusBadgeClassName(status)}
            >
              {status.name} {status.taskCount}
            </Badge>
          ))}
        </div>

      <div className="mt-4 flex justify-end">
        <Button asChild size="sm" className="rounded-xl">
          <Link href={getProjectPath(project.id) as Route}>
            Open board
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function ProjectCardMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[0.95rem] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_3%,white),color-mix(in_oklab,var(--card)_93%,white))] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function getProjectCompletionCount(project: ProjectSummary) {
  return project.statuses.reduce(
    (total, status) => total + (status.isClosed ? status.taskCount : 0),
    0,
  );
}
