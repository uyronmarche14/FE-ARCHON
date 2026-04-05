"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  LoaderCircle,
  PencilLine,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import type { ProjectActivityEntry } from "@/contracts/projects";
import type { TaskLogEventType } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjectActivity } from "@/features/projects/hooks/use-project-activity";
import { TaskActivityEntry } from "@/features/tasks/components/task-activity-entry";
import {
  formatTaskActivityTimestamp,
  formatTaskActivityValue,
  formatTaskStatusLabel,
  getTaskActivityEventLabel,
  getTaskActivityFieldLabel,
} from "@/features/tasks/lib/task-activity-format";
import { cn } from "@/lib/utils";

type ProjectActivityFeedCardProps = {
  projectId: string;
  eventType: TaskLogEventType | "ALL";
  searchQuery: string;
  onEventTypeChange: (value: TaskLogEventType | "ALL") => void;
  onOpenTask?: (taskId: string) => void;
  onSearchQueryChange: (value: string) => void;
};

const ACTIVITY_EVENT_OPTIONS: Array<{
  label: string;
  value: TaskLogEventType | "ALL";
}> = [
  { label: "All events", value: "ALL" },
  { label: "Created", value: "TASK_CREATED" },
  { label: "Updated", value: "TASK_UPDATED" },
  { label: "Moved", value: "STATUS_CHANGED" },
];

