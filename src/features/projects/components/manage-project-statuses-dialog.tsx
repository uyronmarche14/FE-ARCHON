"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Layers3, LoaderCircle, Save, Trash2 } from "lucide-react";
import type {
  ProjectStatusColor,
  ProjectStatusSummary,
} from "@/contracts/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useDeleteProjectStatus } from "@/features/projects/hooks/use-delete-project-status";
import { useReorderProjectStatuses } from "@/features/projects/hooks/use-reorder-project-statuses";
import { useUpdateProjectStatus } from "@/features/projects/hooks/use-update-project-status";
import { projectDetailQueryKey, projectsQueryKey } from "@/features/projects/lib/project-query-keys";
import {
  getTaskStatusBadgeClassName,
  getTaskStatusSurfaceClassName,
} from "@/features/tasks/lib/task-board";
import { projectTasksQueryKey } from "@/features/tasks/lib/task-query-keys";
import { cn } from "@/lib/utils";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";

type ManageProjectStatusesDialogProps = {
  projectId: string;
  statuses: ProjectStatusSummary[];
};

type StatusDraft = {
  id: string;
  name: string;
  color: ProjectStatusColor;
  isClosed: boolean;
  moveToStatusId: string;
};

const STATUS_COLOR_OPTIONS: Array<{
  label: string;
  value: ProjectStatusColor;
}> = [
  { label: "Slate", value: "SLATE" },
  { label: "Blue", value: "BLUE" },
  { label: "Amber", value: "AMBER" },
  { label: "Green", value: "GREEN" },
  { label: "Red", value: "RED" },
  { label: "Purple", value: "PURPLE" },
];

