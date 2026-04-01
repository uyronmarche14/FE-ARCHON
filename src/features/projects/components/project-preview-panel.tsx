import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, Compass, ListChecks } from "lucide-react";
import { ContextPreviewPanel } from "@/components/shared/context-preview-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ProjectSummary } from "@/contracts/projects";
import { getProjectPath } from "@/features/projects/lib/project-paths";
import {
  getProjectCompletionPercentage,
  getProjectDoneCount,
  getProjectOpenTaskCount,
  getProjectTotalTaskCount,
} from "@/features/projects/lib/project-summary";

type ProjectPreviewPanelProps = {
  framed?: boolean;
  project: ProjectSummary;
};

export function ProjectPreviewPanel({
  framed = true,
  project,
}: ProjectPreviewPanelProps) {
  const totalTasks = getProjectTotalTaskCount(project.taskCounts);
  const openTasks = getProjectOpenTaskCount(project.taskCounts);
  const doneTasks = getProjectDoneCount(project.taskCounts);
  const completion = getProjectCompletionPercentage(project.taskCounts);
  const content = (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <ProjectPreviewMetric label="Open work" value={openTasks} />
        <ProjectPreviewMetric label="Completed" value={doneTasks} />
        <ProjectPreviewMetric label="Completion" value={`${completion}%`} />
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Progress across the board</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalTasks} tracked tasks connected to this workspace.
            </p>
          </div>
          <Badge variant={project.role === "OWNER" ? "default" : "outline"}>
            {project.role === "OWNER" ? "Owner-led" : "Shared access"}
          </Badge>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="todo">TODO {project.taskCounts.TODO}</Badge>
          <Badge variant="progress">
            In progress {project.taskCounts.IN_PROGRESS}
          </Badge>
          <Badge variant="done">Done {project.taskCounts.DONE}</Badge>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Compass className="size-4 text-primary" />
            Ready for next move
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Enter the board to create tasks, review the active lane, and keep
            the current project context visible while you work.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="size-4 text-primary" />
            Current summary
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {openTasks > 0
              ? `${openTasks} tasks are still active, so this workspace is best opened from the board view.`
              : "This workspace is calm right now, which makes it a good place to plan the next set of tasks."}
          </p>
        </div>
      </div>
    </>
  );

  if (!framed) {
    return (
      <div className="grid gap-4">
        <SheetHeader>
          <Badge variant="outline">Project preview</Badge>
          <SheetTitle>{project.name}</SheetTitle>
          <SheetDescription>
            {project.description ??
              "No description yet. Use the board to shape the next steps and working context."}
          </SheetDescription>
          <Button asChild size="sm" className="mt-2 rounded-2xl">
            <Link href={getProjectPath(project.id) as Route}>
              Open board
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </SheetHeader>
        {content}
      </div>
    );
  }

  return (
    <ContextPreviewPanel
      badge={<Badge variant="outline">Project preview</Badge>}
      title={project.name}
      description={
        project.description ??
        "No description yet. Use the board to shape the next steps and working context."
      }
      actions={
        <Button asChild size="sm" className="rounded-2xl">
          <Link href={getProjectPath(project.id) as Route}>
            Open board
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {content}
    </ContextPreviewPanel>
  );
}

function ProjectPreviewMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
