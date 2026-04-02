"use client";

import { Activity, AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import type { TaskLogEventType } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useProjectActivity } from "@/features/projects/hooks/use-project-activity";
import {
  formatTaskActivityTimestamp,
  getTaskActivityEventLabel,
  getTaskActivityFieldLabel,
} from "@/features/tasks/lib/task-activity-format";

type ProjectActivityFeedCardProps = {
  projectId: string;
  eventType: TaskLogEventType | "ALL";
  searchQuery: string;
  onEventTypeChange: (value: TaskLogEventType | "ALL") => void;
  onSearchQueryChange: (value: string) => void;
};

export function ProjectActivityFeedCard({
  projectId,
  eventType,
  searchQuery,
  onEventTypeChange,
  onSearchQueryChange,
}: ProjectActivityFeedCardProps) {
  const activityQuery = useProjectActivity(projectId, {
    eventType,
    q: searchQuery.trim(),
  });
  const entries = activityQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="space-y-4 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background">
                Project activity
              </Badge>
              <Badge variant="muted">{entries.length} loaded</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Track task changes across the current project without opening each card.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,18rem)]">
            <Select
              aria-label="Filter project activity by event type"
              value={eventType}
              onChange={(event) =>
                onEventTypeChange(event.target.value as TaskLogEventType | "ALL")
              }
            >
              <option value="ALL">All events</option>
              <option value="TASK_CREATED">Created</option>
              <option value="TASK_UPDATED">Updated</option>
              <option value="STATUS_CHANGED">Moved</option>
            </Select>
            <Input
              aria-label="Search project activity"
              placeholder="Search summary or task title"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />
          </div>
        </div>

        {activityQuery.isPending ? (
          <div className="grid gap-3" aria-label="Loading project activity">
            <div className="h-20 rounded-lg bg-muted/60" />
            <div className="h-20 rounded-lg bg-muted/60" />
          </div>
        ) : null}

        {!activityQuery.isPending && activityQuery.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-destructive">
                  We couldn&apos;t load project activity.
                </p>
                <p className="text-sm leading-relaxed text-destructive/90">
                  Retry and we&apos;ll reconnect the latest project-wide history.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-destructive/20 bg-background"
                  onClick={() => {
                    void activityQuery.refetch();
                  }}
                >
                  <RefreshCw className="size-3.5" />
                  Retry loading activity
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {!activityQuery.isPending && !activityQuery.isError && entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-6 text-center">
            <p className="text-sm font-semibold">No matching project activity.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Update the filters or keep working in the board. New project-level history will appear here.
            </p>
          </div>
        ) : null}

        {!activityQuery.isPending && !activityQuery.isError && entries.length > 0 ? (
          <div className="grid gap-3">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-lg border border-border/70 bg-background px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{getTaskActivityEventLabel(entry.eventType)}</Badge>
                      <Badge variant="muted">{entry.task.title}</Badge>
                      {entry.fieldName ? (
                        <Badge variant="outline">{getTaskActivityFieldLabel(entry.fieldName)}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm font-semibold">{entry.summary}</p>
                    <p className="text-xs text-muted-foreground">{entry.actor.name}</p>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="size-3.5" />
                    {formatTaskActivityTimestamp(entry.createdAt)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!activityQuery.isPending &&
        !activityQuery.isError &&
        activityQuery.hasNextPage ? (
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void activityQuery.fetchNextPage();
              }}
              disabled={activityQuery.isFetchingNextPage}
            >
              {activityQuery.isFetchingNextPage ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Loading more
                </>
              ) : (
                "Load more activity"
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
