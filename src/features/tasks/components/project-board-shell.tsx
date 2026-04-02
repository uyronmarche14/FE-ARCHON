"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  ArrowUpDown,
  CalendarClock,
  ChevronDown,
  CircleCheckBig,
  Filter,
  LayoutGrid,
  Plus,
  Search,
} from "lucide-react";
import type { ProjectsListResponse } from "@/contracts/projects";
import type {
  CreateTaskRequest,
  ProjectTasksResponse,
  TaskCard,
  TaskStatus,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLaneDotClassName } from "@/features/tasks/components/board-column";
import { BoardContainer } from "@/features/tasks/components/board-container";
import { KanbanBoardLane } from "@/features/tasks/components/kanban-board-lane";
import { TaskCard as BoardTaskCard } from "@/features/tasks/components/task-card";
import { TaskDrawer } from "@/features/tasks/components/task-drawer";
import { useProjects } from "@/features/projects/hooks/use-projects";
import {
  projectDetailQueryKey,
  projectsQueryKey,
} from "@/features/projects/lib/project-query-keys";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { useProjectTasks } from "@/features/tasks/hooks/use-project-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-update-task";
import { useUpdateTaskStatus } from "@/features/tasks/hooks/use-update-task-status";
import {
  applyTaskStatusChangeToProjectsList,
  createBoardFilters,
  createBoardLanes,
  createBoardMetrics,
  createEmptyTaskGroups,
  flattenTaskGroups,
  getBoardProjectDescription,
  getBoardProjectName,
  insertTaskIntoGroups,
  moveTaskToStatus,
  removeTaskFromGroups,
  TASK_STATUSES,
  updateTaskInGroups,
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
      initialStatus: TaskStatus;
      taskId: null;
    }
  | {
      mode: "edit" | "view";
      initialStatus: TaskStatus;
      taskId: string;
    };

