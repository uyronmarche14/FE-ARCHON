"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TaskStatus } from "@/contracts/tasks";
import { getLaneDotClassName } from "@/features/tasks/components/board-column";
import { TaskDrawer } from "@/features/tasks/components/task-drawer";
import { ProjectActivityFeedCard } from "@/features/project-board/components/project-activity-feed-card";
import { ProjectBoardBoardTab } from "@/features/project-board/components/project-board-board-tab";
import { ProjectBoardHeaderCard } from "@/features/project-board/components/project-board-header-card";
import { useProjectBoardController } from "@/features/project-board/hooks/use-project-board-controller";
import { cn } from "@/lib/utils";

type ProjectBoardShellProps = {
  projectId: string;
};

export function ProjectBoardShell({ projectId }: ProjectBoardShellProps) {
  const board = useProjectBoardController(projectId);

  if (board.tasksQuery.isPending) {
    return <ProjectBoardLoadingState projectName={board.projectName} />;
  }

  if (board.tasksQuery.isError) {
    return (
      <ProjectBoardErrorState
        projectName={board.projectName}
        projectDescription={board.projectDescription}
        onRetry={() => {
          void board.tasksQuery.refetch();
        }}
      />
    );
  }

  return (
    <section className="space-y-4">
      <ProjectBoardHeaderCard
        canEditProject={board.canEditProject}
        canInviteMembers={board.canInviteMembers}
        canManageStatuses={board.canManageStatuses}
        firstStatusId={board.firstStatusId}
        metrics={board.metrics}
        onCreateTask={board.openCreateTask}
        onProjectStatusCreated={board.handleProjectStatusCreated}
        project={board.currentProject}
        projectDescription={board.projectDescription}
        projectId={board.projectId}
        projectName={board.projectName}
        statuses={board.statusSummaries}
        visibleTaskCount={board.visibleTasks.length}
      />

      <Tabs
        value={board.activeSurfaceTab}
        onValueChange={(value) =>
          board.setActiveSurfaceTab(value as "board" | "activity")
        }
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
            {board.activeSurfaceTab === "board"
              ? `${board.visibleTasks.length} visible`
              : "Project activity"}
          </p>
        </div>

        <TabsContent value="board">
          <ProjectBoardBoardTab
            activeDragTask={board.activeDragTask}
            activeLaneStatusId={board.activeLaneStatusId}
            assigneeFilter={board.assigneeFilter}
            assigneeOptions={board.assigneeOptions.map((option) => ({
              label:
                "count" in option
                  ? `${option.label} (${option.count})`
                  : option.label,
              value: option.value,
            }))}
            boardFilters={board.boardFilters}
            canReorderStatuses={board.canManageStatuses}
            dueDateFilter={board.dueDateFilter}
            dueDateOptions={board.dueDateOptions}
            lanes={board.lanes}
            memberLookup={board.memberLookup}
            onAssigneeFilterChange={board.setAssigneeFilter}
            onDueDateFilterChange={board.setDueDateFilter}
            onDragCancel={board.handleDragCancel}
            onDragEnd={board.handleDragEnd}
            onDragStart={board.handleDragStart}
            onOpenCreateTask={board.openCreateTask}
            onOpenTask={board.openTask}
            onSearchQueryChange={board.setSearchQuery}
            onSortOrderChange={board.setSortOrder}
            onStatusFilterChange={board.setStatusFilter}
            searchQuery={board.searchQuery}
            selectedAssigneeLabel={board.selectedAssigneeLabel}
            selectedDueDateLabel={board.selectedDueDateLabel}
            selectedSortLabel={board.selectedSortLabel}
            sortOptions={board.sortOptions}
            sortOrder={board.sortOrder}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ProjectActivityFeedCard
            projectId={board.projectId}
            eventType={board.activityEventType}
            searchQuery={board.activitySearchQuery}
            onEventTypeChange={board.setActivityEventType}
            onOpenTask={board.openTaskById}
            onSearchQueryChange={board.setActivitySearchQuery}
          />
        </TabsContent>
      </Tabs>

      <TaskDrawer
        key={board.drawerKey}
        open={board.isDrawerOpen}
        mode={board.drawerMode}
        memberLookup={board.memberLookup}
        projectId={board.projectId}
        task={board.selectedTask}
        statuses={board.drawerStatuses}
        initialStatusId={board.drawerInitialStatusId}
        isCreatePending={board.isCreatePending}
        isUpdatePending={board.isUpdatePending}
        isDeletePending={board.isDeletePending}
        onDelete={board.handleDeleteTask}
        onModeChange={board.handleDrawerModeChange}
        onOpenChange={board.handleDrawerOpenChange}
        onCreate={board.handleCreateTask}
        onStatusChange={board.handleTaskStatusMove}
        onUpdate={board.handleUpdateTask}
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

function getSkeletonLaneStatus(title: string): TaskStatus {
  return {
    id: `skeleton-${title.toLowerCase().replace(/\s+/g, "-")}`,
    name: title,
    position: title === "Done" ? 3 : title === "In Progress" ? 2 : 1,
    isClosed: title === "Done",
    color: title === "Done" ? "GREEN" : title === "In Progress" ? "BLUE" : "SLATE",
  };
}
