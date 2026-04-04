"use client";

import { useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronDown,
  CircleCheckBig,
  LayoutGrid,
  Plus,
  Search,
} from "lucide-react";
import type {
  ProjectStatusResponse,
  ProjectsListResponse,
} from "@/contracts/projects";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateProjectStatusDialog } from "@/features/projects/components/create-project-status-dialog";
import { InviteMemberDialog } from "@/features/projects/components/invite-member-dialog";
import { ManageProjectStatusesDialog } from "@/features/projects/components/manage-project-statuses-dialog";
import { getLaneDotClassName } from "@/features/tasks/components/board-column";
import { BoardContainer } from "@/features/tasks/components/board-container";
import { KanbanBoardLane } from "@/features/tasks/components/kanban-board-lane";
import { ProjectActivityFeedCard } from "@/features/tasks/components/project-activity-feed-card";
import { TaskCard as BoardTaskCard } from "@/features/tasks/components/task-card";
import { TaskDrawer } from "@/features/tasks/components/task-drawer";
import { useProjects } from "@/features/projects/hooks/use-projects";
import {
  projectDetailQueryKey,
  projectsQueryKey,
} from "@/features/projects/lib/project-query-keys";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { useProjectMembers } from "@/features/tasks/hooks/use-project-members";
import { useProjectTasks } from "@/features/tasks/hooks/use-project-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-update-task";
import { useUpdateTaskStatus } from "@/features/tasks/hooks/use-update-task-status";
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
  createTaskMemberLookup,
  filterAndSortTaskStatuses,
  flattenTaskStatuses,
  getBoardProjectDescription,
  getBoardProjectName,
  getTaskStatusChipClassName,
  insertStatusIntoTaskStatuses,
  insertTaskIntoStatuses,
  moveTaskToStatus,
  removeTaskFromStatuses,
  updateTaskInStatuses,
} from "@/features/tasks/lib/task-board";
import {
  projectTasksQueryKey,
  taskLogsQueryKey,
} from "@/features/tasks/lib/task-query-keys";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ProjectBoardShellProps = {
  projectId: string;
};

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

