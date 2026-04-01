"use client";

import type { ReactNode } from "react";
import { CalendarClock, Layers3, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TaskCard } from "@/contracts/tasks";
import {
  formatTaskStatusLabel,
  getTaskAssigneeLabel,
  getTaskDueLabel,
  getTaskPositionLabel,
  getTaskUpdatedLabel,
} from "@/features/tasks/lib/task-board";

type TaskPreviewPanelProps = {
  presentation?: "hover" | "sheet";
  task: TaskCard;
};

export function TaskPreviewPanel({
  presentation = "hover",
  task,
}: TaskPreviewPanelProps) {
  const body = (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <TaskMetaBlock
          icon={<Layers3 className="size-4 text-primary" />}
          label="Lane"
          value={formatStatusLabel(task.status)}
        />
        <TaskMetaBlock
          icon={<CalendarClock className="size-4 text-primary" />}
          label="Due"
          value={getTaskDueLabel(task.dueDate)}
        />
        <TaskMetaBlock
          icon={<UserRound className="size-4 text-primary" />}
          label="Assignee"
          value={getTaskAssigneeLabel(task.assigneeId)}
        />
      </div>

      <section className="rounded-lg border border-border/70 bg-surface-subtle/55 px-4 py-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Summary
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {task.description ?? "No description available yet."}
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-border/70 bg-card px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Position
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {getTaskPositionLabel(task.position, task.status)}
          </p>
        </section>
        <section className="rounded-lg border border-border/70 bg-card px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Recent activity
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {getTaskUpdatedLabel(task.updatedAt)}
          </p>
        </section>
      </div>
    </div>
  );

  if (presentation === "sheet") {
    return (
      <div className="grid gap-4">
        <SheetHeader className="gap-4 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {formatStatusLabel(task.status)}
            </Badge>
            <Badge
              variant="outline"
              className="font-medium normal-case tracking-normal"
            >
              {getTaskAssigneeLabel(task.assigneeId)}
            </Badge>
          </div>
          <div className="space-y-2">
            <SheetTitle className="text-2xl leading-tight">{task.title}</SheetTitle>
            <SheetDescription className="max-w-2xl">
              {task.description ?? "No description available yet."}
            </SheetDescription>
          </div>
          <p className="text-xs text-muted-foreground">
            {getTaskPositionLabel(task.position, task.status)}
          </p>
        </SheetHeader>
        {body}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-3 rounded-lg border border-border/70 bg-card px-4 py-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusBadgeVariant(task.status)}>
            {formatStatusLabel(task.status)}
          </Badge>
          <Badge
            variant="outline"
            className="font-medium normal-case tracking-normal"
          >
            {getTaskAssigneeLabel(task.assigneeId)}
          </Badge>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight">{task.title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {task.description ?? "No description available yet."}
          </p>
        </div>
      </div>
      {body}
    </div>
  );
}

function TaskMetaBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </section>
  );
}

function formatStatusLabel(status: TaskCard["status"]) {
  return formatTaskStatusLabel(status);
}

function getStatusBadgeVariant(status: TaskCard["status"]) {
  if (status === "IN_PROGRESS") {
    return "progress" as const;
  }

  if (status === "DONE") {
    return "done" as const;
  }

  return "todo" as const;
}
