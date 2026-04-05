"use client";

import { AlertTriangle, LoaderCircle, PencilLine, Plus, Trash2 } from "lucide-react";
import type { TaskCard, TaskLogEntry, TaskStatus } from "@/contracts/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskAttachmentsPanel } from "@/features/tasks/components/task-attachments-panel";
import { TaskCommentsPanel } from "@/features/tasks/components/task-comments-panel";
import { TaskLogsTimeline } from "@/features/tasks/components/task-logs-timeline";
import { TaskPreviewPanel } from "@/features/tasks/components/task-preview-panel";
import {
  CompactTaskSelect,
  TaskCompactRailPanel,
  TaskCompactValue,
  TaskDetailSection,
  TaskDetailSurface,
  TaskRailField,
} from "@/features/tasks/components/task-drawer-primitives";
import type { TaskDrawerViewTab } from "@/features/tasks/hooks/use-task-drawer-controller";
import {
  formatTaskStatusLabel,
  getTaskDueLabel,
  getTaskPositionLabel,
  getTaskStatusBadgeClassName,
  getTaskUpdatedLabel,
  type TaskMemberLookup,
} from "@/features/tasks/lib/task-board";

type TaskDrawerViewModeProps = {
  activeViewTab: TaskDrawerViewTab;
  assigneeLabel: string;
  confirmDelete: boolean;
  createSubtaskPending: boolean;
  deleteSubtaskPending: boolean;
  isDeletePending: boolean;
  isPending: boolean;
  memberLookup?: TaskMemberLookup;
  newSubtaskStatusId: string;
  newSubtaskTitle: string;
  onConfirmDeleteChange: (value: boolean) => void;
  onCreateSubtask: () => void;
  onDelete: () => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onEditTask: () => void;
  onLoadMoreActivity: () => void;
  onRetryActivity: () => void;
  onRootStatusChange: (statusId: string) => void;
  onSubtaskStatusChange: (subtaskId: string, statusId: string) => void;
  onSubtaskStatusIdChange: (value: string) => void;
  onSubtaskTitleChange: (value: string) => void;
  onTabChange: (value: TaskDrawerViewTab) => void;
  statuses: TaskStatus[];
  task: TaskCard;
  taskLogEntries: TaskLogEntry[];
  taskLogsErrorMessage: string | null;
  taskLogsFetchingMore: boolean;
  taskLogsHasMore: boolean | undefined;
  taskLogsLoading: boolean;
  updateSubtaskStatusPending: boolean;
};

export function TaskDrawerViewMode({
  activeViewTab,
  assigneeLabel,
  confirmDelete,
  createSubtaskPending,
  deleteSubtaskPending,
  isDeletePending,
  isPending,
  memberLookup,
  newSubtaskStatusId,
  newSubtaskTitle,
  onConfirmDeleteChange,
  onCreateSubtask,
  onDelete,
  onDeleteSubtask,
  onEditTask,
  onLoadMoreActivity,
  onRetryActivity,
  onRootStatusChange,
  onSubtaskStatusChange,
  onSubtaskStatusIdChange,
  onSubtaskTitleChange,
  onTabChange,
  statuses,
  task,
  taskLogEntries,
  taskLogsErrorMessage,
  taskLogsFetchingMore,
  taskLogsHasMore,
  taskLogsLoading,
  updateSubtaskStatusPending,
}: TaskDrawerViewModeProps) {
  return (
    <Tabs
      value={activeViewTab}
      onValueChange={(value) => onTabChange(value as TaskDrawerViewTab)}
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
          <TaskPreviewPanel memberLookup={memberLookup} task={task} presentation="sheet" />

          <aside className="space-y-2.5 lg:sticky lg:top-0">
            <TaskCompactRailPanel title="Workflow">
              <div className="space-y-2">
                <TaskRailField label="Status">
                  <CompactTaskSelect
                    ariaLabel="Task status"
                    value={task.statusId}
                    onChange={(event) => onRootStatusChange(event.target.value)}
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
                      onClick={() => onConfirmDeleteChange(false)}
                      disabled={isDeletePending}
                    >
                      Keep task
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-9 rounded-[0.95rem]"
                      onClick={onDelete}
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
                  <Button type="button" className="h-9 rounded-[0.95rem]" onClick={onEditTask}>
                    <PencilLine className="size-3.5" />
                    Edit task
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-[0.95rem] shadow-none"
                    onClick={() => onConfirmDeleteChange(true)}
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
                onChange={(event) => onSubtaskTitleChange(event.target.value)}
                disabled={createSubtaskPending}
              />
              <Select
                value={newSubtaskStatusId}
                onChange={(event) => onSubtaskStatusIdChange(event.target.value)}
                disabled={createSubtaskPending}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                onClick={onCreateSubtask}
                disabled={createSubtaskPending || newSubtaskTitle.trim().length === 0}
              >
                {createSubtaskPending ? (
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
                      onClick={() => onDeleteSubtask(subtask.id)}
                      disabled={deleteSubtaskPending}
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
                      onChange={(event) =>
                        onSubtaskStatusChange(subtask.id, event.target.value)
                      }
                      disabled={updateSubtaskStatusPending}
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
        <TaskCommentsPanel enabled={activeViewTab === "comments"} taskId={task.id} />
      </TabsContent>

      <TabsContent value="activity" className="grid gap-4">
        <TaskLogsTimeline
          entries={taskLogEntries}
          errorMessage={taskLogsErrorMessage}
          hasMore={taskLogsHasMore}
          isFetchingMore={taskLogsFetchingMore}
          isLoading={taskLogsLoading}
          onLoadMore={onLoadMoreActivity}
          onRetry={onRetryActivity}
        />
      </TabsContent>

      <TabsContent value="attachments">
        <TaskAttachmentsPanel enabled={activeViewTab === "attachments"} taskId={task.id} />
      </TabsContent>
    </Tabs>
  );
}
