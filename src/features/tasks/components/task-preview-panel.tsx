"use client";

import { CalendarClock, Layers3, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TaskCard } from "@/contracts/tasks";
import {
  formatTaskStatusLabel,
  getTaskAssigneeLabel,
  getTaskDueLabel,
  getTaskPositionLabel,
  getTaskUpdatedLabel,
} from "@/features/tasks/lib/task-board";

type TaskPreviewPanelProps = {
  presentation?: "hover" | "sheet";
  task: TaskCard;
};

export function TaskPreviewPanel({
  presentation = "hover",
  task,
}: TaskPreviewPanelProps) {
  const body = (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <TaskMetaBlock
          icon={<Layers3 className="size-4 text-primary" />}
          label="Lane"
          value={formatStatusLabel(task.status)}
        />
        <TaskMetaBlock
          icon={<CalendarClock className="size-4 text-primary" />}
          label="Due"
          value={getTaskDueLabel(task.dueDate)}
        />
        <TaskMetaBlock
          icon={<UserRound className="size-4 text-primary" />}
          label="Assignee"
          value={getTaskAssigneeLabel(task.assigneeId)}
        />
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
        <p className="text-sm font-semibold">Task summary</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {task.description ?? "No description available yet."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
          <p className="text-sm font-semibold">Position</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {getTaskPositionLabel(task.position, task.status)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
          <p className="text-sm font-semibold">Recent activity</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {getTaskUpdatedLabel(task.updatedAt)}
          </p>
        </div>
      </div>
    </>
  );

  if (presentation === "sheet") {
    return (
      <div className="grid gap-4">
        <SheetHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {formatStatusLabel(task.status)}
            </Badge>
            <Badge variant="outline">{getTaskAssigneeLabel(task.assigneeId)}</Badge>
          </div>
          <SheetTitle>{task.title}</SheetTitle>
          <SheetDescription>
            {task.description ?? "No description available yet."}
          </SheetDescription>
        </SheetHeader>
        {body}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusBadgeVariant(task.status)}>
            {formatStatusLabel(task.status)}
          </Badge>
          <Badge variant="outline">{getTaskAssigneeLabel(task.assigneeId)}</Badge>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">{task.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {task.description ?? "No description available yet."}
          </p>
        </div>
      </div>
      {body}
    </div>
  );
}

function TaskMetaBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function formatStatusLabel(status: TaskCard["status"]) {
  return formatTaskStatusLabel(status);
}

function getStatusBadgeVariant(status: TaskCard["status"]) {
  if (status === "IN_PROGRESS") {
    return "progress" as const;
  }

  if (status === "DONE") {
    return "done" as const;
  }

  return "todo" as const;
}
