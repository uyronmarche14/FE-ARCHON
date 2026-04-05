"use client";

import { useMemo } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ChevronDown, Search } from "lucide-react";
import type { TaskCard } from "@/contracts/tasks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { BoardContainer } from "@/features/tasks/components/board-container";
import { KanbanBoardLane } from "@/features/tasks/components/kanban-board-lane";
import { TaskCard as BoardTaskCard } from "@/features/tasks/components/task-card";
import {
  getTaskStatusChipClassName,
  type TaskMemberLookup,
} from "@/features/tasks/lib/task-board";
import {
  type BoardFilterChip,
  type BoardLane,
  type BoardTaskAssigneeFilter,
  type BoardTaskDueDateFilter,
  type BoardTaskSort,
  type BoardTaskStatusFilter,
} from "@/features/project-board/lib/project-board-workspace";
import { cn } from "@/lib/utils";

type ProjectBoardBoardTabProps = {
  activeDragTask: TaskCard | null;
  assigneeFilter: BoardTaskAssigneeFilter;
  assigneeOptions: Array<{ label: string; value: string }>;
  boardFilters: BoardFilterChip[];
  dueDateFilter: BoardTaskDueDateFilter;
  dueDateOptions: Array<{ label: string; value: BoardTaskDueDateFilter }>;
  lanes: BoardLane[];
  memberLookup?: TaskMemberLookup;
  onAssigneeFilterChange: (value: BoardTaskAssigneeFilter) => void;
  onDueDateFilterChange: (value: BoardTaskDueDateFilter) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart: (event: DragStartEvent) => void;
  onOpenCreateTask: (statusId: string) => void;
  onOpenTask: (task: TaskCard) => void;
  onSearchQueryChange: (value: string) => void;
  onSortOrderChange: (value: BoardTaskSort) => void;
  onStatusFilterChange: (value: BoardTaskStatusFilter) => void;
  searchQuery: string;
  selectedAssigneeLabel: string;
  selectedDueDateLabel: string;
  selectedSortLabel: string;
  sortOptions: Array<{ label: string; value: BoardTaskSort }>;
  sortOrder: BoardTaskSort;
};

export function ProjectBoardBoardTab({
  activeDragTask,
  assigneeFilter,
  assigneeOptions,
  boardFilters,
  dueDateFilter,
  dueDateOptions,
  lanes,
  memberLookup,
  onAssigneeFilterChange,
  onDueDateFilterChange,
  onDragCancel,
  onDragEnd,
  onDragStart,
  onOpenCreateTask,
  onOpenTask,
  onSearchQueryChange,
  onSortOrderChange,
  onStatusFilterChange,
  searchQuery,
  selectedAssigneeLabel,
  selectedDueDateLabel,
  selectedSortLabel,
  sortOptions,
  sortOrder,
}: ProjectBoardBoardTabProps) {
  const dragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const desktopBoardLanes = useMemo(
    () =>
      lanes.map((lane) => (
        <KanbanBoardLane
          key={`desktop:${lane.status.id}`}
          lane={lane}
          memberLookup={memberLookup}
          onAddTask={onOpenCreateTask}
          onOpenTask={onOpenTask}
          presentation="desktop"
        />
      )),
    [lanes, memberLookup, onOpenCreateTask, onOpenTask],
  );

  const mobileBoardLanes = useMemo(
    () =>
      lanes.map((lane) => (
        <KanbanBoardLane
          key={`mobile:${lane.status.id}`}
          lane={lane}
          memberLookup={memberLookup}
          onAddTask={onOpenCreateTask}
          onOpenTask={onOpenTask}
          presentation="mobile"
        />
      )),
    [lanes, memberLookup, onOpenCreateTask, onOpenTask],
  );

  return (
    <div className="grid gap-2.5">
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_12rem] xl:items-center">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem]">
          <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search board tasks"
                className="h-10 border-0 bg-transparent pl-9 shadow-none"
                placeholder="Search title, summary, acceptance criteria, or notes"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <BoardControlSelect
              aria-label="Filter tasks by assignee"
              value={selectedAssigneeLabel}
              menuValue={assigneeFilter}
              onValueChange={(value) =>
                onAssigneeFilterChange(value as BoardTaskAssigneeFilter)
              }
              options={assigneeOptions}
            />
          </div>

          <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <BoardControlSelect
              aria-label="Filter tasks by due date"
              value={selectedDueDateLabel}
              menuValue={dueDateFilter}
              onValueChange={(value) =>
                onDueDateFilterChange(value as BoardTaskDueDateFilter)
              }
              options={dueDateOptions}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 xl:justify-end">
          <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] xl:min-w-[12rem]">
            <BoardControlSelect
              aria-label="Sort visible task cards"
              value={selectedSortLabel}
              menuValue={sortOrder}
              onValueChange={(value) => onSortOrderChange(value as BoardTaskSort)}
              options={sortOptions}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {boardFilters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            className={cn(
              filter.statusId === "ALL" || filter.color === null
                ? cn(
                    "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    filter.active
                      ? "bg-background text-foreground ring-1 ring-border/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )
                : getTaskStatusChipClassName(
                    {
                      id: filter.statusId,
                      name: filter.label,
                      position: 0,
                      isClosed: false,
                      color: filter.color,
                    },
                    filter.active,
                  ),
            )}
            aria-pressed={filter.active}
            onClick={() => onStatusFilterChange(filter.statusId)}
          >
            <span>{filter.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                filter.active
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/70 text-muted-foreground",
              )}
            >
              {filter.value}
            </span>
          </button>
        ))}
      </div>

      <DndContext
        sensors={dragSensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
      >
        <BoardContainer
          desktopChildren={desktopBoardLanes}
          mobileChildren={mobileBoardLanes}
        />
        <DragOverlay>
          {activeDragTask ? (
            <div className="w-[20.5rem]">
              <BoardTaskCard
                memberLookup={memberLookup}
                task={activeDragTask}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function BoardControlSelect({
  "aria-label": ariaLabel,
  menuValue,
  onValueChange,
  options,
  value,
}: {
  "aria-label": string;
  menuValue: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex h-10 w-full items-center justify-between gap-3 rounded-full px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span className="truncate">{value}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[13rem]">
        <DropdownMenuRadioGroup value={menuValue} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