export function ManageProjectStatusesDialog({
  projectId,
  statuses,
}: ManageProjectStatusesDialogProps) {
  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateProjectStatus(projectId);
  const reorderStatusesMutation = useReorderProjectStatuses(projectId);
  const deleteStatusMutation = useDeleteProjectStatus(projectId);
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<StatusDraft[]>([]);

  const isPending =
    updateStatusMutation.isPending ||
    reorderStatusesMutation.isPending ||
    deleteStatusMutation.isPending;

  const orderedDrafts = useMemo(
    () => [...drafts].sort((left, right) => {
      const leftStatus = statuses.find((status) => status.id === left.id);
      const rightStatus = statuses.find((status) => status.id === right.id);

      return (leftStatus?.position ?? 0) - (rightStatus?.position ?? 0);
    }),
    [drafts, statuses],
  );

  async function refreshProjectStatusData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: projectTasksQueryKey(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: projectsQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: projectDetailQueryKey(projectId),
      }),
    ]);
  }

  async function handleSaveDraft(draft: StatusDraft) {
    try {
      await updateStatusMutation.mutateAsync({
        statusId: draft.id,
        request: {
          name: draft.name.trim(),
          color: draft.color,
          isClosed: draft.isClosed,
        },
      });
      await refreshProjectStatusData();
      showSuccessToast("Status updated", `${draft.name} was updated.`);
    } catch (error) {
      showApiErrorToast(error, "Unable to update the status right now.");
    }
  }

  async function handleMoveStatus(statusId: string, direction: -1 | 1) {
    const currentIndex = drafts.findIndex((draft) => draft.id === statusId);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= drafts.length) {
      return;
    }

    const nextDrafts = [...drafts];
    const [movedDraft] = nextDrafts.splice(currentIndex, 1);
    nextDrafts.splice(nextIndex, 0, movedDraft);
    setDrafts(nextDrafts);

    try {
      await reorderStatusesMutation.mutateAsync({
        statuses: nextDrafts.map((draft) => ({
          id: draft.id,
        })),
      });
      await refreshProjectStatusData();
      showSuccessToast("Workflow updated", "The status order was updated.");
    } catch (error) {
      setDrafts(drafts);
      showApiErrorToast(error, "Unable to reorder statuses right now.");
    }
  }

  async function handleDeleteStatus(draft: StatusDraft) {
    try {
      await deleteStatusMutation.mutateAsync({
        statusId: draft.id,
        request: {
          moveToStatusId: draft.moveToStatusId,
        },
      });
      await refreshProjectStatusData();
      showSuccessToast("Status deleted", `${draft.name} was removed from the workflow.`);
    } catch (error) {
      showApiErrorToast(error, "Unable to delete the status right now.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isPending) {
          return;
        }

        if (nextOpen) {
          setDrafts(
            statuses.map((status) => ({
              id: status.id,
              name: status.name,
              color: status.color,
              isClosed: status.isClosed,
              moveToStatusId:
                statuses.find((candidate) => candidate.id !== status.id)?.id ??
                "",
            })),
          );
        }

        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="rounded-xl">
          <Layers3 className="size-4" />
          Manage statuses
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl border-border/80 bg-card/98 shadow-[0_28px_68px_-36px_rgba(15,23,42,0.5)]">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" size="xs">
              Workflow
            </Badge>
            <Badge variant="muted" size="xs">
              Rename, recolor, reorder, delete
            </Badge>
          </div>
          <DialogTitle>Manage project statuses</DialogTitle>
          <DialogDescription>
            Tune the workflow without rebuilding the board. Deleting a status requires moving its tasks into another status first.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-1">
          {orderedDrafts.map((draft, index) => (
            <section
              key={draft.id}
              className={cn(
                "grid gap-3 rounded-[1rem] px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_32px_-28px_rgba(15,23,42,0.38)]",
                getTaskStatusSurfaceClassName(draft),
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  size="xs"
                  className={getTaskStatusBadgeClassName(draft)}
                >
                  {draft.name.trim() || "Untitled status"}
                </Badge>
                <Badge variant="muted" size="xs">
                  {draft.isClosed ? "Completed stage" : "Open stage"}
                </Badge>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_11rem_11rem_auto] lg:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor={`status-name-${draft.id}`}>Name</Label>
                  <Input
                    id={`status-name-${draft.id}`}
                    value={draft.name}
                    disabled={isPending}
                    onChange={(event) =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.map((currentDraft) =>
                          currentDraft.id === draft.id
                            ? {
                                ...currentDraft,
                                name: event.target.value,
                              }
                            : currentDraft,
                        ),
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`status-color-${draft.id}`}>Color</Label>
                  <Select
                    id={`status-color-${draft.id}`}
                    value={draft.color}
                    disabled={isPending}
                    onChange={(event) =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.map((currentDraft) =>
                          currentDraft.id === draft.id
                            ? {
                                ...currentDraft,
                                color: event.target.value as ProjectStatusColor,
                              }
                            : currentDraft,
                        ),
                      )
                    }
                  >
                    {STATUS_COLOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`status-type-${draft.id}`}>Meaning</Label>
                  <Select
                    id={`status-type-${draft.id}`}
                    value={draft.isClosed ? "CLOSED" : "OPEN"}
                    disabled={isPending}
                    onChange={(event) =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.map((currentDraft) =>
                          currentDraft.id === draft.id
                            ? {
                                ...currentDraft,
                                isClosed: event.target.value === "CLOSED",
                              }
                            : currentDraft,
                        ),
                      )
                    }
                  >
                    <option value="OPEN">Open stage</option>
                    <option value="CLOSED">Completed stage</option>
                  </Select>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl"
                    onClick={() => {
                      void handleMoveStatus(draft.id, -1);
                    }}
                    disabled={isPending || index === 0}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl"
                    onClick={() => {
                      void handleMoveStatus(draft.id, 1);
                    }}
                    disabled={isPending || index === orderedDrafts.length - 1}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      void handleSaveDraft(draft);
                    }}
                    disabled={isPending || draft.name.trim().length === 0}
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <LoaderCircle className="size-3.5 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="size-3.5" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 rounded-[0.95rem] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--background)_92%,white),color-mix(in_oklab,var(--surface-subtle)_96%,white))] px-3 py-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto] lg:items-end">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Delete status</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Move existing tasks to another status before removing this lane.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`move-to-${draft.id}`}>Move tasks to</Label>
                  <Select
                    id={`move-to-${draft.id}`}
                    value={draft.moveToStatusId}
                    disabled={isPending || orderedDrafts.length <= 1}
                    onChange={(event) =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.map((currentDraft) =>
                          currentDraft.id === draft.id
                            ? {
                                ...currentDraft,
                                moveToStatusId: event.target.value,
                              }
                            : currentDraft,
                        ),
                      )
                    }
                  >
                    {orderedDrafts
                      .filter((candidate) => candidate.id !== draft.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name}
                        </option>
                      ))}
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      void handleDeleteStatus(draft);
                    }}
                    disabled={
                      isPending ||
                      orderedDrafts.length <= 1 ||
                      draft.moveToStatusId.length === 0
                    }
                  >
                    {deleteStatusMutation.isPending ? (
                      <>
                        <LoaderCircle className="size-3.5 animate-spin" />
                        Deleting
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-3.5" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