export function ProjectBoardShell({ projectId }: ProjectBoardShellProps) {
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
  const memberLookup = useMemo(
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
  const dragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  if (tasksQuery.isPending) {
    return <ProjectBoardLoadingState projectName={projectName} />;
  }

  if (tasksQuery.isError) {
    return (
      <ProjectBoardErrorState
        projectName={projectName}
        projectDescription={projectDescription}
        onRetry={() => {
          void tasksQuery.refetch();
        }}
      />
    );
  }

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

  const desktopBoardLanes = lanes.map((lane) => (
    <KanbanBoardLane
      key={`desktop:${lane.status.id}`}
      lane={lane}
      memberLookup={memberLookup}
      onAddTask={openCreateTask}
      onOpenTask={openTask}
      presentation="desktop"
    />
  ));

  const mobileBoardLanes = lanes.map((lane) => (
    <KanbanBoardLane
      key={`mobile:${lane.status.id}`}
      lane={lane}
      memberLookup={memberLookup}
      onAddTask={openCreateTask}
      onOpenTask={openTask}
      presentation="mobile"
    />
  ));

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 bg-linear-to-b from-background via-background to-surface-subtle/40 px-4 py-4 sm:px-5">
          <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" size="xs" className="bg-background">
                  Project board
                </Badge>
                <Badge variant="muted" size="xs">
                  {visibleTasks.length} visible
                </Badge>
              </div>

              <div className="space-y-1">
                <h2 className="text-[1.85rem] font-semibold tracking-tight">
                  {projectName}
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {projectDescription}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canInviteMembers ? <InviteMemberDialog projectId={projectId} /> : null}
              {canManageStatuses ? (
                <>
                  <CreateProjectStatusDialog
                    projectId={projectId}
                    onCreated={handleProjectStatusCreated}
                  />
                  <ManageProjectStatusesDialog
                    projectId={projectId}
                    statuses={statuses.map((status) => ({
                      id: status.id,
                      name: status.name,
                      position: status.position,
                      isClosed: status.isClosed,
                      color: status.color,
                      taskCount: status.tasks.length,
                    }))}
                  />
                </>
              ) : null}
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() => openCreateTask(firstStatusId)}
                disabled={!firstStatusId}
              >
                <Plus className="size-4" />
                Create task
              </Button>
            </div>
          </header>

          <div className="grid gap-2 sm:grid-cols-3">
            {metrics.map((metric, index) => {
              const Icon =
                index === 0
                  ? LayoutGrid
                  : index === 1
                    ? CalendarClock
                    : CircleCheckBig;

              return (
                <article
                  key={metric.label}
                  className="rounded-[1rem] border border-border/70 bg-card/90 px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    <Icon className="size-3.5 text-primary" />
                    {metric.label}
                  </div>
                  <p className="mt-1.5 text-[1.65rem] font-semibold tracking-tight">
                    {metric.value}
                  </p>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeSurfaceTab}
        onValueChange={(value) => setActiveSurfaceTab(value as "board" | "activity")}
        className="grid gap-2.5"
      >
        <div className="flex items-center justify-between gap-3">
          <TabsList
            aria-label="Project surface view"
            className="min-h-9 border-border/60 bg-background/85 shadow-none"
          >
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {activeSurfaceTab === "board"
              ? `${visibleTasks.length} visible`
              : "Project activity"}
          </p>
        </div>

        <TabsContent value="board" className="grid gap-2.5">
          <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_12rem] xl:items-center">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem]">
              <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label="Search board tasks"
                    className="h-10 border-0 bg-transparent pl-9 shadow-none"
                    placeholder="Search title, summary, acceptance criteria, or notes"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <BoardControlSelect
                  aria-label="Filter tasks by assignee"
                  value={selectedAssigneeLabel}
                  menuValue={assigneeFilter}
                  onValueChange={(value) =>
                    setAssigneeFilter(value as BoardTaskAssigneeFilter)
                  }
                  options={assigneeOptions.map((option) => ({
                    label:
                      "count" in option
                        ? `${option.label} (${option.count})`
                        : option.label,
                    value: option.value,
                  }))}
                />
              </div>

              <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <BoardControlSelect
                  aria-label="Filter tasks by due date"
                  value={selectedDueDateLabel}
                  menuValue={dueDateFilter}
                  onValueChange={(value) =>
                    setDueDateFilter(value as BoardTaskDueDateFilter)
                  }
                  options={dueDateOptions}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 xl:justify-end">
              <div className="rounded-full border border-border/65 bg-background/85 px-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] xl:min-w-[12rem]">
                <BoardControlSelect
                  aria-label="Sort visible task cards"
                  value={selectedSortLabel}
                  menuValue={sortOrder}
                  onValueChange={(value) =>
                    setSortOrder(value as BoardTaskSort)
                  }
                  options={sortOptions}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {boardFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={cn(
                  filter.statusId === "ALL" || filter.color === null
                    ? cn(
                        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        filter.active
                          ? "bg-background text-foreground ring-1 ring-border/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )
                    : getTaskStatusChipClassName(
                        {
                          id: filter.statusId,
                          name: filter.label,
                          position: 0,
                          isClosed: false,
                          color: filter.color,
                        },
                        filter.active,
                      ),
                )}
                aria-pressed={filter.active}
                onClick={() => setStatusFilter(filter.statusId)}
              >
                <span>{filter.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    filter.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/70 text-muted-foreground",
                  )}
                >
                  {filter.value}
                </span>
              </button>
            ))}
          </div>

          <DndContext
            sensors={dragSensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            <BoardContainer
              desktopChildren={desktopBoardLanes}
              mobileChildren={mobileBoardLanes}
            />
            <DragOverlay>
              {activeDragTask ? (
                <div className="w-[20.5rem]">
                  <BoardTaskCard
                    memberLookup={memberLookup}
                    task={activeDragTask}
                    isDragging
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="activity">
          <ProjectActivityFeedCard
            projectId={projectId}
            eventType={activityEventType}
            searchQuery={activitySearchQuery}
            onEventTypeChange={setActivityEventType}
            onSearchQueryChange={setActivitySearchQuery}
          />
        </TabsContent>
      </Tabs>

      <TaskDrawer
        key={drawerStateKey}
        open={isDrawerOpen}
        mode={drawerMode}
        memberLookup={memberLookup}
        projectId={projectId}
        task={selectedTask}
        statuses={statuses.map((status) => ({
          id: status.id,
          name: status.name,
          position: status.position,
          isClosed: status.isClosed,
          color: status.color,
        }))}
        initialStatusId={drawerInitialStatusId}
        onStatusChange={handleTaskStatusMove}
        isCreatePending={createTaskMutation.isPending}
        isUpdatePending={updateTaskMutation.isPending}
        isDeletePending={deleteTaskMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !isTaskMutationPending) {
            setDrawerState(null);
          }
        }}
        onModeChange={(mode) => {
          if (!selectedTask) {
            return;
          }

          setDrawerState({
            mode,
            taskId: selectedTask.id,
            initialStatusId: selectedTask.statusId,
          });
        }}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </section>
  );
}

