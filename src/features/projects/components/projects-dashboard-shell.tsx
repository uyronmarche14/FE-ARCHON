"use client";

import { useMemo } from "react";
import type { Route } from "next";
import Link from "next/link";
import { FolderKanban, Plus, RefreshCcw } from "lucide-react";
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
import type { ProjectSummary } from "@/contracts/projects";

export function ProjectsDashboardShell() {
  const projectsQuery = useProjects();
  const projectItems = projectsQuery.data?.items;
  const projects = useMemo(() => projectItems ?? [], [projectItems]);

  const totals = useMemo(() => {
    const totalTrackedTasks = projects.reduce((total, project) => {
      return total + getProjectTotalTaskCount(project.taskCounts);
    }, 0);
    const totalOpenTasks = projects.reduce((total, project) => {
      return total + getProjectOpenTaskCount(project.taskCounts);
    }, 0);
    const totalDoneTasks = projects.reduce((total, project) => {
      return total + project.taskCounts.DONE;
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
      <Card className="border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <WorkspaceSectionHeader
            badge={
              <Badge variant="outline" className="bg-surface-subtle">
                Workspace overview
              </Badge>
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

      <Card className="border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-tight">Projects</p>
              <p className="text-sm text-muted-foreground">
                A simple list of workspaces you can open and continue from here.
              </p>
            </div>
            {!projectsQuery.isPending && !projectsQuery.isError && projects.length > 0 ? (
              <Badge variant="muted">{projects.length} visible</Badge>
            ) : null}
          </div>

          {projectsQuery.isPending ? <ProjectsDashboardLoadingState /> : null}

          {projectsQuery.isError ? (
            <Card className="border-border/70 bg-surface-subtle shadow-none">
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
                  onClick={() => void projectsQuery.refetch()}
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
            <Card className="border-dashed border-border/80 bg-surface-subtle shadow-none">
              <CardContent className="px-5 py-8 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-3xl bg-primary/10 text-primary">
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
            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
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
    <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function ProjectsDashboardLoadingState() {
  return (
    <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3" aria-label="Loading projects">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-3/4 rounded-full" />
            </div>
          </div>
          <Skeleton className="mt-4 h-2 w-full rounded-full" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectDashboardCard({ project }: { project: ProjectSummary }) {
  const totalTasks = getProjectTotalTaskCount(project.taskCounts);
  const openTasks = getProjectOpenTaskCount(project.taskCounts);
  const completion = getProjectCompletionPercentage(project.taskCounts);

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-[border-color,background] duration-150 hover:border-primary/15 hover:bg-surface-subtle/40">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary">
          {getProjectInitials(project.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {project.name}
            </h3>
            <Badge variant={project.role === "OWNER" ? "outline" : "muted"}>
              {project.role === "OWNER" ? "Owner" : "Member"}
            </Badge>
          </div>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {project.description ??
              "No description yet. Use the board to set the first execution context."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <ProjectCardMetric label="Open" value={openTasks} />
        <ProjectCardMetric label="Tracked" value={totalTasks} />
        <ProjectCardMetric label="Complete" value={`${completion}%`} />
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="todo">TODO {project.taskCounts.TODO}</Badge>
        <Badge variant="progress">
          In progress {project.taskCounts.IN_PROGRESS}
        </Badge>
        <Badge variant="done">Done {project.taskCounts.DONE}</Badge>
      </div>

      <div className="mt-4 flex justify-end">
        <Button asChild size="sm" className="rounded-xl">
          <Link href={getProjectPath(project.id) as Route}>Open board</Link>
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
    <div className="rounded-xl border border-border/70 bg-surface-subtle px-3 py-2.5">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}
