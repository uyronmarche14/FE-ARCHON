"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import type { TaskLogEntry } from "@/contracts/tasks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskActivityEntry } from "@/features/tasks/components/task-activity-entry";

type TaskLogsTimelineProps = {
  entries: TaskLogEntry[];
  errorMessage?: string | null;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
};

export function TaskLogsTimeline({
  entries,
  errorMessage,
  hasMore = false,
  isFetchingMore = false,
  isLoading = false,
  onLoadMore,
  onRetry,
}: TaskLogsTimelineProps) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Activity log
          </p>
          <p className="text-sm leading-5 text-muted-foreground">
            Review the latest task changes without leaving the workspace.
          </p>
        </div>
        {entries.length > 0 ? (
          <p className="text-xs text-muted-foreground">{entries.length} entries</p>
        ) : null}
      </div>

      {isLoading ? <TaskLogsTimelineLoadingState /> : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-3.5 py-3.5">
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
        <div className="rounded-[1rem] border border-dashed border-border/55 bg-surface-subtle/30 px-4 py-4 text-center">
          <p className="text-sm font-semibold text-foreground">No activity yet.</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            New history entries will appear here after task creation, edits, and lane
            changes.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && entries.length > 0 ? (
        <ol className="grid gap-2.5">
          {entries.map((entry) => (
            <li key={entry.id}>
              <TaskActivityEntry density="compact" entry={entry} />
            </li>
          ))}
        </ol>
      ) : null}

      {!isLoading && !errorMessage && entries.length > 0 && hasMore && onLoadMore ? (
        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingMore}
          >
            {isFetchingMore ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Loading more
              </>
            ) : (
              "Load more activity"
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function TaskLogsTimelineLoadingState() {
  return (
    <div aria-label="Loading task activity log" className="grid gap-3">
      <Skeleton className="h-24 rounded-[1rem]" />
      <Skeleton className="h-24 rounded-[1rem]" />
    </div>
  );
}
