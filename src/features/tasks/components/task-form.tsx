"use client";

import { LoaderCircle } from "lucide-react";
import type { ProjectMember } from "@/contracts/projects";
import type { TaskStatus } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  TaskFormErrors,
  TaskFormValues,
} from "@/features/tasks/lib/task-form";
import { TASK_STATUSES, formatTaskStatusLabel } from "@/features/tasks/lib/task-board";
import { cn } from "@/lib/utils";

type TaskFormProps = {
  mode: "create" | "edit";
  values: TaskFormValues;
  errors: TaskFormErrors;
  members: ProjectMember[];
  membersError?: string | null;
  membersLoading?: boolean;
  formError?: string | null;
  isPending?: boolean;
  submitLabel: string;
  submittingLabel: string;
  saveDisabled?: boolean;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onValueChange: <TField extends keyof TaskFormValues>(
    field: TField,
    value: TaskFormValues[TField],
  ) => void;
};

export function TaskForm({
  mode,
  values,
  errors,
  members,
  membersError,
  membersLoading = false,
  formError,
  isPending = false,
  saveDisabled = false,
  submitLabel,
  submittingLabel,
  onCancel,
  onSubmit,
  onValueChange,
}: TaskFormProps) {
  return (
    <form className="mt-5 grid gap-5" onSubmit={onSubmit}>
      {mode === "create" ? (
        <section className="space-y-4 rounded-[1.1rem] border border-border/70 bg-surface-subtle/55 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <Label>Initial lane</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Choose where the new task should land first.
              </p>
            </div>
            <Badge variant="outline" size="xs">
              Board placement
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {TASK_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={cn(
                  "inline-flex items-center rounded-[0.95rem] border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  values.status === status
                    ? "border-primary/30 bg-primary/[0.08] text-primary shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => onValueChange("status", status)}
                aria-pressed={values.status === status}
              >
                <Badge variant={getStatusBadgeVariant(status)} size="xs">
                  {formatTaskStatusLabel(status)}
                </Badge>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-card px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Label htmlFor="task-title">Task details</Label>
            <p className="text-xs leading-5 text-muted-foreground">
              Keep the task readable at a glance while preserving enough context for the drawer.
            </p>
          </div>
          <Badge variant="outline" size="xs">
            Core content
          </Badge>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-title">Task title</Label>
          <Input
            id="task-title"
            value={values.title}
            placeholder="Finalize launch checklist"
            aria-invalid={errors.title ? true : undefined}
            disabled={isPending}
            onChange={(event) => onValueChange("title", event.target.value)}
          />
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Keep it specific enough to scan quickly on the board.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={values.description}
            placeholder="Capture the work, context, and next check needed."
            aria-invalid={errors.description ? true : undefined}
            disabled={isPending}
            onChange={(event) => onValueChange("description", event.target.value)}
          />
          {errors.description ? (
            <p className="text-xs text-destructive">{errors.description}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Optional. Keep the summary concrete and brief.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-card px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="task-assignee">Assignee</Label>
          <Select
            id="task-assignee"
            value={values.assigneeId}
            aria-invalid={errors.assigneeId ? true : undefined}
            disabled={isPending || membersLoading}
            onChange={(event) => onValueChange("assigneeId", event.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
          {errors.assigneeId ? (
            <p className="text-xs text-destructive">{errors.assigneeId}</p>
          ) : membersError ? (
            <p className="text-xs text-destructive">{membersError}</p>
          ) : membersLoading ? (
            <p className="text-xs text-muted-foreground">Loading members…</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Choose a project member or leave the task unassigned.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-due-date">Due date</Label>
          <Input
            id="task-due-date"
            type="date"
            value={values.dueDate}
            aria-invalid={errors.dueDate ? true : undefined}
            disabled={isPending}
            onChange={(event) => onValueChange("dueDate", event.target.value)}
          />
          {errors.dueDate ? (
            <p className="text-xs text-destructive">{errors.dueDate}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Optional. Dates stay lightweight in this release.
            </p>
          )}
        </div>
      </section>

      {formError ? (
        <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="rounded-xl"
          disabled={isPending || saveDisabled}
        >
          {isPending ? (
            <>
              <LoaderCircle className="size-3.5 animate-spin" />
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

function getStatusBadgeVariant(status: TaskStatus) {
  if (status === "IN_PROGRESS") {
    return "progress" as const;
  }

  if (status === "DONE") {
    return "done" as const;
  }

  return "todo" as const;
}