export function ProjectBoardShell({ projectId }: ProjectBoardShellProps) {
  const queryClient = useQueryClient();
  const projectsQuery = useProjects();
  const tasksQuery = useProjectTasks(projectId);
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask();
  const updateTaskStatusMutation = useUpdateTaskStatus();
  const deleteTaskMutation = useDeleteTask();
  const [drawerState, setDrawerState] = useState<TaskDrawerState | null>(null);
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);

  const currentProject =
    projectsQuery.data?.items.find((project) => project.id === projectId) ?? null;
  const projectName = getBoardProjectName(projectId, currentProject);
  const projectDescription = getBoardProjectDescription(currentProject);
  const taskGroups = tasksQuery.data?.taskGroups ?? createEmptyTaskGroups();
  const tasks = useMemo(() => flattenTaskGroups(taskGroups), [taskGroups]);
  const lanes = useMemo(() => createBoardLanes(taskGroups), [taskGroups]);
  const metrics = useMemo(() => createBoardMetrics(taskGroups), [taskGroups]);
  const boardFilters = useMemo(() => createBoardFilters(taskGroups), [taskGroups]);
  const selectedTask =
    drawerState?.taskId !== null && drawerState?.taskId !== undefined
      ? tasks.find((task) => task.id === drawerState.taskId) ?? null
      : null;
  const drawerMode = drawerState?.mode ?? "view";
  const drawerInitialStatus =
    drawerState?.mode === "create"
      ? drawerState.initialStatus
      : selectedTask?.status ?? "TODO";
  const isDrawerOpen =
    drawerState !== null &&
    (drawerState.mode === "create" || selectedTask !== null);
  const drawerStateKey =
    drawerState === null
      ? "closed"
      : drawerState.mode === "create"
        ? `create:${drawerState.initialStatus}`
        : `${drawerState.mode}:${drawerState.taskId}:${selectedTask?.updatedAt ?? "missing"}`;
  const activeDragTask =
    activeDragTaskId !== null
      ? tasks.find((task) => task.id === activeDragTaskId) ?? null
      : null;
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
        taskGroups: insertTaskIntoGroups(
          currentTaskResponse?.taskGroups ?? createEmptyTaskGroups(),
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
                  ? {
                      ...project,
                      taskCounts: {
                        ...project.taskCounts,
                        [createdTask.status]: project.taskCounts[createdTask.status] + 1,
                      },
                    }
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
  }

  async function handleUpdateTask(task: TaskCard, request: UpdateTaskRequest) {
    const updatedTask = await updateTaskMutation.mutateAsync({
      taskId: task.id,
      request,
    });

    queryClient.setQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
      (currentTaskResponse) => ({
        taskGroups: updateTaskInGroups(
          currentTaskResponse?.taskGroups ?? createEmptyTaskGroups(),
          updatedTask,
        ),
      }),
    );

    setDrawerState({
      mode: "view",
      taskId: updatedTask.id,
      initialStatus: updatedTask.status,
    });
    showSuccessToast("Task updated", "Changes were saved without leaving the board.");

    void queryClient.invalidateQueries({
      queryKey: projectTasksQueryKey(projectId),
    });
    void queryClient.invalidateQueries({
      queryKey: taskLogsQueryKey(updatedTask.id),
    });
  }

  async function handleDeleteTask(task: TaskCard) {
    await deleteTaskMutation.mutateAsync(task.id);

    queryClient.setQueryData<ProjectTasksResponse>(
      projectTasksQueryKey(projectId),
      (currentTaskResponse) => ({
        taskGroups: removeTaskFromGroups(
          currentTaskResponse?.taskGroups ?? createEmptyTaskGroups(),
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
                  ? {
                      ...project,
                      taskCounts: {
                        ...project.taskCounts,
                        [task.status]: Math.max(0, project.taskCounts[task.status] - 1),
                      },
                    }
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
  }

  async function handleTaskStatusMove(
    taskId: string,
    targetStatus: TaskStatus,
  ) {
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
      currentTaskResponse.taskGroups,
      taskId,
      targetStatus,
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
        taskGroups: moveResult.nextTaskGroups,
      },
    );
    queryClient.setQueryData<ProjectsListResponse | undefined>(
      projectsQueryKey,
      (currentProjects) =>
        applyTaskStatusChangeToProjectsList(
          currentProjects,
          projectId,
          moveResult.previousTask.status,
          targetStatus,
        ),
    );

    try {
      const updatedTask = await updateTaskStatusMutation.mutateAsync({
        taskId,
        request: {
          status: targetStatus,
        } satisfies UpdateTaskStatusRequest,
      });

      queryClient.setQueryData<ProjectTasksResponse>(
        projectTasksQueryKey(projectId),
        (latestTaskResponse) => ({
          taskGroups: updateTaskInGroups(
            latestTaskResponse?.taskGroups ?? moveResult.nextTaskGroups,
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
      void queryClient.invalidateQueries({
        queryKey: taskLogsQueryKey(taskId),
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
    const targetStatus =
      typeof event.over?.id === "string" &&
      TASK_STATUSES.includes(event.over.id as TaskStatus)
        ? (event.over.id as TaskStatus)
        : null;

    setActiveDragTaskId(null);

    if (!taskId || !targetStatus) {
      return;
    }

    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === targetStatus) {
      return;
    }

    void handleTaskStatusMove(taskId, targetStatus);
  }

  function openTask(task: TaskCard) {
    setDrawerState({
      mode: "view",
      taskId: task.id,
      initialStatus: task.status,
    });
  }

  function openCreateTask(status: TaskStatus) {
    setDrawerState({
      mode: "create",
      taskId: null,
      initialStatus: status,
    });
  }

  const desktopBoardLanes = lanes.map((lane) => (
    <KanbanBoardLane
      key={`desktop:${lane.status}`}
      lane={lane}
      onAddTask={openCreateTask}
      onOpenTask={openTask}
      presentation="desktop"
    />
  ));

  const mobileBoardLanes = lanes.map((lane) => (
    <KanbanBoardLane
      key={`mobile:${lane.status}`}
      lane={lane}
      onAddTask={openCreateTask}
      onOpenTask={openTask}
      presentation="mobile"
    />
  ));

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  Project board
                </Badge>
                <Badge variant="muted" className="px-2">
                  {tasks.length} cards
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
            </div>

            <Button
              type="button"
              size="sm"
              className="rounded-md"
              onClick={() => openCreateTask("TODO")}
            >
              <Plus className="size-4" />
              Create task
            </Button>
          </header>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-between rounded-md bg-background shadow-none sm:min-w-[10rem]"
              >
                All properties
                <ChevronDown className="size-4" />
              </Button>

              <button
                type="button"
                className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-left text-sm text-muted-foreground shadow-none transition-colors hover:bg-muted/60 hover:text-foreground sm:min-w-[16rem]"
              >
                <Search className="size-4" />
                <span className="truncate">Search title, assignee, due date</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <QuietBoardControl icon={<Filter className="size-4" />} label="Filter" />
              <QuietBoardControl
                icon={<LayoutGrid className="size-4" />}
                label="Group by lane"
              />
              <QuietBoardControl
                icon={<ArrowUpDown className="size-4" />}
                label="Sort"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {boardFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  filter.active
                    ? "border-border bg-background text-foreground shadow-sm"
                    : "border-transparent bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <span>{filter.label}</span>
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 text-[11px] font-semibold",
                    filter.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {filter.value}
                </span>
              </button>
            ))}
          </div>

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
                  className="rounded-lg border border-border/70 bg-surface-subtle/55 px-3.5 py-3"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    <Icon className="size-3.5 text-primary" />
                    {metric.label}
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
            <div className="w-[22rem]">
              <BoardTaskCard task={activeDragTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        key={drawerStateKey}
        open={isDrawerOpen}
        mode={drawerMode}
        projectId={projectId}
        task={selectedTask}
        initialStatus={drawerInitialStatus}
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
            initialStatus: selectedTask.status,
          });
        }}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </section>
  );
}

function ProjectBoardLoadingState({ projectName }: { projectName: string }) {
  return (
    <section aria-label="Loading project tasks" className="space-y-4">
      <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              Project board
            </Badge>
            <Badge variant="muted">Loading</Badge>
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
        <BoardLaneSkeleton title="In progress" />
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
    <section className="space-y-4">
      <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              Project board
            </Badge>
            <Badge variant="muted">Load blocked</Badge>
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
            Try the request again to reload the grouped tasks for this project.
          </p>
          <Button type="button" onClick={onRetry} className="rounded-md">
            Retry loading tasks
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function QuietBoardControl({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="rounded-md text-muted-foreground"
    >
      {icon}
      {label}
    </Button>
  );
}

function BoardLaneSkeleton({ title }: { title: string }) {
  return (
    <section className="w-[22rem] shrink-0 overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
      <header className="border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", getLaneDotClassName(getLaneStatus(title)))} />
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

function getLaneStatus(title: string): TaskStatus {
  if (title === "In progress") {
    return "IN_PROGRESS";
  }

  if (title === "Done") {
    return "DONE";
  }

  return "TODO";
}
