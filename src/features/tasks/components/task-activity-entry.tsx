"use client";

import { ArrowRight, CalendarClock, Clock3, FileText, Layers3, PencilLine, Sparkles, UserRound } from "lucide-react";
import type { ProjectActivityEntry } from "@/contracts/projects";
import type { TaskLogEntry, TaskStatus } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatTaskActivityTimestamp,
  formatTaskActivityValue,
  formatTaskStatusLabel,
  getTaskActivityEventLabel,
  getTaskActivityFieldLabel,
} from "@/features/tasks/lib/task-activity-format";

type ActivityEntry = Pick<
  TaskLogEntry,
  "actor" | "createdAt" | "eventType" | "fieldName" | "id" | "newValue" | "oldValue" | "summary"
> & {
  task?: ProjectActivityEntry["task"];
};

type TaskActivityEntryProps = {
  entry: ActivityEntry;
  showTaskTitle?: boolean;
};

export function TaskActivityEntry({
  entry,
  showTaskTitle = false,
}: TaskActivityEntryProps) {
  const fieldLabel = entry.fieldName ? getTaskActivityFieldLabel(entry.fieldName) : null;

  return (
    <article className="rounded-[1rem] border border-border/70 bg-card px-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "mt-0.5 grid size-8 shrink-0 place-items-center rounded-[0.85rem] border",
            getEventIconSurfaceClassName(entry.eventType),
          )}
        >
          {getEventIconNode(entry.eventType)}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getEventBadgeVariant(entry.eventType)} size="xs">
              {getTaskActivityEventLabel(entry.eventType)}
            </Badge>
            {showTaskTitle && entry.task ? (
              <Badge variant="outline" size="xs" className="max-w-full truncate">
                {entry.task.title}
              </Badge>
            ) : null}
            {fieldLabel ? (
              <Badge variant="muted" size="xs">
                {fieldLabel}
              </Badge>
            ) : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold leading-5 text-foreground">
              {entry.summary}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <span>{entry.actor.name}</span>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" />
                {formatTaskActivityTimestamp(entry.createdAt)}
              </span>
            </div>
          </div>

          {entry.fieldName ? <TaskActivityChange entry={entry} /> : null}
        </div>
      </div>
    </article>
  );
}

function TaskActivityChange({ entry }: { entry: ActivityEntry }) {
  const fieldName = entry.fieldName;

  if (!fieldName) {
    return null;
  }

  if (
    fieldName === "status" &&
    typeof entry.oldValue === "string" &&
    typeof entry.newValue === "string"
  ) {
    return (
      <section className="flex flex-wrap items-center gap-2 rounded-[0.9rem] border border-border/70 bg-surface-subtle/55 px-2.5 py-2">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Transition
        </span>
          <Badge variant={getStatusBadgeVariant(entry.oldValue as TaskStatus)} size="xs">
            {formatTaskStatusLabel(entry.oldValue as TaskStatus)}
          </Badge>
          <ArrowRight className="size-4 text-muted-foreground" />
          <Badge variant={getStatusBadgeVariant(entry.newValue as TaskStatus)} size="xs">
            {formatTaskStatusLabel(entry.newValue as TaskStatus)}
          </Badge>
      </section>
    );
  }

  return (
    <section className="rounded-[0.9rem] border border-border/70 bg-surface-subtle/55 p-2.5">
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {getFieldIcon(fieldName)}
        Field change
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
        <ActivityValueCard
          label="Before"
          value={formatTaskActivityValue(fieldName, entry.oldValue)}
        />
        <ArrowRight className="mx-auto size-4 text-muted-foreground" />
        <ActivityValueCard
          label="After"
          value={formatTaskActivityValue(fieldName, entry.newValue)}
        />
      </div>
    </section>
  );
}

function ActivityValueCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[0.85rem] border border-border/70 bg-background/90 px-2.5 py-2">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-foreground">{value}</p>
    </div>
  );
}

function getEventIconNode(eventType: ActivityEntry["eventType"]) {
  if (eventType === "STATUS_CHANGED") {
    return <ArrowRight className="size-4" />;
  }

  if (eventType === "TASK_UPDATED") {
    return <PencilLine className="size-4" />;
  }

  return <Sparkles className="size-4" />;
}

function getFieldIcon(fieldName: ActivityEntry["fieldName"]) {
  if (fieldName === "assigneeId") {
    return <UserRound className="size-3.5" />;
  }

  if (fieldName === "dueDate") {
    return <CalendarClock className="size-3.5" />;
  }

  if (fieldName === "status") {
    return <Layers3 className="size-3.5" />;
  }

  return <FileText className="size-3.5" />;
}

function getEventBadgeVariant(eventType: ActivityEntry["eventType"]) {
  if (eventType === "STATUS_CHANGED") {
    return "progress" as const;
  }

  if (eventType === "TASK_UPDATED") {
    return "outline" as const;
  }

  return "done" as const;
}

function getEventIconSurfaceClassName(eventType: ActivityEntry["eventType"]) {
  if (eventType === "STATUS_CHANGED") {
    return "border-in-progress/15 bg-in-progress/[0.12] text-in-progress";
  }

  if (eventType === "TASK_UPDATED") {
    return "border-primary/12 bg-primary/[0.08] text-primary";
  }

  return "border-done/15 bg-done/[0.12] text-done";
}

function getStatusBadgeVariant(status: TaskStatus) {
  if (status === "IN_PROGRESS") {
    return "progress" as const;
  }

  if (status === "DONE") {
    return "done" as const;
  }

  return "todo" as const;
}
