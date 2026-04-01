"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, LoaderCircle, PencilLine, Trash2 } from "lucide-react";
import type { CreateTaskRequest, TaskCard, TaskStatus, UpdateTaskRequest } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProjectMembers } from "@/features/tasks/hooks/use-project-members";
import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskPreviewPanel } from "@/features/tasks/components/task-preview-panel";
import {
  buildUpdateTaskRequest,
  createTaskFormValues,
  mapTaskFormErrors,
  normalizeCreateTaskFormValues,
  validateTaskFormValues,
  type TaskFormErrors,
  type TaskFormValues,
} from "@/features/tasks/lib/task-form";
import { isApiClientError } from "@/services/http/api-client-error";
import { showApiErrorToast } from "@/lib/toast";

type TaskDrawerProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  projectId: string;
  task: TaskCard | null;
  initialStatus: TaskStatus;
  isCreatePending?: boolean;
  isUpdatePending?: boolean;
  isDeletePending?: boolean;
  onDelete: (task: TaskCard) => Promise<void>;
  onModeChange: (mode: "edit" | "view") => void;
  onOpenChange: (open: boolean) => void;
  onCreate: (request: CreateTaskRequest) => Promise<void>;
  onUpdate: (task: TaskCard, request: UpdateTaskRequest) => Promise<void>;
};

export function TaskDrawer({
  open,
  mode,
  projectId,
  task,
  initialStatus,
  isCreatePending = false,
  isUpdatePending = false,
  isDeletePending = false,
  onDelete,
  onModeChange,
  onOpenChange,
  onCreate,
  onUpdate,
}: TaskDrawerProps) {
  const membersQuery = useProjectMembers(projectId, open && mode !== "view");
  const [formValues, setFormValues] = useState<TaskFormValues>(
    createTaskFormValues(initialStatus, task),
  );
  const [fieldErrors, setFieldErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isPending = isCreatePending || isUpdatePending || isDeletePending;
  const updateRequest = useMemo(
    () => (mode === "edit" && task ? buildUpdateTaskRequest(task, formValues) : null),
    [formValues, mode, task],
  );

  function handleFieldChange<TField extends keyof TaskFormValues>(
    field: TField,
    value: TaskFormValues[TField],
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateTaskFormValues(formValues);
    setFieldErrors(validationErrors);
    setFormError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      if (mode === "create") {
        await onCreate(normalizeCreateTaskFormValues(formValues));
        return;
      }

      if (mode === "edit" && task && updateRequest) {
        await onUpdate(task, updateRequest);
      }
    } catch (error) {
      if (isApiClientError(error)) {
        const nextFieldErrors = mapTaskFormErrors(error.details);
        const hasFieldErrors = Object.values(nextFieldErrors).some(Boolean);

        if (hasFieldErrors) {
          setFieldErrors(nextFieldErrors);
        }

        setFormError(hasFieldErrors ? null : error.message);

        if (!hasFieldErrors) {
          showApiErrorToast(error, "Unable to save the task right now.");
        }
      } else {
        setFormError("Unable to save the task right now.");
        showApiErrorToast(error, "Unable to save the task right now.");
      }
    }
  }

  async function handleDelete() {
    if (!task) {
      return;
    }

    try {
      await onDelete(task);
    } catch (error) {
      showApiErrorToast(error, "Unable to delete the task right now.");
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isPending) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <SheetContent className="w-[calc(100vw-1rem)] max-w-none overflow-y-auto px-4 py-4 sm:w-[calc(100vw-2rem)] sm:px-5 sm:py-5 md:w-[40vw]">
        {mode === "create" ? (
          <>
            <SheetHeader className="gap-3 border-b border-border/60 pb-4">
              <Badge variant="outline" className="w-fit bg-background">
                New task
              </Badge>
              <SheetTitle>Create task</SheetTitle>
              <SheetDescription>
                Add a new card without leaving the board surface.
              </SheetDescription>
            </SheetHeader>

            <TaskForm
              mode="create"
              values={formValues}
              errors={fieldErrors}
              members={membersQuery.data ?? []}
              membersError={
                membersQuery.isError
                  ? "Project members could not be loaded right now."
                  : null
              }
              membersLoading={membersQuery.isPending}
              formError={formError}
              isPending={isCreatePending}
              submitLabel="Create task"
              submittingLabel="Creating"
              onCancel={() => onOpenChange(false)}
              onSubmit={handleSubmit}
              onValueChange={handleFieldChange}
            />
          </>
        ) : null}

        {mode === "edit" && task ? (
          <>
            <SheetHeader className="gap-3 border-b border-border/60 pb-4">
              <Badge variant="outline" className="w-fit bg-background">
                Editing
              </Badge>
              <SheetTitle>Edit task</SheetTitle>
              <SheetDescription>
                Update task details without losing board context.
              </SheetDescription>
            </SheetHeader>

            <TaskForm
              mode="edit"
              values={formValues}
              errors={fieldErrors}
              members={membersQuery.data ?? []}
              membersError={
                membersQuery.isError
                  ? "Project members could not be loaded right now."
                  : null
              }
              membersLoading={membersQuery.isPending}
              formError={formError}
              isPending={isUpdatePending}
              saveDisabled={updateRequest === null}
              submitLabel="Save changes"
              submittingLabel="Saving"
              onCancel={() => onModeChange("view")}
              onSubmit={handleSubmit}
              onValueChange={handleFieldChange}
            />
          </>
        ) : null}

        {mode === "view" && task ? (
          <div className="grid gap-4">
            <TaskPreviewPanel task={task} presentation="sheet" />

            {confirmDelete ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">
                      Delete this task?
                    </p>
                    <p className="text-sm leading-relaxed text-destructive/90">
                      This removes the card from the board immediately. This action
                      cannot be undone in the current release.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <SheetFooter className="border-t border-border/60 pt-4">
              {confirmDelete ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeletePending}
                  >
                    Keep task
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      void handleDelete();
                    }}
                    disabled={isDeletePending}
                  >
                    {isDeletePending ? (
                      <>
                        <LoaderCircle className="size-3.5 animate-spin" />
                        Deleting
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-3.5" />
                        Delete task
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmDelete(true)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-3.5" />
                    Delete task
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onModeChange("edit")}
                    disabled={isPending}
                  >
                    <PencilLine className="size-3.5" />
                    Edit task
                  </Button>
                </>
              )}
            </SheetFooter>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
