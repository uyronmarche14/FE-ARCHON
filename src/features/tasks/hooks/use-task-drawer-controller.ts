"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  CreateTaskRequest,
  ProjectTaskStatus,
  TaskCard,
  TaskStatus,
  UpdateTaskRequest,
} from "@/contracts/tasks";
import { useProjectMembers } from "@/features/projects/hooks/use-project-members";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { useTaskLogs } from "@/features/tasks/hooks/use-task-logs";
import { useUpdateTaskStatus } from "@/features/tasks/hooks/use-update-task-status";
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
  getTaskAssigneeLabel,
  type TaskMemberLookup,
} from "@/features/tasks/lib/task-board";
import {
  projectTasksQueryKey,
  taskLogsQueryKey,
} from "@/features/tasks/lib/task-query-keys";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";
import { isApiClientError } from "@/services/http/api-client-error";

export type TaskDrawerViewTab =
  | "task"
  | "subtasks"
  | "comments"
  | "activity"
  | "attachments";

type UseTaskDrawerControllerOptions = {
  initialStatusId: string;
  isCreatePending?: boolean;
  isDeletePending?: boolean;
  isUpdatePending?: boolean;
  mode: "create" | "edit" | "view";
  onCreate: (request: CreateTaskRequest) => Promise<void>;
  onDelete: (task: TaskCard) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (taskId: string, statusId: string) => Promise<void>;
  onUpdate: (task: TaskCard, request: UpdateTaskRequest) => Promise<void>;
  open: boolean;
  projectId: string;
  task: TaskCard | null;
  statuses: TaskStatus[];
  memberLookup?: TaskMemberLookup;
};

export function useTaskDrawerController({
  initialStatusId,
  isCreatePending = false,
  isDeletePending = false,
  isUpdatePending = false,
  memberLookup,
  mode,
  onCreate,
  onDelete,
  onOpenChange,
  onStatusChange,
  onUpdate,
  open,
  projectId,
  task,
  statuses,
}: UseTaskDrawerControllerOptions) {
  const queryClient = useQueryClient();
  const membersQuery = useProjectMembers(projectId, open);
  const createSubtaskMutation = useCreateTask(projectId);
  const updateSubtaskStatusMutation = useUpdateTaskStatus();
  const deleteSubtaskMutation = useDeleteTask();
  const [activeViewTab, setActiveViewTab] =
    useState<TaskDrawerViewTab>("task");
  // Activity is the only tab with paginated history, so keep that query dormant
  // until the drawer is open on the activity surface.
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
  // Build the outgoing patch lazily so edit mode can disable save until something
  // actually differs from the current task snapshot.
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        // Prefer inline field feedback when the API can point at a specific input.
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

      // Subtasks live inside the parent card rather than the board lanes, so patch
      // the parent subtree locally before the broader project refetch catches up.
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
    // Keep the sheet open while a save or delete is pending so the user does not
    // lose context halfway through a mutation.
    if (!nextOpen && isPending) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return {
    members: membersQuery.data ?? [],
    membersError: membersQuery.isError
      ? "Project members could not be loaded right now."
      : null,
    membersLoading: membersQuery.isPending,
    activeViewTab,
    assigneeLabel,
    confirmDelete,
    createSubtaskPending: createSubtaskMutation.isPending,
    deleteSubtaskPending: deleteSubtaskMutation.isPending,
    fieldErrors,
    formError,
    formValues,
    isPending,
    newSubtaskStatusId,
    newSubtaskTitle,
    taskLogEntries,
    taskLogsQuery,
    updateRequest,
    updateSubtaskStatusPending: updateSubtaskStatusMutation.isPending,
    setActiveViewTab,
    setConfirmDelete,
    setNewSubtaskStatusId,
    setNewSubtaskTitle,
    handleContainerOpenChange,
    handleCreateSubtask,
    handleDelete,
    handleDeleteSubtask,
    handleFieldChange,
    handleRootStatusChange,
    handleSubmit,
    handleSubtaskStatusChange,
  };
}
