import type { TaskCard as TaskCardData } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import {
  formatTaskStatusLabel,
  getTaskAssigneeInitials,
  getTaskAssigneeLabel,
  getTaskDueLabel,
  getTaskPositionLabel,
  getTaskUpdatedLabel,
} from "@/features/tasks/lib/task-board";

type TaskCardProps = {
  task: TaskCardData;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getLaneBadgeVariant(task.status)}>
              {formatTaskStatusLabel(task.status)}
            </Badge>
            <Badge variant="outline">{getTaskDueLabel(task.dueDate)}</Badge>
          </div>

          <h4 className="mt-2 text-sm font-semibold leading-snug text-foreground">
            {task.title}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {task.description ?? "No description available yet."}
          </p>
        </div>

        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
          {getTaskAssigneeInitials(task.assigneeId)}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border/60 bg-surface-subtle/70 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">Assignee</span>
          <span className="font-medium text-foreground">
            {getTaskAssigneeLabel(task.assigneeId)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">Updated</span>
          <span className="font-medium text-foreground">
            {getTaskUpdatedLabel(task.updatedAt)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>{getTaskPositionLabel(task.position, task.status)}</span>
        <span className="font-medium text-foreground/80">Open preview</span>
      </div>
    </>
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
