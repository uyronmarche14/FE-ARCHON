"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDown,
  CalendarClock,
  ChevronDown,
  CircleCheckBig,
  Filter,
  LayoutGrid,
  MoreHorizontal,
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
} from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { projectsQueryKey } from "@/features/projects/lib/project-query-keys";
import { TaskCard as BoardTaskCard } from "@/features/tasks/components/task-card";
import { TaskDrawer } from "@/features/tasks/components/task-drawer";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { useProjectTasks } from "@/features/tasks/hooks/use-project-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-update-task";
import {
  createBoardFilters,
  createBoardLanes,
  createBoardMetrics,
  createEmptyTaskGroups,
  flattenTaskGroups,
  getBoardProjectDescription,
  getBoardProjectName,
  insertTaskIntoGroups,
  removeTaskFromGroups,
  updateTaskInGroups,
} from "@/features/tasks/lib/task-board";
import { projectTasksQueryKey } from "@/features/tasks/lib/task-query-keys";
import { showSuccessToast } from "@/lib/toast";
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
  const deleteTaskMutation = useDeleteTask();
  const [drawerState, setDrawerState] = useState<TaskDrawerState | null>(null);

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
  const isTaskMutationPending =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending;

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

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden rounded-xl border-border/70 bg-card shadow-none">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  Project board
                </Badge>
                <Badge variant="muted" className="rounded-md px-2.5">
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
              className="rounded-lg"
              onClick={() =>
                setDrawerState({
                  mode: "create",
                  taskId: null,
                  initialStatus: "TODO",
                })
              }
            >
              <Plus className="size-4" />
              Create task
            </Button>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-between rounded-lg bg-background shadow-none sm:min-w-[10rem]"
              >
                All properties
                <ChevronDown className="size-4" />
              </Button>

              <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-muted-foreground sm:min-w-[16rem]">
                <Search className="size-4" />
                <span className="truncate">Search title, assignee, due date</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-lg text-muted-foreground"
              >
                <Filter className="size-4" />
                Filter
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-lg text-muted-foreground"
              >
                <LayoutGrid className="size-4" />
                Group by lane
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-lg text-muted-foreground"
              >
                <ArrowUpDown className="size-4" />
                Sort
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {boardFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                  filter.active
                    ? "border-border bg-background text-foreground shadow-xs"
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
                <div
                  key={metric.label}
                  className="rounded-lg border border-border/70 bg-surface-subtle/70 px-3.5 py-3"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    <Icon className="size-3.5 text-primary" />
                    {metric.label}
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="w-full" data-testid="board-lanes-scroll-area">
        <div className="grid gap-4 pb-3 lg:grid-cols-3">
          {lanes.map((lane) => (
            <section
              key={lane.status}
              className="min-w-0 rounded-xl border border-border/70 bg-card shadow-none"
            >
              <div className="border-b border-border/60 px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          getLaneDotClassName(lane.status),
                        )}
                      />
                      <h3 className="text-base font-semibold tracking-tight">
                        {lane.title}
                      </h3>
                      <span className="rounded-sm bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {lane.tasks.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {lane.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-md text-muted-foreground"
                      aria-label={`Add task to ${lane.title}`}
                      onClick={() =>
                        setDrawerState({
                          mode: "create",
                          taskId: null,
                          initialStatus: lane.status,
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-md text-muted-foreground"
                      aria-label={`${lane.title} lane options`}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-3">
                {lane.tasks.length === 0 ? (
                  <LaneEmptyState lane={lane.title} />
                ) : (
                  lane.tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      className="rounded-lg border border-border/70 bg-background px-3 py-3 text-left shadow-none transition-[border-color,background] duration-150 hover:border-primary/15 hover:bg-surface-subtle/40"
                      onClick={() =>
                        setDrawerState({
                          mode: "view",
                          taskId: task.id,
                          initialStatus: task.status,
                        })
                      }
                    >
                      <BoardTaskCard task={task} />
                    </button>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>

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
      <Card className="overflow-hidden rounded-xl border-border/70 bg-card shadow-none">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              Project board
            </Badge>
            <Badge variant="muted" className="rounded-md px-2.5">
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

      <div className="grid gap-4 lg:grid-cols-3">
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
      <Card className="overflow-hidden rounded-xl border-border/70 bg-card shadow-none">
        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              Project board
            </Badge>
            <Badge variant="muted" className="rounded-md px-2.5">
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

      <Card className="rounded-xl border-border/70 bg-card shadow-none">
        <CardHeader>
          <CardTitle>We couldn&apos;t load the board right now.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Try the request again to reload the grouped tasks for this project.
          </p>
          <Button type="button" onClick={onRetry} className="rounded-lg">
            Retry loading tasks
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function BoardLaneSkeleton({ title }: { title: string }) {
  return (
    <section className="min-w-0 rounded-xl border border-border/70 bg-card shadow-none">
      <div className="border-b border-border/60 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-muted" />
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="grid gap-3 p-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </section>
  );
}

function LaneEmptyState({ lane }: { lane: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-surface-subtle/30 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-foreground">No cards in {lane}.</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        This lane will fill automatically when tasks arrive for this workflow state.
      </p>
    </div>
  );
}

function getLaneDotClassName(status: TaskStatus) {
  if (status === "IN_PROGRESS") {
    return "bg-in-progress";
  }

  if (status === "DONE") {
    return "bg-done";
  }

  return "bg-todo";
}
