"use client";

import { ArrowRight, CalendarClock, Clock3, FileText, Layers3, PencilLine, Sparkles, UserRound } from "lucide-react";
import type { ProjectActivityEntry } from "@/contracts/projects";
import type { TaskLogEntry } from "@/contracts/tasks";
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
  density?: "default" | "compact";
  entry: ActivityEntry;
  showTaskTitle?: boolean;
};

export function TaskActivityEntry({
  density = "default",
  entry,
  showTaskTitle = false,
}: TaskActivityEntryProps) {
  const fieldLabel = entry.fieldName ? getTaskActivityFieldLabel(entry.fieldName) : null;

  return (
    <article
      className={cn(
        "rounded-[1rem] border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        density === "compact" ? "px-3 py-3" : "px-3.5 py-3.5",
      )}
    >
      <div className={cn("flex items-start", density === "compact" ? "gap-2" : "gap-2.5")}>
        <div
          className={cn(
            "mt-0.5 grid shrink-0 place-items-center rounded-[0.85rem] border",
            density === "compact" ? "size-7" : "size-8",
            getEventIconSurfaceClassName(entry.eventType),
          )}
        >
          {getEventIconNode(entry.eventType)}
        </div>

        <div className={cn("min-w-0 flex-1", density === "compact" ? "space-y-2" : "space-y-2.5")}>
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
            <p
              className={cn(
                "font-semibold text-foreground",
                density === "compact" ? "text-[13px] leading-[1.2rem]" : "text-sm leading-5",
              )}
            >
              {entry.summary}
            </p>
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground",
                density === "compact" ? "text-[10px]" : "text-[11px]",
              )}
            >
              <span>{entry.actor.name}</span>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className={density === "compact" ? "size-3" : "size-3.5"} />
                {formatTaskActivityTimestamp(entry.createdAt)}
              </span>
            </div>
          </div>

          {entry.fieldName ? <TaskActivityChange density={density} entry={entry} /> : null}
        </div>
      </div>
    </article>
  );
}

function TaskActivityChange({
  density,
  entry,
}: {
  density: "default" | "compact";
  entry: ActivityEntry;
}) {
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
      <section
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-[0.9rem] border border-border/70 bg-surface-subtle/55",
          density === "compact" ? "px-2 py-1.5" : "px-2.5 py-2",
        )}
      >
        <span
          className={cn(
            "font-semibold tracking-[0.16em] text-muted-foreground uppercase",
            density === "compact" ? "text-[9px]" : "text-[10px]",
          )}
        >
          Transition
        </span>
          <Badge variant={getStatusBadgeVariant(entry.oldValue)} size="xs">
            {formatTaskStatusLabel(entry.oldValue)}
          </Badge>
          <ArrowRight className="size-4 text-muted-foreground" />
          <Badge variant={getStatusBadgeVariant(entry.newValue)} size="xs">
            {formatTaskStatusLabel(entry.newValue)}
          </Badge>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-[0.9rem] border border-border/70 bg-surface-subtle/55",
        density === "compact" ? "p-2" : "p-2.5",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 font-semibold tracking-[0.18em] text-muted-foreground uppercase",
          density === "compact" ? "text-[10px]" : "text-[11px]",
        )}
      >
        {getFieldIcon(fieldName)}
        Field change
      </div>
      <div
        className={cn(
          "grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center",
          density === "compact" ? "mt-1.5" : "mt-2",
        )}
      >
        <ActivityValueCard
          density={density}
          label="Before"
          value={formatTaskActivityValue(fieldName, entry.oldValue)}
        />
        <ArrowRight className="mx-auto size-4 text-muted-foreground" />
        <ActivityValueCard
          density={density}
          label="After"
          value={formatTaskActivityValue(fieldName, entry.newValue)}
        />
      </div>
    </section>
  );
}

function ActivityValueCard({
  density,
  label,
  value,
}: {
  density: "default" | "compact";
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[0.85rem] border border-border/70 bg-background/90",
        density === "compact" ? "px-2 py-1.5" : "px-2.5 py-2",
      )}
    >
      <p
        className={cn(
          "font-semibold tracking-[0.16em] text-muted-foreground uppercase",
          density === "compact" ? "text-[9px]" : "text-[10px]",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-foreground",
          density === "compact" ? "text-[12px]" : "text-sm",
        )}
      >
        {value}
      </p>
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

function getStatusBadgeVariant(status: unknown) {
  if (typeof status !== "string") {
    return "todo" as const;
  }

  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus.includes("progress") ||
    normalizedStatus.includes("doing") ||
    normalizedStatus.includes("active") ||
    normalizedStatus.includes("review")
  ) {
    return "progress" as const;
  }

  if (
    normalizedStatus.includes("done") ||
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("closed")
  ) {
    return "done" as const;
  }

  return "todo" as const;
}
