"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LoaderCircle, Link2, RefreshCw, Trash2 } from "lucide-react";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTaskAttachment } from "@/features/tasks/hooks/use-create-task-attachment";
import { useDeleteTaskAttachment } from "@/features/tasks/hooks/use-delete-task-attachment";
import { useTaskAttachments } from "@/features/tasks/hooks/use-task-attachments";
import { taskAttachmentsQueryKey } from "@/features/tasks/lib/task-query-keys";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";

type TaskAttachmentsPanelProps = {
  enabled: boolean;
  taskId: string;
};

export function TaskAttachmentsPanel({
  enabled,
  taskId,
}: TaskAttachmentsPanelProps) {
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const attachmentsQuery = useTaskAttachments(taskId, enabled);
  const createAttachmentMutation = useCreateTaskAttachment(taskId);
  const deleteAttachmentMutation = useDeleteTaskAttachment(taskId);
  const [label, setLabel] = useState("");
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");

  const attachments = attachmentsQuery.data?.items ?? [];

  async function refreshAttachments() {
    await queryClient.invalidateQueries({
      queryKey: taskAttachmentsQueryKey(taskId),
    });
  }

  async function handleCreateAttachment() {
    if (!label.trim() || !fileName.trim() || !url.trim()) {
      return;
    }

    try {
      await createAttachmentMutation.mutateAsync({
        label: label.trim(),
        fileName: fileName.trim(),
        url: url.trim(),
      });
      setLabel("");
      setFileName("");
      setUrl("");
      await refreshAttachments();
      showSuccessToast("Attachment added", "The resource is now linked to this task.");
    } catch (error) {
      showApiErrorToast(error, "Unable to add the attachment right now.");
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    try {
      await deleteAttachmentMutation.mutateAsync(attachmentId);
      await refreshAttachments();
      showSuccessToast("Attachment removed", "The resource link was removed.");
    } catch (error) {
      showApiErrorToast(error, "Unable to delete the attachment right now.");
    }
  }

  return (
    <section className="grid gap-3.5">
      <div className="rounded-[1rem] bg-card/78 px-4 py-4 ring-1 ring-border/45 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              URL-backed resources
            </p>
            <p className="text-sm leading-5 text-muted-foreground">
              Attach briefs, specs, and source links without leaving the drawer.
            </p>
          </div>
          {attachments.length > 0 ? (
            <Badge variant="muted" size="xs">
              {attachments.length} links
            </Badge>
          ) : null}
        </div>

        <div className="mt-3.5 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="attachment-label">Label</Label>
            <Input
              id="attachment-label"
              value={label}
              placeholder="Launch brief"
              onChange={(event) => setLabel(event.target.value)}
              disabled={createAttachmentMutation.isPending}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="attachment-filename">File name</Label>
            <Input
              id="attachment-filename"
              value={fileName}
              placeholder="launch-brief.pdf"
              onChange={(event) => setFileName(event.target.value)}
              disabled={createAttachmentMutation.isPending}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="attachment-url">URL</Label>
            <Input
              id="attachment-url"
              value={url}
              placeholder="https://example.com/files/launch-brief.pdf"
              onChange={(event) => setUrl(event.target.value)}
              disabled={createAttachmentMutation.isPending}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                void handleCreateAttachment();
              }}
              disabled={
                createAttachmentMutation.isPending ||
                label.trim().length === 0 ||
                fileName.trim().length === 0 ||
                url.trim().length === 0
              }
            >
              {createAttachmentMutation.isPending ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Adding
                </>
              ) : (
                "Add attachment"
              )}
            </Button>
          </div>
        </div>
      </div>

      {attachmentsQuery.isPending ? (
        <div className="rounded-[1rem] border border-border/70 bg-surface-subtle/35 px-4 py-5 text-sm text-muted-foreground">
          Loading attachments…
        </div>
      ) : null}

      {attachmentsQuery.isError ? (
        <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-4 py-5">
          <p className="text-sm font-semibold text-destructive">
            We couldn&apos;t load attachments right now.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              void attachmentsQuery.refetch();
            }}
          >
            <RefreshCw className="size-3.5" />
            Retry loading attachments
          </Button>
        </div>
      ) : null}

      {!attachmentsQuery.isPending &&
      !attachmentsQuery.isError &&
      attachments.length === 0 ? (
        <div className="rounded-[1rem] border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-5 text-center">
          <Link2 className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            No attachments yet.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Add URL-backed files or references to keep project materials close to the task.
          </p>
        </div>
      ) : null}

      {!attachmentsQuery.isPending &&
      !attachmentsQuery.isError &&
      attachments.length > 0 ? (
        <ol className="grid gap-2.5">
          {attachments.map((attachment) => {
            const canDeleteAttachment =
              session?.user.role === "ADMIN" ||
              session?.user.id === attachment.createdBy.id;

            return (
              <li
                key={attachment.id}
                className="rounded-[1rem] bg-card/78 px-4 py-4 ring-1 ring-border/45 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {attachment.label ?? attachment.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added by {attachment.createdBy.name} on{" "}
                      {new Date(attachment.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {attachment.fileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" asChild>
                      <a href={attachment.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                    {canDeleteAttachment ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          void handleDeleteAttachment(attachment.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
