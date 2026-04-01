import type { ReactNode } from "react";
import type { TaskCard as TaskCardData } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatTaskStatusLabel,
  getTaskAssigneeInitials,
  getTaskAssigneeLabel,
  getTaskDueLabel,
  getTaskPositionLabel,
  getTaskUpdatedLabel,
} from "@/features/tasks/lib/task-board";

type TaskCardProps = {
  dragHandle?: ReactNode;
  isDragging?: boolean;
  onOpen?: () => void;
  task: TaskCardData;
};

export function TaskCard({
  dragHandle,
  isDragging = false,
  onOpen,
  task,
}: TaskCardProps) {
  return (
    <article
      className={cn(
        "grid cursor-grab gap-3 rounded-lg border border-border/70 bg-background px-3 py-3 shadow-sm transition-[transform,border-color,box-shadow,background-color,opacity] duration-150 hover:border-primary/20 hover:bg-card hover:shadow-sm active:cursor-grabbing",
        isDragging && "border-primary/30 bg-card opacity-75 shadow-lg",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="block w-full min-w-0 space-y-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={onOpen}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={getLaneBadgeVariant(task.status)}>
                {formatTaskStatusLabel(task.status)}
              </Badge>
              <Badge
                variant="outline"
                className="font-medium normal-case tracking-normal"
              >
                {getTaskDueLabel(task.dueDate)}
              </Badge>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold leading-5 text-foreground">
                {task.title}
              </h4>
              <p className="line-clamp-2 text-[13px] leading-5 text-muted-foreground">
                {task.description ?? "No description available yet."}
              </p>
            </div>
          </button>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          {dragHandle}
          <div className="grid size-8 place-items-center rounded-md border border-border/70 bg-surface-subtle text-[11px] font-semibold text-foreground">
            {getTaskAssigneeInitials(task.assigneeId)}
          </div>
        </div>
      </div>

      <div className="grid gap-2 rounded-md border border-border/60 bg-surface-subtle/55 px-3 py-2.5">
        <TaskMetaRow label="Assignee" value={getTaskAssigneeLabel(task.assigneeId)} />
        <TaskMetaRow label="Recent activity" value={getTaskUpdatedLabel(task.updatedAt)} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2 text-[11px]">
        <span className="truncate text-muted-foreground">
          {getTaskPositionLabel(task.position, task.status)}
        </span>
        <button
          type="button"
          className="shrink-0 font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={onOpen}
        >
          Open details
        </button>
      </div>
    </article>
  );
}

type TaskMetaRowProps = {
  label: string;
  value: string;
};

export function TaskMetaRow({ label, value }: TaskMetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

function getLaneBadgeVariant(status: TaskCardData["status"]) {
  if (status === "IN_PROGRESS") {
    return "progress" as const;
  }

  if (status === "DONE") {
    return "done" as const;
  }

  return "todo" as const;
}
