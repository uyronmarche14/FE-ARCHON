"use client";

import type {
  CreateTaskRequest,
  TaskCard,
  TaskStatus,
  UpdateTaskRequest,
} from "@/contracts/tasks";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TaskDrawerFormMode } from "@/features/tasks/components/task-drawer-form-mode";
import { TaskDrawerViewMode } from "@/features/tasks/components/task-drawer-view-mode";
import type { TaskMemberLookup } from "@/features/tasks/lib/task-board";
import { useTaskDrawerController } from "@/features/tasks/hooks/use-task-drawer-controller";

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
  const controller = useTaskDrawerController({
    initialStatusId,
    isCreatePending,
    isDeletePending,
    isUpdatePending,
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
  });

  const isCenteredTaskModal = true;
  const modalContentClassName =
    "overflow-hidden border-border/60 bg-card/98 p-0 shadow-[0_28px_96px_rgba(15,23,42,0.16)] !w-[min(calc(100%-1rem),58rem)] sm:!w-[min(calc(100%-2rem),58rem)]";

  return (
    <Sheet open={open} onOpenChange={controller.handleContainerOpenChange}>
      <SheetContent
        side={isCenteredTaskModal ? "center" : "right"}
        className={
          isCenteredTaskModal
            ? modalContentClassName
            : "w-[calc(100vw-1rem)] max-w-none overflow-y-auto px-4 py-4 sm:w-[calc(100vw-2rem)] sm:px-5 sm:py-5 md:w-[38rem] xl:w-[42rem]"
        }
      >
        {mode === "create" ? (
          <TaskDrawerFormMode
            mode="create"
            values={controller.formValues}
            errors={controller.fieldErrors}
            members={controller.members}
            statuses={statuses}
            membersError={controller.membersError}
            membersLoading={controller.membersLoading}
            formError={controller.formError}
            isPending={isCreatePending}
            onCancel={() => onOpenChange(false)}
            onSubmit={controller.handleSubmit}
            onValueChange={controller.handleFieldChange}
          />
        ) : null}

        {mode === "edit" && task ? (
          <TaskDrawerFormMode
            mode="edit"
            values={controller.formValues}
            errors={controller.fieldErrors}
            members={controller.members}
            statuses={statuses}
            membersError={controller.membersError}
            membersLoading={controller.membersLoading}
            formError={controller.formError}
            isPending={isUpdatePending}
            saveDisabled={controller.updateRequest === null}
            onCancel={() => onModeChange("view")}
            onSubmit={controller.handleSubmit}
            onValueChange={controller.handleFieldChange}
          />
        ) : null}

        {mode === "view" && task ? (
          <TaskDrawerViewMode
            activeViewTab={controller.activeViewTab}
            assigneeLabel={controller.assigneeLabel}
            confirmDelete={controller.confirmDelete}
            createSubtaskPending={controller.createSubtaskPending}
            deleteSubtaskPending={controller.deleteSubtaskPending}
            isDeletePending={isDeletePending}
            isPending={controller.isPending}
            memberLookup={memberLookup}
            newSubtaskStatusId={controller.newSubtaskStatusId}
            newSubtaskTitle={controller.newSubtaskTitle}
            onConfirmDeleteChange={controller.setConfirmDelete}
            onCreateSubtask={() => {
              void controller.handleCreateSubtask();
            }}
            onDelete={() => {
              void controller.handleDelete();
            }}
            onDeleteSubtask={(subtaskId) => {
              void controller.handleDeleteSubtask(subtaskId);
            }}
            onEditTask={() => onModeChange("edit")}
            onLoadMoreActivity={() => {
              void controller.taskLogsQuery.fetchNextPage();
            }}
            onRetryActivity={() => {
              void controller.taskLogsQuery.refetch();
            }}
            onRootStatusChange={(statusId) => {
              void controller.handleRootStatusChange(statusId);
            }}
            onSubtaskStatusChange={(subtaskId, statusId) => {
              void controller.handleSubtaskStatusChange(subtaskId, statusId);
            }}
            onSubtaskStatusIdChange={controller.setNewSubtaskStatusId}
            onSubtaskTitleChange={controller.setNewSubtaskTitle}
            onTabChange={controller.setActiveViewTab}
            statuses={statuses}
            task={task}
            taskLogEntries={controller.taskLogEntries}
            taskLogsErrorMessage={
              controller.taskLogsQuery.isError
                ? "We couldn't load the activity log right now."
                : null
            }
            taskLogsFetchingMore={controller.taskLogsQuery.isFetchingNextPage}
            taskLogsHasMore={controller.taskLogsQuery.hasNextPage}
            taskLogsLoading={controller.taskLogsQuery.isPending}
            updateSubtaskStatusPending={controller.updateSubtaskStatusPending}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
