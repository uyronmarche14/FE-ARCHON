"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { TaskCard as TaskCardData } from "@/contracts/tasks";
import { TaskCard } from "@/features/tasks/components/task-card";
import type { TaskMemberLookup } from "@/features/tasks/lib/task-board";
import { cn } from "@/lib/utils";

type DraggableTaskCardProps = {
  memberLookup?: TaskMemberLookup;
  onOpen: () => void;
  task: TaskCardData;
};

export function DraggableTaskCard({
  memberLookup,
  onOpen,
  task,
}: DraggableTaskCardProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: task.id,
      data: {
        statusId: task.statusId,
        taskId: task.id,
      },
    });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-full w-full transform-gpu transition-shadow",
        isDragging && "z-20",
      )}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        memberLookup={memberLookup}
        task={task}
        onOpen={onOpen}
        isDragging={isDragging}
        dragHandle={
          <span
            className={cn(
              "mt-0.5 inline-flex size-6 items-center justify-center rounded-[0.75rem] border border-border/60 bg-background/90 text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
              isDragging && "border-primary/20 text-primary",
            )}
          >
            <GripVertical className="size-3.5" />
          </span>
        }
      />
    </div>
  );
}
