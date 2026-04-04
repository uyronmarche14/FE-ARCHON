"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  LoaderCircle,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  CreateTaskRequest,
  ProjectTaskStatus,
  TaskCard,
  TaskStatus,
  UpdateTaskRequest,
} from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { useProjectMembers } from "@/features/tasks/hooks/use-project-members";
import { useTaskLogs } from "@/features/tasks/hooks/use-task-logs";
import { useUpdateTaskStatus } from "@/features/tasks/hooks/use-update-task-status";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { TaskAttachmentsPanel } from "@/features/tasks/components/task-attachments-panel";
import { TaskCommentsPanel } from "@/features/tasks/components/task-comments-panel";
import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskLogsTimeline } from "@/features/tasks/components/task-logs-timeline";
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
import {
  formatTaskStatusLabel,
  getTaskAssigneeLabel,
  getTaskDueLabel,
  getTaskPositionLabel,
  getTaskStatusBadgeClassName,
  getTaskUpdatedLabel,
  type TaskMemberLookup,
} from "@/features/tasks/lib/task-board";
import {
  projectTasksQueryKey,
  taskLogsQueryKey,
} from "@/features/tasks/lib/task-query-keys";
import { isApiClientError } from "@/services/http/api-client-error";
import { cn } from "@/lib/utils";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";

type TaskDrawerProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  memberLookup?: TaskMemberLookup;
  projectId: string;
  task: TaskCard | null;
  statuses: TaskStatus[];
  initialStatusId: string;
  isCreatePending?: boolean;
  isUpdatePending?: boolean;
  isDeletePending?: boolean;
  onDelete: (task: TaskCard) => Promise<void>;
  onModeChange: (mode: "edit" | "view") => void;
  onOpenChange: (open: boolean) => void;
  onCreate: (request: CreateTaskRequest) => Promise<void>;
  onStatusChange: (taskId: string, statusId: string) => Promise<void>;
  onUpdate: (task: TaskCard, request: UpdateTaskRequest) => Promise<void>;
};

type TaskDrawerViewTab =
  | "task"
  | "subtasks"
  | "comments"
  | "activity"
  | "attachments";

