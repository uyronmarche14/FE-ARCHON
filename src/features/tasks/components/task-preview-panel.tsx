"use client";

import type { ReactNode } from "react";
import { CalendarClock, Clock3, Layers3, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TaskCard } from "@/contracts/tasks";
import { cn } from "@/lib/utils";
import {
  formatTaskStatusLabel,
  getTaskAssigneeLabel,
  getTaskDueLabel,
  getTaskPositionLabel,
  getTaskStatusTone,
  getTaskUpdatedLabel,
  type TaskMemberLookup,
} from "@/features/tasks/lib/task-board";

type TaskPreviewPanelProps = {
  memberLookup?: TaskMemberLookup;
  presentation?: "hover" | "sheet";
  task: TaskCard;
};

export function TaskPreviewPanel({
  memberLookup,
  presentation = "hover",
  task,
}: TaskPreviewPanelProps) {
  const assigneeLabel = getTaskAssigneeLabel(task.assigneeId, memberLookup);

  const hero = (
    <div className="space-y-3 rounded-[1rem] border border-border/70 bg-linear-to-br from-background via-background to-surface-subtle/45 px-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getStatusBadgeVariant(task.status)} size="xs">
          {formatStatusLabel(task.status)}
        </Badge>
        <Badge variant="outline" size="xs" className="bg-background/90">
          {assigneeLabel}
        </Badge>
        <Badge variant="muted" size="xs">
          {getTaskDueLabel(task.dueDate)}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {task.title}
        </h3>
        <p className="text-sm leading-5 text-muted-foreground">
          {task.description ?? "No description available yet."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{getTaskPositionLabel(task.position, task.status)}</span>
        <span aria-hidden="true">•</span>
        <span>{getTaskUpdatedLabel(task.updatedAt)}</span>
      </div>
    </div>
  );

  const body = (
    <div className="grid gap-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
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
          value={assigneeLabel}
          className="sm:col-span-2"
        />
        <TaskMetaBlock
          icon={<Layers3 className="size-4 text-primary" />}
          label="Position"
          value={getTaskPositionLabel(task.position, task.status)}
        />
        <TaskMetaBlock
          icon={<Clock3 className="size-4 text-primary" />}
          label="Recent activity"
          value={getTaskUpdatedLabel(task.updatedAt)}
        />
      </div>

      <section className="rounded-[1rem] border border-border/70 bg-surface-subtle/55 px-3.5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock3 className="size-4 text-primary" />
          Summary
        </div>
        <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
          {task.description ?? "No description available yet."}
        </p>
      </section>
    </div>
  );

  if (presentation === "sheet") {
    return body;
  }

  return (
    <div className="grid gap-3">
      {hero}
      {body}
    </div>
  );
}

function TaskMetaBlock({
  className,
  icon,
  label,
  value,
}: {
  className?: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <section className={cn("rounded-[0.95rem] border border-border/70 bg-card px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 break-words text-sm leading-5 text-muted-foreground">
        {value}
      </p>
    </section>
  );
}

function formatStatusLabel(status: TaskCard["status"]) {
  return formatTaskStatusLabel(status);
}

function getStatusBadgeVariant(status: TaskCard["status"]) {
  const tone = getTaskStatusTone(status);

  if (tone === "progress") {
    return "progress" as const;
  }

  if (tone === "done") {
    return "done" as const;
  }

  return "todo" as const;
}
