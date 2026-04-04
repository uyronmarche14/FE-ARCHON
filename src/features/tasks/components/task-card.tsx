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
  getTaskStatusTone,
  getTaskUpdatedLabel,
} from "@/features/tasks/lib/task-board";

type TaskCardProps = {
  density?: "default" | "compact";
  dragHandle?: ReactNode;
  isDragging?: boolean;
  memberLookup?: TaskMemberLookup;
  onOpen?: () => void;
  task: TaskCardData;
};

export function TaskCard({
  density = "default",
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
        "grid h-full cursor-grab grid-rows-[auto_1fr_auto] border border-border/70 bg-linear-to-br from-background via-background to-surface-subtle/45 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,border-color,box-shadow,background-color,opacity] duration-150 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] active:cursor-grabbing",
        density === "compact"
          ? "min-h-[9.6rem] gap-2.5 rounded-[0.9rem] px-2.5 py-2.5"
          : "min-h-[11.25rem] gap-3 rounded-[0.95rem] px-3 py-3",
        isDragging && "border-primary/30 bg-card opacity-75 shadow-[0_20px_40px_rgba(15,23,42,0.12)]",
      )}
    >
      <header
        className={cn(
          "grid items-start gap-3",
          density === "compact"
            ? "grid-cols-[minmax(0,1fr)_2.5rem]"
            : "grid-cols-[minmax(0,1fr)_3rem]",
        )}
      >
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

        <div
          className={cn(
            "flex shrink-0 items-start justify-end gap-2",
            density === "compact" ? "w-10" : "w-12",
          )}
        >
          {dragHandle}
          <div
            role="img"
            aria-label={`Assignee ${assigneeLabel}`}
            className={cn(
              "grid place-items-center border border-border/70 bg-card font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
              density === "compact"
                ? "size-7 rounded-[0.75rem] text-[9px]"
                : "size-8 rounded-[0.85rem] text-[10px]",
            )}
            title={assigneeLabel}
          >
            {assigneeInitials}
          </div>
        </div>
      </header>

      <button
        type="button"
        className={cn(
          "grid min-w-0 content-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          density === "compact" ? "gap-[0.3125rem]" : "gap-1.5",
        )}
        onClick={onOpen}
      >
        <h4
          className={cn(
            "line-clamp-2 font-semibold text-foreground",
            density === "compact" ? "text-[13px] leading-[1.15rem]" : "text-sm leading-5",
          )}
        >
          {task.title}
        </h4>
        <p
          className={cn(
            "line-clamp-2 text-muted-foreground",
            density === "compact"
              ? "text-[11px] leading-[1.05rem]"
              : "text-[12px] leading-5",
          )}
        >
          {task.description ?? "No description available yet."}
        </p>
      </button>

      <footer
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-t border-border/60",
          density === "compact" ? "pt-1.5" : "pt-2",
        )}
      >
        <div className="min-w-0">
          <p
            className={cn(
              "flex items-center gap-1.5 font-semibold tracking-[0.16em] text-muted-foreground uppercase",
              density === "compact" ? "text-[9px]" : "text-[10px]",
            )}
          >
            <Clock3 className={cn("text-primary", density === "compact" ? "size-3" : "size-3.5")} />
            Recent activity
          </p>
          <p
            className={cn(
              "mt-1 truncate font-medium text-foreground",
              density === "compact" ? "text-[10px]" : "text-[11px]",
            )}
          >
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
  const tone = getTaskStatusTone(status);

  if (tone === "progress") {
    return "progress" as const;
  }

  if (tone === "done") {
    return "done" as const;
  }

  return "todo" as const;
}