export function ProjectActivityFeedCard({
  projectId,
  eventType,
  searchQuery,
  onEventTypeChange,
  onOpenTask,
  onSearchQueryChange,
}: ProjectActivityFeedCardProps) {
  const isDesktop = useIsDesktopViewport();
  const activityQuery = useProjectActivity(projectId, {
    eventType,
    q: searchQuery.trim(),
  });
  const entries = activityQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const selectedEventLabel =
    ACTIVITY_EVENT_OPTIONS.find((option) => option.value === eventType)?.label ??
    "All events";

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent className="space-y-4 bg-linear-to-b from-background via-background to-surface-subtle/18 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="xs" className="bg-background">
                Project activity
              </Badge>
              <Badge variant="muted" size="xs">
                {entries.length} loaded
              </Badge>
            </div>
            <p className="text-sm leading-5 text-muted-foreground">
              Track task changes across the current project without opening each card.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,19rem)]">
            <ActivityEventFilter
              value={eventType}
              visibleLabel={selectedEventLabel}
              onValueChange={onEventTypeChange}
            />
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/80" />
              <Input
                aria-label="Search project activity"
                className="h-10 rounded-xl border-border/65 bg-background pl-10 shadow-none"
                placeholder="Search summary or task title"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
            </div>
          </div>
        </div>

        {activityQuery.isPending ? (
          <div className="grid gap-3" aria-label="Loading project activity">
            <Skeleton className="h-32 rounded-[1.1rem]" />
            <Skeleton className="h-32 rounded-[1.1rem]" />
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
          <div className="rounded-[1rem] border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-5 text-center">
            <p className="text-sm font-semibold">No matching project activity.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Update the filters or keep working in the board. New project-level history will appear here.
            </p>
          </div>
        ) : null}

        {!activityQuery.isPending && !activityQuery.isError && entries.length > 0 ? (
          isDesktop ? (
            <ProjectActivityDesktopTable
              entries={entries}
              onOpenTask={onOpenTask}
            />
          ) : (
            <div className="grid gap-3" data-testid="project-activity-mobile-list">
              {entries.map((entry) => (
                <TaskActivityEntry key={entry.id} entry={entry} showTaskTitle />
              ))}
            </div>
          )
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

function ActivityEventFilter({
  value,
  visibleLabel,
  onValueChange,
}: {
  value: TaskLogEventType | "ALL";
  visibleLabel: string;
  onValueChange: (value: TaskLogEventType | "ALL") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Filter project activity by event type"
          className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border/65 bg-background px-3.5 text-left text-sm shadow-none outline-none transition-colors hover:border-border focus-visible:ring-2 focus-visible:ring-primary/15"
        >
          <span className="truncate">{visibleLabel}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[12rem]">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) =>
            onValueChange(nextValue as TaskLogEventType | "ALL")
          }
        >
          {ACTIVITY_EVENT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectActivityDesktopTable({
  entries,
  onOpenTask,
}: {
  entries: ProjectActivityEntry[];
  onOpenTask?: (taskId: string) => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-[1.1rem] border border-border/70 bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      data-testid="project-activity-table"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border/65 bg-surface-subtle/28 hover:bg-surface-subtle/28">
            <TableHead className="w-[11rem]">Event</TableHead>
            <TableHead className="w-[17rem]">Task</TableHead>
            <TableHead className="w-[12rem]">Actor</TableHead>
            <TableHead className="w-[10rem]">When</TableHead>
            <TableHead>Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <ProjectActivityDesktopRow
              key={entry.id}
              entry={entry}
              onOpenTask={onOpenTask}
              striped={index % 2 === 1}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectActivityDesktopRow({
  entry,
  onOpenTask,
  striped,
}: {
  entry: ProjectActivityEntry;
  onOpenTask?: (taskId: string) => void;
  striped: boolean;
}) {
  const canOpenTask = typeof onOpenTask === "function" && entry.task.id.length > 0;

  function handleRowOpen() {
    if (!canOpenTask) {
      return;
    }

    onOpenTask(entry.task.id);
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (!canOpenTask) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRowOpen();
    }
  }

  return (
    <TableRow
      aria-label={
        canOpenTask ? `Open ${entry.task.title} from project activity` : undefined
      }
      className={cn(
        "align-top",
        striped ? "bg-surface-subtle/[0.14]" : "bg-background",
        canOpenTask &&
          "cursor-pointer hover:bg-surface-subtle/28 focus-within:bg-surface-subtle/28",
      )}
      data-testid={`project-activity-row-${entry.id}`}
      onClick={canOpenTask ? handleRowOpen : undefined}
      onKeyDown={canOpenTask ? handleRowKeyDown : undefined}
      role={canOpenTask ? "button" : undefined}
      tabIndex={canOpenTask ? 0 : undefined}
    >
      <TableCell className="py-4">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full border",
              getEventIconSurfaceClassName(entry.eventType),
            )}
          >
            {getEventIconNode(entry.eventType)}
          </span>
          <div className="flex min-w-0 items-center gap-2.5">
            <Badge variant={getEventBadgeVariant(entry.eventType)} size="xs">
              {getTaskActivityEventLabel(entry.eventType)}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {entry.fieldName
                ? getTaskActivityFieldLabel(entry.fieldName)
                : "Task event"}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <p className="truncate font-semibold leading-5 text-foreground">
            {entry.task.title}
          </p>
          <Badge
            variant={getProjectTaskStatusBadgeVariant(
              entry.task.statusName,
              entry.task.isClosed,
            )}
            size="xs"
            className="shrink-0"
          >
            {entry.task.statusName}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="py-4 text-sm leading-6 text-foreground">
        <p className="truncate whitespace-nowrap">{entry.actor.name}</p>
      </TableCell>

      <TableCell className="py-4">
        <p className="whitespace-nowrap text-sm leading-6 text-foreground">
          {formatTaskActivityTimestamp(entry.createdAt)}
        </p>
      </TableCell>

      <TableCell className="py-4">
        <div className="space-y-2.5">
          <p className="text-[13px] font-semibold leading-5 text-foreground">
            {entry.summary}
          </p>
          <ProjectActivityChangeDetail entry={entry} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProjectActivityChangeDetail({
  entry,
}: {
  entry: ProjectActivityEntry;
}) {
  if (
    entry.fieldName === "status" &&
    typeof entry.oldValue === "string" &&
    typeof entry.newValue === "string"
  ) {
    return (
      <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-border/65 bg-surface-subtle/18 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Transition
        </span>
        <Badge variant={getStatusBadgeVariant(entry.oldValue)} size="xs">
          {formatTaskStatusLabel(entry.oldValue)}
        </Badge>
        <ArrowRight className="size-3.5 text-muted-foreground" />
        <Badge variant={getStatusBadgeVariant(entry.newValue)} size="xs">
          {formatTaskStatusLabel(entry.newValue)}
        </Badge>
      </div>
    );
  }

  if (!entry.fieldName) {
    return null;
  }

  return (
    <div className="grid gap-2 rounded-[0.95rem] border border-border/60 bg-surface-subtle/16 p-2.5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
      <ActivityValueCard
        label="Before"
        value={formatTaskActivityValue(entry.fieldName, entry.oldValue)}
      />
      <ArrowRight className="mx-auto size-4 text-muted-foreground" />
      <ActivityValueCard
        label="After"
        value={formatTaskActivityValue(entry.fieldName, entry.newValue)}
      />
    </div>
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
    <div className="min-w-0 rounded-[0.85rem] border border-border/60 bg-background px-2.5 py-2">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-foreground">{value}</p>
    </div>
  );
}

function getEventIconNode(eventType: ProjectActivityEntry["eventType"]) {
  if (eventType === "STATUS_CHANGED") {
    return <ArrowRight className="size-4" />;
  }

  if (eventType === "TASK_UPDATED") {
    return <PencilLine className="size-4" />;
  }

  return <Sparkles className="size-4" />;
}

function getEventBadgeVariant(eventType: ProjectActivityEntry["eventType"]) {
  if (eventType === "STATUS_CHANGED") {
    return "progress" as const;
  }

  if (eventType === "TASK_UPDATED") {
    return "outline" as const;
  }

  return "done" as const;
}

function getEventIconSurfaceClassName(eventType: ProjectActivityEntry["eventType"]) {
  if (eventType === "STATUS_CHANGED") {
    return "border-in-progress/22 bg-in-progress/[0.08] text-in-progress";
  }

  if (eventType === "TASK_UPDATED") {
    return "border-primary/20 bg-primary/[0.07] text-primary";
  }

  return "border-done/22 bg-done/[0.08] text-done";
}

function getProjectTaskStatusBadgeVariant(statusName: string, isClosed: boolean) {
  if (isClosed) {
    return "done" as const;
  }

  return getStatusBadgeVariant(statusName);
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

function useIsDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(getIsDesktopViewport);

  useEffect(() => {
    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(min-width: 768px)")
        : null;

    function updateViewport() {
      setIsDesktop(getIsDesktopViewport());
    }

    updateViewport();

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", updateViewport);
      } else {
        mediaQuery.addListener(updateViewport);
      }
    }

    window.addEventListener("resize", updateViewport);

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", updateViewport);
        } else {
          mediaQuery.removeListener(updateViewport);
        }
      }

      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  return isDesktop;
}

function getIsDesktopViewport() {
  if (typeof window === "undefined") {
    return true;
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  return window.innerWidth >= 768;
}
