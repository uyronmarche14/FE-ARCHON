"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, MessageSquare, PencilLine, RefreshCw, Trash2 } from "lucide-react";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTaskComment } from "@/features/tasks/hooks/use-create-task-comment";
import { useDeleteTaskComment } from "@/features/tasks/hooks/use-delete-task-comment";
import { useTaskComments } from "@/features/tasks/hooks/use-task-comments";
import { useUpdateTaskComment } from "@/features/tasks/hooks/use-update-task-comment";
import { taskCommentsQueryKey } from "@/features/tasks/lib/task-query-keys";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";

type TaskCommentsPanelProps = {
  enabled: boolean;
  taskId: string;
};

export function TaskCommentsPanel({
  enabled,
  taskId,
}: TaskCommentsPanelProps) {
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const commentsQuery = useTaskComments(taskId, enabled);
  const createCommentMutation = useCreateTaskComment(taskId);
  const updateCommentMutation = useUpdateTaskComment(taskId);
  const deleteCommentMutation = useDeleteTaskComment(taskId);
  const [draft, setDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");

  const comments = commentsQuery.data?.items ?? [];

  async function refreshComments() {
    await queryClient.invalidateQueries({
      queryKey: taskCommentsQueryKey(taskId),
    });
  }

  async function handleCreateComment() {
    const body = draft.trim();

    if (!body) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync({ body });
      setDraft("");
      await refreshComments();
      showSuccessToast("Comment added", "The conversation was updated.");
    } catch (error) {
      showApiErrorToast(error, "Unable to add the comment right now.");
    }
  }

  async function handleSaveComment(commentId: string) {
    const body = editingBody.trim();

    if (!body) {
      return;
    }

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        request: {
          body,
        },
      });
      setEditingCommentId(null);
      setEditingBody("");
      await refreshComments();
      showSuccessToast("Comment updated", "The latest note was saved.");
    } catch (error) {
      showApiErrorToast(error, "Unable to update the comment right now.");
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      await refreshComments();
      showSuccessToast("Comment deleted", "The comment was removed.");
    } catch (error) {
      showApiErrorToast(error, "Unable to delete the comment right now.");
    }
  }

  return (
    <section className="grid gap-3.5">
      <div className="rounded-[1rem] bg-card/78 px-4 py-4 ring-1 ring-border/45 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Team comments
            </p>
            <p className="text-sm leading-5 text-muted-foreground">
              Keep discussion attached to the task instead of losing it in chat.
            </p>
          </div>
          {comments.length > 0 ? (
            <Badge variant="muted" size="xs">
              {comments.length} comments
            </Badge>
          ) : null}
        </div>

        <div className="mt-3.5 grid gap-2">
          <Textarea
            value={draft}
            placeholder="Add context, decisions, or feedback for the team."
            onChange={(event) => setDraft(event.target.value)}
            disabled={createCommentMutation.isPending}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                void handleCreateComment();
              }}
              disabled={createCommentMutation.isPending || draft.trim().length === 0}
            >
              {createCommentMutation.isPending ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Adding
                </>
              ) : (
                "Add comment"
              )}
            </Button>
          </div>
        </div>
      </div>

      {commentsQuery.isPending ? (
        <div className="rounded-[1rem] border border-border/70 bg-surface-subtle/35 px-4 py-5 text-sm text-muted-foreground">
          Loading comments…
        </div>
      ) : null}

      {commentsQuery.isError ? (
        <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-4 py-5">
          <p className="text-sm font-semibold text-destructive">
            We couldn&apos;t load comments right now.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              void commentsQuery.refetch();
            }}
          >
            <RefreshCw className="size-3.5" />
            Retry loading comments
          </Button>
        </div>
      ) : null}

      {!commentsQuery.isPending && !commentsQuery.isError && comments.length === 0 ? (
        <div className="rounded-[1rem] border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-5 text-center">
          <MessageSquare className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            No comments yet.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Start the conversation here so updates stay close to the work.
          </p>
        </div>
      ) : null}

      {!commentsQuery.isPending && !commentsQuery.isError && comments.length > 0 ? (
        <ol className="grid gap-2.5">
          {comments.map((comment) => {
            const canManageComment =
              session?.user.role === "ADMIN" ||
              session?.user.id === comment.author.id;
            const isEditing = editingCommentId === comment.id;

            return (
              <li
                key={comment.id}
                className="rounded-[1rem] bg-card/78 px-4 py-4 ring-1 ring-border/45 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {comment.author.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {canManageComment ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingBody(comment.body);
                        }}
                      >
                        <PencilLine className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          void handleDeleteComment(comment.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="mt-3 grid gap-2">
                    <Textarea
                      value={editingBody}
                      onChange={(event) => setEditingBody(event.target.value)}
                      disabled={updateCommentMutation.isPending}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingBody("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          void handleSaveComment(comment.id);
                        }}
                        disabled={updateCommentMutation.isPending}
                      >
                        {updateCommentMutation.isPending ? "Saving" : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {comment.body}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
