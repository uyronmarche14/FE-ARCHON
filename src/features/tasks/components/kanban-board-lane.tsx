"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TaskCard as TaskCardData, TaskStatus } from "@/contracts/tasks";
import {
  BoardColumn,
  BoardLaneEmptyState,
} from "@/features/tasks/components/board-column";
import { DraggableTaskCard } from "@/features/tasks/components/draggable-task-card";
import type { BoardLane, TaskMemberLookup } from "@/features/tasks/lib/task-board";
import { cn } from "@/lib/utils";

type KanbanBoardLaneProps = {
  lane: BoardLane;
  memberLookup?: TaskMemberLookup;
  onAddTask: (status: TaskStatus) => void;
  onOpenTask: (task: TaskCardData) => void;
  presentation: "desktop" | "mobile";
};

export function KanbanBoardLane({
  lane,
  memberLookup,
  onAddTask,
  onOpenTask,
  presentation,
}: KanbanBoardLaneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: lane.status,
    data: {
      status: lane.status,
    },
  });

  return (
    <BoardColumn
      ref={setNodeRef}
      dataTestId={`lane-${lane.status.toLowerCase().replace(/_/g, "-")}`}
      presentation={presentation}
      status={lane.status}
      title={lane.title}
      count={lane.tasks.length}
      description={lane.description}
      onAddTask={() => onAddTask(lane.status)}
      className={cn(isOver && "border-primary/30 ring-2 ring-primary/15")}
      bodyClassName={cn("min-h-[12rem]", isOver && "bg-primary/5")}
    >
      {lane.tasks.length === 0 ? (
        <BoardLaneEmptyState lane={lane.title} />
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
