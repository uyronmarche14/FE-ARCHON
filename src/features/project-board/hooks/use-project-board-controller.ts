"use client";

import { useMemo, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import type { ProjectStatusResponse, ProjectsListResponse } from "@/contracts/projects";
import type {
  CreateTaskRequest,
  ProjectTasksResponse,
  TaskCard,
  TaskLogEventType,
  TaskStatus,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from "@/contracts/tasks";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { useProjectMembers } from "@/features/projects/hooks/use-project-members";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useProjectTasks } from "@/features/tasks/hooks/use-project-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-update-task";
import { useUpdateTaskStatus } from "@/features/tasks/hooks/use-update-task-status";
import {
  projectDetailQueryKey,
  projectsQueryKey,
} from "@/features/projects/lib/project-query-keys";
import {
  applyCreatedStatusToProjectSummary,
  applyCreatedTaskToProjectSummary,
  applyDeletedTaskToProjectSummary,
  applyTaskStatusChangeToProjectsList,
  type BoardTaskAssigneeFilter,
  type BoardTaskDueDateFilter,
  type BoardTaskSort,
  type BoardTaskStatusFilter,
  createAssigneeFilterOptions,
  createBoardFilters,
  createBoardLanes,
  createBoardMetrics,
  createEmptyTaskStatuses,
  filterAndSortTaskStatuses,
  flattenTaskStatuses,
  getBoardProjectDescription,
  getBoardProjectName,
  insertStatusIntoTaskStatuses,
  insertTaskIntoStatuses,
  moveTaskToStatus,
  removeTaskFromStatuses,
  updateTaskInStatuses,
} from "@/features/project-board/lib/project-board-workspace";
import {
  createTaskMemberLookup,
  type TaskMemberLookup,
} from "@/features/tasks/lib/task-board";
import {
  projectTasksQueryKey,
  taskLogsQueryKey,
} from "@/features/tasks/lib/task-query-keys";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";

type TaskDrawerState =
  | {
      mode: "create";
      initialStatusId: string;
      taskId: null;
    }
  | {
      mode: "edit" | "view";
      initialStatusId: string;
      taskId: string;
    };

export function useProjectBoardController(projectId: string) {
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const projectsQuery = useProjects();
  const tasksQuery = useProjectTasks(projectId);
  const membersQuery = useProjectMembers(projectId, !tasksQuery.isPending);
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask();
  const updateTaskStatusMutation = useUpdateTaskStatus();
  const deleteTaskMutation = useDeleteTask();
  const [drawerState, setDrawerState] = useState<TaskDrawerState | null>(null);
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<BoardTaskStatusFilter>("ALL");
  const [assigneeFilter, setAssigneeFilter] =
    useState<BoardTaskAssigneeFilter>("ALL");
  const [dueDateFilter, setDueDateFilter] =
    useState<BoardTaskDueDateFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<BoardTaskSort>("DEFAULT");
  const [activityEventType, setActivityEventType] =
    useState<TaskLogEventType | "ALL">("ALL");
  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activeSurfaceTab, setActiveSurfaceTab] = useState<"board" | "activity">(
    "board",
  );

  const currentProject =
    projectsQuery.data?.items.find((project) => project.id === projectId) ?? null;
  const projectName = getBoardProjectName(projectId, currentProject);
  const projectDescription = getBoardProjectDescription(currentProject);
  const statuses = tasksQuery.data?.statuses ?? createEmptyTaskStatuses();
  const firstStatusId = statuses[0]?.id ?? "";
  const allTasks = useMemo(() => flattenTaskStatuses(statuses), [statuses]);
  const visibleStatuses = useMemo(
    () =>
      filterAndSortTaskStatuses(statuses, {
        searchQuery,
        statusFilter,
        assigneeFilter,
        dueDateFilter,
        sortOrder,
      }),
    [assigneeFilter, dueDateFilter, searchQuery, sortOrder, statusFilter, statuses],
  );
  const visibleTasks = useMemo(
    () => flattenTaskStatuses(visibleStatuses),
    [visibleStatuses],
  );
  const lanes = useMemo(() => createBoardLanes(visibleStatuses), [visibleStatuses]);
  const metrics = useMemo(() => createBoardMetrics(visibleStatuses), [visibleStatuses]);
  const boardFilters = useMemo(
    () => createBoardFilters(statuses, statusFilter),
    [statusFilter, statuses],
  );
  const assigneeOptions = useMemo(
    () => createAssigneeFilterOptions(statuses, membersQuery.data ?? []),
    [membersQuery.data, statuses],
  );
  const dueDateOptions = useMemo(
    () => [
      { label: "All due dates", value: "ALL" as const },
      { label: "No due date", value: "NO_DUE_DATE" as const },
      { label: "Overdue", value: "OVERDUE" as const },
      { label: "Next 7 days", value: "NEXT_7_DAYS" as const },
      { label: "Future", value: "FUTURE" as const },
    ],
    [],
  );
  const sortOptions = useMemo(
    () => [
      { label: "Board order", value: "DEFAULT" as const },
      { label: "Due date", value: "DUE_DATE" as const },
      { label: "Newest updated", value: "NEWEST_UPDATED" as const },
      { label: "Oldest created", value: "OLDEST_CREATED" as const },
    ],
    [],
  );
  const selectedAssigneeLabel =
    assigneeOptions.find((option) => option.value === assigneeFilter)?.label ??
    "All assignees";
  const selectedDueDateLabel =
    dueDateOptions.find((option) => option.value === dueDateFilter)?.label ??
    "All due dates";
  const selectedSortLabel =
    sortOptions.find((option) => option.value === sortOrder)?.label ??
    "Board order";
  const memberLookup = useMemo<TaskMemberLookup>(
    () => createTaskMemberLookup(membersQuery.data ?? []),
    [membersQuery.data],
  );
  const selectedTask =
    drawerState?.taskId !== null && drawerState?.taskId !== undefined
      ? allTasks.find((task) => task.id === drawerState.taskId) ?? null
      : null;
  const drawerMode = drawerState?.mode ?? "view";
  const drawerInitialStatusId =
    drawerState?.mode === "create"
      ? drawerState.initialStatusId
      : selectedTask?.statusId ?? firstStatusId;
  const isDrawerOpen =
    drawerState !== null &&
    (drawerState.mode === "create" || selectedTask !== null);
  const drawerStateKey =
    drawerState === null
      ? "closed"
      : drawerState.mode === "create"
        ? `create:${drawerState.initialStatusId}`
        : drawerState.mode === "view"
          ? `view:${drawerState.taskId}`
          : `edit:${drawerState.taskId}:${selectedTask?.updatedAt ?? "missing"}`;
  const activeDragTask =
    activeDragTaskId !== null
      ? allTasks.find((task) => task.id === activeDragTaskId) ?? null
      : null;
  const canInviteMembers =
    currentProject?.role === "OWNER" || session?.user.role === "ADMIN";
  const canManageStatuses =
    currentProject?.role === "OWNER" || session?.user.role === "ADMIN";
  const isTaskMutationPending =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    updateTaskStatusMutation.isPending ||
    deleteTaskMutation.isPending;
  const drawerStatuses: TaskStatus[] = useMemo(
    () =>
      statuses.map((status) => ({
        id: status.id,
        name: status.name,
        position: status.position,
        isClosed: status.isClosed,
        color: status.color,
      })),
    [statuses],
  );
  const statusSummaries = useMemo(
    () =>
      statuses.map((status) => ({
        id: status.id,
        name: status.name,
        position: status.position,
        isClosed: status.isClosed,
        color: status.color,
        taskCount: status.tasks.length,
      })),
    [statuses],
  );

  async function handleCreateTask(request: CreateTaskRequest) {
    const createdTask = await createTaskMutation.mutateAsync(request);

    queryClient.setQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
      (currentTaskResponse) => ({
        statuses: insertTaskIntoStatuses(
          currentTaskResponse?.statuses ?? createEmptyTaskStatuses(),
          createdTask,
        ),
      }),
    );
    queryClient.setQueryData<ProjectsListResponse>(
      projectsQueryKey,
      (currentProjects) =>
        currentProjects
          ? {
              items: currentProjects.items.map((project) =>
                project.id === projectId
                  ? applyCreatedTaskToProjectSummary(project, createdTask.statusId)
                  : project,
              ),
            }
          : currentProjects,
    );

    setDrawerState(null);
    showSuccessToast("Task created", "The new card is ready on the board.");

    void queryClient.invalidateQueries({
      queryKey: projectTasksQueryKey(projectId),
    });
    void queryClient.invalidateQueries({
      queryKey: projectsQueryKey,
    });
    void queryClient.invalidateQueries({
      queryKey: ["project", projectId, "activity"],
    });
  }

  async function handleUpdateTask(task: TaskCard, request: UpdateTaskRequest) {
    const updatedTask = await updateTaskMutation.mutateAsync({
      taskId: task.id,
      request,
    });

    queryClient.setQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
      (currentTaskResponse) => ({
        statuses: updateTaskInStatuses(
          currentTaskResponse?.statuses ?? createEmptyTaskStatuses(),
          updatedTask,
        ),
      }),
    );

    setDrawerState({
      mode: "view",
      taskId: updatedTask.id,
      initialStatusId: updatedTask.statusId,
    });
    showSuccessToast("Task updated", "Changes were saved without leaving the board.");

    void queryClient.invalidateQueries({
      queryKey: projectTasksQueryKey(projectId),
    });
    await queryClient.invalidateQueries({
      queryKey: taskLogsQueryKey(updatedTask.id),
      refetchType: "active",
    });
    void queryClient.invalidateQueries({
      queryKey: ["project", projectId, "activity"],
    });
  }

  function handleProjectStatusCreated(createdStatus: ProjectStatusResponse) {
    queryClient.setQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
      (currentTaskResponse) => ({
        statuses: insertStatusIntoTaskStatuses(
          currentTaskResponse?.statuses ?? createEmptyTaskStatuses(),
          createdStatus,
        ),
      }),
    );
    queryClient.setQueryData<ProjectsListResponse>(
      projectsQueryKey,
      (currentProjects) =>
        currentProjects
          ? {
              items: currentProjects.items.map((project) =>
                project.id === projectId
                  ? applyCreatedStatusToProjectSummary(project, createdStatus)
                  : project,
              ),
            }
          : currentProjects,
    );

    showSuccessToast(
      "Status created",
      `${createdStatus.name} is ready to use on this project board.`,
    );

    void queryClient.invalidateQueries({
      queryKey: projectTasksQueryKey(projectId),
    });
    void queryClient.invalidateQueries({
      queryKey: projectsQueryKey,
    });
    void queryClient.invalidateQueries({
      queryKey: projectDetailQueryKey(projectId),
    });
  }

  async function handleDeleteTask(task: TaskCard) {
    await deleteTaskMutation.mutateAsync(task.id);

    queryClient.setQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
      (currentTaskResponse) => ({
        statuses: removeTaskFromStatuses(
          currentTaskResponse?.statuses ?? createEmptyTaskStatuses(),
          task.id,
        ),
      }),
    );
    queryClient.setQueryData<ProjectsListResponse>(
      projectsQueryKey,
      (currentProjects) =>
        currentProjects
          ? {
              items: currentProjects.items.map((project) =>
                project.id === projectId
                  ? applyDeletedTaskToProjectSummary(project, task.statusId)
                  : project,
              ),
            }
          : currentProjects,
    );

    setDrawerState(null);
    showSuccessToast("Task deleted", "The card was removed from the board.");

    void queryClient.invalidateQueries({
      queryKey: projectTasksQueryKey(projectId),
    });
    void queryClient.invalidateQueries({
      queryKey: projectsQueryKey,
    });
    void queryClient.invalidateQueries({
      queryKey: ["project", projectId, "activity"],
    });
  }

  async function handleTaskStatusMove(taskId: string, targetStatusId: string) {
    await Promise.all([
      queryClient.cancelQueries({
        queryKey: projectTasksQueryKey(projectId),
      }),
      queryClient.cancelQueries({
        queryKey: projectsQueryKey,
      }),
    ]);

    const currentTaskResponse = queryClient.getQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
    );

    if (!currentTaskResponse) {
      return;
    }

    const moveResult = moveTaskToStatus(
      currentTaskResponse.statuses,
      taskId,
      targetStatusId,
    );

    if (!moveResult.changed || !moveResult.previousTask || !moveResult.nextTask) {
      return;
    }

    const previousProjects = queryClient.getQueryData<ProjectsListResponse>(
      projectsQueryKey,
    );

    queryClient.setQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
      {
        statuses: moveResult.nextStatuses,
      },
    );
    queryClient.setQueryData<ProjectsListResponse | undefined>(
      projectsQueryKey,
      (currentProjects) =>
        applyTaskStatusChangeToProjectsList(
          currentProjects,
          projectId,
          moveResult.previousTask.statusId,
          targetStatusId,
        ),
    );

    try {
      const updatedTask = await updateTaskStatusMutation.mutateAsync({
        taskId,
        request: {
          statusId: targetStatusId,
        } satisfies UpdateTaskStatusRequest,
      });

      queryClient.setQueryData<ProjectTasksResponse>(
        projectTasksQueryKey(projectId),
        (latestTaskResponse) => ({
          statuses: updateTaskInStatuses(
            latestTaskResponse?.statuses ?? moveResult.nextStatuses,
            updatedTask,
          ),
        }),
      );

      void queryClient.invalidateQueries({
        queryKey: projectsQueryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: projectDetailQueryKey(projectId),
      });
      await queryClient.invalidateQueries({
        queryKey: taskLogsQueryKey(taskId),
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: ["project", projectId, "activity"],
      });
    } catch (error) {
      queryClient.setQueryData<ProjectTasksResponse>(
        projectTasksQueryKey(projectId),
        currentTaskResponse,
      );
      queryClient.setQueryData<ProjectsListResponse | undefined>(
        projectsQueryKey,
        previousProjects,
      );
      showApiErrorToast(error, "Task move failed and the board was restored.");
    } finally {
      void queryClient.invalidateQueries({
        queryKey: projectTasksQueryKey(projectId),
      });
    }
  }

  function handleDragStart(event: DragStartEvent) {
    if (typeof event.active.id === "string") {
      setActiveDragTaskId(event.active.id);
    }
  }

  function handleDragCancel() {
    setActiveDragTaskId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const taskId = typeof event.active.id === "string" ? event.active.id : null;
    const overId = typeof event.over?.id === "string" ? event.over.id : null;
    const targetStatusId =
      overId !== null && statuses.some((status) => status.id === overId)
        ? overId
        : null;

    setActiveDragTaskId(null);

    if (!taskId || !targetStatusId) {
      return;
    }

    const currentTask = allTasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.statusId === targetStatusId) {
      return;
    }

    void handleTaskStatusMove(taskId, targetStatusId);
  }

  function openTask(task: TaskCard) {
    setDrawerState({
      mode: "view",
      taskId: task.id,
      initialStatusId: task.statusId,
    });
  }

  function openCreateTask(statusId: string) {
    if (!statusId) {
      return;
    }

    setDrawerState({
      mode: "create",
      taskId: null,
      initialStatusId: statusId,
    });
  }

  function handleDrawerOpenChange(open: boolean) {
    if (!open && !isTaskMutationPending) {
      setDrawerState(null);
    }
  }

  function handleDrawerModeChange(mode: "edit" | "view") {
    if (!selectedTask) {
      return;
    }

    setDrawerState({
      mode,
      taskId: selectedTask.id,
      initialStatusId: selectedTask.statusId,
    });
  }

  return {
    tasksQuery,
    projectId,
    projectName,
    projectDescription,
    statuses,
    statusSummaries,
    firstStatusId,
    visibleTasks,
    lanes,
    metrics,
    boardFilters,
    assigneeOptions,
    dueDateOptions,
    sortOptions,
    selectedAssigneeLabel,
    selectedDueDateLabel,
    selectedSortLabel,
    memberLookup,
    activeDragTask,
    activeSurfaceTab,
    activityEventType,
    activitySearchQuery,
    searchQuery,
    assigneeFilter,
    dueDateFilter,
    sortOrder,
    canInviteMembers,
    canManageStatuses,
    drawerKey: drawerStateKey,
    isDrawerOpen,
    drawerMode,
    drawerInitialStatusId,
    selectedTask,
    drawerStatuses,
    isCreatePending: createTaskMutation.isPending,
    isUpdatePending: updateTaskMutation.isPending,
    isDeletePending: deleteTaskMutation.isPending,
    setActiveSurfaceTab,
    setActivityEventType,
    setActivitySearchQuery,
    setSearchQuery,
    setAssigneeFilter,
    setDueDateFilter,
    setSortOrder,
    setStatusFilter,
    handleCreateTask,
    handleUpdateTask,
    handleProjectStatusCreated,
    handleDeleteTask,
    handleTaskStatusMove,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    openTask,
    openCreateTask,
    handleDrawerOpenChange,
    handleDrawerModeChange,
  };
}
