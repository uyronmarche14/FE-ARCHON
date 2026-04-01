"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { TaskCard as TaskCardData } from "@/contracts/tasks";
import { TaskCard } from "@/features/tasks/components/task-card";
import { cn } from "@/lib/utils";

type DraggableTaskCardProps = {
  onOpen: () => void;
  task: TaskCardData;
};

export function DraggableTaskCard({
  onOpen,
  task,
}: DraggableTaskCardProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: task.id,
      data: {
        status: task.status,
        taskId: task.id,
      },
    });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("transform-gpu transition-shadow", isDragging && "z-20")}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onOpen={onOpen}
        isDragging={isDragging}
        dragHandle={
          <span
            className={cn(
              "mt-0.5 inline-flex size-6 items-center justify-center rounded-md border border-border/60 bg-surface-subtle/70 text-muted-foreground",
              isDragging && "text-primary",
            )}
          >
            <GripVertical className="size-3.5" />
          </span>
        }
      />
    </div>
  );
}