export function TaskDrawer({
  open,
  mode,
  memberLookup,
  projectId,
  task,
  statuses,
  initialStatusId,
  isCreatePending = false,
  isUpdatePending = false,
  isDeletePending = false,
  onDelete,
  onModeChange,
  onOpenChange,
  onCreate,
  onStatusChange,
  onUpdate,
}: TaskDrawerProps) {
  const queryClient = useQueryClient();
  const membersQuery = useProjectMembers(projectId, open);
  const createSubtaskMutation = useCreateTask(projectId);
  const updateSubtaskStatusMutation = useUpdateTaskStatus();
  const deleteSubtaskMutation = useDeleteTask();
  const [activeViewTab, setActiveViewTab] =
    useState<TaskDrawerViewTab>("task");
  const taskLogsQuery = useTaskLogs(
    task?.id ?? "",
    open && mode === "view" && task !== null && activeViewTab === "activity",
  );
  const taskLogEntries =
    taskLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const [formValues, setFormValues] = useState<TaskFormValues>(
    createTaskFormValues(initialStatusId, task),
  );
  const [fieldErrors, setFieldErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskStatusId, setNewSubtaskStatusId] = useState(
    statuses[0]?.id ?? initialStatusId,
  );

  const isPending = isCreatePending || isUpdatePending || isDeletePending;
  const assigneeLabel =
    task !== null
      ? getTaskAssigneeLabel(task.assigneeId, memberLookup)
      : "Unassigned";
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

  async function handleRootStatusChange(nextStatusId: string) {
    if (!task || nextStatusId === task.statusId) {
      return;
    }

    try {
      await onStatusChange(task.id, nextStatusId);
      await queryClient.invalidateQueries({
        queryKey: taskLogsQueryKey(task.id),
      });
      showSuccessToast("Status updated", "The task moved to the new workflow stage.");
    } catch (error) {
      showApiErrorToast(error, "Unable to update the task status right now.");
    }
  }

  async function handleCreateSubtask() {
    if (!task || newSubtaskTitle.trim().length === 0) {
      return;
    }

    try {
      const createdSubtask = await createSubtaskMutation.mutateAsync({
        title: newSubtaskTitle.trim(),
        parentTaskId: task.id,
        statusId: newSubtaskStatusId || statuses[0]?.id,
      });

      queryClient.setQueryData<ProjectTaskStatus[] | undefined>(
        projectTasksQueryKey(projectId),
        undefined,
      );
      queryClient.setQueryData(
        projectTasksQueryKey(projectId),
        (currentTaskResponse: { statuses: ProjectTaskStatus[] } | undefined) =>
          currentTaskResponse
            ? {
                statuses: currentTaskResponse.statuses.map((status) => ({
                  ...status,
                  tasks: status.tasks.map((laneTask) =>
                    laneTask.id === task.id
                      ? {
                          ...laneTask,
                          subtasks: [...laneTask.subtasks, createdSubtask].sort((left, right) =>
                            new Date(left.createdAt).getTime() -
                            new Date(right.createdAt).getTime(),
                          ),
                        }
                      : laneTask,
                  ),
                })),
              }
            : currentTaskResponse,
      );

      setNewSubtaskTitle("");
      setNewSubtaskStatusId(statuses[0]?.id ?? initialStatusId);
      void queryClient.invalidateQueries({
        queryKey: projectTasksQueryKey(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["project", projectId, "activity"],
      });
      showSuccessToast("Subtask created", "The new child task is attached to this work item.");
    } catch (error) {
      showApiErrorToast(error, "Unable to create the subtask right now.");
    }
  }

  async function handleSubtaskStatusChange(
    subtaskId: string,
    nextStatusId: string,
  ) {
    if (!task) {
      return;
    }

    try {
      const updatedSubtask = await updateSubtaskStatusMutation.mutateAsync({
        taskId: subtaskId,
        request: {
          statusId: nextStatusId,
        },
      });

      queryClient.setQueryData(
        projectTasksQueryKey(projectId),
        (currentTaskResponse: { statuses: ProjectTaskStatus[] } | undefined) =>
          currentTaskResponse
            ? {
                statuses: currentTaskResponse.statuses.map((status) => ({
                  ...status,
                  tasks: status.tasks.map((laneTask) =>
                    laneTask.id === task.id
                      ? {
                          ...laneTask,
                          subtasks: laneTask.subtasks.map((subtask) =>
                            subtask.id === subtaskId ? updatedSubtask : subtask,
                          ),
                        }
                      : laneTask,
                  ),
                })),
              }
            : currentTaskResponse,
      );

      void queryClient.invalidateQueries({
        queryKey: ["project", projectId, "activity"],
      });
    } catch (error) {
      showApiErrorToast(error, "Unable to move the subtask right now.");
    }
  }

  async function handleDeleteSubtask(subtaskId: string) {
    if (!task) {
      return;
    }

    try {
      await deleteSubtaskMutation.mutateAsync(subtaskId);
      queryClient.setQueryData(
        projectTasksQueryKey(projectId),
        (currentTaskResponse: { statuses: ProjectTaskStatus[] } | undefined) =>
          currentTaskResponse
            ? {
                statuses: currentTaskResponse.statuses.map((status) => ({
                  ...status,
                  tasks: status.tasks.map((laneTask) =>
                    laneTask.id === task.id
                      ? {
                          ...laneTask,
                          subtasks: laneTask.subtasks.filter(
                            (subtask) => subtask.id !== subtaskId,
                          ),
                        }
                      : laneTask,
                  ),
                })),
              }
            : currentTaskResponse,
      );

      void queryClient.invalidateQueries({
        queryKey: ["project", projectId, "activity"],
      });
      showSuccessToast("Subtask deleted", "The child task was removed.");
    } catch (error) {
      showApiErrorToast(error, "Unable to delete the subtask right now.");
    }
  }

  function handleContainerOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) {
      return;
    }

    onOpenChange(nextOpen);
  }

  const isCenteredTaskModal = true;
  const modalContentClassName =
    "overflow-hidden border-border/60 bg-card/98 p-0 shadow-[0_28px_96px_rgba(15,23,42,0.16)] !w-[min(calc(100%-1rem),58rem)] sm:!w-[min(calc(100%-2rem),58rem)]";

  return (
    <Sheet open={open} onOpenChange={handleContainerOpenChange}>
      <SheetContent
        side={isCenteredTaskModal ? "center" : "right"}
        className={
          isCenteredTaskModal
            ? modalContentClassName
            : "w-[calc(100vw-1rem)] max-w-none overflow-y-auto px-4 py-4 sm:w-[calc(100vw-2rem)] sm:px-5 sm:py-5 md:w-[38rem] xl:w-[42rem]"
        }
      >
        {mode === "create" ? (
          <div className="max-h-[min(86vh,920px)] overflow-y-auto">
            <SheetHeader className="gap-1.5 border-b border-border/40 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground/75">
                Task
              </p>
              <SheetTitle>Create task</SheetTitle>
              <SheetDescription>
                Capture the essentials first.
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <TaskForm
                mode="create"
                values={formValues}
                errors={fieldErrors}
                members={membersQuery.data ?? []}
                statuses={statuses}
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
            </div>
          </div>
        ) : null}

        {mode === "edit" && task ? (
          <div className="max-h-[min(86vh,920px)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <SheetHeader className="gap-1.5 border-b border-border/40 pb-3">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground/75">
                Task
              </p>
              <SheetTitle>Edit task</SheetTitle>
              <SheetDescription>
                Update the work in place.
              </SheetDescription>
            </SheetHeader>

            <TaskForm
              mode="edit"
              values={formValues}
              errors={fieldErrors}
              members={membersQuery.data ?? []}
              statuses={statuses}
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
          </div>
        ) : null}

        {mode === "view" && task ? (
          <Tabs
            value={activeViewTab}
            onValueChange={(value) => setActiveViewTab(value as TaskDrawerViewTab)}
            className="grid max-h-[min(86vh,920px)] gap-2.5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
          >
            <SheetHeader className="gap-2 border-b border-border/40 pb-3">
              <TabsList
                aria-label="Task drawer sections"
                className="grid h-10 w-full grid-cols-5 rounded-[0.95rem] bg-surface-subtle/70 p-1 sm:w-fit"
              >
                <TabsTrigger value="task" className="w-full px-3">
                  Task
                </TabsTrigger>
                <TabsTrigger value="subtasks" className="w-full px-3">
                  Subtasks
                </TabsTrigger>
                <TabsTrigger value="comments" className="w-full px-3">
                  Comments
                </TabsTrigger>
                <TabsTrigger value="activity" className="w-full px-3">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="attachments" className="w-full px-3">
                  Files
                </TabsTrigger>
              </TabsList>
              <div className="space-y-1">
                <SheetTitle>{task.title}</SheetTitle>
                <SheetDescription>
                  {task.description ?? "No summary available yet."}
                </SheetDescription>
              </div>
            </SheetHeader>

            <TabsContent value="task" className="grid gap-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14.5rem] lg:items-start">
                <TaskPreviewPanel
                  memberLookup={memberLookup}
                  task={task}
                  presentation="sheet"
                />

                <aside className="space-y-2.5 lg:sticky lg:top-0">
                  <TaskCompactRailPanel title="Workflow">
                    <div className="space-y-2">
                      <TaskRailField label="Status">
                        <CompactTaskSelect
                          ariaLabel="Task status"
                          value={task.statusId}
                          onChange={(event) => {
                            void handleRootStatusChange(event.target.value);
                          }}
                          disabled={isPending}
                        >
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </CompactTaskSelect>
                      </TaskRailField>
                      <TaskRailField label="Assignee">
                        <TaskCompactValue>{assigneeLabel}</TaskCompactValue>
                      </TaskRailField>
                      <TaskRailField label="Due date">
                        <TaskCompactValue>{getTaskDueLabel(task.dueDate)}</TaskCompactValue>
                      </TaskRailField>
                    </div>
                  </TaskCompactRailPanel>

                  <TaskCompactRailPanel title="Context">
                    <div className="space-y-2">
                      <TaskRailField label="Position">
                        <TaskCompactValue>
                          {getTaskPositionLabel(task.position, task.status)}
                        </TaskCompactValue>
                      </TaskRailField>
                      <TaskRailField label="Recent">
                        <TaskCompactValue>{getTaskUpdatedLabel(task.updatedAt)}</TaskCompactValue>
                      </TaskRailField>
                    </div>
                  </TaskCompactRailPanel>

                  {confirmDelete ? (
                    <TaskCompactRailPanel title="Danger zone">
                      <div className="space-y-3">
                        <div className="rounded-[0.95rem] bg-destructive/5 px-3 py-2.5 ring-1 ring-destructive/15">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                            <p className="text-sm leading-5 text-destructive/90">
                              Deleting removes this task from the board immediately.
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-[0.95rem]"
                            onClick={() => setConfirmDelete(false)}
                            disabled={isDeletePending}
                          >
                            Keep task
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="h-9 rounded-[0.95rem]"
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
                                Confirm delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TaskCompactRailPanel>
                  ) : (
                    <TaskCompactRailPanel title="Actions">
                      <div className="grid gap-2">
                        <Button
                          type="button"
                          className="h-9 rounded-[0.95rem]"
                          onClick={() => onModeChange("edit")}
                        >
                          <PencilLine className="size-3.5" />
                          Edit task
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-[0.95rem] shadow-none"
                          onClick={() => setConfirmDelete(true)}
                          disabled={isDeletePending}
                        >
                          <Trash2 className="size-3.5" />
                          Delete task
                        </Button>
                      </div>
                    </TaskCompactRailPanel>
                  )}
                </aside>
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="grid gap-4">
              <TaskDetailSection
                eyebrow="Child work"
                title="Subtasks"
                description="Break this work into smaller child tasks without cluttering the main board."
                compact
              >
                <TaskDetailSurface className="grid gap-3">
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
                    <Input
                      value={newSubtaskTitle}
                      placeholder="Draft the next child task"
                      onChange={(event) => setNewSubtaskTitle(event.target.value)}
                      disabled={createSubtaskMutation.isPending}
                    />
                    <Select
                      value={newSubtaskStatusId}
                      onChange={(event) => setNewSubtaskStatusId(event.target.value)}
                      disabled={createSubtaskMutation.isPending}
                    >
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      type="button"
                      onClick={() => {
                        void handleCreateSubtask();
                      }}
                      disabled={
                        createSubtaskMutation.isPending ||
                        newSubtaskTitle.trim().length === 0
                      }
                    >
                      {createSubtaskMutation.isPending ? (
                        <>
                          <LoaderCircle className="size-3.5 animate-spin" />
                          Creating
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </TaskDetailSurface>

                {task.subtasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subtasks yet.</p>
                ) : (
                  <ul className="grid gap-2">
                    {task.subtasks.map((subtask) => (
                      <li
                        key={subtask.id}
                        className="grid gap-2 rounded-[0.95rem] border border-border/55 bg-background/75 px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-semibold text-foreground">
                              {subtask.title}
                            </p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {subtask.description ?? "No summary yet."}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              void handleDeleteSubtask(subtask.id);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              size="xs"
                              className={getTaskStatusBadgeClassName(subtask.status)}
                            >
                              {formatTaskStatusLabel(subtask.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getTaskDueLabel(subtask.dueDate)}
                            </span>
                          </div>
                          <Select
                            value={subtask.statusId}
                            onChange={(event) => {
                              void handleSubtaskStatusChange(
                                subtask.id,
                                event.target.value,
                              );
                            }}
                            disabled={updateSubtaskStatusMutation.isPending}
                          >
                            {statuses.map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TaskDetailSection>
            </TabsContent>

            <TabsContent value="comments">
              <TaskCommentsPanel
                enabled={activeViewTab === "comments"}
                taskId={task.id}
              />
            </TabsContent>

            <TabsContent value="activity" className="grid gap-4">
              <TaskLogsTimeline
                entries={taskLogEntries}
                errorMessage={
                  taskLogsQuery.isError
                    ? "We couldn't load the activity log right now."
                    : null
                }
                hasMore={taskLogsQuery.hasNextPage}
                isFetchingMore={taskLogsQuery.isFetchingNextPage}
                isLoading={taskLogsQuery.isPending}
                onLoadMore={() => {
                  void taskLogsQuery.fetchNextPage();
                }}
                onRetry={() => {
                  void taskLogsQuery.refetch();
                }}
              />
            </TabsContent>

            <TabsContent value="attachments">
              <TaskAttachmentsPanel
                enabled={activeViewTab === "attachments"}
                taskId={task.id}
              />
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function TaskDetailSection({
  children,
  description,
  eyebrow,
  first = false,
  compact = false,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  first?: boolean;
  compact?: boolean;
  title: string;
}) {
  return (
    <section
      className={cn(
        compact ? "space-y-2.5" : "space-y-3",
        !first &&
          (compact
            ? "border-t border-border/40 pt-3.5"
            : "border-t border-border/45 pt-4"),
      )}
    >
      <div className="space-y-1">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          {eyebrow}
        </p>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TaskDetailSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.95rem] bg-background/88 px-3 py-2.5 ring-1 ring-border/35",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TaskCompactRailPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-2 rounded-[0.95rem] bg-surface-subtle/35 px-3 py-3 ring-1 ring-border/35">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
        {title}
      </p>
      {children}
    </section>
  );
}

function TaskRailField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function TaskCompactValue({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[0.9rem] bg-background/88 px-3 py-2.5 ring-1 ring-border/35">
      <p className="text-sm text-foreground/88">{children}</p>
    </div>
  );
}

function CompactTaskSelect({
  ariaLabel,
  children,
  disabled = false,
  onChange,
  value,
}: {
  ariaLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <Select
        aria-label={ariaLabel}
        className="h-9 rounded-[0.9rem] border-border/35 bg-background/88 shadow-none"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {children}
      </Select>
    </div>
  );
}
