"use client";

import { AlertTriangle, Clock3, RefreshCw } from "lucide-react";
import type { TaskLogEntry, TaskLogValue } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type TaskLogsTimelineProps = {
  entries: TaskLogEntry[];
  errorMessage?: string | null;
  isLoading?: boolean;
  onRetry?: () => void;
};

export function TaskLogsTimeline({
  entries,
  errorMessage,
  isLoading = false,
  onRetry,
}: TaskLogsTimelineProps) {
  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Activity log
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the latest task changes without leaving the board.
          </p>
        </div>
        <Badge variant="muted" className="px-2">
          {entries.length} entries
        </Badge>
      </div>

      {isLoading ? <TaskLogsTimelineLoadingState /> : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">
                  We couldn&apos;t load the activity log.
                </p>
                <p className="text-sm leading-relaxed text-destructive/90">
                  {errorMessage}
                </p>
              </div>
              {onRetry ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-destructive/20 bg-background"
                  onClick={onRetry}
                >
                  <RefreshCw className="size-3.5" />
                  Retry loading logs
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading && !errorMessage && entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-foreground">No activity yet.</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            New history entries will appear here after task creation, edits, and lane
            changes.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && entries.length > 0 ? (
        <ol className="grid gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-border/70 bg-card px-4 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getEventBadgeVariant(entry.eventType)}>
                      {getEventLabel(entry.eventType)}
                    </Badge>
                    {entry.fieldName ? (
                      <Badge variant="outline" className="normal-case tracking-normal">
                        {getFieldLabel(entry.fieldName)}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {entry.summary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.actor.name}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  {formatTaskLogTimestamp(entry.createdAt)}
                </div>
              </div>

              {entry.fieldName ? (
                <div className="mt-3 rounded-md border border-border/60 bg-surface-subtle/55 px-3 py-2.5">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Change
                  </p>
                  <div className="mt-2 grid gap-2 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <span className="rounded-sm bg-background px-2.5 py-1.5 text-foreground">
                      {formatTaskLogValue(entry.fieldName, entry.oldValue)}
                    </span>
                    <span className="text-center text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      to
                    </span>
                    <span className="rounded-sm bg-background px-2.5 py-1.5 text-foreground">
                      {formatTaskLogValue(entry.fieldName, entry.newValue)}
                    </span>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function TaskLogsTimelineLoadingState() {
  return (
    <div aria-label="Loading task activity log" className="grid gap-3">
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
    </div>
  );
}

function getEventLabel(eventType: TaskLogEntry["eventType"]) {
  if (eventType === "TASK_UPDATED") {
    return "Updated";
  }

  if (eventType === "STATUS_CHANGED") {
    return "Moved";
  }

  return "Created";
}

function getEventBadgeVariant(eventType: TaskLogEntry["eventType"]) {
  if (eventType === "STATUS_CHANGED") {
    return "progress" as const;
  }

  if (eventType === "TASK_UPDATED") {
    return "outline" as const;
  }

  return "done" as const;
}

function getFieldLabel(fieldName: string) {
  if (fieldName === "assigneeId") {
    return "Assignee";
  }

  if (fieldName === "dueDate") {
    return "Due date";
  }

  if (fieldName === "description") {
    return "Description";
  }

  if (fieldName === "status") {
    return "Status";
  }

  return "Title";
}

function formatTaskLogValue(fieldName: string, value: TaskLogValue) {
  if (fieldName === "status" && typeof value === "string") {
    if (value === "IN_PROGRESS") {
      return "In progress";
    }

    if (value === "DONE") {
      return "Done";
    }

    return "Todo";
  }

  if (fieldName === "dueDate") {
    return typeof value === "string" ? formatTaskLogDate(value) : "No due date";
  }

  if (fieldName === "description") {
    return typeof value === "string" && value.length > 0 ? value : "No description";
  }

  if (fieldName === "assigneeId") {
    return isTaskLogAssigneeValue(value) ? value.name : "Unassigned";
  }

  if (value === null) {
    return "Empty";
  }

  return String(value);
}

function formatTaskLogTimestamp(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(createdAt));
}

function formatTaskLogDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function isTaskLogAssigneeValue(value: TaskLogValue): value is {
  id: string;
  name: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}