export function ProjectBoardLoadingState({
  projectName,
}: {
  projectName: string;
}) {
  return (
    <section aria-label="Loading project tasks" className="space-y-5">
      <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 bg-linear-to-b from-background via-background to-surface-subtle/40 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" size="xs" className="bg-background">
              Project board
            </Badge>
            <Badge variant="muted" size="xs">
              Loading
            </Badge>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {projectName}
            </h2>
            <Skeleton className="h-4 w-full max-w-3xl" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 overflow-hidden">
        <BoardLaneSkeleton title="Todo" />
        <BoardLaneSkeleton title="In Progress" />
        <BoardLaneSkeleton title="Done" />
      </div>
    </section>
  );
}

function ProjectBoardErrorState({
  onRetry,
  projectDescription,
  projectName,
}: {
  onRetry: () => void;
  projectDescription: string;
  projectName: string;
}) {
  return (
    <section className="space-y-5">
      <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 bg-linear-to-b from-background via-background to-surface-subtle/40 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" size="xs" className="bg-background">
              Project board
            </Badge>
            <Badge variant="muted" size="xs">
              Load blocked
            </Badge>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {projectName}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {projectDescription}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>We couldn&apos;t load the board right now.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Try the request again to reload the ordered statuses and tasks for this project.
          </p>
          <Button type="button" onClick={onRetry} className="rounded-md">
            Retry loading tasks
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function BoardLaneSkeleton({ title }: { title: string }) {
  return (
    <section className="w-[21.75rem] shrink-0 overflow-hidden rounded-[1.2rem] border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2.5 rounded-full",
              getLaneDotClassName(getSkeletonLaneStatus(title)),
            )}
          />
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
      </header>
      <div className="grid gap-2.5 p-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </section>
  );
}

function BoardControlSelect({
  "aria-label": ariaLabel,
  menuValue,
  onValueChange,
  options,
  value,
}: {
  "aria-label": string;
  menuValue: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex h-10 w-full items-center justify-between gap-3 rounded-full px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span className="truncate">{value}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[13rem]">
        <DropdownMenuRadioGroup value={menuValue} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getSkeletonLaneStatus(title: string): TaskStatus {
  return {
    id: `skeleton-${title.toLowerCase().replace(/\s+/g, "-")}`,
    name: title,
    position: title === "Done" ? 3 : title === "In Progress" ? 2 : 1,
    isClosed: title === "Done",
    color: title === "Done" ? "GREEN" : title === "In Progress" ? "BLUE" : "SLATE",
  };
}
