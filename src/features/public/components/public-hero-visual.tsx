"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BoardColumn, BoardLaneEmptyState } from "@/features/tasks/components/board-column";
import { BoardContainer } from "@/features/tasks/components/board-container";
import { TaskActivityEntry } from "@/features/tasks/components/task-activity-entry";
import { TaskCard } from "@/features/tasks/components/task-card";
import {
  createBoardLanes,
  createBoardMetrics,
  createTaskMemberLookup,
  filterAndSortTaskStatuses,
} from "@/features/tasks/lib/task-board";
import {
  publicHeroActivityEntries,
  publicHeroBoardMeta,
  publicHeroMembers,
  publicHeroStatuses,
} from "@/features/public/mock/public-hero-board";

export function PublicHeroVisual() {
  const [searchQuery, setSearchQuery] = useState("");
  const memberLookup = useMemo(
    () => createTaskMemberLookup(publicHeroMembers),
    [],
  );
  const visibleStatuses = useMemo(
    () =>
      filterAndSortTaskStatuses(publicHeroStatuses, {
        searchQuery,
        assigneeFilter: "ALL",
        dueDateFilter: "ALL",
        sortOrder: "DEFAULT",
      }),
    [searchQuery],
  );
  const lanes = useMemo(() => createBoardLanes(visibleStatuses), [visibleStatuses]);
  const metrics = useMemo(
    () => createBoardMetrics(visibleStatuses),
    [visibleStatuses],
  );
  const visibleActivityEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return publicHeroActivityEntries;
    }

    return publicHeroActivityEntries.filter((entry) =>
      `${entry.summary} ${entry.task.title}`.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery]);

  return (
    <div
      data-testid="public-hero-visual"
      className="grainient-panel rounded-[1.5rem] border border-border/80 bg-card/75 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="relative border-b border-border/80 px-3.5 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="xs">
                Live workspace
              </Badge>
              <Badge variant="muted" size="xs">
                Audit-ready
              </Badge>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                {publicHeroBoardMeta.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {publicHeroBoardMeta.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-background/90 pl-2 pr-1 sm:flex">
              <Search className="size-3" />
              <Input
                aria-label="Search preview tasks"
                className="h-7 w-32 border-0 bg-transparent px-0 text-[10px] shadow-none focus-visible:ring-0"
                placeholder="Search title or description"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <button
              type="button"
              aria-label="Preview board filters"
              className="grid size-7 place-items-center rounded-full border border-border/80 bg-background/90 text-foreground"
            >
              <SlidersHorizontal className="size-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative grid gap-3 p-3 sm:p-4 xl:grid-cols-[minmax(0,1.12fr)_16rem]">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[1.15rem] border border-border/80 bg-background/88 px-3 py-2.5">
            <Badge variant="outline" size="xs" className="bg-background/90">
              Project board
            </Badge>
            <div className="flex flex-wrap items-center gap-2">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
                >
                  {metric.value} {metric.label.toLowerCase()}
                </div>
              ))}
            </div>
          </div>

          <BoardContainer
            density="compact"
            desktopChildren={lanes.map((lane) => (
              <BoardColumn
                key={lane.status.id}
                count={lane.tasks.length}
                density="compact"
                description={lane.description}
                onAddTask={() => undefined}
                showActions={false}
                status={lane.status}
                title={lane.title}
              >
                {lane.tasks.length === 0 ? (
                  <BoardLaneEmptyState lane={lane.title} />
                ) : (
                  lane.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="[&>article]:cursor-default [&>article]:hover:translate-y-0"
                    >
                      <TaskCard density="compact" task={task} memberLookup={memberLookup} />
                    </div>
                  ))
                )}
              </BoardColumn>
            ))}
            mobileChildren={lanes.map((lane) => (
              <BoardColumn
                key={`${lane.status.id}-mobile`}
                count={lane.tasks.length}
                density="compact"
                description={lane.description}
                onAddTask={() => undefined}
                presentation="mobile"
                showActions={false}
                status={lane.status}
                title={lane.title}
              >
                {lane.tasks.length === 0 ? (
                  <BoardLaneEmptyState lane={lane.title} />
                ) : (
                  lane.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="[&>article]:cursor-default [&>article]:hover:translate-y-0"
                    >
                      <TaskCard density="compact" task={task} memberLookup={memberLookup} />
                    </div>
                  ))
                )}
              </BoardColumn>
            ))}
          />
        </div>

        <aside className="rounded-[1.15rem] border border-border/80 bg-background/88 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Activity log
              </p>
              <p className="text-xs text-muted-foreground">
                Latest task changes stay readable.
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>

          <div className="mt-2.5 space-y-2">
            {visibleActivityEntries.length === 0 ? (
              <div className="rounded-[1rem] border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-5 text-center">
                <p className="text-sm font-semibold">No matching activity.</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Update the preview search to reconnect the latest board changes.
                </p>
              </div>
            ) : (
              visibleActivityEntries.map((entry) => (
                <TaskActivityEntry key={entry.id} density="compact" entry={entry} />
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
