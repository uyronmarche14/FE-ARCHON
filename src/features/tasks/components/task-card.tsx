import type { ReactNode } from "react";
import { Clock3 } from "lucide-react";
import type { TaskCard as TaskCardData } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatTaskStatusLabel,
  getTaskAssigneeInitials,
  getTaskAssigneeLabel,
  getTaskDueLabel,
  getTaskPositionSummaryLabel,
  type TaskMemberLookup,
  getTaskUpdatedLabel,
} from "@/features/tasks/lib/task-board";

type TaskCardProps = {
  dragHandle?: ReactNode;
  isDragging?: boolean;
  memberLookup?: TaskMemberLookup;
  onOpen?: () => void;
  task: TaskCardData;
};

export function TaskCard({
  dragHandle,
  isDragging = false,
  memberLookup,
  onOpen,
  task,
}: TaskCardProps) {
  const assigneeLabel = getTaskAssigneeLabel(task.assigneeId, memberLookup);
  const assigneeInitials = getTaskAssigneeInitials(task.assigneeId, memberLookup);

  return (
    <article
      className={cn(
        "grid h-full min-h-[11.25rem] cursor-grab grid-rows-[auto_1fr_auto] gap-3 rounded-[0.95rem] border border-border/70 bg-linear-to-br from-background via-background to-surface-subtle/45 px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,border-color,box-shadow,background-color,opacity] duration-150 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] active:cursor-grabbing",
        isDragging && "border-primary/30 bg-card opacity-75 shadow-[0_20px_40px_rgba(15,23,42,0.12)]",
      )}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_3rem] items-start gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Badge variant={getLaneBadgeVariant(task.status)} size="xs">
            {formatTaskStatusLabel(task.status)}
          </Badge>
          <Badge
            variant="outline"
            size="xs"
            className="bg-background/90 font-medium"
          >
            {getTaskDueLabel(task.dueDate)}
          </Badge>
        </div>

        <div className="flex w-12 shrink-0 items-start justify-end gap-2">
          {dragHandle}
          <div
            role="img"
            aria-label={`Assignee ${assigneeLabel}`}
            className="grid size-8 place-items-center rounded-[0.85rem] border border-border/70 bg-card text-[10px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            title={assigneeLabel}
          >
            {assigneeInitials}
          </div>
        </div>
      </header>

      <button
        type="button"
        className="grid min-w-0 content-start gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={onOpen}
      >
        <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
          {task.title}
        </h4>
        <p className="line-clamp-2 text-[12px] leading-5 text-muted-foreground">
          {task.description ?? "No description available yet."}
        </p>
      </button>

      <footer className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-t border-border/60 pt-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <Clock3 className="size-3.5 text-primary" />
            Recent activity
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-foreground">
            {getTaskUpdatedLabel(task.updatedAt)}
          </p>
        </div>
        <Badge
          variant="outline"
          size="xs"
          className="shrink-0 bg-background/90 font-medium text-muted-foreground"
        >
          {getTaskPositionSummaryLabel(task.position)}
        </Badge>
      </footer>
    </article>
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
