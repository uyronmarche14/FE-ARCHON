"use client";

import { useCallback } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskCard as TaskCardData } from "@/contracts/tasks";
import {
  BoardColumn,
  BoardLaneEmptyState,
} from "@/features/tasks/components/board-column";
import { DraggableLaneHandle } from "@/features/tasks/components/draggable-lane-handle";
import { DraggableTaskCard } from "@/features/tasks/components/draggable-task-card";
import type { BoardLane } from "@/features/project-board/lib/project-board-workspace";
import type { TaskMemberLookup } from "@/features/tasks/lib/task-board";
import { cn } from "@/lib/utils";

type KanbanBoardLaneProps = {
  canReorder?: boolean;
  isLaneDragActive?: boolean;
  lane: BoardLane;
  laneDragId?: string;
  memberLookup?: TaskMemberLookup;
  onAddTask: (statusId: string) => void;
  onOpenTask: (task: TaskCardData) => void;
  presentation: "desktop" | "mobile";
};

export function KanbanBoardLane({
  canReorder = false,
  isLaneDragActive = false,
  lane,
  laneDragId,
  memberLookup,
  onAddTask,
  onOpenTask,
  presentation,
}: KanbanBoardLaneProps) {
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: lane.status.id,
    data: {
      statusId: lane.status.id,
    },
  });
  const isLaneDraggable =
    canReorder && presentation === "desktop" && laneDragId !== undefined;
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
  } = useDraggable({
    id: laneDragId ?? `disabled-status-lane:${lane.status.id}`,
    disabled: !isLaneDraggable,
  });
  const setLaneNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDroppableNodeRef(node);
      setDraggableNodeRef(node);
    },
    [setDraggableNodeRef, setDroppableNodeRef],
  );
  const handleLaneSurfacePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!isLaneDraggable) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        target.closest('[data-task-card-drag-root="true"]')
      ) {
        return;
      }

      listeners?.onPointerDown?.(event);
    },
    [isLaneDraggable, listeners],
  );
  const surfaceStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <BoardColumn
      ref={setLaneNodeRef}
      dataTestId={`lane-${lane.status.name.toLowerCase().replace(/\s+/g, "-")}`}
      dragSurfaceProps={
        isLaneDraggable
          ? ({
              onPointerDown: handleLaneSurfacePointerDown,
            } as HTMLAttributes<HTMLElement>)
          : undefined
      }
      dragHandle={
        canReorder && presentation === "desktop" && laneDragId ? (
          <DraggableLaneHandle
            ariaLabel={`Reorder ${lane.title} lane`}
            dataTestId={`lane-reorder-handle-${lane.status.id}`}
            isDragging={isDragging}
            dragButtonProps={{
              ...((attributes ?? {}) as ButtonHTMLAttributes<HTMLButtonElement>),
              ...((listeners ?? {}) as ButtonHTMLAttributes<HTMLButtonElement>),
            }}
          />
        ) : undefined
      }
      isLaneDragActive={isLaneDragActive || isDragging}
      isLaneDraggable={isLaneDraggable}
      presentation={presentation}
      status={lane.status}
      surfaceStyle={surfaceStyle}
      title={lane.title}
      count={lane.tasks.length}
      description={lane.description}
      onAddTask={() => onAddTask(lane.status.id)}
      className={cn(isOver && "border-primary/30 ring-2 ring-primary/15")}
      bodyClassName={cn("min-h-[12rem]", isOver && "bg-primary/5")}
    >
      {lane.tasks.length === 0 ? (
        <BoardLaneEmptyState lane={lane.title} status={lane.status} />
      ) : (
        lane.tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            memberLookup={memberLookup}
            task={task}
            onOpen={() => onOpenTask(task)}
          />
        ))
      )}
    </BoardColumn>
  );
}
