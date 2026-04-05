"use client";

import type { FormEvent } from "react";
import type { ProjectMember } from "@/contracts/projects";
import type { TaskStatus } from "@/contracts/tasks";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaskForm } from "@/features/tasks/components/task-form";
import type { TaskFormErrors, TaskFormValues } from "@/features/tasks/lib/task-form";

type TaskDrawerFormModeProps = {
  errors: TaskFormErrors;
  formError: string | null;
  isPending: boolean;
  members: ProjectMember[];
  membersError: string | null;
  membersLoading: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onValueChange: <TField extends keyof TaskFormValues>(
    field: TField,
    value: TaskFormValues[TField],
  ) => void;
  saveDisabled?: boolean;
  statuses: TaskStatus[];
  values: TaskFormValues;
};

export function TaskDrawerFormMode({
  errors,
  formError,
  isPending,
  members,
  membersError,
  membersLoading,
  mode,
  onCancel,
  onSubmit,
  onValueChange,
  saveDisabled,
  statuses,
  values,
}: TaskDrawerFormModeProps) {
  const isCreateMode = mode === "create";

  return (
    <div
      className={
        isCreateMode
          ? "max-h-[min(86vh,920px)] overflow-y-auto"
          : "max-h-[min(86vh,920px)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
      }
    >
      <SheetHeader
        className={
          isCreateMode
            ? "gap-1.5 border-b border-border/40 px-4 py-3.5 sm:px-5 sm:py-4"
            : "gap-1.5 border-b border-border/40 pb-3"
        }
      >
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground/75">
          Task
        </p>
        <SheetTitle>{isCreateMode ? "Create task" : "Edit task"}</SheetTitle>
        <SheetDescription>
          {isCreateMode
            ? "Capture the essentials first."
            : "Update the work in place."}
        </SheetDescription>
      </SheetHeader>

      <div className={isCreateMode ? "px-4 pb-4 sm:px-5 sm:pb-5" : ""}>
        <TaskForm
          mode={mode}
          values={values}
          errors={errors}
          members={members}
          statuses={statuses}
          membersError={membersError}
          membersLoading={membersLoading}
          formError={formError}
          isPending={isPending}
          saveDisabled={saveDisabled}
          submitLabel={isCreateMode ? "Create task" : "Save changes"}
          submittingLabel={isCreateMode ? "Creating" : "Saving"}
          onCancel={onCancel}
          onSubmit={onSubmit}
          onValueChange={onValueChange}
        />
      </div>
    </div>
  );
}
