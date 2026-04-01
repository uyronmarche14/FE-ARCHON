"use client";

import { CalendarClock, Flag, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PlaceholderTaskCard } from "@/features/tasks/lib/placeholder-board-data";

type TaskPreviewPanelProps = {
  presentation?: "hover" | "sheet";
  task: PlaceholderTaskCard;
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
          value={task.dueLabel}
        />
        <TaskMetaBlock
          icon={<Flag className="size-4 text-primary" />}
          label="Priority"
          value={task.priorityLabel}
        />
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
        <p className="text-sm font-semibold">Task summary</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
          <p className="text-sm font-semibold">Assignee</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {task.assigneeName}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
          <p className="text-sm font-semibold">Position</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Card {task.position} in the {formatStatusLabel(task.status)} lane.
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
            <Badge variant="outline">{task.priorityLabel} priority</Badge>
          </div>
          <SheetTitle>{task.title}</SheetTitle>
          <SheetDescription>{task.description}</SheetDescription>
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
          <Badge variant="outline">{task.priorityLabel} priority</Badge>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">{task.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {task.description}
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

function formatStatusLabel(status: PlaceholderTaskCard["status"]) {
  if (status === "IN_PROGRESS") {
    return "In progress";
  }

  if (status === "DONE") {
    return "Done";
  }

  return "Todo";
}

function getStatusBadgeVariant(status: PlaceholderTaskCard["status"]) {
  if (status === "IN_PROGRESS") {
    return "progress" as const;
  }

  if (status === "DONE") {
    return "done" as const;
  }

  return "todo" as const;
}
