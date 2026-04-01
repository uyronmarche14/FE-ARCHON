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
    <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
      {mode === "create" ? (
        <div className="space-y-2">
          <Label>Initial lane</Label>
          <div className="flex flex-wrap gap-2">
            {TASK_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={cn(
                  "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  values.status === status
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => onValueChange("status", status)}
                aria-pressed={values.status === status}
              >
                <Badge variant={getStatusBadgeVariant(status)}>
                  {formatTaskStatusLabel(status)}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
        ) : null}
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

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      {formError ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || saveDisabled}>
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
