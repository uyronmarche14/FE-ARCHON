"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  CalendarClock,
  ChevronDown,
  CircleCheckBig,
  Filter,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TaskPreviewPanel } from "@/features/tasks/components/task-preview-panel";
import {
  type PlaceholderTaskCard,
  type PlaceholderTaskStatus,
  getPlaceholderBoard,
} from "@/features/tasks/lib/placeholder-board-data";
import { cn } from "@/lib/utils";

type ProjectBoardShellProps = {
  projectId: string;
};

export function ProjectBoardShell({ projectId }: ProjectBoardShellProps) {
  const board = useMemo(() => getPlaceholderBoard(projectId), [projectId]);
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
  const previewTask =
    board.tasks.find((task) => task.id === previewTaskId) ?? null;

  const laneCounts = {
    TODO: board.lanes.find((lane) => lane.status === "TODO")?.tasks.length ?? 0,
    IN_PROGRESS:
      board.lanes.find((lane) => lane.status === "IN_PROGRESS")?.tasks.length ??
      0,
    DONE: board.lanes.find((lane) => lane.status === "DONE")?.tasks.length ?? 0,
  };

  const boardFilters = [
    { label: "All work", value: board.tasks.length, active: true },
    { label: "Todo", value: laneCounts.TODO },
    { label: "Active", value: laneCounts.IN_PROGRESS },
    { label: "Completed", value: laneCounts.DONE },
  ];

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden rounded-xl border-border/70 bg-card shadow-none">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  Project board
                </Badge>
                <Badge variant="muted" className="rounded-md px-2.5">
                  {board.tasks.length} cards
                </Badge>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {board.projectName.replace(/\b\w/g, (character) =>
                    character.toUpperCase(),
                  )}
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Scan open work quickly, keep active tasks in view, and open a
                  lightweight preview without losing your place in the board.
                </p>
              </div>
            </div>

            <Button size="sm" className="rounded-lg">
              <Plus className="size-4" />
              Create task
            </Button>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="justify-between rounded-lg bg-background shadow-none sm:min-w-[10rem]"
              >
                All properties
                <ChevronDown className="size-4" />
              </Button>

              <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-muted-foreground sm:min-w-[16rem]">
                <Search className="size-4" />
                <span className="truncate">Search title, assignee, due date</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground">
                <Filter className="size-4" />
                Filter
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground">
                <LayoutGrid className="size-4" />
                Group by lane
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground">
                <ArrowUpDown className="size-4" />
                Sort
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {boardFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                  filter.active
                    ? "border-border bg-background text-foreground shadow-xs"
                    : "border-transparent bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <span>{filter.label}</span>
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 text-[11px] font-semibold",
                    filter.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {filter.value}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {board.metrics.map((metric, index) => {
              const Icon =
                index === 0
                  ? LayoutGrid
                  : index === 1
                    ? CalendarClock
                    : CircleCheckBig;

              return (
                <div
                  key={metric.label}
                  className="rounded-lg border border-border/70 bg-surface-subtle/70 px-3.5 py-3"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    <Icon className="size-3.5 text-primary" />
                    {metric.label}
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="w-full" data-testid="board-lanes-scroll-area">
        <div className="grid gap-4 pb-3 lg:grid-cols-3">
          {board.lanes.map((lane) => (
            <section
              key={lane.status}
              className="min-w-0 rounded-xl border border-border/70 bg-card shadow-none"
            >
              <div className="border-b border-border/60 px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          getLaneDotClassName(lane.status),
                        )}
                      />
                      <h3 className="text-base font-semibold tracking-tight">
                        {lane.title}
                      </h3>
                      <span className="rounded-sm bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {lane.tasks.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {lane.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-md text-muted-foreground"
                      aria-label={`Add task to ${lane.title}`}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-md text-muted-foreground"
                      aria-label={`${lane.title} lane options`}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-3">
                {lane.tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className="rounded-lg border border-border/70 bg-background px-3 py-3 text-left shadow-none transition-[border-color,background] duration-150 hover:border-primary/15 hover:bg-surface-subtle/40"
                    onClick={() => setPreviewTaskId(task.id)}
                  >
                    <BoardTaskCard task={task} />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>

      <Sheet
        open={Boolean(previewTask)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTaskId(null);
          }
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          {previewTask ? (
            <TaskPreviewPanel task={previewTask} presentation="sheet" />
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function BoardTaskCard({ task }: { task: PlaceholderTaskCard }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getLaneBadgeVariant(task.status)}>
              {formatStatusLabel(task.status)}
            </Badge>
            <PriorityPill priority={task.priorityLabel} />
          </div>

          <h4 className="mt-2 text-sm font-semibold leading-snug text-foreground">
            {task.title}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        </div>

        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
          {task.assigneeInitials}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border/60 bg-surface-subtle/70 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">Assignee</span>
          <span className="font-medium text-foreground">{task.assigneeName}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">Due</span>
          <span className="font-medium text-foreground">{task.dueLabel}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>Card {task.position}</span>
        <span className="font-medium text-foreground/80">Open preview</span>
      </div>
    </>
  );
}

function PriorityPill({
  priority,
}: {
  priority: PlaceholderTaskCard["priorityLabel"];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        getPriorityClassName(priority),
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

function getLaneBadgeVariant(status: PlaceholderTaskStatus) {
  if (status === "IN_PROGRESS") {
    return "progress" as const;
  }

  if (status === "DONE") {
    return "done" as const;
  }

  return "todo" as const;
}

function getLaneDotClassName(status: PlaceholderTaskStatus) {
  if (status === "IN_PROGRESS") {
    return "bg-in-progress";
  }

  if (status === "DONE") {
    return "bg-done";
  }

  return "bg-todo";
}

function getPriorityClassName(priority: PlaceholderTaskCard["priorityLabel"]) {
  if (priority === "High") {
    return "border-danger/20 bg-danger/10 text-danger";
  }

  if (priority === "Medium") {
    return "border-warning/20 bg-warning/10 text-warning";
  }

  return "border-border bg-muted/70 text-muted-foreground";
}

function formatStatusLabel(status: PlaceholderTaskStatus) {
  if (status === "IN_PROGRESS") {
    return "In progress";
  }

  if (status === "DONE") {
    return "Done";
  }

  return "Todo";
}
